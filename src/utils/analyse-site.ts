/**
 * Audit technique d'une page d'accueil publique.
 *
 * Ce module alimente le diagnostic en libre-service. Comme l'adresse est
 * fournie par un visiteur anonyme, il faut considérer chaque entrée comme
 * hostile : sans garde-fou, un endpoint qui va chercher une URL arbitraire
 * permet d'atteindre le réseau interne de l'hébergeur (SSRF). Toutes les
 * protections sont donc appliquées avant la moindre requête sortante.
 *
 * L'audit couvre huit familles, chacune notée sur 100 : vitesse, mobile,
 * sécurité, référencement, contenu, conversion, lisibilité, confiance.
 *
 * Deux règles de rédaction, sans exception :
 *   1. Uniquement des faits mesurés, suivis de leur conséquence concrète.
 *      Jamais de jugement esthétique, jamais de supposition.
 *   2. Un contrôle qui n'a pas pu être mené ne produit aucun constat.
 *      Une requête annexe qui expire ne doit jamais devenir une accusation
 *      (« vous n'avez pas de sitemap » alors qu'il n'a pas été lu).
 */

import { lookup } from 'node:dns/promises';
import { connect as tlsConnect } from 'node:tls';
import {
  FAMILLES,
  noter,
  trierConstats,
  type Constat,
  type Famille,
  type FamilleNotee,
  type Gravite,
  type PageParcourue,
} from './diagnostic-notation.ts';

/* Le barème et le bilan d'ensemble vivent dans un module sans dépendance
   système, pour que le navigateur puisse recalculer la note au fil du
   parcours du site. Ils sont réexportés ici : les consommateurs historiques
   n'ont pas à savoir que le fichier a été coupé en deux. */
export type { Constat, Famille, FamilleNotee, Gravite, PageParcourue };
export { noter, trierConstats, constatsDuSite } from './diagnostic-notation.ts';

export interface Mesures {
  duree: number;
  poids: number;
  mots: number;
  images: number;
  imagesSansAlt: number;
  scripts: number;
  domainesTiers: number;
  pages: number;
  balises: number;
  controles: number;
  /** Pages internes réellement ouvertes en plus de l'accueil. */
  pagesLues?: number;
}

export type Analyse =
  | {
      etat: 'ok';
      hote: string;
      url: string;
      note: number;
      verdict: string;
      familles: FamilleNotee[];
      mesures: Mesures;
      constats: Constat[];
      /**
       * Adresses du reste du site, restées à parcourir. Elles ne sont pas lues
       * ici : la première réponse doit arriver tout de suite. Le navigateur les
       * redemande ensuite par petits paquets, ce qui permet de couvrir le site
       * entier sans qu'aucune requête ne dépasse le délai d'une fonction serveur.
       */
      aExplorer?: string[];
      /**
       * Relevé des pages déjà ouvertes ici. Il rejoint celui du parcours pour
       * le bilan d'ensemble : sur un site de cinq pages, tout est lu dès la
       * première réponse, et des titres en double s'y verraient tout autant.
       */
      relevees?: PageParcourue[];
    }
  | { etat: 'constat-unique'; hote: string; url: string; constats: [Constat] }
  | { etat: 'injoignable'; hote: string; url: string; raison: string }
  | { etat: 'refuse'; raison: string };

/* Budget de temps global. La fonction serverless qui appelle ce module doit
   rendre la main bien avant la limite de l'hébergeur : la page principale est
   plafonnée, les sondes annexes se partagent ce qui reste et abandonnent
   silencieusement si l'enveloppe est épuisée. */
const BUDGET_MS = 9000;
const DELAI_PAGE_MS = 7000;
const DELAI_SONDE_MS = 3000;
/* Plafond de lecture. Les pages produites par un éditeur en ligne (Wix,
   Squarespace) dépassent couramment deux mégaoctets de code : s'arrêter avant
   la fin coupait le pied de page, et tout ce qui s'y trouve (mentions légales,
   horaires, téléphone) était alors déclaré absent à tort. Le plafond laisse
   passer ces pages, et une lecture malgré tout incomplète est signalée pour
   que plus aucun constat d'absence n'en soit tiré. */
const POIDS_MAX = 6 * 1024 * 1024;
const POIDS_SONDE_MAX = 512 * 1024;
/* Seuils d'alerte sur la date d'expiration du certificat de sécurité. */
const CERT_EXPIRE_CRITIQUE_JOURS = 7;
const CERT_EXPIRE_PROCHE_JOURS = 21;
const REDIRECTIONS_MAX = 4;
/* Pages internes ouvertes en plus de l'accueil, dans la première réponse.
   Elles servent à vérifier ce qui semblait absent, jamais à chercher de
   nouveaux défauts. */
const PAGES_SECONDAIRES_MAX = 6;
/* Plafond du parcours complet, mené ensuite par petits paquets. Au-delà,
   l'attente cesse d'être supportable et le serveur du site examiné n'a pas à
   subir davantage : ce qui est laissé de côté est annoncé au visiteur. */
const PAGES_SITE_MAX = 60;
/* Pages lues par appel du second temps. Chaque appel doit rester loin devant
   le délai maximal d'une fonction serveur. */
export const PAGES_PAR_PAQUET = 8;
const UA = 'Mozilla/5.0 (compatible; CaelestisDiagnostic/1.0; +https://caelestis.fr)';

const SEUILS = {
  chargementLent: 2500,
  chargementCritique: 4000,
  poidsLourd: 250 * 1024,
  poidsCritique: 700 * 1024,
  scriptsNombreux: 8,
  tiersNombreux: 8,
  balisesNombreuses: 1500,
  policesNombreuses: 4,
  fichiersPoliceNombreux: 10,
  motsPauvre: 300,
  motsCritique: 150,
  titreMin: 30,
  titreMax: 65,
  descriptionMin: 70,
  descriptionMax: 160,
  champsNombreux: 7,
  stylesEnLigne: 60,
  liensVagues: 3,
};

/* ══════════════════════════════════════════════════════════
   PARCOURS DU RESTE DU SITE

   Second temps de l'analyse. Le navigateur redemande les pages par petits
   paquets : chaque appel reste bien en deçà du délai d'une fonction serveur,
   et le visiteur voit avancer la lecture au lieu d'attendre devant un écran
   figé. Ce qui remonte ici ne se voit pas page par page : deux pages qui
   portent le même titre ne sont un défaut que l'une par rapport à l'autre.
══════════════════════════════════════════════════════════ */

export type ParcoursPages =
  | { etat: 'ok'; pages: PageParcourue[] }
  | { etat: 'refuse'; raison: string };

/**
 * Lit une page du site en suivant ses redirections.
 *
 * Les sondes ordinaires ne les suivent pas, parce qu'une redirection y est
 * justement l'information cherchée. Ici c'est l'inverse : un plan de site
 * déclare couramment des adresses sans barre finale, ou en version non
 * sécurisée, qui renvoient toutes vers la bonne page. Ne pas les suivre
 * revenait à ne rien lire du tout, et un site entier remontait vide.
 *
 * La destination doit rester dans le même domaine, sans quoi un plan de site
 * malveillant pourrait diriger l'outil ailleurs.
 */
async function lirePageDuSite(
  depart: URL,
  finAu: number,
  domaineBase: string,
): Promise<{ statut: number; corps: string } | null> {
  let url = depart;
  for (let saut = 0; saut <= 3; saut += 1) {
    const sonde = await sonder(url, finAu);
    if (!sonde) return null;
    if (sonde.statut < 300 || sonde.statut >= 400 || !sonde.destination) {
      return { statut: sonde.statut, corps: sonde.corps };
    }
    try {
      const suivante = new URL(sonde.destination, url);
      if (!memeMaison(suivante.hostname, domaineBase)) return { statut: sonde.statut, corps: '' };
      if (suivante.href === url.href) return { statut: sonde.statut, corps: '' };
      url = suivante;
    } catch {
      return { statut: sonde.statut, corps: '' };
    }
  }
  return null;
}

/**
 * Relevé d'une page, réduit à ce que le bilan d'ensemble exploite. Le contenu
 * lui-même n'est pas conservé : rien de ce qui a été lu ne quitte le serveur.
 */
function releverPage(chemin: string, statut: number, html: string): PageParcourue {
  const titreBrut = extraire(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
  const balDesc = (html.match(/<meta\b[^>]*>/gi) ?? []).find((b) =>
    /^description$/i.test((attribut(b, 'name') ?? '').trim()),
  );
  return {
    chemin,
    statut,
    titre: titreBrut === null ? null : decoderEntites(titreBrut).replace(/\s+/g, ' ').trim(),
    description: balDesc ? attribut(balDesc, 'content') : null,
    h1: compter(/<h1[\s>]/gi, html),
    mots: html ? texteVisible(html).split(' ').filter(Boolean).length : 0,
  };
}

/**
 * Lit un paquet de pages d'un même site et n'en retient que ce qui sert au
 * bilan d'ensemble. Le contenu n'est pas conservé : seul le relevé revient.
 *
 * Les adresses viennent du navigateur : elles sont donc traitées comme
 * hostiles. Chacune doit appartenir au domaine déjà analysé, faute de quoi
 * l'outil deviendrait un relais capable de frapper n'importe quel serveur.
 */
export async function parcourirPages(
  saisieBase: string,
  chemins: string[],
): Promise<ParcoursPages> {
  const base = normaliserUrl(saisieBase);
  if (!base) return { etat: 'refuse', raison: "Adresse de départ inexploitable." };
  if ((await resoudre(base.hostname)) !== 'public') {
    return { etat: 'refuse', raison: 'Cette adresse ne correspond pas à un site accessible publiquement.' };
  }
  const domaineBase = racine(base.hostname);
  const finAu = Date.now() + BUDGET_MS;

  const retenus: URL[] = [];
  const plans: URL[] = [];
  for (const brut of chemins.slice(0, PAGES_PAR_PAQUET)) {
    const estPlan = brut.startsWith('plan:');
    const chemin = estPlan ? brut.slice(5) : brut;
    let cible: URL;
    try {
      cible = new URL(chemin, base);
    } catch {
      continue;
    }
    /* Le domaine ne peut pas changer en route : l'outil n'ouvre que le site
       qu'il analyse déjà. */
    if (!memeMaison(cible.hostname, domaineBase)) continue;
    if (cible.protocol !== 'http:' && cible.protocol !== 'https:') continue;
    (estPlan ? plans : retenus).push(cible);
  }

  const pages = await Promise.all([
    ...retenus.map(async (url): Promise<PageParcourue | null> => {
      const lue = await lirePageDuSite(url, finAu, domaineBase);
      if (!lue) return null;
      return releverPage(url.pathname.replace(/\/+$/, '') || '/', lue.statut, lue.corps);
    }),
    ...plans.map(async (url): Promise<PageParcourue | null> => {
      const sonde = await lirePageDuSite(url, finAu, domaineBase);
      if (!sonde || sonde.statut !== 200) return null;
      const { pages: trouvees } = adressesDuPlan(sonde.corps);
      const decouvertes: string[] = [];
      for (const u of trouvees) {
        try {
          const cible = new URL(u);
          if (memeMaison(cible.hostname, domaineBase)) decouvertes.push(cible.pathname.replace(/\/+$/, '') || '/');
        } catch { /* adresse illisible : ignorée */ }
      }
      return {
        chemin: url.pathname, statut: sonde.statut, titre: null, description: null,
        h1: 0, mots: 0, decouvertes: decouvertes.slice(0, PAGES_SITE_MAX),
      };
    }),
  ]);

  return { etat: 'ok', pages: pages.filter((p): p is PageParcourue => p !== null) };
}

/* ══════════════════════════════════════════════════════════
   GARDE-FOUS D'ENTRÉE
══════════════════════════════════════════════════════════ */

/** Plages IPv4 qui ne doivent jamais être atteintes depuis un endpoint public. */
function ipv4Privee(ip: string): boolean {
  const o = ip.split('.').map(Number);
  if (o.length !== 4 || o.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = o;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||            // link-local
    (a === 172 && b >= 16 && b <= 31) ||   // privé
    (a === 192 && b === 168) ||            // privé
    (a === 100 && b >= 64 && b <= 127) ||  // CGNAT
    (a === 192 && b === 0) ||              // usage spécial
    (a === 198 && (b === 18 || b === 19)) || // bancs de test
    a >= 224                                // multicast et réservé
  );
}

function ipv6Privee(ip: string): boolean {
  const bas = ip.toLowerCase();
  if (bas === '::1' || bas === '::') return true;
  if (bas.startsWith('fc') || bas.startsWith('fd')) return true; // unique local
  if (bas.startsWith('fe80')) return true;                        // link-local
  // Adresse IPv4 encapsulée dans de l'IPv6 : on la teste comme de l'IPv4.
  const mappee = bas.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappee) return ipv4Privee(mappee[1]);
  return false;
}

/**
 * Résout le nom et refuse tout hôte qui pointe vers une adresse non publique.
 * Distingue les deux causes de refus : un nom qui ne mène nulle part n'est pas
 * la même chose qu'un nom qui mène au réseau interne. Le dire de la même façon
 * laissait croire au visiteur que l'outil refusait d'examiner son site, alors
 * que son domaine ne pointait plus vers aucun serveur.
 */
type Resolution = 'public' | 'introuvable' | 'non-public' | 'indeterminee';

async function resoudre(hostname: string): Promise<Resolution> {
  // Une adresse IP saisie directement se teste sans résolution.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return ipv4Privee(hostname) ? 'non-public' : 'public';
  if (hostname.includes(':')) return ipv6Privee(hostname) ? 'non-public' : 'public';
  if (/^(localhost|.*\.local|.*\.internal|.*\.localhost)$/i.test(hostname)) return 'non-public';

  try {
    const adresses = await lookup(hostname, { all: true });
    if (adresses.length === 0) return 'introuvable';
    const publiques = adresses.every((a) =>
      a.family === 6 ? !ipv6Privee(a.address) : !ipv4Privee(a.address),
    );
    return publiques ? 'public' : 'non-public';
  } catch (erreur: any) {
    const code = erreur?.code;
    if (code === 'ENOTFOUND' || code === 'ENODATA') return 'introuvable';
    /* EAI_AGAIN et consorts : c'est la résolution qui a échoué, pas le domaine
       qui manque. La requête est refusée par prudence, mais rien ne permet
       d'affirmer quoi que ce soit sur le site. */
    return 'indeterminee';
  }
}

async function hotePublic(hostname: string): Promise<boolean> {
  return (await resoudre(hostname)) === 'public';
}

/** Normalise la saisie d'un visiteur en URL exploitable, ou rejette. */
export function normaliserUrl(saisie: string): URL | null {
  const propre = saisie.trim();
  if (!propre || propre.length > 300) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(propre) ? propre : `https://${propre}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url;
  } catch {
    return null;
  }
}

/* ══════════════════════════════════════════════════════════
   RÉCUPÉRATION
══════════════════════════════════════════════════════════ */

interface Reponse {
  ok: boolean;
  statut?: number;
  urlFinale?: string;
  corps?: string;
  /** Vrai si le plafond de lecture a été atteint : la fin de page manque. */
  tronque?: boolean;
  entetes?: Headers;
  duree: number;
  code?: string;
}

interface Sonde {
  statut: number;
  destination: string;
  corps: string;
}

const CODES_CERTIFICAT: Record<string, string> = {
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: 'sa chaîne de certification est incomplète',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'sa signature ne peut pas être vérifiée',
  CERT_HAS_EXPIRED: "il a expiré et n'a pas été renouvelé",
  ERR_TLS_CERT_ALTNAME_INVALID: 'il a été émis pour une autre adresse que celle-ci',
  DEPTH_ZERO_SELF_SIGNED_CERT: 'il a été signé par le serveur lui-même, sans autorité reconnue',
  SELF_SIGNED_CERT_IN_CHAIN: 'il repose sur un certificat auto-signé',
};

/**
 * Lecture plafonnée : un fichier volumineux ne doit pas saturer la fonction.
 * Le second membre du couple indique si le plafond a coupé la lecture : dans ce
 * cas la fin du document manque, et rien ne doit être déclaré absent.
 *
 * L'encodage est celui annoncé par le serveur. Un vieux site en ISO-8859-1 lu
 * comme de l'UTF-8 rend tous ses accents illisibles, ce qui suffit à faire
 * échouer la recherche de « mentions légales » ou d'un horaire.
 */
async function lireCorps(
  reponse: Response,
  plafond: number,
): Promise<{ corps: string; tronque: boolean }> {
  const flux = reponse.body?.getReader();
  if (!flux) return { corps: '', tronque: false };

  const morceaux: Uint8Array[] = [];
  let total = 0;
  let tronque = false;
  try {
    while (true) {
      const { done, value } = await flux.read();
      if (done) break;
      morceaux.push(value);
      total += value.byteLength;
      if (total >= plafond) { tronque = true; break; }
    }
  } catch {
    /* Lecture interrompue en cours de route, le plus souvent par le délai
       imparti. Ce qui a été reçu reste exploitable : le perdre transformerait
       une page lente en page injoignable, ce qui serait faux. */
    tronque = true;
  }
  await flux.cancel().catch(() => {});

  const octets = new Uint8Array(total);
  let position = 0;
  for (const m of morceaux) { octets.set(m, position); position += m.byteLength; }

  const decoder = (jeu: string) => {
    try {
      return new TextDecoder(jeu, { fatal: false }).decode(octets);
    } catch {
      return null;
    }
  };

  const annonce = (reponse.headers.get('content-type') ?? '').match(
    /charset\s*=\s*["']?([\w-]+)/i,
  )?.[1];
  let corps = (annonce && decoder(annonce)) || decoder('utf-8') || '';
  if (!annonce) {
    /* Aucun encodage annoncé : la page peut le déclarer elle-même. Le nom du
       jeu de caractères est en ASCII, donc lisible même mal décodé. */
    const interne = corps.match(
      /<meta[^>]+charset\s*=\s*["']?([\w-]+)|<meta[^>]+content=["'][^"']*charset\s*=\s*([\w-]+)/i,
    );
    const jeu = (interne?.[1] ?? interne?.[2] ?? '').toLowerCase();
    if (jeu && !/^utf-?8$/.test(jeu)) corps = decoder(jeu) ?? corps;
  }
  return { corps, tronque };
}

/**
 * Suit les redirections à la main : une redirection vers une adresse interne
 * contournerait sinon toute la vérification faite sur l'URL de départ.
 */
async function recuperer(depart: URL): Promise<Reponse> {
  const debut = Date.now();
  let url = depart;

  for (let saut = 0; saut <= REDIRECTIONS_MAX; saut += 1) {
    if (!(await hotePublic(url.hostname))) {
      return { ok: false, code: 'HOTE_NON_PUBLIC', duree: Date.now() - debut };
    }

    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), DELAI_PAGE_MS);
    try {
      const reponse = await fetch(url, {
        redirect: 'manual',
        signal: controleur.signal,
        headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
      });

      if (reponse.status >= 300 && reponse.status < 400) {
        const cible = reponse.headers.get('location');
        if (!cible) {
          return {
            ok: true, statut: reponse.status, urlFinale: url.href,
            corps: '', entetes: reponse.headers, duree: Date.now() - debut,
          };
        }
        url = new URL(cible, url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return { ok: false, code: 'REDIRECTION_INVALIDE', duree: Date.now() - debut };
        }
        continue;
      }

      const { corps, tronque } = await lireCorps(reponse, POIDS_MAX);
      /* Une lecture coupée avant le moindre octet n'est pas une page : c'est un
         échec, et il doit être traité comme tel plutôt que comme une page vide. */
      if (tronque && corps.length === 0 && reponse.status < 400) {
        return { ok: false, code: 'TIMEOUT', duree: Date.now() - debut };
      }
      return {
        ok: true, statut: reponse.status, urlFinale: url.href,
        corps, tronque, entetes: reponse.headers, duree: Date.now() - debut,
      };
    } catch (erreur: any) {
      const code = erreur?.name === 'AbortError' ? 'TIMEOUT' : (erreur?.cause?.code ?? erreur?.code ?? 'ERREUR');
      return { ok: false, code, duree: Date.now() - debut };
    } finally {
      clearTimeout(minuteur);
    }
  }

  return { ok: false, code: 'TROP_DE_REDIRECTIONS', duree: Date.now() - debut };
}

/**
 * Requête annexe, volontairement faillible : robots.txt, plan de site, page
 * d'erreur, variante d'adresse. Renvoie null dès que le budget est épuisé ou
 * que la requête échoue, afin qu'aucun contrôle ne soit tiré d'une absence
 * de réponse. Les redirections ne sont pas suivies : leur présence est en
 * elle-même l'information cherchée.
 */
async function sonder(url: URL, finAu: number, avecCorps = true): Promise<Sonde | null> {
  const reste = finAu - Date.now();
  if (reste < 500) return null;
  if (!(await hotePublic(url.hostname))) return null;

  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), Math.min(reste, DELAI_SONDE_MS));
  try {
    const reponse = await fetch(url, {
      redirect: 'manual',
      signal: controleur.signal,
      headers: { 'user-agent': UA, accept: '*/*' },
    });
    const corps = avecCorps ? (await lireCorps(reponse, POIDS_SONDE_MAX)).corps : '';
    if (!avecCorps) await reponse.body?.cancel().catch(() => {});
    return { statut: reponse.status, destination: reponse.headers.get('location') ?? '', corps };
  } catch {
    return null;
  } finally {
    clearTimeout(minuteur);
  }
}

/**
 * Lit la date d'expiration du certificat de sécurité et renvoie le nombre de
 * jours qui restent avant son échéance. Le fetch ordinaire n'expose pas cette
 * information : on ouvre une connexion sécurisée dédiée le temps de lire le
 * certificat présenté, puis on la referme aussitôt.
 *
 * Faillible et silencieuse : toute erreur, tout dépassement de budget renvoie
 * null, et aucun constat n'en est alors tiré. `rejectUnauthorized: false` :
 * un certificat déjà invalide est repéré en amont par l'échec du fetch ; ici on
 * veut seulement lire une date, sans que la lecture échoue pour autant.
 */
async function sonderCertificat(hostname: string, finAu: number): Promise<number | null> {
  const reste = finAu - Date.now();
  if (reste < 500) return null;
  if (!(await hotePublic(hostname))) return null;

  return new Promise((resolve) => {
    let fini = false;
    const rendre = (valeur: number | null) => {
      if (fini) return;
      fini = true;
      resolve(valeur);
      /* La fermeture attend le tour de boucle suivant. Détruire un socket
         sécurisé depuis son propre gestionnaire fait échouer une assertion
         interne de Node sous Windows, et cette assertion emporte le processus
         entier : une analyse un peu longue tuait la fonction. */
      setImmediate(() => {
        try { socket.destroy(); } catch { /* connexion déjà fermée */ }
      });
    };
    const socket = tlsConnect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        timeout: Math.min(reste, DELAI_SONDE_MS),
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        const expire = cert?.valid_to ? Date.parse(cert.valid_to) : NaN;
        if (Number.isNaN(expire)) return rendre(null);
        rendre(Math.round((expire - Date.now()) / 86_400_000));
      },
    );
    socket.on('error', () => rendre(null));
    socket.on('timeout', () => rendre(null));
  });
}

/* ══════════════════════════════════════════════════════════
   LECTURE DE LA PAGE
══════════════════════════════════════════════════════════ */

/* Entités nommées les plus fréquentes dans une page française. Les supprimer,
   comme le faisait la version précédente, transformait « Mentions l&eacute;gales »
   en « Mentions l gales » : la page était alors accusée de ne pas avoir de
   mentions légales alors qu'elles étaient bien là. Tout contrôle de présence
   passe donc désormais par du texte décodé. */
const ENTITES: Record<string, string> = {
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', Eacute: 'É', Egrave: 'È', Ecirc: 'Ê',
  agrave: 'à', acirc: 'â', auml: 'ä', Agrave: 'À', Acirc: 'Â', aring: 'å',
  ugrave: 'ù', ucirc: 'û', uuml: 'ü', Ugrave: 'Ù', Ucirc: 'Û',
  icirc: 'î', iuml: 'ï', Icirc: 'Î', ocirc: 'ô', ouml: 'ö', Ocirc: 'Ô',
  ccedil: 'ç', Ccedil: 'Ç', ntilde: 'ñ', oelig: 'œ', OElig: 'Œ', aelig: 'æ',
  nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>',
  rsquo: '’', lsquo: '‘', ldquo: '«', rdquo: '»', laquo: '«', raquo: '»',
  hellip: '…', ndash: '–', mdash: '—', deg: '°', euro: '€', copy: '©',
  reg: '®', trade: '™', middot: '·', bull: '•', times: '×', eur: '€',
  frac12: '½', sup2: '²', sup3: '³', permil: '‰', dagger: '†', shy: '',
};

/** Rend le texte tel qu'un visiteur le lit, entités comprises. */
export function decoderEntites(source: string): string {
  if (!source.includes('&')) return source;
  return source.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]{1,10});/gi, (entier, corps: string) => {
    if (corps[0] === '#') {
      const code = corps[1] === 'x' || corps[1] === 'X'
        ? parseInt(corps.slice(2), 16)
        : Number(corps.slice(1));
      if (!Number.isFinite(code) || code < 9 || code > 0x10ffff) return entier;
      try { return String.fromCodePoint(code); } catch { return entier; }
    }
    const exact = ENTITES[corps];
    if (exact !== undefined) return exact;
    const minuscule = ENTITES[corps.toLowerCase()];
    return minuscule !== undefined ? minuscule : entier;
  });
}

/**
 * Valeur d'un attribut, quels que soient les guillemets employés. La lecture
 * précédente, `content=["']([^"']*)["']`, s'arrêtait à la première apostrophe
 * rencontrée : une description qui commence par « La Pépinière à Rosières dans
 * l'Ardèche » était mesurée à 43 caractères au lieu de 150, et le site se
 * voyait reprocher une description trop courte alors qu'elle était parfaite.
 */
export function attribut(balise: string, nom: string): string | null {
  /* Le nom doit être entier : sans cette précaution, `data-src` répondait aux
     demandes de `src`, et une image chargée en différé passait pour la source
     réelle de l'élément. */
  const motif = new RegExp(
    `(?<![\\w-])${nom}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\`]+))`,
    'i',
  );
  const trouve = balise.match(motif);
  if (!trouve) return null;
  return decoderEntites(trouve[1] ?? trouve[2] ?? trouve[3] ?? '');
}

/** Première balise `nom` dont un attribut vaut la valeur cherchée. */
function baliseOu(html: string, nom: string, attr: string, valeur: RegExp): string | null {
  const balises = html.match(new RegExp(`<${nom}\\b[^>]*>`, 'gi')) ?? [];
  for (const b of balises) {
    const v = attribut(b, attr);
    if (v && valeur.test(v.trim())) return b;
  }
  return null;
}

export function texteVisible(html: string): string {
  return decoderEntites(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<template[\s\S]*?<\/template>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Durée en secondes, virgule décimale française. */
const secondes = (ms: number) => (ms / 1000).toFixed(1).replace('.', ',');

const compter = (regex: RegExp, html: string) => (html.match(regex) ?? []).length;
const extraire = (regex: RegExp, html: string) => html.match(regex)?.[1]?.trim() ?? null;

const SIGNATURES_VIDES: [RegExp, string][] = [
  [/web server'?s default page|there is no web ?site at this address/i, "l'hébergeur affiche sa page par défaut"],
  [/apache2? (ubuntu |debian )?default page|it works!/i, "le serveur affiche sa page d'installation par défaut"],
  [/welcome to nginx/i, 'le serveur affiche la page par défaut de nginx'],
  [/<title[^>]*>\s*index of \//i, "l'adresse expose un simple listing de fichiers"],
  [/domain (is )?parked|ce nom de domaine (est|a été) (réservé|enregistré)/i, 'le domaine est réservé mais inexploité'],
  [/site (web )?en (cours de )?construction|under construction/i, 'le site affiche une page de chantier'],
  [/account suspended|compte suspendu/i, "l'hébergement est suspendu"],
];

function pageSansSite(html: string, texte: string): string | null {
  for (const [motif, raison] of SIGNATURES_VIDES) if (motif.test(html)) return raison;
  const mots = texte ? texte.split(' ').length : 0;
  if (mots < 25 && compter(/<a\b[^>]*href=/gi, html) < 3 && !/<img\b/i.test(html)) {
    /* Une application construite dans le navigateur (React, Vue, Angular sans
       rendu serveur) renvoie un squelette vide que son script remplit ensuite.
       Le visiteur voit un site complet : dire « cette adresse ne renvoie vers
       aucun site » serait faux. Le sujet est réel, mais c'est un problème de
       référencement, traité comme tel plus loin. */
    if (/<script[^>]+src=/i.test(html)) return null;
    return "l'adresse répond mais ne contient aucun contenu";
  }
  return null;
}

/** Domaine racine approximatif, pour distinguer un sous-domaine maison d'un tiers. */
function racine(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\./, '').split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : parts.join('.');
}

/** Vrai si `hote` est le domaine lui-même ou l'un de ses sous-domaines. */
function memeMaison(hote: string, domaine: string): boolean {
  const h = hote.toLowerCase();
  return h === domaine || h.endsWith(`.${domaine}`);
}

/**
 * Pages internes à ouvrir en plus de l'accueil, par ordre d'utilité.
 *
 * L'audit ne portait que sur la page d'accueil, ce qui lui faisait déclarer
 * absent ce qui se trouvait une page plus loin : mentions légales, horaires,
 * adresse. Il en ouvre maintenant quelques-unes, en commençant par celles qui
 * répondent aux questions les plus lourdes. La sélection reste courte : ce
 * n'est pas un aspirateur, et le budget de la fonction est de neuf secondes.
 */
const PAGES_RECHERCHEES: { motif: RegExp; rang: number }[] = [
  { motif: /(?:^|[/_-])(?:mentions?|legal|legales|impressum|cgv|cgu|conditions)/i, rang: 0 },
  { motif: /confidentialit|privacy|donnees-personnelles|rgpd|politique/i, rang: 1 },
  { motif: /contact|nous-joindre|nous-trouver|acces|devis|rendez-vous/i, rang: 2 },
  { motif: /horaires?|ouverture|infos?-pratiques|pratique|venir/i, rang: 3 },
  { motif: /a-propos|qui-sommes|notre-histoire|presentation|entreprise|equipe/i, rang: 4 },
  { motif: /tarifs?|prix|avis|temoignages?|realisations?|galerie/i, rang: 5 },
];

/**
 * Adresses déclarées par un plan de site. Un index de plans renvoie vers
 * d'autres plans : on suit un seul niveau, ce qui suffit pour les sites que
 * l'outil rencontre. Les fichiers qui ne sont pas des pages sont écartés.
 */
export function adressesDuPlan(xml: string): { pages: string[]; sousPlans: string[] } {
  const adresses = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
  const estIndex = /<sitemapindex/i.test(xml);
  const pages = estIndex
    ? []
    : adresses.filter((u) => !/\.(?:jpe?g|png|gif|webp|avif|svg|pdf|zip|docx?|xlsx?|mp4|mp3)$/i.test(u));
  return { pages, sousPlans: estIndex ? adresses : [] };
}

function pagesAOuvrir(chemins: string[], maximum: number): string[] {
  const notes = chemins.map((chemin) => {
    const trouve = PAGES_RECHERCHEES.find((p) => p.motif.test(chemin));
    return { chemin, rang: trouve ? trouve.rang : 9 };
  });
  notes.sort((a, b) => a.rang - b.rang || a.chemin.length - b.chemin.length);
  return notes.slice(0, maximum).map((n) => n.chemin);
}

/**
 * Lecture d'un robots.txt par groupes, comme le fait un moteur de recherche.
 *
 * La version précédente cherchait « Disallow: / » n'importe où après un
 * « User-agent: * », en traversant tout le fichier. Un site parfaitement
 * indexé qui bloque un aspirateur en fin de fichier (« User-agent: PetalBot »
 * puis « Disallow: / ») était donc accusé d'interdire Google, constat le plus
 * grave de tout l'audit. Ici, seules les règles du groupe qui s'applique
 * réellement à Google sont retenues, et un « Allow: / » les annule.
 */
export function robotsBloqueTout(contenu: string): boolean {
  const lignes = contenu.split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim()).filter(Boolean);
  const groupes: { agents: string[]; regles: { permet: boolean; chemin: string }[] }[] = [];
  let courant: (typeof groupes)[number] | null = null;
  let dansEnTete = false;

  for (const ligne of lignes) {
    const agent = ligne.match(/^user-agent\s*:\s*(.*)$/i);
    if (agent) {
      if (!dansEnTete || !courant) { courant = { agents: [], regles: [] }; groupes.push(courant); }
      courant.agents.push(agent[1].trim().toLowerCase());
      dansEnTete = true;
      continue;
    }
    const regle = ligne.match(/^(dis)?allow\s*:\s*(.*)$/i);
    if (regle && courant) {
      dansEnTete = false;
      courant.regles.push({ permet: !regle[1], chemin: regle[2].trim() });
    } else if (regle === null) {
      dansEnTete = false;
    }
  }

  /* Un moteur applique le groupe qui le nomme, et seulement à défaut le groupe
     générique : un « Disallow: / » visant un autre robot ne le concerne pas. */
  const pourGoogle = groupes.filter((g) => g.agents.some((a) => a === 'googlebot'));
  const generique = groupes.filter((g) => g.agents.includes('*'));
  const applicables = pourGoogle.length ? pourGoogle : generique;
  if (!applicables.length) return false;

  return applicables.some((g) => {
    const interditRacine = g.regles.some((r) => !r.permet && /^\/\*?$/.test(r.chemin));
    const autoriseRacine = g.regles.some((r) => r.permet && /^\/\*?$/.test(r.chemin));
    return interditRacine && !autoriseRacine;
  });
}

/**
 * Vrai si une CSP laisse s'exécuter des scripts inline arbitraires, donc si sa
 * protection principale est neutralisée.
 *
 * `'unsafe-inline'` n'est un défaut que **sans** hash ni nonce : dès qu'une
 * empreinte figure dans la directive, le navigateur ignore `'unsafe-inline'`,
 * et le signaler malgré tout accuserait à tort une politique bien réglée (la
 * nôtre, par exemple). `'unsafe-eval'` reste un défaut dans tous les cas. On
 * lit `script-src`, ou `default-src` à défaut. Chaîne vide (CSP absente) : pas
 * de défaut, l'absence est déjà relevée ailleurs.
 */
export function cspFaible(csp: string): boolean {
  const c = csp.toLowerCase();
  if (!c) return false;
  const directive = (nom: string) => c.match(new RegExp(`(?:^|;)\\s*${nom}\\s([^;]*)`))?.[1] ?? null;
  const scriptSrc = directive('script-src') ?? directive('default-src') ?? '';
  const avecEmpreinte = /'(?:sha(?:256|384|512)-|nonce-)/.test(scriptSrc);
  return (/'unsafe-inline'/.test(scriptSrc) && !avecEmpreinte) || /'unsafe-eval'/.test(scriptSrc);
}

/* ══════════════════════════════════════════════════════════
   AUDIT
══════════════════════════════════════════════════════════ */

export async function analyserSite(saisie: string): Promise<Analyse> {
  const debutGlobal = Date.now();
  const finAu = debutGlobal + BUDGET_MS;

  const depart = normaliserUrl(saisie);
  if (!depart) {
    return { etat: 'refuse', raison: "Cette adresse n'est pas exploitable. Saisissez une adresse de site, par exemple mon-entreprise.fr" };
  }
  const resolution = await resoudre(depart.hostname);
  if (resolution === 'introuvable') {
    return {
      etat: 'refuse',
      raison: `Le domaine ${depart.hostname} ne pointe vers aucun serveur : il n'existe plus, il n'est pas encore configuré, ou son nom comporte une faute de frappe. Rien ne s'affiche pour un visiteur qui saisit cette adresse.`,
    };
  }
  if (resolution === 'indeterminee') {
    return {
      etat: 'refuse',
      raison: `La recherche de l'adresse de ${depart.hostname} n'a pas abouti. Le nom de domaine n'a pas pu être résolu au moment de l'analyse : réessayez dans un instant, et vérifiez l'orthographe de l'adresse.`,
    };
  }
  if (resolution === 'non-public') {
    return { etat: 'refuse', raison: 'Cette adresse ne correspond pas à un site accessible publiquement.' };
  }

  const hote = depart.hostname;
  const enHttps = new URL(depart); enHttps.protocol = 'https:';
  const enHttp = new URL(depart); enHttp.protocol = 'http:';

  let page: Reponse | null = null;
  let httpsDisponible = false;
  let certificat: string | null = null;
  let erreurHttp: number | null = null;
  let filtreNomme: string | null = null;

  for (const adresse of [enHttps, enHttp]) {
    const essai = await recuperer(adresse);
    if (!essai.ok) {
      if (essai.code && CODES_CERTIFICAT[essai.code]) certificat = CODES_CERTIFICAT[essai.code];
      continue;
    }
    if ((essai.statut ?? 0) >= 400) {
      erreurHttp = essai.statut ?? null;
      const corps = essai.corps ?? '';
      if (/vercel security checkpoint/i.test(corps)) filtreNomme = 'la protection anti-robot de Vercel';
      else if (/cloudflare/i.test(corps) && /(checking your browser|attention required|cf-browser-verification|challenge)/i.test(corps))
        filtreNomme = 'la protection anti-robot de Cloudflare';
      else if (/sucuri|incapsula|imperva/i.test(corps)) filtreNomme = 'un pare-feu applicatif';
      continue;
    }
    if (adresse.protocol === 'https:') httpsDisponible = true;
    page = essai;
    break;
  }

  const unique = (famille: Famille, fait: string, consequence: string): Analyse => ({
    etat: 'constat-unique', hote, url: depart.href,
    constats: [{ famille, gravite: 'critique', fait, consequence }],
  });

  if (!page) {
    if (certificat) {
      return unique(
        'securite',
        `Le certificat de sécurité de ${hote} n'est pas valide : ${certificat}.`,
        "Les navigateurs affichent un écran d'avertissement avant même d'ouvrir la page. La très grande majorité des visiteurs font demi-tour à ce moment précis.",
      );
    }
    /* Un refus d'accès n'est pas une page absente : beaucoup de sites protégés
       par un filtre anti-robot répondent 403 à tout ce qui n'est pas un
       navigateur, tout en fonctionnant parfaitement pour un visiteur. Le dire
       autrement serait une accusation fausse. */
    /* Codes qui traduisent un refus de la requête, et non l'état du site :
       filtre anti-robot, en-têtes jugés invalides, méthode ou format écartés,
       restriction géographique. La page existe et s'affiche pour un visiteur.
       Les confondre avec une page absente produisait une accusation fausse :
       la-poste.fr, qui répond 400 à un outil et 200 à un navigateur, se voyait
       reprocher une page d'accueil disparue. */
    const REFUS_DE_REQUETE = new Set([400, 401, 403, 405, 406, 409, 421, 422, 429, 451]);
    if (erreurHttp && REFUS_DE_REQUETE.has(erreurHttp)) {
      return {
        etat: 'injoignable', hote, url: depart.href,
        raison: filtreNomme
          ? `Le serveur de ${hote} a refusé l'analyse automatique, code ${erreurHttp} : ${filtreNomme} exige l'exécution d'un script avant de servir la page. Le site s'ouvre normalement dans un navigateur, mais aucun outil extérieur ne peut le mesurer, et il vaut la peine de vérifier que les moteurs de recherche, eux, passent bien.`
          : `Le serveur de ${hote} a refusé l'analyse automatique, code ${erreurHttp}. C'est le comportement d'un filtre qui écarte tout ce qui n'est pas un navigateur : le site fonctionne probablement pour un visiteur, mais il ne peut pas être mesuré depuis l'extérieur. Ce point mérite d'être vérifié à la main.`,
      };
    }
    if (erreurHttp && erreurHttp >= 500) {
      return unique(
        'securite',
        `Le serveur de ${hote} répond par une erreur ${erreurHttp}.`,
        "La panne est côté serveur, pas côté visiteur. Tant qu'elle dure, le site est inaccessible à tout le monde, Google compris.",
      );
    }
    /* Ne restent que les codes qui désignent bien une page absente : 404, 410
       et leurs voisins. */
    if (erreurHttp) {
      return unique(
        'referencement',
        `La page d'accueil de ${hote} renvoie une erreur ${erreurHttp}.`,
        "Le serveur fonctionne, mais la page d'accueil n'existe plus. Tous les liens qui pointent vers le site mènent à une page d'erreur.",
      );
    }
    return { etat: 'injoignable', hote, url: depart.href, raison: "L'adresse n'a pas répondu. Vérifiez l'orthographe, ou le site est peut-être hors service." };
  }

  const html = page.corps ?? '';
  const texte = texteVisible(html);
  const vide = pageSansSite(html, texte);
  if (vide) {
    return unique(
      'contenu',
      `L'adresse ${hote} ne renvoie vers aucun site : ${vide}.`,
      'Toute personne qui cherche votre entreprise et tombe sur cette adresse repart immédiatement.',
    );
  }

  const base = new URL(page.urlFinale ?? depart.href);
  const domaineBase = racine(base.hostname);

  /* Liens de l'accueil, lus avant les sondes : ils décident des pages internes
     à ouvrir. L'adresse se lit comme un attribut, car `href=/contact` sans
     guillemets est valide en HTML et l'ignorer faisait conclure à tort qu'une
     page d'accueil ne menait nulle part. */
  const liens = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({
    balise: `<a ${m[1]}>`,
    href: attribut(`<a ${m[1]}>`, 'href') ?? '',
    contenu: m[2],
  }));
  /* Pages internes distinctes accessibles depuis l'accueil : c'est le nombre de
     portes d'entrée que le site offre à Google. */
  const pagesInternes = new Set<string>();
  for (const lien of liens) {
    if (!lien.href || /^(#|mailto:|tel:|javascript:|data:|sms:)/i.test(lien.href)) continue;
    try {
      const cible = new URL(lien.href, base);
      if (racine(cible.hostname) !== domaineBase) continue;
      const chemin = cible.pathname.replace(/\/+$/, '') || '/';
      if (chemin === '/' || /\.(pdf|jpe?g|png|webp|svg|zip|docx?)$/i.test(chemin)) continue;
      pagesInternes.add(chemin);
    } catch {
      /* href non exploitable : ignoré, il ne sert pas de mesure. */
    }
  }
  const cheminsSecondaires = pagesAOuvrir([...pagesInternes], PAGES_SECONDAIRES_MAX);

  /* ── Sondes annexes, toutes lancées ensemble pour ne coûter qu'un seul délai ── */
  const varianteHote = base.hostname.startsWith('www.')
    ? base.hostname.slice(4)
    : `www.${base.hostname}`;
  const urlVariante = new URL(base); urlVariante.hostname = varianteHote; urlVariante.pathname = '/';
  const urlHttpNu = new URL(base); urlHttpNu.protocol = 'http:'; urlHttpNu.pathname = '/';

  const [robots, planSite, page404, versionHttp, varianteWww, favicon, certExpire, secondaires] =
    await Promise.all([
      sonder(new URL('/robots.txt', base), finAu),
      sonder(new URL('/sitemap.xml', base), finAu),
      sonder(new URL('/caelestis-controle-page-absente', base), finAu),
      httpsDisponible ? sonder(urlHttpNu, finAu, false) : Promise.resolve(null),
      sonder(urlVariante, finAu, false),
      sonder(new URL('/favicon.ico', base), finAu, false),
      httpsDisponible ? sonderCertificat(base.hostname, finAu) : Promise.resolve(null),
      Promise.all(
        cheminsSecondaires.map(async (chemin) => {
          try {
            const s = await sonder(new URL(chemin, base), finAu);
            return s && s.statut === 200 ? { chemin, corps: s.corps } : null;
          } catch {
            return null;
          }
        }),
      ),
    ]);

  /* Texte des pages internes réellement lues. Il ne sert qu'à lever ou adoucir
     un constat d'absence, jamais à en ajouter : une page annexe qui n'a pas pu
     être lue ne doit rien changer au résultat. */
  const pagesLues = (secondaires ?? []).filter(
    (p): p is { chemin: string; corps: string } => p !== null && p.corps.length > 0,
  );
  const texteAilleurs = pagesLues.map((p) => texteVisible(p.corps)).join(' ');
  const codeAilleurs = pagesLues.map((p) => decoderEntites(p.corps)).join(' ');
  /* Les pages d'obligations légales contiennent par nature une adresse, des
     délais et des mentions de tarifs : y trouver un horaire ne veut pas dire
     que le visiteur y trouvera les vôtres. Renvoyer quelqu'un vers ses
     mentions légales pour consulter ses prix n'aide personne, et décrédibilise
     le reste de l'analyse. Elles ne servent donc qu'aux contrôles légaux. */
  const PAGE_LEGALE = /mention|legal|cgv|cgu|conditions|confidentialit|privacy|rgpd|donnees-personnelles|cookies?/i;

  /** Cherche un motif dans les pages internes ouvertes, et dit laquelle le porte. */
  const trouveAilleurs = (motif: RegExp, options: { saufPagesLegales?: boolean } = {}): string | null => {
    for (const p of pagesLues) {
      if (options.saufPagesLegales && PAGE_LEGALE.test(p.chemin)) continue;
      if (motif.test(texteVisible(p.corps))) return p.chemin;
    }
    return null;
  };

  /* ── Mesures brutes ── */
  const bas = html.toLowerCase();
  const entetes = page.entetes;
  const enTete = (nom: string) => entetes?.get(nom)?.toLowerCase() ?? '';
  /* Version décodée, employée pour toute recherche de mot : sur du code brut,
     « Mentions l&eacute;gales » ne ressemble pas à « mentions légales ». */
  const htmlLisible = decoderEntites(html);
  /* Lecture incomplète : la fin du document manque. Aucun contrôle d'absence ne
     doit alors produire de constat, faute de savoir ce qui se trouve après la
     coupure. Un contrôle neutralisé n'est pas non plus compté comme mené. */
  const tronque = page.tronque === true;
  const sansCoupure = !tronque;

  const mots = texte ? texte.split(' ').length : 0;
  const poids = Buffer.byteLength(html, 'utf8');
  const balises = compter(/<[a-z][a-z0-9-]*[\s>/]/gi, html);
  const titre = (() => {
    const brut = extraire(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
    return brut === null ? null : decoderEntites(brut).replace(/\s+/g, ' ').trim();
  })();
  const balMeta = (nom: string) =>
    baliseOu(html, 'meta', 'name', new RegExp(`^${nom}$`, 'i')) ??
    baliseOu(html, 'meta', 'property', new RegExp(`^${nom}$`, 'i'));
  const contenuMeta = (nom: string) => {
    const b = balMeta(nom);
    const v = b ? attribut(b, 'content') : null;
    return v === null ? null : v.replace(/\s+/g, ' ').trim();
  };
  const description = contenuMeta('description');
  const viewport = contenuMeta('viewport');
  const h1 = compter(/<h1[\s>]/gi, html);
  const h2 = compter(/<h2[\s>]/gi, html);
  const images = compter(/<img[\s>]/gi, html);
  const blocsImages = html.match(/<img\b[^>]*>/gi) ?? [];
  const imagesSansAlt = blocsImages.filter((b) => !/\balt\s*=/i.test(b)).length;
  const imagesSansDimensions = blocsImages.filter(
    (b) => !/\bwidth\s*=/i.test(b) || !/\bheight\s*=/i.test(b),
  ).length;
  const imagesSansLazy = blocsImages.filter((b) => !/\bloading\s*=/i.test(b)).length;
  /* Une image servie par un optimiseur (Next/Image, Vercel, Cloudflare, Astro,
     Cloudinary, imgix, weserv) est délivrée en WebP ou AVIF par négociation de
     format : le « .jpg » qui reste dans l'URL source ne reflète pas le format
     réellement reçu. Ne la compter comme non optimisée serait un faux positif,
     puisqu'un `<img>` d'Astro déjà converti apparaît, lui, en .webp. */
  const optimiseurImage =
    /\/_next\/image|\/_vercel\/image|\/cdn-cgi\/image|\/_image\?|images\.weserv\.nl|res\.cloudinary\.com|[a-z0-9-]+\.imgix\.net/i;
  /* Un `<img>` en JPEG placé dans un `<picture>` qui propose du WebP est le
     motif de repli recommandé : le navigateur reçoit bien le format moderne.
     Le reprocher reviendrait à sanctionner la bonne pratique. */
  const sourcesModernes = new Set<string>();
  for (const bloc of html.match(/<picture\b[\s\S]*?<\/picture>/gi) ?? []) {
    if (!/type=["']image\/(?:webp|avif)["']|\.(?:webp|avif)\b/i.test(bloc)) continue;
    for (const img of bloc.match(/<img\b[^>]*>/gi) ?? []) sourcesModernes.add(img);
  }
  const imagesFormatDate = blocsImages.filter(
    (b) =>
      /\.(jpe?g|png)\b/i.test(b) &&
      !optimiseurImage.test(b) &&
      !sourcesModernes.has(b) &&
      !/\.(?:webp|avif)\b/i.test(attribut(b, 'srcset') ?? ''),
  ).length;
  const scripts = compter(/<script[^>]+src=/gi, html);
  /* Seuls les scripts du `head` bloquent réellement le premier affichage :
     compter ceux du corps de page exagérerait le constat. */
  const enTeteHtml = html.slice(0, html.search(/<\/head>/i) + 1 || 4000);
  const scriptsBloquants = (enTeteHtml.match(/<script\b[^>]*src=[^>]*>/gi) ?? []).filter(
    (b) => !/\b(defer|async|type=["']module["'])/i.test(b),
  ).length;
  const feuilles = compter(/<link[^>]+rel=["']stylesheet["']/gi, html);
  /* Les styles en ligne qui ne portent qu'une variable CSS sont une pratique
     courante et saine : ils ne sont pas comptés comme de la mise en forme
     dispersée. */
  const stylesEnLigne = [...html.matchAll(/\sstyle\s*=\s*["']([^"']*)["']/gi)].filter(
    (m) => !/^\s*--/.test(m[1]),
  ).length;
  /* Ce qui compte, ce n'est pas le nombre de fichiers mais le nombre de
     familles : une seule police déclinée en normal, gras et italique fait déjà
     trois fichiers, ce qui est sain. Les noms de fichiers ne permettent pas de
     le déduire (une même police y apparaît sous des noms hachés), on lit donc
     les familles réellement déclarées. À défaut de déclaration lisible, on s'en
     tient au nombre de fichiers, avec un seuil plus large. */
  const famillesDeclarees = new Set<string>(
    [...html.matchAll(/@font-face[^{]*\{[^}]*font-family\s*:\s*([^;}]+)/gi)].map((m) =>
      m[1].trim().replace(/^["']|["']$/g, '').toLowerCase(),
    ),
  );
  for (const m of html.matchAll(/fonts\.googleapis\.com\/css2?\?([^"']*)/gi)) {
    for (const f of m[1].matchAll(/family=([^&"']+)/gi)) {
      famillesDeclarees.add(decodeURIComponent(f[1]).split(':')[0].replace(/\+/g, ' ').toLowerCase());
    }
  }
  const fichiersPolice = new Set(
    [...html.matchAll(/([^"'\s/\\]+\.(?:woff2?|ttf|otf))\b/gi)].map((m) => m[1].toLowerCase()),
  ).size;
  const policesEnFamilles = famillesDeclarees.size > 0;
  const polices = policesEnFamilles ? famillesDeclarees.size : fichiersPolice;

  /* Domaines réellement appelés au chargement. La version précédente comptait
     aussi les `<a href>` : un pied de page avec quatre réseaux sociaux et
     quelques liens partenaires suffisait à annoncer « quinze serveurs
     extérieurs » alors que la page n'en interrogeait que quatre. Un lien n'est
     suivi que si le visiteur clique dessus, il ne coûte rien à l'affichage. */
  const RELS_CHARGES = /^(?:stylesheet|preload|prefetch|preconnect|dns-prefetch|modulepreload|icon|shortcut icon|apple-touch-icon|mask-icon|manifest)$/i;
  const domainesTiers = new Set<string>();
  const ajouterTiers = (valeur: string | null) => {
    if (!valeur) return;
    for (const brut of valeur.split(',')) {
      const hote = brut.trim().split(/\s+/)[0]?.match(/^(?:https?:)?\/\/([^/"'?\s]+)/i)?.[1];
      if (hote && !memeMaison(hote.toLowerCase(), domaineBase)) domainesTiers.add(hote.toLowerCase());
    }
  };
  for (const bloc of html.match(/<(?:script|img|iframe|source|video|audio|embed|track)\b[^>]*>/gi) ?? []) {
    ajouterTiers(attribut(bloc, 'src'));
    ajouterTiers(attribut(bloc, 'srcset'));
    ajouterTiers(attribut(bloc, 'data-src'));
  }
  for (const bloc of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (RELS_CHARGES.test((attribut(bloc, 'rel') ?? '').trim())) ajouterTiers(attribut(bloc, 'href'));
  }
  /* Ressources appelées depuis une feuille de style en ligne (url(...)). */
  for (const style of html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) ?? []) {
    for (const m of style.matchAll(/url\(\s*["']?((?:https?:)?\/\/[^)"']+)/gi)) ajouterTiers(m[1]);
  }

  /* « Scripts externes » au sens coûteux : ceux qui font vraiment attendre le
     visiteur, c'est-à-dire les scripts tiers (autre domaine, connexion et cache
     séparés) ou bloquants (ni async, ni defer, ni module). Les chunks d'un
     framework moderne (Next, Astro, SvelteKit), servis depuis le même domaine et
     chargés en async, sont multiplexés en HTTP/2, mis en cache et n'attendent
     pas le rendu : les compter comme « trop de scripts » pénalise un site bien
     construit. Le cas des scripts bloquants du head est déjà couvert à part. */
  const scriptsCouteux = (html.match(/<script\b[^>]*\bsrc=[^>]*>/gi) ?? []).filter((t) => {
    const src = attribut(t, 'src') ?? '';
    const hote = src.match(/^(?:https?:)?\/\/([^/"'?\s]+)/i)?.[1]?.toLowerCase();
    const tiers = !!hote && !memeMaison(hote, domaineBase);
    const differe = /\b(?:async|defer)\b/i.test(t) || /type=["']module["']/i.test(t);
    return tiers || !differe;
  }).length;

  const liensVagues = liens.filter(
    (lien) =>
      /^(cliquez ici|cliquer ici|ici|en savoir plus|lire la suite|voir plus|plus d'infos?|détails|details|read more)$/i.test(
        texteVisible(lien.contenu),
      ) && !/aria-label\s*=/i.test(lien.balise),
  ).length;

  /* Champs à remplir, formulaire par formulaire. Les additionner tous donnait
     un total absurde sur une page qui porte à la fois une recherche, une
     inscription à la lettre d'information et un formulaire de contact : le
     constat annonçait « le formulaire compte huit champs » alors qu'aucun n'en
     avait plus de quatre. La recherche est écartée : ce n'est pas un
     formulaire de contact. */
  const CHAMP = /<(?:input\b(?![^>]*\btype\s*=\s*["']?(?:hidden|submit|button|image|reset)\b)|select\b|textarea\b)[^>]*>/gi;
  const estRecherche = (bloc: string) =>
    /\btype\s*=\s*["']?search\b/i.test(bloc) ||
    /\b(?:name|id|class|placeholder|aria-label)\s*=\s*["'][^"']*(?:search|recherche|rechercher)/i.test(bloc);
  const formulaires = html.match(/<form\b[\s\S]*?<\/form>/gi) ?? [];
  const champsParFormulaire = formulaires.map(
    (f) => (f.match(CHAMP) ?? []).filter((b) => !estRecherche(b)).length,
  );
  const champs = champsParFormulaire.length ? Math.max(...champsParFormulaire) : 0;

  /* Un champ est correctement libellé par un `label for`, un `label` qui
     l'entoure, un aria-label, un aria-labelledby ou un title. Ne reconnaître
     que `label for` produisait un faux constat sur la case à cocher de
     consentement, presque toujours écrite `<label><input …> J'accepte</label>`. */
  const blocsChamps = (html.match(CHAMP) ?? []).filter((b) => !estRecherche(b));
  const idsEtiquetes = new Set(
    (html.match(/<label\b[^>]*>/gi) ?? [])
      .map((b) => attribut(b, 'for'))
      .filter((v): v is string => v !== null),
  );
  const champsEnveloppes = new Set(
    (html.match(/<label\b[^>]*>[\s\S]*?<\/label>/gi) ?? []).flatMap((l) => l.match(CHAMP) ?? []),
  );
  const champsSansLibelle = blocsChamps.filter((b) => {
    if (/aria-label(?:ledby)?\s*=|\btitle\s*=/i.test(b)) return false;
    if (champsEnveloppes.has(b)) return false;
    const id = attribut(b, 'id');
    return !(id && idsEtiquetes.has(id));
  }).length;

  const aFormulaire = formulaires.some((f) => (f.match(CHAMP) ?? []).some((b) => !estRecherche(b)));
  const aMailto = /href\s*=\s*["']?mailto:/i.test(html);
  const aTel = /href\s*=\s*["']?tel:/i.test(html);
  /* Numéro français affiché en clair, sous ses écritures courantes. Sert à
     distinguer « le numéro n'est pas cliquable » de « il n'y a pas de numéro »,
     deux constats très différents pour le lecteur. */
  const numeroAffiche =
    /\b0[1-9](?:[\s.\-–—]?\d{2}){4}\b/.test(texte) ||
    /\+\s?33[\s.\-]?[1-9](?:[\s.\-]?\d{2}){4}/.test(texte);
  const lienConversion =
    /href\s*=\s*["']?[^"'\s>]*\/?(contact|devis|reservation|reserver|rendez-vous|rdv|booking|prendre-rdv|nous-joindre|nous-contacter)/i.test(html);
  const aReseau =
    /href\s*=\s*["']?[^"'\s>]*(facebook|instagram|linkedin|youtube|tiktok|whatsapp|wa\.me|messenger)\.(?:com|me)/i.test(html);

  const TRACEURS: [RegExp, string][] = [
    [/googletagmanager\.com|google-analytics\.com|gtag\s*\(/i, 'Google Analytics'],
    [/connect\.facebook\.net|fbq\s*\(/i, 'le pixel Meta'],
    [/static\.hotjar\.com|hj\s*\(/i, 'Hotjar'],
    [/clarity\.ms/i, 'Microsoft Clarity'],
    [/analytics\.tiktok\.com/i, 'le pixel TikTok'],
    [/snap\.licdn\.com/i, "l'insight tag LinkedIn"],
    [/matomo\.js|piwik\.js/i, 'Matomo'],
  ];
  const traceurs = TRACEURS.filter(([motif]) => motif.test(html)).map(([, nom]) => nom);
  /* Dispositifs de consentement. La liste précédente ignorait OneTrust, premier
     outil du marché, et les modules intégrés aux boutiques : un site parfaitement
     conforme recevait le constat le plus lourd de la famille. Le mode consentement
     de Google, qui bloque les traceurs sans bannière visible dans le code, est
     également reconnu. */
  const OUTILS_CONSENTEMENT =
    /tarteaucitron|axeptio|cookiebot|didomi|orejime|klaro|osano|iubenda|cookieyes|complianz|borlabs|onetrust|optanon|cookielaw|usercentrics|trustarc|truste|quantcast|__tcfapi|consentmanager|sirdata|appconsent|sfbx|trustcommander|commandersact|cookiehub|cookiefirst|cookie-?script|termly|civicuk|cookie-?control|secure-?privacy|seersco|moove_gdpr|psgdpr|cmplz|real-?cookie-?banner|wpconsent|gdpr-?cookie|eu-?cookie|cookie-?law-?info|cookie-?notice|cookie-?consent|cookieconsent|cookie-?banner|cookie-?bar|cookie-?popup|consent-?mode/i;
  const consentement =
    OUTILS_CONSENTEMENT.test(htmlLisible) ||
    /gtag\s*\(\s*["']consent["']|["']analytics_storage["']|["']ad_storage["']|dataLayer[\s\S]{0,60}consent/i.test(html) ||
    /accepter les cookies|tout accepter|refuser les cookies|gérer mes cookies|gestion des cookies|paramétrer les cookies|préférences cookies|ce site utilise des cookies|votre consentement/i.test(texte);

  /* Recherche menée sur le texte décodé et sur les adresses : « Mentions
     l&eacute;gales » et « /mentions_legales » doivent être reconnus au même
     titre que la forme la plus simple. */
  /* Les deux erreurs possibles ne coûtent pas la même chose. Reprocher à tort
     l'absence de mentions légales, c'est un constat critique et une accusation
     fausse adressée à quelqu'un qui a fait le nécessaire. Ne pas repérer une
     vraie absence, c'est un argument manqué. La reconnaissance est donc large,
     et volontairement penchée du côté de la prudence : un lien ou un intitulé
     qui porte le mot « légal » suffit. Michel et Augustin nomme les siennes
     « Nos garanties très légales », et rien n'oblige personne au libellé
     habituel. */
  const MOT_LEGAL = /(?:^|[/_\-\s])l[ée]gal(?:e|es|s|ement)?(?:$|[/_\-\s.?#])/i;
  const MOTIF_MENTIONS =
    /mentions?[-_\s]{0,3}l[ée]gal|informations?[-_\s]{0,3}l[ée]gal|impressum|notice[-_\s]l[ée]gale|legal[-_\s]?(?:notice|information|documents?|terms)|num[ée]ro (?:de )?(?:siret|siren|rcs)|\bsiret\b|\brcs\b|directeur de (?:la )?publication/i;
  const MOTIF_CONFIDENTIALITE =
    /politique[-_\s]?de[-_\s]?confidentialit|confidentialit[ée]|privacy[-_\s]?policy|donn[ée]es[-_\s]personnelles|protection des donn[ée]es|\brgpd\b|\bgdpr\b/i;
  const MOTIF_CONDITIONS =
    /conditions[-_\s]g[ée]n[ée]rales|\bcgv\b|\bcgu\b|termes et conditions|conditions de vente|nos contrats/i;

  /* Les obligations légales sont remplies dès qu'elles existent quelque part
     sur le site : les chercher sur la seule page d'accueil revenait à
     reprocher son emplacement à un document parfaitement en règle. */
  const aMentions =
    MOTIF_MENTIONS.test(htmlLisible) ||
    /(?:^|\/\/)legal\.[a-z0-9-]+\./i.test(htmlLisible) ||
    liens.some(
      (l) => MOT_LEGAL.test(l.href.split(/[?#]/)[0]) || MOT_LEGAL.test(texteVisible(l.contenu)),
    ) ||
    MOTIF_MENTIONS.test(codeAilleurs) ||
    MOT_LEGAL.test(pagesLues.map((p) => p.chemin).join(' '));
  const aConfidentialite =
    MOTIF_CONFIDENTIALITE.test(htmlLisible) || MOTIF_CONFIDENTIALITE.test(codeAilleurs);
  const estBoutique = /ajouter au panier|add to cart|woocommerce|cdn\.shopify\.com|prestashop|mon panier|votre panier/i.test(htmlLisible);
  const aConditions = MOTIF_CONDITIONS.test(htmlLisible) || MOTIF_CONDITIONS.test(codeAilleurs);

  const aPreuve =
    /avis|t[ée]moignage|recommand|satisfaction|nos clients|ils nous ont fait confiance|★|⭐|note de \d|\d[,.]\d\s*\/\s*5/i.test(
      texte,
    ) || /"@type"\s*:\s*"(?:Review|AggregateRating)"/i.test(html);
  const aHoraires =
    /(lun|mar|mer|jeu|ven|sam|dim)[a-zéè]*\.?[^.]{0,40}?\d{1,2}\s?[h:]/i.test(texte) ||
    /openinghours/i.test(bas) ||
    /horaires?\b[^.]{0,30}(ouverture|d'accueil|de visite)|ouvert (du|le|les|tous les|de) /i.test(texte);
  /* Un code postal accompagné d'un nom de commune, avant ou après, ou une voie
     nommée : un nombre à cinq chiffres isolé peut être un prix, une référence
     ou un identifiant de réseau social. */
  const aAdresse =
    /\b\d{5}\b[\s,]{0,3}[A-Za-zÀ-ÿ][\wÀ-ÿ'-]{2,}/.test(texte) ||
    /[A-Za-zÀ-ÿ][\wÀ-ÿ'-]{2,}[\s,(]{1,3}\b\d{5}\b/.test(texte) ||
    /\b(?:rue|avenue|boulevard|chemin|route|impasse|allée|place|quai|quartier|lieu-?dit|zone artisanale|\bZA\b|\bZI\b)\b\s+[\wÀ-ÿ]/i.test(texte) ||
    /addresslocality|postalcode|streetaddress/i.test(bas);
  const aZone = /zone d'intervention|nous intervenons|secteur[s]? d'intervention|aux alentours|rayon de \d|dans un rayon|autour de|environs de/i.test(texte);
  const aRepereTarif = /à partir de|tarifs?\b|nos prix|devis gratuit|sur devis|\d\s?€|€\s?\d|\d+\s?euros/i.test(texte);
  const aRealisations = /r[ée]alisations|nos chantiers|portfolio|galerie|nos projets|avant\s*\/\s*apr[èe]s/i.test(htmlLisible);

  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .join(' ');
  /* Types schema.org qui décrivent bien une entreprise ou un établissement.
     Au-delà des types génériques, on accepte les sous-types LocalBusiness
     courants chez les artisans, praticiens, métiers de bouche, du tourisme et
     de la beauté : un salon déclaré « NailSalon » décrit parfaitement son
     établissement, ne pas le reconnaître serait un faux négatif. La valeur peut
     être une chaîne ("@type":"NailSalon") ou un tableau
     ("@type":["NailSalon","LocalBusiness"]). */
  const TYPES_ENTREPRISE = [
    'LocalBusiness', 'Organization', 'ProfessionalService', 'Store',
    'HomeAndConstructionBusiness', 'GardenStore', 'Restaurant', 'LodgingBusiness',
    'NailSalon', 'BeautySalon', 'HairSalon', 'DaySpa', 'HealthAndBeautyBusiness',
    'MedicalBusiness', 'Dentist', 'Physician', 'VeterinaryCare', 'Optician',
    'FoodEstablishment', 'Bakery', 'CafeOrCoffeeShop', 'BarOrPub', 'Winery',
    'Brewery', 'Distillery', 'IceCreamShop', 'Florist', 'PetStore',
    'Electrician', 'Plumber', 'RoofingContractor', 'GeneralContractor',
    'HVACBusiness', 'Locksmith', 'MovingCompany', 'HousePainter',
    'LegalService', 'Attorney', 'Notary', 'AccountingService', 'InsuranceAgency',
    'FinancialService', 'RealEstateAgent', 'TravelAgency', 'Campground',
    'Resort', 'BedAndBreakfast', 'Hotel', 'SportsActivityLocation', 'HealthClub',
    'DanceSchool', 'Photographer', 'EntertainmentBusiness', 'ChildCare',
    'Preschool', 'School', 'AutoRepair', 'AutomotiveBusiness', 'ShoppingCenter',
    'JewelryStore', 'ClothingStore', 'ShoeStore', 'FurnitureStore', 'BookStore',
    'HardwareStore', 'ArtGallery', 'Bakery', 'ButcherShop',
  ];
  const ficheEntreprise = new RegExp(
    `"@type"\\s*:\\s*(?:\\[\\s*)?"(?:${TYPES_ENTREPRISE.join('|')})"`,
    'i',
  ).test(jsonLd);

  /* Consigne d'indexation : elle peut viser tous les robots (`robots`) ou
     Google seul (`googlebot`). */
  const consigneRobots = [
    contenuMeta('robots') ?? '',
    contenuMeta('googlebot') ?? '',
    enTete('x-robots-tag'),
  ].join(' ').toLowerCase();
  const noindex = /\bnoindex\b/.test(consigneRobots);
  /* « nofollow » global : la page interdit à Google de suivre ses propres
     liens. Il lit l'accueil mais ne va jamais voir les autres pages. */
  const nofollow = /\bnofollow\b/.test(consigneRobots);

  /* Adresse de référence (canonical). On garde l'URL, pas seulement sa présence :
     une adresse de référence qui pointe ailleurs peut retirer la page elle-même
     des résultats au profit d'une autre. */
  const baliseCanonique = baliseOu(html, 'link', 'rel', /^canonical$/i);
  const canoniqueHref = baliseCanonique ? attribut(baliseCanonique, 'href') : null;
  const canonique = canoniqueHref !== null;
  /* Ne sont retenus que les deux cas nets d'un mauvais réglage : l'adresse de
     référence désigne un autre domaine, ou renvoie vers l'ancienne version non
     sécurisée. Une simple différence de chemin sur le même domaine est souvent
     légitime (accueil qui pointe vers « / ») et n'est pas signalée. */
  let canoniqueDetourne = false;
  if (canoniqueHref) {
    try {
      const cible = new URL(canoniqueHref, base);
      if (racine(cible.hostname) !== domaineBase) canoniqueDetourne = true;
      else if (httpsDisponible && cible.protocol === 'http:') canoniqueDetourne = true;
    } catch {
      /* adresse de référence illisible : aucun constat n'en est tiré */
    }
  }

  /* Titre qui ne dit rien : mot d'attente générique, ou simple reprise du nom
     de domaine. Google l'affiche tel quel en tête du résultat. */
  const GENERIQUES_TITRE = new Set([
    'accueil', 'home', 'bienvenue', 'welcome', 'site', 'mon site', 'nouveau site',
    'index', 'untitled', 'sans titre', 'document', "page d'accueil", 'site internet',
    'site web', 'votre site', 'my site', 'my website', 'test',
  ]);
  const titreGenerique = (() => {
    if (!titre) return false;
    const t = titre.toLowerCase().replace(/\s+/g, ' ').trim();
    if (GENERIQUES_TITRE.has(t)) return true;
    const nu = t.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    return nu === domaineBase || nu === base.hostname.replace(/^www\./, '') || t === domaineBase.split('.')[0];
  })();

  /* Lien vers la fiche Google (Maps, avis) : signal de référencement local et
     porte vers les avis, souvent le premier résultat sur une recherche locale. */
  const aFicheGoogle =
    /(?:google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|\bg\.page\b|goo\.gl\/maps|business\.google\.|search\.google\.com\/local|\/maps\/place\/)/i.test(
      html,
    );

  const baliseHtml = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
  const langue = attribut(baliseHtml, 'lang');
  const generateur = contenuMeta('generator');
  const estWordpress = /wp-content|wp-includes/i.test(html);
  const editeurEnLigne = /wix\.com|_wixCssStates|squarespace|weebly|jimdo|site123|godaddy website builder/i.test(html)
    ? (/wix/i.test(html) ? 'Wix' : /squarespace/i.test(html) ? 'Squarespace' : /weebly/i.test(html) ? 'Weebly' : /jimdo/i.test(html) ? 'Jimdo' : 'un éditeur en ligne')
    : null;
  /* Contenu mixte : seules comptent les ressources réellement chargées. Un
     `<link rel="alternate">` ou un flux déclaré en http ne fait pas disparaître
     le cadenas du navigateur, et le signaler était une fausse alerte. */
  const contenuMixte =
    httpsDisponible &&
    ((html.match(/<(?:script|img|iframe|source|video|audio|embed)\b[^>]*>/gi) ?? []).some((b) =>
      /^http:\/\//i.test(attribut(b, 'src') ?? '') || /(?:^|[\s,])http:\/\//i.test(attribut(b, 'srcset') ?? ''),
    ) ||
      (html.match(/<link\b[^>]*>/gi) ?? []).some(
        (b) =>
          RELS_CHARGES.test((attribut(b, 'rel') ?? '').trim()) &&
          /^http:\/\//i.test(attribut(b, 'href') ?? ''),
      ));
  const formulaireNonChiffre = (html.match(/<form\b[^>]*>/gi) ?? []).some((b) =>
    /^http:\/\//i.test(attribut(b, 'action') ?? ''),
  );
  const balisesObsoletes = compter(/<(?:font|center|marquee|blink|frameset)[\s>]/gi, html);
  const tableauxMiseEnPage = compter(/<table\b(?![^>]*role=["']presentation["'])[^>]*>/gi, html);
  const iframes = html.match(/<iframe\b[^>]*>/gi) ?? [];
  const iframesSansTitre = iframes.filter((b) => !/\btitle\s*=/i.test(b)).length;
  const youtubeSuivi = /youtube\.com\/embed/i.test(html) && !/youtube-nocookie\.com/i.test(html);
  const gabarit = /lorem ipsum|dolor sit amet|votre texte ici|ins[ée]rez votre|texte d'exemple|sample text|your text here|titre de la section/i.test(
    texte,
  );

  /* ── Enregistrement des contrôles ──
     `verifier` couvre le cas binaire. Les contrôles à plusieurs issues
     incrémentent le compteur eux-mêmes via `controle()` puis appellent
     `ajouter()`. Le compteur ne recense que les contrôles réellement menés :
     ce qui n'a pas pu être vérifié n'est ni compté ni reproché. */
  const constats: Constat[] = [];
  let controles = 0;

  /* Contenu fabriqué dans le navigateur : le code reçu ne porte presque aucun
     texte alors que la page charge des scripts. Rien de ce que le visiteur voit
     ne se trouve dans ce qui a été lu, donc rien ne peut être déclaré absent. */
  const contenuFabriqueParScript = mots < SEUILS.motsCritique && scripts >= 1 && balises < 300;
  /* Vrai quand la page a été lue en entier et porte bien son contenu : seule
     situation où conclure à l'absence de quelque chose a un sens. */
  const lectureComplete = sansCoupure && !contenuFabriqueParScript;

  const ajouter = (famille: Famille, gravite: Gravite, fait: string, consequence: string) =>
    constats.push({ famille, gravite, fait, consequence });
  const controle = () => { controles += 1; };
  const verifier = (
    famille: Famille,
    gravite: Gravite,
    defaut: boolean,
    fait: string,
    consequence: string,
  ) => {
    controles += 1;
    if (defaut) ajouter(famille, gravite, fait, consequence);
  };
  /**
   * Contrôle qui conclut à l'absence de quelque chose. Il n'a de sens que si la
   * page entière a été lue : sur une lecture coupée par le plafond, ce qui
   * manque peut simplement se trouver après la coupure. Le contrôle est alors
   * ni mené, ni compté, ni reproché.
   */
  const verifierPresence = (
    famille: Famille,
    gravite: Gravite,
    absent: boolean,
    fait: string,
    consequence: string,
  ) => {
    if (!lectureComplete) return;
    verifier(famille, gravite, absent, fait, consequence);
  };

  /** Un cran plus bas, quand l'information existe mais pas là où il faudrait. */
  const ADOUCI: Record<Gravite, Gravite> = {
    critique: 'moyen', moyen: 'mineur', mineur: 'reglage', reglage: 'reglage',
  };

  /**
   * Absence sur l'accueil, nuancée par ce que portent les pages internes
   * ouvertes. Une information présente une page plus loin reste un défaut à
   * l'endroit où le visiteur arrive, mais ce n'est plus la même chose que de
   * ne pas l'avoir du tout : le constat descend d'un cran et dit où elle est.
   */
  const verifierSurLeSite = (
    famille: Famille,
    gravite: Gravite,
    absentDeLAccueil: boolean,
    motifAilleurs: RegExp,
    fait: string,
    consequence: string,
    faitAilleurs: (page: string) => string,
    consequenceAilleurs: string,
  ) => {
    if (!lectureComplete) return;
    controles += 1;
    if (!absentDeLAccueil) return;
    const page = trouveAilleurs(motifAilleurs, { saufPagesLegales: true });
    if (page) ajouter(famille, ADOUCI[gravite], faitAilleurs(page), consequenceAilleurs);
    else ajouter(famille, gravite, fait, consequence);
  };

  /* ══ VITESSE ══════════════════════════════════════════ */
  controle();
  if (page.duree >= SEUILS.chargementCritique) {
    ajouter('vitesse', 'critique', `La page met ${secondes(page.duree)} secondes à répondre.`,
      "Au-delà de trois secondes, une part importante des visiteurs ferme l'onglet avant d'avoir rien vu.");
  } else if (page.duree >= SEUILS.chargementLent) {
    ajouter('vitesse', 'moyen', `La page met ${secondes(page.duree)} secondes à répondre.`,
      'Google intègre ce délai dans son classement, et les visiteurs mobiles y sont particulièrement sensibles.');
  }

  /* Le poids annoncé est celui du code une fois décompressé. Un serveur qui
     compresse n'envoie qu'un quart de ce volume : le dire évite d'alarmer sur
     un chiffre que le visiteur ne subit pas tel quel. */
  const compresse = !!enTete('content-encoding');
  controle();
  if (poids > SEUILS.poidsCritique) {
    ajouter('vitesse', 'moyen', `Le code de la page pèse ${Math.round(poids / 1024)} Ko${compresse ? ' une fois décompressé' : ''}.`,
      compresse
        ? "Ce poids est celui du texte seul, avant les images. Même compressé à l'envoi, il doit être lu et interprété par le téléphone, ce qui retarde le premier affichage."
        : 'Ce poids est celui du texte seul, avant les images, et il est envoyé tel quel faute de compression. Sur un réseau mobile, la page reste blanche plusieurs secondes.');
  } else if (poids > SEUILS.poidsLourd) {
    ajouter('vitesse', 'mineur', `Le code de la page pèse ${Math.round(poids / 1024)} Ko${compresse ? ' une fois décompressé' : ''}.`,
      'Une page bien construite tient sous 250 Ko de code. Le surplus retarde le premier affichage.');
  }

  /* La lecture s'est arrêtée au plafond : c'est en soi un fait mesuré, et il
     explique pourquoi les contrôles de présence ont été suspendus. */
  verifier('vitesse', 'moyen', tronque,
    `Le code de la page dépasse ${Math.round(POIDS_MAX / (1024 * 1024))} Mo, la lecture a dû être interrompue.`,
    "Un navigateur doit tout télécharger et tout interpréter avant d'afficher la fin de la page. Sur un téléphone, l'attente se compte en secondes. Faute d'avoir pu lire la page entière, les contrôles portant sur ce qu'elle contient ont été écartés de cette analyse.");

  verifier('vitesse', 'moyen', scriptsCouteux > SEUILS.scriptsNombreux,
    `La page charge ${scriptsCouteux} scripts tiers ou bloquants et ${feuilles} fichiers de mise en forme.`,
    'Chaque fichier tiers ou bloquant est une attente supplémentaire avant que la page devienne utilisable.');

  verifier('vitesse', 'moyen', scriptsBloquants >= 3,
    `${scriptsBloquants} scripts sont chargés sans différé, en haut de page.`,
    "Le navigateur interrompt l'affichage à chacun d'eux : le visiteur voit une page blanche pendant ce temps.");

  verifier('vitesse', 'moyen', domainesTiers.size > SEUILS.tiersNombreux,
    `La page charge des fichiers depuis ${domainesTiers.size} serveurs extérieurs.`,
    'Chaque domaine tiers ajoute une résolution réseau, et votre affichage dépend de la disponibilité de ces services.');

  if (entetes) {
    verifier('vitesse', 'moyen', !compresse,
      "Le serveur envoie la page sans compression.",
      'La compression réduit le poids transféré de 60 à 80 pour cent. Elle est gratuite et se règle côté serveur.');
  }

  verifier('vitesse', 'mineur', images >= 5 && imagesSansLazy >= images * 0.8,
    `${imagesSansLazy} images sur ${images} sont chargées immédiatement, même celles en bas de page.`,
    "Le visiteur attend le téléchargement d'images qu'il ne verra peut-être jamais.");

  verifier('vitesse', 'mineur', images >= 4 && imagesFormatDate >= images * 0.8,
    `${imagesFormatDate} images sur ${images} sont en JPEG ou PNG.`,
    'Les formats WebP et AVIF donnent la même qualité pour un tiers du poids.');

  verifier('vitesse', 'mineur', balises > SEUILS.balisesNombreuses,
    `La page compte ${balises} balises HTML.`,
    'Une structure aussi lourde ralentit le navigateur à chaque défilement, surtout sur un téléphone de plus de deux ans.');

  verifier('vitesse', 'mineur',
    polices > (policesEnFamilles ? SEUILS.policesNombreuses : SEUILS.fichiersPoliceNombreux),
    policesEnFamilles
      ? `${polices} familles de police différentes sont chargées.`
      : `${polices} fichiers de police sont chargés.`,
    policesEnFamilles
      ? "Chacune doit être téléchargée avant que le texte s'affiche dans sa forme définitive. Deux familles suffisent à tenir une identité."
      : "Chaque fichier retarde l'affichage définitif du texte. Deux familles, en deux ou trois graisses, couvrent les besoins d'un site.");

  verifier('vitesse', 'mineur', /jquery[.\-]/i.test(bas),
    'La page charge jQuery.',
    "Cette bibliothèque ajoute environ 90 Ko pour des fonctions que les navigateurs assurent seuls depuis dix ans.");

  /* ══ MOBILE ═══════════════════════════════════════════ */
  verifier('mobile', 'critique', !viewport,
    "La balise d'affichage mobile reste à déclarer.",
    'Sur téléphone, la page apparaît en version ordinateur réduite : textes minuscules, boutons difficiles à toucher.');

  verifier('mobile', 'moyen', !!viewport && /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i.test(viewport),
    'Le site interdit le zoom sur téléphone.',
    "Agrandir un texte pour le lire devient impossible, ce qui contrevient aussi aux règles d'accessibilité.");

  verifier('mobile', 'moyen', !!viewport && /width\s*=\s*\d/i.test(viewport),
    "L'affichage mobile est figé sur une largeur fixe.",
    "La page s'affiche à une taille fixe : selon le téléphone, le contenu déborde ou devient minuscule.");

  verifier('mobile', 'moyen', tableauxMiseEnPage >= 3,
    `La mise en page repose sur ${tableauxMiseEnPage} tableaux HTML.`,
    "Cette technique date d'avant les téléphones : un tableau ne se replie pas, le visiteur mobile doit faire défiler latéralement.");

  /* Une image dont la proportion est fixée en CSS (`aspect-ratio`) ne provoque
     pas de saut de mise en page, même sans attributs de dimensions. */
  const proportionEnCss = /aspect-ratio\s*:/i.test(html);
  verifier('mobile', 'moyen', images >= 3 && imagesSansDimensions >= images * 0.7 && !proportionEnCss,
    `${imagesSansDimensions} images sur ${images} ne déclarent pas leurs dimensions.`,
    'Le contenu saute pendant le chargement, et le visiteur clique parfois à côté de ce qu\'il visait.');

  verifierPresence('mobile', 'reglage', !balMeta('theme-color'),
    "La couleur de thème reste à déclarer.",
    "Sur mobile, la barre du navigateur reste grise au lieu de reprendre vos couleurs. C'est un détail, mais il se voit.");

  verifierPresence('mobile', 'mineur',
    !baliseOu(html, 'link', 'rel', /^apple-touch-icon(-precomposed)?$/i) &&
      !baliseOu(html, 'link', 'rel', /^manifest$/i),
    "L'icône pour l'écran d'accueil des iPhone reste à fournir.",
    "Si un client ajoute votre site à son écran d'accueil, il obtient une vignette grise et anonyme.");

  /* ══ SÉCURITÉ ═════════════════════════════════════════ */
  verifier('securite', 'critique', !httpsDisponible,
    "Le site répond en connexion simple, sans HTTPS.",
    "Les navigateurs affichent un avertissement avant l'ouverture de la page, et Google déclasse les sites non sécurisés.");

  /* L'expiration n'est comptée comme contrôle que si le certificat a pu être lu :
     une lecture qui n'aboutit pas ne doit produire ni constat ni reproche. */
  if (certExpire !== null) {
    controle();
    if (certExpire >= 0 && certExpire <= CERT_EXPIRE_PROCHE_JOURS) {
      const echeance = certExpire === 0 ? "aujourd'hui" : certExpire === 1 ? 'demain' : `dans ${certExpire} jours`;
      ajouter('securite', certExpire <= CERT_EXPIRE_CRITIQUE_JOURS ? 'critique' : 'moyen',
        `Le certificat de sécurité du site expire ${echeance}.`,
        "À son expiration, les navigateurs bloquent l'accès derrière un écran d'avertissement rouge, pour tous les visiteurs en même temps. Le renouvellement est souvent automatique, mais ce délai si court invite à le vérifier sans attendre.");
    }
  }

  verifier('securite', 'critique', formulaireNonChiffre,
    'Un formulaire envoie ses données en clair.',
    "Le navigateur affiche un avertissement au moment de l'envoi, et les informations saisies circulent lisiblement sur le réseau.");

  verifier('securite', 'moyen', contenuMixte,
    'Une partie de la page (image, script) se charge encore en clair.',
    "Le petit cadenas du navigateur disparaît ou se barre, alors même que le site est bien en connexion sécurisée par ailleurs. Le visiteur croit à un site non protégé.");

  if (versionHttp) {
    verifier('securite', 'moyen', versionHttp.statut === 200,
      "La version en clair du site répond encore, en parallèle de la version sécurisée.",
      "Deux adresses servent le même contenu : Google les traite comme des doublons, et les visiteurs restent en connexion non chiffrée.");
  }

  /* Les en-têtes n'ont pas pu être lus : rien ne peut en être conclu.
     Ces points sont relevés sans pénalité : ils manquent à la très grande
     majorité des sites, y compris bien construits, et les facturer
     reviendrait à noter tout le monde pareil. */
  if (entetes) {
    verifier('securite', 'reglage', !enTete('strict-transport-security'),
      "La consigne qui force la connexion sécurisée pour les visites suivantes reste à poser.",
      "Un visiteur qui tape l'adresse seule passe une première fois en clair avant d'être redirigé.");

    verifier('securite', 'reglage',
      !enTete('x-frame-options') && !enTete('content-security-policy').includes('frame-ancestors'),
      "Un autre site peut afficher vos pages dans un cadre, à sa guise.",
      "C'est la technique utilisée pour faire cliquer un visiteur sur autre chose que ce qu'il croit voir.");

    verifier('securite', 'reglage', !enTete('content-security-policy'),
      "La liste des contenus extérieurs que la page a le droit de charger reste à établir.",
      "Un script étranger qui parviendrait à s'insérer dans la page s'exécuterait librement.");

    verifier('securite', 'reglage', !enTete('x-content-type-options').includes('nosniff'),
      "Le serveur laisse le navigateur deviner le type des fichiers qu'il envoie.",
      "Un fichier déposé par un visiteur, une image ou un document, peut alors être interprété comme du code et s'exécuter.");

    verifier('securite', 'reglage', !enTete('referrer-policy'),
      "L'adresse de provenance transmise en quittant une page part en entier.",
      "En cliquant vers un autre site, l'adresse complète de votre page, parfois privée, lui est communiquée.");

    verifier('securite', 'reglage', !enTete('permissions-policy'),
      "L'accès des scripts aux capteurs de l'appareil reste ouvert.",
      "Tout script compromis pourrait réclamer la caméra, le micro ou la position.");

    /* Qualité de la CSP, quand elle existe : voir cspFaible. */
    verifier('securite', 'reglage', cspFaible(enTete('content-security-policy')),
      "La politique de sécurité autorise l'exécution de scripts écrits dans la page elle-même.",
      "Avec 'unsafe-inline' sans empreinte, ou 'unsafe-eval', un script étranger inséré dans la page s'exécute malgré la politique : sa protection principale devient décorative.");
  }

  /* Un numéro de version, et non un simple chiffre : « Apache » ne dit rien,
     « Apache/2.4.41 » ou « WordPress 6.4.9 » indiquent quelles failles essayer. */
  const versionExposee = (valeur: string) => /\d+\.\d+/.test(valeur);
  verifier('securite', 'mineur',
    versionExposee(enTete('x-powered-by')) || versionExposee(enTete('server')) ||
      (!!generateur && versionExposee(generateur)),
    'Le serveur annonce publiquement ses versions de logiciels.',
    "C'est la première information que cherche un robot d'attaque : elle lui indique quelles failles connues essayer.");

  /* ══ RÉFÉRENCEMENT ════════════════════════════════════ */
  verifier('referencement', 'critique', noindex,
    "Le code du site demande à Google de ne pas l'afficher dans les résultats de recherche.",
    "Tant que cette consigne est en place, Google laisse toutes les pages de côté, quel que soit le reste du travail. C'est souvent un réglage oublié après la mise en ligne.");

  verifier('referencement', 'moyen', nofollow && !noindex,
    "Le code demande à Google de laisser de côté tous les liens de la page.",
    "Google lit votre page d'accueil mais s'interdit d'aller voir les autres. Vos pages de services restent invisibles tant qu'il ne les trouve pas par un autre chemin.");

  controle();
  if (!titre) {
    ajouter('referencement', 'critique', "Le titre affiché dans Google reste à écrire.",
      "C'est la ligne bleue cliquable en tête d'un résultat de recherche. À défaut, Google en fabrique une avec des bouts de page, souvent bancale.");
  } else if (titreGenerique) {
    ajouter('referencement', 'moyen', `Le titre affiché dans Google reste vague : « ${titre} ».`,
      "Votre métier et votre ville y gagneraient leur place : ce sont eux qui distinguent votre site des autres sur la page de résultats, et qui donnent envie de cliquer.");
  } else if (titre.length < SEUILS.titreMin || titre.length > SEUILS.titreMax) {
    ajouter('referencement', 'moyen', `Le titre affiché dans Google fait ${titre.length} caractères.`,
      `En dessous de ${SEUILS.titreMin} il laisse de la place inutilisée, au-delà de ${SEUILS.titreMax} Google le coupe en plein milieu.`);
  }

  controle();
  if (!description) {
    ajouter('referencement', 'moyen', "La description affichée dans les résultats de recherche reste à écrire.",
      'Google compose alors un extrait au hasard dans la page, souvent très loin de ce que vous vendez.');
  } else if (description.length < SEUILS.descriptionMin || description.length > SEUILS.descriptionMax) {
    ajouter('referencement', 'mineur', `La description des résultats de recherche fait ${description.length} caractères.`,
      `La zone affichée par Google tient dans ${SEUILS.descriptionMin} à ${SEUILS.descriptionMax} caractères.`);
  }

  controle();
  if (h1 === 0) {
    ajouter('referencement', 'moyen', "Le titre principal de la page reste à poser.",
      "Google s'appuie sur ce titre pour comprendre le sujet de la page.");
  } else if (h1 > 1) {
    ajouter('referencement', 'mineur', `La page contient ${h1} titres principaux au lieu d'un seul.`,
      'La hiérarchie du contenu devient ambiguë pour les moteurs de recherche.');
  }

  verifier('referencement', 'moyen', h2 === 0 && mots > 200,
    "Les titres de section restent à poser.",
    "Le texte se présente comme un bloc unique : Google comme le visiteur pressé y cherchent les sujets à tâtons.");

  controle();
  if (!canonique) {
    ajouter('referencement', 'moyen', "Son adresse de référence reste à indiquer à Google.",
      "Si elle est joignable par plusieurs adresses (www ou non, barre finale ou non), Google choisit lui-même laquelle garder et répartit sa valeur entre elles au lieu de la concentrer.");
  } else if (canoniqueDetourne) {
    ajouter('referencement', 'critique', "La page désigne une autre adresse comme sa version officielle.",
      "Elle demande à Google d'afficher cette autre adresse à sa place. Si ce réglage est une erreur, c'est la page d'accueil elle-même qui disparaît des résultats.");
  }

  /* Deux issues distinctes, un seul contrôle : soit rien n'est déclaré, soit
     des données existent sans décrire l'entreprise elle-même. */
  controle();
  if (jsonLd.trim() === '') {
    ajouter('referencement', 'moyen', "La fiche d'informations à afficher dans Google reste à fournir.",
      "Ce sont ces informations (adresse, horaires, note) qui remplissent l'encadré affiché à côté de votre résultat. À défaut, il reste une simple ligne de texte.");
  } else if (!ficheEntreprise) {
    ajouter('referencement', 'mineur', "Les informations fournies à Google décrivent autre chose que votre établissement.",
      "Le code transmet des informations, et la fiche d'entreprise reste à ajouter : adresse, horaires et zone desservie.");
  }

  verifierPresence('referencement', 'mineur', !aFicheGoogle && !estBoutique,
    "Le lien vers votre fiche Google (Maps, avis) reste à poser sur la page d'accueil.",
    "Sur une recherche locale, la fiche Google est souvent le premier résultat et l'endroit où s'affichent vos avis. Un lien depuis le site aide Google à relier votre site et votre établissement.");

  if (lectureComplete) controle();
  if (lectureComplete && pagesInternes.size === 0) {
    ajouter('referencement', 'moyen', "L'accueil reste seul, sans lien vers une autre page.",
      "Google dispose alors d'une seule page à proposer, sur un seul sujet. Chaque prestation détaillée sur sa propre page est une porte d'entrée supplémentaire.");
  } else if (lectureComplete && pagesInternes.size <= 3) {
    ajouter('referencement', 'mineur', `Le site ne compte que ${pagesInternes.size} pages accessibles depuis l'accueil.`,
      'Le nombre de recherches sur lesquelles vous pouvez apparaître est limité par le nombre de sujets traités.');
  }

  /* Une réponse 3xx sur un fichier annexe n'apprend rien : le fichier existe
     peut-être à l'adresse indiquée. Seule une réponse ferme est exploitable, et
     un plan de site redirigé (le cas de tous les sites sous Yoast, dont le
     sitemap.xml renvoie vers sitemap_index.xml) ne doit plus être déclaré
     introuvable. */
  const redirige = (s: Sonde | null) => !!s && s.statut >= 300 && s.statut < 400;
  const conclusif = (s: Sonde | null) => !!s && !redirige(s);

  if (conclusif(robots)) {
    verifier('referencement', 'mineur', robots!.statut !== 200,
      "Le fichier robots.txt est absent.",
      "C'est le premier fichier que lit un moteur de recherche. Il sert à déclarer le plan du site, le reste continue de fonctionner sans lui.");

    if (robots!.statut === 200) {
      const contenuRobots = robots!.corps;
      verifier('referencement', 'critique',
        robotsBloqueTout(contenuRobots),
        'Le fichier robots.txt interdit à tous les moteurs de recherche de parcourir le site.',
        "C'est la consigne la plus radicale possible : elle sort le site des résultats de recherche.");

      verifier('referencement', 'moyen',
        /gptbot|oai-searchbot|claudebot|perplexitybot|google-extended/i.test(contenuRobots),
        "Le site bloque les robots des moteurs de réponse comme ChatGPT ou Perplexity.",
        "Une part croissante des recherches se termine dans une réponse rédigée par une IA. Seuls les sites ouverts à ces robots y sont cités.");

      /* Un plan de site peut être déclaré dans robots.txt, servi à l'adresse
         habituelle, ou renvoyer vers un index : les trois valent déclaration. */
      const planTrouve =
        /^\s*sitemap\s*:/im.test(contenuRobots) ||
        (planSite ? planSite.statut === 200 || redirige(planSite) : false);
      if (planSite) {
        verifier('referencement', 'moyen', !planTrouve,
          "Le plan de site reste à déclarer, et l'adresse habituelle est vide.",
          "Le plan de site est la liste que vous fournissez à Google. À défaut, il découvre vos pages au hasard des liens.");
      }
    }
  }

  if (conclusif(page404)) {
    verifier('referencement', 'moyen', page404!.statut === 200,
      "Une adresse inexistante renvoie une page normale au lieu d'une erreur.",
      "Google indexe alors des pages vides en croyant qu'elles existent, ce qui dilue la valeur du site.");

    controle();
    if (page404!.statut === 404 && texteVisible(page404!.corps).split(' ').length < 25) {
      ajouter('confiance', 'mineur', "La page d'erreur n'est pas personnalisée.",
        "Un visiteur qui suit un lien périmé tombe sur un message technique brut, sans chemin de retour vers votre site.");
    }
  }

  /* Le doublon n'est avéré que si l'autre adresse sert la page elle-même. Une
     redirection, une erreur ou un domaine qui ne répond pas ne prouvent rien. */
  if (varianteWww) {
    verifier('referencement', 'moyen', varianteWww.statut === 200,
      `Le site répond à la fois sur ${base.hostname} et sur ${varianteHote}, sans redirection.`,
      'Google voit deux sites identiques et répartit la valeur entre les deux, au lieu de la concentrer sur une seule adresse.');
  }

  verifier('referencement', 'mineur',
    !baliseOu(html, 'meta', 'property', /^og:image$/i) &&
      !baliseOu(html, 'meta', 'name', /^(?:og:image|twitter:image)$/i),
    "L'image de partage reste à configurer.",
    "Quand le lien est partagé sur les réseaux ou par message, il apparaît nu : le lien passe pour suspect.");

  /* ══ CONTENU ══════════════════════════════════════════ */
  /* Un texte quasi absent du code alors que la page charge des scripts n'est
     pas un site vide : c'est un site dont le contenu est fabriqué dans le
     navigateur. Le visiteur voit tout, les moteurs de recherche et les
     assistants qui n'exécutent pas les scripts ne voient rien. Deux problèmes
     différents, deux constats différents. */
  controle();
  if (contenuFabriqueParScript) {
    ajouter('referencement', 'critique',
      "Le texte de la page est fabriqué par un script à l'ouverture, en dehors du code source.",
      "Un visiteur voit bien la page, mais les robots qui lisent le code brut y trouvent une page presque vide. C'est le cas des moteurs de réponse comme ChatGPT, et le référencement classique en pâtit aussi.");
  } else if (mots < SEUILS.motsCritique) {
    ajouter('contenu', 'critique', `La page d'accueil contient environ ${mots} mots.`,
      "C'est trop peu pour que Google comprenne votre métier, et trop peu pour qu'un visiteur sache s'il est au bon endroit.");
  } else if (mots < SEUILS.motsPauvre) {
    ajouter('contenu', 'moyen', `La page d'accueil contient environ ${mots} mots.`,
      'Google a peu de matière pour comprendre votre activité et vous positionner sur des recherches locales.');
  }

  verifier('contenu', 'critique', gabarit,
    'La page contient encore du texte de gabarit non remplacé.',
    "Un visiteur qui tombe sur ce texte comprend que le site attend encore sa finition.");

  verifierPresence('contenu', 'moyen', !aAdresse && !aZone,
    "La ville, le code postal et la zone d'intervention restent à afficher sur la page d'accueil.",
    "Les recherches locales du type métier plus ville comptent parmi les plus rentables, et l'ancrage géographique y donne accès.");

  /* Un avis, pas le mot « avis » : les politiques de confidentialité écrivent
     « votre avis » ou « avis de réception » sans qu'aucun client s'exprime. */
  verifierSurLeSite('contenu', 'moyen', !aPreuve,
    /avis (?:de nos |clients?|v[ée]rifi|google)|nos avis|t[ée]moignages?\b|ils nous ont fait confiance|nos clients (?:t[ée]moignent|en parlent)|★|⭐|\d[,.]\d\s*\/\s*5|\d+\s*avis\b/i,
    "Les avis, témoignages et références clients restent à publier.",
    "C'est le premier élément que cherche un visiteur avant de vous contacter. Son absence le renvoie comparer ailleurs.",
    (page) => `Les avis et témoignages attendent une page plus loin : il faut ouvrir ${page}.`,
    "C'est le premier élément que cherche un visiteur avant de vous contacter. Le laisser sur une page secondaire, c'est le réserver aux plus patients.");

  verifierPresence('contenu', 'mineur', !aRealisations,
    "Les réalisations et la galerie de photos restent à montrer.",
    "Sur un métier où le résultat se voit, les photos de ce que vous avez déjà fait convainquent plus que n'importe quel argumentaire.");

  verifier('contenu', 'mineur', liensVagues >= SEUILS.liensVagues,
    `${liensVagues} liens portent un texte vague du type cliquez ici ou en savoir plus.`,
    "Le texte d'un lien indique à Google le sujet de la page visée, et à un lecteur d'écran où il va atterrir.");

  const anneeCourante = new Date().getFullYear();
  const annees = [...html.matchAll(/(?:©|&copy;|copyright)[^0-9]{0,20}(20\d{2})/gi)].map((m) => Number(m[1]));
  controle();
  if (annees.length) {
    const derniere = Math.max(...annees);
    if (anneeCourante - derniere >= 2) {
      ajouter('contenu', 'moyen', `La mention de copyright affiche encore ${derniere}.`,
        "Un visiteur en déduit que le site dort, et parfois que l'entreprise dort avec lui.");
    }
  }

  /* ══ CONVERSION ═══════════════════════════════════════ */
  /* Trois issues, du plus grave au plus bénin : aucun contact du tout, un
     contact qui ne permet pas d'écrire, ou un formulaire à un clic de là.
     Le téléphone cliquable et les réseaux comptent : les ignorer produirait
     un constat faux sur un site qui n'a simplement pas de formulaire. */
  const contactDirect = aFormulaire || aMailto || lienConversion;
  if (lectureComplete) {
    controle();
    if (!contactDirect && !aTel && !aReseau) {
      ajouter('conversion', 'critique', "Le moyen de vous contacter reste à poser sur la page d'accueil.",
        "Formulaire, adresse email, téléphone cliquable ou lien vers une page de contact : il en faut au moins un pour que le visiteur convaincu laisse sa demande.");
    } else if (!contactDirect) {
      ajouter('conversion', 'moyen',
        `L'accueil propose un seul contact, à l'oral : ${aTel ? 'le téléphone' : 'un réseau social'}.`,
        "Un visiteur qui consulte le soir, en réunion ou depuis son travail remet alors sa demande à plus tard, et repart le plus souvent pour de bon.");
    } else if (!aFormulaire && !aMailto) {
      ajouter('conversion', 'mineur', "La page d'accueil renvoie vers une page de contact, le formulaire direct restant à ajouter.",
        'Chaque clic supplémentaire avant le formulaire fait perdre une part des demandes.');
    }
  }

  /* Deux situations très différentes, longtemps confondues sous un seul
     libellé : un numéro affiché mais non cliquable, et pas de numéro du tout.
     Reprocher à un site que « le numéro n'est pas cliquable » quand il n'en
     affiche aucun énonce un fait faux. */
  const MOTIF_TELEPHONE = /\b0[1-9](?:[\s.\-–—]?\d{2}){4}\b|\+\s?33[\s.\-]?[1-9](?:[\s.\-]?\d{2}){4}/;
  if (lectureComplete && !aTel) {
    controle();
    if (numeroAffiche) {
      ajouter('conversion', 'moyen', "Le numéro de téléphone affiché n'est pas cliquable sur mobile.",
        'Un visiteur sur téléphone doit le recopier à la main, ce que peu de gens acceptent de faire.');
    } else {
      const ailleurs = trouveAilleurs(MOTIF_TELEPHONE, { saufPagesLegales: true });
      if (ailleurs) {
        ajouter('conversion', 'mineur',
          `Le numéro de téléphone attend une page plus loin : il faut aller jusqu'à ${ailleurs} pour le trouver.`,
          "Le visiteur arrive sur l'accueil. Chaque page à ouvrir avant de vous joindre écarte une partie de ceux qui allaient appeler.");
      } else {
        ajouter('conversion', 'moyen', "Aucun numéro de téléphone n'apparaît sur le site.",
          "Le téléphone reste le premier moyen de contact d'une clientèle locale, et le plus rapide à transformer en rendez-vous.");
      }
    }
  } else if (lectureComplete) {
    controle();
  }

  /* Un appel à l'action doit être visible sans défiler. Faute de rendu, on
     regarde les premiers liens du document, ceux du bandeau de navigation et du
     haut de page. Mesurer une portion du code brut, comme auparavant, n'a pas
     de sens sur une page dont le premier quart n'est que du script. */
  const CIBLE_CONTACT = /(contact|devis|rendez-vous|rdv|reservation|reserver|booking|nous-joindre|^tel:|^mailto:)/i;
  const premiersLiens = liens.slice(0, 25);
  verifier('conversion', 'moyen',
    premiersLiens.length > 0 &&
      !premiersLiens.some(
        (l) => CIBLE_CONTACT.test(l.href) || /contact|devis|rendez-vous|réserv|reserv|appel/i.test(texteVisible(l.contenu)),
      ),
    "Le bouton de contact reste à poser en haut de page.",
    "Le visiteur doit chercher comment vous joindre. Une part de ceux qui étaient prêts à le faire abandonne en route.");

  verifier('conversion', 'moyen', champs > SEUILS.champsNombreux,
    `Le formulaire le plus long compte ${champs} champs à remplir.`,
    'Au-delà de quatre ou cinq champs, chaque question supplémentaire fait perdre des demandes. Le reste se demande au téléphone.');

  /* Un jour de la semaine suivi d'une heure : une durée citée dans des
     conditions de vente ne dit pas quand la porte est ouverte. */
  verifierSurLeSite('conversion', 'moyen', !aHoraires,
    /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lun\.|mar\.|mer\.|jeu\.|ven\.|sam\.|dim\.)[^.!?]{0,40}?\d{1,2}\s?[h:]/i,
    "Les horaires d'ouverture restent à afficher.",
    "C'est l'une des informations les plus recherchées, et l'un des motifs d'appel les plus fréquents.",
    (page) => `Les horaires d'ouverture attendent une page plus loin : ils sont sur ${page}.`,
    "C'est l'une des informations les plus recherchées. La donner d'emblée épargne un appel pour la demander, et un déplacement pour rien.");

  verifierSurLeSite('conversion', 'mineur', !aAdresse,
    /\b\d{5}\b[\s,]{0,3}[A-Za-zÀ-ÿ][\wÀ-ÿ'-]{2,}|\b(?:rue|avenue|boulevard|chemin|route|impasse|allée|place|quai)\b\s+[\wÀ-ÿ]/i,
    "L'adresse postale reste à afficher.",
    "Elle rassure sur le fait que l'entreprise existe physiquement, et alimente votre référencement local.",
    (page) => `L'adresse postale attend une page plus loin : elle est sur ${page}.`,
    "Elle rassure sur le fait que l'entreprise existe physiquement, et sa présence sur l'accueil alimente le référencement local.");

  /* Un vrai prix, pas le mot « tarif » croisé dans une phrase : les conditions
     de vente parlent de « conditions tarifaires » sans donner un seul montant. */
  verifierSurLeSite('conversion', 'mineur', !aRepereTarif,
    /\d[\d\s,.]*\s?(?:€|euros?)\b|à partir de\s+\d|\btarifs?\s*:|nos (?:tarifs|prix)\b/i,
    "Un repère de prix reste à donner.",
    "Un visiteur privé d'ordre de grandeur reporte sa demande, ou demande trois devis pour se faire une idée.",
    (page) => `Le repère de prix attend une page plus loin : les tarifs sont sur ${page}.`,
    "Un visiteur qui doit chercher les prix compare ailleurs pendant ce temps.");

  verifier('conversion', 'mineur', aMailto && !aFormulaire,
    "Le contact repose sur une adresse email affichée en clair.",
    'Les robots la collectent pour envoyer du courrier indésirable, et un visiteur sur mobile doit sortir de son navigateur pour écrire.');

  /* ══ LISIBILITÉ ET ACCESSIBILITÉ ══════════════════════ */
  controle();
  if (images > 0 && imagesSansAlt > 0) {
    const part = imagesSansAlt / images;
    ajouter('lisibilite', part > 0.5 ? 'moyen' : 'mineur',
      `${imagesSansAlt} image${imagesSansAlt > 1 ? 's' : ''} sur ${images} sans description alternative.`,
      "Ces images sont invisibles pour Google Images et pour les personnes qui naviguent avec un lecteur d'écran.");
  }

  verifier('lisibilite', 'moyen', champsSansLibelle > 0,
    `${champsSansLibelle} champ${champsSansLibelle > 1 ? 's' : ''} de formulaire sans libellé associé.`,
    "Le champ reste muet pour les personnes qui utilisent un lecteur d'écran, et le texte d'aide disparaît dès la première frappe.");

  verifier('lisibilite', 'moyen', !langue,
    "La langue de la page reste à déclarer dans le code.",
    "Un lecteur d'écran lit alors le français avec une prononciation anglaise, et les moteurs de recherche doivent deviner à quel public destiner vos pages.");

  verifier('lisibilite', 'mineur', iframesSansTitre >= 1,
    `${iframesSansTitre} contenu${iframesSansTitre > 1 ? 's' : ''} intégré${iframesSansTitre > 1 ? 's' : ''} sans intitulé, carte ou vidéo.`,
    "Une personne qui navigue au clavier ou au lecteur d'écran découvre un contenu anonyme.");

  verifier('lisibilite', 'mineur', balisesObsoletes >= 1,
    `La page utilise ${balisesObsoletes} balise${balisesObsoletes > 1 ? 's' : ''} abandonnée${balisesObsoletes > 1 ? 's' : ''} depuis plus de quinze ans.`,
    "Les navigateurs les tolèrent encore, à titre transitoire. Leur présence indique un code resté en l'état depuis sa création.");

  verifier('lisibilite', 'mineur', stylesEnLigne > SEUILS.stylesEnLigne,
    `${stylesEnLigne} éléments portent leur mise en forme directement dans le code.`,
    "Chaque changement de couleur ou d'espacement doit être repris élément par élément : toute évolution du site coûte plus cher qu'elle ne devrait.");

  /* Une icône déclarée sous n'importe quelle forme moderne (svg, png, manifeste)
     vaut icône : ne chercher que `rel="icon"` et `/favicon.ico` faisait passer
     pour dépourvus des sites correctement équipés. */
  const iconeDeclaree =
    !!baliseOu(html, 'link', 'rel', /(^|\s)(?:shortcut\s+)?icon($|\s)/i) ||
    !!baliseOu(html, 'link', 'rel', /^(?:apple-touch-icon(-precomposed)?|mask-icon|manifest)$/i);
  if (iconeDeclaree || conclusif(favicon)) {
    verifier('lisibilite', 'mineur', !iconeDeclaree && favicon!.statut !== 200,
      "L'icône d'onglet reste à fournir.",
      "Dans une barre de navigateur chargée ou dans les favoris, votre site est le seul à ne pas être identifiable d'un coup d'œil.");
  }

  /* ══ CONFIANCE ET CONFORMITÉ ══════════════════════════ */
  /* Noté « important » et non « bloquant » : l'audit ouvre quelques pages
     internes, pas le site entier, et un pied de page construit par script lui
     reste invisible. La certitude n'est pas totale, la pénalité ne l'est pas
     non plus. */
  /* Le décompte des pages lues n'est pas fixé ici : le parcours du site
     continue après cette réponse, et un chiffre écrit maintenant serait
     démenti quelques secondes plus tard. Il figure dans les mesures. */
  verifierPresence('confiance', 'moyen', !aMentions,
    'Les mentions légales restent à publier sur les pages lues.',
    "Elles sont obligatoires pour tout site professionnel en France, article 6 de la loi pour la confiance dans l'économie numérique. Leur absence est sanctionnable et se remarque en cas de litige.");

  verifierPresence('confiance', 'critique', traceurs.length > 0 && !consentement,
    `La page charge ${traceurs.join(', ')} sans aucun dispositif de consentement dans son code.`,
    "Déposer un traceur avant l'accord du visiteur expose à une sanction de la CNIL, et les données collectées ainsi sont inexploitables en cas de contrôle.");

  verifierPresence('confiance', 'moyen', aFormulaire && !aConfidentialite,
    "Un formulaire collecte des données sans lien vers une politique de confidentialité.",
    "Le RGPD impose d'indiquer qui traite les données, pourquoi, et combien de temps elles sont conservées, au moment même de la collecte.");

  verifierPresence('confiance', 'moyen', estBoutique && !aConditions,
    "Le site vend en ligne, les conditions générales de vente restant à rendre accessibles.",
    "Elles sont obligatoires pour toute vente à distance, et ce sont elles qui vous protègent en cas de contestation d'une commande.");

  verifier('confiance', 'moyen', /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html),
    'Les polices sont chargées depuis les serveurs de Google.',
    "L'adresse IP de chaque visiteur est transmise à un tiers avant tout consentement. Des polices installées sur votre hébergement suppriment le sujet et accélèrent l'affichage.");

  verifier('confiance', 'moyen', youtubeSuivi,
    'Une vidéo YouTube est intégrée en mode standard.',
    'Elle dépose des traceurs publicitaires dès le chargement de la page, avant tout consentement. Le mode dépourvu de cookie existe et se règle en changeant une adresse.');

  verifier('confiance', 'mineur', !!editeurEnLigne,
    `Le site est construit avec ${editeurEnLigne}.`,
    "Le code produit reste figé : la vitesse, la structure et le référencement technique plafonnent au niveau de l'outil.");

  /* Ce sont les extensions distinctes qui comptent, pas leurs fichiers : une
     seule extension qui charge quinze scripts n'est pas un empilement. */
  const extensions = new Set(
    [...html.matchAll(/wp-content\/plugins\/([^/'"?\s]+)/gi)].map((m) => m[1].toLowerCase()),
  );
  verifier('confiance', 'mineur', estWordpress && extensions.size > 12,
    `Le site empile ${extensions.size} extensions.`,
    'Chaque extension ajoute du poids et une surface de panne. C\'est la première cause de site cassé après une mise à jour.');

  verifierPresence('confiance', 'mineur', !aReseau,
    'Le lien vers un réseau social reste à poser.',
    "Un visiteur qui veut vérifier votre activité récente cherche en vain. Une page active rassure autant qu'un avis.");

  /* ── Reste du site à parcourir ──
     Le plan de site donne la liste complète quand il existe, les liens de
     l'accueil prennent le relais sinon. Les pages déjà lues en sont retirées :
     les relire ne dirait rien de neuf. */
  const dejaLues = new Set(['/', ...pagesLues.map((p) => p.chemin)]);
  const aExplorer: string[] = [];
  const ajouterAExplorer = (chemin: string) => {
    const propre = chemin.replace(/\/+$/, '') || '/';
    if (dejaLues.has(propre) || aExplorer.includes(propre)) return;
    if (/\.(?:jpe?g|png|gif|webp|avif|svg|pdf|zip|docx?|xlsx?|mp4|mp3|xml)$/i.test(propre)) return;
    aExplorer.push(propre);
  };

  if (planSite?.statut === 200 && planSite.corps) {
    const { pages, sousPlans } = adressesDuPlan(planSite.corps);
    for (const u of pages) {
      try {
        const cible = new URL(u);
        if (memeMaison(cible.hostname, domaineBase)) ajouterAExplorer(cible.pathname);
      } catch { /* adresse illisible dans le plan : ignorée */ }
    }
    /* Index de plans : les sous-plans sont signalés au navigateur, qui les
       demandera à son tour. Les suivre ici coûterait le délai de la première
       réponse, qui doit rester immédiate. */
    for (const u of sousPlans.slice(0, 5)) {
      try {
        const cible = new URL(u);
        if (memeMaison(cible.hostname, domaineBase)) aExplorer.push(`plan:${cible.pathname}`);
      } catch { /* adresse illisible : ignorée */ }
    }
  }
  for (const chemin of pagesInternes) ajouterAExplorer(chemin);

  /* ── Notation ── */
  const { familles, note, verdict } = noter(constats);
  trierConstats(constats);

  return {
    aExplorer: aExplorer.slice(0, PAGES_SITE_MAX),
    relevees: [
      releverPage('/', page.statut ?? 200, html),
      ...pagesLues.map((p) => releverPage(p.chemin, 200, p.corps)),
    ],
    etat: 'ok',
    hote,
    url: page.urlFinale ?? depart.href,
    note,
    verdict,
    familles,
    mesures: {
      duree: page.duree,
      poids,
      mots,
      images,
      imagesSansAlt,
      scripts,
      domainesTiers: domainesTiers.size,
      pages: pagesInternes.size + 1,
      balises,
      controles,
      pagesLues: pagesLues.length + 1,
    },
    constats,
  };
}

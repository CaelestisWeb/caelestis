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

export type Gravite = 'critique' | 'moyen' | 'mineur';

export type Famille =
  | 'vitesse'
  | 'mobile'
  | 'securite'
  | 'referencement'
  | 'contenu'
  | 'conversion'
  | 'lisibilite'
  | 'confiance';

export interface Constat {
  famille: Famille;
  gravite: Gravite;
  fait: string;
  consequence: string;
}

export interface FamilleNotee {
  cle: Famille;
  libelle: string;
  note: number;
  points: number;
  bloquants: number;
}

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
const POIDS_MAX = 2 * 1024 * 1024; // au-delà, on cesse de lire : c'est déjà un constat en soi
const POIDS_SONDE_MAX = 512 * 1024;
/* Seuils d'alerte sur la date d'expiration du certificat de sécurité. */
const CERT_EXPIRE_CRITIQUE_JOURS = 7;
const CERT_EXPIRE_PROCHE_JOURS = 21;
const REDIRECTIONS_MAX = 4;
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

/** Ordre d'affichage et poids de chaque famille dans la note globale. */
const FAMILLES: { cle: Famille; libelle: string; poids: number }[] = [
  { cle: 'vitesse', libelle: 'Vitesse', poids: 1.2 },
  { cle: 'mobile', libelle: 'Mobile', poids: 1.2 },
  { cle: 'securite', libelle: 'Sécurité', poids: 1.1 },
  { cle: 'referencement', libelle: 'Référencement', poids: 1.4 },
  { cle: 'contenu', libelle: 'Contenu', poids: 1 },
  { cle: 'conversion', libelle: 'Conversion', poids: 1.4 },
  { cle: 'lisibilite', libelle: 'Lisibilité', poids: 0.9 },
  { cle: 'confiance', libelle: 'Confiance', poids: 0.8 },
];

/** Coût d'un point relevé dans la note de sa famille. */
const PENALITE: Record<Gravite, number> = { critique: 35, moyen: 18, mineur: 7 };

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

/** Résout le nom et refuse tout hôte qui pointe vers une adresse non publique. */
async function hotePublic(hostname: string): Promise<boolean> {
  // Une adresse IP saisie directement se teste sans résolution.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return !ipv4Privee(hostname);
  if (hostname.includes(':')) return !ipv6Privee(hostname);
  if (/^(localhost|.*\.local|.*\.internal|.*\.localhost)$/i.test(hostname)) return false;

  try {
    const adresses = await lookup(hostname, { all: true });
    if (adresses.length === 0) return false;
    return adresses.every((a) => (a.family === 6 ? !ipv6Privee(a.address) : !ipv4Privee(a.address)));
  } catch {
    return false;
  }
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

/** Lecture plafonnée : un fichier volumineux ne doit pas saturer la fonction. */
async function lireCorps(reponse: Response, plafond: number): Promise<string> {
  const flux = reponse.body?.getReader();
  if (!flux) return '';
  const decodeur = new TextDecoder('utf-8');
  let corps = '';
  let total = 0;
  while (total < plafond) {
    const { done, value } = await flux.read();
    if (done) break;
    total += value.byteLength;
    corps += decodeur.decode(value, { stream: true });
  }
  await flux.cancel().catch(() => {});
  return corps;
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

      const corps = await lireCorps(reponse, POIDS_MAX);
      return {
        ok: true, statut: reponse.status, urlFinale: url.href,
        corps, entetes: reponse.headers, duree: Date.now() - debut,
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
    const corps = avecCorps ? await lireCorps(reponse, POIDS_SONDE_MAX) : '';
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
      try { socket.destroy(); } catch { /* connexion déjà fermée */ }
      resolve(valeur);
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

function texteVisible(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
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
    return "l'adresse répond mais ne contient aucun contenu";
  }
  return null;
}

/** Domaine racine approximatif, pour distinguer un sous-domaine maison d'un tiers. */
function racine(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\./, '').split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : parts.join('.');
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
  if (!(await hotePublic(depart.hostname))) {
    return { etat: 'refuse', raison: 'Cette adresse ne correspond pas à un site accessible publiquement.' };
  }

  const hote = depart.hostname;
  const enHttps = new URL(depart); enHttps.protocol = 'https:';
  const enHttp = new URL(depart); enHttp.protocol = 'http:';

  let page: Reponse | null = null;
  let httpsDisponible = false;
  let certificat: string | null = null;
  let erreurHttp: number | null = null;

  for (const adresse of [enHttps, enHttp]) {
    const essai = await recuperer(adresse);
    if (!essai.ok) {
      if (essai.code && CODES_CERTIFICAT[essai.code]) certificat = CODES_CERTIFICAT[essai.code];
      continue;
    }
    if ((essai.statut ?? 0) >= 400) { erreurHttp = essai.statut ?? null; continue; }
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
    if (erreurHttp === 401 || erreurHttp === 403 || erreurHttp === 429) {
      return {
        etat: 'injoignable', hote, url: depart.href,
        raison: `Le serveur de ${hote} a refusé l'analyse automatique, code ${erreurHttp}. C'est le comportement d'un filtre anti-robot : le site fonctionne probablement pour un visiteur, mais il ne peut pas être mesuré depuis l'extérieur. Ce point mérite d'être vérifié à la main.`,
      };
    }
    if (erreurHttp && erreurHttp >= 500) {
      return unique(
        'securite',
        `Le serveur de ${hote} répond par une erreur ${erreurHttp}.`,
        "La panne est côté serveur, pas côté visiteur. Tant qu'elle dure, le site est inaccessible à tout le monde, Google compris.",
      );
    }
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

  /* ── Sondes annexes, toutes lancées ensemble pour ne coûter qu'un seul délai ── */
  const base = new URL(page.urlFinale ?? depart.href);
  const varianteHote = base.hostname.startsWith('www.')
    ? base.hostname.slice(4)
    : `www.${base.hostname}`;
  const urlVariante = new URL(base); urlVariante.hostname = varianteHote; urlVariante.pathname = '/';
  const urlHttpNu = new URL(base); urlHttpNu.protocol = 'http:'; urlHttpNu.pathname = '/';

  const [robots, planSite, page404, versionHttp, varianteWww, favicon, certExpire] = await Promise.all([
    sonder(new URL('/robots.txt', base), finAu),
    sonder(new URL('/sitemap.xml', base), finAu),
    sonder(new URL('/caelestis-controle-page-absente', base), finAu),
    httpsDisponible ? sonder(urlHttpNu, finAu, false) : Promise.resolve(null),
    sonder(urlVariante, finAu, false),
    sonder(new URL('/favicon.ico', base), finAu, false),
    httpsDisponible ? sonderCertificat(base.hostname, finAu) : Promise.resolve(null),
  ]);

  /* ── Mesures brutes ── */
  const bas = html.toLowerCase();
  const entetes = page.entetes;
  const enTete = (nom: string) => entetes?.get(nom)?.toLowerCase() ?? '';

  const mots = texte ? texte.split(' ').length : 0;
  const poids = Buffer.byteLength(html, 'utf8');
  const balises = compter(/<[a-z][a-z0-9-]*[\s>/]/gi, html);
  const titre = extraire(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
  const description =
    extraire(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, html) ??
    extraire(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i, html);
  const viewport = extraire(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i, html);
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
  const imagesFormatDate = blocsImages.filter(
    (b) => /\.(jpe?g|png)\b/i.test(b) && !optimiseurImage.test(b),
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
  const polices = new Set(
    [...html.matchAll(/[^"'\s/]+\.(?:woff2?|ttf|otf)\b/gi)].map((m) => m[0].toLowerCase()),
  ).size + [...html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"']*family=([^"'&]+)/gi)].length;

  const domaineBase = racine(base.hostname);
  const domainesTiers = new Set<string>();
  for (const m of html.matchAll(/(?:src|href)=["']https?:\/\/([^/"'?\s]+)/gi)) {
    const d = m[1].toLowerCase();
    if (!d.endsWith(domaineBase)) domainesTiers.add(d);
  }

  /* « Scripts externes » au sens coûteux : ceux qui font vraiment attendre le
     visiteur, c'est-à-dire les scripts tiers (autre domaine, connexion et cache
     séparés) ou bloquants (ni async, ni defer, ni module). Les chunks d'un
     framework moderne (Next, Astro, SvelteKit), servis depuis le même domaine et
     chargés en async, sont multiplexés en HTTP/2, mis en cache et n'attendent
     pas le rendu : les compter comme « trop de scripts » pénalise un site bien
     construit. Le cas des scripts bloquants du head est déjà couvert à part. */
  const scriptsCouteux = (html.match(/<script\b[^>]*\bsrc=[^>]*>/gi) ?? []).filter((t) => {
    const src = t.match(/src=["']([^"']+)/i)?.[1] ?? '';
    const hote = src.match(/^https?:\/\/([^/"'?\s]+)/i)?.[1]?.toLowerCase();
    const tiers = !!hote && !hote.endsWith(domaineBase);
    const differe = /\b(?:async|defer)\b/i.test(t) || /type=["']module["']/i.test(t);
    return tiers || !differe;
  }).length;

  /* Pages internes distinctes accessibles depuis l'accueil : c'est le nombre de
     portes d'entrée que le site offre à Google. */
  const pagesInternes = new Set<string>();
  const liens = [...html.matchAll(/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const lien of liens) {
    const href = lien[2];
    if (/^(#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    try {
      const cible = new URL(href, base);
      if (racine(cible.hostname) !== domaineBase) continue;
      const chemin = cible.pathname.replace(/\/+$/, '') || '/';
      if (chemin === '/' || /\.(pdf|jpe?g|png|webp|svg|zip|docx?)$/i.test(chemin)) continue;
      pagesInternes.add(chemin);
    } catch {
      /* href non exploitable : ignoré, il ne sert pas de mesure. */
    }
  }
  const liensVagues = liens.filter((lien) =>
    /^(cliquez ici|cliquer ici|ici|en savoir plus|lire la suite|voir plus|plus d'infos?|détails|details|read more)$/i.test(
      texteVisible(lien[4]),
    ),
  ).length;
  const liensNouvelOnglet = liens.filter(
    (lien) => /target=["']_blank["']/i.test(lien[0]) && !/rel=["'][^"']*noopener/i.test(lien[0]),
  ).length;

  /* Un champ est correctement libellé par un `label for`, un aria-label ou un
     aria-labelledby. Ne compter que les balises `label` produirait un faux
     constat sur tout formulaire annoté en ARIA. */
  const blocsChamps =
    html.match(
      /<(?:input\b(?![^>]*type=["'](?:hidden|submit|button|image)["'])|select\b|textarea\b)[^>]*>/gi,
    ) ?? [];
  const idsEtiquetes = new Set(
    [...html.matchAll(/<label[^>]+for=["']([^"']+)["']/gi)].map((m) => m[1]),
  );
  const champs = blocsChamps.length;
  const champsSansLibelle = blocsChamps.filter((b) => {
    if (/aria-label(?:ledby)?\s*=/i.test(b)) return false;
    const id = b.match(/\bid=["']([^"']+)["']/i)?.[1];
    return !(id && idsEtiquetes.has(id));
  }).length;

  const aFormulaire = /<form[\s>]/i.test(html);
  const aMailto = /href=["']mailto:/i.test(html);
  const aTel = /href=["']tel:/i.test(html);
  const lienConversion =
    /href=["'][^"']*\/?(contact|devis|reservation|reserver|rendez-vous|rdv|booking|prendre-rdv|nous-joindre)/i.test(html);
  const aReseau =
    /href=["'][^"']*(facebook|instagram|linkedin|youtube|tiktok|whatsapp|wa\.me|messenger)\.(?:com|me)/i.test(html);

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
  const consentement =
    /tarteaucitron|axeptio|cookiebot|didomi|orejime|klaro|osano|iubenda|cookieyes|complianz|borlabs|cookie-?notice|cookie-?consent|cookieconsent/i.test(
      html,
    ) || /accepter les cookies|gérer mes cookies|gestion des cookies|consentement/i.test(texte);

  const aMentions = /mentions[-\s]?l[ée]gales|informations l[ée]gales|impressum/i.test(html);
  const aConfidentialite =
    /politique[-\s]de[-\s]confidentialit|confidentialite|privacy[-\s]?policy|donn[ée]es[-\s]personnelles|protection des donn[ée]es|rgpd/i.test(
      html,
    );
  const estBoutique = /ajouter au panier|add to cart|woocommerce|cdn\.shopify\.com|prestashop|mon panier|votre panier/i.test(html);
  const aConditions =
    /conditions[-\s]g[ée]n[ée]rales|\bcgv\b|\bcgu\b|termes et conditions|conditions de vente|nos contrats/i.test(html);

  const aPreuve =
    /avis|t[ée]moignage|recommand|satisfaction|nos clients|ils nous ont fait confiance|★|⭐|note de \d|\d[,.]\d\s*\/\s*5/i.test(
      texte,
    );
  const aHoraires =
    /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)[^.]{0,40}\d{1,2}\s?[h:]/i.test(texte) ||
    /openinghours/i.test(bas) ||
    /horaires? d'ouverture/i.test(texte);
  const aAdresse = /\b\d{5}\b/.test(texte) || /addresslocality|postalcode/i.test(bas);
  const aZone = /zone d'intervention|nous intervenons|secteur[s]? d'intervention|aux alentours|rayon de \d|dans un rayon/i.test(texte);
  const aRepereTarif = /à partir de|tarifs?|nos prix|devis gratuit|sur devis|€/i.test(texte);
  const aRealisations = /r[ée]alisations|nos chantiers|portfolio|galerie|nos projets|avant\s*\/\s*apr[èe]s/i.test(html);

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

  const noindex =
    /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ||
    enTete('x-robots-tag').includes('noindex');
  /* « nofollow » global : la page interdit à Google de suivre ses propres
     liens. Il lit l'accueil mais ne va jamais voir les autres pages. */
  const nofollow =
    /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*nofollow/i.test(html) ||
    enTete('x-robots-tag').includes('nofollow');

  /* Adresse de référence (canonical). On garde l'URL, pas seulement sa présence :
     une adresse de référence qui pointe ailleurs peut retirer la page elle-même
     des résultats au profit d'une autre. */
  const canoniqueHref =
    extraire(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i, html) ??
    extraire(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i, html);
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

  const langue = extraire(/<html[^>]*\slang=["']([^"']+)["']/i, html);
  const generateur = extraire(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']*)["']/i, html);
  const estWordpress = /wp-content|wp-includes/i.test(html);
  const editeurEnLigne = /wix\.com|_wixCssStates|squarespace|weebly|jimdo|site123|godaddy website builder/i.test(html)
    ? (/wix/i.test(html) ? 'Wix' : /squarespace/i.test(html) ? 'Squarespace' : /weebly/i.test(html) ? 'Weebly' : /jimdo/i.test(html) ? 'Jimdo' : 'un éditeur en ligne')
    : null;
  const contenuMixte =
    httpsDisponible &&
    (/(?:src|srcset)=["']http:\/\//i.test(html) || /<link[^>]+href=["']http:\/\//i.test(html));
  const formulaireNonChiffre = /<form[^>]+action=["']http:\/\//i.test(html);
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

  /* ══ VITESSE ══════════════════════════════════════════ */
  controle();
  if (page.duree >= SEUILS.chargementCritique) {
    ajouter('vitesse', 'critique', `La page met ${secondes(page.duree)} secondes à répondre.`,
      "Au-delà de trois secondes, une part importante des visiteurs ferme l'onglet avant d'avoir rien vu.");
  } else if (page.duree >= SEUILS.chargementLent) {
    ajouter('vitesse', 'moyen', `La page met ${secondes(page.duree)} secondes à répondre.`,
      'Google intègre ce délai dans son classement, et les visiteurs mobiles y sont particulièrement sensibles.');
  }

  controle();
  if (poids > SEUILS.poidsCritique) {
    ajouter('vitesse', 'moyen', `Le code de la page pèse ${Math.round(poids / 1024)} Ko.`,
      'Ce poids est celui du texte seul, avant les images. Sur un réseau mobile, la page reste blanche plusieurs secondes.');
  } else if (poids > SEUILS.poidsLourd) {
    ajouter('vitesse', 'mineur', `Le code de la page pèse ${Math.round(poids / 1024)} Ko.`,
      'Une page bien construite tient sous 250 Ko de code. Le surplus retarde le premier affichage.');
  }

  verifier('vitesse', 'moyen', scriptsCouteux > SEUILS.scriptsNombreux,
    `La page charge ${scriptsCouteux} scripts tiers ou bloquants et ${feuilles} fichiers de mise en forme.`,
    'Chaque fichier tiers ou bloquant est une attente supplémentaire avant que la page devienne utilisable.');

  verifier('vitesse', 'moyen', scriptsBloquants >= 3,
    `${scriptsBloquants} scripts sont chargés sans différé, en haut de page.`,
    "Le navigateur interrompt l'affichage à chacun d'eux : le visiteur voit une page blanche pendant ce temps.");

  verifier('vitesse', 'moyen', domainesTiers.size > SEUILS.tiersNombreux,
    `La page fait appel à ${domainesTiers.size} serveurs extérieurs.`,
    'Chaque domaine tiers ajoute une résolution réseau, et votre affichage dépend de la disponibilité de ces services.');

  verifier('vitesse', 'moyen', entetes ? !enTete('content-encoding') : false,
    "Le serveur envoie la page sans compression.",
    'La compression réduit le poids transféré de 60 à 80 pour cent. Elle est gratuite et se règle côté serveur.');

  verifier('vitesse', 'mineur', images >= 5 && imagesSansLazy >= images * 0.8,
    `${imagesSansLazy} images sur ${images} sont chargées immédiatement, même celles en bas de page.`,
    "Le visiteur attend le téléchargement d'images qu'il ne verra peut-être jamais.");

  verifier('vitesse', 'mineur', images >= 4 && imagesFormatDate >= images * 0.8,
    `${imagesFormatDate} images sur ${images} sont en JPEG ou PNG.`,
    'Les formats WebP et AVIF donnent la même qualité pour un tiers du poids.');

  verifier('vitesse', 'mineur', balises > SEUILS.balisesNombreuses,
    `La page compte ${balises} balises HTML.`,
    'Une structure aussi lourde ralentit le navigateur à chaque défilement, surtout sur un téléphone de plus de deux ans.');

  verifier('vitesse', 'mineur', polices > SEUILS.policesNombreuses,
    `${polices} fichiers de police sont chargés.`,
    "Le texte reste invisible ou change d'aspect le temps du téléchargement.");

  verifier('vitesse', 'mineur', /jquery[.\-]/i.test(bas),
    'La page charge jQuery.',
    "Cette bibliothèque ajoute environ 90 Ko pour des fonctions que les navigateurs assurent seuls depuis dix ans.");

  /* ══ MOBILE ═══════════════════════════════════════════ */
  verifier('mobile', 'critique', !viewport,
    "Le site ne déclare pas de balise d'affichage mobile.",
    'Sur téléphone, la page apparaît en version ordinateur réduite : textes minuscules, boutons difficiles à toucher.');

  verifier('mobile', 'moyen', !!viewport && /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i.test(viewport),
    'Le site interdit le zoom sur téléphone.',
    "Toute personne qui a besoin d'agrandir un texte pour le lire ne peut pas le faire. C'est aussi un manquement aux règles d'accessibilité.");

  verifier('mobile', 'moyen', !!viewport && /width\s*=\s*\d/i.test(viewport),
    "L'affichage mobile est figé sur une largeur fixe.",
    "La page ne s'adapte pas à la taille réelle de l'écran : selon le téléphone, le contenu débordera ou sera minuscule.");

  verifier('mobile', 'moyen', tableauxMiseEnPage >= 3,
    `La mise en page repose sur ${tableauxMiseEnPage} tableaux HTML.`,
    "Cette technique date d'avant les téléphones : un tableau ne se replie pas, le visiteur mobile doit faire défiler latéralement.");

  verifier('mobile', 'moyen', images >= 3 && imagesSansDimensions >= images * 0.7,
    `${imagesSansDimensions} images sur ${images} ne déclarent pas leurs dimensions.`,
    'Le contenu saute pendant le chargement, et le visiteur clique parfois à côté de ce qu\'il visait.');

  verifier('mobile', 'mineur', !/<meta[^>]+name=["']theme-color["']/i.test(html),
    "Aucune couleur de thème n'est déclarée.",
    "Sur mobile, la barre du navigateur reste grise au lieu de reprendre vos couleurs. C'est un détail, mais il se voit.");

  verifier('mobile', 'mineur', !/<link[^>]+rel=["']apple-touch-icon["']/i.test(html),
    "Aucune icône n'est prévue pour l'écran d'accueil des iPhone.",
    "Si un client ajoute votre site à son écran d'accueil, il obtient une vignette grise sans identité.");

  /* ══ SÉCURITÉ ═════════════════════════════════════════ */
  verifier('securite', 'critique', !httpsDisponible,
    "Le site n'est pas accessible en connexion sécurisée.",
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
    'Un formulaire envoie ses données en clair, sans chiffrement.',
    "Le navigateur affiche un avertissement au moment de l'envoi, et les informations saisies circulent lisiblement sur le réseau.");

  verifier('securite', 'moyen', contenuMixte,
    'Une partie de la page (image, script) se charge encore sans connexion sécurisée.',
    "Le petit cadenas du navigateur disparaît ou se barre, alors même que le site est bien en connexion sécurisée par ailleurs. Le visiteur croit à un site non protégé.");

  if (versionHttp) {
    verifier('securite', 'moyen', versionHttp.statut === 200,
      "La version non sécurisée du site reste accessible sans redirection.",
      "Deux adresses servent le même contenu : Google les traite comme des doublons, et les visiteurs restent en connexion non chiffrée.");
  }

  verifier('securite', 'mineur', entetes ? !enTete('strict-transport-security') : false,
    "Le serveur ne force pas la connexion sécurisée pour les visites suivantes.",
    "Un visiteur qui tape l'adresse sans le préfixe passe une première fois en clair avant d'être redirigé.");

  verifier('securite', 'mineur',
    entetes ? !enTete('x-frame-options') && !enTete('content-security-policy').includes('frame-ancestors') : false,
    "Rien n'empêche un autre site d'afficher vos pages dans un cadre.",
    "C'est la technique utilisée pour faire cliquer un visiteur sur autre chose que ce qu'il croit voir.");

  verifier('securite', 'mineur', entetes ? !enTete('content-security-policy') : false,
    "La page ne limite pas les contenus extérieurs qu'elle a le droit de charger.",
    "Si un script étranger parvient à s'insérer dans une page, rien ne l'empêche de s'exécuter.");

  verifier('securite', 'mineur',
    /\d/.test(enTete('x-powered-by')) || /\d/.test(enTete('server')) || (!!generateur && /\d/.test(generateur)),
    'Le serveur annonce publiquement ses versions de logiciels.',
    "C'est la première information que cherche un robot d'attaque : elle lui indique quelles failles connues essayer.");

  verifier('securite', 'mineur', liensNouvelOnglet >= 1,
    `${liensNouvelOnglet} lien${liensNouvelOnglet > 1 ? 's ouvrent' : ' ouvre'} un nouvel onglet sans protection.`,
    "La page ouverte garde une prise sur la vôtre et peut la rediriger ailleurs.");

  /* ══ RÉFÉRENCEMENT ════════════════════════════════════ */
  verifier('referencement', 'critique', noindex,
    "Le code du site demande à Google de ne pas l'afficher dans les résultats de recherche.",
    "Tant que cette consigne est en place, aucune page ne peut apparaître dans Google, quel que soit le reste du travail. C'est souvent un réglage oublié après la mise en ligne.");

  verifier('referencement', 'moyen', nofollow && !noindex,
    "Le code demande à Google de ne suivre aucun lien de la page.",
    "Google lit votre page d'accueil mais s'interdit d'aller voir les autres. Vos pages de services restent invisibles tant qu'il ne les trouve pas par un autre chemin.");

  controle();
  if (!titre) {
    ajouter('referencement', 'critique', "La page n'a pas de titre affiché dans Google.",
      "C'est la ligne bleue cliquable en tête d'un résultat de recherche. Sans elle, Google en fabrique une avec des bouts de page, souvent bancale.");
  } else if (titreGenerique) {
    ajouter('referencement', 'moyen', `Le titre affiché dans Google ne dit rien de précis : « ${titre} ».`,
      "Il ne mentionne ni votre métier ni votre ville. Sur la page de résultats, rien ne distingue votre site des autres, et rien n'incite à cliquer dessus.");
  } else if (titre.length < SEUILS.titreMin || titre.length > SEUILS.titreMax) {
    ajouter('referencement', 'moyen', `Le titre affiché dans Google fait ${titre.length} caractères.`,
      `En dessous de ${SEUILS.titreMin} il n'exploite pas la place disponible, au-delà de ${SEUILS.titreMax} Google le coupe en plein milieu.`);
  }

  controle();
  if (!description) {
    ajouter('referencement', 'moyen', "Aucune description n'est fournie pour les résultats de recherche.",
      'Google compose alors un extrait au hasard dans la page, souvent sans rapport avec ce que vous vendez.');
  } else if (description.length < SEUILS.descriptionMin || description.length > SEUILS.descriptionMax) {
    ajouter('referencement', 'mineur', `La description des résultats de recherche fait ${description.length} caractères.`,
      `La zone affichée par Google tient dans ${SEUILS.descriptionMin} à ${SEUILS.descriptionMax} caractères.`);
  }

  controle();
  if (h1 === 0) {
    ajouter('referencement', 'moyen', "La page n'a aucun titre principal.",
      "Google s'appuie sur ce titre pour comprendre le sujet de la page.");
  } else if (h1 > 1) {
    ajouter('referencement', 'mineur', `La page contient ${h1} titres principaux au lieu d'un seul.`,
      'La hiérarchie du contenu devient ambiguë pour les moteurs de recherche.');
  }

  verifier('referencement', 'moyen', h2 === 0 && mots > 200,
    "La page n'a aucun titre de section.",
    "Le texte se présente comme un bloc unique : ni Google ni le visiteur pressé ne peuvent en repérer les sujets.");

  controle();
  if (!canonique) {
    ajouter('referencement', 'moyen', "La page n'indique pas à Google sa bonne adresse.",
      "Si elle est joignable par plusieurs adresses (avec ou sans www, avec ou sans barre finale), Google choisit lui-même laquelle garder et répartit sa valeur entre elles au lieu de la concentrer.");
  } else if (canoniqueDetourne) {
    ajouter('referencement', 'critique', "La page désigne une autre adresse comme sa version officielle.",
      "Elle demande à Google d'afficher cette autre adresse à sa place. Si ce réglage est une erreur, c'est la page d'accueil elle-même qui disparaît des résultats.");
  }

  /* Deux issues distinctes, un seul contrôle : soit rien n'est déclaré, soit
     des données existent sans décrire l'entreprise elle-même. */
  controle();
  if (jsonLd.trim() === '') {
    ajouter('referencement', 'moyen', "Le site ne fournit à Google aucune fiche d'informations à afficher.",
      "Ce sont ces informations (adresse, horaires, note) qui remplissent l'encadré affiché à côté de votre résultat. Sans elles, votre résultat reste une simple ligne de texte.");
  } else if (!ficheEntreprise) {
    ajouter('referencement', 'mineur', "Les informations fournies à Google ne décrivent pas votre établissement.",
      "Le code transmet bien des informations, mais aucune fiche d'entreprise : ni adresse, ni horaires, ni zone desservie.");
  }

  verifier('referencement', 'mineur', !aFicheGoogle && !estBoutique,
    "Aucun lien vers votre fiche Google (Maps, avis) depuis la page d'accueil.",
    "Sur une recherche locale, la fiche Google est souvent le premier résultat et l'endroit où s'affichent vos avis. Un lien depuis le site aide Google à relier votre site et votre établissement.");

  controle();
  if (pagesInternes.size === 0) {
    ajouter('referencement', 'moyen', "L'accueil ne mène à aucune autre page.",
      "Google n'a qu'une seule page à proposer, sur un seul sujet. Chaque prestation détaillée sur sa propre page est une porte d'entrée supplémentaire.");
  } else if (pagesInternes.size <= 3) {
    ajouter('referencement', 'mineur', `Le site ne compte que ${pagesInternes.size} pages accessibles depuis l'accueil.`,
      'Le nombre de recherches sur lesquelles vous pouvez apparaître est limité par le nombre de sujets traités.');
  }

  if (robots) {
    verifier('referencement', 'mineur', robots.statut !== 200,
      "Le fichier robots.txt est absent.",
      "C'est le premier fichier que lit un moteur de recherche. Son absence n'est pas bloquante, mais elle empêche d'y déclarer le plan du site.");

    if (robots.statut === 200) {
      const contenuRobots = robots.corps.toLowerCase();
      verifier('referencement', 'critique',
        /user-agent:\s*\*[\s\S]*?disallow:\s*\/\s*(?:\n|$)/i.test(contenuRobots),
        'Le fichier robots.txt interdit à tous les moteurs de recherche de parcourir le site.',
        "C'est la consigne la plus radicale possible : elle sort le site des résultats de recherche.");

      verifier('referencement', 'moyen',
        /gptbot|oai-searchbot|claudebot|perplexitybot|google-extended/i.test(contenuRobots),
        "Le site bloque les robots des moteurs de réponse comme ChatGPT ou Perplexity.",
        "Une part croissante des recherches se termine dans une réponse rédigée par une IA. Un site bloqué n'y est jamais cité.");

      verifier('referencement', 'moyen', !contenuRobots.includes('sitemap:') && !(planSite && planSite.statut === 200),
        "Aucun plan de site n'est déclaré ni trouvé à l'adresse habituelle.",
        "Le plan de site est la liste que vous fournissez à Google. Sans lui, il découvre vos pages au hasard des liens.");
    }
  }

  if (page404) {
    verifier('referencement', 'moyen', page404.statut === 200,
      "Une adresse inexistante renvoie une page normale au lieu d'une erreur.",
      "Google indexe alors des pages vides en croyant qu'elles existent, ce qui dilue la valeur du site.");

    controle();
    if (page404.statut === 404 && texteVisible(page404.corps).split(' ').length < 25) {
      ajouter('confiance', 'mineur', "La page d'erreur n'est pas personnalisée.",
        "Un visiteur qui suit un lien périmé tombe sur un message technique brut, sans moyen de revenir à votre site.");
    }
  }

  if (varianteWww) {
    verifier('referencement', 'moyen', varianteWww.statut === 200,
      `Le site répond à la fois sur ${base.hostname} et sur ${varianteHote}, sans redirection.`,
      'Google voit deux sites identiques et répartit la valeur entre les deux, au lieu de la concentrer sur une seule adresse.');
  }

  verifier('referencement', 'mineur', !/<meta[^>]+property=["']og:/i.test(html),
    "Aucune image de partage n'est configurée.",
    "Quand le lien est partagé sur les réseaux ou par message, aucun visuel n'apparaît : le lien passe pour suspect.");

  /* ══ CONTENU ══════════════════════════════════════════ */
  controle();
  if (mots < SEUILS.motsCritique) {
    ajouter('contenu', 'critique', `La page d'accueil contient environ ${mots} mots.`,
      "C'est trop peu pour que Google comprenne votre métier, et trop peu pour qu'un visiteur sache s'il est au bon endroit.");
  } else if (mots < SEUILS.motsPauvre) {
    ajouter('contenu', 'moyen', `La page d'accueil contient environ ${mots} mots.`,
      'Google a peu de matière pour comprendre votre activité et vous positionner sur des recherches locales.');
  }

  verifier('contenu', 'critique', gabarit,
    'La page contient encore du texte de gabarit non remplacé.',
    "Un visiteur qui tombe sur ce texte comprend que le site n'a jamais été terminé.");

  verifier('contenu', 'moyen', !aAdresse && !aZone,
    "Aucune ville, aucun code postal, aucune zone d'intervention n'apparaît sur la page d'accueil.",
    "Les recherches locales du type métier plus ville comptent parmi les plus rentables. Sans ancrage géographique, vous n'y êtes pas éligible.");

  verifier('contenu', 'moyen', !aPreuve,
    "Aucun avis, témoignage ni référence client n'apparaît sur la page d'accueil.",
    "C'est le premier élément que cherche un visiteur avant de vous contacter. Son absence le renvoie comparer ailleurs.");

  verifier('contenu', 'mineur', !aRealisations,
    "Aucun lien vers des réalisations ou une galerie de chantiers.",
    "Sur un métier visuel, les photos de travaux réalisés font plus pour convaincre que n'importe quel argumentaire.");

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
        "Un visiteur en déduit que le site n'est plus tenu à jour, et parfois que l'entreprise ne l'est plus non plus.");
    }
  }

  /* ══ CONVERSION ═══════════════════════════════════════ */
  /* Trois issues, du plus grave au plus bénin : aucun contact du tout, un
     contact qui ne permet pas d'écrire, ou un formulaire à un clic de là.
     Le téléphone cliquable et les réseaux comptent : les ignorer produirait
     un constat faux sur un site qui n'a simplement pas de formulaire. */
  const contactDirect = aFormulaire || aMailto || lienConversion;
  controle();
  if (!contactDirect && !aTel && !aReseau) {
    ajouter('conversion', 'critique', "Aucun moyen de vous contacter depuis la page d'accueil.",
      "Ni formulaire, ni adresse email, ni téléphone cliquable, ni lien vers une page de contact. Un visiteur convaincu n'a aucun moyen simple de laisser une demande.");
  } else if (!contactDirect) {
    ajouter('conversion', 'moyen',
      `Aucune demande écrite n'est possible depuis l'accueil : le seul contact proposé est ${aTel ? 'le téléphone' : 'un réseau social'}.`,
      "Un visiteur qui consulte le soir, en réunion ou depuis son travail ne peut rien laisser. Il remet sa demande à plus tard, et le plus souvent ne revient pas.");
  } else if (!aFormulaire && !aMailto) {
    ajouter('conversion', 'mineur', "La page d'accueil renvoie vers une page de contact, sans formulaire direct.",
      'Chaque clic supplémentaire avant le formulaire fait perdre une part des demandes.');
  }

  verifier('conversion', 'moyen', !aTel,
    "Le numéro de téléphone n'est pas cliquable sur mobile.",
    'Un visiteur sur téléphone doit le recopier à la main, ce que beaucoup ne font pas.');

  /* Un appel à l'action doit être visible sans défiler. Faute de rendu, on
     regarde s'il en existe un dans le premier quart du corps de page, ce qui
     correspond en pratique au premier écran. */
  const debutCorps = html.slice(0, Math.max(4000, Math.floor(html.length / 4)));
  verifier('conversion', 'moyen',
    !/href=["'][^"']*(contact|devis|rendez-vous|rdv|reservation|reserver|tel:)/i.test(debutCorps),
    "Aucun bouton de contact n'apparaît en haut de page.",
    "Le visiteur doit chercher comment vous joindre. Une part de ceux qui étaient prêts à le faire abandonne en route.");

  verifier('conversion', 'moyen', champs > SEUILS.champsNombreux,
    `Le formulaire compte ${champs} champs à remplir.`,
    'Au-delà de quatre ou cinq champs, chaque question supplémentaire fait perdre des demandes. Le reste se demande au téléphone.');

  verifier('conversion', 'moyen', !aHoraires,
    "Aucun horaire d'ouverture n'apparaît sur la page d'accueil.",
    "C'est l'une des informations les plus recherchées, et l'un des motifs d'appel les plus fréquents.");

  verifier('conversion', 'mineur', !aAdresse,
    "Aucune adresse postale n'apparaît sur la page d'accueil.",
    "Elle rassure sur le fait que l'entreprise existe physiquement, et alimente votre référencement local.");

  verifier('conversion', 'mineur', !aRepereTarif,
    "Aucun repère de prix n'est donné.",
    "Un visiteur sans aucun ordre de grandeur reporte sa demande, ou demande trois devis pour se faire une idée.");

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
    "Le champ n'est pas annoncé aux personnes qui utilisent un lecteur d'écran, et le texte d'aide disparaît dès la première frappe.");

  verifier('lisibilite', 'moyen', !langue,
    "La langue de la page n'est pas déclarée dans le code.",
    "Un lecteur d'écran lit alors le français avec une prononciation anglaise, et les moteurs de recherche doivent deviner à quel public destiner vos pages.");

  verifier('lisibilite', 'mineur', iframesSansTitre >= 1,
    `${iframesSansTitre} contenu${iframesSansTitre > 1 ? 's' : ''} intégré${iframesSansTitre > 1 ? 's' : ''} sans intitulé, carte ou vidéo.`,
    "Une personne qui navigue au clavier ou au lecteur d'écran ne sait pas ce qu'elle vient d'atteindre.");

  verifier('lisibilite', 'mineur', balisesObsoletes >= 1,
    `La page utilise ${balisesObsoletes} balise${balisesObsoletes > 1 ? 's' : ''} abandonnée${balisesObsoletes > 1 ? 's' : ''} depuis plus de quinze ans.`,
    'Les navigateurs les tolèrent encore, sans garantie. Leur présence indique un code jamais repris depuis sa création.');

  verifier('lisibilite', 'mineur', stylesEnLigne > SEUILS.stylesEnLigne,
    `${stylesEnLigne} éléments portent leur mise en forme directement dans le code.`,
    "Chaque changement de couleur ou d'espacement doit être repris élément par élément : toute évolution du site coûte plus cher qu'elle ne devrait.");

  verifier('lisibilite', 'mineur', !/<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(html) && (favicon ? favicon.statut !== 200 : false),
    "Le site n'a pas d'icône d'onglet.",
    "Dans une barre de navigateur chargée ou dans les favoris, votre site est le seul à ne pas être identifiable d'un coup d'œil.");

  /* ══ CONFIANCE ET CONFORMITÉ ══════════════════════════ */
  verifier('confiance', 'critique', !aMentions,
    "Aucun lien vers des mentions légales n'a été trouvé.",
    "Elles sont obligatoires pour tout site professionnel en France, article 6 de la loi pour la confiance dans l'économie numérique. Leur absence est sanctionnable et se remarque en cas de litige.");

  verifier('confiance', 'critique', traceurs.length > 0 && !consentement,
    `La page charge ${traceurs.join(', ')} sans aucun dispositif de consentement dans son code.`,
    "Déposer un traceur avant l'accord du visiteur expose à une sanction de la CNIL, et les données collectées ainsi sont inexploitables en cas de contrôle.");

  verifier('confiance', 'moyen', aFormulaire && !aConfidentialite,
    "Un formulaire collecte des données sans lien vers une politique de confidentialité.",
    "Le RGPD impose d'indiquer qui traite les données, pourquoi, et combien de temps elles sont conservées, au moment même de la collecte.");

  verifier('confiance', 'moyen', estBoutique && !aConditions,
    "Le site vend en ligne sans conditions générales de vente accessibles.",
    "Elles sont obligatoires pour toute vente à distance, et ce sont elles qui vous protègent en cas de contestation d'une commande.");

  verifier('confiance', 'moyen', /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html),
    'Les polices sont chargées depuis les serveurs de Google.',
    "L'adresse IP de chaque visiteur est transmise à un tiers avant tout consentement. Des polices installées sur votre hébergement suppriment le sujet et accélèrent l'affichage.");

  verifier('confiance', 'moyen', youtubeSuivi,
    'Une vidéo YouTube est intégrée en mode standard.',
    'Elle dépose des traceurs publicitaires dès le chargement de la page, avant tout consentement. Le mode sans cookie existe et se règle en changeant une adresse.');

  verifier('confiance', 'mineur', !!editeurEnLigne,
    `Le site est construit avec ${editeurEnLigne}.`,
    "Le code produit n'est pas modifiable en profondeur : la vitesse, la structure et le référencement technique restent plafonnés par l'outil.");

  verifier('confiance', 'mineur', estWordpress && /wp-content\/plugins/i.test(html) && compter(/wp-content\/plugins\/([^/'"]+)/gi, html) > 10,
    "Le site empile un grand nombre d'extensions.",
    'Chaque extension ajoute du poids et une surface de panne. C\'est la première cause de site cassé après une mise à jour.');

  verifier('confiance', 'mineur', !aReseau,
    'Aucun lien vers un réseau social.',
    "Un visiteur qui veut vérifier votre activité récente n'a nulle part où aller. Une page active rassure autant qu'un avis.");

  /* ── Notation ── */
  const familles: FamilleNotee[] = FAMILLES.map(({ cle, libelle }) => {
    const propres = constats.filter((c) => c.famille === cle);
    const penalite = propres.reduce((total, c) => total + PENALITE[c.gravite], 0);
    return {
      cle,
      libelle,
      note: Math.max(0, 100 - penalite),
      points: propres.length,
      bloquants: propres.filter((c) => c.gravite === 'critique').length,
    };
  });

  const poidsTotal = FAMILLES.reduce((t, f) => t + f.poids, 0);
  const note = Math.round(
    familles.reduce((t, f, i) => t + f.note * FAMILLES[i].poids, 0) / poidsTotal,
  );

  const verdict =
    note >= 85 ? "Rien de bloquant. Les points restants relèvent du réglage fin."
    : note >= 70 ? "Les fondations sont saines. Plusieurs réglages manquants coûtent des visites et des demandes."
    : note >= 50 ? "Le site est en ligne et fonctionne, sans exploiter ce qu'il pourrait apporter."
    : note >= 30 ? "Plusieurs fondations manquent à la fois : le site est moins visité qu'il ne devrait, et transforme moins qu'il ne pourrait."
    : "La majorité des points de contrôle n'est pas tenue, et sur presque toutes les familles en même temps.";

  const ordreFamille = new Map(FAMILLES.map((f, i) => [f.cle, i]));
  const ordreGravite: Record<Gravite, number> = { critique: 0, moyen: 1, mineur: 2 };
  constats.sort(
    (a, b) =>
      (ordreFamille.get(a.famille) ?? 99) - (ordreFamille.get(b.famille) ?? 99) ||
      ordreGravite[a.gravite] - ordreGravite[b.gravite],
  );

  return {
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
    },
    constats,
  };
}

/**
 * Analyse technique d'une page d'accueil publique.
 *
 * Ce module alimente le diagnostic en libre-service. Comme l'adresse est
 * fournie par un visiteur anonyme, il faut considérer chaque entrée comme
 * hostile : sans garde-fou, un endpoint qui va chercher une URL arbitraire
 * permet d'atteindre le réseau interne de l'hébergeur (SSRF). Toutes les
 * protections sont donc appliquées avant la moindre requête sortante.
 *
 * Règle de rédaction des constats : uniquement des faits mesurés, suivis de
 * leur conséquence concrète. Jamais de jugement esthétique.
 */

import { lookup } from 'node:dns/promises';

export type Gravite = 'critique' | 'moyen' | 'mineur';

export interface Constat {
  gravite: Gravite;
  fait: string;
  consequence: string;
}

export interface Mesures {
  duree: number;
  poids: number;
  mots: number;
  images: number;
  imagesSansAlt: number;
  scripts: number;
}

export type Analyse =
  | { etat: 'ok'; hote: string; url: string; mesures: Mesures; constats: Constat[] }
  | { etat: 'constat-unique'; hote: string; url: string; constats: [Constat] }
  | { etat: 'injoignable'; hote: string; url: string; raison: string }
  | { etat: 'refuse'; raison: string };

const DELAI_MS = 12000;
const POIDS_MAX = 2 * 1024 * 1024; // au-delà, on cesse de lire : c'est déjà un constat en soi
const REDIRECTIONS_MAX = 4;
const UA = 'Mozilla/5.0 (compatible; CaelestisDiagnostic/1.0; +https://caelestis.fr)';

const SEUILS = {
  chargementLent: 2500,
  chargementCritique: 4000,
  poidsLourd: 250 * 1024,
  motsPauvre: 300,
  titreMin: 30,
  titreMax: 65,
  descriptionMin: 70,
  descriptionMax: 160,
};

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
  duree: number;
  code?: string;
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
    const minuteur = setTimeout(() => controleur.abort(), DELAI_MS);
    try {
      const reponse = await fetch(url, {
        redirect: 'manual',
        signal: controleur.signal,
        headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
      });

      if (reponse.status >= 300 && reponse.status < 400) {
        const cible = reponse.headers.get('location');
        if (!cible) return { ok: true, statut: reponse.status, urlFinale: url.href, corps: '', duree: Date.now() - debut };
        url = new URL(cible, url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return { ok: false, code: 'REDIRECTION_INVALIDE', duree: Date.now() - debut };
        }
        continue;
      }

      // Lecture plafonnée : un fichier volumineux ne doit pas saturer la fonction.
      let corps = '';
      const flux = reponse.body?.getReader();
      if (flux) {
        const decodeur = new TextDecoder('utf-8');
        let total = 0;
        while (total < POIDS_MAX) {
          const { done, value } = await flux.read();
          if (done) break;
          total += value.byteLength;
          corps += decodeur.decode(value, { stream: true });
        }
        await flux.cancel().catch(() => {});
      }

      return { ok: true, statut: reponse.status, urlFinale: url.href, corps, duree: Date.now() - debut };
    } catch (erreur: any) {
      const code = erreur?.name === 'AbortError' ? 'TIMEOUT' : (erreur?.cause?.code ?? erreur?.code ?? 'ERREUR');
      return { ok: false, code, duree: Date.now() - debut };
    } finally {
      clearTimeout(minuteur);
    }
  }

  return { ok: false, code: 'TROP_DE_REDIRECTIONS', duree: Date.now() - debut };
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

/* ══════════════════════════════════════════════════════════
   ANALYSE
══════════════════════════════════════════════════════════ */

export async function analyserSite(saisie: string): Promise<Analyse> {
  const depart = normaliserUrl(saisie);
  if (!depart) {
    return { etat: 'refuse', raison: "Cette adresse n'est pas exploitable. Saisissez une adresse de site, par exemple mon-entreprise.fr" };
  }
  if (!(await hotePublic(depart.hostname))) {
    return { etat: 'refuse', raison: "Cette adresse ne correspond pas à un site accessible publiquement." };
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

  const unique = (fait: string, consequence: string): Analyse => ({
    etat: 'constat-unique', hote, url: depart.href,
    constats: [{ gravite: 'critique', fait, consequence }],
  });

  if (!page) {
    if (certificat) {
      return unique(
        `Le certificat de sécurité de ${hote} n'est pas valide : ${certificat}.`,
        "Les navigateurs affichent un écran d'avertissement avant même d'ouvrir la page. La très grande majorité des visiteurs font demi-tour à ce moment précis.",
      );
    }
    if (erreurHttp) {
      return unique(
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
      `L'adresse ${hote} ne renvoie vers aucun site : ${vide}.`,
      'Toute personne qui cherche votre entreprise et tombe sur cette adresse repart immédiatement.',
    );
  }

  const mots = texte ? texte.split(' ').length : 0;
  const poids = Buffer.byteLength(html, 'utf8');
  const titre = extraire(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
  const description =
    extraire(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, html) ??
    extraire(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i, html);
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const h1 = compter(/<h1[\s>]/gi, html);
  const images = compter(/<img[\s>]/gi, html);
  const imagesSansAlt = (html.match(/<img\b[^>]*>/gi) ?? []).filter((b) => !/\balt\s*=/i.test(b)).length;
  const scripts = compter(/<script[^>]+src=/gi, html);
  const constats: Constat[] = [];
  const ajouter = (gravite: Gravite, fait: string, consequence: string) => constats.push({ gravite, fait, consequence });

  if (page.duree >= SEUILS.chargementCritique) {
    ajouter('critique', `La page met ${(page.duree / 1000).toFixed(1)} secondes à répondre.`,
      "Au-delà de trois secondes, une part importante des visiteurs ferme l'onglet avant d'avoir rien vu.");
  } else if (page.duree >= SEUILS.chargementLent) {
    ajouter('moyen', `La page met ${(page.duree / 1000).toFixed(1)} secondes à répondre.`,
      'Google intègre ce délai dans son classement, et les visiteurs mobiles y sont particulièrement sensibles.');
  }

  if (!viewport) {
    ajouter('critique', "Le site ne déclare pas de balise d'affichage mobile.",
      'Sur téléphone, la page apparaît en version ordinateur réduite : textes minuscules, boutons difficiles à toucher.');
  }

  if (!httpsDisponible) {
    ajouter('critique', "Le site n'est pas accessible en connexion sécurisée.",
      "Les navigateurs affichent un avertissement avant l'ouverture de la page, et Google déclasse les sites non sécurisés.");
  }

  if (!titre) {
    ajouter('critique', "La page n'a aucun titre de référencement.",
      "C'est la ligne cliquable affichée dans Google. Sans elle, le moteur en invente une.");
  } else if (titre.length < SEUILS.titreMin || titre.length > SEUILS.titreMax) {
    ajouter('moyen', `Le titre de référencement fait ${titre.length} caractères.`,
      `En dessous de ${SEUILS.titreMin} caractères il est sous-exploité, au-delà de ${SEUILS.titreMax} Google le coupe.`);
  }

  if (!description) {
    ajouter('moyen', "Aucune description n'est fournie pour les résultats de recherche.",
      'Google compose alors un extrait au hasard dans la page, souvent sans rapport avec ce que vous vendez.');
  } else if (description.length < SEUILS.descriptionMin || description.length > SEUILS.descriptionMax) {
    ajouter('mineur', `La description des résultats de recherche fait ${description.length} caractères.`,
      `La zone affichée par Google tient dans ${SEUILS.descriptionMin} à ${SEUILS.descriptionMax} caractères.`);
  }

  if (h1 === 0) {
    ajouter('moyen', "La page n'a aucun titre principal.",
      'Google s\'appuie sur ce titre pour comprendre le sujet de la page.');
  } else if (h1 > 1) {
    ajouter('mineur', `La page contient ${h1} titres principaux au lieu d'un seul.`,
      'La hiérarchie du contenu devient ambiguë pour les moteurs de recherche.');
  }

  if (images > 0 && imagesSansAlt > 0) {
    ajouter(imagesSansAlt / images > 0.5 ? 'moyen' : 'mineur',
      `${imagesSansAlt} image${imagesSansAlt > 1 ? 's' : ''} sur ${images} sans description alternative.`,
      "Ces images sont invisibles pour Google Images et pour les personnes qui naviguent avec un lecteur d'écran.");
  }

  if (mots < SEUILS.motsPauvre) {
    ajouter('moyen', `La page d'accueil contient environ ${mots} mots.`,
      'Google a peu de matière pour comprendre votre activité et vous positionner sur des recherches locales.');
  }

  if (!/href=["']tel:/i.test(html)) {
    ajouter('moyen', "Le numéro de téléphone n'est pas cliquable sur mobile.",
      'Un visiteur sur téléphone doit le recopier à la main, ce que beaucoup ne font pas.');
  }

  /* Un chemin de conversion peut très bien vivre sur une page dédiée : un bouton
     vers /contact ou /reservation compte autant qu'un formulaire sur l'accueil.
     Ne compter que les formulaires produirait un faux bloquant sur des sites
     parfaitement fonctionnels. */
  const lienConversion =
    /href=["'][^"']*\/?(contact|devis|reservation|reserver|rendez-vous|rdv|booking|prendre-rdv|nous-joindre)/i.test(html);
  if (!/<form[\s>]/i.test(html) && !/href=["']mailto:/i.test(html) && !lienConversion) {
    ajouter('critique', "Aucun moyen de vous contacter depuis la page d'accueil.",
      "Ni formulaire, ni adresse email, ni lien vers une page de contact ou de rendez-vous. Un visiteur convaincu n'a aucun moyen simple de laisser une demande.");
  } else if (!/<form[\s>]/i.test(html) && !/href=["']mailto:/i.test(html)) {
    ajouter('mineur', "La page d'accueil renvoie vers une page de contact, sans formulaire direct.",
      'Chaque clic supplémentaire avant le formulaire fait perdre une part des demandes.');
  }

  if (!/application\/ld\+json/i.test(html)) {
    ajouter('mineur', 'Le site ne déclare pas de données structurées.',
      "Ce sont ces informations qui alimentent la fiche enrichie affichée à côté des résultats Google.");
  }

  if (!/<meta[^>]+property=["']og:/i.test(html)) {
    ajouter('mineur', "Aucune image de partage n'est configurée.",
      "Quand le lien est partagé sur les réseaux ou par message, aucun visuel n'apparaît.");
  }

  if (poids > SEUILS.poidsLourd) {
    ajouter('mineur', `Le code de la page pèse ${Math.round(poids / 1024)} Ko, avec ${scripts} scripts externes.`,
      'Chaque fichier supplémentaire retarde le premier affichage, surtout en connexion mobile.');
  }

  const anneeCourante = new Date().getFullYear();
  const annees = [...html.matchAll(/(?:©|&copy;|copyright)[^0-9]{0,20}(20\d{2})/gi)].map((m) => Number(m[1]));
  if (annees.length) {
    const derniere = Math.max(...annees);
    if (anneeCourante - derniere >= 2) {
      ajouter('moyen', `La mention de copyright affiche encore ${derniere}.`,
        "Un visiteur en déduit que le site n'est plus tenu à jour, et parfois que l'entreprise ne l'est plus non plus.");
    }
  }

  const ordre: Record<Gravite, number> = { critique: 0, moyen: 1, mineur: 2 };
  constats.sort((a, b) => ordre[a.gravite] - ordre[b.gravite]);

  return {
    etat: 'ok', hote, url: page.urlFinale ?? depart.href,
    mesures: { duree: page.duree, poids, mots, images, imagesSansAlt, scripts },
    constats,
  };
}

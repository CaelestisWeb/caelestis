/**
 * Limitation de débit partagée entre les instances serverless.
 *
 * Le compteur qui vivait dans chaque endpoint était une Map en mémoire. En
 * serverless, ce n'est pas un compteur : c'est un compteur PAR INSTANCE. Vercel
 * démarre autant d'instances que nécessaire, chacune part de zéro, et une même
 * adresse IP obtient donc son quota complet sur chaque instance. Un envoi
 * soutenu en obtient plusieurs et passe. Le commentaire d'origine relevait bien
 * que `setInterval` ne survit pas au gel de la fonction, mais pas que le
 * compteur lui-même ne survit pas davantage.
 *
 * Ce module lit le compteur dans un stockage partagé quand il est configuré, et
 * retombe sinon sur la mémoire locale. Deux principes :
 *
 *   1. Ne jamais punir un visiteur pour une panne d'infrastructure. Si le
 *      stockage ne répond pas dans le délai imparti, on bascule sur la mémoire
 *      locale plutôt que de refuser l'envoi.
 *   2. Aucune dépendance npm. Vercel KV comme Upstash exposent une API REST ;
 *      un simple fetch suffit, et rien de plus n'entre dans le bundle.
 *
 * Activation : poser KV_REST_API_URL et KV_REST_API_TOKEN (Vercel KV), ou
 * UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN, dans les variables
 * d'environnement du projet. Sans elles, le comportement reste celui d'avant.
 */

export interface Verdict {
  /** L'appel est-il autorisé ? */
  autorise: boolean;
  /** Secondes à attendre avant de réessayer, quand il ne l'est pas. */
  attendreSecondes: number;
  /** Le compteur partagé a-t-il réellement été employé ? Pour le diagnostic. */
  partage: boolean;
}

const URL_KV =
  process.env.KV_REST_API_URL ??
  process.env.UPSTASH_REDIS_REST_URL ??
  '';
const JETON_KV =
  process.env.KV_REST_API_TOKEN ??
  process.env.UPSTASH_REDIS_REST_TOKEN ??
  '';

/** Au-delà, on cesse d'attendre le stockage et on tranche localement. */
const DELAI_KV_MS = 700;

/* ══════════════════════════════════════════════════════════
   REPLI : compteur local, celui d'avant
══════════════════════════════════════════════════════════ */

const memoire = new Map<string, { compte: number; expireA: number }>();

function compterEnMemoire(cle: string, fenetreMs: number, plafond: number): Verdict {
  const maintenant = Date.now();

  /* Purge opportuniste : un setInterval serait inopérant, la fonction étant
     gelée entre deux invocations. */
  if (memoire.size > 500) {
    for (const [k, v] of memoire.entries()) if (maintenant > v.expireA) memoire.delete(k);
  }

  const entree = memoire.get(cle);
  if (!entree || maintenant > entree.expireA) {
    memoire.set(cle, { compte: 1, expireA: maintenant + fenetreMs });
    return { autorise: true, attendreSecondes: 0, partage: false };
  }
  if (entree.compte >= plafond) {
    return {
      autorise: false,
      attendreSecondes: Math.ceil((entree.expireA - maintenant) / 1000),
      partage: false,
    };
  }
  entree.compte += 1;
  return { autorise: true, attendreSecondes: 0, partage: false };
}

/* ══════════════════════════════════════════════════════════
   COMPTEUR PARTAGÉ
══════════════════════════════════════════════════════════ */

/**
 * Incrémente la clé et pose son expiration en un seul aller-retour.
 *
 * `EXPIRE … NX` ne pose le délai que s'il n'y en a pas déjà : la fenêtre part
 * du premier appel et ne se prolonge pas à chaque tentative suivante, sinon un
 * visiteur insistant repousserait indéfiniment sa propre libération.
 */
async function compterEnPartage(
  cle: string,
  fenetreMs: number,
  plafond: number,
): Promise<Verdict | null> {
  const secondes = Math.ceil(fenetreMs / 1000);
  try {
    const reponse = await fetch(`${URL_KV}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JETON_KV}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', cle],
        ['EXPIRE', cle, String(secondes), 'NX'],
        ['TTL', cle],
      ]),
      signal: AbortSignal.timeout(DELAI_KV_MS),
    });
    if (!reponse.ok) return null;

    const resultats = (await reponse.json()) as Array<{ result?: unknown; error?: string }>;
    const compte = Number(resultats?.[0]?.result);
    if (!Number.isFinite(compte)) return null;

    const ttl = Number(resultats?.[2]?.result);
    const attendre = Number.isFinite(ttl) && ttl > 0 ? ttl : secondes;

    return compte > plafond
      ? { autorise: false, attendreSecondes: attendre, partage: true }
      : { autorise: true, attendreSecondes: 0, partage: true };
  } catch {
    /* Délai dépassé, réseau coupé, service indisponible : on ne bloque pas le
       visiteur, l'appelant retombera sur le compteur local. */
    return null;
  }
}

/* ══════════════════════════════════════════════════════════
   API
══════════════════════════════════════════════════════════ */

/**
 * @param identifiant  Ce qu'on limite, en général l'adresse IP.
 * @param portee       Nom de l'endpoint : chacun a son propre quota.
 * @param plafond      Nombre d'appels autorisés dans la fenêtre.
 * @param fenetreMs    Durée de la fenêtre glissante.
 */
export async function limiterDebit(
  identifiant: string,
  portee: string,
  plafond: number,
  fenetreMs: number,
): Promise<Verdict> {
  const cle = `debit:${portee}:${identifiant}`;

  if (URL_KV && JETON_KV) {
    const partage = await compterEnPartage(cle, fenetreMs, plafond);
    if (partage) return partage;
  }
  return compterEnMemoire(cle, fenetreMs, plafond);
}

/** Adresse du demandeur, telle que Vercel la transmet. */
export function adresseDemandeur(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').at(0)?.trim() ??
    'inconnue'
  );
}

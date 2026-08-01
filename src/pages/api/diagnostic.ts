import type { APIRoute } from 'astro';
import { limiterDebit, adresseDemandeur } from '../../utils/limite-debit';
import { analyserSite } from '../../utils/analyse-site';

export const prerender = false;




/* ══════════════════════════════════════════════════════════
   ORIGINES AUTORISÉES
   Cet endpoint émet des requêtes vers l'adresse que le visiteur indique. Sans
   contrôle d'origine, n'importe quel site tiers pouvait s'en servir comme
   relais pour sonder des serveurs en notre nom : les requêtes seraient parties
   de notre infrastructure, avec notre réputation d'expéditeur. Les garde-fous
   anti-SSRF d'analyse-site.ts empêchent d'atteindre un réseau privé, ils
   n'empêchaient pas ce détournement-là.
══════════════════════════════════════════════════════════ */
const ORIGINES_AUTORISEES = new Set(['https://caelestis.fr', 'https://www.caelestis.fr']);
const origineAutorisee = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ORIGINES_AUTORISEES.has(origin)) return true;
  /* En développement, le port varie selon ce qui est déjà occupé : l'imposer
     revient à casser le formulaire dès qu'un second serveur tourne. */
  return process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin);
};

const json = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const POST: APIRoute = async ({ request }) => {
  if (!origineAutorisee(request.headers.get('origin'))) {
    return json({ erreur: 'Accès non autorisé.' }, 403);
  }

  const ip = adresseDemandeur(request);

  const { autorise: allowed, attendreSecondes: retryAfterSecs } =
    await limiterDebit(ip, 'diagnostic', 8, 15 * 60 * 1000);
  if (!allowed) {
    return json(
      { erreur: `Trop d'analyses demandées. Réessayez dans ${Math.ceil(retryAfterSecs / 60)} minute(s).` },
      429,
    );
  }

  let saisie = '';
  try {
    const corps = await request.json();
    saisie = typeof corps?.url === 'string' ? corps.url : '';
  } catch {
    return json({ erreur: 'Requête illisible.' }, 400);
  }

  if (!saisie.trim()) {
    return json({ erreur: "Indiquez l'adresse de votre site." }, 400);
  }

  try {
    const analyse = await analyserSite(saisie);
    return json(analyse, analyse.etat === 'refuse' ? 400 : 200);
  } catch {
    /* Le détail technique reste côté serveur : il n'apprendrait rien d'utile
       au visiteur et renseignerait un éventuel curieux sur l'infrastructure. */
    return json({ erreur: "L'analyse n'a pas pu aboutir. Réessayez dans un instant." }, 500);
  }
};

/** Le diagnostic n'a de sens qu'en POST : on répond clairement aux autres méthodes. */
export const GET: APIRoute = () => json({ erreur: 'Méthode non autorisée.' }, 405);

import type { APIRoute } from 'astro';
import { limiterDebit, adresseDemandeur } from '../../utils/limite-debit';
import { parcourirPages, PAGES_PAR_PAQUET } from '../../utils/analyse-site';

export const prerender = false;

/* ══════════════════════════════════════════════════════════
   SECOND TEMPS DU DIAGNOSTIC

   La première requête lit la page d'accueil et renvoie la liste du reste du
   site. Le navigateur redemande ensuite ces pages par petits paquets, et cet
   endpoint les lit. Le découpage n'est pas un confort : une fonction serveur
   s'arrête au bout de quelques secondes, alors qu'un site de soixante pages
   servi par un hébergement lent demande bien davantage. Chaque appel reste
   court, et le visiteur voit la lecture avancer.

   Les adresses viennent du navigateur, donc d'une source qu'il faut tenir pour
   hostile. Deux verrous : le contrôle d'origine ci-dessous, et dans
   `parcourirPages`, l'obligation pour chaque adresse d'appartenir au domaine
   déjà analysé. Sans le second, l'outil deviendrait un moyen de frapper
   n'importe quel serveur depuis notre infrastructure.
══════════════════════════════════════════════════════════ */

const ORIGINES_AUTORISEES = new Set(['https://caelestis.fr', 'https://www.caelestis.fr']);
const origineAutorisee = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ORIGINES_AUTORISEES.has(origin)) return true;
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
  /* Un site complet représente une dizaine de paquets. Le quota les couvre
     largement, tout en empêchant de se servir de l'outil comme d'un robot. */
  const { autorise, attendreSecondes } = await limiterDebit(ip, 'diagnostic-pages', 120, 15 * 60 * 1000);
  if (!autorise) {
    return json(
      { erreur: `Trop de pages demandées. Réessayez dans ${Math.ceil(attendreSecondes / 60)} minute(s).` },
      429,
    );
  }

  let site = '';
  let pages: string[] = [];
  try {
    const corps = await request.json();
    site = typeof corps?.url === 'string' ? corps.url : '';
    pages = Array.isArray(corps?.pages)
      ? corps.pages.filter((p: unknown): p is string => typeof p === 'string' && p.length < 500)
      : [];
  } catch {
    return json({ erreur: 'Requête illisible.' }, 400);
  }

  if (!site.trim() || pages.length === 0) {
    return json({ erreur: 'Requête incomplète.' }, 400);
  }

  try {
    const resultat = await parcourirPages(site, pages.slice(0, PAGES_PAR_PAQUET));
    return json(resultat, resultat.etat === 'refuse' ? 400 : 200);
  } catch {
    /* Le détail technique reste côté serveur. Un paquet qui échoue ne doit pas
       faire échouer l'analyse entière : le navigateur passe au suivant. */
    return json({ etat: 'ok', pages: [] });
  }
};

export const GET: APIRoute = () => json({ erreur: 'Méthode non autorisée.' }, 405);

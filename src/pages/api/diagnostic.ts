import type { APIRoute } from 'astro';
import { analyserSite } from '../../utils/analyse-site';

export const prerender = false;

/* ══════════════════════════════════════════════════════════
   RATE LIMITING en mémoire (par IP, fenêtre glissante 15 min)
   Limite : 8 analyses par IP sur 15 minutes.
   Plus permissif que le formulaire de contact (un visiteur teste
   souvent deux ou trois adresses), mais suffisamment bas pour que
   l'endpoint ne serve pas de relais de scan.
══════════════════════════════════════════════════════════ */
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 8;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  /* Purge opportuniste : un setInterval serait inopérant en serverless,
     la fonction étant gelée entre deux invocations. */
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap.entries()) if (now > v.resetAt) rateLimitMap.delete(k);
  }
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }
  if (entry.count >= RATE_MAX) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSecs: 0 };
}

const json = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const POST: APIRoute = async ({ request }) => {
  const ip =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').at(0)?.trim() ??
    'unknown';

  const { allowed, retryAfterSecs } = checkRateLimit(ip);
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

import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Transmission d'un prospect entrant au hub interne.
 *
 * Le secret partagé ne quitte jamais le serveur : la page appelle cette route,
 * qui appelle le hub. Si la liaison n'est pas configurée, la demande du
 * visiteur ne doit surtout pas échouer bruyamment, il n'y est pour rien.
 */

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap.entries()) if (now > v.resetAt) rateLimitMap.delete(k);
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count += 1;
  return true;
}

const json = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const emailPlausible = (valeur: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(valeur);

export const POST: APIRoute = async ({ request }) => {
  const ip =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').at(0)?.trim() ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return json({ erreur: 'Trop de demandes. Réessayez dans quelques minutes.' }, 429);
  }

  let corps: Record<string, unknown>;
  try {
    corps = await request.json();
  } catch {
    return json({ erreur: 'Requête illisible.' }, 400);
  }

  const email = typeof corps.email === 'string' ? corps.email.trim().slice(0, 200) : '';
  if (!email || !emailPlausible(email)) {
    return json({ erreur: 'Indiquez une adresse email valide.' }, 400);
  }

  const nom = typeof corps.nom === 'string' ? corps.nom.trim().slice(0, 200) : '';
  const site = typeof corps.site === 'string' ? corps.site.trim().slice(0, 300) : '';
  const resume = typeof corps.resume === 'string' ? corps.resume.trim().slice(0, 1500) : '';

  const urlHub = import.meta.env.HUB_LEADS_URL;
  const secret = import.meta.env.HUB_LEADS_SECRET;

  /* Liaison non configurée : on l'enregistre côté serveur pour ne pas perdre la
     demande, et on répond normalement au visiteur. Une erreur affichée ici lui
     donnerait le sentiment que sa demande n'est pas passée. */
  if (!urlHub || !secret) {
    console.warn('[lead] liaison hub non configurée, demande reçue sans transmission :', email);
    return json({ ok: true, transmis: false });
  }

  try {
    const reponse = await fetch(urlHub, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-caelestis-ingest': secret,
      },
      body: JSON.stringify({
        email,
        nom: nom || undefined,
        site_web: site || undefined,
        source: 'diagnostic',
        notes: [
          `Demande issue du diagnostic en ligne le ${new Date().toLocaleDateString('fr-FR')}.`,
          site && `Site analysé : ${site}`,
          resume && `Résultat : ${resume}`,
        ]
          .filter(Boolean)
          .join('\n'),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!reponse.ok) {
      console.error('[lead] le hub a refusé la demande, code', reponse.status);
      return json({ ok: true, transmis: false });
    }
    return json({ ok: true, transmis: true });
  } catch (erreur) {
    console.error('[lead] transmission au hub impossible :', erreur);
    return json({ ok: true, transmis: false });
  }
};

export const GET: APIRoute = () => json({ erreur: 'Méthode non autorisée.' }, 405);

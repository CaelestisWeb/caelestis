import type { APIRoute } from 'astro';
import { limiterDebit, adresseDemandeur } from '../../utils/limite-debit';

export const prerender = false;

/**
 * Transmission d'un prospect entrant au hub interne.
 *
 * Le secret partagé ne quitte jamais le serveur : la page appelle cette route,
 * qui appelle le hub. Si la liaison n'est pas configurée, la demande du
 * visiteur ne doit surtout pas échouer bruyamment, il n'y est pour rien.
 */




/* ══════════════════════════════════════════════════════════
   ORIGINES AUTORISÉES
   Sans ce contrôle, un tiers pouvait injecter des prospects fictifs dans le hub
   interne depuis n'importe où : le secret partagé ne protège que la liaison
   vers le hub, pas l'entrée de cette route.
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

const emailPlausible = (valeur: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(valeur);

export const POST: APIRoute = async ({ request }) => {
  if (!origineAutorisee(request.headers.get('origin'))) {
    return json({ erreur: 'Accès non autorisé.' }, 403);
  }

  const ip = adresseDemandeur(request);

  const { autorise } = await limiterDebit(ip, 'lead', 5, 15 * 60 * 1000);
  if (!autorise) {
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

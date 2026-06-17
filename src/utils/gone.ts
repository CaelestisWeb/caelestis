import type { APIRoute } from 'astro';

/* ══════════════════════════════════════════════════════════════════
   410 GONE — handler partagé pour les anciennes URLs du site WordPress
   qui occupait jadis ce domaine (communauté « Caelestis Concilium »,
   WoW), encore présentes dans l'index Google. On renvoie 410
   (« définitivement disparu ») plutôt que 404 : Google désindexe plus
   vite, ce qui accélère la bascule vers le site actuel.

   Utilisé par des endpoints catch-all (/category, /tag, /page, …) car,
   sur Vercel, le middleware ne s'exécute pas pour les URLs inconnues
   (404 statique servi sans invoquer la fonction). Une vraie route SSR,
   elle, garantit l'invocation de la fonction.
══════════════════════════════════════════════════════════════════ */
const GONE_BODY = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <title>Page supprimée — Caelestis</title>
</head>
<body>
  <h1>410 — Cette page n'existe plus</h1>
  <p>Ce contenu a été définitivement supprimé. <a href="https://caelestis.fr/">Retour à l'accueil</a>.</p>
</body>
</html>`;

export const gone: APIRoute = () =>
  new Response(GONE_BODY, {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  });

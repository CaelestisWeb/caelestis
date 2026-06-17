import { defineMiddleware } from 'astro:middleware';

/* ══════════════════════════════════════════════════════════════════
   410 GONE — anciennes URLs du site WordPress qui occupait jadis ce
   domaine (communauté « Caelestis Concilium », WoW). Google les a
   encore en index. On renvoie 410 (« définitivement disparu ») plutôt
   que 404 (« introuvable ») : ça accélère la désindexation de l'ancien
   contenu et la bascule vers le site actuel.

   Aucune route réelle du site n'utilise ces préfixes (pages : /services,
   /simulateur, /a-propos, /contact, /mentions-legales, /cgv,
   /politique-confidentialite, /questionnaire-*, /maintenance + /api).
══════════════════════════════════════════════════════════════════ */
const GONE_PATTERNS: RegExp[] = [
  /^\/category(\/|$)/,
  /^\/tag(\/|$)/,
  /^\/page(\/|$)/,
  /^\/author(\/|$)/,
  /^\/comments(\/|$)/,
  /^\/feed(\/|$)/,
  /^\/wp-/,
  /^\/xmlrpc\.php$/,
];

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

export const onRequest = defineMiddleware((context, next) => {
  const path = context.url.pathname;
  if (GONE_PATTERNS.some((re) => re.test(path))) {
    return new Response(GONE_BODY, {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    });
  }
  return next();
});

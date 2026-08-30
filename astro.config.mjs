// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import typographieFrancaise from './integrations/typographie-francaise.mjs';
import { existsSync, readFileSync } from 'node:fs';

/* Dates de dernière modification pour le sitemap. Produites par
   `npm run lastmod`, commitées. Absentes, le sitemap se construit sans elles. */
const CHEMIN_LASTMOD = new URL('./src/data/lastmod.json', import.meta.url);
const datesDeModification = existsSync(CHEMIN_LASTMOD)
  ? JSON.parse(readFileSync(CHEMIN_LASTMOD, 'utf8'))
  : {};

// https://astro.build/config
export default defineConfig({
  site: 'https://caelestis.fr',
  // output: 'static' est le défaut dans Astro 6 — il gère désormais
  // le mode hybride nativement (pages statiques + endpoints SSR via prerender:false)
  adapter: vercel(),
  integrations: [
    sitemap({
      // Exclure toutes les pages noindex : légales, outils internes, API
      filter: (page) =>
        !page.includes('/cgv') &&
        !page.includes('/mentions-legales') &&
        !page.includes('/politique-confidentialite') &&
        !page.includes('/demos/') &&
        !page.includes('/api/') &&
        !page.includes('/questionnaire-client') &&
        !page.includes('/questionnaire-devis') &&
        // Pages de travail (comparaisons de variantes) : en noindex, donc hors sitemap.
        // Une URL noindex listee dans le sitemap est remontee en erreur par Search Console.
        !page.includes('/zz-'),
      /* Ni changefreq ni priority : Google déclare publiquement les ignorer, et
         les émettre revient à remplir le sitemap de bruit. Seul `lastmod` est
         lu, c'est donc la seule chose qu'on émet.

         Les dates viennent de src/data/lastmod.json, produit par
         `npm run lastmod` et commité (le clone de Vercel est trop peu profond
         pour que `git log` y réponde). Une page absente du fichier sort sans
         lastmod : mieux vaut pas de date qu'une date inventée, un lastmod faux
         finit par être ignoré en bloc. */
      serialize(item) {
        const date = datesDeModification[item.url];
        return date ? { ...item, lastmod: date } : item;
      },
    }),
    /* Espaces insécables devant ; : ? ! » et entre un nombre et son unité.
       Posées au build : invisibles dans l'éditeur, elles ne survivraient pas
       dans les sources. Voir integrations/typographie-francaise.mjs. */
    typographieFrancaise(),
  ],
  // Normaliser les URLs : pas de slash final (évite /page vs /page/)
  trailingSlash: 'never',
  compressHTML: true,
  // Prefetch au survol des liens — améliore la navigation perçue (View Transitions)
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: false,
  },
  build: {
    /* Inline le CSS dans le <head> plutôt que de le servir en <link rel="stylesheet">
       bloquant le rendu. Lighthouse relevait deux feuilles critiques (global + CSS
       de page, ~24 Kio) qui retardaient le premier rendu de ~120 ms, mobile comme
       desktop. En inline, le CSS arrive avec le HTML : zéro requête bloquante, FCP/LCP
       plus rapides. Le HTML est compressé (brotli) par Vercel, donc le surcoût réel
       est de quelques Kio par page. Autorisé par la CSP : style-src porte déjà
       'unsafe-inline' (voir vercel.json). */
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Ne jamais inliner les scripts « hoisted » dans le HTML : ils restent des
      // fichiers /_astro/*.js (donc 'self' au sens CSP). Cela permet de retirer
      // 'unsafe-inline' de script-src (voir vercel.json) sans devoir hacher un jeu
      // de scripts de composants qui change à chaque build. Ne restent inline que
      // les 2 scripts is:inline de BaseLayout (failsafe reveal, GA4), au contenu
      // fixe et donc au hash stable. Les autres assets (CSS, polices, images)
      // gardent le comportement par défaut : la fonction renvoie undefined, ce qui
      // retombe sur le seuil standard de 4096 octets.
      assetsInlineLimit: (assetPath) =>
        assetPath.endsWith('.js') || assetPath.endsWith('.mjs') ? false : undefined,
    },
  },
});

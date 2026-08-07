// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import typographieFrancaise from './integrations/typographie-francaise.mjs';

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
      changefreq: 'monthly',
      priority: 0.7,
      // Priorités différenciées par importance stratégique
      serialize(item) {
        if (item.url === 'https://caelestis.fr/') {
          return { ...item, changefreq: /** @type {any} */ ('weekly'), priority: 1.0 };
        }
        if (['/services', '/simulateur', '/contact'].some(p => item.url.endsWith(p))) {
          return { ...item, changefreq: /** @type {any} */ ('monthly'), priority: 0.9 };
        }
        return item;
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

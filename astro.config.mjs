// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

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
        !page.includes('/maintenance'),
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
  },
});

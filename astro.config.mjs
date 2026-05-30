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
      // Exclure toutes les pages noindex : légales, demos, API
      filter: (page) =>
        !page.includes('/cgv') &&
        !page.includes('/mentions-legales') &&
        !page.includes('/politique-confidentialite') &&
        !page.includes('/demos/') &&
        !page.includes('/api/'),
      changefreq: 'monthly',
      priority: 0.7,
    }),
  ],
  // Normaliser les URLs : pas de slash final (évite /page vs /page/)
  trailingSlash: 'never',
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
});

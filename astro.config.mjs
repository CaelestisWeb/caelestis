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
      // Exclure pages légales non-indexées et l'API
      filter: (page) =>
        !page.includes('/cgv') &&
        !page.includes('/api/'),
      changefreq: 'monthly',
      priority: 0.7,
      customPages: ['https://caelestis.fr/'],
    }),
  ],
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
});

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // output: 'static' est le défaut dans Astro 6 — il gère désormais
  // le mode hybride nativement (pages statiques + endpoints SSR via prerender:false)
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  }
});

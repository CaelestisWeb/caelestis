// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',   // Pages statiques par défaut, sauf les endpoints API
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  }
});

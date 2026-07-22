import type { APIRoute } from 'astro';

/* ══════════════════════════════════════════════════════════════════
   301 MOVED PERMANENTLY — handler partagé pour NOS anciennes URLs
   internes qui ont changé d'adresse mais restent dans l'index Google.

   À ne pas confondre avec le 410 (voir gone.ts), réservé au contenu
   du site WordPress disparu. Ici la page existe toujours, ailleurs :
   on transfère donc les visiteurs ET l'antériorité SEO vers la
   nouvelle adresse, au lieu de les perdre sur une 404.

   Même contrainte que pour le 410 : sur Vercel, le middleware ne
   s'exécute pas pour les URLs inconnues (404 statique servi sans
   invoquer la fonction). Il faut une vraie route SSR.

   Le Cache-Control borne la mise en cache : sans lui, les navigateurs
   gardent un 301 quasi indéfiniment, ce qui rend tout retour arrière
   très pénible.
══════════════════════════════════════════════════════════════════ */
export const movedTo =
  (destination: string): APIRoute =>
  () =>
    new Response(null, {
      status: 301,
      headers: {
        Location: destination,
        'Cache-Control': 'public, max-age=3600',
      },
    });

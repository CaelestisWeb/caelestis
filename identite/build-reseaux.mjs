/* Visuels des reseaux sociaux, ecrits dans identite/reseaux/ :
   - avatar-1080.png          photo de profil, monogramme seul (la charte reserve
                              le monogramme aux avatars : un mot entier n'est pas
                              lisible a 40 px, et Facebook rogne en cercle)
   - profil-page-720.png      meme visuel en 720, format demande par les Pages
   - couverture-1640x720.png  couverture de profil et de Page
   Relancer apres toute evolution de la charte : node identite/build-reseaux.mjs */

import { mkdirSync } from 'node:fs';
import sharp from 'sharp';
import { police, trace, monogramme, LOCKUP, DECALAGE_OPTIQUE_MONO, VERT } from './lib-traces.mjs';

const SORTIE = 'C:/dev/caelestis/identite/reseaux';
mkdirSync(SORTIE, { recursive: true });

const f500 = police(500);
const f400 = police(400);

/* ── Avatar : le C centre, cale pour tenir dans le cercle inscrit ────── */
const A = 1080;
const TAILLE_MONO = 560;
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="${A}" height="${A}" viewBox="0 0 ${A} ${A}">
  <rect width="${A}" height="${A}" fill="${VERT}"/>
  ${monogramme((A - TAILLE_MONO) / 2 + TAILLE_MONO * DECALAGE_OPTIQUE_MONO, (A - TAILLE_MONO) / 2, TAILLE_MONO)}
</svg>`;

await sharp(Buffer.from(avatar)).png().toFile(`${SORTIE}/avatar-1080.png`);
await sharp(Buffer.from(avatar)).resize(720, 720).png().toFile(`${SORTIE}/profil-page-720.png`);

/* ── Couverture, 1640 x 720 ───────────────────────────────────────────
   Facebook rogne trois fois : 48 px en haut et en bas sur ordinateur,
   180 px a gauche et a droite sur telephone, et la photo de profil
   recouvre le coin bas gauche. Tout est donc centre, dans la bande
   horizontale 180-1460 et verticale 150-520. */
const L = 1640;
const H = 720;
const TUILE = 132;

const mot = trace(f500, 'Caelestis', TUILE * LOCKUP.mot, {
  x: 0,
  y: 0,
  ls: LOCKUP.interlettrage * TUILE * LOCKUP.mot,
});
const largeurLockup = TUILE + TUILE * LOCKUP.ecart + mot.avance;
const gaucheLockup = (L - largeurLockup) / 2;
const HAUT_TUILE = 214;

const motPlace = trace(f500, 'Caelestis', TUILE * LOCKUP.mot, {
  x: gaucheLockup + TUILE + TUILE * LOCKUP.ecart,
  y: HAUT_TUILE + TUILE * LOCKUP.baseline,
  ls: LOCKUP.interlettrage * TUILE * LOCKUP.mot,
});

const PROMESSE = 'Des sites web pour ceux qui créent, cultivent et bâtissent avec passion.';
const mesure = trace(f400, PROMESSE, 34);
const promesse = trace(f400, PROMESSE, 34, {
  x: (L - mesure.avance) / 2,
  y: 470,
  opacite: 0.9,
});

const couverture = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">
  <rect width="${L}" height="${H}" fill="${VERT}"/>
  ${monogramme(gaucheLockup, HAUT_TUILE, TUILE)}
  ${motPlace.markup}
  ${promesse.markup}
</svg>`;

await sharp(Buffer.from(couverture)).png().toFile(`${SORTIE}/couverture-1640x720.png`);

console.log('identite/reseaux : avatar-1080.png, profil-page-720.png, couverture-1640x720.png');

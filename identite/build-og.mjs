/* Image de partage (Open Graph) du site : public/og-image.jpg, 1200 x 630.
   Relancer apres toute evolution de la charte : node identite/build-og.mjs */

import sharp from 'sharp';
import { police, trace, monogramme, LOCKUP, VERT, CREME } from './lib-traces.mjs';

const RACINE = 'C:/dev/caelestis';

const f500 = police(500);
const f400 = police(400);
const f700 = police(700);

const MARGE = 92;

/* Lockup horizontal, proportions de identite/build-logos.mjs */
const TUILE = 126;
const TAILLE_MOT = +(TUILE * LOCKUP.mot).toFixed(2);
const HAUT_TUILE = 158;
const BASELINE = +(HAUT_TUILE + TUILE * LOCKUP.baseline).toFixed(2);

const mot = trace(f500, 'Caelestis', TAILLE_MOT, {
  x: MARGE + TUILE + TUILE * LOCKUP.ecart,
  y: BASELINE,
  ls: LOCKUP.interlettrage * TAILLE_MOT,
});

/* Promesse, deux lignes, Satoshi 400 */
const promesse1 = trace(f400, 'Des sites web pour ceux qui créent,', 40, { x: MARGE, y: 372, opacite: 0.92 });
const promesse2 = trace(f400, 'cultivent et bâtissent avec passion.', 40, { x: MARGE, y: 424, opacite: 0.92 });

/* Pied : adresse du site a gauche, activite a droite */
const site = trace(f700, 'caelestis.fr', 24, { x: MARGE, y: 552, ls: 0.5 });
const activite = trace(f400, 'Création de sites internet et référencement naturel, Drôme', 22, { x: 0, y: 552, opacite: 0.72 });
const activiteX = 1200 - MARGE - activite.avance;
const activitePlace = trace(f400, 'Création de sites internet et référencement naturel, Drôme', 22, {
  x: activiteX,
  y: 552,
  opacite: 0.72,
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${VERT}"/>
  ${monogramme(MARGE, HAUT_TUILE, TUILE)}
  ${mot.markup}
  ${promesse1.markup}
  ${promesse2.markup}
  <rect x="${MARGE}" y="504" width="${1200 - MARGE * 2}" height="1" fill="${CREME}" opacity="0.22"/>
  ${site.markup}
  ${activitePlace.markup}
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
  .toFile(`${RACINE}/public/og-image.jpg`);

console.log('public/og-image.jpg regenere, 1200 x 630');

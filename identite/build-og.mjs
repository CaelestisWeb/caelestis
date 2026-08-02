/* Image de partage (Open Graph) du site : public/og-image.jpg, 1200 x 630.
   Le texte est converti en trace avec fontkit : sharp ne resout pas les @font-face
   embarquees, un <text> ne serait pas rendu. Relancer apres toute evolution de la
   charte : node identite/build-og.mjs */

import * as fontkit from '../node_modules/fontkit/dist/module.mjs';
import sharp from 'sharp';

const RACINE = 'C:/dev/caelestis';
const FONTS = `${RACINE}/src/assets/fonts`;

const VERT = '#255C41';
const CREME = '#FCFBF8';

const f500 = fontkit.openSync(`${FONTS}/satoshi-500.woff2`);
const f400 = fontkit.openSync(`${FONTS}/satoshi-400.woff2`);
const f700 = fontkit.openSync(`${FONTS}/satoshi-700.woff2`);

/* Texte en traces. Renvoie le markup et la largeur d'encre, letter-spacing en px. */
function trace(font, texte, taille, { x = 0, y = 0, couleur = CREME, ls = 0, opacite = 1 } = {}) {
  const k = taille / font.unitsPerEm;
  const run = font.layout(texte);
  let plume = 0;
  let gauche = Infinity;
  let droite = -Infinity;
  const chemins = [];

  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const px = plume + (p.xOffset || 0) * k;
    const d = g.path.toSVG();
    if (d) chemins.push(`<path transform="translate(${(x + px).toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(5)} ${(-k).toFixed(5)})" d="${d}"/>`);
    if (g.bbox && g.bbox.width > 0) {
      gauche = Math.min(gauche, px + g.bbox.minX * k);
      droite = Math.max(droite, px + g.bbox.maxX * k);
    }
    plume += p.xAdvance * k + ls;
  });

  return {
    markup: `<g fill="${couleur}"${opacite < 1 ? ` opacity="${opacite}"` : ''}>${chemins.join('')}</g>`,
    largeur: +(droite - gauche).toFixed(2),
    avance: +plume.toFixed(2),
  };
}

/* Monogramme : meme geometrie que identite/build-logos.mjs, tuile de 100 */
const monogramme = (x, y, taille) => {
  const e = taille / 100;
  return `<g transform="translate(${x} ${y}) scale(${e})">
    <path d="M67.66 27 A29 29 0 1 0 67.66 73" fill="none" stroke="${CREME}" stroke-width="15"/>
  </g>`;
};

const MARGE = 92;

/* Lockup horizontal, proportions de identite/build-logos.mjs pour une tuile de 100 :
   mot a 82 % de la tuile, ecart de 28 %, baseline a 79,52 % sous le haut de la tuile. */
const TUILE = 126;
const TAILLE_MOT = +(TUILE * 0.82).toFixed(2);
const HAUT_TUILE = 158;
const BASELINE = +(HAUT_TUILE + TUILE * 0.7952).toFixed(2);

const mot = trace(f500, 'Caelestis', TAILLE_MOT, {
  x: MARGE + TUILE + TUILE * 0.28,
  y: BASELINE,
  ls: -0.02 * TAILLE_MOT,
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

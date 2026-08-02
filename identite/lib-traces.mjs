/* Outils communs aux visuels rasterises (image de partage, reseaux sociaux).
   sharp ne resout pas les @font-face embarquees dans un SVG : un <text> ne
   serait pas rendu. Le texte est donc converti en traces avec fontkit. */

import * as fontkit from '../node_modules/fontkit/dist/module.mjs';

const FONTS = 'C:/dev/caelestis/src/assets/fonts';

export const VERT = '#255C41';
export const CREME = '#FCFBF8';
export const ENCRE = '#12160F';

export const police = (poids) => fontkit.openSync(`${FONTS}/satoshi-${poids}.woff2`);

/* Texte en traces. `ls` est l'interlettrage en pixels, comme letter-spacing. */
export function trace(font, texte, taille, { x = 0, y = 0, couleur = CREME, ls = 0, opacite = 1 } = {}) {
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

/* Monogramme : C ouvert, geometrie de identite/build-logos.mjs pour une tuile de 100 */
export const monogramme = (x, y, taille, couleur = CREME) => `<g transform="translate(${x} ${y}) scale(${(taille / 100).toFixed(5)})">
    <path d="M67.66 27 A29 29 0 1 0 67.66 73" fill="none" stroke="${couleur}" stroke-width="15"/>
  </g>`;

/* Proportions du lockup horizontal, tuile de reference a 100 :
   mot a 82 %, ecart a 28 %, baseline a 79,52 % sous le haut de la tuile. */
export const LOCKUP = { mot: 0.82, ecart: 0.28, baseline: 0.7952, interlettrage: -0.02 };

/* L'encre du C ouvert n'occupe pas toute sa tuile : le trajet passe par la
   gauche, l'ouverture est a droite. Pour une tuile de 100 l'encre va de 13,5 a
   72,2, son milieu tombe donc a 42,85 et non a 50. Centrer la tuile laisse le
   monogramme visiblement decale a gauche : compenser de DECALAGE_OPTIQUE_MONO
   pour cent de la taille des qu'il est pose seul (avatar, tampon, filigrane). */
export const DECALAGE_OPTIQUE_MONO = 0.0715;

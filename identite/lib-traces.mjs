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
  let haut = Infinity;
  let bas = -Infinity;
  const chemins = [];

  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const px = plume + (p.xOffset || 0) * k;
    const d = g.path.toSVG();
    if (d) chemins.push(`<path transform="translate(${(x + px).toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(5)} ${(-k).toFixed(5)})" d="${d}"/>`);
    if (g.bbox && g.bbox.width > 0) {
      gauche = Math.min(gauche, px + g.bbox.minX * k);
      droite = Math.max(droite, px + g.bbox.maxX * k);
      // L'axe des ordonnees de la police monte, celui du SVG descend : maxY donne le haut.
      haut = Math.min(haut, -g.bbox.maxY * k);
      bas = Math.max(bas, -g.bbox.minY * k);
    }
    plume += p.xAdvance * k + ls;
  });

  return {
    markup: `<g fill="${couleur}"${opacite < 1 ? ` opacity="${opacite}"` : ''}>${chemins.join('')}</g>`,
    largeur: +(droite - gauche).toFixed(2),
    avance: +plume.toFixed(2),
    // Boite d'encre reelle, relative au point (x, y) demande. Sert a cadrer un
    // fichier au plus juste : un logo doit toucher les bords de son viewBox.
    gauche: +gauche.toFixed(2),
    droite: +droite.toFixed(2),
    haut: +haut.toFixed(2),
    bas: +bas.toFixed(2),
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
   gauche, l'ouverture est a droite. En fraction de la tuile, elle va de 0,135
   a 0,722 en largeur et de 0,135 a 0,865 en hauteur. Son milieu horizontal
   tombe donc a 0,4285 et non a 0,5. */
export const ENCRE_MONO = { x0: 0.135, x1: 0.722, y0: 0.135, y1: 0.865 };

/* Poser la tuile centree laisse le C visiblement decale a gauche : le decaler
   de DECALAGE_OPTIQUE_MONO fois la taille recentre son encre. A appliquer des
   que le C est pose, dans une tuile comme seul (avatar, tampon, filigrane). */
export const DECALAGE_OPTIQUE_MONO = +((1 - ENCRE_MONO.x0 - ENCRE_MONO.x1) / 2).toFixed(4);

/* Boite d'encre du C, en unites, pour une tuile de `taille` posee en (x, y)
   avec le decalage de recentrage applique. */
export const boiteMono = (x, y, taille) => ({
  x0: x + taille * (DECALAGE_OPTIQUE_MONO + ENCRE_MONO.x0),
  x1: x + taille * (DECALAGE_OPTIQUE_MONO + ENCRE_MONO.x1),
  y0: y + taille * ENCRE_MONO.y0,
  y1: y + taille * ENCRE_MONO.y1,
});

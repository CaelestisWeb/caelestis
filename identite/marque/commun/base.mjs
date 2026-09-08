/* Bibliotheque commune aux series de recherche et au signe retenu.

   Palette de la charte, ouverture des polices, conversion du texte en traces,
   et les quelques primitives geometriques partagees. Une serie n'ecrit que
   ses signes, ses reperes de construction et son texte : tout le reste vient
   d'ici, de artefacts.mjs et de fabrique.mjs, ce qui les empeche de diverger
   en silence.

   Les chemins sont resolus depuis import.meta.url et non ecrits en dur : ces
   fichiers se lancent sur le poste comme sur une machine d'integration. */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as fontkit from 'fontkit';

const ICI = dirname(fileURLToPath(import.meta.url));
export const RACINE = resolve(ICI, '../../..');
const FONTS = resolve(RACINE, 'src/assets/fonts');

/* Palette de la charte, aucune valeur inventee. */
export const VERT = '#255C41';
export const VERT_PROFOND = '#1B4733';
export const MOUSSE_TEXTE = '#2E7452';
export const MOUSSE = '#B8C4BB';
export const LIN = '#E3EFE8';
export const CREME = '#FCFBF8';
export const PARCHEMIN = '#E6E4DC';
export const PIERRE = '#5C6259';
export const ENCRE = '#12160F';

export const police = (poids) => fontkit.openSync(`${FONTS}/satoshi-${poids}.woff2`);

/* Texte en traces et non en <text> : un SVG qui
   embarque sa police ne s'affiche qu'en navigateur, ailleurs le mot deborde. */
export function trace(font, texte, taille, { x = 0, y = 0, couleur = VERT, ls = 0 } = {}) {
  const k = taille / font.unitsPerEm;
  const run = font.layout(texte);
  let plume = 0;
  let gauche = Infinity, droite = -Infinity, haut = Infinity, bas = -Infinity;
  const chemins = [];

  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const px = plume + (p.xOffset || 0) * k;
    const d = g.path.toSVG();
    if (d) chemins.push(`<path transform="translate(${(x + px).toFixed(3)} ${y.toFixed(3)}) scale(${k.toFixed(6)} ${(-k).toFixed(6)})" d="${d}"/>`);
    if (g.bbox && g.bbox.width > 0) {
      gauche = Math.min(gauche, px + g.bbox.minX * k);
      droite = Math.max(droite, px + g.bbox.maxX * k);
      haut = Math.min(haut, -g.bbox.maxY * k);
      bas = Math.max(bas, -g.bbox.minY * k);
    }
    plume += p.xAdvance * k + ls;
  });

  return {
    markup: `<g fill="${couleur}">${chemins.join('')}</g>`,
    gauche: +gauche.toFixed(3), droite: +droite.toFixed(3),
    haut: +haut.toFixed(3), bas: +bas.toFixed(3),
    largeur: +(droite - gauche).toFixed(3),
    hauteur: +(bas - haut).toFixed(3),
  };
}

export const rad = (deg) => (deg * Math.PI) / 180;
export const surCercle = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

/* Arc ouvert, ouverture centree sur `ouvertureDeg`, de `gapDeg` degres.
   Convention identique au monogramme actuel : sweep 0, grand arc. */
export function arcOuvert(cx, cy, r, gapDeg, ouvertureDeg = 0) {
  const [x1, y1] = surCercle(cx, cy, r, ouvertureDeg - gapDeg / 2);
  const [x2, y2] = surCercle(cx, cy, r, ouvertureDeg + gapDeg / 2);
  const grand = 360 - gapDeg > 180 ? 1 : 0;
  return `M${x1.toFixed(3)} ${y1.toFixed(3)}A${r} ${r} 0 ${grand} 0 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
}


export const INTERLETTRAGE = -0.02;   // reglage de la charte, en em

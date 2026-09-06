/* Cinq pistes de logotype pour Caelestis, septembre 2026.

   Chaque piste est un signe different, pas une variante du meme : un arc pose
   sur un horizon, des cernes de croissance, une ligature latine, une arche,
   une etoile de reperage. Toutes tiennent dans la palette de la charte et dans
   la meme discipline de trait.

   Les chemins sont resolus depuis import.meta.url et non ecrits en dur : ces
   fichiers se lancent sur le poste comme sur une machine d'integration.

   Fabrication : node identite/pistes-logo/build-pistes.mjs
   Planche     : node identite/pistes-logo/build-planche.mjs */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as fontkit from 'fontkit';

const ICI = dirname(fileURLToPath(import.meta.url));
export const RACINE = resolve(ICI, '../..');
export const DOSSIER = ICI;
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

/* Texte en traces, meme principe que identite/lib-traces.mjs : un SVG qui
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

const rad = (deg) => (deg * Math.PI) / 180;
const surCercle = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

/* Arc ouvert, ouverture centree sur `ouvertureDeg`, de `gapDeg` degres.
   Convention identique au monogramme actuel : sweep 0, grand arc. */
function arcOuvert(cx, cy, r, gapDeg, ouvertureDeg = 0) {
  const [x1, y1] = surCercle(cx, cy, r, ouvertureDeg - gapDeg / 2);
  const [x2, y2] = surCercle(cx, cy, r, ouvertureDeg + gapDeg / 2);
  const grand = 360 - gapDeg > 180 ? 1 : 0;
  return `M${x1.toFixed(3)} ${y1.toFixed(3)}A${r} ${r} 0 ${grand} 0 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
}

/* ══════════════════════════════════════════════════════════════
   Les cinq signes. Chacun se dessine dans un carre de 100 unites.
   ══════════════════════════════════════════════════════════════ */

/* 1. L'aube : le disque se leve, l'horizon lui coupe le pied. L'arc est
      celui du monogramme actuel, redresse d'un quart de tour : la fente
      regarde le sol au lieu de regarder a droite, et la ligne la comble. */
function aube(c, { petit = false } = {}) {
  const r = petit ? 30 : 28, cy = 40;
  const wh = petit ? 9 : 7.5;             // l'horizon reste plus fin que l'astre
  const x0 = petit ? 1 : 2, x1 = petit ? 99 : 98;

  /* L'astre est tangent a l'horizon, il ne le traverse pas. Trois autres
     traitements ont ete rendus puis ecartes : l'anneau coupe et l'arc pose
     lisent comme un omega sur son socle, et le disque traverse par la ligne
     laisse des epaules en surplomb qui le font lire comme un champignon. */
  return `<circle cx="50" cy="${cy}" r="${r}" fill="${c}"/>`
    + `<rect x="${x0}" y="${cy + r}" width="${x1 - x0}" height="${wh}" fill="${c}"/>`;
}

/* 2. Le cerne : trois anneaux de croissance et le coeur, fendus au meme
      endroit. La fente lit aussi le C d'origine. */
function cerne(c, { petit = false } = {}) {
  const w = petit ? 9.5 : 7.2;
  const rayons = petit ? [44, 26] : [44, 32.5, 21];
  const coeur = petit ? 8 : 7.5;
  const gap = 38;
  const arcs = rayons.map((r) => `<path d="${arcOuvert(50, 50, r, gap)}"/>`).join('');
  return `<g fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="butt">${arcs}</g>`
    + `<circle cx="50" cy="50" r="${coeur}" fill="${c}"/>`;
}

/* 3. La ligature : le AE latin de Satoshi, en 700 pour l'embleme. */
function ligature(c, { petit = false } = {}) {
  const font = police(700);
  const taille = 100;
  const m = trace(font, 'Æ', taille);
  const ech = petit ? 100 / m.hauteur : 100 / Math.max(m.largeur, m.hauteur);
  const t = trace(font, 'Æ', taille * ech, { couleur: c });
  const dx = -t.gauche + (100 - t.largeur) / 2;
  const dy = -t.haut + (100 - t.hauteur) / 2;
  const u = trace(font, 'Æ', taille * ech, { x: dx, y: dy, couleur: c });
  return u.markup;
}

/* 4. L'arche : le seuil ouvert, et le jour qui passe sous la voute.
      Une barre a la naissance des voutes a ete essayee puis retiree : elle
      faisait lire un A, donc la mauvaise initiale. */
function arche(c, { petit = false } = {}) {
  const w = petit ? 14 : 13;
  const g = 22 + w / 2, d = 78 - w / 2;   // axes des montants
  const r = (d - g) / 2, cy = 40;
  const bas = 94;
  const contour = `M${g} ${bas}L${g} ${cy}A${r} ${r} 0 0 1 ${d} ${cy}L${d} ${bas}`;
  const jour = petit ? { cy: 36, r: 10.5 } : { cy: 37, r: 10 };
  return `<g fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="butt">`
    + `<path d="${contour}"/></g>`
    + `<circle cx="50" cy="${jour.cy}" r="${jour.r}" fill="${c}"/>`;
}

/* 5. L'etoile fixe : huit branches, quatre longues aux points cardinaux,
      et l'anneau de l'astrolabe que la petite taille abandonne. */
function etoile(c, { petit = false } = {}) {
  const R = 46, moyen = petit ? 28 : 26, creux = petit ? 14.5 : 12;
  const pts = [];
  for (let k = 0; k < 16; k += 1) {
    const a = k * 22.5 - 90;
    const r = k % 2 === 1 ? creux : (k % 4 === 0 ? R : moyen);
    const [x, y] = surCercle(50, 50, r, a);
    pts.push(`${x.toFixed(3)},${y.toFixed(3)}`);
  }
  const anneau = petit ? '' : `<circle cx="50" cy="50" r="34.5" fill="none" stroke="${c}" stroke-width="2.8"/>`;
  return `<polygon points="${pts.join(' ')}" fill="${c}"/>${anneau}`;
}

export const PISTES = [
  {
    cle: 'aube',
    nom: "L'Aube",
    signe: aube,
    mot: 'Caelestis',
    cadre: 'encre',
    ratioMot: 0.70,       // hauteur d'encre du mot / hauteur d'encre du signe
    ecartH: 0.28,         // ecart horizontal / hauteur d'encre du signe
    ecartV: 0.30,
    largeurMotV: 1.02,    // largeur du mot / largeur du signe, en lockup vertical
  },
  {
    cle: 'cerne',
    nom: 'Le Cerne',
    signe: cerne,
    mot: 'Caelestis',
    cadre: 'carre',
    ratioMot: 0.50,
    ecartH: 0.26,
    ecartV: 0.22,
    largeurMotV: 1.05,
  },
  {
    cle: 'ligature',
    nom: 'La Ligature',
    signe: ligature,
    mot: 'Cælestis',
    motPoids: 500,
    cadre: 'encre',
    occupation: 0.54,
    occupationPetit: 0.62,
    ratioMot: 0.86,
    ecartH: 0.36,
    ecartV: 0.30,
    largeurMotV: 1.12,
    motSecondaire: 'Caelestis',
  },
  {
    cle: 'arche',
    nom: "L'Arche",
    signe: arche,
    mot: 'Caelestis',
    cadre: 'encre',
    occupation: 0.66,
    occupationPetit: 0.74,
    ratioMot: 0.44,
    ecartH: 0.24,
    ecartV: 0.20,
    largeurMotV: 1.75,
  },
  {
    cle: 'etoile',
    nom: "L'Étoile fixe",
    signe: etoile,
    mot: 'Caelestis',
    cadre: 'carre',
    ratioMot: 0.48,
    ecartH: 0.26,
    ecartV: 0.22,
    largeurMotV: 1.05,
  },
];

export const INTERLETTRAGE = -0.02;   // reglage de la charte, en em

/* ══════════════════════════════════════════════════════════════
   Reperes de construction, pour la planche de presentation.
   Ils montrent la geometrie reelle de chaque signe : cercles porteurs,
   axes, lignes de naissance. Ce sont les memes valeurs que les fonctions
   ci-dessus, pas un redessin approchant.
   ══════════════════════════════════════════════════════════════ */
const axe = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const cercle = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"/>`;

export const REPERES = {
  aube: () => [
    cercle(50, 40, 28),
    axe(50, -4, 50, 104), axe(-4, 40, 104, 40),
    axe(-4, 68, 104, 68), axe(-4, 75.5, 104, 75.5),
  ].join(''),

  cerne: () => {
    const r = [44, 32.5, 21, 7.5].map((v) => cercle(50, 50, v)).join('');
    const fente = [-19, 19].map((d) => {
      const [x, y] = surCercle(50, 50, 52, d);
      return axe(50, 50, +x.toFixed(2), +y.toFixed(2));
    }).join('');
    return r + fente + axe(50, -4, 50, 104) + axe(-4, 50, 104, 50);
  },

  ligature: () => {
    const font = police(700);
    const m = trace(font, 'Æ', 100);
    const ech = 100 / Math.max(m.largeur, m.hauteur);
    const u = trace(font, 'Æ', 100 * ech);
    const l = u.largeur, h = u.hauteur;
    const x0 = (100 - l) / 2, y0 = (100 - h) / 2;
    return `<rect x="${x0.toFixed(2)}" y="${y0.toFixed(2)}" width="${l.toFixed(2)}" height="${h.toFixed(2)}" fill="none"/>`
      + axe(-4, +y0.toFixed(2), 104, +y0.toFixed(2))
      + axe(-4, +(y0 + h).toFixed(2), 104, +(y0 + h).toFixed(2))
      + axe(50, -4, 50, 104);
  },

  arche: () => cercle(50, 40, 21.5) + axe(28.5, -4, 28.5, 104) + axe(71.5, -4, 71.5, 104)
    + axe(-4, 40, 104, 40) + axe(50, -4, 50, 104) + cercle(50, 37, 10),

  etoile: () => {
    const c = [46, 34.5, 26, 12].map((v) => cercle(50, 50, v)).join('');
    const rayons = Array.from({ length: 8 }, (_, k) => {
      const [x, y] = surCercle(50, 50, 50, k * 45 - 90);
      return axe(50, 50, +x.toFixed(2), +y.toFixed(2));
    }).join('');
    return c + rayons;
  },
};

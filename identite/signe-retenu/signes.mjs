/* Le signe retenu, septembre 2026 : l'ecran plante.

   Celestin retient la ligne de sol a 60 unites et fait retirer la Pousse de
   l'ecran. Le signe se reduit donc a trois pieces : un ecran 16/10 en contour,
   un col fusele, une ligne de sol dans laquelle il plonge.

   Ce que le retrait de la Pousse change, et qu'il faut avoir en tete : le
   vivant ne repose plus que sur deux traits, le fuselage du col et la ligne
   de sol. Le signe gagne en sobriete et se rapproche du pictogramme ordinaire
   du moniteur. Les deux ecarts qui l'en distinguent sont mesurables et doivent
   etre tenus : le col s'evase de 11 a 19 unites, et la ligne fait 60 la ou un
   socle de moniteur en fait 44.

   La piste 1 est le signe demande. Les trois suivantes sont des reglages
   proposes a cote, pas des propositions de remplacement. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);

const rrect = (x, y, l, h, r) => `M${f(x)} ${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}`
  + `L${f(x + l - r)} ${f(y)}A${f(r)} ${f(r)} 0 0 1 ${f(x + l)} ${f(y + r)}`
  + `L${f(x + l)} ${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + l - r)} ${f(y + h)}`
  + `L${f(x + r)} ${f(y + h)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}Z`;

/* L'ecran : 76 sur 48, du 16/10, angles a 7. Son encre fait 83,5 avec un
   contour de 7,5. Un rayon plus fort le ferait basculer du cote de l'icone. */
export const ECRAN = { x: 12, y: 8, l: 76, h: 48, r: 7 };
/* Le sol : 60 unites, contre 44 pour un socle de moniteur ordinaire. */
export const SOL = { y: 76, l: 60, h: 8, colJusque: 80 };
/* Le col : fusele de 11 sous l'ecran a 19 au sol, ou il plonge de 4. */
export const COL = { haut: 11, bas: 19 };

const ecran = (c, trait, aplat) => aplat
  ? `<path d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)}" fill="${c}"/>`
  : `<path d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)}" fill="none" stroke="${c}" stroke-width="${trait}"/>`;

const col = (wH, wB, c) => `<path d="M${f(50 - wH / 2)} 56L${f(50 - wB / 2)} ${SOL.colJusque}`
  + `L${f(50 + wB / 2)} ${SOL.colJusque}L${f(50 + wH / 2)} 56Z" fill="${c}"/>`;

const sol = (l, h, c) => `<rect x="${f(50 - l / 2)}" y="${SOL.y}" width="${f(l)}" height="${f(h)}" rx="${f(h / 2)}" fill="${c}"/>`;

/* Assemblage. Un seul parametre change d'une piste a l'autre. */
function ecranPlante(c, { petit = false, trait, largeurSol = SOL.l, aplat = false } = {}) {
  const t = trait ?? (petit ? 9.5 : 7.5);
  const wH = petit ? COL.haut + 2 : COL.haut;
  const wB = petit ? COL.bas + 2 : COL.bas;
  const l = petit ? largeurSol + 4 : largeurSol;
  const h = petit ? SOL.h + 1.5 : SOL.h;
  return ecran(c, t, aplat) + col(wH, wB, c) + sol(l, h, c);
}

/* ══ 1. Le signe retenu ══════════════════════════════════════════════ */
const retenu = (c, o = {}) => ecranPlante(c, o);
/* ══ 2. Contour epais : un ecran vide porte un trait plus fort ═══════ */
const epais = (c, o = {}) => ecranPlante(c, { ...o, trait: o.petit ? 11.5 : 9.5 });
/* ══ 3. Sol a 68 : quatre unites de plus de chaque cote ══════════════ */
const solLarge = (c, o = {}) => ecranPlante(c, { ...o, largeurSol: 68 });
/* ══ 4. Aplat : l'ecran plein plutot qu'en contour ═══════════════════ */
const aplat = (c, o = {}) => ecranPlante(c, { ...o, aplat: true });

const commun = { mot: 'Caelestis', cadre: 'encre', ratioMot: 0.54, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.02, occupation: 0.7, occupationPetit: 0.78 };

export const PISTES = [
  { cle: 'retenu', nom: "L'Écran planté", signe: retenu, ...commun },
  { cle: 'contour-epais', nom: 'Contour épais', signe: epais, ...commun },
  { cle: 'sol-68', nom: 'Sol à 68', signe: solLarge, ...commun },
  { cle: 'aplat', nom: "L'Aplat", signe: aplat, ...commun },
];

/* ── Reperes de construction ────────────────────────────────────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
const base = (largeurSol = SOL.l) => `<rect x="${ECRAN.x}" y="${ECRAN.y}" width="${ECRAN.l}" height="${ECRAN.h}" fill="none"/>`
  + `<circle cx="${f(ECRAN.x + ECRAN.r)}" cy="${f(ECRAN.y + ECRAN.r)}" r="${ECRAN.r}" fill="none"/>`
  + axe(50, -4, 50, 104) + axe(-4, 56, 104, 56)
  + axe(-4, SOL.y, 104, SOL.y) + axe(-4, SOL.y + SOL.h, 104, SOL.y + SOL.h)
  /* Les deux verticales de l'encre de l'ecran, 83,5 unites : c'est a elles
     que se compare la ligne de sol. */
  + axe(8.25, -4, 8.25, 104) + axe(91.75, -4, 91.75, 104)
  + axe(f(50 - largeurSol / 2), 62, f(50 - largeurSol / 2), 96)
  + axe(f(50 + largeurSol / 2), 62, f(50 + largeurSol / 2), 96)
  + axe(f(50 - COL.haut / 2), 56, f(50 - COL.bas / 2), SOL.colJusque)
  + axe(f(50 + COL.haut / 2), 56, f(50 + COL.bas / 2), SOL.colJusque);

export const REPERES = {
  retenu: () => base(),
  'contour-epais': () => base(),
  'sol-68': () => base(68),
  aplat: () => base(),
};

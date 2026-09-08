/* Le signe retenu, septembre 2026 : l'ecran plante.

   Un seul signe est desormais travaille, et cette serie n'en contient qu'un.
   Trois pieces : un ecran 16/10 en contour, un col fusele, une ligne de sol
   de 68 unites dans laquelle il plonge.

   Ce que le retrait de la Pousse change, et qu'il faut avoir en tete : le
   vivant ne repose plus que sur deux traits, le fuselage du col et la ligne
   de sol. Le signe gagne en sobriete et se rapproche du pictogramme ordinaire
   du moniteur. Les deux ecarts qui l'en distinguent sont mesurables et doivent
   etre tenus : le col s'evase de 11 a 19 unites, et la ligne fait 68 la ou un
   socle de moniteur en fait 44.

   La piste 1 est le signe demande. Les trois suivantes sont des reglages
   proposes a cote, pas des propositions de remplacement. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { police, trace, INTERLETTRAGE } from './commun/base.mjs';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);

const rrect = (x, y, l, h, r) => `M${f(x)} ${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}`
  + `L${f(x + l - r)} ${f(y)}A${f(r)} ${f(r)} 0 0 1 ${f(x + l)} ${f(y + r)}`
  + `L${f(x + l)} ${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + l - r)} ${f(y + h)}`
  + `L${f(x + r)} ${f(y + h)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}Z`;

/* L'ecran : 76 sur 48, du 16/10, angles a 7. Son encre fait 83,5 avec un
   contour de 7,5. Un rayon plus fort le ferait basculer du cote de l'icone. */
export const ECRAN = { x: 12, y: 8, l: 76, h: 48, r: 7 };
/* Le sol : 68 unites, contre 44 pour un socle de moniteur ordinaire. */
export const SOL = { y: 76, l: 68, h: 8, colJusque: 80 };
/* Le col : fusele de 11 sous l'ecran a 19 au sol, ou il plonge de 4. */
export const COL = { haut: 11, bas: 19 };

const ecran = (c, trait) => `<path d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)}" fill="none" stroke="${c}" stroke-width="${trait}"/>`;

const col = (wH, wB, c) => `<path d="M${f(50 - wH / 2)} 56L${f(50 - wB / 2)} ${SOL.colJusque}`
  + `L${f(50 + wB / 2)} ${SOL.colJusque}L${f(50 + wH / 2)} 56Z" fill="${c}"/>`;

const sol = (l, h, c) => `<rect x="${f(50 - l / 2)}" y="${SOL.y}" width="${f(l)}" height="${f(h)}" rx="${f(h / 2)}" fill="${c}"/>`;

/* Version optique pour les petites tailles. Le contour y etait epaissi a 9,5,
   ce qui donnait au favicon des bordures nettement plus grosses que celles du
   signe : il est ramene a 8, et le col comme le sol ne gagnent plus qu'une
   unite au lieu de deux et quatre. Le favicon garde ainsi le dessin du signe
   au lieu d'en donner une version engraissee. */
export const PETIT = { trait: 8, col: 1, sol: 2, hauteurSol: 1 };

function ecranPlante(c, { petit = false } = {}) {
  const t = petit ? PETIT.trait : 7.5;
  const wH = petit ? COL.haut + PETIT.col : COL.haut;
  const wB = petit ? COL.bas + PETIT.col : COL.bas;
  const l = petit ? SOL.l + PETIT.sol : SOL.l;
  const h = petit ? SOL.h + PETIT.hauteurSol : SOL.h;
  return ecran(c, t) + col(wH, wB, c) + sol(l, h, c);
}

export const PISTES = [{
  cle: 'signe',
  nom: "L'Écran planté",
  signe: ecranPlante,
  mot: 'Caelestis',
  cadre: 'encre',
  ratioMot: 0.54,
  ecartH: 0.24,
  ecartV: 0.20,
  largeurMotV: 1.02,
  occupation: 0.7,
  occupationPetit: 0.78,
}];

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

export const REPERES = { signe: () => base() };

/* ══ Le lockup au mot a l'ecran ══════════════════════════════════════
   Septieme piece de la famille : le mot passe dans l'ecran.

   `dedans` est le traitement retenu le 7 septembre : le mot rentre
   entierement dans l'ecran, a 58 unites au lieu de 108. Une seule couleur,
   aucun croisement, l'ordinateur reste entier.

   Un mot qui deborde de l'ecran oblige a traiter son croisement avec le
   cadre, puisqu'un cadre entier et un mot de la meme couleur se confondent la
   ou ils se croisent. Les trois traitements essayes restent disponibles ici,
   sans etre livres en fichiers :

   `ferme`       le cadre entier, le mot par-dessus. Ecarte : le C et le s
                 sont manges par les montants, le mot ne se lit plus.
   `interrompu`  le cadre s'ouvre de part et d'autre du mot. Ecarte : il
                 coupe l'ecran en deux morceaux pour rien.
   `mousse`      le cadre en #B8C4BB, le mot en vert foret. Le relief se lit,
                 mais le logo passe a deux couleurs, ce que la charte
                 interdit pour le signe, et le contraste de la mousse sur
                 creme vaut 1,7 pour 1. Grands formats seulement. */
export const MOT = { largeur: 108, largeurDedans: 58, cy: 32, jour: 3.2, poids: 500 };

function tracerMot(largeur, couleur) {
  const font = police(MOT.poids);
  const sonde = trace(font, 'Caelestis', 100, { ls: INTERLETTRAGE * 100 });
  const taille = (100 * largeur) / sonde.largeur;
  const ls = INTERLETTRAGE * taille;
  const m = trace(font, 'Caelestis', taille, { ls });
  const markup = trace(font, 'Caelestis', taille, {
    x: 50 - m.largeur / 2 - m.gauche,
    y: MOT.cy - m.hauteur / 2 - m.haut,
    couleur, ls,
  }).markup;
  return { markup, hauteur: m.hauteur };
}

/* Le cadre en deux morceaux, avec un jour de part et d'autre du mot. */
function cadreOuvert(hauteurMot, couleur) {
  const y0 = f(MOT.cy - hauteurMot / 2 - MOT.jour);
  const y1 = f(MOT.cy + hauteurMot / 2 + MOT.jour);
  const r = ECRAN.r, xg = ECRAN.x, xd = ECRAN.x + ECRAN.l, yh = ECRAN.y, yb = ECRAN.y + ECRAN.h;
  const haut = `M${xg} ${y0}L${xg} ${f(yh + r)}A${r} ${r} 0 0 1 ${f(xg + r)} ${yh}`
    + `L${f(xd - r)} ${yh}A${r} ${r} 0 0 1 ${xd} ${f(yh + r)}L${xd} ${y0}`;
  const bas = `M${xg} ${y1}L${xg} ${f(yb - r)}A${r} ${r} 0 0 0 ${f(xg + r)} ${yb}`
    + `L${f(xd - r)} ${yb}A${r} ${r} 0 0 0 ${xd} ${f(yb - r)}L${xd} ${y1}`;
  return `<g fill="none" stroke="${couleur}" stroke-width="7.5" stroke-linecap="butt">`
    + `<path d="${haut}"/><path d="${bas}"/></g>`;
}

export function motEcran(couleur, { traitement = 'interrompu', couleurCadre } = {}) {
  const dedans = traitement === 'dedans';
  const { markup, hauteur } = tracerMot(dedans ? MOT.largeurDedans : MOT.largeur, couleur);
  const cc = couleurCadre || couleur;
  const cadre = traitement === 'interrompu'
    ? cadreOuvert(hauteur, cc)
    : ecran(cc, 7.5);
  return cadre + col(COL.haut, COL.bas, cc) + sol(SOL.l, SOL.h, cc) + markup;
}

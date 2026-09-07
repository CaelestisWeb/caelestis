/* Huitieme serie, septembre 2026 : le moniteur plante, sans racines.

   Celestin retient le Moniteur plante de la septieme serie et ecarte les
   racines. Le signe garde donc son ecran en contour et sa Pousse, et cette
   serie fait varier les deux seules pieces qui restent : le col et le pied.

   Deux cols, droit ou fusele. Deux pieds, le socle classique du moniteur ou
   une ligne de sol pleine largeur. Les quatre combinaisons sont montrees, plus
   une variation sur le contenu de l'ecran.

   Dire plante sans dessiner de racine tient a une seule idee : une ligne de
   sol plus large que l'ecran, dans laquelle le col plonge de quatre unites.
   Aucune forme organique n'est ajoutee, le vocabulaire reste geometrique. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);
const rayon = (fleche, corde) => f((fleche * fleche + (corde / 2) ** 2) / (2 * fleche));

/* Feuille. Le miroir se fait par l'angle oppose et le drapeau de balayage
   inverse : nier les abscisses envoie la pointe du mauvais cote. */
function feuille(x, y, L, so, si, aDeg, { couleur, miroir = false }) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  const a = (miroir ? -aDeg : aDeg) * Math.PI / 180;
  const co = Math.cos(a), s = Math.sin(a);
  const P = (px, py) => `${f(x + px * co - py * s)} ${f(y + px * s + py * co)}`;
  const sw = miroir ? 0 : 1;
  return `<path d="M${P(0, 0)}A${Ro} ${Ro} 0 0 ${sw} ${P(0, -L)}A${Ri} ${Ri} 0 0 ${sw} ${P(0, 0)}Z" fill="${couleur}"/>`;
}

const rrect = (x, y, l, h, r) => `M${f(x)} ${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}`
  + `L${f(x + l - r)} ${f(y)}A${f(r)} ${f(r)} 0 0 1 ${f(x + l)} ${f(y + r)}`
  + `L${f(x + l)} ${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + l - r)} ${f(y + h)}`
  + `L${f(x + r)} ${f(y + h)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}Z`;

/* L'ecran : 76 sur 48, du 16/10, angles a 7. Un rayon plus fort le ferait
   basculer du cote de l'icone d'application. */
export const ECRAN = { x: 12, y: 8, l: 76, h: 48, r: 7 };
const ecran = (c, w) => `<path d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)}" fill="none" stroke="${c}" stroke-width="${w}"/>`;

const colDroit = (yB, w, c) => `<rect x="${f(50 - w / 2)}" y="56" width="${f(w)}" height="${f(yB - 56)}" fill="${c}"/>`;
const colFusele = (yB, wH, wB, c) => `<path d="M${f(50 - wH / 2)} 56L${f(50 - wB / 2)} ${f(yB)}L${f(50 + wB / 2)} ${f(yB)}L${f(50 + wH / 2)} 56Z" fill="${c}"/>`;
const barre = (y, l, h, c) => `<rect x="${f(50 - l / 2)}" y="${f(y)}" width="${f(l)}" height="${f(h)}" rx="${f(h / 2)}" fill="${c}"/>`;

/* Le socle du moniteur, et la ligne de sol. La ligne est plus large que
   l'ecran et le col y plonge de quatre unites : c'est ce qui dit plante. */
const SOCLE = { y: 78, l: 44, h: 9, colJusque: 78 };
const SOL = { y: 76, l: 96, h: 8, colJusque: 80 };

/* La Pousse, pleine, posee dans l'ecran en contour. */
function pousse(cx, cy, k, c) {
  const w = 12 * k, h = 46 * k;
  return `<path d="M${f(cx - w / 2)} ${f(cy + h)}L${f(cx - w * 0.4)} ${f(cy)}L${f(cx + w * 0.4)} ${f(cy)}L${f(cx + w / 2)} ${f(cy + h)}Z" fill="${c}"/>`
    + feuille(cx, cy, 48 * k, 13.5 * k, 7.5 * k, 33, { couleur: c })
    + feuille(cx, cy, 48 * k, 13.5 * k, 7.5 * k, 33, { couleur: c, miroir: true });
}

const assembler = (c, petit, { fusele = false, pied = SOCLE }) => {
  const trait = petit ? 9.5 : 7.5;
  const wCol = petit ? 15 : 13;
  const col = fusele
    ? colFusele(pied.colJusque, petit ? 13 : 11, petit ? 21 : 19, c)
    : colDroit(pied.colJusque, wCol, c);
  return ecran(c, trait) + col
    + barre(pied.y, pied === SOL ? pied.l : (petit ? 48 : pied.l), petit ? pied.h + 1.5 : pied.h, c)
    + pousse(50, petit ? 29 : 30, petit ? 0.44 : 0.4, c);
};

/* ══ 1. Le Socle : col droit, socle classique ════════════════════════ */
const socle = (c, { petit = false } = {}) => assembler(c, petit, {});
/* ══ 2. Le Sol : col droit, ligne de sol ═════════════════════════════ */
const sol = (c, { petit = false } = {}) => assembler(c, petit, { pied: SOL });
/* ══ 3. La Tige : col fusele, socle classique ═══════════════════════ */
const tige = (c, { petit = false } = {}) => assembler(c, petit, { fusele: true });
/* ══ 4. La Tige au sol : col fusele, ligne de sol ═══════════════════ */
const tigeSol = (c, { petit = false } = {}) => assembler(c, petit, { fusele: true, pied: SOL });

/* ══ 5. Le Plein : l'ecran en aplat, la Pousse creusee dedans ════════
   Une version debordante a ete rendue puis ecartee : les feuilles passant
   par-dessus le bord haut lisaient comme un noeud pose sur l'ecran.

   Le creux exige des sous-traces disjoints. La tige s'arrete au point
   d'attache des feuilles, qui montent de la sans jamais la recouvrir : deux
   formes qui se recouvriraient repeindraient leur intersection sous la regle
   evenodd, et le creux se reboucherait par endroits. */
function plein(c, { petit = false } = {}) {
  const cy = petit ? 29 : 30, k = petit ? 0.44 : 0.4;
  const w = 12 * k, h = 46 * k;
  const tige = `M${f(50 - w / 2)} ${f(cy + h)}L${f(50 - w * 0.4)} ${f(cy)}L${f(50 + w * 0.4)} ${f(cy)}L${f(50 + w / 2)} ${f(cy + h)}Z`;
  const Ro = rayon(13.5 * k, 48 * k), Ri = rayon(7.5 * k, 48 * k);
  const arc = (miroir) => {
    const a = (miroir ? -33 : 33) * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
    const P = (px, py) => `${f(50 + px * co - py * si)} ${f(cy + px * si + py * co)}`;
    const sw = miroir ? 0 : 1;
    return `M${P(0, 0)}A${Ro} ${Ro} 0 0 ${sw} ${P(0, -48 * k)}A${Ri} ${Ri} 0 0 ${sw} ${P(0, 0)}Z`;
  };
  return `<path fill-rule="evenodd" fill="${c}" d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)} ${tige} ${arc(false)} ${arc(true)}"/>`
    + colDroit(SOL.colJusque, petit ? 15 : 13, c)
    + barre(SOL.y, SOL.l, petit ? SOL.h + 1.5 : SOL.h, c);
}

export const PISTES = [
  { cle: 'socle', nom: 'Le Socle', signe: socle, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.52, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.1, occupation: 0.68, occupationPetit: 0.76 },
  { cle: 'sol', nom: 'Le Sol', signe: sol, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.54, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.02, occupation: 0.70, occupationPetit: 0.78 },
  { cle: 'tige', nom: 'La Tige', signe: tige, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.52, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.1, occupation: 0.68, occupationPetit: 0.76 },
  { cle: 'tige-sol', nom: 'La Tige au sol', signe: tigeSol, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.54, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.02, occupation: 0.70, occupationPetit: 0.78 },
  { cle: 'plein', nom: "L'Écran plein", signe: plein, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.54, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.02, occupation: 0.70, occupationPetit: 0.78 },
];

/* ── Reperes de construction ────────────────────────────────────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
const boiteEcran = () => `<rect x="${ECRAN.x}" y="${ECRAN.y}" width="${ECRAN.l}" height="${ECRAN.h}" fill="none"/>`
  + `<circle cx="${f(ECRAN.x + ECRAN.r)}" cy="${f(ECRAN.y + ECRAN.r)}" r="${ECRAN.r}" fill="none"/>`;
function cerclesFeuille(x, y, L, so, si, aDeg, miroir = false) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${miroir ? -aDeg : aDeg})${miroir ? ' scale(-1 1)' : ''}">`
    + `<circle cx="${f(so - Ro)}" cy="${f(-L / 2)}" r="${Ro}" fill="none"/>`
    + `<circle cx="${f(Ri - si)}" cy="${f(-L / 2)}" r="${Ri}" fill="none"/></g>`;
}
const reperesPousse = (cy, k) => cerclesFeuille(50, cy, 48 * k, 13.5 * k, 7.5 * k, 33)
  + cerclesFeuille(50, cy, 48 * k, 13.5 * k, 7.5 * k, 33, true) + axe(-4, cy, 104, cy);
const communs = (pied) => boiteEcran() + axe(50, -4, 50, 104) + axe(-4, 56, 104, 56)
  + axe(-4, pied.y, 104, pied.y) + axe(-4, pied.y + pied.h, 104, pied.y + pied.h);

export const REPERES = {
  socle: () => communs(SOCLE) + reperesPousse(30, 0.4),
  sol: () => communs(SOL) + reperesPousse(30, 0.4),
  tige: () => communs(SOCLE) + reperesPousse(30, 0.4) + axe(44.5, 56, 40.5, 78) + axe(55.5, 56, 59.5, 78),
  'tige-sol': () => communs(SOL) + reperesPousse(30, 0.4) + axe(44.5, 56, 40.5, 80) + axe(55.5, 56, 59.5, 80),
  plein: () => communs(SOL) + reperesPousse(30, 0.4),
};

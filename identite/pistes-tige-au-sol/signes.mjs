/* Neuvieme serie, septembre 2026 : la largeur de la ligne de sol.

   La Tige au sol est retenue. Un seul reglage reste ouvert : la longueur de
   la ligne de sol. Presentee a 96 unites, elle depassait l'ecran des deux
   cotes et le signe paraissait pose sur une planche.

   Reperes utiles pour lire les cinq largeurs :
   - l'encre de l'ecran fait 83,5 unites, soit son rectangle de 76 plus son
     contour de 7,5 ;
   - un socle de moniteur ordinaire fait 44 ;
   - en dessous d'environ 60, la ligne cesse de lire comme le sol et redevient
     un pied.

   Tout le reste du signe est celui de la huitieme serie, sans retouche. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);
const rayon = (fleche, corde) => f((fleche * fleche + (corde / 2) ** 2) / (2 * fleche));

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

export const ECRAN = { x: 12, y: 8, l: 76, h: 48, r: 7 };
export const ENCRE_ECRAN = 83.5;   // le rectangle plus son contour
const SOL = { y: 76, h: 8, colJusque: 80 };

/* Le signe complet, la largeur de la ligne de sol restant le seul parametre. */
function tigeAuSol(c, largeur, { petit = false } = {}) {
  const trait = petit ? 9.5 : 7.5;
  const wH = petit ? 13 : 11, wB = petit ? 21 : 19;
  const cy = petit ? 29 : 30, k = petit ? 0.44 : 0.4;
  const w = 12 * k, h = 46 * k;
  const l = petit ? largeur + 4 : largeur;
  return `<path d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)}" fill="none" stroke="${c}" stroke-width="${trait}"/>`
    + `<path d="M${f(50 - wH / 2)} 56L${f(50 - wB / 2)} ${SOL.colJusque}L${f(50 + wB / 2)} ${SOL.colJusque}L${f(50 + wH / 2)} 56Z" fill="${c}"/>`
    + `<rect x="${f(50 - l / 2)}" y="${SOL.y}" width="${f(l)}" height="${f(petit ? SOL.h + 1.5 : SOL.h)}" rx="${f((petit ? SOL.h + 1.5 : SOL.h) / 2)}" fill="${c}"/>`
    + `<path d="M${f(50 - w / 2)} ${f(cy + h)}L${f(50 - w * 0.4)} ${f(cy)}L${f(50 + w * 0.4)} ${f(cy)}L${f(50 + w / 2)} ${f(cy + h)}Z" fill="${c}"/>`
    + feuille(50, cy, 48 * k, 13.5 * k, 7.5 * k, 33, { couleur: c })
    + feuille(50, cy, 48 * k, 13.5 * k, 7.5 * k, 33, { couleur: c, miroir: true });
}

const LARGEURS = [
  ['ras', 'Au ras', 84, "La ligne s'arrête exactement au bord de l'écran, contour compris."],
  ['retrait', 'En retrait', 80, "Deux unités de jour de chaque côté. C'est la largeur posée par défaut."],
  ['aplomb', "À l'aplomb", 76, "La largeur du rectangle de l'écran sans son contour, quatre unités de jour."],
  ['courte', 'Courte', 68, "Huit unités de jour de chaque côté, la ligne se détache nettement."],
  ['minimale', 'Minimale', 60, "La limite basse : en dessous, la ligne redevient un socle."],
];

export const PISTES = LARGEURS.map(([cle, nom, largeur]) => ({
  cle,
  nom,
  largeur,
  signe: (c, opts = {}) => tigeAuSol(c, largeur, opts),
  mot: 'Caelestis',
  cadre: 'encre',
  ratioMot: 0.54,
  ecartH: 0.24,
  ecartV: 0.20,
  largeurMotV: 1.02,
  occupation: 0.7,
  occupationPetit: 0.78,
}));

export const NOTES = Object.fromEntries(LARGEURS.map(([cle, , largeur, note]) => [cle, { largeur, note }]));

/* ── Reperes de construction ────────────────────────────────────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
function cerclesFeuille(x, y, L, so, si, aDeg, miroir = false) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${miroir ? -aDeg : aDeg})${miroir ? ' scale(-1 1)' : ''}">`
    + `<circle cx="${f(so - Ro)}" cy="${f(-L / 2)}" r="${Ro}" fill="none"/>`
    + `<circle cx="${f(Ri - si)}" cy="${f(-L / 2)}" r="${Ri}" fill="none"/></g>`;
}

/* Les reperes montrent l'encre de l'ecran et la ligne posee : c'est l'ecart
   entre les deux verticales qui se juge d'une piste a l'autre. */
export const REPERES = Object.fromEntries(LARGEURS.map(([cle, , largeur]) => [cle, () =>
  `<rect x="${ECRAN.x}" y="${ECRAN.y}" width="${ECRAN.l}" height="${ECRAN.h}" fill="none"/>`
  + `<circle cx="${f(ECRAN.x + ECRAN.r)}" cy="${f(ECRAN.y + ECRAN.r)}" r="${ECRAN.r}" fill="none"/>`
  + axe(50, -4, 50, 104) + axe(-4, 56, 104, 56) + axe(-4, SOL.y, 104, SOL.y) + axe(-4, SOL.y + SOL.h, 104, SOL.y + SOL.h)
  + axe(f(50 - ENCRE_ECRAN / 2), -4, f(50 - ENCRE_ECRAN / 2), 104) + axe(f(50 + ENCRE_ECRAN / 2), -4, f(50 + ENCRE_ECRAN / 2), 104)
  + axe(f(50 - largeur / 2), 62, f(50 - largeur / 2), 96) + axe(f(50 + largeur / 2), 62, f(50 + largeur / 2), 96)
  + cerclesFeuille(50, 30, 19.2, 5.4, 3, 33) + cerclesFeuille(50, 30, 19.2, 5.4, 3, 33, true),
]));

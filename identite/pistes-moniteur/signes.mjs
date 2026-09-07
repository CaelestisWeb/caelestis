/* Septieme serie, septembre 2026 : le moniteur enracine.

   Celestin trouve la serie precedente trop brouillonne et trop illustrative,
   et demande que le carre ressemble davantage a un ordinateur.

   Deux consequences sur le dessin.

   1. Le carre devient un moniteur : rectangle en 16/10 a angles peu arrondis,
      un col, et un socle. Un carre a coins tres arrondis lit comme une icone
      d'application, pas comme un ecran.
   2. Un moniteur possede deja un pied. Remplacer son socle par trois racines
      suffit a en faire un arbre : rien ne s'ajoute, une piece est echangee.

   Les racines sont des prismes droits, sans courbe ni fuselage. La serie
   precedente les dessinait courbes et fuselees, ce qui faisait illustration. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);
const rayon = (fleche, corde) => f((fleche * fleche + (corde / 2) ** 2) / (2 * fleche));

/* Feuille en trace ferme, pour la creuser dans un ecran plein. Le miroir se
   fait par l'angle oppose et le drapeau de balayage inverse : nier les
   abscisses envoyait la pointe du mauvais cote. */
function traceFeuille(x, y, L, so, si, aDeg, miroir = false) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  const a = (miroir ? -aDeg : aDeg) * Math.PI / 180;
  const co = Math.cos(a), s = Math.sin(a);
  const P = (px, py) => `${f(x + px * co - py * s)} ${f(y + px * s + py * co)}`;
  const sw = miroir ? 0 : 1;
  return `M${P(0, 0)}A${Ro} ${Ro} 0 0 ${sw} ${P(0, -L)}A${Ri} ${Ri} 0 0 ${sw} ${P(0, 0)}Z`;
}

const rrect = (x, y, l, h, r) => `M${f(x)} ${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}`
  + `L${f(x + l - r)} ${f(y)}A${f(r)} ${f(r)} 0 0 1 ${f(x + l)} ${f(y + r)}`
  + `L${f(x + l)} ${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + l - r)} ${f(y + h)}`
  + `L${f(x + r)} ${f(y + h)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}Z`;

/* Racine : un prisme droit, base au point d'attache et pointe au bout. */
function racine(x, y, aDeg, L, w, c) {
  const a = aDeg * Math.PI / 180;
  const dx = Math.sin(a), dy = Math.cos(a), px = Math.cos(a), py = -Math.sin(a);
  return `<path d="M${f(x + px * w / 2)} ${f(y + py * w / 2)}L${f(x + dx * L)} ${f(y + dy * L)}`
    + `L${f(x - px * w / 2)} ${f(y - py * w / 2)}Z" fill="${c}"/>`;
}
const souche = (y, k, c) => racine(43.5, y, -46, 18 * k, 10, c)
  + racine(50, y, 0, 23 * k, 11, c) + racine(56.5, y, 46, 18 * k, 10, c);

const col = (yH, yB, w, c) => `<rect x="${f(50 - w / 2)}" y="${f(yH)}" width="${f(w)}" height="${f(yB - yH)}" fill="${c}"/>`;
const socle = (y, l, h, c) => `<rect x="${f(50 - l / 2)}" y="${f(y)}" width="${f(l)}" height="${f(h)}" rx="${f(h / 2)}" fill="${c}"/>`;

/* L'ecran : 76 sur 48, soit du 16/10, angles a 7 unites. */
export const ECRAN = { x: 12, y: 8, l: 76, h: 48, r: 7 };
const plein = (c) => `<path d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)}" fill="${c}"/>`;
const contour = (c, w) => `<path d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
const creuse = (c, dedans) => `<path fill-rule="evenodd" fill="${c}" d="${rrect(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h, ECRAN.r)} ${dedans}"/>`;

/* La Pousse en creux. La tige s'arrete au point d'attache des feuilles, qui
   montent de la sans jamais la recouvrir : deux formes qui se recouvriraient
   repeindraient leur intersection et le creux se reboucherait. */
function creuxPousse(cx, cy, k) {
  const w = 12 * k, h = 46 * k;
  const tige = `M${f(cx - w / 2)} ${f(cy + h)}L${f(cx - w * 0.4)} ${f(cy)}L${f(cx + w * 0.4)} ${f(cy)}L${f(cx + w / 2)} ${f(cy + h)}Z`;
  return `${tige} ${traceFeuille(cx, cy, 48 * k, 13.5 * k, 7.5 * k, 33)} ${traceFeuille(cx, cy, 48 * k, 13.5 * k, 7.5 * k, 33, true)}`;
}

/* ══ 1. Le Moniteur enracine ═════════════════════════════════════════ */
const moniteur = (c, { petit = false } = {}) =>
  plein(c) + col(56, petit ? 72 : 74, petit ? 15 : 13, c) + souche(petit ? 70 : 72, petit ? 0.86 : 1, c);

/* ══ 2. La Pousse a l'ecran : le moniteur garde son socle ════════════ */
const pousseEcran = (c, { petit = false } = {}) =>
  creuse(c, creuxPousse(50, petit ? 29 : 30, petit ? 0.44 : 0.4))
  + col(56, 78, petit ? 15 : 13, c) + socle(78, petit ? 48 : 44, petit ? 10 : 9, c);

/* ══ 3. Le Moniteur plante : l'ecran en contour ══════════════════════ */
const plante = (c, { petit = false } = {}) =>
  contour(c, petit ? 9.5 : 7.5) + col(56, petit ? 72 : 74, petit ? 15 : 13, c) + souche(petit ? 70 : 72, petit ? 0.86 : 1, c);

/* ══ 4. L'Enracine complet : la Pousse a l'ecran et les racines ══════ */
const complet = (c, { petit = false } = {}) =>
  creuse(c, creuxPousse(50, petit ? 29 : 30, petit ? 0.44 : 0.4))
  + col(56, petit ? 72 : 74, petit ? 15 : 13, c) + souche(petit ? 70 : 72, petit ? 0.86 : 1, c);

/* ══ 5. Le Portable : ecran et socle large, la Pousse a l'ecran ══════ */
function portable(c, { petit = false } = {}) {
  const e = { x: 18, y: 12, l: 64, h: 40, r: 6 };
  const dedans = creuxPousse(50, petit ? 30 : 31, petit ? 0.4 : 0.36);
  return `<path fill-rule="evenodd" fill="${c}" d="${rrect(e.x, e.y, e.l, e.h, e.r)} ${dedans}"/>`
    + `<rect x="8" y="${petit ? 56 : 57}" width="84" height="${petit ? 12 : 10}" rx="${petit ? 6 : 5}" fill="${c}"/>`;
}

export const PISTES = [
  { cle: 'moniteur', nom: 'Le Moniteur enraciné', signe: moniteur, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.50, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.1, occupation: 0.68, occupationPetit: 0.76 },
  { cle: 'pousse-ecran', nom: "La Pousse à l'écran", signe: pousseEcran, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.52, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.1, occupation: 0.68, occupationPetit: 0.76 },
  { cle: 'plante', nom: 'Le Moniteur planté', signe: plante, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.50, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.1, occupation: 0.68, occupationPetit: 0.76 },
  { cle: 'complet', nom: "L'Enraciné complet", signe: complet, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.50, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.1, occupation: 0.68, occupationPetit: 0.76 },
  { cle: 'portable', nom: 'Le Portable', signe: portable, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.58, ecartH: 0.26, ecartV: 0.22, largeurMotV: 1.02, occupation: 0.70, occupationPetit: 0.78 },
];

/* ── Reperes de construction ────────────────────────────────────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
const boite = (x, y, l, h) => `<rect x="${f(x)}" y="${f(y)}" width="${f(l)}" height="${f(h)}" fill="none"/>`;
const boiteEcran = () => boite(ECRAN.x, ECRAN.y, ECRAN.l, ECRAN.h)
  + `<circle cx="${f(ECRAN.x + ECRAN.r)}" cy="${f(ECRAN.y + ECRAN.r)}" r="${ECRAN.r}" fill="none"/>`;
const axesRacines = (y) => [[-46, 18, 43.5], [0, 23, 50], [46, 18, 56.5]]
  .map(([a, L, x]) => axe(x, y, x + Math.sin(a * Math.PI / 180) * L, y + Math.cos(a * Math.PI / 180) * L)).join('');
function cerclesFeuille(x, y, L, so, si, aDeg, miroir = false) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${miroir ? -aDeg : aDeg})${miroir ? ' scale(-1 1)' : ''}">`
    + `<circle cx="${f(so - Ro)}" cy="${f(-L / 2)}" r="${Ro}" fill="none"/>`
    + `<circle cx="${f(Ri - si)}" cy="${f(-L / 2)}" r="${Ri}" fill="none"/></g>`;
}
const reperesPousse = (cy, k) => cerclesFeuille(50, cy, 48 * k, 13.5 * k, 7.5 * k, 33)
  + cerclesFeuille(50, cy, 48 * k, 13.5 * k, 7.5 * k, 33, true) + axe(-4, cy, 104, cy);

export const REPERES = {
  moniteur: () => boiteEcran() + axe(50, -4, 50, 104) + axe(-4, 56, 104, 56) + axe(-4, 74, 104, 74) + axesRacines(72),
  'pousse-ecran': () => boiteEcran() + axe(50, -4, 50, 104) + axe(-4, 56, 104, 56) + axe(-4, 78, 104, 78) + reperesPousse(30, 0.4),
  plante: () => boiteEcran() + axe(50, -4, 50, 104) + axe(-4, 56, 104, 56) + axe(-4, 74, 104, 74) + axesRacines(72),
  complet: () => boiteEcran() + axe(50, -4, 50, 104) + axe(-4, 56, 104, 56) + axe(-4, 74, 104, 74)
    + axesRacines(72) + reperesPousse(30, 0.4),
  portable: () => boite(18, 12, 64, 40) + boite(8, 57, 84, 10) + axe(50, -4, 50, 104) + reperesPousse(31, 0.36),
};

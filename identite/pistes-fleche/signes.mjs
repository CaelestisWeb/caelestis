/* Quatrieme serie, septembre 2026 : la fleche de croissance et le vivant.

   Demande de Celestin : une fleche de developpement d'activite qui fasse
   quand meme penser a la nature, ou un petit signe du registre entreprise
   verte. Cinq voies differentes, du plus explicite au plus discret.

   Le dessin de la feuille est celui de la troisieme serie, sans changement :
   deux arcs de rayons differents, un ventre et un dos, pivot sur le point
   d'attache. Le carre garde le rayon d'angle de la marque, 24 % du cote. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);
const rayon = (fleche, corde) => f((fleche * fleche + (corde / 2) ** 2) / (2 * fleche));
export const RAYON_TUILE = 0.24;

/* Feuille : base au point d'attache, pointe a `L`, ventre `so` et dos `si`. */
function feuille(x, y, L, so, si, angle, { couleur, miroir = false }) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<path transform="translate(${f(x)} ${f(y)}) rotate(${angle})${miroir ? ' scale(-1 1)' : ''}" d="M0 0A${Ro} ${Ro} 0 0 1 0 ${-L}A${Ri} ${Ri} 0 0 1 0 0Z" fill="${couleur}"/>`;
}
const paire = (x, y, L, so, si, a, couleur) =>
  feuille(x, y, L, so, si, a, { couleur }) + feuille(x, y, L, so, si, -a, { couleur, miroir: true });

/* Pousse : une hampe fuselee surmontee d'une feuille. Sert aux histogrammes. */
const brin = (x, yHaut, L, w, couleur, yBas = 94, angle = 36) =>
  `<path d="M${f(x - w / 2)} ${yBas}L${f(x - w / 2 + 1.1)} ${yHaut}L${f(x + w / 2 - 1.1)} ${yHaut}L${f(x + w / 2)} ${yBas}Z" fill="${couleur}"/>`
  + feuille(x, yHaut + 3, L, L * 0.25, L * 0.13, angle, { couleur });

/* ══ 1. La Fleche feuillue ═══════════════════════════════════════════
   Hampe droite, tete triangulaire, deux feuilles alternes sur la hampe.
   Deux essais ecartes : feuilles a mi-hauteur, elles formaient une seconde
   pointe ; feuilles symetriques au pied, le signe lisait comme une fleche a
   deux tetes. Alternees, une de chaque cote et a deux hauteurs, elles
   redeviennent des feuilles. */
function flecheFeuillue(c, { petit = false } = {}) {
  const w = petit ? 13 : 11, dt = petit ? 19 : 16, yt = petit ? 42 : 40;
  const g = f(50 - w / 2), d = f(50 + w / 2);
  const L = petit ? 40 : 36;
  return `<path d="M${g} 96L${g} ${yt}L${f(50 - dt)} ${yt}L50 ${petit ? 10 : 12}L${f(50 + dt)} ${yt}L${d} ${yt}L${d} 96Z" fill="${c}"/>`
    + feuille(50, petit ? 90 : 88, L, petit ? 10 : 9, 4.5, 44, { couleur: c })
    + feuille(50, petit ? 74 : 70, L * 0.86, petit ? 8.5 : 7.8, 4, -40, { couleur: c, miroir: true });
}

/* ══ 2. La Courbe ════════════════════════════════════════════════════
   La courbe de croissance, une pointe au bout et une feuille en chemin. La
   pointe suit la tangente de la courbe, calculee sur son dernier segment de
   controle : posee a l'oeil, elle donnait un accent circonflexe. */
function courbe(c, { petit = false } = {}) {
  const w = petit ? 10 : 8;
  const P2 = [52, 74], P3 = [66, 40];
  const n = Math.hypot(P3[0] - P2[0], P3[1] - P2[1]);
  const u = [(P3[0] - P2[0]) / n, (P3[1] - P2[1]) / n];
  const p = [-u[1], u[0]];
  const L = petit ? 21 : 18, W = petit ? 12 : 10, recul = petit ? 5 : 4;
  const pointe = [f(P3[0] + u[0] * L), f(P3[1] + u[1] * L)];
  const b = [P3[0] - u[0] * recul, P3[1] - u[1] * recul];
  return `<path d="M8 88C34 86 ${P2[0]} ${P2[1]} ${P3[0]} ${P3[1]}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`
    + `<path d="M${pointe[0]} ${pointe[1]}L${f(b[0] + p[0] * W)} ${f(b[1] + p[1] * W)}L${f(b[0] - p[0] * W)} ${f(b[1] - p[1] * W)}Z" fill="${c}"/>`
    + feuille(petit ? 40 : 42, petit ? 79 : 78, petit ? 34 : 30, petit ? 10 : 8.5, 4.5, -46, { couleur: c, miroir: true });
}

/* ══ 3. Les Trois pousses ════════════════════════════════════════════ */
function troisPousses(c, { petit = false } = {}) {
  const rangs = petit ? [[30, 62, 26, 13], [70, 36, 32, 13]] : [[22, 70, 20, 11], [50, 54, 24, 11], [78, 36, 28, 11]];
  return rangs.map(([x, yH, L, w]) => brin(x, yH, L, w, c)).join('');
}

/* ══ 4. L'Escalier ═══════════════════════════════════════════════════
   Trois feuilles qui montent en marches. Aucune tige, aucune fleche : c'est
   l'alignement qui porte la direction. */
function escalier(c, { petit = false } = {}) {
  const rangs = petit ? [[30, 78, 40], [70, 44, 46]] : [[26, 80, 26], [50, 62, 32], [76, 42, 38]];
  return rangs.map(([x, y, L]) => feuille(x, y, L, L * 0.27, L * 0.14, 42, { couleur: c })).join('');
}

/* ══ 5. Le Badge ═════════════════════════════════════════════════════
   L'histogramme vegetal dans la tuile de la marque. C'est le signe du
   registre entreprise verte, celui qui se pose seul sur un document. */
function badge(c, { petit = false } = {}) {
  const t = petit ? 9 : 6.5;
  const rangs = petit ? [[38, 56, 20, 10], [62, 40, 24, 10]] : [[32, 62, 16, 8.4], [50, 51, 19, 8.4], [68, 40, 22, 8.4]];
  return `<rect x="10" y="10" width="80" height="80" rx="${f(80 * RAYON_TUILE)}" fill="none" stroke="${c}" stroke-width="${t}"/>`
    + rangs.map(([x, yH, L, w]) => brin(x, yH, L, w, c, 74)).join('');
}

export const PISTES = [
  { cle: 'fleche-feuillue', nom: 'La Flèche feuillue', signe: flecheFeuillue, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.40, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.5, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'courbe', nom: 'La Courbe', signe: courbe, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.52, ecartH: 0.26, ecartV: 0.22, largeurMotV: 1.1, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'trois-pousses', nom: 'Les Trois pousses', signe: troisPousses, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.52, ecartH: 0.26, ecartV: 0.22, largeurMotV: 1.1, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'escalier', nom: "L'Escalier", signe: escalier, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.54, ecartH: 0.26, ecartV: 0.22, largeurMotV: 1.05, occupation: 0.64, occupationPetit: 0.72 },
  { cle: 'badge', nom: 'Le Badge', signe: badge, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.44, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.05, occupation: 0.64, occupationPetit: 0.72 },
];

/* ── Reperes de construction ────────────────────────────────────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
function cerclesFeuille(x, y, L, so, si, angle, miroir = false) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})${miroir ? ' scale(-1 1)' : ''}">`
    + `<circle cx="${f(so - Ro)}" cy="${f(-L / 2)}" r="${Ro}" fill="none"/>`
    + `<circle cx="${f(Ri - si)}" cy="${f(-L / 2)}" r="${Ri}" fill="none"/>` + axe(0, 5, 0, -L - 5) + `</g>`;
}

export const REPERES = {
  'fleche-feuillue': () => axe(50, -4, 50, 104) + axe(-4, 40, 104, 40) + axe(-4, 88, 104, 88) + axe(-4, 70, 104, 70) + axe(-4, 96, 104, 96)
    + cerclesFeuille(50, 88, 36, 9, 4.5, 44) + cerclesFeuille(50, 70, 30.96, 7.8, 4, -40, true),
  courbe: () => `<path d="M8 88C34 86 52 74 66 40" fill="none"/>` + axe(8, 88, 34, 86) + axe(34, 86, 52, 74) + axe(52, 74, 66, 40)
    + cerclesFeuille(42, 78, 30, 8.5, 4.5, -46, true) + axe(-4, 88, 104, 88),
  'trois-pousses': () => [70, 54, 36].map((y, i) => axe(-4, y, 104, y) + axe(22 + i * 28, y - 4, 22 + i * 28, 104)).join('') + axe(-4, 94, 104, 94),
  escalier: () => [[26, 80, 26], [50, 62, 32], [76, 42, 38]].map(([x, y, L]) => cerclesFeuille(x, y, L, L * 0.27, L * 0.14, 42)).join('')
    + axe(26, 80, 76, 42),
  badge: () => `<rect x="10" y="10" width="80" height="80" rx="${f(80 * RAYON_TUILE)}" fill="none"/>`
    + `<circle cx="${f(10 + 80 * RAYON_TUILE)}" cy="${f(10 + 80 * RAYON_TUILE)}" r="${f(80 * RAYON_TUILE)}" fill="none"/>`
    + [62, 51, 40].map((y, i) => axe(14, y, 86, y) + axe(32 + i * 18, y - 4, 32 + i * 18, 78)).join('') + axe(14, 74, 86, 74),
};

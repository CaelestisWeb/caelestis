/* Troisieme serie, septembre 2026 : la pousse et le carre.

   Celestin a retenu deux signes de la serie precedente, la Pousse et la
   Fenetre, en demandant un dessin plus soigne. Cette serie croise les deux et
   ne fait varier qu'un parametre : la place du carre. Aucun carre, le carre
   dans la feuille, en cime, autour, au pied.

   Trois defauts de la serie precedente sont corriges ici, et tout le reste en
   decoule :
   1. Les feuilles etaient des amandes symetriques, donc mortes. Chaque feuille
      a maintenant un ventre et un dos, deux arcs de rayons differents.
   2. Elles flottaient a cote de la tige. Chaque feuille pivote sur son point
      d'attache, pose sur l'axe de la tige.
   3. La tige avait la meme epaisseur du pied a la cime, ce qu'aucune plante ne
      fait. Elle est fuselee, et son pied s'evase quand elle porte un arbre.

   Le carre n'est pas un rectangle quelconque : c'est la tuile de la marque,
   rayon d'angle a 24 % du cote, la valeur du monogramme en service. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);
/* Rayon d'un arc decrit par sa corde et sa fleche. */
const rayon = (fleche, corde) => f((fleche * fleche + (corde / 2) ** 2) / (2 * fleche));

/* Rayon d'angle de la tuile Caelestis : 24 % du cote (identite/logo). */
export const RAYON_TUILE = 0.24;

/* ── La feuille ───────────────────────────────────────────────────────
   Base au point d'attache, pointe a `L` de la, ventre `so` d'un cote et dos
   `si` de l'autre. Elle pivote sur sa base : changer l'inclinaison ne deplace
   jamais l'attache. */
function feuille(x, y, L, so, si, angle, { couleur, miroir = false }) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  const d = `M0 0A${Ro} ${Ro} 0 0 1 0 ${-L}A${Ri} ${Ri} 0 0 1 0 0Z`;
  return `<path transform="translate(${f(x)} ${f(y)}) rotate(${angle})${miroir ? ' scale(-1 1)' : ''}" d="${d}" fill="${couleur}"/>`;
}

const paire = (x, y, L, so, si, angle, couleur) =>
  feuille(x, y, L, so, si, angle, { couleur })
  + feuille(x, y, L, so, si, -angle, { couleur, miroir: true });

/* ── La tuile pointue ─────────────────────────────────────────────────
   Le carre arrondi de l'icone dont deux angles opposes se ferment en pointe.
   La tuile et la feuille deviennent la meme forme. Le trace pivote sur son
   angle superieur gauche, sa pointe opposee est a cote fois racine de deux, et
   sa diagonale part a 45 degres : viser une inclinaison T depuis la verticale
   demande donc une rotation de -45 moins (90 moins T). */
const viser = (T) => f(-45 - (90 - T));

function tuilePointue(x, y, cote, rayonAngle, T, couleur) {
  const S = f(cote), r = f(rayonAngle);
  const d = `M0 0L${f(S - r)} 0A${r} ${r} 0 0 1 ${S} ${r}L${S} ${S}L${r} ${S}A${r} ${r} 0 0 1 0 ${f(S - r)}Z`;
  return `<path transform="translate(${f(x)} ${f(y)}) rotate(${viser(T)})" d="${d}" fill="${couleur}"/>`;
}

/* ── La tige fuselee ──────────────────────────────────────────────────
   Plus large au pied qu'a la naissance des feuilles. L'ecart est faible et se
   voit quand meme : il donne au signe son sens de lecture, de bas en haut. */
const tige = (yBas, yHaut, wBas, wHaut, couleur) =>
  `<path d="M${f(50 - wBas / 2)} ${yBas}L${f(50 - wHaut / 2)} ${yHaut}L${f(50 + wHaut / 2)} ${yHaut}L${f(50 + wBas / 2)} ${yBas}Z" fill="${couleur}"/>`;

const carre = (x, y, cote, couleur, trait = 0) => {
  const r = f(cote * RAYON_TUILE);
  return `<rect x="${x}" y="${y}" width="${cote}" height="${cote}" rx="${r}"`
    + (trait ? ` fill="none" stroke="${couleur}" stroke-width="${trait}"/>` : ` fill="${couleur}"/>`);
};

/* ══ 1. La Pousse : le signe seul, aucun carre ═══════════════════════ */
function pousse(c, { petit = false } = {}) {
  return petit
    ? tige(96, 46, 13, 10, c) + paire(50, 51, 46, 14, 7.5, 33, c)
    : tige(96, 44, 11, 8.4, c) + paire(50, 50, 48, 13.5, 7.5, 33, c);
}

/* ══ 2. La Pousse carree : le carre est dans la feuille ══════════════ */
function pousseCarree(c, { petit = false } = {}) {
  const cote = petit ? 33 : 31;
  return tige(96, petit ? 48 : 47, petit ? 13 : 11, petit ? 10 : 8.4, c)
    + tuilePointue(50, petit ? 52 : 51, cote, cote * (petit ? 0.42 : 0.48), 35, c)
    + tuilePointue(50, petit ? 52 : 51, cote, cote * (petit ? 0.42 : 0.48), -35, c);
}

/* ══ 3. L'Arbre-ecran : le carre est la cime ═════════════════════════ */
function arbreEcran(c, { petit = false } = {}) {
  const cote = petit ? 62 : 56;
  const x = f(50 - cote / 2);
  return carre(x, 8, cote, c) + tige(93, f(8 + cote - 3), petit ? 18 : 16, petit ? 10 : 8.5, c);
}

/* ══ 4. La Pousse cadree : le carre entoure ══════════════════════════ */
function pousseCadree(c, { petit = false } = {}) {
  const t = petit ? 8.5 : 6;
  return carre(8, 8, 84, c, t)
    + tige(92, petit ? 50 : 48, petit ? 11 : 9.5, petit ? 9 : 7.8, c)
    + paire(50, petit ? 54 : 53, petit ? 34 : 38, petit ? 11 : 11, 6, 36, c);
}

/* ══ 5. La Pousse au socle : le carre est le sol ═════════════════════ */
function pousseSocle(c, { petit = false } = {}) {
  const l = petit ? 46 : 40, h = petit ? 36 : 34;
  const x = f(50 - l / 2), y = f(94 - h);
  const r = f(Math.min(l, h) * RAYON_TUILE);
  return `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${r}" fill="${c}"/>`
    + tige(f(y + 4), petit ? 32 : 30, petit ? 12 : 10, petit ? 9.5 : 8, c)
    + paire(50, petit ? 37 : 35, petit ? 40 : 42, 12, 6.5, 38, c);
}

export const PISTES = [
  { cle: 'pousse', nom: 'La Pousse', signe: pousse, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.42, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.5, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'pousse-carree', nom: 'La Pousse carrée', signe: pousseCarree, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.42, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.45, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'arbre-ecran', nom: "L'Arbre-écran", signe: arbreEcran, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.40, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.7, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'pousse-cadree', nom: 'La Pousse cadrée', signe: pousseCadree, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.42, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.05, occupation: 0.64, occupationPetit: 0.72 },
  { cle: 'pousse-socle', nom: 'La Pousse au socle', signe: pousseSocle, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.42, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.5, occupation: 0.66, occupationPetit: 0.74 },
];

/* ── Reperes de construction, memes valeurs que les signes ─────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;

/* Les deux cercles porteurs d'une feuille : le ventre et le dos. */
function cerclesFeuille(x, y, L, so, si, angle, miroir = false) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})${miroir ? ' scale(-1 1)' : ''}">`
    + `<circle cx="${f(so - Ro)}" cy="${f(-L / 2)}" r="${Ro}" fill="none"/>`
    + `<circle cx="${f(Ri - si)}" cy="${f(-L / 2)}" r="${Ri}" fill="none"/>`
    + axe(0, 6, 0, -L - 6) + `</g>`;
}
const cerclesPaire = (x, y, L, so, si, a) => cerclesFeuille(x, y, L, so, si, a) + cerclesFeuille(x, y, L, so, si, -a, true);
const boite = (x, y, l, h) => `<rect x="${f(x)}" y="${f(y)}" width="${f(l)}" height="${f(h)}" fill="none"/>`;

export const REPERES = {
  pousse: () => cerclesPaire(50, 50, 48, 13.5, 7.5, 33) + axe(50, -4, 50, 104) + axe(-4, 50, 104, 50) + axe(-4, 96, 104, 96),
  'pousse-carree': () => boite(50 - 31 / 2, 51 - 31 / 2, 31, 31) + axe(50, -4, 50, 104) + axe(-4, 51, 104, 51)
    + `<circle cx="50" cy="51" r="${f(31 * Math.SQRT2 / 2)}" fill="none"/>`,
  'arbre-ecran': () => boite(22, 8, 56, 56) + axe(50, -4, 50, 104) + axe(-4, 61, 104, 61) + axe(-4, 93, 104, 93)
    + `<circle cx="${f(22 + 56 * RAYON_TUILE)}" cy="${f(8 + 56 * RAYON_TUILE)}" r="${f(56 * RAYON_TUILE)}" fill="none"/>`,
  'pousse-cadree': () => boite(8, 8, 84, 84) + cerclesPaire(50, 53, 38, 11, 6, 36) + axe(50, -4, 50, 104)
    + `<circle cx="${f(8 + 84 * RAYON_TUILE)}" cy="${f(8 + 84 * RAYON_TUILE)}" r="${f(84 * RAYON_TUILE)}" fill="none"/>`,
  'pousse-socle': () => boite(30, 60, 40, 34) + cerclesPaire(50, 35, 42, 12, 6.5, 38) + axe(50, -4, 50, 104) + axe(-4, 60, 104, 60),
};

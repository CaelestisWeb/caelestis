/* Cinquieme serie, septembre 2026 : cinq reglages de la Fleche feuillue.

   Celestin a retenu la Fleche feuillue de la serie precedente et ecarte les
   quatre autres. Cette serie ne cherche donc plus d'idee : elle fait varier un
   seul parametre a la fois sur le signe retenu, comme la troisieme serie
   l'avait fait pour la Pousse.

   Piste 1, le signe tel qu'il a ete retenu, sans retouche.
   Piste 2, la proportion de la tete et de la hampe.
   Piste 3, le nombre de feuilles.
   Piste 4, le fuselage de la hampe.
   Piste 5, le carre autour.

   Les quatre reglages sont independants : ils se combinent une fois le choix
   fait, une tete elancee sur une hampe fuselee par exemple. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);
const rayon = (fleche, corde) => f((fleche * fleche + (corde / 2) ** 2) / (2 * fleche));
export const RAYON_TUILE = 0.24;

/* Feuille : base au point d'attache, pointe a `L`, ventre `so` et dos `si`.
   Meme dessin que la troisieme serie, sans retouche. */
function feuille(x, y, L, so, si, angle, { couleur, miroir = false }) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<path transform="translate(${f(x)} ${f(y)}) rotate(${angle})${miroir ? ' scale(-1 1)' : ''}" d="M0 0A${Ro} ${Ro} 0 0 1 0 ${-L}A${Ri} ${Ri} 0 0 1 0 0Z" fill="${couleur}"/>`;
}

/* Deux feuilles alternees, une de chaque cote et a deux hauteurs. Posees
   symetriquement elles formaient une seconde pointe, et le signe lisait comme
   une fleche a deux tetes. */
const alternees = (yA, yB, L, c) =>
  feuille(50, yA, L, 9, 4.5, 44, { couleur: c })
  + feuille(50, yB, f(L * 0.86), 7.8, 4, -40, { couleur: c, miroir: true });

/* Hampe droite et tete pleine, en un seul trace. */
const flecheDroite = (w, dt, yt, yPointe, c) => {
  const g = f(50 - w / 2), d = f(50 + w / 2);
  return `<path d="M${g} 96L${g} ${yt}L${f(50 - dt)} ${yt}L50 ${yPointe}L${f(50 + dt)} ${yt}L${d} ${yt}L${d} 96Z" fill="${c}"/>`;
};

/* Hampe fuselee : plus large au pied qu'a la naissance de la tete. */
const flecheFuselee = (wBas, wHaut, dt, yt, yPointe, c) => {
  const gB = f(50 - wBas / 2), dB = f(50 + wBas / 2), gH = f(50 - wHaut / 2), dH = f(50 + wHaut / 2);
  return `<path d="M${gB} 96L${gH} ${yt}L${f(50 - dt)} ${yt}L50 ${yPointe}L${f(50 + dt)} ${yt}L${dH} ${yt}L${dB} 96Z" fill="${c}"/>`;
};

/* ══ 1. La Fleche feuillue, telle que retenue ════════════════════════ */
function feuillue(c, { petit = false } = {}) {
  return petit
    ? flecheDroite(13, 19, 42, 10, c) + alternees(90, 72, 40, c)
    : flecheDroite(11, 16, 40, 12, c) + alternees(88, 70, 36, c);
}

/* ══ 2. L'Elancee : tete plus fine et plus haute, hampe plus etroite ═ */
function elancee(c, { petit = false } = {}) {
  return petit
    ? flecheDroite(12, 16, 44, 8, c) + alternees(90, 72, 38, c)
    : flecheDroite(10, 13.5, 44, 8, c) + alternees(90, 72, 34, c);
}

/* ══ 3. La Sobre : une seule feuille ═════════════════════════════════ */
function sobre(c, { petit = false } = {}) {
  return petit
    ? flecheDroite(13, 19, 42, 10, c) + feuille(50, 86, 44, 11, 5.5, 43, { couleur: c })
    : flecheDroite(11, 16, 40, 12, c) + feuille(50, 84, 40, 10, 5, 43, { couleur: c });
}

/* ══ 4. La Fuselee : la hampe s'evase au pied ════════════════════════ */
function fuselee(c, { petit = false } = {}) {
  return petit
    ? flecheFuselee(17, 11, 19, 42, 10, c) + alternees(90, 72, 40, c)
    : flecheFuselee(14, 9.5, 16, 40, 12, c) + alternees(88, 70, 36, c);
}

/* ══ 5. La Cadree : le signe dans la tuile de la marque ══════════════
   Le centre optique du signe tombe a (51, 54) et non au milieu de la boite :
   la tete occupe le haut et les feuilles debordent a droite. La mise a
   l'echelle vise donc ce point, sinon le signe parait pousse vers le bas. */
function cadree(c, { petit = false } = {}) {
  const t = petit ? 9 : 6.5;
  const k = petit ? 0.72 : 0.66;
  const dedans = petit ? feuillue(c, { petit: true }) : feuillue(c);
  return `<rect x="10" y="10" width="80" height="80" rx="${f(80 * RAYON_TUILE)}" fill="none" stroke="${c}" stroke-width="${t}"/>`
    + `<g transform="translate(50 50) scale(${k}) translate(-51 -54)">${dedans}</g>`;
}

/* ══ 6. La Combinee : la somme des trois reglages recommandes ════════
   Ce n'est pas un sixieme reglage, c'est le signe qu'on obtient en retenant
   la tete elancee, la hampe fuselee et les deux feuilles alternees. */
function combinee(c, { petit = false } = {}) {
  return petit
    ? flecheFuselee(15.5, 10.5, 16, 44, 8, c) + alternees(90, 72, 38, c)
    : flecheFuselee(13, 8.5, 13.5, 44, 8, c) + alternees(90, 72, 34, c);
}

export const PISTES = [
  { cle: 'feuillue', nom: 'La Flèche feuillue', signe: feuillue, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.40, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.5, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'elancee', nom: "L'Élancée", signe: elancee, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.38, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.55, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'sobre', nom: 'La Sobre', signe: sobre, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.40, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.5, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'fuselee', nom: 'La Fuselée', signe: fuselee, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.40, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.5, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'cadree', nom: 'La Cadrée', signe: cadree, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.42, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.05, occupation: 0.64, occupationPetit: 0.72 },
  { cle: 'combinee', nom: 'La Combinée', signe: combinee, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.38, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.55, occupation: 0.66, occupationPetit: 0.74 },
];

/* ── Reperes de construction ────────────────────────────────────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
function cerclesFeuille(x, y, L, so, si, angle, miroir = false) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})${miroir ? ' scale(-1 1)' : ''}">`
    + `<circle cx="${f(so - Ro)}" cy="${f(-L / 2)}" r="${Ro}" fill="none"/>`
    + `<circle cx="${f(Ri - si)}" cy="${f(-L / 2)}" r="${Ri}" fill="none"/>` + axe(0, 5, 0, -L - 5) + `</g>`;
}
const reperesAlternees = (yA, yB, L) => cerclesFeuille(50, yA, L, 9, 4.5, 44)
  + cerclesFeuille(50, yB, L * 0.86, 7.8, 4, -40, true) + axe(-4, yA, 104, yA) + axe(-4, yB, 104, yB);
const reperesTete = (dt, yt, yPointe) => axe(50 - dt, yt, 50, yPointe) + axe(50 + dt, yt, 50, yPointe)
  + axe(-4, yt, 104, yt) + axe(-4, yPointe, 104, yPointe);

export const REPERES = {
  feuillue: () => axe(50, -4, 50, 104) + axe(-4, 96, 104, 96) + reperesTete(16, 40, 12) + reperesAlternees(88, 70, 36),
  elancee: () => axe(50, -4, 50, 104) + axe(-4, 96, 104, 96) + reperesTete(13.5, 44, 8) + reperesAlternees(90, 72, 34),
  sobre: () => axe(50, -4, 50, 104) + axe(-4, 96, 104, 96) + reperesTete(16, 40, 12)
    + cerclesFeuille(50, 84, 40, 10, 5, 43) + axe(-4, 84, 104, 84),
  fuselee: () => axe(50, -4, 50, 104) + axe(-4, 96, 104, 96) + reperesTete(16, 40, 12) + reperesAlternees(88, 70, 36)
    + axe(43, 96, 45.25, 40) + axe(57, 96, 54.75, 40),
  combinee: () => axe(50, -4, 50, 104) + axe(-4, 96, 104, 96) + reperesTete(13.5, 44, 8) + reperesAlternees(90, 72, 34)
    + axe(43.5, 96, 45.75, 44) + axe(56.5, 96, 54.25, 44),
  cadree: () => `<rect x="10" y="10" width="80" height="80" rx="${f(80 * RAYON_TUILE)}" fill="none"/>`
    + `<circle cx="${f(10 + 80 * RAYON_TUILE)}" cy="${f(10 + 80 * RAYON_TUILE)}" r="${f(80 * RAYON_TUILE)}" fill="none"/>`
    + axe(50, -4, 50, 104) + axe(-4, 50, 104, 50),
};

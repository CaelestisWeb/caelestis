/* Sixieme serie, septembre 2026 : l'ordinateur-arbre.

   Demande de Celestin : un carre d'ordinateur avec du feuillage, ou un tronc
   et des racines. Le carre est la tuile de la marque, rayon d'angle a 24 % du
   cote, celui du monogramme en service.

   Trois reglages ont demande plusieurs essais avant de tenir.

   1. Une racine droite d'epaisseur constante lit comme un pied de chevalet.
      Elle est fuselee, courbee, et se termine en pointe.
   2. Trois racines longues et bien ecartees valent mieux que cinq courtes :
      au-dela de trois, le signe lit comme un insecte.
   3. Le tronc doit rester long et mince, 30 unites pour 9 de large. Avec un
      evasement marque, il disparait sous les racines et le signe devient une
      carotte. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);
const rayon = (fleche, corde) => f((fleche * fleche + (corde / 2) ** 2) / (2 * fleche));
export const RAYON_TUILE = 0.24;

/* Feuille : meme dessin que la troisieme serie, un ventre et un dos. */
function feuille(x, y, L, so, si, angle, { couleur, miroir = false }) {
  const Ro = rayon(so, L), Ri = rayon(si, L);
  return `<path transform="translate(${f(x)} ${f(y)}) rotate(${angle})${miroir ? ' scale(-1 1)' : ''}" d="M0 0A${Ro} ${Ro} 0 0 1 0 ${-L}A${Ri} ${Ri} 0 0 1 0 0Z" fill="${couleur}"/>`;
}

const tuile = (x, y, cote, couleur, trait = 0) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(cote)}" height="${f(cote)}" rx="${f(cote * RAYON_TUILE)}"`
  + (trait ? ` fill="none" stroke="${couleur}" stroke-width="${trait}"/>` : ` fill="${couleur}"/>`);

const tronc = (yH, yB, wH, wB, c) =>
  `<path d="M${f(50 - wH / 2)} ${yH}L${f(50 - wB / 2)} ${yB}L${f(50 + wB / 2)} ${yB}L${f(50 + wH / 2)} ${yH}Z" fill="${c}"/>`;

/* Racine fuselee : base de largeur w au point d'attache, pointe a distance L,
   deviation laterale `dev` en fraction de L. */
function racine(x, y, aDeg, L, w, dev, c) {
  const a = aDeg * Math.PI / 180;
  const dx = Math.sin(a), dy = Math.cos(a), px = Math.cos(a), py = -Math.sin(a);
  const tx = x + dx * L + px * L * dev, ty = y + dy * L + py * L * dev;
  const cx = x + dx * L * 0.5, cy = y + dy * L * 0.5;
  return `<path d="M${f(x + px * w / 2)} ${f(y + py * w / 2)}`
    + `Q${f(cx + px * w * 0.4)} ${f(cy + py * w * 0.4)} ${f(tx)} ${f(ty)}`
    + `Q${f(cx - px * w * 0.4)} ${f(cy - py * w * 0.4)} ${f(x - px * w / 2)} ${f(y - py * w / 2)}Z" fill="${c}"/>`;
}

/* Trois racines, la plus longue au centre, attachees au pied du tronc. */
const souche = (y, k, c) => racine(44, y - 2, -60, 22 * k, 8, 0.16, c)
  + racine(50, y, 0, 26 * k, 9, 0.05, c) + racine(56, y - 2, 60, 22 * k, 8, -0.16, c);

/* Cime festonnee : le bord haut de la tuile se decoupe en bosses, comme un
   buis taille. La tuile reste une tuile, le feuillage vient du contour. */
function cimeFestonnee(x, y, cote, bosses, h, c) {
  const r = cote * RAYON_TUILE, x0 = x, x1 = x + cote, y0 = y, y1 = y + cote;
  const bw = (cote - 2 * r) / bosses;
  const rb = f((bw * bw / 4 + h * h) / (2 * h));
  let d = `M${f(x0)} ${f(y0 + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x0 + r)} ${f(y0)}`;
  for (let i = 0; i < bosses; i += 1) d += `A${rb} ${rb} 0 0 1 ${f(x0 + r + bw * (i + 1))} ${f(y0)}`;
  d += `A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y0 + r)}L${f(x1)} ${f(y1 - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x1 - r)} ${f(y1)}`;
  d += `L${f(x0 + r)} ${f(y1)}A${f(r)} ${f(r)} 0 0 1 ${f(x0)} ${f(y1 - r)}Z`;
  return `<path d="${d}" fill="${c}"/>`;
}

/* ══ 1. L'Enracine : la tuile en cime, le tronc, les racines ═════════ */
function enracine(c, { petit = false } = {}) {
  return petit
    ? tuile(25, 4, 50, c) + tronc(52, 74, 12, 14, c) + souche(72, 0.72, c)
    : tuile(26, 4, 48, c) + tronc(52, 76, 9, 11, c) + souche(74, 0.82, c);
}

/* ══ 2. L'Ecran plante : les racines sortent du bord bas de l'ecran ══ */
function plante(c, { petit = false } = {}) {
  const t = petit ? 9 : 7;
  const cote = petit ? 62 : 58, x = f(50 - cote / 2), y = 6;
  const yb = f(y + cote + t / 2);
  return tuile(x, y, cote, c, t)
    + racine(38, yb - 2, -58, petit ? 22 : 26, petit ? 9.5 : 8.5, 0.2, c)
    + racine(50, yb, 0, petit ? 26 : 30, petit ? 10.5 : 9.5, 0.06, c)
    + racine(62, yb - 2, 58, petit ? 22 : 26, petit ? 9.5 : 8.5, -0.2, c);
}

/* ══ 3. La Festonnee : le buis taille ════════════════════════════════ */
function festonnee(c, { petit = false } = {}) {
  return petit
    ? cimeFestonnee(25, 6, 50, 3, 6, c) + tronc(54, 74, 12, 14, c) + souche(72, 0.72, c)
    : cimeFestonnee(26, 6, 48, 3, 5.5, c) + tronc(54, 76, 9, 11, c) + souche(74, 0.82, c);
}

/* ══ 4. La Reserve : l'arbre evide dans la tuile pleine ══════════════
   Les sous-traces interieurs se touchent sans jamais se recouvrir : la cime
   pose son bord bas sur le haut du tronc, les trois racines partent de trois
   segments voisins du bord bas du tronc. C'est ce qui permet a la regle
   evenodd de creuser un seul arbre plutot que de repeindre les recouvrements. */
function reserve(c, { petit = false } = {}) {
  const k = petit ? 1.12 : 1;
  const cy0 = petit ? 16 : 18, cy1 = petit ? 56 : 54;
  const cx0 = f(50 - 18 * k), cx1 = f(50 + 18 * k), r = f(8 * k);
  const yTronc = petit ? 70 : 68, wT = f(4 * k);
  const cime = `M${cx0} ${f(cy0 + r)}A${r} ${r} 0 0 1 ${f(cx0 + r)} ${cy0}L${f(cx1 - r)} ${cy0}A${r} ${r} 0 0 1 ${cx1} ${f(cy0 + r)}`
    + `L${cx1} ${f(cy1 - r)}A${r} ${r} 0 0 1 ${f(cx1 - r)} ${cy1}L${f(cx0 + r)} ${cy1}A${r} ${r} 0 0 1 ${cx0} ${f(cy1 - r)}Z`;
  const tr = `M${f(50 - wT)} ${cy1}L${f(50 - wT)} ${yTronc}L${f(50 + wT)} ${yTronc}L${f(50 + wT)} ${cy1}Z`;
  const prong = (x0, x1, aDeg, L) => {
    const a = aDeg * Math.PI / 180;
    return `M${f(x0)} ${yTronc}L${f(x1)} ${yTronc}L${f((x0 + x1) / 2 + Math.sin(a) * L)} ${f(yTronc + Math.cos(a) * L)}Z`;
  };
  const p = 50 - wT, q = 50 + wT, t1 = p + (q - p) / 3, t2 = p + (2 * (q - p)) / 3;
  return `<path fill-rule="evenodd" fill="${c}" d="M8 28A20 20 0 0 1 28 8L72 8A20 20 0 0 1 92 28L92 72A20 20 0 0 1 72 92L28 92A20 20 0 0 1 8 72Z `
    + `${cime} ${tr} ${prong(p, t1, -54, 17 * k)} ${prong(t1, t2, 0, 19 * k)} ${prong(t2, q, 54, 17 * k)}"/>`;
}

/* ══ 5. Le Feuillu : deux feuilles alternees sur le tronc ════════════ */
function feuillu(c, { petit = false } = {}) {
  return petit
    ? tuile(26, 4, 48, c) + tronc(50, 76, 11, 13, c)
      + feuille(50, 70, 24, 8, 4.5, 52, { couleur: c }) + feuille(50, 60, 21, 7, 4, -50, { couleur: c, miroir: true })
      + souche(74, 0.72, c)
    : tuile(27, 4, 46, c) + tronc(48, 78, 9, 11, c)
      + feuille(50, 72, 23, 7.5, 4, 54, { couleur: c }) + feuille(50, 62, 20, 6.5, 3.5, -52, { couleur: c, miroir: true })
      + souche(76, 0.78, c);
}

export const PISTES = [
  { cle: 'enracine', nom: "L'Enraciné", signe: enracine, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.40, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.35, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'plante', nom: "L'Écran planté", signe: plante, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.44, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.1, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'festonnee', nom: 'La Festonnée', signe: festonnee, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.40, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.35, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'reserve', nom: 'La Réserve', signe: reserve, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.42, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.05, occupation: 0.64, occupationPetit: 0.72 },
  { cle: 'feuillu', nom: 'Le Feuillu', signe: feuillu, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.40, ecartH: 0.22, ecartV: 0.18, largeurMotV: 1.35, occupation: 0.66, occupationPetit: 0.74 },
];

/* ── Reperes de construction ────────────────────────────────────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
const boite = (x, y, l) => `<rect x="${f(x)}" y="${f(y)}" width="${f(l)}" height="${f(l)}" fill="none"/>`;
const coin = (x, y, l) => `<circle cx="${f(x + l * RAYON_TUILE)}" cy="${f(y + l * RAYON_TUILE)}" r="${f(l * RAYON_TUILE)}" fill="none"/>`;
const axesRacines = (y) => [[-60, 22], [0, 26], [60, 22]].map(([a, L], i) => {
  const r = a * Math.PI / 180, x = [44, 50, 56][i], yy = i === 1 ? y : y - 2;
  return axe(x, yy, x + Math.sin(r) * L, yy + Math.cos(r) * L);
}).join('');

export const REPERES = {
  enracine: () => boite(26, 4, 48) + coin(26, 4, 48) + axe(50, -4, 50, 104) + axe(-4, 52, 104, 52) + axe(-4, 76, 104, 76) + axesRacines(74),
  plante: () => boite(21, 6, 58) + coin(21, 6, 58) + axe(50, -4, 50, 104) + axe(-4, 67.5, 104, 67.5)
    + [[-58, 26, 38], [0, 30, 50], [58, 26, 62]].map(([a, L, x]) => axe(x, 66, x + Math.sin(a * Math.PI / 180) * L, 66 + Math.cos(a * Math.PI / 180) * L)).join(''),
  festonnee: () => boite(26, 6, 48) + coin(26, 6, 48) + axe(50, -4, 50, 104) + axe(-4, 54, 104, 54) + axe(-4, 76, 104, 76)
    + axe(-4, 11.5, 104, 11.5) + axesRacines(74),
  reserve: () => boite(8, 8, 84) + coin(8, 8, 84) + boite(32, 18, 36) + axe(50, -4, 50, 104) + axe(-4, 54, 104, 54) + axe(-4, 68, 104, 68),
  feuillu: () => boite(27, 4, 46) + coin(27, 4, 46) + axe(50, -4, 50, 104) + axe(-4, 48, 104, 48) + axe(-4, 78, 104, 78)
    + axe(-4, 72, 104, 72) + axe(-4, 62, 104, 62) + axesRacines(76),
};

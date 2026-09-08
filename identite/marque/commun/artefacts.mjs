/* Composition des artefacts d'une piste : signe cadre, tuile, lockups.

   Ce module est la source unique : les fichiers SVG et la planche de
   presentation passent tous les deux par lui. Une planche qui redessinerait
   les lockups de son cote finirait par montrer autre chose que ce qui est
   livre, et l'ecart ne se verrait qu'a l'impression. */

import sharp from 'sharp';
import { INTERLETTRAGE, police, trace } from './base.mjs';

const MARGE = 20;            // marge de securite autour du carre de 100
const ECH = 8;               // pixels par unite lors de la mesure
const CADRE = 100 + 2 * MARGE;

/* Boite d'encre reelle d'un dessin, mesuree au pixel. Aucun calcul de
   geometrie n'est cru sur parole : une coupe de trait, un cap ou un trace
   de police deplacent le bord sans prevenir. */
export async function boiteEncre(dessin) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CADRE} ${CADRE}" width="${CADRE * ECH}" height="${CADRE * ECH}">`
    + `<g transform="translate(${MARGE} ${MARGE})">${dessin('#12160F')}</g></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let x0 = width, x1 = -1, y0 = height, y1 = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * channels + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return {
    x0: +(x0 / ECH - MARGE).toFixed(3), y0: +(y0 / ECH - MARGE).toFixed(3),
    x1: +((x1 + 1) / ECH - MARGE).toFixed(3), y1: +((y1 + 1) / ECH - MARGE).toFixed(3),
  };
}

/* Mot en traces, dimensionne par sa hauteur d'encre. */
function mot(texte, poids, hauteurVoulue, couleur) {
  const font = police(poids);
  const sonde = trace(font, texte, 100, { ls: INTERLETTRAGE * 100 });
  const taille = (100 * hauteurVoulue) / sonde.hauteur;
  const ls = INTERLETTRAGE * taille;
  const m = trace(font, texte, taille, { ls });
  return { boite: m, poser: (x, y) => trace(font, texte, taille, { x: x - m.gauche, y: y - m.haut, couleur, ls }).markup };
}
/* Meme chose, dimensionnee par la largeur d'encre. */
function motLarge(texte, poids, largeurVoulue, couleur) {
  const font = police(poids);
  const s = trace(font, texte, 100, { ls: INTERLETTRAGE * 100 });
  return mot(texte, poids, (largeurVoulue * s.hauteur) / s.largeur, couleur);
}

/* Prepare une piste : boites d'encre mesurees, puis les composeurs. */
export async function preparer(p) {
  const b = await boiteEncre((c) => p.signe(c));
  const bp = await boiteEncre((c) => p.signe(c, { petit: true }));
  const sw = +(b.x1 - b.x0).toFixed(3);
  const sh = +(b.y1 - b.y0).toFixed(3);
  const poids = p.motPoids || 500;

  /* Un signe circulaire se cadre sur son cercle et non sur son encre : sa
     fente laisse un vide d'un cote, et caler le fichier dessus ferait
     paraitre le signe pousse a l'oppose des qu'on le centre. */
  const carre = p.cadre === 'carre';
  const cote = Math.max(sw, sh);
  const orig = Math.min(b.x0, b.y0);

  const signe = (couleur) => ({
    vb: carre ? `${orig} ${orig} ${cote} ${cote}` : `${b.x0} ${b.y0} ${sw} ${sh}`,
    l: carre ? cote : sw,
    h: carre ? cote : sh,
    corps: p.signe(couleur),
  });

  const tuile = (fond, encre, petit = false) => {
    const bb = petit ? bp : b;
    const l = bb.x1 - bb.x0, h = bb.y1 - bb.y0;
    const occ = petit ? (p.occupationPetit || 0.7) : (p.occupation || 0.62);
    const k = (100 * occ) / Math.max(l, h);
    const dx = 50 - k * (bb.x0 + l / 2);
    const dy = 50 - k * (bb.y0 + h / 2);
    return {
      vb: '0 0 100 100', l: 100, h: 100,
      corps: `<rect width="100" height="100" rx="24" fill="${fond}"/>`
        + `<g transform="translate(${dx.toFixed(3)} ${dy.toFixed(3)}) scale(${k.toFixed(5)})">${p.signe(encre, { petit })}</g>`,
    };
  };

  const lockupH = (couleur, texte = p.mot) => {
    const m = mot(texte, poids, p.ratioMot * sh, couleur);
    const x = b.x1 + p.ecartH * sh;
    const y = b.y0 + (sh - m.boite.hauteur) / 2;
    const yh = Math.min(b.y0, y), yb = Math.max(b.y1, y + m.boite.hauteur);
    const l = +(x + m.boite.largeur - b.x0).toFixed(3), h = +(yb - yh).toFixed(3);
    return { vb: `${b.x0} ${yh} ${l} ${h}`, l, h, corps: p.signe(couleur) + m.poser(x, y) };
  };

  const lockupV = (couleur, texte = p.mot) => {
    const m = motLarge(texte, poids, (p.largeurMotV || 1.05) * sw, couleur);
    const y = b.y1 + p.ecartV * sh;
    const x = b.x0 + sw / 2 - m.boite.largeur / 2;
    const gx = Math.min(b.x0, x), dx = Math.max(b.x1, x + m.boite.largeur);
    const l = +(dx - gx).toFixed(3), h = +(y + m.boite.hauteur - b.y0).toFixed(3);
    return { vb: `${gx} ${b.y0} ${l} ${h}`, l, h, corps: p.signe(couleur) + m.poser(x, y) };
  };

  return { p, b, bp, sw, sh, signe, tuile, lockupH, lockupV };
}

/* Enveloppe SVG. width et height ne sont qu'une taille par defaut, calee sur
   1000 px de large : un import qui les lit sans mise a l'echelle (Word,
   Canva) donnerait sinon une vignette de soixante pixels. */
export const enveloppe = ({ vb, corps, l, h }, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="1000" height="${Math.round((h * 1000) / l)}" role="img" aria-label="${label}"><title>${label}</title>\n  ${corps}\n</svg>\n`;

import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const ID = 'C:/dev/caelestis/identite';
// Source unique des polices : celles du site en production
const FONTS = 'C:/dev/caelestis/src/assets/fonts/';
const b64 = (f) => readFileSync(FONTS + f).toString('base64');
const F500 = b64('satoshi-500.woff2');
const F700 = b64('satoshi-700.woff2');

const VERT = '#255C41';
const CREME = '#FCFBF8';
const ENCRE = '#12160F';

// Metriques relevees dans le navigateur (Satoshi, font-size 100, letter-spacing -2)
const M = {
  500: { inkLeft: -3, inkRight: 406.3, cap: 74, desc: 2, adv: 409.9 },
  700: { inkLeft: -3, inkRight: 422.3, cap: 75, desc: 2, adv: 426.4 },
};

const faces = (poids) => `
  <style>
    @font-face{font-family:'Satoshi';font-weight:500;src:url(data:font/woff2;base64,${F500}) format('woff2')}
    ${poids === 700 ? `@font-face{font-family:'Satoshi';font-weight:700;src:url(data:font/woff2;base64,${F700}) format('woff2')}` : ''}
  </style>`;

const ARC = (couleur) => `<path d="M67.66 27 A29 29 0 1 0 67.66 73" fill="none" stroke="${couleur}" stroke-width="15"/>`;

/* ── Wordmark seul ─────────────────────────────────────────── */
function wordmark(poids, couleur, nom) {
  const m = M[poids];
  const w = +(m.inkRight - m.inkLeft).toFixed(2);
  const h = +(m.cap + m.desc).toFixed(2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${Math.round(w * 2)}" height="${Math.round(h * 2)}" role="img" aria-label="Caelestis">${faces(poids)}
  <text x="${-m.inkLeft}" y="${m.cap}" font-family="Satoshi" font-weight="${poids}" font-size="100" letter-spacing="-2" fill="${couleur}">Caelestis.</text>
</svg>
`;
  writeFileSync(`${ID}/logo/${nom}.svg`, svg);
  return { w, h };
}

/* ── Lockup horizontal : monogramme + wordmark ─────────────── */
function lockupH(fondTuile, arc, texte, nom) {
  const m = M[500];
  const ech = 0.82;              // font-size 82 pour une tuile de 100
  const larg = +(m.inkRight - m.inkLeft).toFixed(2) * ech;
  const ecart = 28;
  const baseline = +(50 + (m.cap * ech) / 2 - (m.desc * ech) / 2).toFixed(2);
  const total = +(100 + ecart + larg).toFixed(2);
  const tuile = fondTuile ? `<rect width="100" height="100" rx="24" fill="${fondTuile}"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} 100" width="${Math.round(total * 3)}" height="300" role="img" aria-label="Caelestis">${faces(500)}
  ${tuile}
  ${ARC(arc)}
  <text x="${(100 + ecart - m.inkLeft * ech).toFixed(2)}" y="${baseline}" font-family="Satoshi" font-weight="500" font-size="${100 * ech}" letter-spacing="${(-2 * ech).toFixed(2)}" fill="${texte}">Caelestis.</text>
</svg>
`;
  writeFileSync(`${ID}/logo/${nom}.svg`, svg);
}

/* ── Lockup vertical ───────────────────────────────────────── */
function lockupV(fondTuile, arc, texte, nom) {
  const m = M[500];
  const ech = 0.68;
  const larg = +((m.inkRight - m.inkLeft) * ech).toFixed(2);
  const ecart = 26;
  const baseline = +(100 + ecart + m.cap * ech).toFixed(2);
  const hTot = +(baseline + m.desc * ech).toFixed(2);
  const tuileX = +((larg - 100) / 2).toFixed(2);
  const tuile = fondTuile ? `<rect x="${tuileX}" width="100" height="100" rx="24" fill="${fondTuile}"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${larg} ${hTot}" width="${Math.round(larg * 3)}" height="${Math.round(hTot * 3)}" role="img" aria-label="Caelestis">${faces(500)}
  <g transform="translate(${tuileX},0)">${fondTuile ? `<rect width="100" height="100" rx="24" fill="${fondTuile}"/>` : ''}${ARC(arc)}</g>
  <text x="${(-m.inkLeft * ech).toFixed(2)}" y="${baseline}" font-family="Satoshi" font-weight="500" font-size="${100 * ech}" letter-spacing="${(-2 * ech).toFixed(2)}" fill="${texte}">Caelestis.</text>
</svg>
`;
  writeFileSync(`${ID}/logo/${nom}.svg`, svg);
}

wordmark(500, VERT, 'wordmark-vert');
wordmark(500, CREME, 'wordmark-creme');
wordmark(700, ENCRE, 'wordmark-encre-700');

lockupH(CREME, VERT, VERT, 'lockup-horizontal-sur-clair');
lockupH(null, CREME, CREME, 'lockup-horizontal-sur-vert');
lockupV(CREME, VERT, VERT, 'lockup-vertical-sur-clair');
lockupV(null, CREME, CREME, 'lockup-vertical-sur-vert');

/* ── PNG du monogramme (geometrie pure, aucun texte) ───────── */
const png = async (fichier, sortie, taille) => {
  await sharp(Buffer.from(readFileSync(`${ID}/logo/${fichier}`)), { density: 600 })
    .resize(taille, taille, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(`${ID}/logo/${sortie}`);
};

await png('monogramme-vert-sur-creme.svg', 'monogramme-vert-sur-creme-1024.png', 1024);
await png('monogramme-creme-sur-vert.svg', 'monogramme-creme-sur-vert-1024.png', 1024);

console.log('Logos generes.');

/* Famille complete d'exports de l'Ecran plante.
   node identite/marque/build-exports.mjs

   Une seule chaine remplace les six scripts du monogramme (build-exports,
   build-favicon, build-og, build-reseaux, et leurs dependances), qui portaient
   tous C:/dev/sites/caelestis en dur et ne tournaient donc que sur un poste, depuis
   ce chemin exact. Ici tout se resout depuis import.meta.url.

   Les SVG de signe/ sont la source : ils sont ecrits et mesures par
   build-signe.mjs, jamais redessines ici. Un export qui reconstruirait la
   forme de son cote finirait par montrer autre chose que ce qui est livre. */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import sharp from 'sharp';
import { police, trace, INTERLETTRAGE, VERT, CREME } from './commun/base.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const SORTIE = `${ICI}/exports`;
for (const d of ['png', 'aplat', 'favicon', 'google', 'reseaux', 'partage']) {
  mkdirSync(`${SORTIE}/${d}`, { recursive: true });
}

const lire = (dossier, nom) => readFileSync(`${ICI}/${dossier}/${nom}.svg`, 'utf8');
const boite = (svg) => svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const interieur = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

/* Rasterisation. La densite elevee fait calculer le trace bien au-dessus de la
   taille demandee, la reduction fait le reste : un contour de 7,5 unites reste
   net a 512 px comme a 3000. */
const rendre = (svg, dim) =>
  sharp(Buffer.from(svg), { density: 600 })
    .resize({ ...dim, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

async function png(svg, sortie, dim) {
  await rendre(svg, dim).png({ compressionLevel: 9 }).toFile(`${SORTIE}/${sortie}.png`);
}
async function pngEtJpg(svg, sortie, dim, fond) {
  await png(svg, sortie, dim);
  await sharp(Buffer.from(svg), { density: 600 })
    .resize({ ...dim, fit: 'contain', background: fond })
    .flatten({ background: fond })
    /* 4:4:4 : sans cela le JPEG fait baver le vert sur le creme le long des
       angles arrondis de l'ecran. */
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(`${SORTIE}/${sortie}.jpg`);
}

/* Zone de protection de la charte : la moitie de la hauteur du signe sur les
   quatre cotes. Sur un lockup horizontal le signe fait toute la hauteur du
   fichier ; sur un lockup vertical il n'en fait qu'une part, la marge se
   mesure alors sur le signe seul. */
const PROTECTION = 0.5;
const HAUTEUR_SIGNE = boite(lire('signe', 'signe-vert'))[3];

function surAplat(dossier, nom, fond, marge) {
  const svg = lire(dossier, nom);
  const [vx, vy, vl, vh] = boite(svg);
  const m = +marge.toFixed(2);
  const L = +(vl + m * 2).toFixed(2), H = +(vh + m * 2).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${Math.round(L)}" height="${Math.round(H)}">
  <rect width="${L}" height="${H}" fill="${fond}"/>
  <g transform="translate(${(m - vx).toFixed(2)} ${(m - vy).toFixed(2)})">${interieur(svg)}</g>
</svg>`;
}

const faits = [];
const note = (n) => faits.push(n);

/* ══ 1. Fonds transparents ═══════════════════════════════════════════ */
const TRANSPARENTS = [
  ['signe', 'signe-vert', 'signe-vert', { height: 512 }, { height: 1536 }],
  ['signe', 'signe-creme', 'signe-creme', { height: 512 }, { height: 1536 }],
  ['signe', 'signe-encre', 'signe-encre', { height: 512 }, { height: 1536 }],
  ['signe', 'lockup-horizontal-vert', 'lockup-horizontal-vert', { width: 1000 }, { width: 3000 }],
  ['signe', 'lockup-horizontal-creme', 'lockup-horizontal-creme', { width: 1000 }, { width: 3000 }],
  ['signe', 'lockup-horizontal-encre', 'lockup-horizontal-encre', { width: 1000 }, { width: 3000 }],
  ['signe', 'lockup-vertical-vert', 'lockup-vertical-vert', { height: 700 }, { height: 2100 }],
  ['signe', 'lockup-vertical-creme', 'lockup-vertical-creme', { height: 700 }, { height: 2100 }],
  ['signe', 'lockup-mot-a-l-ecran-vert', 'mot-a-l-ecran-vert', { width: 1000 }, { width: 3000 }],
  ['signe', 'lockup-mot-a-l-ecran-creme', 'mot-a-l-ecran-creme', { width: 1000 }, { width: 3000 }],
  ['mot', 'wordmark-vert', 'mot-vert', { width: 1000 }, { width: 3000 }],
  ['mot', 'wordmark-creme', 'mot-creme', { width: 1000 }, { width: 3000 }],
];
for (const [dossier, source, nom, petit, grand] of TRANSPARENTS) {
  const svg = lire(dossier, source);
  await png(svg, `png/${nom}-${petit.width ?? petit.height}`, petit);
  await png(svg, `png/${nom}-${grand.width ?? grand.height}`, grand);
}
note(`png/ : ${TRANSPARENTS.length * 2} fichiers a fond transparent`);

/* ══ 2. Fonds pleins, zone de protection respectee ═══════════════════ */
for (const [source, fond, nom, dim] of [
  ['lockup-horizontal-vert', CREME, 'lockup-horizontal-sur-creme', { width: 2000 }],
  ['lockup-horizontal-creme', VERT, 'lockup-horizontal-sur-vert', { width: 2000 }],
  ['lockup-vertical-vert', CREME, 'lockup-vertical-sur-creme', { height: 2000 }],
  ['lockup-vertical-creme', VERT, 'lockup-vertical-sur-vert', { height: 2000 }],
]) {
  await pngEtJpg(surAplat('signe', source, fond, HAUTEUR_SIGNE * PROTECTION), `aplat/${nom}`, dim, fond);
}
/* Tuiles carrees, utiles des qu'un service impose un carre. */
for (const [source, fond, nom] of [
  ['tuile-creme-sur-vert', VERT, 'tuile-vert'],
  ['tuile-vert-sur-creme', CREME, 'tuile-creme'],
  ['tuile-mot-creme-sur-vert', VERT, 'tuile-mot-vert'],
  ['tuile-mot-vert-sur-creme', CREME, 'tuile-mot-creme'],
]) {
  const svg = lire('signe', source);
  await png(svg, `aplat/${nom}-1024`, { width: 1024, height: 1024 });
  await pngEtJpg(svg, `aplat/${nom}-512`, { width: 512, height: 512 }, fond);
}
note('aplat/ : 4 lockups et 4 tuiles sur fond plein, PNG et JPEG');

/* ══ 3. Favicons et icones d'application ═════════════════════════════
   Le favicon est la version optique du signe, redessinee pour la petite
   taille : contour a 8 au lieu de 7,5, col et ligne d'une unite de plus. Ce
   n'est pas la tuile reduite. Ces fichiers sont ecrits ici et non dans
   public/ : le site tourne encore sous le monogramme, le basculement est un
   geste a part. */
const svgFavicon = lire('signe', 'favicon');
writeFileSync(`${SORTIE}/favicon/favicon.svg`, svgFavicon);
for (const [taille, nom] of [
  [16, 'favicon-16.png'], [32, 'favicon-32.png'], [180, 'apple-touch-icon.png'],
  [192, 'icon-192.png'], [512, 'icon-512.png'], [512, 'favicon.png'],
]) {
  await png(svgFavicon, `favicon/${nom.replace('.png', '')}`, { width: taille, height: taille });
}

/* favicon.ico : conteneur assemble a la main, aucune dependance ne le fait.
   En-tete de 6 octets, puis une entree de 16 par image, puis les PNG bruts. */
const TAILLES_ICO = [16, 32, 48];
const imagesIco = await Promise.all(
  TAILLES_ICO.map((t) => rendre(svgFavicon, { width: t, height: t }).png({ compressionLevel: 9 }).toBuffer()),
);
const entete = Buffer.alloc(6);
entete.writeUInt16LE(0, 0); entete.writeUInt16LE(1, 2); entete.writeUInt16LE(TAILLES_ICO.length, 4);
let decalage = 6 + 16 * TAILLES_ICO.length;
const entrees = imagesIco.map((img, i) => {
  const e = Buffer.alloc(16);
  e[0] = TAILLES_ICO[i] === 256 ? 0 : TAILLES_ICO[i];
  e[1] = TAILLES_ICO[i] === 256 ? 0 : TAILLES_ICO[i];
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(img.length, 8); e.writeUInt32LE(decalage, 12);
  decalage += img.length;
  return e;
});
writeFileSync(`${SORTIE}/favicon/favicon.ico`, Buffer.concat([entete, ...entrees, ...imagesIco]));
note(`favicon/ : favicon.svg, 6 PNG et favicon.ico (${TAILLES_ICO.join(', ')} px)`);

/* ══ 4. Fiche d'etablissement Google ═════════════════════════════════
   Logo carre de 720, que Google recadre en cercle a plusieurs endroits : le
   signe est donc pose seul et assez petit pour survivre au rognage.
   Couverture en 1024 x 576, le 16:9 attendu. */
const G = 720;
for (const [nom, fond, encre] of [['logo-720-vert', VERT, CREME], ['logo-720-creme', CREME, VERT]]) {
  const svg = lire('signe', encre === CREME ? 'signe-creme' : 'signe-vert');
  const [vx, vy, vl, vh] = boite(svg);
  const k = (G * 0.52) / Math.max(vl, vh);
  const carre = `<svg xmlns="http://www.w3.org/2000/svg" width="${G}" height="${G}" viewBox="0 0 ${G} ${G}">
  <rect width="${G}" height="${G}" fill="${fond}"/>
  <g transform="translate(${(G / 2 - k * (vx + vl / 2)).toFixed(2)} ${(G / 2 - k * (vy + vh / 2)).toFixed(2)}) scale(${k.toFixed(5)})">${interieur(svg)}</g>
</svg>`;
  await pngEtJpg(carre, `google/${nom}`, { width: G, height: G }, fond);
}
note('google/ : logo 720 sur vert et sur creme, PNG et JPEG');

/* ══ 5. Bandeau commun aux couvertures et a l'image de partage ═══════
   Le lockup horizontal a gauche, la promesse dessous, le tout centre dans la
   hauteur. Les positions se deduisent des mesures d'encre : rien n'est pose a
   la main, les marges restent donc egales par construction. */
const f400 = police(400), f500 = police(500), f700 = police(700);
const PROMESSE = ['Des sites web pour ceux qui créent,', 'cultivent et bâtissent avec passion.'];

function bandeau({ L, H, marge, hauteurSigne, taillePromesse, interligne, pied }) {
  /* Le lockup livre est pose tel quel, jamais reassemble. Recomposer le signe
     et le mot ici donnerait un centrage different de celui du fichier que
     recoit un imprimeur, et l'ecart ne se verrait qu'a l'usage. */
  const svgLockup = lire('signe', 'lockup-horizontal-creme');
  const [vx, vy, vl, vh] = boite(svgLockup);
  const k = hauteurSigne / vh;
  const mP = trace(f400, PROMESSE[0], taillePromesse);

  let basPied = 0, borneBasse = H - marge, corpsPied = '';
  if (pied) {
    const mPied = trace(f700, 'caelestis.fr', 24, { ls: 0.5 });
    basPied = +(H - marge - mPied.bas).toFixed(2);
    const yFilet = +(basPied - 48).toFixed(2);
    borneBasse = yFilet - 32;
    const mAct = trace(f400, pied, 22);
    corpsPied = trace(f700, 'caelestis.fr', 24, { x: marge - mPied.gauche, y: basPied, ls: 0.5, couleur: CREME }).markup
      + trace(f400, pied, 22, { x: L - marge - mAct.droite, y: basPied, couleur: CREME, opacite: 0.72 }).markup
      + `<rect x="${marge}" y="${yFilet}" width="${L - marge * 2}" height="1" fill="${CREME}" opacity="0.22"/>`;
  }

  const ecart = hauteurSigne * 0.62;                        // vide entre le lockup et la promesse
  const hauteurPromesse = (mP.bas - mP.haut) + interligne;
  const hauteurBloc = hauteurSigne + ecart + hauteurPromesse;
  const haut = +(marge + (borneBasse - marge - hauteurBloc) / 2).toFixed(2);
  const yP1 = +(haut + hauteurSigne + ecart - mP.haut).toFixed(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">
  <rect width="${L}" height="${H}" fill="${VERT}"/>
  <g transform="translate(${(marge - vx * k).toFixed(2)} ${(haut - vy * k).toFixed(2)}) scale(${k.toFixed(5)})">${interieur(svgLockup)}</g>
  ${trace(f400, PROMESSE[0], taillePromesse, { x: marge - mP.gauche, y: yP1, couleur: CREME, opacite: 0.92 }).markup}
  ${trace(f400, PROMESSE[1], taillePromesse, { x: marge - mP.gauche, y: yP1 + interligne, couleur: CREME, opacite: 0.92 }).markup}
  ${corpsPied}
</svg>`;
}

/* Image de partage, 1200 x 630, celle que lisent Google et les reseaux. */
await sharp(Buffer.from(bandeau({
  L: 1200, H: 630, marge: 92, hauteurSigne: 118, taillePromesse: 40, interligne: 52,
  pied: 'Création de sites internet, fiche Google et référencement',
})), { density: 300 })
  /* Le redimensionnement est explicite : a densite 300 le SVG est rendu a plus
     de quatre fois sa taille intrinseque, et un fichier de 5000 px de large
     partirait dans les balises Open Graph. */
  .resize(1200, 630)
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
  .toFile(`${SORTIE}/partage/og-image-1200x630.jpg`);
note('partage/ : og-image 1200 x 630');

/* Couverture Google, 1024 x 576. */
await pngEtJpg(bandeau({ L: 1024, H: 576, marge: 78, hauteurSigne: 104, taillePromesse: 34, interligne: 44, pied: null }),
  'google/couverture-1024x576', { width: 1024, height: 576 }, VERT);

/* ══ 6. Reseaux sociaux ══════════════════════════════════════════════
   Avatar carre : le signe seul, la charte reservant le mot aux formats ou il
   se lit. Couverture 1640 x 720, le format le plus large demande. */
{
  const svg = lire('signe', 'tuile-creme-sur-vert');
  await png(svg, 'reseaux/avatar-1080', { width: 1080, height: 1080 });
  await png(svg, 'reseaux/profil-page-720', { width: 720, height: 720 });
}
await png(bandeau({ L: 1640, H: 720, marge: 116, hauteurSigne: 132, taillePromesse: 42, interligne: 56, pied: null }),
  'reseaux/couverture-1640x720', { width: 1640, height: 720 });
note('reseaux/ : avatar 1080, profil 720, couverture 1640 x 720');

console.log(faits.map((f) => `  ${f}`).join('\n'));

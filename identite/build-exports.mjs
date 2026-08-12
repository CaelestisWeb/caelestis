/* Conversion des logos en fichiers importables partout, ecrits sous
   identite/logo/ :

     png/       fond transparent, a poser sur n'importe quel support
     png-aplat/ fond plein deja compose, avec la zone de protection de la charte
     google/    dimensions exactes de la fiche d'etablissement Google

   Le SVG reste le fichier de reference, mais beaucoup d'outils ne l'acceptent
   pas : la fiche Google n'admet que JPG et PNG, les messageries et les
   traitements de texte le rendent mal. Ce script produit les rasterisations
   correspondantes, une fois pour toutes.

   Prerequis : node identite/build-logos.mjs
   Lancement : node identite/build-exports.mjs */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { police, trace, monogramme, LOCKUP, DECALAGE_OPTIQUE_MONO, ENCRE_MONO, VERT, CREME } from './lib-traces.mjs';

const LOGO = 'C:/dev/caelestis/identite/logo';
['png', 'png-aplat', 'google'].forEach((d) => mkdirSync(`${LOGO}/${d}`, { recursive: true }));

/* Zone de protection de la charte : la moitie de la hauteur du monogramme sur
   les quatre cotes. Le monogramme occupe toute la hauteur d'un lockup, la
   marge vaut donc la moitie de la hauteur du fichier pour un lockup
   horizontal, et se calcule sur la tuile pour les autres. */
const PROTECTION = 0.5;

const lire = (nom) => readFileSync(`${LOGO}/${nom}.svg`, 'utf8');
const boite = (svg) => svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const interieur = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

/* Repose un logo au centre d'un aplat, marge comprise. */
function surAplat(nom, fond, marge) {
  const svg = lire(nom);
  const [vx, vy, vl, vh] = boite(svg);
  const m = +(marge).toFixed(2);
  const L = +(vl + m * 2).toFixed(2);
  const H = +(vh + m * 2).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${Math.round(L)}" height="${Math.round(H)}">
  <rect width="${L}" height="${H}" fill="${fond}"/>
  <g transform="translate(${(m - vx).toFixed(2)} ${(m - vy).toFixed(2)})">${interieur(svg)}</g>
</svg>`;
}

/* Rasterisation. La densite elevee garantit que le trace est calcule bien
   au-dessus de la taille demandee, la reduction fait le reste. */
async function png(svg, sortie, dim) {
  const image = sharp(Buffer.from(svg), { density: 600 }).resize({ ...dim, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  await image.png({ compressionLevel: 9 }).toFile(`${LOGO}/${sortie}.png`);
}

async function pngEtJpg(svg, sortie, dim, fond) {
  await png(svg, sortie, dim);
  await sharp(Buffer.from(svg), { density: 600 })
    .resize({ ...dim, fit: 'contain', background: fond })
    .flatten({ background: fond })
    // 4:4:4 : sans cela le JPEG fait baver le vert sur le creme le long des courbes.
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(`${LOGO}/${sortie}.jpg`);
}

/* ── 1. Fond transparent ───────────────────────────────────── */
const TRANSPARENTS = [
  ['lockup-horizontal-nu-vert', 'lockup-horizontal-vert', { width: 1000 }, { width: 3000 }],
  ['lockup-horizontal-sur-vert', 'lockup-horizontal-creme', { width: 1000 }, { width: 3000 }],
  ['lockup-vertical-nu-vert', 'lockup-vertical-vert', { width: 700 }, { width: 2100 }],
  ['lockup-vertical-sur-vert', 'lockup-vertical-creme', { width: 700 }, { width: 2100 }],
  ['wordmark-vert', 'mot-vert', { width: 1000 }, { width: 3000 }],
  ['wordmark-creme', 'mot-creme', { width: 1000 }, { width: 3000 }],
  ['monogramme-nu-vert', 'monogramme-vert', { height: 512 }, { height: 1536 }],
  ['monogramme-nu-creme', 'monogramme-creme', { height: 512 }, { height: 1536 }],
  ['monogramme-nu-encre', 'monogramme-encre', { height: 512 }, { height: 1536 }],
];

for (const [source, nom, petit, grand] of TRANSPARENTS) {
  const svg = lire(source);
  await png(svg, `png/${nom}-${petit.width ?? petit.height}`, petit);
  await png(svg, `png/${nom}-${grand.width ?? grand.height}`, grand);
}

/* ── 2. Fond plein, zone de protection respectee ───────────── */
const APLATS = [
  ['lockup-horizontal-nu-vert', CREME, 'lockup-horizontal-sur-creme', { width: 2000 }],
  ['lockup-horizontal-sur-vert', VERT, 'lockup-horizontal-sur-vert', { width: 2000 }],
  ['lockup-vertical-nu-vert', CREME, 'lockup-vertical-sur-creme', { height: 2000 }],
  ['lockup-vertical-sur-vert', VERT, 'lockup-vertical-sur-vert', { height: 2000 }],
];

for (const [source, fond, nom, dim] of APLATS) {
  const [, , , vh] = boite(lire(source));
  // Sur un lockup vertical le monogramme ne fait pas toute la hauteur : la
  // marge se calcule sur la tuile de 100 et non sur le fichier entier.
  const hauteurMono = source.includes('vertical') ? 100 : vh;
  const svg = surAplat(source, fond, hauteurMono * PROTECTION);
  await pngEtJpg(svg, `png-aplat/${nom}`, dim, fond);
}

/* Tuiles carrees, utiles des qu'un service impose un carre. */
for (const [source, fond, nom] of [
  ['monogramme-creme-sur-vert', VERT, 'monogramme-carre-vert'],
  ['monogramme-vert-sur-creme', CREME, 'monogramme-carre-creme'],
]) {
  const svg = lire(source);
  await png(svg, `png-aplat/${nom}-1024`, { width: 1024, height: 1024 });
  await pngEtJpg(svg, `png-aplat/${nom}-512`, { width: 512, height: 512 }, fond);
}

/* ── 3. Fiche d'etablissement Google ───────────────────────────
   Logo : carre, 720 x 720 recommande, JPG ou PNG. Google le recadre en
   cercle a plusieurs endroits, le monogramme est donc pose seul, au centre
   optique et suffisamment petit pour survivre au rognage.
   Photo de couverture : 1024 x 576, soit le 16:9 attendu. */
const f500 = police(500);
const f400 = police(400);

const G = 720;
// Meme proportion que l'avatar des reseaux, 560 pour 1080, afin que la fiche
// Google et les Pages sociales montrent exactement la meme vignette.
const MONO_G = Math.round((G * 560) / 1080);
const logoGoogle = (fond, encre) => `<svg xmlns="http://www.w3.org/2000/svg" width="${G}" height="${G}" viewBox="0 0 ${G} ${G}">
  <rect width="${G}" height="${G}" fill="${fond}"/>
  ${monogramme((G - MONO_G) / 2 + MONO_G * DECALAGE_OPTIQUE_MONO, (G - MONO_G) / 2, MONO_G, encre)}
</svg>`;

await pngEtJpg(logoGoogle(VERT, CREME), 'google/logo-720-vert', { width: G, height: G }, VERT);
await pngEtJpg(logoGoogle(CREME, VERT), 'google/logo-720-creme', { width: G, height: G }, CREME);

const CL = 1024;
const CH = 576;
const TUILE = 104;
const TAILLE_PROMESSE = 24;
const RESPIRATION = 46; // vide entre le bas du lockup et le haut de la promesse
const PROMESSE = 'Des sites web pour ceux qui créent, cultivent et bâtissent avec passion.';

/* Centrage horizontal sur l'encre reelle, pas sur la tuile du C : de son bord
   gauche recentre jusqu'au bord droit du mot. */
const lsMot = LOCKUP.interlettrage * TUILE * LOCKUP.mot;
const motMesure = trace(f500, 'Caelestis', TUILE * LOCKUP.mot, { ls: lsMot });
const decalMotX = TUILE * (1 + LOCKUP.ecart);                                  // depuis le bord de tuile
const decalEncreX = TUILE * (DECALAGE_OPTIQUE_MONO + ENCRE_MONO.x0);           // depuis le bord de tuile
const largeurEncre = decalMotX - decalEncreX + motMesure.largeur;
const gaucheLockup = (CL - largeurEncre) / 2 - decalEncreX;

/* Centrage vertical du bloc entier : haut de l'encre du C jusqu'au bas de la
   promesse. Les positions ne sont plus posees a la main, elles se deduisent. */
const mesureP = trace(f400, PROMESSE, TAILLE_PROMESSE);
const hauteurBloc = TUILE * (ENCRE_MONO.y1 - ENCRE_MONO.y0) + RESPIRATION + (mesureP.bas - mesureP.haut);
const hautTuile = (CH - hauteurBloc) / 2 - TUILE * ENCRE_MONO.y0;
const basMono = hautTuile + TUILE * ENCRE_MONO.y1;

const motPlace = trace(f500, 'Caelestis', TUILE * LOCKUP.mot, {
  x: gaucheLockup + TUILE + TUILE * LOCKUP.ecart,
  y: hautTuile + TUILE * LOCKUP.baseline,
  ls: lsMot,
});
const promesse = trace(f400, PROMESSE, TAILLE_PROMESSE, {
  x: (CL - mesureP.largeur) / 2 - mesureP.gauche,
  y: basMono + RESPIRATION - mesureP.haut,
  opacite: 0.9,
});

const couverture = `<svg xmlns="http://www.w3.org/2000/svg" width="${CL}" height="${CH}" viewBox="0 0 ${CL} ${CH}">
  <rect width="${CL}" height="${CH}" fill="${VERT}"/>
  ${monogramme(gaucheLockup + TUILE * DECALAGE_OPTIQUE_MONO, hautTuile, TUILE)}
  ${motPlace.markup}
  ${promesse.markup}
</svg>`;

await pngEtJpg(couverture, 'google/couverture-1024x576', { width: CL, height: CH }, VERT);

console.log('identite/logo : png/, png-aplat/ et google/ regeneres.');

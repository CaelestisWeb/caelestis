/* Audit geometrique de tous les visuels de l'identite.

   On ne croit aucun calcul des scripts de fabrication : chaque fichier produit
   est rasterise et on mesure l'encre reellement presente, puis les quatre
   marges. Le fond de chaque visuel est declare explicitement, jamais devine :
   une tuile a coins arrondis a des coins transparents et une detection
   automatique mesurerait la tuile au lieu du sujet pose dessus.

   Trois attentes :
     encre   le fichier doit toucher ses quatre bords (logo cadre au plus juste)
     centre  le sujet doit etre centre, marges opposees egales
     info    composition libre, on releve les mesures sans verdict

   Lancement : node identite/audit-visuels.mjs */

import { existsSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

const RACINE = 'C:/dev/caelestis';
const ID = `${RACINE}/identite`;
const LARGEUR = 1000;  // rasterisation a taille constante, mesures comparables
const SEUIL = 30;      // ecart par canal au-dela duquel un pixel est de l'encre
const TOLERANCE = 0.4; // en pour cent de la dimension

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

async function analyse(chemin, fond) {
  const entree = sharp(readFileSync(chemin), { density: 500 });
  const natif = await entree.metadata();
  const { data, info } = await sharp(readFileSync(chemin), { density: 500 })
    .resize({ width: LARGEUR, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: L, height: H, channels: C } = info;
  const f = fond === 'alpha' ? null : hex(fond);

  const estEncre = (i) => {
    if (f === null) return data[i + 3] > 24;
    // Sur un aplat, un pixel du bord arrondi est semi-transparent : on exige
    // qu'il soit franchement opaque avant de le compter comme sujet.
    if (data[i + 3] < 200) return false;
    return Math.abs(data[i] - f[0]) > SEUIL || Math.abs(data[i + 1] - f[1]) > SEUIL || Math.abs(data[i + 2] - f[2]) > SEUIL;
  };

  const colonnes = new Uint32Array(L);
  const lignes = new Uint32Array(H);
  let x0 = L, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < L; x++) {
      if (!estEncre((y * L + x) * C)) continue;
      colonnes[x]++; lignes[y]++;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;

  const groupes = (profil, taille) => {
    const vide = Math.max(4, Math.round(taille * 0.02));
    const g = []; let debut = -1, creux = 0;
    for (let i = 0; i < taille; i++) {
      if (profil[i] > 0) { if (debut < 0) debut = i; creux = 0; }
      else if (debut >= 0) { creux++; if (creux >= vide) { g.push([debut, i - creux]); debut = -1; creux = 0; } }
    }
    if (debut >= 0) g.push([debut, taille - 1 - creux]);
    return g;
  };

  /* Boite d'encre restreinte a une bande, pour mesurer un bloc isole. */
  const boiteBande = (b0, b1, vertical = true) => {
    let a0 = L, a1 = -1;
    for (let y = vertical ? b0 : 0; y <= (vertical ? b1 : H - 1); y++) {
      for (let x = vertical ? 0 : b0; x <= (vertical ? L - 1 : b1); x++) {
        if (estEncre((y * L + x) * C)) { if (x < a0) a0 = x; if (x > a1) a1 = x; }
      }
    }
    return { min: a0, max: a1, centre: (a0 + a1) / 2 };
  };

  return {
    L, H, gauche: x0, droite: L - 1 - x1, haut: y0, bas: H - 1 - y1,
    blocsX: groupes(colonnes, L), blocsY: groupes(lignes, H), boiteBande,
    natifL: natif.width, natifH: natif.height,
  };
}

const pc = (v, t) => +((v / t) * 100).toFixed(2);

const VERT = '#255C41', CREME = '#FCFBF8';

const CIBLES = [
  ['encre', 'identite/logo/lockup-horizontal-nu-vert.svg', 'alpha'],
  ['encre', 'identite/logo/lockup-horizontal-sur-vert.svg', 'alpha'],
  ['encre', 'identite/logo/lockup-horizontal-sur-clair.svg', 'alpha'],
  ['encre', 'identite/logo/lockup-vertical-nu-vert.svg', 'alpha'],
  ['encre', 'identite/logo/lockup-vertical-sur-vert.svg', 'alpha'],
  ['encre', 'identite/logo/lockup-vertical-sur-clair.svg', 'alpha'],
  ['encre', 'identite/logo/wordmark-vert.svg', 'alpha'],
  ['encre', 'identite/logo/wordmark-creme.svg', 'alpha'],
  ['encre', 'identite/logo/wordmark-encre-700.svg', 'alpha'],
  ['encre', 'identite/logo/monogramme-nu-vert.svg', 'alpha'],
  ['encre', 'identite/logo/monogramme-nu-creme.svg', 'alpha'],
  ['encre', 'identite/logo/monogramme-nu-encre.svg', 'alpha'],
  ['centre', 'identite/logo/monogramme-vert-sur-creme.svg', CREME],
  ['centre', 'identite/logo/monogramme-creme-sur-vert.svg', VERT],
  ['centre', 'identite/reseaux/avatar-1080.png', VERT],
  ['centre', 'identite/reseaux/profil-page-720.png', VERT],
  ['centre', 'identite/reseaux/couverture-1640x720.png', VERT],
  ['centre', 'identite/logo/google/logo-720-vert.png', VERT],
  ['centre', 'identite/logo/google/logo-720-creme.png', CREME],
  ['centre', 'identite/logo/google/couverture-1024x576.png', VERT],
  ['centre', 'identite/logo/png-aplat/lockup-horizontal-sur-creme.png', CREME],
  ['centre', 'identite/logo/png-aplat/lockup-horizontal-sur-vert.png', VERT],
  ['centre', 'identite/logo/png-aplat/lockup-vertical-sur-creme.png', CREME],
  ['centre', 'identite/logo/png-aplat/lockup-vertical-sur-vert.png', VERT],
  ['centre', 'identite/logo/png-aplat/monogramme-carre-vert-1024.png', VERT],
  ['centre', 'identite/logo/png-aplat/monogramme-carre-creme-1024.png', CREME],
  ['info', 'public/og-image.jpg', VERT],
  // Favicons et icones d'application : le C doit etre centre dans sa tuile.
  ['centre', 'public/favicon.svg', '#F4F2EC'],
  ['centre', 'public/favicon-32.png', '#F4F2EC'],
  ['centre', 'public/apple-touch-icon.png', '#F4F2EC'],
  ['centre', 'public/icon-192.png', '#F4F2EC'],
  ['centre', 'public/icon-512.png', '#F4F2EC'],
];

console.log('type   | fichier                                        |   G /   D |   H /   B | blocs | verdict');
console.log('-------|------------------------------------------------|-----------|-----------|-------|---------');

const problemes = [];
for (const [type, rel, fond] of CIBLES) {
  const chemin = `${RACINE}/${rel}`;
  const court = rel.replace('identite/', '').replace('public/', 'public/');
  if (!existsSync(chemin)) { console.log(`ABSENT | ${court}`); continue; }
  const a = await analyse(chemin, fond);
  if (!a) { console.log(`VIDE   | ${court}`); continue; }

  const dx = a.gauche - a.droite, dy = a.haut - a.bas;
  let verdict = 'OK';
  if (type === 'encre') {
    const m = Math.max(pc(a.gauche, a.L), pc(a.droite, a.L), pc(a.haut, a.H), pc(a.bas, a.H));
    if (m >= TOLERANCE) verdict = `MARGE PARASITE ${m} %`;
  } else if (type === 'centre') {
    const d = Math.max(pc(Math.abs(dx), a.L), pc(Math.abs(dy), a.H));
    // Sous 64 px, un demi-pixel de la grille pese plus de 1 % : l'ecart se
    // juge alors en pixels reels du fichier, pas en pourcentage.
    if (a.natifL <= 64) {
      const px = Math.max((Math.abs(dx) / a.L) * a.natifL, (Math.abs(dy) / a.H) * a.natifH);
      verdict = px > 1 ? `DECENTRE ${px.toFixed(2)} px sur ${a.natifL}` : `OK (${px.toFixed(2)} px sur ${a.natifL})`;
    } else if (d >= 1) verdict = `DECENTRE ${d} %`;
    else if (d >= TOLERANCE) verdict = `leger ${d} %`;
  } else verdict = '';

  console.log(`${type.padEnd(6)} | ${court.padEnd(46)} | ${String(a.gauche).padStart(4)}/${String(a.droite).padStart(4)} | ${String(a.haut).padStart(4)}/${String(a.bas).padStart(4)} | ${a.blocsX.length}x${a.blocsY.length}   | ${verdict}`);
  if (verdict && !verdict.startsWith('OK')) problemes.push({ court, verdict, dx, dy });
}

/* ── Alignement interne : le monogramme face au mot ─────────── */
console.log('\n--- Alignement du monogramme et du mot ---');
for (const [rel, fond] of [
  ['identite/logo/lockup-horizontal-nu-vert.svg', 'alpha'],
  ['identite/logo/lockup-horizontal-sur-clair.svg', 'alpha'],
  ['identite/logo/lockup-vertical-nu-vert.svg', 'alpha'],
  ['identite/logo/lockup-vertical-sur-clair.svg', CREME],
]) {
  const a = await analyse(`${RACINE}/${rel}`, fond);
  if (!a) continue;
  const court = rel.replace('identite/logo/', '');
  if (rel.includes('horizontal')) {
    if (a.blocsX.length < 2) { console.log(`${court} : blocs non separables (${a.blocsX.length})`); continue; }
    const c = a.blocsX[0], mot = a.blocsX[a.blocsX.length - 1];
    const bC = a.boiteBande(c[0], c[1], false);
    const bM = a.boiteBande(mot[0], mot[1], false);
    // Centres verticaux de chaque bloc
    const centreY = (b0, b1) => {
      let y0 = a.H, y1 = -1;
      for (const [i, j] of [[b0, b1]]) void [i, j];
      return { y0, y1 };
    };
    void centreY;
    console.log(`${court}\n  C : x ${c[0]}-${c[1]} (${c[1] - c[0] + 1} px) | mot : x ${mot[0]}-${mot[1]} | ecart C-mot ${mot[0] - c[1]} px (${pc(mot[0] - c[1], c[1] - c[0] + 1)} % de la largeur du C)`);
    void bC; void bM;
  } else {
    if (a.blocsY.length < 2) { console.log(`${court} : blocs non separables (${a.blocsY.length})`); continue; }
    const h = a.blocsY[0], b = a.blocsY[a.blocsY.length - 1];
    const cH = a.boiteBande(h[0], h[1], true);
    const cB = a.boiteBande(b[0], b[1], true);
    const d = +(cH.centre - cB.centre).toFixed(1);
    console.log(`${court}\n  haut centre x ${cH.centre} | mot centre x ${cB.centre} | decalage ${d} px sur ${a.L}${Math.abs(d) > a.L * 0.004 ? '  <-- A CORRIGER' : '  OK'}`);
  }
}

/* ── Cartes de visite : page, zone de securite, alignements ─── */
console.log('\n--- Cartes de visite, mesures en millimetres ---');
const CARTE = { L: 91, H: 61, coupe: 3, securite: 8 };  // securite = 3 mm de fond perdu + 5 mm
const cartesHorsZone = [];
for (const face of ['piste-A-recto', 'piste-A-verso', 'piste-B-recto', 'piste-B-verso']) {
  const svg = `${ID}/logo/impression/carte-${face}.svg`;
  if (!existsSync(svg)) { console.log(`  ${face} : absent`); continue; }
  // Le fond de la carte occupe toute la page : on mesure sur cette couleur.
  const fondCarte = readFileSync(svg, 'utf8').includes(`fill="${VERT}"/>`) ? VERT : CREME;
  const a = await analyse(svg, fondCarte);
  if (!a) { console.log(`  ${face} : vide`); continue; }
  const enMm = (px, dim) => +((px / dim) * (dim === a.L ? CARTE.L : CARTE.H)).toFixed(2);
  const g = enMm(a.gauche, a.L), d = enMm(a.droite, a.L);
  const h = enMm(a.haut, a.H), b = enMm(a.bas, a.H);
  const min = Math.min(g, d, h, b);
  const ok = min >= CARTE.securite - 0.15;
  console.log(`  ${face.padEnd(14)} marges G ${String(g).padStart(5)} D ${String(d).padStart(5)} H ${String(h).padStart(5)} B ${String(b).padStart(5)} | securite ${CARTE.securite} mm : ${ok ? 'respectee' : 'DEBORDEMENT'}`);
  if (!ok) cartesHorsZone.push(face);

  // Alignement a gauche : chaque bande horizontale doit partir de la meme marge
  const gauches = a.blocsY.map(([y0, y1]) => enMm(a.boiteBande(y0, y1, true).min, a.L));
  const ecartAlign = +(Math.max(...gauches) - Math.min(...gauches)).toFixed(2);
  console.log(`    ${a.blocsY.length} bloc(s), bords gauches ${gauches.join(' | ')} mm, ecart ${ecartAlign} mm${ecartAlign > 0.4 ? '  <-- ALIGNEMENT A REVOIR' : ''}`);
  if (ecartAlign > 0.4) cartesHorsZone.push(`${face} (alignement)`);
}

console.log(`\n${problemes.length} visuel(s) hors tolerance${cartesHorsZone.length ? `, ${cartesHorsZone.length} probleme(s) sur les cartes` : ''} :`);
for (const p of problemes) {
  const sx = p.dx > 1 ? 'sujet trop a droite' : p.dx < -1 ? 'sujet trop a gauche' : '';
  const sy = p.dy > 1 ? 'sujet trop bas' : p.dy < -1 ? 'sujet trop haut' : '';
  console.log(`  ${p.court.padEnd(46)} ${p.verdict}${sx ? `, ${sx}` : ''}${sy ? `, ${sy}` : ''}`);
}
for (const c of cartesHorsZone) console.log(`  carte ${c}`);

/* Ecrit les fichiers des cinq pistes dans identite/pistes-logo/<piste>/,
   puis controle leur cadrage en les rasterisant.

   node identite/pistes-logo/build-pistes.mjs */

import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { PISTES, DOSSIER, VERT, CREME, ENCRE } from './pistes.mjs';
import { preparer, enveloppe } from './artefacts.mjs';

const fichiers = [];
const ecrire = (cle, nom, artefact, label) => {
  writeFileSync(`${DOSSIER}/${cle}/${nom}.svg`, enveloppe(artefact, label));
  fichiers.push(`${cle}/${nom}.svg`);
};

for (const p of PISTES) {
  mkdirSync(`${DOSSIER}/${p.cle}`, { recursive: true });
  const a = await preparer(p);
  const etiquette = `Caelestis, ${p.nom}`;

  ecrire(p.cle, 'signe-vert', a.signe(VERT), etiquette);
  ecrire(p.cle, 'signe-creme', a.signe(CREME), etiquette);
  ecrire(p.cle, 'signe-encre', a.signe(ENCRE), etiquette);

  ecrire(p.cle, 'tuile-creme-sur-vert', a.tuile(VERT, CREME), etiquette);
  ecrire(p.cle, 'tuile-vert-sur-creme', a.tuile(CREME, VERT), etiquette);
  ecrire(p.cle, 'favicon', a.tuile(VERT, CREME, true), etiquette);

  ecrire(p.cle, 'lockup-horizontal-vert', a.lockupH(VERT), 'Caelestis');
  ecrire(p.cle, 'lockup-horizontal-creme', a.lockupH(CREME), 'Caelestis');
  ecrire(p.cle, 'lockup-horizontal-encre', a.lockupH(ENCRE), 'Caelestis');
  ecrire(p.cle, 'lockup-vertical-vert', a.lockupV(VERT), 'Caelestis');
  ecrire(p.cle, 'lockup-vertical-creme', a.lockupV(CREME), 'Caelestis');
  if (p.motSecondaire) {
    ecrire(p.cle, 'lockup-horizontal-vert-orthographe-courante', a.lockupH(VERT, p.motSecondaire), 'Caelestis');
  }

  console.log(`${p.nom.padEnd(16)} encre ${a.sw} x ${a.sh}`);
}

console.log(`\n${fichiers.length} fichiers ecrits dans identite/pistes-logo/`);

/* ── Controle de cadrage ─────────────────────────────────────────
   La charte demande qu'un logo touche les quatre bords de son fichier et
   qu'une tuile soit centree sur l'encre du signe. Le controle rasterise le
   fichier ecrit et mesure l'encre presente : il ne fait confiance a aucun
   calcul des composeurs.

   Trois attentes. `encre` : le fichier touche ses quatre bords. `centre` :
   les marges opposees sont egales. `cercle` : un signe circulaire est cadre
   sur son cercle, sa fente laisse donc une marge d'un cote, bornee a 4 %. */
const CIRCULAIRES = new Set(PISTES.filter((p) => p.cadre === 'carre').map((p) => p.cle));
const attendu = (nom) => {
  if (nom.includes('tuile-') || nom.includes('favicon')) return 'centre';
  if (nom.includes('/signe-') && CIRCULAIRES.has(nom.split('/')[0])) return 'cercle';
  return 'encre';
};

let ecarts = 0;
for (const f of fichiers) {
  /* Un fichier creme se mesure sur fond vert : aplati sur du blanc, son encre
     est invisible et l'audit conclurait a tort au fichier vide. */
  const derriere = f.includes('creme') && !f.includes('sur-creme') ? VERT : '#ffffff';
  const { data, info } = await sharp(`${DOSSIER}/${f}`, { density: 400 })
    .resize(400, null, { fit: 'inside' }).flatten({ background: derriere })
    .raw().toBuffer({ resolveWithObject: true });
  const fond = [data[0], data[1], data[2]];
  let x0 = info.width, x1 = -1, y0 = info.height, y1 = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * info.channels;
      if (Math.abs(data[i] - fond[0]) + Math.abs(data[i + 1] - fond[1]) + Math.abs(data[i + 2] - fond[2]) > 24) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  const marges = [x0, info.width - 1 - x1, y0, info.height - 1 - y1];
  const tol = Math.max(2, info.width * 0.012);
  const type = attendu(f);
  let verdict = 'ok';
  if (type === 'encre' && marges.some((m) => m > tol)) verdict = `encre ne touche pas les bords : ${marges.join(', ')}`;
  if (type === 'cercle' && marges.some((m) => m > info.width * 0.04)) verdict = `marge de fente trop forte : ${marges.join(', ')}`;
  if (type === 'centre') {
    if (Math.abs(marges[0] - marges[1]) > tol) verdict = `tuile decentree en largeur : ${marges[0]} contre ${marges[1]}`;
    else if (Math.abs(marges[2] - marges[3]) > tol) verdict = `tuile decentree en hauteur : ${marges[2]} contre ${marges[3]}`;
  }
  if (verdict !== 'ok') { ecarts += 1; console.log(`  ${f} : ${verdict}`); }
}
console.log(ecarts === 0 ? `Cadrage : les ${fichiers.length} fichiers sont dans la tolerance.` : `Cadrage : ${ecarts} fichiers hors tolerance.`);

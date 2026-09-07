/* Fabrique commune aux series de pistes.

   Ecriture des fichiers, controle de cadrage, et construction de la planche
   de presentation. Une serie fournit ses signes, ses reperes et son texte ;
   tout le reste est ici, pour que deux series ne divergent pas en silence. */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { DOSSIER as COMMUN, RACINE, VERT, CREME, ENCRE } from './pistes.mjs';
import { preparer, enveloppe } from './artefacts.mjs';

/* ══ Fichiers d'une serie ═════════════════════════════════════════════ */
export async function ecrireSerie(pistes, dossier) {
  const fichiers = [];
  const ecrire = (cle, nom, artefact, label) => {
    writeFileSync(`${dossier}/${cle}/${nom}.svg`, enveloppe(artefact, label));
    fichiers.push(`${cle}/${nom}.svg`);
  };

  for (const p of pistes) {
    mkdirSync(`${dossier}/${p.cle}`, { recursive: true });
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
    if (p.motSecondaire) ecrire(p.cle, 'lockup-horizontal-vert-orthographe-courante', a.lockupH(VERT, p.motSecondaire), 'Caelestis');

    console.log(`${p.nom.padEnd(16)} encre ${a.sw} x ${a.sh}`);
  }
  console.log(`\n${fichiers.length} fichiers ecrits.`);
  await controler(fichiers, pistes, dossier);
  return fichiers;
}

/* ══ Controle de cadrage ══════════════════════════════════════════════
   La charte demande qu'un logo touche les quatre bords de son fichier et
   qu'une tuile soit centree sur l'encre du signe. Le controle rasterise le
   fichier ecrit et mesure l'encre presente : il ne fait confiance a aucun
   calcul des composeurs.

   Trois attentes. `encre` : le fichier touche ses quatre bords. `centre` :
   les marges opposees sont egales. `cercle` : un signe circulaire est cadre
   sur son cercle, sa fente laisse donc une marge d'un cote, bornee a 4 %. */
async function controler(fichiers, pistes, dossier) {
  const circulaires = new Set(pistes.filter((p) => p.cadre === 'carre').map((p) => p.cle));
  const attendu = (nom) => {
    if (nom.includes('tuile-') || nom.includes('favicon')) return 'centre';
    if (nom.includes('/signe-') && circulaires.has(nom.split('/')[0])) return 'cercle';
    return 'encre';
  };

  let ecarts = 0;
  for (const f of fichiers) {
    /* Un fichier creme se mesure sur fond vert : aplati sur du blanc, son
       encre est invisible et l'audit conclurait a tort au fichier vide. */
    const derriere = f.includes('creme') && !f.includes('sur-creme') ? VERT : '#ffffff';
    const { data, info } = await sharp(`${dossier}/${f}`, { density: 400 })
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
}

/* ══ Planche de presentation ══════════════════════════════════════════ */
const NB = ' ';
const typo = (t) => t
  .replace(/ ([:;?!»])/g, `${NB}$1`)
  .replace(/« /g, `«${NB}`)
  .replace(/(\d) ?€/g, `$1${NB}€`);

const fonte = (poids) => readFileSync(resolve(RACINE, `src/assets/fonts/satoshi-${poids}.woff2`)).toString('base64');
const FACES = () => [300, 400, 500, 700]
  .map((p) => `@font-face{font-family:Satoshi;src:url(data:font/woff2;base64,${fonte(p)}) format("woff2");font-weight:${p};font-style:normal;font-display:swap}`)
  .join('');

const inline = (a, maxL, maxH) => {
  const k = Math.min(maxL / a.l, maxH / a.h);
  return `<svg viewBox="${a.vb}" width="${+(a.l * k).toFixed(1)}" height="${+(a.h * k).toFixed(1)}" aria-hidden="true">${a.corps}</svg>`;
};

function fichierSVG(chemin, maxL, maxH, { recolorer = false } = {}) {
  let src = readFileSync(resolve(RACINE, chemin), 'utf8');
  /* Le lockup de tete suit la couleur du theme, le specimen garde la sienne :
     un specimen se regarde tel qu'il est livre. */
  if (recolorer) src = src.replaceAll(VERT, 'currentColor');
  const vb = src.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const corps = src.slice(src.indexOf('</title>') + 8, src.lastIndexOf('</svg>'));
  return inline({ vb: vb.join(' '), l: vb[2], h: vb[3], corps }, maxL, maxH);
}

/* Le fond creme d'une plaque ne change pas avec le theme : un specimen se
   regarde sur du papier, pas sur l'ecran de qui l'ouvre. */
const plaque = (contenu, legende, { haute = false } = {}) => `
      <figure class="plaque${haute ? ' plaque-haute' : ''}">
        <div class="plaque-scene">${contenu}</div>
        <figcaption>${typo(legende)}</figcaption>
      </figure>`;

export async function construirePlanche({ pistes, reperes, copie, titre, sortie, fragment }) {
  const { OUVERTURE, DEPART, PLANCHES, BILAN } = copie;
  const prepas = [];
  for (const p of pistes) prepas.push({ p, a: await preparer(p) });

  const sections = prepas.map(({ p, a }) => {
    const c = PLANCHES[p.cle];
    const etagere = [
      plaque(inline(a.lockupH('currentColor'), 196, 68), 'Lockup horizontal'),
      plaque(inline(a.lockupV('currentColor'), 140, 112), 'Lockup vertical'),
      plaque(inline(a.tuile(VERT, CREME), 104, 104), 'Tuile, avatar et fiche Google'),
      plaque(`<span class="tailles">${inline(a.tuile(VERT, CREME, true), 48, 48)}${inline(a.tuile(VERT, CREME, true), 32, 32)}${inline(a.tuile(VERT, CREME, true), 16, 16)}</span>`, 'Favicon à 48, 32 et 16 px'),
    ].join('');

    const construction = `<svg viewBox="-6 -6 112 112" width="200" height="200" aria-hidden="true" class="reperes">`
      + `<g class="guides" fill="none" stroke="currentColor" stroke-width="0.5">${reperes[p.cle]()}</g>`
      + `<g class="signe-pale">${a.signe('currentColor').corps}</g></svg>`;

    return `
    <section class="piste" id="${p.cle}">
      <div class="piste-tete">
        <p class="surtitre">${c.numero}</p>
        <h2>${p.nom}</h2>
        <p class="resume">${typo(c.resume)}</p>
      </div>

      <div class="duo">
        ${plaque(inline(a.signe('currentColor'), 260, 260), 'Le signe', { haute: true })}
        ${plaque(construction, 'Sa construction', { haute: true })}
      </div>

      <div class="etagere">${etagere}</div>

      <div class="bande">${inline(a.lockupH(CREME), 420, 110)}</div>

      <div class="texte">
        <div class="colonne">
          <h3>L'idée</h3>
          ${c.idee.map((t) => `<p>${typo(t)}</p>`).join('\n          ')}
        </div>
        <div class="colonne">
          <h3>Ce qu'elle dit</h3>
          <p>${typo(c.dit)}</p>
          <h3>Ce qu'elle demande</h3>
          <p>${typo(c.demande)}</p>
          <p class="mesure">${typo(c.mesure)}</p>
        </div>
      </div>
    </section>`;
  }).join('\n');

  const rangee = (rendu, legende) => `
        <div class="ligne-comparatif">
          ${legende ? `<p class="legende-ligne">${typo(legende)}</p>` : ''}
          <div class="serie">${prepas.map(rendu).join('')}</div>
        </div>`;
  const comparatif = [
    rangee(({ a }) => `<span>${inline(a.tuile(VERT, CREME), 64, 64)}</span>`, 'À 64 px'),
    rangee(({ a }) => `<span>${inline(a.tuile(VERT, CREME, true), 32, 32)}</span>`, 'À 32 px'),
    rangee(({ a }) => `<span>${inline(a.tuile(VERT, CREME, true), 16, 16)}</span>`, 'À 16 px, la taille de l’onglet'),
    rangee(({ a }) => `<span class="mono">${inline(a.signe('currentColor'), 46, 46)}</span>`, 'En une seule couleur'),
    rangee(({ p }) => `<span class="nom-serie">${p.nom}</span>`, ''),
  ].join('');

  const corps = `
  <div class="planche">
    <header class="tete">
      <div class="tete-marque">${fichierSVG('identite/logo/lockup-horizontal-nu-vert.svg', 168, 30, { recolorer: true })}</div>
      <p class="surtitre">${typo(OUVERTURE.surtitre)}</p>
      <h1>${OUVERTURE.titre}</h1>
      <p class="chapo">${typo(OUVERTURE.chapo)}</p>
      <nav class="sommaire" aria-label="Les cinq pistes">
        ${pistes.map((p, i) => `<a href="#${p.cle}"><span>${i + 1}</span>${p.nom}</a>`).join('\n        ')}
      </nav>
    </header>

    <section class="depart">
      <h2>${DEPART.titre}</h2>
      <div class="depart-corps${DEPART.specimen ? '' : ' depart-large'}">
        <div class="depart-texte">
          ${DEPART.texte.map((t) => `<p>${typo(t)}</p>`).join('\n          ')}
        </div>
        ${DEPART.specimen ? plaque(fichierSVG(DEPART.specimen.chemin, 120, 120), DEPART.specimen.legende) : ''}
      </div>
      <h3 class="titre-garde">${typo(DEPART.titreGarde)}</h3>
      <dl class="garde">
        ${DEPART.garde.map(([t, d]) => `<div><dt>${typo(t)}</dt><dd>${typo(d)}</dd></div>`).join('\n        ')}
      </dl>
    </section>
${sections}

    <section class="bilan">
      <h2>${BILAN.titre}</h2>
      <p class="chapo">${typo(BILAN.chapo)}</p>
      <div class="comparatif">${comparatif}
      </div>

      <div class="texte">
        <div class="colonne">
          <h3>${BILAN.recommandation.titre}</h3>
          ${BILAN.recommandation.texte.map((t) => `<p>${typo(t)}</p>`).join('\n          ')}
        </div>
        <div class="colonne">
          <h3>${BILAN.suite.titre}</h3>
          <dl class="suite">
            ${BILAN.suite.etapes.map(([t, d]) => `<div><dt>${typo(t)}</dt><dd>${typo(d)}</dd></div>`).join('\n            ')}
          </dl>
        </div>
      </div>
    </section>

    <footer class="pied"><p>${typo(BILAN.pied)}</p></footer>
  </div>`;

  const tete = `<title>${titre}</title>\n<style>${FACES()}\n${readFileSync(`${COMMUN}/planche.css`, 'utf8')}</style>`;
  /* Le monogramme en service sert d'icone d'onglet aux pages locales : sans
     lui, chaque ouverture reclame un favicon.ico inexistant et la console
     affiche une erreur qui fait douter de la page. */
  const icone = '<link rel="icon" href="../logo/monogramme-creme-sur-vert.svg">';
  writeFileSync(sortie, `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${icone}\n${tete}\n</head>\n<body>${corps}\n</body>\n</html>\n`);
  console.log(sortie);
  if (fragment) { writeFileSync(fragment, `${tete}\n${corps}\n`); console.log(fragment); }
}

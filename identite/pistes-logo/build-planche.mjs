/* Planche de presentation des cinq pistes.

   Ecrit deux sorties depuis la meme source : un document autonome pour le
   dossier identite, et un fragment sans doctype pour la version en ligne.
   Les signes ne sont pas redessines ici, ils viennent de artefacts.mjs :
   la planche montre exactement ce que les fichiers contiennent.

   node identite/pistes-logo/build-planche.mjs [chemin-du-fragment] */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PISTES, REPERES, DOSSIER, RACINE, VERT, CREME } from './pistes.mjs';
import { preparer } from './artefacts.mjs';
import { OUVERTURE, DEPART, PLANCHES, BILAN } from './copie.mjs';

/* ── Typographie francaise : insecables avant les signes doubles, comme le
      fait integrations/typographie-francaise.mjs sur le site. ─────────── */
const NB = ' ';
const typo = (t) => t
  .replace(/ ([:;?!»])/g, `${NB}$1`)
  .replace(/« /g, `«${NB}`)
  .replace(/(\d) ?€/g, `$1${NB}€`);

/* ── Polices en base64 : la planche doit s'ouvrir sans reseau ────────── */
const fonte = (poids) => readFileSync(resolve(RACINE, `src/assets/fonts/satoshi-${poids}.woff2`)).toString('base64');
const FACES = [300, 400, 500, 700].map((p) => `@font-face{font-family:Satoshi;src:url(data:font/woff2;base64,${fonte(p)}) format("woff2");font-weight:${p};font-style:normal;font-display:swap}`).join('');

/* ── Mise a l'echelle d'un artefact dans une boite ───────────────────── */
function taille({ l, h }, maxL, maxH) {
  const k = Math.min(maxL / l, maxH / h);
  return { w: +(l * k).toFixed(1), hh: +(h * k).toFixed(1) };
}
const inline = (a, maxL, maxH, extra = '') => {
  const { w, hh } = taille(a, maxL, maxH);
  return `<svg viewBox="${a.vb}" width="${w}" height="${hh}" aria-hidden="true"${extra}>${a.corps}</svg>`;
};

/* Reprend un fichier deja livre dans identite/logo/ pour montrer l'existant. */
function fichier(chemin, maxL, maxH, { recolorer = false } = {}) {
  let src = readFileSync(resolve(RACINE, chemin), 'utf8');
  /* Le lockup de tete suit la couleur du theme, le specimen garde la sienne :
     un specimen se regarde tel qu'il est livre. */
  if (recolorer) src = src.replaceAll(VERT, 'currentColor');
  const vb = src.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const corps = src.slice(src.indexOf('</title>') + 8, src.lastIndexOf('</svg>'));
  return inline({ vb: vb.join(' '), l: vb[2], h: vb[3], corps }, maxL, maxH);
}

/* ── Plaque de specimen : le fond crème ne change pas avec le theme, un
      specimen se regarde sur du papier. ──────────────────────────────── */
const plaque = (contenu, legende, { haute = false, vert = false } = {}) => `
      <figure class="plaque${haute ? ' plaque-haute' : ''}${vert ? ' plaque-vert' : ''}">
        <div class="plaque-scene">${contenu}</div>
        <figcaption>${typo(legende)}</figcaption>
      </figure>`;

const reperes = (p, a) => {
  const s = a.signe('currentColor');
  return `<svg viewBox="-6 -6 112 112" width="200" height="200" aria-hidden="true" class="reperes">`
    + `<g class="guides" fill="none" stroke="currentColor" stroke-width="0.5">${REPERES[p.cle]()}</g>`
    + `<g class="signe-pale">${s.corps}</g></svg>`;
};

const sections = [];
for (const p of PISTES) {
  const a = await preparer(p);
  const c = PLANCHES[p.cle];

  const shelf = [
    plaque(inline(a.lockupH('currentColor'), 196, 68), 'Lockup horizontal'),
    plaque(inline(a.lockupV('currentColor'), 140, 112), 'Lockup vertical'),
    plaque(inline(a.tuile(VERT, CREME), 104, 104), 'Tuile, avatar et fiche Google'),
    plaque(`<span class="tailles">${inline(a.tuile(VERT, CREME, true), 48, 48)}${inline(a.tuile(VERT, CREME, true), 32, 32)}${inline(a.tuile(VERT, CREME, true), 16, 16)}</span>`, 'Favicon à 48, 32 et 16 px'),
  ].join('');

  sections.push(`
    <section class="piste" id="${p.cle}">
      <div class="piste-tete">
        <p class="surtitre">${c.numero}</p>
        <h2>${p.nom}</h2>
        <p class="resume">${typo(c.resume)}</p>
      </div>

      <div class="duo">
        ${plaque(inline(a.signe('currentColor'), 260, 260), 'Le signe', { haute: true })}
        ${plaque(reperes(p, a), 'Sa construction', { haute: true })}
      </div>

      <div class="etagere">${shelf}</div>

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
    </section>`);
}

/* ── Comparatif final ────────────────────────────────────────────────── */
const prepas = [];
for (const p of PISTES) prepas.push({ p, a: await preparer(p) });

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
      <div class="tete-marque">${fichier('identite/logo/lockup-horizontal-nu-vert.svg', 168, 30, { recolorer: true })}</div>
      <p class="surtitre">${typo(OUVERTURE.surtitre)}</p>
      <h1>${OUVERTURE.titre}</h1>
      <p class="chapo">${typo(OUVERTURE.chapo)}</p>
      <nav class="sommaire" aria-label="Les cinq pistes">
        ${PISTES.map((p, i) => `<a href="#${p.cle}"><span>${i + 1}</span>${p.nom}</a>`).join('\n        ')}
      </nav>
    </header>

    <section class="depart">
      <h2>${DEPART.titre}</h2>
      <div class="depart-corps">
        <div class="depart-texte">
          ${DEPART.texte.map((t) => `<p>${typo(t)}</p>`).join('\n          ')}
        </div>
        ${plaque(fichier('identite/logo/monogramme-creme-sur-vert.svg', 120, 120), 'Le monogramme en service')}
      </div>
      <h3 class="titre-garde">Ce que les cinq pistes gardent</h3>
      <dl class="garde">
        ${DEPART.garde.map(([t, d]) => `<div><dt>${typo(t)}</dt><dd>${typo(d)}</dd></div>`).join('\n        ')}
      </dl>
    </section>
${sections.join('\n')}

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

    <footer class="pied">
      <p>Fichiers vectoriels dans <code>identite/pistes-logo/</code>, onze par piste. Fabrication&nbsp;: <code>node identite/pistes-logo/build-pistes.mjs</code>, qui écrit les fichiers puis mesure leur cadrage au pixel. Cette planche&nbsp;: <code>node identite/pistes-logo/build-planche.mjs</code>.</p>
    </footer>
  </div>`;

const style = readFileSync(`${DOSSIER}/planche.css`, 'utf8');
const tete = `<title>Cinq signes pour Caelestis</title>\n<style>${FACES}\n${style}</style>`;

writeFileSync(`${DOSSIER}/planche-pistes.html`,
  `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${tete}\n</head>\n<body>${corps}\n</body>\n</html>\n`);
console.log('identite/pistes-logo/planche-pistes.html');

const fragment = process.argv[2];
if (fragment) {
  writeFileSync(fragment, `${tete}\n${corps}\n`);
  console.log(fragment);
}

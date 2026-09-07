/* Page d'accueil de l'identite : les quatre series au meme endroit.

   node identite/build-index.mjs        ecrit identite/index.html
   node identite/serveur.mjs            la sert sur http://localhost:4600

   Les signes ne sont pas redessines ici, ils viennent des memes modules que
   les fichiers livres. */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { VERT, CREME, RACINE } from './pistes-logo/pistes.mjs';
import { preparer } from './pistes-logo/artefacts.mjs';
import { PISTES as ABSTRAITES } from './pistes-logo/pistes.mjs';
import { PISTES as NATURE } from './pistes-nature/signes.mjs';
import { PISTES as POUSSE } from './pistes-pousse/signes.mjs';
import { PISTES as FLECHE } from './pistes-fleche/signes.mjs';
import { PISTES as AFFINEE } from './pistes-fleche-affinee/signes.mjs';
import { PISTES as ARBRE } from './pistes-arbre-ecran/signes.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const NB = ' ';
const typo = (t) => t.replace(/ ([:;?!»])/g, `${NB}$1`).replace(/« /g, `«${NB}`).replace(/(\d) ?%/g, `$1${NB}%`);

const SERIES = [
  {
    dossier: 'pistes-logo', pistes: ABSTRAITES, planche: 'pistes-logo/planche-pistes.html',
    titre: 'Première série, le signe de marque',
    resume: "Cinq signes abstraits, cherchant ce que Caelestis dit en propre : un nom latin qui veut dire céleste, un métier qui rend visible.",
  },
  {
    dossier: 'pistes-nature', pistes: NATURE, planche: 'pistes-nature/planche-nature.html',
    titre: 'Deuxième série, la nature et le web',
    resume: "Cinq fusions, bâties sur une règle : ne garder que les endroits où une forme du vivant et une forme du web sont déjà la même forme.",
  },
  {
    dossier: 'pistes-pousse', pistes: POUSSE, planche: 'pistes-pousse/planche-pousse.html',
    titre: 'Troisième série, la pousse et le carré',
    resume: "Cinq variations sur les deux formes retenues. Un seul paramètre change, la place du carré, et le dessin de la feuille est repris au dixième.",
  },
  {
    dossier: 'pistes-fleche', pistes: FLECHE, planche: 'pistes-fleche/planche-fleche.html',
    titre: 'Quatrième série, la flèche et le vivant',
    resume: "Cinq voies pour dire le développement d'activité sans quitter le registre végétal. Série entière écartée le 7 septembre, la flèche est abandonnée.",
  },
  {
    dossier: 'pistes-fleche-affinee', pistes: AFFINEE, planche: 'pistes-fleche-affinee/planche-fleche-affinee.html',
    titre: 'Cinquième série, les réglages de la flèche',
    resume: "Le signe retenu, avec un seul réglage qui change d'une piste à l'autre : la proportion de la tête, le nombre de feuilles, le fuselage de la hampe, le carré autour. La sixième est la somme des trois recommandés. Écartée le 7 septembre.",
  },
  {
    dossier: 'pistes-arbre-ecran', pistes: ARBRE, planche: 'pistes-arbre-ecran/planche-arbre-ecran.html',
    titre: "Sixième série, l'ordinateur-arbre",
    resume: "Le carré de l'écran, et sous lui un tronc et des racines. Cinq façons de tenir les deux ensemble, de la plus explicite à la plus contenue.",
  },
];

/* Arbitrages de Celestin, 7 septembre 2026. */
const RETENUES = new Set(['pistes-pousse/pousse', 'pistes-pousse/pousse-cadree']);
const ECARTEES = new Set([
  'pistes-fleche/courbe', 'pistes-fleche/trois-pousses', 'pistes-fleche/escalier', 'pistes-fleche/badge',
  'pistes-fleche/fleche-feuillue',
  ...['feuillue', 'elancee', 'sobre', 'fuselee', 'cadree', 'combinee'].map((c) => `pistes-fleche-affinee/${c}`),
]);

const inline = (a, maxL, maxH) => {
  const k = Math.min(maxL / a.l, maxH / a.h);
  return `<svg viewBox="${a.vb}" width="${+(a.l * k).toFixed(1)}" height="${+(a.h * k).toFixed(1)}" aria-hidden="true">${a.corps}</svg>`;
};

const fonte = (p) => readFileSync(resolve(RACINE, `src/assets/fonts/satoshi-${p}.woff2`)).toString('base64');
const FACES = [300, 400, 500, 700]
  .map((p) => `@font-face{font-family:Satoshi;src:url(data:font/woff2;base64,${fonte(p)}) format("woff2");font-weight:${p};font-style:normal;font-display:swap}`).join('');

/* Prepare tout, une seule fois : chaque piste sert au bloc de sa serie, au
   comparatif, et parfois au bandeau des preferees. */
const prets = [];
for (const s of SERIES) {
  const rendus = [];
  for (const p of s.pistes) rendus.push({ p, a: await preparer(p), cle: `${s.dossier}/${p.cle}` });
  prets.push({ ...s, rendus });
}

const vignette = (s, { p, a, cle }, taille = 92) => `
        <a class="vignette${RETENUES.has(cle) ? ' est-retenue' : ''}${ECARTEES.has(cle) ? ' est-ecartee' : ''}" href="${s.planche}#${p.cle}">
          <span class="vignette-scene">${inline(a.signe('currentColor'), taille, taille)}</span>
          <span class="vignette-nom">${p.nom}</span>
          <span class="vignette-fichiers">${s.dossier}/${p.cle}/</span>
          ${RETENUES.has(cle) ? '<span class="etiquette">Retenue</span>' : ''}${ECARTEES.has(cle) ? '<span class="etiquette etiquette-ecartee">Écartée</span>' : ''}
        </a>`;

const blocs = prets.map((s) => `
    <section class="bloc-serie">
      <div class="bloc-tete">
        <h2>${typo(s.titre)}</h2>
        <p>${typo(s.resume)}</p>
        <p class="liens">
          <a class="bouton" href="${s.planche}">Ouvrir la planche</a>
          <a href="${s.dossier}/">Parcourir les fichiers</a>
          <a href="${s.dossier}/LISEZ-MOI.md">Lire les notes</a>
        </p>
      </div>
      <div class="vignettes">${s.rendus.map((r) => vignette(s, r)).join('')}
      </div>
    </section>`).join('');

const retenues = prets.flatMap((s) => s.rendus.filter((r) => RETENUES.has(r.cle)).map((r) => ({ s, r })));

const comparatif = prets.map((s) => `
        <div class="ligne-comparatif">
          <p class="legende-ligne">${typo(s.titre)}</p>
          <div class="rangee-comparee">${s.rendus.map(({ a, p }) => `<span title="${p.nom}">${inline(a.tuile(VERT, CREME, true), 32, 32)}${inline(a.tuile(VERT, CREME, true), 16, 16)}</span>`).join('')}</div>
        </div>`).join('');

const corps = `
  <div class="planche">
    <header class="tete">
      <p class="surtitre">Identité Caelestis, septembre 2026</p>
      <h1>Trente et une pistes de logotype</h1>
      <p class="chapo">Six séries, toutes livrées en fichiers vectoriels complets. Chaque série a sa planche de présentation, avec la construction de chaque signe et ses déclinaisons jusqu'au favicon.</p>
    </header>

    <section class="preferees">
      <h2>Ce qui est retenu</h2>
      <p class="chapo">Arbitrages du 7 septembre. La Pousse et la Pousse cadrée peuvent former une seule identité, le cadre étant un contenant et non un second logo. La voie de la flèche a été ouverte puis abandonnée le même jour, et la sixième série reprend celle de l'ordinateur-arbre.</p>
      <div class="duo-preferees">
        ${retenues.map(({ s, r }) => `
        <a class="plaque-preferee" href="${s.planche}#${r.p.cle}">
          <span class="scene-preferee">${inline(r.a.signe('currentColor'), 150, 150)}</span>
          <span class="nom-preferee">${r.p.nom}</span>
        </a>`).join('')}
      </div>
    </section>
${blocs}

    <section class="bilan">
      <h2>Toutes à la taille de l'onglet</h2>
      <p class="chapo">Un logo se juge à la taille où il vit vraiment. Chaque piste est montrée ici à 32 et à 16 px, dans sa version optique pour petite taille.</p>
      <div class="comparatif">${comparatif}
      </div>
    </section>

    <footer class="pied">
      <p>Cette page&nbsp;: <code>node identite/build-index.mjs</code>. Les fichiers d'une série&nbsp;: <code>node identite/&lt;série&gt;/build-pistes.mjs</code>, qui les écrit puis mesure leur cadrage au pixel. Sa planche&nbsp;: <code>node identite/&lt;série&gt;/build-planche.mjs</code>.</p>
      <p>L'identité en service reste dans <a href="logo/">logo/</a>, la charte dans <a href="CHARTE-GRAPHIQUE.md">CHARTE-GRAPHIQUE.md</a> et sa planche visuelle dans <a href="charte-caelestis.html">charte-caelestis.html</a>. Rien n'en a été retiré.</p>
    </footer>
  </div>`;

const style = `${readFileSync(`${ICI}/pistes-logo/planche.css`, 'utf8')}
/* ── Accueil ──────────────────────────────────────────────────────────
   Les classes portent le prefixe bloc- : .serie appartient deja au comparatif
   de planche.css, et la reutiliser cassait la mise en page des vignettes. */
.tete { padding-bottom: 40px; }
.preferees, .bloc-serie { padding: 56px 0; border-bottom: 1px solid var(--filet); }
.bloc-tete { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
.bloc-tete p { color: var(--texte-doux); max-width: 62ch; }
.liens { display: flex; flex-wrap: wrap; gap: 10px 22px; align-items: center; margin-top: 6px; }
.liens a { color: var(--accent); text-decoration: none; font-size: 0.9375rem; font-weight: 500; border-bottom: 1px solid transparent; }
.liens a:hover { border-bottom-color: currentColor; }
.liens a:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.bouton { background: var(--bande); color: var(--bande-texte) !important; padding: 9px 18px; border-radius: 2px; }
.bouton:hover { background: var(--texte); }

.vignettes { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; }
.vignette { display: flex; flex-direction: column; text-decoration: none; background: var(--creme-fixe);
  border: 1px solid var(--parchemin-fixe); color: var(--vert-fixe); }
.vignette:hover { border-color: var(--vert-fixe); }
.vignette:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.vignette-scene { display: grid; place-items: center; min-height: 148px; padding: 24px; }
.vignette svg { display: block; max-width: 100%; height: auto; }
.vignette-nom { border-top: 1px solid var(--parchemin-fixe); padding: 9px 12px 2px; font-size: 0.875rem; font-weight: 700;
  letter-spacing: -0.024em; color: #12160F; }
.vignette-fichiers { padding: 0 12px 10px; font-size: 0.75rem; color: #5C6259;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
.vignette { position: relative; }
.est-retenue { border-color: var(--vert-fixe); box-shadow: inset 0 0 0 1px var(--vert-fixe); }
.est-ecartee { opacity: 0.44; }
.est-ecartee:hover { opacity: 1; }
.etiquette { position: absolute; top: 8px; right: 8px; font-size: 0.6875rem; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; background: var(--vert-fixe);
  color: var(--creme-fixe); }
.etiquette-ecartee { background: #5C6259; }

.duo-preferees { display: grid; gap: 14px; margin-top: 28px; }
@media (min-width: 640px) { .duo-preferees { grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); } }
.plaque-preferee { display: flex; flex-direction: column; text-decoration: none; background: var(--creme-fixe);
  border: 1px solid var(--parchemin-fixe); color: var(--vert-fixe); }
.scene-preferee { display: grid; place-items: center; min-height: 230px; padding: 32px; }
.nom-preferee { border-top: 1px solid var(--parchemin-fixe); padding: 12px 16px 14px; font-size: 1rem;
  font-weight: 700; letter-spacing: -0.024em; color: #12160F; }

.rangee-comparee { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 16px; justify-items: center; }
.rangee-comparee span { display: flex; align-items: center; gap: 12px; }
.pied p + p { margin-top: 10px; }`;

writeFileSync(`${ICI}/index.html`,
  `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Identité Caelestis</title>\n<link rel="icon" href="logo/monogramme-creme-sur-vert.svg">\n<style>${FACES}\n${style}</style>\n</head>\n<body>${corps}\n</body>\n</html>\n`);
console.log('identite/index.html');

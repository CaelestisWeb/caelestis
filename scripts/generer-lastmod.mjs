/**
 * generer-lastmod.mjs : produit src/data/lastmod.json, la date de dernière
 * modification de chaque page, pour le sitemap.
 *
 * Pourquoi ce fichier existe. Google déclare ignorer `changefreq` et `priority`,
 * et se servir de `lastmod`. Le sitemap n'en portait aucun : Google ne savait
 * pas quelles pages avaient changé et recrawlait au jugé. Constaté le
 * 21/08/2026, l'index affichait encore un titre et un prix de départ périmés
 * depuis trois semaines.
 *
 * D'où vient la date, par ordre de préférence :
 *
 *   1. La date éditoriale déclarée dans la page, pour les guides : la prop
 *      `miseAJour` si elle existe, sinon `date`. C'est la vérité du contenu,
 *      décidée à la main. Un commit qui corrige une virgule ne doit pas
 *      prétendre que le texte a changé.
 *   2. La date du dernier commit qui a touché le fichier source, pour tout le
 *      reste. C'est ce que git sait de mieux.
 *   3. Rien. La page sort du sitemap sans `lastmod`, ce qui est le comportement
 *      d'avant. Aucune date inventée, jamais : un `lastmod` faux est pire que
 *      pas de `lastmod`, Google finit par cesser d'y croire.
 *
 * Le résultat est commité. Le build de Vercel ne relance pas ce script : son
 * clone est peu profond et `git log` y renvoie souvent vide. On génère donc en
 * local, avant de pousser :
 *
 *     npm run lastmod
 *
 * Si le JSON manque, le sitemap se construit quand même, sans lastmod.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const RACINE = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PAGES = join(RACINE, 'src', 'pages');
const SORTIE = join(RACINE, 'src', 'data', 'lastmod.json');
const SITE = 'https://caelestis.fr';

/** Les mêmes exclusions que le filtre du sitemap dans astro.config.mjs. */
const EXCLUES = [
  '/cgv', '/mentions-legales', '/politique-confidentialite',
  '/demos/', '/api/', '/questionnaire-client', '/questionnaire-devis', '/zz-', '/404',
];

async function fichiersAstro(dossier) {
  const entrees = await readdir(dossier, { withFileTypes: true });
  const sortie = [];
  for (const e of entrees) {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) sortie.push(...(await fichiersAstro(chemin)));
    else if (e.name.endsWith('.astro')) sortie.push(chemin);
  }
  return sortie;
}

/** src/pages/services/site-vitrine.astro devient https://caelestis.fr/services/site-vitrine */
function urlDepuisFichier(chemin) {
  let route = relative(PAGES, chemin).split(sep).join('/').replace(/\.astro$/, '');
  if (route === 'index') return `${SITE}/`;
  route = route.replace(/\/index$/, '');
  return `${SITE}/${route}`;
}

/**
 * Date éditoriale déclarée dans une page de guide : la mise à jour l'emporte sur
 * la publication. Deux écritures coexistent, les deux sont lues : la prop passée
 * à GuideLayout (`date=` / `miseAJour=`), et les constantes des guides qui ont
 * leur propre mise en page (`datePublication` / `dateMiseAJour`, voir
 * anatomie-d-un-site-qui-convertit).
 */
function dateEditoriale(source) {
  const motifs = [
    /\bmiseAJour=["'](\d{4}-\d{2}-\d{2})["']/,
    /\bdateMiseAJour\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/,
    /\bdate=["'](\d{4}-\d{2}-\d{2})["']/,
    /\bdatePublication\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/,
  ];
  for (const motif of motifs) {
    const trouve = source.match(motif);
    if (trouve) return trouve[1];
  }
  return null;
}

/** Date ISO du dernier commit ayant touché le fichier, ou null. */
function dateCommit(chemin) {
  try {
    const sortie = execFileSync(
      'git', ['log', '-1', '--format=%cI', '--', chemin],
      { cwd: RACINE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return sortie || null;
  } catch {
    return null;
  }
}

/**
 * Les pages produites par une route dynamique. Leur date est celle du fichier
 * de données, pas celle du gabarit : c'est le contenu qui change, pas le moule.
 */
async function routesDynamiques() {
  const map = {};
  const donnees = join(RACINE, 'src', 'data', 'realisations.ts');
  if (!existsSync(donnees)) return map;
  const source = readFileSync(donnees, 'utf8');
  const slugs = [...source.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const date = dateCommit(donnees);
  if (!date) return map;
  for (const slug of slugs) map[`${SITE}/realisations/${slug}`] = date;
  return map;
}

const fichiers = await fichiersAstro(PAGES);
const resultat = {};
let editoriales = 0;
let commits = 0;
let sans = 0;

for (const chemin of fichiers) {
  const url = urlDepuisFichier(chemin);
  const route = url.replace(SITE, '') || '/';
  if (EXCLUES.some((e) => route.includes(e))) continue;
  if (chemin.includes('[')) continue; // traité par routesDynamiques

  const source = readFileSync(chemin, 'utf8');
  const editoriale = route.startsWith('/ressources/') && route !== '/ressources'
    ? dateEditoriale(source)
    : null;

  if (editoriale) {
    resultat[url] = editoriale;
    editoriales++;
  } else {
    const commit = dateCommit(chemin);
    if (commit) {
      resultat[url] = commit;
      commits++;
    } else {
      sans++;
      console.warn(`  pas de date pour ${route}`);
    }
  }
}

Object.assign(resultat, await routesDynamiques());

const ordonne = Object.fromEntries(Object.entries(resultat).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(SORTIE, `${JSON.stringify(ordonne, null, 2)}\n`, 'utf8');

console.log(`lastmod.json : ${Object.keys(ordonne).length} pages`);
console.log(`  ${editoriales} dates éditoriales, ${commits} dates de commit, ${sans} sans date`);

/**
 * Audit du build local, en une passe sur le HTML réellement produit.
 *
 * caelestis.fr ne peut pas être scanné par l'outil en ligne (checkpoint Vercel
 * qui répond 403 à tout robot). Ce script en est le pendant local : il lit
 * .vercel/output/static après un build et signale, page par page et en bilan :
 *   - Images : alt manquant, dimensions manquantes (CLS), format raster vs
 *     WebP/AVIF, chargement immédiat vs lazy.
 *   - Titres H1 : pages sans H1, pages avec plusieurs H1.
 *   - SEO : title/description présents, longueurs, doublons entre pages.
 *   - Liens internes morts : chaque <a href> interne doit pointer vers une route
 *     réellement produite (page ou asset), ou une redirection de vercel.json.
 *
 *   npm run build
 *   node scripts/audit-build.mjs
 *
 * Sortie non nulle si un lien interne est mort (le seul défaut qui casse
 * vraiment la navigation). Les autres points sont informatifs.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(process.cwd(), '.vercel', 'output', 'static');
const VERCEL = join(process.cwd(), 'vercel.json');

try {
  statSync(ROOT);
} catch {
  console.error(`✗ ${ROOT} introuvable. Lancez d'abord : npm run build`);
  process.exit(2);
}

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    statSync(p).isDirectory() ? walk(p, acc) : acc.push(p);
  }
  return acc;
}

const all = walk(ROOT);
const htmlFiles = all.filter((f) => f.endsWith('.html'));

function routeOf(file) {
  let r = '/' + relative(ROOT, file).replace(/\\/g, '/');
  if (r.endsWith('/index.html')) r = r.slice(0, -'/index.html'.length) || '/';
  else if (r.endsWith('.html')) r = r.slice(0, -'.html'.length);
  return r === '' ? '/' : r;
}

// Routes et assets réellement servis, plus les redirections et les routes SSR
// connues (absentes du build statique, mais pas mortes pour autant).
const valides = new Set();
for (const f of all) {
  valides.add('/' + relative(ROOT, f).replace(/\\/g, '/'));
  if (f.endsWith('.html')) valides.add(routeOf(f));
}
try {
  for (const red of (JSON.parse(readFileSync(VERCEL, 'utf8')).redirects ?? []))
    valides.add(red.source.replace(/\/+$/, '') || '/');
} catch { /* pas de vercel.json : on continue */ }
for (const ssr of ['/outils/diagnostic', '/outils/simulateur', '/simulateur']) valides.add(ssr);

const norm = (p) => {
  const q = p.split(/[?#]/)[0];
  return (q.length > 1 ? q.replace(/\/+$/, '') : q) || '/';
};
const attr = (tag, nom) => {
  const m = tag.match(new RegExp(`(?<![\\w-])${nom}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\`]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null;
};

const img = { total: 0, sansAlt: [], sansDim: [], raster: [], eager: 0, lazy: 0 };
const h1 = { sans: [], multiples: [] };
const seo = { sansTitre: [], titreCourt: [], titreLong: [], sansDesc: [], descCourte: [], descLongue: [] };
const titres = new Map(), descs = new Map();
const liensMorts = new Map();
const externes = new Set();

for (const f of htmlFiles) {
  const route = routeOf(f);
  const html = readFileSync(f, 'utf8');

  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    img.total += 1;
    const src = attr(tag, 'src') ?? '';
    if (attr(tag, 'alt') === null) img.sansAlt.push(`${route} : ${src.slice(0, 60)}`);
    if ((attr(tag, 'width') === null || attr(tag, 'height') === null) && !/aspect-ratio/i.test(tag))
      img.sansDim.push(`${route} : ${src.slice(0, 60)}`);
    if (/\.(jpe?g|png)(\?|$)/i.test(src)) img.raster.push(`${route} : ${src.slice(0, 70)}`);
    attr(tag, 'loading') === 'lazy' ? (img.lazy += 1) : (img.eager += 1);
  }

  const nbH1 = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (nbH1 === 0) h1.sans.push(route);
  else if (nbH1 > 1) h1.multiples.push(`${route} (${nbH1})`);

  const titre = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? '';
  if (!titre) seo.sansTitre.push(route);
  else {
    if (titre.length < 30) seo.titreCourt.push(`${route} (${titre.length})`);
    if (titre.length > 65) seo.titreLong.push(`${route} (${titre.length})`);
    titres.set(titre, [...(titres.get(titre) ?? []), route]);
  }
  const descTag = (html.match(/<meta\b[^>]*>/gi) ?? []).find((b) => /name\s*=\s*["']?description/i.test(b));
  const desc = descTag ? (attr(descTag, 'content') ?? '') : '';
  if (!desc) seo.sansDesc.push(route);
  else {
    if (desc.length < 70) seo.descCourte.push(`${route} (${desc.length})`);
    if (desc.length > 160) seo.descLongue.push(`${route} (${desc.length})`);
    descs.set(desc, [...(descs.get(desc) ?? []), route]);
  }

  for (const tag of html.match(/<a\b[^>]*>/gi) ?? []) {
    const href = attr(tag, 'href');
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    if (/^https?:\/\//i.test(href)) {
      try {
        const u = new URL(href);
        if (!/(^|\.)caelestis\.fr$/.test(u.hostname)) { externes.add(u.origin); continue; }
      } catch { continue; }
    }
    let chemin;
    try { chemin = norm(new URL(href, 'https://caelestis.fr' + route + (route.endsWith('/') ? '' : '/')).pathname); }
    catch { continue; }
    if (!valides.has(chemin) && !valides.has(chemin + '.html'))
      liensMorts.set(chemin, [...new Set([...(liensMorts.get(chemin) ?? []), route])]);
  }
}

const dupTitres = [...titres].filter(([, ps]) => ps.length > 1);
const dupDescs = [...descs].filter(([, ps]) => ps.length > 1);

const bloc = (t, arr, max = 15) => {
  console.log(`\n${t} : ${arr.length}`);
  arr.slice(0, max).forEach((x) => console.log('   - ' + x));
  if (arr.length > max) console.log(`   … +${arr.length - max}`);
};

console.log(`═══ AUDIT BUILD LOCAL — ${htmlFiles.length} pages HTML ═══`);
console.log(`\n── IMAGES (${img.total} balises <img> ; lazy ${img.lazy}, immédiat ${img.eager}) ──`);
bloc('  alt manquant', img.sansAlt);
bloc('  dimensions manquantes (risque CLS)', img.sansDim);
bloc('  format raster JPEG/PNG (WebP/AVIF conseillé)', img.raster);
console.log('\n── TITRES H1 ──');
bloc('  pages SANS H1', h1.sans);
bloc('  pages avec PLUSIEURS H1', h1.multiples);
console.log('\n── SEO ──');
bloc('  sans <title>', seo.sansTitre);
bloc('  title < 30 caractères', seo.titreCourt);
bloc('  title > 65 caractères', seo.titreLong);
bloc('  sans description', seo.sansDesc);
bloc('  description < 70 caractères', seo.descCourte);
bloc('  description > 160 caractères', seo.descLongue);
bloc('  TITRES en double', dupTitres.map(([t, ps]) => `"${t.slice(0, 40)}…" → ${ps.join(', ')}`));
bloc('  DESCRIPTIONS en double', dupDescs.map(([, ps]) => ps.join(', ')));
console.log('\n── LIENS INTERNES MORTS ──');
bloc('  cibles introuvables dans le build', [...liensMorts].map(([p, ps]) => `${p}  (depuis ${ps.slice(0, 3).join(', ')})`));
console.log(`\n── ${externes.size} domaines externes liés (vérifier la validité à part si besoin) ──`);
[...externes].sort().forEach((e) => console.log('   - ' + e));

process.exit(liensMorts.size ? 1 : 0);

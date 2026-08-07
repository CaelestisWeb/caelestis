/**
 * Contrôle de dérive de la CSP.
 *
 * La Content-Security-Policy de vercel.json interdit les scripts inline sauf
 * ceux dont le hash SHA-256 est explicitement listé dans `script-src`. Deux
 * scripts inline sont attendus sur le vrai site (le failsafe reveal et GA4,
 * dans BaseLayout), plus deux dans les fichiers de travail public/_variantes.
 *
 * Tout AUTRE script inline (par exemple un petit script de composant qu'Astro
 * réinlinerait si `vite.build.assetsInlineLimit` cessait de renvoyer false pour
 * les .js) casserait en production : le navigateur le bloquerait. Ce script
 * relit le build et signale tout script inline dont le hash manque à la CSP.
 *
 *   npm run build            # produit .vercel/output/static
 *   node scripts/verifier-csp-hashes.mjs
 *
 * Sortie non nulle si un script inline n'est pas couvert : à lancer avant
 * chaque déploiement qui touche au JavaScript ou à la config de build.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const RACINE_BUILD = '.vercel/output/static';
const VERCEL = 'vercel.json';

function hashesDeLaCsp() {
  const conf = JSON.parse(readFileSync(VERCEL, 'utf8'));
  const bloc = conf.headers?.find((h) => h.source === '/(.*)');
  const csp = bloc?.headers?.find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
  const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
  return new Set([...scriptSrc.matchAll(/'(sha256-[^']+)'/g)].map((m) => m[1]));
}

function pagesHtml(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) pagesHtml(p, acc);
    else if (e.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function scriptsInlineDuBuild() {
  const trouves = new Map(); // hash -> { extrait, pages:Set }
  for (const f of pagesHtml(RACINE_BUILD)) {
    const html = readFileSync(f, 'utf8');
    let m;
    while ((m = scriptRe.exec(html)) !== null) {
      const attrs = m[1] || '';
      const corps = m[2];
      if (/\bsrc\s*=/.test(attrs)) continue; // externe : couvert par 'self'
      if (/type\s*=\s*["']?(application\/ld\+json|importmap|speculationrules)/i.test(attrs)) continue;
      if (corps.trim() === '') continue;
      const h = 'sha256-' + createHash('sha256').update(corps, 'utf8').digest('base64');
      if (!trouves.has(h)) trouves.set(h, { extrait: corps.trim().slice(0, 70).replace(/\s+/g, ' '), pages: new Set() });
      trouves.get(h).pages.add(f.replace(RACINE_BUILD, '').replace(/\\/g, '/'));
    }
  }
  return trouves;
}

try {
  statSync(RACINE_BUILD);
} catch {
  console.error(`✗ ${RACINE_BUILD} introuvable. Lancez d'abord : npm run build`);
  process.exit(2);
}

const attendus = hashesDeLaCsp();
const trouves = scriptsInlineDuBuild();

const nonCouverts = [...trouves].filter(([h]) => !attendus.has(h));
const inutilises = [...attendus].filter((h) => !trouves.has(h));

console.log(`CSP : ${attendus.size} hash(es) déclaré(s). Build : ${trouves.size} script(s) inline distinct(s).\n`);

if (nonCouverts.length) {
  console.error('✗ Scripts inline SANS hash dans la CSP (seraient bloqués en prod) :');
  for (const [h, info] of nonCouverts) {
    console.error(`\n  ${h}`);
    console.error(`    pages : ${[...info.pages].slice(0, 4).join(', ')}${info.pages.size > 4 ? ' …' : ''}`);
    console.error(`    début : ${info.extrait}…`);
  }
  console.error('\n  → Ajoutez ces hashes à script-src dans vercel.json, ou externalisez ces scripts.');
}

if (inutilises.length) {
  console.warn(`\n⚠ ${inutilises.length} hash(es) de la CSP ne correspond(ent) à aucun script du build (résidu, sans danger) :`);
  for (const h of inutilises) console.warn(`  ${h}`);
}

if (!nonCouverts.length) {
  console.log('✓ Tous les scripts inline du build sont couverts par la CSP.');
  process.exit(0);
}
process.exit(1);

/**
 * Sous-ensemble (subset) des polices Satoshi au strict nécessaire du site.
 *
 * Pourquoi : les Satoshi livrées par Fontshare embarquent 432 codepoints
 * (latin étendu complet, grec, symboles mathématiques, formes géométriques,
 * flèches, fractions…). Un site français en rend environ 130. Réduire chaque
 * graisse à un socle « français + ouest-européen + typographie » fait tomber
 * les quatre fichiers de 97 Ko à 60 Ko (-38 %), dont -20 Ko sur les deux
 * graisses préchargées (400 et 700), ce qui rapproche le premier rendu du
 * texte réel. Invisible pour Lighthouse (déjà woff2 + font-display: swap),
 * bien réel sur le réseau.
 *
 * Sûreté : le socle conserve TOUT le Latin-1 (accents ouest-européens), Œ œ Ÿ
 * Š š Ž ž ƒ, et la typographie française (guillemets et apostrophes courbes,
 * tirets, points de suspension, insécables, €). Un nom propre étranger ou un
 * caractère hors socle retombe sur la police système, exactement comme AVANT
 * le subset (la Satoshi d'origine n'a jamais eu U+00A0 par exemple). Aucun
 * glyphe réellement rendu aujourd'hui n'est perdu.
 *
 * Quand relancer : après avoir ajouté une graisse, remplacé une police, ou
 * introduit un caractère spécial durable dans le contenu. Le charset est
 * reconstruit à partir du build (dist/), donc BUILDER D'ABORD (npm run build),
 * puis : npm i -D subset-font fontkit && node scripts/subset-polices.mjs
 * Les .woff2 de src/assets/fonts/ sont réécrits sur place ; rebâtir ensuite.
 *
 * Dépendances (dev, non installées par défaut) : subset-font, fontkit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = path.join(RACINE, 'src/assets/fonts');
const DIST = path.join(RACINE, 'dist');
const GRAISSES = [300, 400, 500, 700];

if (!fs.existsSync(DIST)) {
  console.error('dist/ absent : lancez « npm run build » avant ce script.');
  process.exit(1);
}

/* 1. Codepoints réellement présents dans le HTML produit (contenu + attributs). */
function fichiersHtml(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) fichiersHtml(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}
const utilises = new Set();
for (const f of fichiersHtml(DIST)) for (const ch of fs.readFileSync(f, 'utf8')) utilises.add(ch.codePointAt(0));

/* 2. Socle de sécurité : contenu futur, noms propres, formulaires, typographie. */
const garder = new Set(utilises);
for (let c = 0x20; c <= 0x7e; c++) garder.add(c);       // ASCII imprimable
for (let c = 0xa0; c <= 0xff; c++) garder.add(c);       // Latin-1 : accents ouest-européens
for (const c of [0x0152, 0x0153, 0x0178, 0x0160, 0x0161, 0x017d, 0x017e, 0x0192]) garder.add(c); // Œ œ Ÿ Š š Ž ž ƒ
for (const c of [
  0x2018, 0x2019, 0x201c, 0x201d, 0x201a, 0x201e,       // guillemets et apostrophes courbes
  0x2013, 0x2014,                                        // tirets (marge, bien que bannis en contenu)
  0x2026, 0x2022, 0x00b7,                                // … • ·
  0x2039, 0x203a,                                        // ‹ ›
  0x20ac, 0x2122, 0x2116,                                // € ™ №
  0x2192, 0x2190, 0x2191, 0x2193,                        // flèches simples
  0x202f, 0x2009,                                        // insécables fine et demi
]) garder.add(c);
garder.delete(0xffff);
garder.delete(0xf8ff);

const chars = [...garder].filter((c) => c >= 0x20).map((c) => String.fromCodePoint(c)).join('');

/* 3. Subset de chaque graisse, réécriture sur place. */
let avant = 0, apres = 0;
for (const w of GRAISSES) {
  const cible = path.join(FONT_DIR, `satoshi-${w}.woff2`);
  const src = fs.readFileSync(cible);
  const out = await subsetFont(src, chars, { targetFormat: 'woff2' });
  fs.writeFileSync(cible, out);
  avant += src.length; apres += out.length;
  console.log(`satoshi-${w}: ${(src.length / 1024).toFixed(1)} Ko -> ${(out.length / 1024).toFixed(1)} Ko`);
}
console.log(`\nCodepoints conservés : ${garder.size} (rendus par le build : ${utilises.size})`);
console.log(`TOTAL : ${(avant / 1024).toFixed(1)} Ko -> ${(apres / 1024).toFixed(1)} Ko (gain ${((avant - apres) / 1024).toFixed(1)} Ko)`);
console.log('Pensez à relancer « npm run build » pour propager les polices allégées.');

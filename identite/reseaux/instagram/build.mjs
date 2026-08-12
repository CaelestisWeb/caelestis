/* Rend les affiches Instagram en PNG 1080 x 1350 (format natif du fil, aucune interpolation).
   Lancement : node identite/reseaux/instagram/build.mjs
   Playwright n'est pas une dépendance du site : le script le cherche là où npx l'a déposé,
   sinon il indique la commande à lancer. */
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';

const ICI = dirname(fileURLToPath(import.meta.url));
const chemin = (...bouts) => join(ICI, ...bouts);

async function chargerPlaywright() {
  try {
    return await import('playwright');
  } catch {}
  const pistes = [
    join(tmpdir(), 'node_modules', 'playwright', 'index.js'),
    join(process.env.APPDATA || '', 'npm', 'node_modules', 'playwright', 'index.js'),
  ];
  for (const p of pistes) {
    if (existsSync(p)) return createRequire(import.meta.url)(p);
  }
  console.error("Playwright est introuvable. Lancer d'abord : npx -y playwright@1.62.1 --version");
  process.exit(1);
}

const { chromium } = await chargerPlaywright();

const AFFICHES = [
  ['affiche-1-le-site.html', 'caelestis-instagram-1-le-site.png'],
  ['affiche-2-formules.html', 'caelestis-instagram-2-formules.png'],
  ['affiche-3-univers.html', 'caelestis-instagram-3-univers.png'],
];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1160, height: 1400 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const require = createRequire(import.meta.url);
let sharp = null;
try { sharp = require('sharp'); } catch { console.log('sharp absent : pas de version JPEG'); }

for (const [html, png] of AFFICHES) {
  await p.goto(pathToFileURL(chemin(html)).href, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(700);
  await p.locator('.affiche').screenshot({ path: chemin('export', png) });
  const t = await p.evaluate(() => {
    const a = document.querySelector('.affiche');
    return a.offsetWidth + 'x' + a.offsetHeight;
  });
  if (sharp) {
    await sharp(chemin('export', png))
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toFile(chemin('export', png.replace('.png', '.jpg')));
  }
  console.log('OK', png, t);
}

await nav.close();

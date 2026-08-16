/* Rend les affiches publicitaires en PNG 1080 x 1350.
   Lancement : node identite/reseaux/instagram/publicites/build.mjs */
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const ICI = dirname(fileURLToPath(import.meta.url));
const chemin = (...bouts) => join(ICI, ...bouts);
mkdirSync(chemin('export'), { recursive: true });

async function chargerPlaywright() {
  try {
    return await import('playwright');
  } catch {}
  const pistes = [
    join(tmpdir(), 'node_modules', 'playwright', 'index.js'),
    join(process.env.APPDATA || '', 'npm', 'node_modules', 'playwright', 'index.js'),
  ];
  for (const p of pistes) if (existsSync(p)) return createRequire(import.meta.url)(p);
  console.error("Playwright est introuvable. Lancer d'abord : npx -y playwright@1.62.1 --version");
  process.exit(1);
}

const { chromium } = await chargerPlaywright();

const AFFICHES = [
  'offre-1-parcours',
  'offre-2-trois-metiers',
  'offre-3-signature',
  'pub-1-site-qui-reflete',
  'pub-2-etre-trouve',
  'pub-3-fiche-google',
  'pub-4-tout-reunir',
  'pub-5-metiers-de-passion',
  'pub-6-prix-affiches',
  'pub-7-sur-mesure',
  'pub-8-engagement-nature',
  'pub-9-une-seule-page',
  'pub-10-partagez-la',
];

const require = createRequire(import.meta.url);
let sharp = null;
try { sharp = require(join('C:/dev/caelestis/node_modules/sharp')); } catch { console.log('sharp absent : pas de version JPEG'); }

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1160, height: 1400 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

for (const nom of AFFICHES) {
  await p.goto(pathToFileURL(chemin(nom + '.html')).href, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(700);
  const png = chemin('export', 'caelestis-' + nom.replace(/^pub-/, 'pub-') + '.png');
  await p.locator('.affiche').screenshot({ path: png });
  if (sharp) {
    await sharp(png).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(png.replace('.png', '.jpg'));
  }
  const t = await p.evaluate(() => {
    const a = document.querySelector('.affiche');
    return a.offsetWidth + 'x' + a.offsetHeight;
  });
  console.log('OK', nom, t);
}

await nav.close();

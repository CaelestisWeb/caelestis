/**
 * generate-favicon.mjs
 * Génère tous les fichiers favicon depuis favicon.svg
 * Run: node generate-favicon.mjs
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC    = join(__dirname, 'public');
const SVG_PATH  = join(PUBLIC, 'favicon.svg');

const svgBuffer = readFileSync(SVG_PATH);

// ── Helper : crée un ICO multi-taille contenant des PNGs embarqués ──────────
// Le format ICO supporte les PNG natifs depuis Windows Vista / tous navigateurs modernes
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize    = 6;
  const dirEntrySize  = 16;
  const dirSize       = count * dirEntrySize;

  // Calcule les offsets
  const offsets = [];
  let offset = headerSize + dirSize;
  for (const buf of pngBuffers) {
    offsets.push(offset);
    offset += buf.length;
  }

  const total = offset;
  const ico   = Buffer.alloc(total);

  // Header ICO
  ico.writeUInt16LE(0,     0); // reserved
  ico.writeUInt16LE(1,     2); // type = ICO
  ico.writeUInt16LE(count, 4); // nombre d'images

  // Directory entries
  for (let i = 0; i < count; i++) {
    const buf = pngBuffers[i];
    const pos = headerSize + i * dirEntrySize;
    // Taille encodée en ICO : 0 = 256
    const size = buf._icoSize ?? 32;
    ico.writeUInt8(size >= 256 ? 0 : size, pos);     // width
    ico.writeUInt8(size >= 256 ? 0 : size, pos + 1); // height
    ico.writeUInt8(0,           pos + 2); // colorCount
    ico.writeUInt8(0,           pos + 3); // reserved
    ico.writeUInt16LE(1,        pos + 4); // planes
    ico.writeUInt16LE(32,       pos + 6); // bitCount
    ico.writeUInt32LE(buf.length, pos + 8);  // taille du chunk PNG
    ico.writeUInt32LE(offsets[i], pos + 12); // offset
  }

  // Données PNG
  for (let i = 0; i < count; i++) {
    pngBuffers[i].copy(ico, offsets[i]);
  }

  return ico;
}

async function generate() {
  console.log('⚙️  Génération des favicons depuis favicon.svg…\n');

  // ── 1. favicon-16.png ────────────────────────────────────────────────────
  const png16 = await sharp(svgBuffer)
    .resize(16, 16)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(join(PUBLIC, 'favicon-16.png'), png16);
  console.log('✅  favicon-16.png');

  // ── 2. favicon-32.png ────────────────────────────────────────────────────
  const png32 = await sharp(svgBuffer)
    .resize(32, 32)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(join(PUBLIC, 'favicon-32.png'), png32);
  console.log('✅  favicon-32.png');

  // ── 3. favicon.png (32×32 — fallback générique) ──────────────────────────
  writeFileSync(join(PUBLIC, 'favicon.png'), png32);
  console.log('✅  favicon.png');

  // ── 4. favicon-48.png (pour l'ICO) ───────────────────────────────────────
  const png48 = await sharp(svgBuffer)
    .resize(48, 48)
    .png({ compressionLevel: 9 })
    .toBuffer();

  // ── 5. favicon.ico  (16 + 32 + 48) ──────────────────────────────────────
  png16._icoSize = 16;
  png32._icoSize = 32;
  png48._icoSize = 48;
  const ico = buildIco([png16, png32, png48]);
  writeFileSync(join(PUBLIC, 'favicon.ico'), ico);
  console.log('✅  favicon.ico  (16 + 32 + 48 px)');

  // ── 6. apple-touch-icon.png (180×180) ────────────────────────────────────
  const png180 = await sharp(svgBuffer)
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(join(PUBLIC, 'apple-touch-icon.png'), png180);
  console.log('✅  apple-touch-icon.png  (180×180)');

  // ── 7. og-favicon (512×512) pour PWA / manifest ──────────────────────────
  const png512 = await sharp(svgBuffer)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(join(PUBLIC, 'icon-512.png'), png512);
  console.log('✅  icon-512.png  (512×512 — PWA)');

  console.log('\n🎉  Tous les favicons ont été régénérés dans /public/');
  console.log('📌  Pense à bumper le ?v= dans BaseLayout.astro si nécessaire');
}

generate().catch(err => { console.error('❌ Erreur :', err); process.exit(1); });

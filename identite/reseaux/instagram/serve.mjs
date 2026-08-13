/* Sert la planche des affiches Instagram en local.
   Lancement : node identite/reseaux/instagram/serve.mjs
   Puis http://localhost:4600 */
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, normalize } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const racine = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 4600;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let chemin = join(racine, normalize(url).replace(/^(\.\.[/\\])+/, ''));

  if (url === '/' || url === '') chemin = join(racine, 'planche.html');
  if (existsSync(chemin) && statSync(chemin).isDirectory()) chemin = join(chemin, 'planche.html');

  // on ne sort jamais du dossier servi
  if (!chemin.startsWith(racine) || !existsSync(chemin)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Introuvable');
  }

  res.writeHead(200, {
    'Content-Type': mime[extname(chemin).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(readFileSync(chemin));
}).listen(port, () => {
  console.log(`Planche des affiches Instagram : http://localhost:${port}`);
});

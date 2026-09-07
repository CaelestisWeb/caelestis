/* Petit serveur local pour regarder l'identite dans un navigateur.

   node identite/serveur.mjs            puis ouvrir http://localhost:4600
   node identite/serveur.mjs 5000       pour choisir le port

   Aucune dependance : ni npm install, ni build du site. Il sert le dossier
   identite/ tel quel, avec la page d'accueil en racine et un listage pour les
   dossiers qui n'en ont pas. Le site de production n'est pas touche. */

import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize, relative } from 'node:path';

const RACINE = dirname(fileURLToPath(import.meta.url));
const PORT_DEMANDE = Number(process.argv[2]) || 4600;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

const echapper = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Listage d'un dossier sans index.html : suffisant pour parcourir les SVG. */
async function listage(chemin, url) {
  const entrees = await readdir(chemin, { withFileTypes: true });
  const liens = entrees
    .filter((e) => !e.name.startsWith('.'))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name))
    .map((e) => `<li><a href="${echapper(e.name)}${e.isDirectory() ? '/' : ''}">${echapper(e.name)}${e.isDirectory() ? '/' : ''}</a></li>`)
    .join('\n    ');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${echapper(url)}</title>
<style>body{font:16px/1.7 system-ui,sans-serif;background:#FCFBF8;color:#12160F;margin:0;padding:48px 32px;max-width:820px}
h1{font-size:1.25rem;font-weight:700;margin:0 0 24px}a{color:#255C41}ul{list-style:none;padding:0;display:grid;gap:4px}
.retour{display:inline-block;margin-bottom:20px;font-size:.875rem;color:#5C6259}</style></head>
<body><a class="retour" href="/">Retour à l'accueil</a><h1>${echapper(url)}</h1><ul>
    ${url === '/' ? '' : '<li><a href="../">../</a></li>'}
    ${liens}
  </ul></body></html>`;
}

const serveur = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const cible = normalize(join(RACINE, url));
    /* Aucune sortie du dossier identite, meme avec des ../ dans l'adresse. */
    if (relative(RACINE, cible).startsWith('..')) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end('Hors du dossier identite.');
    }

    const info = await stat(cible);
    if (info.isDirectory()) {
      try {
        const page = await readFile(join(cible, 'index.html'));
        res.writeHead(200, { 'content-type': TYPES['.html'] });
        return res.end(page);
      } catch {
        res.writeHead(200, { 'content-type': TYPES['.html'] });
        return res.end(await listage(cible, url.endsWith('/') ? url : `${url}/`));
      }
    }

    const corps = await readFile(cible);
    res.writeHead(200, {
      'content-type': TYPES[extname(cible).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    return res.end(corps);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Introuvable.');
  }
});

/* Si le port est pris, essayer les suivants plutot que de tomber en erreur. */
let port = PORT_DEMANDE;
serveur.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && port < PORT_DEMANDE + 20) {
    port += 1;
    serveur.listen(port, '127.0.0.1');
  } else {
    console.error(e.message);
    process.exit(1);
  }
});
serveur.on('listening', () => {
  console.log(`\n  Identité Caelestis : http://localhost:${port}\n`);
  console.log('  Ctrl+C pour arrêter.\n');
});
serveur.listen(port, '127.0.0.1');

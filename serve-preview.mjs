import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, 'dist', 'client');
const port = 4321;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.xml':  'text/xml',
  '.txt':  'text/plain',
};

createServer((req, res) => {
  let url = req.url.split('?')[0].replace(/\/$/, '') || '/index';
  let filePath = join(root, url);
  if (!existsSync(filePath)) filePath = join(root, url + '.html');
  if (!existsSync(filePath)) filePath = join(root, url, 'index.html');
  if (!existsSync(filePath)) filePath = join(root, '404.html');
  if (!existsSync(filePath)) { res.writeHead(404); res.end('404'); return; }
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

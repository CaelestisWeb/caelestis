import { readFileSync, writeFileSync } from 'node:fs';

const ID = 'C:/dev/caelestis/identite';
// Source unique des polices : celles du site en production
const POLICES = 'C:/dev/caelestis/src/assets/fonts';
const b64 = (f) => readFileSync(`${POLICES}/${f}`).toString('base64');

let html = readFileSync(`${ID}/charte.template.html`, 'utf8');

html = html
  .replace('__F300__', b64('satoshi-300.woff2'))
  .replace('__F400__', b64('satoshi-400.woff2'))
  .replace('__F500__', b64('satoshi-500.woff2'))
  .replace('__F700__', b64('satoshi-700.woff2'));

// Les <img src="logo/..."> sont inlines pour que le fichier reste autonome hors serveur
html = html.replace(/src="(logo\/[^"]+\.svg)"/g, (_, chemin) => {
  const svg = readFileSync(`${ID}/${chemin}`).toString('base64');
  return `src="data:image/svg+xml;base64,${svg}"`;
});

writeFileSync(`${ID}/charte-caelestis.html`, html);
console.log('charte-caelestis.html ecrit,', (html.length / 1024).toFixed(0), 'Ko');

/* Planche visuelle de la charte : charte-caelestis.html, fichier autonome.
   node identite/build-charte.mjs

   Autonome veut dire qu'il s'ouvre par double-clic, s'envoie par courriel et
   se lit chez un imprimeur : les polices et les logos y sont incorpores en
   base64, il ne va rien chercher au reseau ni sur le disque. */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ICI = dirname(fileURLToPath(import.meta.url));
const POLICES = resolve(ICI, '../src/assets/fonts');   // source unique : celles du site en production
const b64 = (f) => readFileSync(`${POLICES}/${f}`).toString('base64');

let html = readFileSync(`${ICI}/charte.template.html`, 'utf8')
  .replace('__F300__', b64('satoshi-300.woff2'))
  .replace('__F400__', b64('satoshi-400.woff2'))
  .replace('__F500__', b64('satoshi-500.woff2'))
  .replace('__F700__', b64('satoshi-700.woff2'));

/* Les <img src="marque/..."> sont incorpores pour que le fichier reste
   autonome hors serveur. Un chemin relatif suffirait dans un navigateur ouvert
   sur le dossier, il casse des que le fichier voyage seul. */
html = html.replace(/src="(marque\/[^"]+\.svg)"/g, (_, chemin) =>
  `src="data:image/svg+xml;base64,${readFileSync(`${ICI}/${chemin}`).toString('base64')}"`);

/* Icone d'onglet, incorporee elle aussi. Sans balise icon le navigateur
   reclame un favicon.ico inexistant et affiche une erreur en console, ce qui
   fait douter d'une page par ailleurs saine. */
const icone = readFileSync(`${ICI}/marque/signe/favicon.svg`).toString('base64');
html = html.replace('</title>', `</title>\n<link rel="icon" href="data:image/svg+xml;base64,${icone}">`);

writeFileSync(`${ICI}/charte-caelestis.html`, html);
console.log(`charte-caelestis.html ecrit, ${(html.length / 1024).toFixed(0)} Ko`);

/* Ecrit satoshi.css, les quatre graisses de la marque en base64.
   Le catalogue est imprime par Chrome depuis file:// : une police liee par
   chemin relatif est bloquee, un data URI passe. Aucune requete tierce, la
   regle d'auto-hebergement vaut aussi pour les documents envoyes aux clients.
   Relancer si les fichiers de police changent : node ressources-design/build-polices.mjs */

import { readFileSync, writeFileSync } from 'node:fs';

const RACINE = 'C:/dev/caelestis';
const FONTS = `${RACINE}/src/assets/fonts`;
const b64 = (f) => readFileSync(`${FONTS}/${f}`).toString('base64');

const face = (poids) => `@font-face{font-family:'Satoshi';font-style:normal;font-weight:${poids};font-display:block;src:url(data:font/woff2;base64,${b64(`satoshi-${poids}.woff2`)}) format('woff2')}`;

const css = [300, 400, 500, 700].map(face).join('\n') + '\n';

writeFileSync(`${RACINE}/ressources-design/satoshi.css`, css);
console.log('satoshi.css ecrit,', (css.length / 1024).toFixed(0), 'Ko');

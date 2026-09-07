/* Fichiers du signe retenu.
   node identite/signe-retenu/build-pistes.mjs

   Les lockups au mot a l'ecran s'ecrivent apres la famille : ce ne sont pas
   des signes de plus mais des pieces du meme signe, et ils ne passent donc
   pas par la fabrique de serie. Leur cadrage est mesure ici, comme le reste. */

import { writeFileSync, readdirSync } from 'node:fs';
import { PISTES, DOSSIER, motEcran } from './signes.mjs';
import { ecrireSerie } from '../recherche/commun/fabrique.mjs';
import { boiteEncre, enveloppe } from '../recherche/commun/artefacts.mjs';
import { VERT, CREME, ENCRE } from '../recherche/commun/base.mjs';

await ecrireSerie(PISTES, DOSSIER);

/* La septieme piece : le mot entierement dans l'ecran, cadre entier, une
   seule couleur. Trois autres traitements du croisement ont ete fabriques
   puis ecartes le 7 septembre, ils restent disponibles dans signes.mjs par le
   parametre `traitement`. */
const faits = [];
for (const [nom, couleur] of [['vert', VERT], ['creme', CREME], ['encre', ENCRE]]) {
  const b = await boiteEncre(() => motEcran(ENCRE, { traitement: 'dedans' }));
  const l = +(b.x1 - b.x0).toFixed(3), h = +(b.y1 - b.y0).toFixed(3);
  writeFileSync(`${DOSSIER}/signe/lockup-mot-a-l-ecran-${nom}.svg`,
    enveloppe({ vb: `${b.x0} ${b.y0} ${l} ${h}`, l, h, corps: motEcran(couleur, { traitement: 'dedans' }) }, 'Caelestis'));
  faits.push(nom);
}
console.log(`Lockup au mot a l'ecran : ${faits.length} couleurs.`);

/* La tuile au mot. Elle ne remplace ni la tuile ni le favicon : mesure faite,
   le mot occupe 48,6 unites sur 100 dans la tuile, ce qui le rend illisible en
   dessous de 96 px et sale en dessous de 48. La tuile ordinaire et le favicon
   vivent justement a ces tailles la, avatar de fiche Google et onglet compris.
   Celle-ci est reservee aux carres affiches en grand : publication sociale,
   image de partage, tampon de document, carre imprime. */
export const TUILE_MOT_MINIMUM = 128;
{
  const b = await boiteEncre(() => motEcran(ENCRE, { traitement: 'dedans' }));
  const l = b.x1 - b.x0, h = b.y1 - b.y0;
  const k = 70 / Math.max(l, h);
  const dx = 50 - k * (b.x0 + l / 2), dy = 50 - k * (b.y0 + h / 2);
  const poser = (fond, encre) => `<rect width="100" height="100" rx="24" fill="${fond}"/>`
    + `<g transform="translate(${dx.toFixed(3)} ${dy.toFixed(3)}) scale(${k.toFixed(5)})">${motEcran(encre, { traitement: 'dedans' })}</g>`;
  for (const [nom, fond, encre] of [['creme-sur-vert', VERT, CREME], ['vert-sur-creme', CREME, VERT]]) {
    writeFileSync(`${DOSSIER}/signe/tuile-mot-${nom}.svg`,
      enveloppe({ vb: '0 0 100 100', l: 100, h: 100, corps: poser(fond, encre) }, 'Caelestis'));
  }
  console.log(`Tuile au mot : deux fonds, a n'employer qu'a partir de ${TUILE_MOT_MINIMUM} px.`);
}

/* Total compte sur le dossier et non additionne a la main : les cinq fichiers
   du mot a l'ecran s'ecrivent apres la serie, et un total ecrit en dur se
   perimerait au prochain ajout. */
console.log(`\nAu total : ${readdirSync(`${DOSSIER}/signe`).filter((f) => f.endsWith('.svg')).length} fichiers dans signe-retenu/signe/.`);

/* Fichiers du signe retenu.
   node identite/signe-retenu/build-pistes.mjs

   Les lockups au mot a l'ecran s'ecrivent apres la famille : ce ne sont pas
   des signes de plus mais des pieces du meme signe, et ils ne passent donc
   pas par la fabrique de serie. Leur cadrage est mesure ici, comme le reste. */

import { writeFileSync } from 'node:fs';
import { PISTES, DOSSIER, motEcran } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';
import { boiteEncre, enveloppe } from '../pistes-logo/artefacts.mjs';
import { VERT, CREME, ENCRE } from '../pistes-logo/pistes.mjs';

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

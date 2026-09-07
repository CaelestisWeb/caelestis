/* Fichiers du signe retenu.
   node identite/signe-retenu/build-pistes.mjs

   Le lockup au mot a l'ecran s'ecrit apres la famille : ce n'est pas un signe
   de plus mais une septieme piece du meme signe, et il ne passe donc pas par
   la fabrique de serie. Son cadrage est mesure ici, comme les autres. */

import { writeFileSync } from 'node:fs';
import { PISTES, DOSSIER, motEcran } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';
import { boiteEncre, enveloppe } from '../pistes-logo/artefacts.mjs';
import { VERT, CREME, ENCRE } from '../pistes-logo/pistes.mjs';

await ecrireSerie(PISTES, DOSSIER);

const b = await boiteEncre((c) => motEcran(c));
const l = +(b.x1 - b.x0).toFixed(3), h = +(b.y1 - b.y0).toFixed(3);
for (const [nom, couleur] of [['vert', VERT], ['creme', CREME], ['encre', ENCRE]]) {
  writeFileSync(`${DOSSIER}/signe/lockup-mot-a-l-ecran-${nom}.svg`,
    enveloppe({ vb: `${b.x0} ${b.y0} ${l} ${h}`, l, h, corps: motEcran(couleur) }, 'Caelestis'));
}
console.log(`Lockup au mot a l'ecran : encre ${l} x ${h}, trois couleurs.`);

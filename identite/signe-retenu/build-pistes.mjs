/* Fichiers du signe retenu.
   node identite/signe-retenu/build-pistes.mjs

   Les lockups au mot a l'ecran s'ecrivent apres la famille : ce ne sont pas
   des signes de plus mais des pieces du meme signe, et ils ne passent donc
   pas par la fabrique de serie. Leur cadrage est mesure ici, comme le reste. */

import { writeFileSync } from 'node:fs';
import { PISTES, DOSSIER, motEcran } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';
import { boiteEncre, enveloppe } from '../pistes-logo/artefacts.mjs';
import { VERT, CREME, ENCRE, MOUSSE } from '../pistes-logo/pistes.mjs';

await ecrireSerie(PISTES, DOSSIER);

const TRAITEMENTS = [
  ['a-l-ecran', 'interrompu'],
  ['ferme', 'ferme'],
  ['dedans', 'dedans'],
];

const faits = [];
for (const [suffixe, traitement] of TRAITEMENTS) {
  for (const [nom, couleur] of [['vert', VERT], ['creme', CREME], ['encre', ENCRE]]) {
    const dessin = () => motEcran(couleur, { traitement });
    const b = await boiteEncre(() => motEcran('#12160F', { traitement }));
    const l = +(b.x1 - b.x0).toFixed(3), h = +(b.y1 - b.y0).toFixed(3);
    writeFileSync(`${DOSSIER}/signe/lockup-mot-${suffixe}-${nom}.svg`,
      enveloppe({ vb: `${b.x0} ${b.y0} ${l} ${h}`, l, h, corps: dessin() }, 'Caelestis'));
    faits.push(`lockup-mot-${suffixe}-${nom}`);
  }
}

/* Le cadre en mousse est le seul a deux couleurs : le cadre en decor, le mot
   en vert foret sur fond clair et en creme sur fond vert. */
for (const [nom, couleurMot, couleurCadre] of [['sur-clair', VERT, MOUSSE], ['sur-vert', CREME, MOUSSE]]) {
  const dessin = () => motEcran(couleurMot, { traitement: 'ferme', couleurCadre });
  const b = await boiteEncre(() => motEcran('#12160F', { traitement: 'ferme' }));
  const l = +(b.x1 - b.x0).toFixed(3), h = +(b.y1 - b.y0).toFixed(3);
  writeFileSync(`${DOSSIER}/signe/lockup-mot-mousse-${nom}.svg`,
    enveloppe({ vb: `${b.x0} ${b.y0} ${l} ${h}`, l, h, corps: dessin() }, 'Caelestis'));
  faits.push(`lockup-mot-mousse-${nom}`);
}

console.log(`${faits.length} lockups au mot a l'ecran ecrits.`);

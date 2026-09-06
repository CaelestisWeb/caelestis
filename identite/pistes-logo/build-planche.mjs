/* Planche de la premiere serie.
   node identite/pistes-logo/build-planche.mjs [chemin-du-fragment] */

import { PISTES, REPERES, DOSSIER } from './pistes.mjs';
import { construirePlanche } from './fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: 'Cinq signes pour Caelestis',
  sortie: `${DOSSIER}/planche-pistes.html`,
  fragment: process.argv[2],
});

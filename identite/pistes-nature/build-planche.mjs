/* Planche de la seconde serie.
   node identite/pistes-nature/build-planche.mjs [chemin-du-fragment] */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../pistes-logo/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: "Le vivant et l'écran",
  sortie: `${DOSSIER}/planche-nature.html`,
  fragment: process.argv[2],
});

/* Planche de la huitieme serie.
   node identite/pistes-moniteur-plante/build-planche.mjs */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../pistes-logo/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: 'Le moniteur planté',
  sortie: `${DOSSIER}/planche-moniteur-plante.html`,
});

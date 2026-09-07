/* Planche de la septieme serie.
   node identite/pistes-moniteur/build-planche.mjs */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../pistes-logo/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: 'Le moniteur enraciné',
  sortie: `${DOSSIER}/planche-moniteur.html`,
});

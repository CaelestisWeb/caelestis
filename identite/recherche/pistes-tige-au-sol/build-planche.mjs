/* Planche de la neuvieme serie.
   node identite/recherche/pistes-tige-au-sol/build-planche.mjs */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../commun/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: 'La largeur de la ligne de sol',
  sortie: `${DOSSIER}/planche-tige-au-sol.html`,
});

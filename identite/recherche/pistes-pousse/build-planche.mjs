/* Planche de la troisieme serie.
   node identite/recherche/pistes-pousse/build-planche.mjs [chemin-du-fragment] */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../commun/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: 'La pousse et le carré',
  sortie: `${DOSSIER}/planche-pousse.html`,
  fragment: process.argv[2],
});

/* Planche de la premiere serie.
   node identite/recherche/pistes-logo/build-planche.mjs [chemin-du-fragment] */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../commun/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: 'Cinq signes pour Caelestis',
  sortie: `${DOSSIER}/planche-pistes.html`,
  fragment: process.argv[2],
});

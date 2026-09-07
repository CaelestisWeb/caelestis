/* Planche de la cinquieme serie.
   node identite/pistes-fleche-affinee/build-planche.mjs */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../pistes-logo/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: 'Cinq réglages de la flèche',
  sortie: `${DOSSIER}/planche-fleche-affinee.html`,
});

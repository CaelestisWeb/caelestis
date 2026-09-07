/* Planche de la quatrieme serie.
   node identite/pistes-fleche/build-planche.mjs [chemin-du-fragment] */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../pistes-logo/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: 'La flèche et le vivant',
  sortie: `${DOSSIER}/planche-fleche.html`,
});

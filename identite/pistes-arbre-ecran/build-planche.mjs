/* Planche de la sixieme serie.
   node identite/pistes-arbre-ecran/build-planche.mjs */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../pistes-logo/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: "L'ordinateur-arbre",
  sortie: `${DOSSIER}/planche-arbre-ecran.html`,
});

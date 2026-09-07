/* Planche du signe retenu.
   node identite/signe-retenu/build-planche.mjs */

import { PISTES, REPERES, DOSSIER } from './signes.mjs';
import { construirePlanche } from '../recherche/commun/fabrique.mjs';
import * as copie from './copie.mjs';

await construirePlanche({
  pistes: PISTES,
  reperes: REPERES,
  copie,
  titre: "L'écran planté",
  sortie: `${DOSSIER}/planche-signe-retenu.html`,
});

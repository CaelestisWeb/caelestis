/* Fichiers de la neuvieme serie, la largeur de la ligne de sol.
   node identite/pistes-tige-au-sol/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

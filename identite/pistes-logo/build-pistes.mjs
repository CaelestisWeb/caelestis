/* Fichiers de la premiere serie, les pistes abstraites.
   node identite/pistes-logo/build-pistes.mjs */

import { PISTES, DOSSIER } from './pistes.mjs';
import { ecrireSerie } from './fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

/* Fichiers de la huitieme serie, le moniteur plante sans racines.
   node identite/pistes-moniteur-plante/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

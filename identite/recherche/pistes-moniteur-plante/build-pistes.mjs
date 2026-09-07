/* Fichiers de la huitieme serie, le moniteur plante sans racines.
   node identite/recherche/pistes-moniteur-plante/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../commun/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

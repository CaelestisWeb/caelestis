/* Fichiers de la septieme serie, le moniteur enracine.
   node identite/recherche/pistes-moniteur/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../commun/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

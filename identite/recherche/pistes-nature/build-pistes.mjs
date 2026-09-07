/* Fichiers de la seconde serie, nature et web.
   node identite/recherche/pistes-nature/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../commun/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

/* Fichiers de la premiere serie, les pistes abstraites.
   node identite/recherche/pistes-logo/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../commun/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

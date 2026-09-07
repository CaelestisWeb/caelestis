/* Fichiers du signe retenu et de ses trois reglages.
   node identite/signe-retenu/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

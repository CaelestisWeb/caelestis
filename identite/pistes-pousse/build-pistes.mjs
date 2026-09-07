/* Fichiers de la troisieme serie, la pousse et le carre.
   node identite/pistes-pousse/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

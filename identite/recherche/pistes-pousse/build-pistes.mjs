/* Fichiers de la troisieme serie, la pousse et le carre.
   node identite/recherche/pistes-pousse/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../commun/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

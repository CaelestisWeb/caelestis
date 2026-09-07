/* Fichiers de la cinquieme serie, les reglages de la Fleche feuillue.
   node identite/recherche/pistes-fleche-affinee/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../commun/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

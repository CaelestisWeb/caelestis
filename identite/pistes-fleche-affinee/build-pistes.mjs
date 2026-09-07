/* Fichiers de la cinquieme serie, les reglages de la Fleche feuillue.
   node identite/pistes-fleche-affinee/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

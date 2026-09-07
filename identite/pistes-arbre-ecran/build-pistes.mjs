/* Fichiers de la sixieme serie, l'ordinateur-arbre.
   node identite/pistes-arbre-ecran/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

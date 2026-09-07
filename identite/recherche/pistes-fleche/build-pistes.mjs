/* Fichiers de la quatrieme serie, la fleche de croissance et le vivant.
   node identite/recherche/pistes-fleche/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../commun/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

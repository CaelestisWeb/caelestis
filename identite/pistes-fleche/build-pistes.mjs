/* Fichiers de la quatrieme serie, la fleche de croissance et le vivant.
   node identite/pistes-fleche/build-pistes.mjs */

import { PISTES, DOSSIER } from './signes.mjs';
import { ecrireSerie } from '../pistes-logo/fabrique.mjs';

await ecrireSerie(PISTES, DOSSIER);

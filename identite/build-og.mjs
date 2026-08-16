/* Image de partage (Open Graph) du site : public/og-image.jpg, 1200 x 630.
   Relancer apres toute evolution de la charte : node identite/build-og.mjs */

import sharp from 'sharp';
import { police, trace, monogramme, LOCKUP, DECALAGE_OPTIQUE_MONO, ENCRE_MONO, VERT, CREME } from './lib-traces.mjs';

const RACINE = 'C:/dev/caelestis';

const f500 = police(500);
const f400 = police(400);
const f700 = police(700);

const L = 1200;
const H = 630;
const MARGE = 92;   // marge exterieure, identique sur les quatre cotes

/* Toutes les positions se deduisent de la marge et des mesures d'encre : rien
   n'est pose a la main, les quatre marges restent donc egales par
   construction. Le bord gauche est celui de l'encre, pas celui d'une tuile. */
const TUILE = 126;
const TAILLE_MOT = +(TUILE * LOCKUP.mot).toFixed(2);
const TAILLE_PROMESSE = 40;
const INTERLIGNE = 52;
const decalEncreX = TUILE * (DECALAGE_OPTIQUE_MONO + ENCRE_MONO.x0);
const gaucheLockup = MARGE - decalEncreX;

/* Pied de page, cale sur la marge basse, puis le filet au-dessus. */
const TAILLE_PIED = 24;
const mesurePied = trace(f700, 'caelestis.fr', TAILLE_PIED, { ls: 0.5 });
const basePied = +(H - MARGE - mesurePied.bas).toFixed(2);
const yFilet = +(basePied - 48).toFixed(2);

/* Bloc principal centre dans l'espace restant, entre la marge haute et le filet. */
const mesureP1 = trace(f400, 'Des sites web pour ceux qui créent,', TAILLE_PROMESSE);
const hauteurBloc = TUILE * (ENCRE_MONO.y1 - ENCRE_MONO.y0) + 74 + INTERLIGNE + (mesureP1.bas - mesureP1.haut);
const hautTuile = +(MARGE + (yFilet - 32 - MARGE - hauteurBloc) / 2 - TUILE * ENCRE_MONO.y0).toFixed(2);
const basMono = hautTuile + TUILE * ENCRE_MONO.y1;

const mot = trace(f500, 'Caelestis', TAILLE_MOT, {
  x: gaucheLockup + TUILE * (1 + LOCKUP.ecart),
  y: hautTuile + TUILE * LOCKUP.baseline,
  ls: LOCKUP.interlettrage * TAILLE_MOT,
});

/* Promesse, deux lignes, Satoshi 400 */
const yP1 = +(basMono + 74 - mesureP1.haut).toFixed(2);
const promesse1 = trace(f400, 'Des sites web pour ceux qui créent,', TAILLE_PROMESSE, { x: MARGE - mesureP1.gauche, y: yP1, opacite: 0.92 });
const promesse2 = trace(f400, 'cultivent et bâtissent avec passion.', TAILLE_PROMESSE, { x: MARGE - mesureP1.gauche, y: yP1 + INTERLIGNE, opacite: 0.92 });

/* Pied : adresse du site a gauche, activite a droite, memes marges */
const site = trace(f700, 'caelestis.fr', TAILLE_PIED, { x: MARGE - mesurePied.gauche, y: basePied, ls: 0.5 });
const ACTIVITE = 'Création de sites internet, fiche Google et référencement';
const mesureAct = trace(f400, ACTIVITE, 22);
const activitePlace = trace(f400, ACTIVITE, 22, {
  x: L - MARGE - mesureAct.droite,
  y: basePied,
  opacite: 0.72,
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">
  <rect width="${L}" height="${H}" fill="${VERT}"/>
  ${monogramme(gaucheLockup + TUILE * DECALAGE_OPTIQUE_MONO, hautTuile, TUILE)}
  ${mot.markup}
  ${promesse1.markup}
  ${promesse2.markup}
  <rect x="${MARGE}" y="${yFilet}" width="${L - MARGE * 2}" height="1" fill="${CREME}" opacity="0.22"/>
  ${site.markup}
  ${activitePlace.markup}
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
  .toFile(`${RACINE}/public/og-image-2026.jpg`);

console.log('public/og-image-2026.jpg regenere, 1200 x 630');

/* Favicons et icones d'application, ecrits dans public/.

   Le C portait le meme defaut que les tuiles du logo : son encre occupe 13,5 a
   72,2 pour cent de sa tuile, la poser sans correction la laisse collee a
   gauche, ce qui se voit sur un onglet comme sur un ecran d'accueil. La
   geometrie vient de lib-traces, source unique partagee avec les logos.

   Deux familles, parce que les usages n'ont pas les memes regles :

     tuile   onglet du navigateur. L'icone est affichee telle quelle, elle
             porte donc les coins arrondis de la charte et le C a sa taille
             normale, 58,7 % du cote.

     pleine  apple-touch-icon et icones du manifeste. Le systeme applique son
             propre masque, arrondi sur iOS, parfois circulaire sur Android
             pour une icone declaree maskable. Le fond doit donc remplir tout
             le carre, sans transparence ni coins arrondis, et le dessin tenir
             dans la zone sure : le C est ramene a 47 % de hauteur, ce qui lui
             donne une diagonale de 60 % du cote, bien en deca des 80 %
             admis. Sans cela un masque circulaire lui couperait les extremites.

   Lancement : node identite/build-favicon.mjs */

import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { monogramme, DECALAGE_OPTIQUE_MONO, ENCRE_MONO, VERT } from './lib-traces.mjs';

const PUBLIC = 'C:/dev/caelestis/public';

/* Fond de la tuile. La charte harmonise l'identite sur #FCFBF8 et signale ce
   #F4F2EC comme le seul ecart restant : point encore ouvert, laisse tel quel
   pour ne pas le trancher ici. */
const FOND = '#F4F2EC';

/* Part de la hauteur occupee par l'encre du C dans une icone masquable. */
const HAUTEUR_SURE = 0.47;

const svgTuile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512" role="img" aria-label="Caelestis">
  <rect width="100" height="100" rx="24" fill="${FOND}"/>
  ${monogramme(100 * DECALAGE_OPTIQUE_MONO, 0, 100, VERT)}
</svg>
`;

/* Carre plein : la tuile du C est reduite puis centree, encre comprise. */
const tuilePleine = +(100 * HAUTEUR_SURE / (ENCRE_MONO.y1 - ENCRE_MONO.y0)).toFixed(3);
const margePleine = +((100 - tuilePleine) / 2).toFixed(3);
const svgPleine = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512" role="img" aria-label="Caelestis">
  <rect width="100" height="100" fill="${FOND}"/>
  ${monogramme(margePleine + tuilePleine * DECALAGE_OPTIQUE_MONO, margePleine, tuilePleine, VERT)}
</svg>
`;

writeFileSync(`${PUBLIC}/favicon.svg`, svgTuile);

const rendre = (svg, taille) =>
  sharp(Buffer.from(svg), { density: 600 }).resize(taille, taille).png({ compressionLevel: 9 }).toBuffer();

for (const [svg, taille, nom] of [
  [svgTuile, 16, 'favicon-16.png'],
  [svgTuile, 32, 'favicon-32.png'],
  [svgTuile, 32, 'favicon.png'],
  [svgPleine, 180, 'apple-touch-icon.png'],
  [svgPleine, 192, 'icon-192.png'],
  [svgPleine, 512, 'icon-512.png'],
]) {
  writeFileSync(`${PUBLIC}/${nom}`, await rendre(svg, taille));
}

/* favicon.ico : un ICO peut embarquer directement des PNG. En-tete de 6 octets,
   puis une entree de 16 octets par image, puis les donnees. */
const TAILLES_ICO = [16, 32, 48];
const images = await Promise.all(TAILLES_ICO.map((t) => rendre(svgTuile, t)));
const entete = Buffer.alloc(6);
entete.writeUInt16LE(0, 0);                    // reserve
entete.writeUInt16LE(1, 2);                    // type 1 = icone
entete.writeUInt16LE(images.length, 4);

let offset = 6 + images.length * 16;
const entrees = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e[0] = TAILLES_ICO[i];
  e[1] = TAILLES_ICO[i];
  e[2] = 0;                                    // palette
  e[3] = 0;                                    // reserve
  e.writeUInt16LE(1, 4);                       // plans
  e.writeUInt16LE(32, 6);                      // bits par pixel
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});
writeFileSync(`${PUBLIC}/favicon.ico`, Buffer.concat([entete, ...entrees, ...images]));

console.log(`public : favicon.svg, 6 PNG et favicon.ico (${TAILLES_ICO.join(', ')} px) regeneres, C centre.`);

/* Copie les affiches rendues dans "C:\dev\caelestis\Affiches publicitaires",
   avec des noms lisibles et l'ordre de publication.
   Lancement : node identite/reseaux/instagram/publicites/exporter-vers-dossier.mjs */
import { copyFileSync, mkdirSync, readdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(ICI, 'export');
const CIBLE = 'C:\\dev\\caelestis\\Affiches publicitaires';

/* [fichier rendu, nom lisible] dans l'ordre de publication conseillé */
const AFFICHES = [
  ['caelestis-offre-2-trois-metiers', 'A - Site internet, fiche Google, referencement'],
  ['caelestis-offre-3-signature', 'B - Tout ce qu il faut pour qu on vous trouve'],
  ['caelestis-offre-1-parcours', 'C - On vous cherche, on vous trouve, on vous choisit'],
  ['caelestis-pub-1-site-qui-reflete', '01 - Un site qui reflete votre activite'],
  ['caelestis-pub-6-prix-affiches', '02 - Le prix est sur le site'],
  ['caelestis-pub-2-etre-trouve', '03 - Etre trouve par ceux qui vous cherchent'],
  ['caelestis-pub-5-metiers-de-passion', '04 - Pour ceux qui creent quelque chose de beau'],
  ['caelestis-pub-3-fiche-google', '05 - Votre fiche Google'],
  ['caelestis-pub-9-une-seule-page', '06 - Une seule page suffit'],
  ['caelestis-pub-4-tout-reunir', '07 - Vous avez deja tout ce qu il faut'],
  ['caelestis-pub-7-sur-mesure', '08 - Un site qui fait ce que votre metier demande'],
  ['caelestis-pub-8-engagement-nature', '09 - 2 pourcent reverses a la nature'],
  ['caelestis-pub-10-partagez-la', '10 - Qu attendez-vous, partagez-la'],
];

/* on repart d'un dossier propre : les noms lisibles changeraient sinon en doublons */
if (existsSync(CIBLE)) {
  for (const entree of readdirSync(CIBLE)) rmSync(join(CIBLE, entree), { recursive: true, force: true });
}
mkdirSync(join(CIBLE, 'PNG'), { recursive: true });
mkdirSync(join(CIBLE, 'JPEG'), { recursive: true });

let n = 0;
for (const [rendu, lisible] of AFFICHES) {
  copyFileSync(join(SOURCE, rendu + '.png'), join(CIBLE, 'PNG', lisible + '.png'));
  copyFileSync(join(SOURCE, rendu + '.jpg'), join(CIBLE, 'JPEG', lisible + '.jpg'));
  n++;
}

const lisezMoi = `AFFICHES PUBLICITAIRES CAELESTIS
================================

${n} affiches au format 1080 x 1350 pixels, le format 4:5 qui occupe le plus
de place dans le fil Instagram. Rendues sans interpolation, donc nettes.

DEUX DOSSIERS
  PNG   qualite maximale, a garder comme source
  JPEG  plus leger, a televerser depuis le telephone

TROIS AFFICHES D'OFFRE, A PUBLIER EN PREMIER
  A  Site internet, fiche Google, referencement
     L'offre nommee, avec les prix d'entree. A epingler sur le profil.
  B  Tout ce qu'il faut pour qu'on vous trouve
     Les trois services en cartes. A republier regulierement.
  C  On vous cherche, on vous trouve, on vous choisit
     Le parcours du client en trois temps. Demande un peu de lecture.

DIX AFFICHES PAR SUJET, UNE PAR SEMAINE
  Dans l'ordre des numeros. La 10 se republie sans lassitude,
  c'est celle qui fait decrocher le telephone.

CE QUI EST AFFIRME
  Les tarifs viennent de src/utils/tarifs.ts, les delais et l'engagement
  nature sont repris du site. Aucune capture d'ecran : les pages, les
  fiches et les resultats de recherche sont dessines. Les exemples
  restent generiques, jamais une entreprise reelle. Le referencement
  est annonce sur devis.

REGENERER
  node identite/reseaux/instagram/publicites/build.mjs
  node identite/reseaux/instagram/publicites/exporter-vers-dossier.mjs

  Les sources modifiables sont dans identite/reseaux/instagram/publicites.
  Ce dossier-ci est une copie : toute modification faite ici sera perdue
  au prochain export.
`;

writeFileSync(join(CIBLE, 'LISEZ-MOI.txt'), lisezMoi, 'utf8');
console.log(n + ' affiches copiees dans ' + CIBLE);

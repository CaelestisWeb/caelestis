/* Texte de la planche du signe retenu. Regles de la charte tenues : aucune
   italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, le signe retenu, septembre 2026',
  titre: "L'écran planté",
  chapo: "Trois pièces : un écran 16/10 en contour, un col fuselé, et une ligne de sol de 60 unités dans laquelle il plonge. La Pousse est retirée de l'écran, à votre demande.",
};

export const DEPART = {
  titre: 'Ce que le retrait de la Pousse change',
  titreGarde: 'Les trois pièces, et leurs valeurs',
  specimen: { chemin: 'identite/pistes-tige-au-sol/minimale/tuile-creme-sur-vert.svg', legende: 'La version présentée, avec la Pousse' },
  texte: [
    "Le signe se réduit à trois pièces, et c'est sa force : il se dessine de mémoire, il tient à 16 px, et il ne dépend d'aucun détail. Il n'y a plus rien à perdre en réduisant.",
    "Il faut savoir ce que le retrait coûte, et le dire une fois pour toutes. Le vivant ne repose plus que sur deux traits, le fuselage du col et la ligne de sol. Le signe se rapproche donc du pictogramme ordinaire du moniteur, dont il ne se distingue plus que par deux écarts mesurables. Le col s'évase de 11 à 19 unités là où un pied de moniteur est droit. Et la ligne fait 60 là où un socle en fait 44.",
    "Ces deux écarts sont ce qui reste de toute la recherche, et ils se tiennent au dixième. Un col droit, ou une ligne ramenée à 48, et le signe devient une icône de moniteur comme il en existe des milliers.",
    "La Pousse n'est pas perdue pour autant. Elle peut vivre ailleurs dans l'identité, en pictogramme sur le site, en motif de section, ou en second signe sur les imprimés, sans être enfermée dans l'écran. Les fichiers existent déjà dans identite/pistes-pousse/.",
  ],
  garde: [
    ["L'écran", "76 sur 48 unités, du 16/10, angles à 7, contour de 7,5. Son encre mesure donc 83,5 de large."],
    ['Le col fuselé', "11 unités sous l'écran, 19 au sol. C'est le premier des deux écarts au pictogramme ordinaire, et il ne doit pas disparaître."],
    ['La ligne de sol', "60 unités sur 8 d'épaisseur. C'est le second écart : un socle de moniteur ordinaire fait 44."],
    ['Le plongeon', "4 unités. L'objet n'est pas posé sur la ligne, il est dedans. C'est ce qui dit planté, et c'est gratuit en encre."],
  ],
};

export const PLANCHES = {
  retenu: {
    numero: 'Le signe',
    resume: 'Écran en contour de 7,5, col fuselé, ligne de sol à 60.',
    idee: [
      "Le signe demandé, sans écart. Trois pièces, aucune courbe tracée à main levée, aucune forme organique. Tout se décrit en quatre nombres et se refabrique à l'identique.",
      "Il est livré ici en famille complète : signe nu dans les trois couleurs, lockups horizontal et vertical, tuiles, et un favicon au dessin allégé pour les petites tailles.",
    ],
    dit: "Un site installé quelque part, pour durer. Le registre est sobre, technique et calme.",
    demande: "Un contour de 7,5 sur un écran vide laisse une grande surface blanche au milieu du signe. À partir de 24 px cela va, en dessous le rectangle se referme. Les trois réglages qui suivent traitent ce point.",
    mesure: 'Lecture à 16 px : bonne. Le favicon épaissit le contour à 9,5 et élargit le sol à 64.',
  },
  'contour-epais': {
    numero: 'Réglage 1',
    resume: 'Le même, contour de 9,5 au lieu de 7,5.',
    idee: [
      "Un écran vide porte un trait plus fort qu'un écran habité : sans rien à l'intérieur, le contour est le signe. Deux unités de plus lui donnent la masse que la Pousse apportait.",
      "Le col et la ligne ne bougent pas, seul le contour change. La silhouette reste identique.",
    ],
    dit: "La même chose, dite avec plus d'assurance.",
    demande: "Un contour épais réduit d'autant le vide central, et l'écran se referme plus tôt en petite taille. Le gain en présence se paie en légèreté.",
    mesure: 'Lecture à 16 px : meilleure que le signe nu, le contour tient jusqu’au bout.',
  },
  'sol-68': {
    numero: 'Réglage 2',
    resume: 'Le même, ligne de sol à 68 au lieu de 60.',
    idee: [
      "Huit unités de plus, ce qui éloigne la ligne d'un socle de moniteur et rapproche le signe de ce qui avait été présenté. Elle reste bien en deçà de l'écran, dont l'encre fait 83,5.",
      "C'est le réglage à prendre si, à l'usage, le signe vous paraît trop proche d'une icône de moniteur ordinaire.",
    ],
    dit: "L'assise, un peu plus affirmée.",
    demande: "Une ligne plus longue rend le signe plus large que haut, ce qui va bien en en-tête et demande un recentrage dans un carré. La tuile et le favicon s'en chargent.",
    mesure: 'Lecture à 16 px : identique au signe, la ligne est déjà le dernier élément lisible.',
  },
  aplat: {
    numero: 'Réglage 3',
    resume: "Le même, l'écran en aplat plutôt qu'en contour.",
    idee: [
      "L'écran devient une surface pleine. Le signe gagne beaucoup en masse, se pose mieux sur un papier clair et devient très solide en petite taille.",
      "C'est le traitement à retenir si le signe doit vivre surtout en petit, en favicon et en avatar, plutôt qu'en grand sur un en-tête.",
    ],
    dit: "La présence. Le registre le plus affirmé des quatre.",
    demande: "Un aplat de cette taille consomme de l'encre à l'impression et pèse sur un fond clair. Il perd aussi le vide central, qui était la seule respiration du signe.",
    mesure: 'Lecture à 16 px : la meilleure des quatre, une masse pleine et un pied net.',
  },
};

export const BILAN = {
  titre: 'Le signe et ses trois réglages',
  chapo: "Le signe se juge à la taille où il vivra vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les quatre à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "Le signe est celui que vous avez demandé et il est livré tel quel, en famille complète. Une seule réserve, et je la pose une fois : sans la Pousse, ce qui distingue ce signe d'une icône de moniteur ordinaire tient à deux écarts, le col fuselé et la ligne à 60 contre 44. Ils sont fins. Il faudra les tenir au dixième sur tous les supports, et refuser toute simplification qui les rabote.",
      "Si vous êtes ouvert à un ajustement, prenez le réglage 1, le contour à 9,5. Un écran vide porte un trait plus fort qu'un écran habité : sans rien à l'intérieur, le contour est le signe, et deux unités de plus lui rendent la masse que la Pousse apportait. Rien d'autre ne change.",
      "La Pousse reste disponible dans identite/pistes-pousse/. Elle ferait un très bon second signe, en pictogramme de section sur le site ou en marque de fin de document, sans revenir dans l'écran.",
    ],
  },
  suite: {
    titre: 'La suite, une fois le réglage arrêté',
    etapes: [
      ['Le dessin final', "Reprise au dixième : rayon des angles, largeurs du col en haut et en bas, épaisseur et longueur de la ligne, corrections optiques aux jonctions."],
      ['La famille complète', "PNG et PDF pour l’imprimeur, image de partage, couverture et logo carré de la fiche Google, icônes d’application dans toutes les tailles."],
      ['La charte', "Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que de identite/build-logos.mjs."],
      ['Le site', "En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/signe-retenu/, onze par version. Fabrication : node identite/signe-retenu/build-pistes.mjs. Cette planche : node identite/signe-retenu/build-planche.mjs. Toute la recherche se regarde avec node identite/serveur.mjs.",
};

/* Texte de la planche de la huitieme serie. Regles de la charte tenues :
   aucune italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, huitième série, septembre 2026',
  titre: 'Le moniteur planté',
  chapo: "Le Moniteur planté est retenu, ses racines sont écartées. Il reste deux pièces à régler, le col et le pied, et cette série montre les quatre combinaisons plus la version en aplat.",
};

export const DEPART = {
  titre: 'Dire planté sans dessiner de racine',
  titreGarde: 'Ce qui ne bouge pas',
  specimen: { chemin: 'identite/pistes-moniteur/plante/tuile-creme-sur-vert.svg', legende: 'Le Moniteur planté retenu, avec ses racines' },
  texte: [
    "Une racine est une forme organique : elle se courbe, elle se ramifie, elle se fusèle. À côté d'un rectangle aux angles calculés, elle fera toujours illustration. C'est le reproche que vous avez adressé à la sixième série, et il valait encore pour la septième.",
    "Il existe une façon géométrique de dire la même chose : une ligne de sol plus large que l'écran, dans laquelle le col plonge de quatre unités. L'objet est dans la terre, et rien d'organique n'a été tracé. Le vocabulaire reste celui du reste du signe, des rectangles et des arrondis mesurés.",
    "Restent deux pièces à régler, et cette série les montre séparément. Le col, droit ou fuselé. Le pied, le socle classique du moniteur ou la ligne de sol. Les quatre combinaisons sont livrées, plus une cinquième qui traite l'autre question, celle de l'écran en contour ou en aplat.",
  ],
  garde: [
    ["L'écran", "76 sur 48 unités, du 16/10, angles à 7, contour de 7,5. C'est le dessin que vous avez retenu, il n'est pas retouché."],
    ['La Pousse', "Votre signe, posé dans l'écran. Même feuille que partout ailleurs : deux arcs de rayons différents, un ventre et un dos, pivot sur le point d'attache."],
    ['La ligne de sol', "80 unités de large, 8 d'épaisseur, et le col y plonge de 4. Elle mesurait 96 et débordait l'écran des deux côtés : raccourcie le 7 septembre, elle s'arrête en deçà du bord et reste presque deux fois plus large qu'un socle de moniteur."],
    ['Aucune forme organique', "Aucune courbe à main levée, aucun renflement irrégulier. Le col fuselé de la piste 3 est un trapèze, pas une tige dessinée."],
  ],
};

export const PLANCHES = {
  socle: {
    numero: 'Piste 1',
    resume: 'Col droit, socle classique. Le moniteur ordinaire.',
    idee: [
      "Le pictogramme du moniteur sans aucune modification : col droit, socle court et arrondi. Toute la nature vient de ce qui est affiché à l'écran.",
      "C'est la référence de la série, celle à laquelle les trois suivantes se comparent. C'est aussi la plus neutre, donc celle qui vieillira le moins vite.",
    ],
    dit: "Ce que vous mettez à l'écran, et rien d'autre. Le propos tient entièrement dans la Pousse.",
    demande: "Le socle est muet : il ne raconte rien, il porte. Qui veut que l'objet soit planté ne le lira pas ici. C'est le prix de la neutralité.",
    mesure: 'Lecture à 16 px : franche, la silhouette du moniteur est immédiate.',
  },
  sol: {
    numero: 'Piste 2',
    resume: 'Col droit, ligne de sol. Le moniteur planté.',
    idee: [
      "La ligne de sol fait 80 unités, presque deux fois la largeur d'un socle de moniteur. C'est cet écart avec le socle qui la fait lire comme le sol, sans avoir besoin de déborder l'écran.",
      "Le col y plonge de quatre unités. L'objet n'est pas posé dessus, il est dedans, et cela suffit à dire planté sans une seule forme organique.",
    ],
    dit: "Un site installé quelque part, pour durer. C'est la lecture que vous cherchiez, obtenue par la géométrie seule.",
    demande: "Une première version la donnait à 96 unités : elle débordait l'écran des deux côtés et le signe paraissait posé sur une planche. Raccourcie à 80, elle s'arrête en deçà du bord. La largeur exacte se règle piste par piste dans la neuvième série.",
    mesure: 'Lecture à 16 px : très bonne, la ligne pose le signe et lui donne son assise.',
  },
  tige: {
    numero: 'Piste 3',
    resume: 'Col fuselé, socle classique.',
    idee: [
      "Le col s'élargit vers le bas, de 11 unités sous l'écran à 19 sur le socle. Ce n'est pas une tige dessinée mais un trapèze, et il suffit à donner au pied un sens de lecture.",
      "L'évasement est le seul écart au vocabulaire strictement rectangulaire de la série. Il reste mesurable et se règle au dixième.",
    ],
    dit: "La même chose que la piste 1, avec un pied qui pousse plutôt qu'un pied qui porte.",
    demande: "Un col fuselé posé sur un socle court rapproche la silhouette de celle d'un trophée ou d'une lampe. Associé à la ligne de sol, piste 4, le risque disparaît.",
    mesure: 'Lecture à 16 px : correcte, l’évasement s’efface et le signe redevient la piste 1.',
  },
  'tige-sol': {
    numero: 'Piste 4',
    resume: 'Col fuselé, ligne de sol.',
    idee: [
      "La combinaison des deux réglages : le col s'évase et plonge dans le sol. C'est la piste qui dit le plus, avec exactement les mêmes pièces que les autres.",
      "L'évasement se lit ici comme un empattement dans la terre, ce qui règle la lecture de trophée que le socle court laissait passer.",
    ],
    dit: "Un site enraciné, sans qu'aucune racine soit dessinée. Le récit le plus complet de la série.",
    demande: "Deux écarts au pictogramme standard au lieu d'un : le col fuselé et la ligne large. C'est la piste la moins immédiatement reconnaissable comme moniteur, et il faut vérifier qu'elle le reste à petite taille.",
    mesure: 'Lecture à 16 px : bonne, mais l’évasement disparaît et elle rejoint la piste 2.',
  },
  plein: {
    numero: 'Piste 5',
    resume: "L'écran en aplat, la Pousse creusée dedans, ligne de sol.",
    idee: [
      "L'autre question de la série : le contour ou l'aplat. En aplat, le signe gagne en masse et se pose mieux sur un fond clair, et la Pousse devient un creux plutôt qu'une forme.",
      "Une version débordante a été rendue puis écartée : les feuilles passant par-dessus le bord haut de l'écran lisaient comme un nœud posé dessus.",
    ],
    dit: "La même chose, dite plus fort. Le registre le plus affirmé de la série.",
    demande: "Un aplat de cette taille est lourd sur un papier clair et consomme de l'encre. Il exige aussi une contreforme nette : la tige de la Pousse s'arrête au point d'attache des feuilles, qui montent de là sans jamais la recouvrir, faute de quoi le creux se rebouche.",
    mesure: 'Lecture à 16 px : très bonne, la masse porte le signe et le creux reste net.',
  },
};

export const BILAN = {
  titre: 'Les cinq côte à côte',
  chapo: "Un logo se juge à la taille où il vit vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les cinq à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "Le Sol, la piste 2. Col droit, ligne de sol. Elle dit planté sans une seule forme organique, elle garde la silhouette du moniteur intacte, et elle ne demande qu'une pièce de plus que le pictogramme ordinaire. C'est la réponse la plus économique à ce que vous cherchiez.",
      "La Tige au sol, la piste 4, est la plus expressive et je la garderais en réserve : elle demande deux écarts au pictogramme standard, ce qui est beaucoup pour un gain qui disparaît en petite taille.",
      "L'Écran plein est l'alternative de traitement, pas de dessin. Si le signe vous paraît trop léger sur un document, c'est la version à prendre, avec exactement la même géométrie.",
    ],
  },
  suite: {
    titre: 'Si une piste est retenue',
    etapes: [
      ['Le dessin final', "Reprise au dixième : rayon des angles, largeur du col, épaisseur et longueur de la ligne de sol, taille de la Pousse dans l’écran."],
      ['La famille complète', "Lockups horizontal et vertical, signe nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur, image de partage et couverture de fiche Google."],
      ['La charte', "Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que des scripts de fabrication."],
      ['Le site', "En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/pistes-moniteur-plante/, onze par piste. Fabrication : node identite/pistes-moniteur-plante/build-pistes.mjs. Cette planche : node identite/pistes-moniteur-plante/build-planche.mjs. Toutes les séries se regardent ensemble avec node identite/serveur.mjs.",
};

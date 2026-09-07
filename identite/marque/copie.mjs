/* Texte de la planche du signe retenu. Regles de la charte tenues : aucune
   italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, le signe retenu, septembre 2026',
  titre: "L'écran planté",
  chapo: "Trois pièces : un écran 16/10 en contour, un col fuselé, et une ligne de sol de 68 unités dans laquelle il plonge. C'est le seul signe encore travaillé.",
};

export const DEPART = {
  titre: 'Ce que le retrait de la Pousse change',
  titreGarde: 'Les trois pièces, et leurs valeurs',
  specimen: { chemin: 'identite/marque/signe/favicon.svg', legende: 'Le favicon, contour ramené de 9,5 à 8' },
  texte: [
    "Le signe se réduit à trois pièces, et c'est sa force : il se dessine de mémoire, il tient à 16 px, et il ne dépend d'aucun détail. Il n'y a plus rien à perdre en réduisant.",
    "Il faut savoir ce que le retrait coûte, et le dire une fois pour toutes. Le vivant ne repose plus que sur deux traits, le fuselage du col et la ligne de sol. Le signe se rapproche donc du pictogramme ordinaire du moniteur, dont il ne se distingue plus que par deux écarts mesurables. Le col s'évase de 11 à 19 unités là où un pied de moniteur est droit. Et la ligne fait 60 là où un socle en fait 44.",
    "Ces deux écarts sont ce qui reste de toute la recherche, et ils se tiennent au dixième. Un col droit, ou une ligne ramenée à 48, et le signe devient une icône de moniteur comme il en existe des milliers.",
    "La Pousse n'est pas perdue pour autant. Elle peut vivre ailleurs dans l'identité, en pictogramme sur le site, en motif de section, ou en second signe sur les imprimés, sans être enfermée dans l'écran. Son dessin est dans l'historique git, série 3 de la recherche, et RECHERCHE.md donne la commande pour le ressortir.",
  ],
  garde: [
    ["L'écran", "76 sur 48 unités, du 16/10, angles à 7, contour de 7,5. Son encre mesure donc 83,5 de large."],
    ['Le col fuselé', "11 unités sous l'écran, 19 au sol. C'est le premier des deux écarts au pictogramme ordinaire, et il ne doit pas disparaître."],
    ['La ligne de sol', "68 unités sur 8 d'épaisseur. C'est le second écart : un socle de moniteur ordinaire fait 44."],
    ['Le plongeon', "4 unités. L'objet n'est pas posé sur la ligne, il est dedans. C'est ce qui dit planté, et c'est gratuit en encre."],
  ],
};

export const PLANCHES = {
  signe: {
    numero: 'Le signe',
    resume: 'Écran en contour de 7,5, col fuselé, ligne de sol à 68.',
    idee: [
      "Trois pièces, quatre nombres, aucune courbe tracée à main levée. Le signe se dessine de mémoire et se refabrique à l'identique.",
      "Il est livré en famille complète : signe nu dans les trois couleurs, lockups horizontal et vertical, tuiles, et un favicon pour les petites tailles.",
    ],
    dit: "Un site installé quelque part, pour durer. Le registre est sobre, technique et calme.",
    demande: "Sans la Pousse, deux écarts au pictogramme ordinaire du moniteur portent tout le signe : le col s'évase de 11 à 19 unités là où un pied est droit, et la ligne fait 68 là où un socle en fait 44. Ils se tiennent au dixième, et toute simplification qui les rabote est à refuser.",
    mesure: "Lecture à 16 px : bonne. Le favicon garde le contour du signe, à une demi-unité près.",
  },
};

export const BILAN = {
  titre: 'Le signe aux tailles où il vivra',
  chapo: "L'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici le signe à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Le réglage du favicon',
    texte: [
      "Le favicon portait un contour de 9,5 unités là où le signe en a 7,5. L'écart se voyait : la version en petite taille avait des bordures nettement plus grosses que le signe lui-même, et elle en donnait une version engraissée plutôt qu'une version optique.",
      "Le contour du favicon est ramené à 8, une demi-unité de plus que le signe au lieu de deux. Le col et la ligne suivent : une unité de plus au lieu de deux et quatre. Le favicon garde ainsi le dessin du signe, avec juste ce qu'il faut de compensation pour tenir à 16 px.",
      "Les quatre valeurs se règlent dans identite/marque/signes.mjs, dans la constante PETIT. Une seule ligne à changer si le contour doit encore maigrir.",
    ],
  },
  suite: {
    titre: 'La suite',
    etapes: [
      ['Le dessin final', "Reprise au dixième : rayon des angles, largeurs du col en haut et en bas, épaisseur et longueur de la ligne, corrections optiques aux jonctions."],
      ['La famille complète', "PNG et PDF pour l’imprimeur, image de partage, couverture et logo carré de la fiche Google, icônes d’application dans toutes les tailles."],
      ['La charte', "Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que de identite/build-logos.mjs."],
      ['Le site', "En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/marque/signe/, seize au total. Fabrication : node identite/marque/build-signe.mjs. Cette planche : node identite/marque/build-planche.mjs.",
};

/* Texte de la planche de la neuvieme serie. Regles de la charte tenues :
   aucune italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, neuvième série, septembre 2026',
  titre: 'La largeur de la ligne de sol',
  chapo: "La Tige au sol est retenue. Un seul réglage reste ouvert, la longueur de sa ligne de sol, et cinq valeurs sont posées côte à côte pour le trancher à l'œil plutôt qu'au chiffre.",
};

export const DEPART = {
  titre: 'Trois repères pour lire ces cinq largeurs',
  titreGarde: 'Ce qui ne bouge dans aucune piste',
  specimen: { chemin: 'identite/pistes-moniteur-plante/tige-sol/tuile-creme-sur-vert.svg', legende: 'La Tige au sol, ligne raccourcie à 80' },
  texte: [
    "Présentée à 96 unités, la ligne débordait l'écran des deux côtés et le signe paraissait posé sur une planche. Elle est raccourcie, et la question devient simplement : de combien.",
    "Trois repères permettent de juger. L'encre de l'écran fait 83,5 unités, son rectangle de 76 plus son contour de 7,5 : au-delà, la ligne dépasse. Un socle de moniteur ordinaire fait 44 : la ligne doit rester nettement plus large pour lire comme le sol. Et en dessous d'une soixantaine, elle redevient un pied.",
    "Les cinq valeurs tiennent donc entre 60 et 84. Tout le reste du signe est celui de la huitième série, sans une retouche.",
  ],
  garde: [
    ["L'écran", "76 sur 48 unités, du 16/10, angles à 7, contour de 7,5. Son encre mesure donc 83,5 de large."],
    ['Le col fuselé', "11 unités sous l'écran, 19 au sol, et il plonge de 4 dans la ligne. C'est ce plongeon qui dit planté."],
    ['La Pousse', "Votre signe, posé dans l'écran, à la même taille sur les cinq pistes."],
    ["L'épaisseur du sol", "8 unités, inchangée. Seule la longueur varie, pour que la comparaison porte sur un paramètre et un seul."],
  ],
};

const piste = (numero, largeur, resume, idee, dit, demande, mesure) => ({ numero, resume, idee, dit, demande, mesure, largeur });

export const PLANCHES = {
  ras: piste('Piste 1', 84,
    "84 unités. La ligne s'arrête exactement au bord de l'écran.",
    [
      "La ligne et l'encre de l'écran finissent au même endroit, à une demi-unité près. Le signe forme un bloc franc, sans rien qui dépasse ni rien qui rentre.",
      "C'est la valeur qui donne le plus d'assise, et la seule où la ligne reste l'élément le plus large du signe.",
    ],
    "La stabilité, le socle assumé. Le registre le plus massif des cinq.",
    "Un alignement exact au bord se lit souvent comme un accident plutôt que comme une intention : à quelques dixièmes près, on ne sait plus si la ligne devait dépasser ou rentrer. C'est le défaut des coïncidences.",
    'Lecture à 16 px : franche, la ligne porte tout le signe.'),
  retrait: piste('Piste 2', 80,
    "80 unités. Deux unités de jour de chaque côté.",
    [
      "La ligne rentre juste assez pour qu'on voie qu'elle rentre. C'est la valeur posée par défaut en huitième série, après votre remarque.",
      "Le jour de deux unités est du même ordre que l'épaisseur du contour de l'écran, ce qui le rend cohérent avec le reste du dessin.",
    ],
    "L'assise, sans la lourdeur. Un bon compromis entre la piste 1 et la piste 3.",
    "Deux unités de jour se perdent en dessous de 32 px : à petite taille, cette piste et la première deviennent indiscernables.",
    'Lecture à 16 px : bonne, mais elle rejoint la piste 1.'),
  aplomb: piste('Piste 3', 76,
    "76 unités. La largeur du rectangle de l'écran, sans son contour.",
    [
      "La seule des cinq dont la valeur vient d'ailleurs que du goût : la ligne fait exactement la largeur du rectangle de l'écran, contour non compris. L'alignement est une règle du dessin, pas un réglage.",
      "Le jour de quatre unités de chaque côté se voit à toutes les tailles, et il se justifie si on le demande.",
    ],
    "L'assise et la mesure. Un signe dont les alignements se déduisent les uns des autres.",
    "L'alignement est invisible pour qui ne connaît pas la construction : personne ne verra que la ligne suit le rectangle de l'écran. Ce que voit le lecteur, c'est un jour de quatre unités, ni plus ni moins.",
    'Lecture à 16 px : très bonne, le jour reste perceptible.'),
  courte: piste('Piste 4', 68,
    "68 unités. Huit unités de jour de chaque côté.",
    [
      "La ligne se détache nettement de l'écran et devient un élément à part entière plutôt qu'un prolongement.",
      "Le signe gagne en légèreté et se pose mieux dans un carré, tuile et favicon compris, puisque sa largeur totale est alors celle de l'écran.",
    ],
    "La légèreté. Le registre le plus discret des cinq.",
    "À huit unités de jour, la ligne commence à ressembler à un socle large plutôt qu'au sol. Elle reste à 68 contre 44 pour un socle ordinaire, mais la marge se réduit.",
    'Lecture à 16 px : bonne, la ligne reste distincte du socle.'),
  minimale: piste('Piste 5', 60,
    "60 unités. La limite basse.",
    [
      "La valeur au-delà de laquelle la ligne cesse de lire comme le sol. Elle est ici pour borner la question par le bas, comme la piste 1 la borne par le haut.",
      "Elle a un intérêt propre : c'est la version la plus compacte, celle qui tient le mieux dans un carré.",
    ],
    "La compacité. Un moniteur sur un socle large, plutôt qu'un moniteur planté.",
    "À 60 contre 44 pour un socle ordinaire, l'écart ne suffit plus vraiment : beaucoup y verront un pied de moniteur un peu long. Si vous choisissez cette valeur, le signe perd la lecture qui a motivé toute la série.",
    'Lecture à 16 px : franche, mais le signe ne dit plus planté.'),
};

export const BILAN = {
  titre: 'Les cinq côte à côte',
  chapo: "Les cinq largeurs se jugent surtout côte à côte, et à la taille où le signe vivra. Voici les cinq à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "La piste 3, à 76 unités. C'est la seule dont la valeur se déduit du dessin plutôt que du goût : la ligne fait exactement la largeur du rectangle de l'écran, contour non compris. Dans six mois, quand la question reviendra, la réponse sera une règle et non un souvenir.",
      "Le jour de quatre unités reste perceptible à toutes les tailles, y compris à 16 px, ce qui n'est pas le cas des deux unités de la piste 2. Et l'écart avec un socle de moniteur, 76 contre 44, laisse la lecture du sol intacte.",
      "Si vous la voulez encore plus discrète, la piste 4 à 68 tient très bien et rend le signe plus compact dans un carré. En dessous, à 60, le signe redevient un moniteur sur un socle large et perd ce qui a motivé toute la recherche.",
    ],
  },
  suite: {
    titre: 'Une fois la largeur arrêtée',
    etapes: [
      ['Le dessin final', "Reprise au dixième : rayon des angles, largeur du col en haut et en bas, épaisseur de la ligne, taille de la Pousse dans l’écran, corrections optiques aux jonctions."],
      ['La famille complète', "Lockups horizontal et vertical, signe nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur, image de partage et couverture de fiche Google."],
      ['La charte', "Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que des scripts de fabrication."],
      ['Le site', "En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/pistes-tige-au-sol/, onze par largeur. Fabrication : node identite/pistes-tige-au-sol/build-pistes.mjs. Cette planche : node identite/pistes-tige-au-sol/build-planche.mjs. Toutes les séries se regardent ensemble avec node identite/serveur.mjs.",
};

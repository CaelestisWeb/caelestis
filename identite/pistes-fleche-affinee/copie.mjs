/* Texte de la planche de la cinquieme serie. Regles de la charte tenues :
   aucune italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, cinquième série, septembre 2026',
  titre: 'Cinq réglages de la flèche',
  chapo: "La Flèche feuillue est retenue, les quatre autres pistes de la série précédente sont écartées. Cette série ne cherche plus d'idée : elle fait varier un seul réglage à la fois sur le signe retenu, et propose à la fin la somme des trois que je recommande.",
};

export const DEPART = {
  titre: 'Ce qui change, et ce qui ne change pas',
  titreGarde: 'Les quatre réglages, un par piste',
  specimen: { chemin: 'identite/pistes-fleche/fleche-feuillue/tuile-creme-sur-vert.svg', legende: 'La Flèche feuillue, retenue le 7 septembre' },
  texte: [
    "Quand un signe est retenu, le travail cesse d'être une recherche et devient un réglage. Les cinq premières pistes qui suivent sont le même signe : la même tête triangulaire, la même feuille, la même hampe. Chacune modifie un seul paramètre, pour qu'on puisse le juger seul.",
    "La proportion de la tête et de la hampe. Le nombre de feuilles. Le fuselage de la hampe. Le carré autour. Ces quatre réglages sont indépendants, donc ils se combinent : la sixième piste montre le signe obtenu en retenant les trois premiers.",
    "Ce qui ne change dans aucune : les feuilles restent alternées, une de chaque côté et à deux hauteurs. Posées symétriquement, elles forment une seconde pointe et le signe lit comme une flèche à deux têtes, montante et descendante. C'est le seul point non négociable du dessin.",
  ],
  garde: [
    ['La proportion, piste 2', "La tête passe de 32 à 27 unités de large et gagne 4 de haut, la hampe perd 1 unité. Le signe s'élance sans changer de silhouette."],
    ['Le nombre de feuilles, piste 3', "Une seule feuille au lieu de deux. Le signe se tait davantage et gagne en très petite taille, au prix de la richesse du dessin."],
    ['Le fuselage, piste 4', "La hampe passe de 14 unités au pied à 9,5 sous la tête. Elle cesse d'être un trait pour devenir une tige."],
    ['Le carré, piste 5', "La tuile de la marque, rayon d'angle à 24 % du côté. Le signe devient un sceau, posable seul sur un tampon, un avatar ou une fin de document."],
  ],
};

export const PLANCHES = {
  feuillue: {
    numero: 'Piste 1',
    resume: 'Le signe tel que vous l’avez retenu, sans retouche.',
    idee: [
      "Hampe droite, tête triangulaire pleine, deux feuilles alternées sur la hampe. La flèche dit le développement, les feuilles disent d'où il vient. C'est la référence à laquelle les quatre autres se comparent.",
      "Elle est reproduite ici à l'identique, pour que la comparaison porte sur un seul écart à la fois plutôt que sur un souvenir.",
    ],
    dit: "La progression et le travail, dans le même signe. Le registre le plus direct de toutes les séries.",
    demande: "Sa tête est large, ce qui la rend franche mais un peu massive à côté de Satoshi, une police plutôt fine. C'est exactement ce que la piste 2 corrige.",
    mesure: 'Lecture à 16 px : franche, la tête porte le signe à elle seule.',
  },
  elancee: {
    numero: 'Piste 2',
    resume: 'Le réglage de la proportion : tête plus fine, plus haute.',
    idee: [
      "La tête perd 5 unités de large et gagne 4 de haut, la hampe perd 1 unité. Rien d'autre ne bouge. Le signe monte au lieu de pointer, et il se pose mieux à côté du mot Caelestis, dont les lettres sont fines.",
      "C'est le réglage qui change le plus le caractère pour le moins de matière déplacée : le signe passe de robuste à élancé sans changer de nature.",
    ],
    dit: "La même chose que la piste 1, sur un ton plus calme et plus soigné.",
    demande: "Une tête plus fine se ferme plus vite en petit : à 16 px, ses deux ailerons se rapprochent de la hampe. Le réglage tient, mais il faut le vérifier sur le favicon plutôt que sur l'écran.",
    mesure: 'Lecture à 16 px : bonne, les ailerons restent détachés. À surveiller si la tête s’affine encore.',
  },
  sobre: {
    numero: 'Piste 3',
    resume: 'Le réglage du nombre de feuilles : une seule.',
    idee: [
      "Une feuille au lieu de deux, posée plus bas et un peu plus grande. Le signe se simplifie et gagne du blanc, ce qui compte pour un logo qui vivra souvent en 20 pixels.",
      "L'asymétrie devient assumée : le signe a un côté, et il se lit de gauche à droite comme une lettre.",
    ],
    dit: "Le même propos, dit en moins de mots. La version la plus sobre de la série.",
    demande: "Une seule feuille rend l'ensemble plus léger, et un peu moins végétal : la lecture flèche prend le dessus. C'est un arbitrage, pas un défaut, mais il se décide en regardant le signe posé sur un devis plutôt qu'agrandi.",
    mesure: 'Lecture à 16 px : la meilleure des six, deux masses seulement.',
  },
  fuselee: {
    numero: 'Piste 4',
    resume: 'Le réglage de la hampe : elle s’évase au pied.',
    idee: [
      "La hampe passe de 14 unités au pied à 9,5 sous la tête. L'écart est faible et se voit : la hampe cesse d'être un trait pour devenir une tige, et le signe se plante au lieu de flotter.",
      "C'est le même geste que sur la Pousse et sur l'Arbre-écran de la troisième série, où l'évasement du pied avait déjà réglé la lecture.",
    ],
    dit: "La progression, mais enracinée. Le réglage qui ramène le plus de vivant dans le signe.",
    demande: "L'évasement se perd sous 20 px, où la hampe redevient un rectangle. Il travaille donc pour les grandes tailles, l'en-tête, la carte de visite, l'enseigne, et reste neutre ailleurs.",
    mesure: 'Lecture à 16 px : identique à la piste 1, l’évasement y disparaît sans manquer.',
  },
  cadree: {
    numero: 'Piste 5',
    resume: 'Le réglage du carré : le signe dans la tuile de la marque.',
    idee: [
      "La tuile de Caelestis, rayon d'angle à 24 % du côté, la valeur du monogramme en service. Le signe devient un sceau : il se pose seul sur un tampon, un avatar, une fin de devis, sans avoir besoin d'un fond autour.",
      "C'est la même logique que la Pousse cadrée que vous avez retenue : le cadre est un contenant, pas un second logo.",
    ],
    dit: "Le sérieux et la marque déposée. Le registre le plus institutionnel de la série.",
    demande: "Le cadre mange 34 % de la surface, donc le signe intérieur perd d'autant. C'est la piste la plus dense des six en petite taille, et la version petite grossit le signe intérieur pour compenser.",
    mesure: 'Lecture à 16 px : correcte, le cadre porte le signe. À réserver aux emplois carrés.',
  },
  combinee: {
    numero: 'Piste 6',
    resume: 'La somme des trois réglages que je recommande.',
    idee: [
      "Ce n'est pas un sixième réglage, c'est le signe qu'on obtient en retenant la tête élancée de la piste 2, la hampe fuselée de la piste 4, et les deux feuilles alternées de la piste 1. Les trois sont indépendants, ils s'additionnent sans se gêner.",
      "Elle est ici pour qu'un choix piste par piste ne demande pas d'imaginer le résultat. Si un des trois réglages est refusé, le signe se refabrique sans lui en une ligne.",
    ],
    dit: "La progression, enracinée, dite calmement. C'est le meilleur équilibre des six.",
    demande: "Elle cumule aussi les deux fragilités : une tête fine et un évasement, tous deux moins lisibles en petit. La version petite épaissit les deux, comme le fait déjà chaque favicon de la série.",
    mesure: 'Lecture à 16 px : bonne. La version petite reprend une tête plus large et une hampe plus droite.',
  },
};

export const BILAN = {
  titre: 'Les six côte à côte',
  chapo: "Un logo se juge à la taille où il vit vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les six à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "La Combinée, la piste 6 : tête élancée, hampe fuselée, deux feuilles alternées. La tête fine tient mieux à côté de Satoshi, qui est une police à traits fins, et l'évasement du pied fait la différence entre un pictogramme et un signe dessiné. Les deux feuilles restent, parce qu'une seule fait pencher la lecture du côté de la flèche seule.",
      "Prenez la Cadrée, la piste 5, comme icône, avec le même réglage à l'intérieur. C'est la logique que vous avez déjà validée sur la Pousse : le signe nu sur les documents et les en-têtes, le signe cadré partout où il faut un carré, l'onglet, l'avatar de la fiche Google, le tampon.",
      "Si un des trois réglages vous gêne, dites lequel : chacun se retire seul, et le signe se refabrique sans lui. C'est tout l'intérêt de les avoir séparés.",
    ],
  },
  suite: {
    titre: 'Si le réglage est arrêté',
    etapes: [
      ['Le dessin final', "Reprise au dixième : corrections optiques des jonctions feuille et hampe, angle exact des ailerons, épaisseurs relevées ou abaissées selon la taille."],
      ['La famille complète', "Lockups horizontal et vertical, signe nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur, image de partage et couverture de fiche Google."],
      ['La charte', "Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que des scripts de fabrication."],
      ['Le site', "En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/pistes-fleche-affinee/, onze par piste. Fabrication : node identite/pistes-fleche-affinee/build-pistes.mjs. Cette planche : node identite/pistes-fleche-affinee/build-planche.mjs. Toutes les séries se regardent ensemble avec node identite/serveur.mjs.",
};

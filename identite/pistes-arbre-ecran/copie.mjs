/* Texte de la planche de la sixieme serie. Regles de la charte tenues :
   aucune italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, sixième série, septembre 2026',
  titre: "L'ordinateur-arbre",
  chapo: "Le carré de l'écran, et sous lui un tronc et des racines. Cinq façons de tenir les deux ensemble, de la plus explicite à la plus contenue. La flèche est abandonnée.",
};

export const DEPART = {
  titre: 'Trois réglages qui ont demandé plusieurs essais',
  titreGarde: 'Ce que les cinq partagent',
  specimen: { chemin: 'identite/pistes-pousse/arbre-ecran/tuile-creme-sur-vert.svg', legende: "L'Arbre-écran de la troisième série, sans racines" },
  texte: [
    "Le carré est la tuile de la marque, rayon d'angle à 24 % du côté, la valeur du monogramme en service. Il ne change pas d'une piste à l'autre. Ce qui change, c'est ce qui pousse en dessous et ce qui borde le dessus.",
    "Trois choses ont demandé d'être reprises avant de tenir. Une racine droite d'épaisseur constante lit comme un pied de chevalet : elle est désormais fuselée, courbée, et se termine en pointe. Trois racines longues et bien écartées valent mieux que cinq courtes, au-delà de trois le signe lit comme un insecte. Et le tronc doit rester long et mince, vingt-quatre unités de haut pour neuf de large : avec un évasement marqué il disparaît sous les racines, et l'ensemble devient une carotte.",
    "Ces trois règles valent sur les cinq pistes. C'est ce qui en fait une famille plutôt qu'une collection.",
  ],
  garde: [
    ['Le carré de la marque', "Rayon d'angle à 24 % du côté, la valeur du monogramme en service et des icônes d'application. Le carré n'est pas emprunté à l'informatique, c'est la tuile de Caelestis."],
    ['La racine fuselée', "Base large au point d'attache, pointe au bout, une légère déviation latérale. Un trait d'épaisseur constante ne lit pas comme une racine."],
    ['Trois racines', "La plus longue au centre, deux plus courtes de part et d'autre à soixante degrés. Le nombre est un plafond mesuré, pas un goût : au-delà, la lecture bascule vers l'insecte."],
    ['Le tronc mince', "Neuf unités de large pour vingt-quatre de haut, un évasement à peine marqué. Il doit rester visible entre la cime et les racines."],
  ],
};

export const PLANCHES = {
  enracine: {
    numero: 'Piste 1',
    resume: 'La tuile en cime, le tronc, les racines.',
    idee: [
      "La lecture la plus directe de votre idée : l'écran est le feuillage, et il tient sur un tronc qui plonge. Trois formes, rien de plus, et la silhouette d'un arbre entier.",
      "C'est aussi la suite naturelle de l'Arbre-écran de la troisième série, à qui il manquait précisément ce qui tient : ce qu'on ne voit pas d'un site est ce qui le fait exister dans les résultats de recherche.",
    ],
    dit: "L'ancrage, la solidité, ce qui tient sous la surface. C'est le meilleur récit de la série pour une agence de référencement.",
    demande: "Le signe est presque deux fois plus haut que large, ce qui le rend étroit dans un en-tête et dans une signature de courriel. Les lockups le compensent, mais un format très large lui va mal.",
    mesure: 'Lecture à 16 px : bonne, la cime porte le signe et les racines font une masse.',
  },
  plante: {
    numero: 'Piste 2',
    resume: "Les racines sortent du bord bas de l'écran.",
    idee: [
      "Aucun tronc : l'écran lui-même est planté, ses racines partent directement de son bord bas. Le raccourci est plus franc, et le signe plus compact.",
      "La tuile est ici en contour plutôt qu'en aplat, ce qui allège l'ensemble et laisse la place aux racines sans que le signe devienne lourd.",
    ],
    dit: "L'implantation, l'installation durable. Le registre le plus proche du métier, un site posé quelque part pour longtemps.",
    demande: "Sans tronc, la lecture arbre s'efface au profit d'un objet planté. Certains y verront une lampe. Le contour épais et l'écartement des racines tiennent la lecture, mais c'est la piste la plus sensible aux réglages.",
    mesure: 'Lecture à 16 px : correcte, le contour se referme un peu. La version petite l’épaissit et raccourcit les racines.',
  },
  festonnee: {
    numero: 'Piste 3',
    resume: 'Le bord haut de la tuile se découpe en feuillage.',
    idee: [
      "Le buis taillé : la tuile reste une tuile, mais son bord haut se découpe en trois bosses. Le feuillage ne s'ajoute pas au carré, il vient de son contour.",
      "C'est votre deuxième proposition, le feuillage, traitée sans coller de feuilles sur un rectangle. Un arbre taillé au carré dit exactement ce que fait l'agence : du vivant, mis en forme.",
    ],
    dit: "Le vivant mis en forme, le soin, le travail de la main. C'est la piste qui parle le plus du métier plutôt que de l'outil.",
    demande: "Les bosses mesurent cinq unités de haut : en dessous de 24 px elles se referment et la tuile redevient lisse. La version petite les creuse à six unités, ce qui repousse le seuil sans le supprimer.",
    mesure: 'Lecture à 16 px : le feston disparaît, le signe devient la piste 1. Sans dommage, mais sans son idée.',
  },
  reserve: {
    numero: 'Piste 4',
    resume: "L'arbre entier, évidé dans la tuile pleine.",
    idee: [
      "L'inverse des autres : la tuile est pleine et l'arbre est creusé dedans, cime, tronc et racines. L'écran contient l'arbre au lieu de le porter.",
      "Le signe est carré, ce qui règle d'un coup le problème de format des quatre autres : il se pose tel quel en avatar, en favicon, en tampon et en fin de document, sans avoir besoin d'une tuile autour.",
    ],
    dit: "Le sceau. C'est la piste la plus affirmée de la série, et la plus facile à employer partout.",
    demande: "Un aplat de cette taille est lourd sur un papier clair, et il consomme de l'encre à l'impression. Il demande aussi une contreforme nette : les trois racines partent de trois segments voisins du bas du tronc, sans jamais se recouvrir, faute de quoi le creux se rebouche.",
    mesure: 'Lecture à 16 px : la meilleure des cinq, une masse pleine et un creux net.',
  },
  feuillu: {
    numero: 'Piste 5',
    resume: 'Deux feuilles sur le tronc, en plus des racines.',
    idee: [
      "La piste 1 à qui on ajoute vos deux propositions à la fois : le feuillage et les racines. Deux feuilles alternées poussent sur le tronc, une de chaque côté et à deux hauteurs.",
      "Ce sont les mêmes feuilles que la Pousse, votre préférée : même dessin, un ventre et un dos, pivot sur le point d'attache. Les deux signes appartiennent visiblement à la même main.",
    ],
    dit: "L'arbre complet, du feuillage aux racines. Le récit le plus riche de la série.",
    demande: "C'est aussi la plus chargée : cime, tronc, deux feuilles et trois racines font six éléments, là où la piste 1 en a trois. En dessous de 24 px les feuilles se collent au tronc et deviennent des épaisseurs. La version petite les agrandit, ce qui aide sans tout régler.",
    mesure: 'Lecture à 16 px : la plus faible de la série, les feuilles se referment sur le tronc.',
  },
};

export const BILAN = {
  titre: 'Les cinq côte à côte',
  chapo: "Un logo se juge à la taille où il vit vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les cinq à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "L'Enraciné, la piste 1, comme signe de marque, et la Réserve, la piste 4, comme icône. C'est la même identité vue de deux façons : le signe nu sur les documents et les en-têtes, le sceau carré partout où il faut un carré. Vous connaissez déjà cette logique, c'est celle de la Pousse et de la Pousse cadrée.",
      "Un point à savoir avant de choisir : les pistes 1, 3 et 5 sont presque deux fois plus hautes que larges. C'est juste pour un arbre et gênant pour un en-tête, une signature de courriel ou une carte de visite en format paysage. La Réserve, elle, est carrée, ce qui explique qu'elle serve mieux d'icône.",
      "La Festonnée est la plus intéressante des trois autres, parce qu'elle fait venir le feuillage du contour plutôt que de le coller au carré. Son défaut est mesurable : le feston se referme sous 24 px, et le signe redevient alors la piste 1.",
    ],
  },
  suite: {
    titre: 'Si une piste est retenue',
    etapes: [
      ['Le dessin final', "Reprise au dixième : angle et longueur de chaque racine, jonction du tronc et de la cime, épaisseurs relevées ou abaissées selon la taille."],
      ['La famille complète', "Lockups horizontal et vertical, signe nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur, image de partage et couverture de fiche Google."],
      ['La charte', "Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que des scripts de fabrication."],
      ['Le site', "En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/pistes-arbre-ecran/, onze par piste. Fabrication : node identite/pistes-arbre-ecran/build-pistes.mjs. Cette planche : node identite/pistes-arbre-ecran/build-planche.mjs. Toutes les séries se regardent ensemble avec node identite/serveur.mjs.",
};

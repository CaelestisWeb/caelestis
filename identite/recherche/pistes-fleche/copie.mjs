/* Texte de la planche de la quatrieme serie. Regles de la charte tenues :
   aucune italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, quatrième série, septembre 2026',
  titre: 'La flèche et le vivant',
  chapo: "Cinq voies pour dire le développement d'activité sans quitter le registre végétal, de la flèche explicite au signe qui n'en montre aucune. Le dessin de la feuille est celui de la série précédente, sans retouche.",
};

export const DEPART = {
  titre: "Ce que dit une flèche, et ce qu'elle coûte",
  titreGarde: 'Ce que les cinq tiennent',
  specimen: { chemin: 'identite/recherche/pistes-pousse/pousse/tuile-creme-sur-vert.svg', legende: 'La Pousse, votre préférée' },
  texte: [
    "Une flèche vers le haut est le signe le plus employé du commerce, et elle a une qualité que rien ne remplace : elle se comprend en un dixième de seconde, dans toutes les langues, et elle dit exactement ce qu'un artisan vient chercher chez vous. Elle a aussi un défaut, elle promet un résultat.",
    "Le référencement n'en garantit aucun, le classement appartient à Google. Les cinq pistes cherchent donc la même énergie sans la promesse, par trois moyens. Remplacer la flèche par une croissance végétale, qui monte sans rien jurer. Garder la flèche et lui donner une plante, ce qui déplace le propos du résultat vers le travail. Ou retirer la flèche et laisser l'alignement porter la direction.",
    "Elles vont de la plus explicite à la plus discrète, dans cet ordre. La Pousse et la Pousse cadrée restent vos deux préférées : cette série ouvre une autre porte plutôt qu'elle ne les remplace.",
  ],
  garde: [
    ['Le dessin de la feuille', "Deux arcs de rayons différents, un ventre et un dos, pivot sur le point d’attache. Exactement celui de la troisième série, sans retouche."],
    ['Le carré de la marque', "Rayon d’angle à 24 % du côté, la valeur du monogramme en service. Le Badge n’emprunte pas un cadre à l’informatique, il reprend la tuile de Caelestis."],
    ['Aucune promesse chiffrée', "Aucune piste ne dessine d’échelle, de valeur ni de pourcentage. Un graphique qui chiffre une progression invente un résultat, et le référencement se vend en obligation de moyens."],
    ['La palette', "Vert forêt et crème, une seule couleur par fichier, aucun dégradé, aucune ombre."],
  ],
};

export const PLANCHES = {
  'fleche-feuillue': {
    numero: 'Piste 1',
    resume: 'La flèche, et deux feuilles sur sa hampe.',
    idee: [
      "La plus directe des cinq : une vraie flèche, hampe droite et tête triangulaire, sur laquelle poussent deux feuilles. La flèche dit le développement, les feuilles disent d'où il vient. Rien n'est caché, et c'est le but.",
      "Les feuilles sont alternées, une de chaque côté et à deux hauteurs, comme sur une tige réelle. C'est ce qui les sauve : posées symétriquement, elles formaient une seconde pointe et le signe lisait comme une flèche à deux têtes.",
    ],
    dit: "La progression, l'élan, le résultat visé. Le registre le plus commercial de toute la série.",
    demande: "C'est le signe le plus commun du répertoire commercial, et celui qui promet le plus. Il faut accepter cette promesse ou choisir une autre piste. Il faut aussi tenir le jour entre la tête et la feuille haute : quand il se ferme, la tête devient une masse.",
    mesure: 'Lecture à 16 px : franche, la tête porte le signe à elle seule.',
  },
  courbe: {
    numero: 'Piste 2',
    resume: 'La courbe de croissance, une pointe au bout et une feuille en chemin.',
    idee: [
      "La courbe qui monte est le geste du développement d'activité, celui que tout le monde reconnaît sur un tableau de bord. Ici, elle part au ras du sol, prend son élan et se termine en pointe, avec une feuille qui pousse sur son passage.",
      "La pointe suit la tangente réelle de la courbe, calculée sur son dernier segment de contrôle. Posée à l'œil, elle donnait un accent circonflexe collé au bout du trait.",
    ],
    dit: "L'élan et la trajectoire. C'est la piste la plus dynamique des cinq, et la seule qui montre un mouvement plutôt qu'un état.",
    demande: "Elle appartient au registre du conseil et du tableau de bord, loin de l'atelier. C'est un vrai écart avec la voix de Caelestis, qui parle d'artisans et de savoir-faire. Elle demande aussi de la place en largeur, et son trait fin la rend fragile en gravure et en broderie.",
    mesure: 'Lecture à 16 px : bonne, la pointe et la feuille restent distinctes.',
  },
  'trois-pousses': {
    numero: 'Piste 3',
    resume: "L'histogramme qui est un semis.",
    idee: [
      "Trois brins de hauteur croissante, chacun coiffé d'une feuille. C'est un histogramme et c'est une rangée de jeunes pousses, sans qu'aucune des deux lectures ne prenne le dessus. La progression est portée par les hauteurs, pas par une flèche.",
      "Le rythme régulier des trois brins en fait aussi un motif : il se décline en filet de séparation, en puce de liste et en fond de section sur le site.",
    ],
    dit: "La progression mesurée, le travail par étapes, la culture. C'est le meilleur équilibre de la série entre le commerce et le vivant.",
    demande: "Trois brins se referment en dessous de 20 px, la version petite n'en garde que deux. Il faut aussi que les hauteurs restent nettement différentes : rapprochées, elles lisent comme trois traits et le sens de progression disparaît.",
    mesure: 'Lecture à 16 px : la version à deux brins prend le relais, le passage est déjà réglé.',
  },
  escalier: {
    numero: 'Piste 4',
    resume: 'Trois feuilles qui montent en marches, aucune flèche.',
    idee: [
      "Aucune tige, aucune pointe, aucun cadre : trois feuilles seules, de taille croissante, alignées sur une diagonale montante. C'est l'alignement qui porte la direction, et rien d'autre.",
      "C'est la piste la plus discrète de la série, et la plus proche d'un motif que d'un logo. Elle a la légèreté que les autres n'ont pas.",
    ],
    dit: "La montée, la répétition, la patience. Le registre le plus calme, le plus loin de la promesse.",
    demande: "Trois formes détachées ne font pas une silhouette : à 16 px, le signe devient trois points et perd son sens. La version petite passe à deux feuilles plus grandes, ce qui aide sans tout régler. C'est la piste la plus fragile des cinq, et il faut le savoir avant de la choisir.",
    mesure: 'Lecture à 16 px : la plus faible de la série, trois masses détachées se lisent mal.',
  },
  badge: {
    numero: 'Piste 5',
    resume: "L'histogramme végétal dans la tuile de la marque.",
    idee: [
      "Le signe que vous appelez entreprise verte : un pictogramme carré, fermé, qui se pose seul sur un document, un pied de page, une carte ou une étiquette. La tuile est celle de la marque, avec son rayon d'angle à 24 %.",
      "Le cadre fait tout le travail que les autres pistes demandent à une flèche : il ferme le signe, lui donne une assise et le rend reconnaissable à distance.",
    ],
    dit: "Le sérieux, le label, la mention. C'est moins un logo qu'une marque de qualité, et c'est justement son intérêt.",
    demande: "Un badge se lit comme une certification, ce qui peut laisser croire à un label délivré par un tiers. Il ne doit donc jamais porter un texte du type site vert ou éco-certifié, faute de quoi il devient une allégation sans organisme derrière. Comme signe de marque, il est aussi le plus dense des cinq.",
    mesure: 'Lecture à 16 px : bonne, le cadre porte le signe. La version petite passe à deux brins.',
  },
};

export const BILAN = {
  titre: 'Les cinq côte à côte',
  chapo: "Un logo se juge à la taille où il vit vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les cinq à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "Aucune de ces cinq ne fait un meilleur logo que la Pousse. Elles sont toutes plus bavardes, et un logo gagne à se taire. Le service qu'elles rendent est ailleurs : ce sont de bons signes secondaires, ceux qui accompagnent un argument plutôt que la marque.",
      "Prenez donc les Trois pousses, la piste 3, comme pictogramme de la croissance : en tête de la page Référencement, en puce dans un guide, en filet de séparation. Et le Badge, la piste 5, comme marque de fin de document, sur un devis, une facture ou une signature de courriel. Les deux vivent très bien à côté de la Pousse, puisqu'ils sont faits de la même feuille.",
      "Si l'une doit quand même devenir le logo, prenez la Courbe, la piste 2 : c'est la plus forte et la plus vivante. Sachez seulement qu'elle parle le langage du tableau de bord, et que vous avez écarté ce registre en juillet. La Flèche feuillue promet trop, et l'Escalier ne tient pas la petite taille.",
    ],
  },
  suite: {
    titre: 'Si une piste est retenue',
    etapes: [
      ['Le rôle', "Décider d’abord si le signe devient le logo ou reste un pictogramme secondaire. Les deux emplois demandent des réglages opposés : un logo se simplifie, un pictogramme peut garder du détail."],
      ['Le dessin final', "Reprise au dixième : corrections optiques, jonctions feuille et tige, épaisseurs relevées ou abaissées selon la taille."],
      ['La famille complète', "Lockups horizontal et vertical, signe nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur."],
      ['La charte', "Zone de protection, tailles minimales, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/recherche/pistes-fleche/, onze par piste. Fabrication : node identite/recherche/pistes-fleche/build-pistes.mjs. Cette planche : node identite/recherche/pistes-fleche/build-planche.mjs. Les quatre séries se regardent ensemble avec node identite/serveur.mjs.",
};

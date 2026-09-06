/* Texte de la planche de presentation. Regles de la charte tenues : aucune
   italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, septembre 2026',
  titre: 'Cinq signes pour Caelestis',
  chapo: 'Cinq pistes de logotype, complètes et opposées. Chacune reste dans la charte existante : Satoshi, la palette forêt, un seul vert, aucun dégradé et aucune ombre. Chacune est livrée en fichiers vectoriels, déclinée en tuile, en favicon, en lockup horizontal et vertical, sur fond clair comme sur fond vert.',
};

export const DEPART = {
  titre: 'Le point de départ',
  texte: [
    "Le monogramme actuel est un C ouvert : un arc de cercle d'épaisseur constante, l'ouverture à droite, posé sur une tuile arrondie. Il est net, il tient à toutes les tailles, et sa géométrie est documentée au dixième dans la charte.",
    "Sa limite tient en une phrase : il dit la première lettre du nom, et il s'arrête là. Un C ouvert appartient à toutes les marques dont le nom commence par C. Les cinq pistes cherchent un signe qui parle de Caelestis en particulier : un nom latin qui veut dire céleste, un métier qui rend visible, une clientèle qui travaille dehors et dont le savoir-faire se voit.",
  ],
  garde: [
    ['La palette', 'Vert forêt #255C41 et crème #FCFBF8, les deux seules couleurs des cinq pistes. Le reste de la palette sert aux supports, pas au logo.'],
    ['La typographie', 'Satoshi Medium 500, interlettrage -0.02 em, sans point final. Le mot est converti en tracés dans chaque fichier, il s’affiche donc à l’identique chez un imprimeur, dans Canva et dans Word.'],
    ['La discipline', 'Aucun dégradé, aucune ombre, aucun relief, une seule couleur par fichier. Un logo qui a besoin de deux tons ne survit pas à un tampon ni à une gravure.'],
    ['Le cadrage', 'Chaque fichier est mesuré au pixel après fabrication : l’encre touche ses quatre bords, une tuile est centrée sur l’encre du signe et non sur sa boîte.'],
  ],
};

export const PLANCHES = {
  aube: {
    numero: 'Piste 1',
    resume: "Un astre se lève sur la ligne d'horizon.",
    idee: [
      "Caelestis veut dire céleste, en latin. Le nom regarde le ciel, le métier regarde la terre : des paysagistes, des producteurs, des artisans qui travaillent dehors et dont l'activité suit les saisons. Ce signe tient les deux en deux formes, un disque et une ligne.",
      "C'est aussi le geste du référencement, dit sans le mot : quelque chose qui monte et qui devient visible. Le lever se lit sur toutes les cultures et dans toutes les langues, ce qui compte pour une marque qui vend de la clarté.",
    ],
    dit: "Le commencement, la visibilité qui monte, le travail rythmé par le dehors. Un registre calme et large, qui n'enferme aucun métier.",
    demande: "C'est la piste la plus simple des cinq, donc la plus exposée : un disque sur une ligne existe ailleurs. Elle tient par l'exécution, par le rapport exact entre le diamètre, l'épaisseur de la ligne et le blanc autour. Sa forme est large et basse, elle réclame de la place en largeur.",
    mesure: 'Lecture à 16 px : franche. Deux formes pleines, aucun détail à perdre.',
  },
  cerne: {
    numero: 'Piste 2',
    resume: 'Des cernes de croissance, fendus au même endroit.',
    idee: [
      "Trois anneaux autour d'un cœur, tous ouverts du même côté. La fente redonne le C du monogramme actuel : la marque avance sans repartir de zéro, et ceux qui la connaissent la reconnaissent encore.",
      "Le signe porte deux lectures qui se répondent. Les cernes d'un tronc, donc le temps, la patience et le vivant, ce qui parle exactement à la clientèle visée. Et une onde qui se propage depuis un centre, donc la portée, le signal, le référencement. Un métier qui pousse et une audience qui s'étend, dans un seul dessin.",
    ],
    dit: "La croissance lente et la portée. C'est la piste qui raconte le mieux ce que fait l'agence pour des gens dont le métier touche à la nature.",
    demande: "C'est le signe le plus dense des cinq. Trois anneaux se rejoignent en dessous de 20 px, une version à deux anneaux est donc fournie pour les petites tailles, comme le fait toute identité qui tient au favicon. Il faut aussi le garder loin du registre de la cible et du logo de réseau sans fil : la fente étroite et le cœur plein l'en écartent.",
    mesure: 'Lecture à 16 px : la version à deux anneaux prend le relais, le passage est déjà réglé.',
  },
  ligature: {
    numero: 'Piste 3',
    resume: 'La marque signe de son propre nom.',
    idee: [
      "En latin, caelestis s'écrit aussi cælestis, avec la ligature æ. La marque possède donc déjà un caractère qui lui appartient, sans qu'il faille en inventer un. Le signe est ce caractère, et le mot le porte en son milieu.",
      "C'est la seule piste sans métaphore : pas de soleil, pas d'arbre, pas de porte. Elle mise sur la typographie seule, ce que font les agences qui veulent qu'on regarde leur travail plutôt que leur emblème.",
    ],
    dit: "Le lettré, le précis, le fait à la main. Un registre d'atelier plutôt que d'agence, qui va bien à quelqu'un qui vend du soin du détail.",
    demande: "La ligature change l'orthographe affichée. Le nom légal reste Caelestis, et un lockup à orthographe courante est livré pour les documents administratifs. La vraie question porte sur le bouche à oreille : quelqu'un qui lit Cælestis doit deviner quoi taper dans une barre de recherche. Le Æ vient ici de Satoshi. Si la piste est retenue, il se redessine à la main, empattements du E resserrés et diagonale du A adoucie.",
    mesure: 'Lecture à 16 px : solide, un caractère plein reste un caractère plein.',
  },
  arche: {
    numero: 'Piste 4',
    resume: 'Un seuil, et le jour dessous.',
    idee: [
      "Un site est la porte par laquelle on entre chez vous. L'arche plein cintre le dit sans détour, et elle appartient au pays : les caves, les pigeonniers, les porches des vieux villages de la Drôme sont bâtis sur cette forme.",
      "Le disque posé sous la voûte fait le lien avec le nom : le ciel se voit depuis le seuil. Il joue aussi un rôle de dessin, en occupant le vide que l'arche laisse en haut.",
    ],
    dit: "L'accueil, le passage, la construction. Un registre bâti et durable, qui parle aux métiers de la matière.",
    demande: "Une barre à la naissance des voûtes a été essayée puis retirée le jour même : elle faisait lire un A, donc la mauvaise initiale. La forme est étroite et haute, elle réclame de la place en hauteur et de la retenue dans les lockups, où le mot ne doit pas l'écraser.",
    mesure: 'Lecture à 16 px : franche, le disque reste détaché de la voûte.',
  },
  etoile: {
    numero: 'Piste 5',
    resume: 'Le repère vers lequel on se tourne.',
    idee: [
      "Huit branches, quatre longues aux points cardinaux, l'anneau de l'astrolabe autour. C'est le sens propre du nom : caelestis, céleste. Et c'est le seul objet qu'on regarde pour savoir où l'on est.",
      "Pour une agence de référencement, l'orientation est le métier même. Un client cherche à être trouvé, un visiteur cherche à s'y retrouver. La rose des vents dit les deux d'un coup.",
    ],
    dit: "L'orientation, la fiabilité, le point fixe. C'est la piste la plus emblématique, celle qui supporte le mieux le tampon, la gravure et la broderie.",
    demande: "L'étoile appartient à un registre chargé : la boussole des agences de voyage, l'astrologie, l'étoile à quatre branches devenue le signe des outils d'intelligence artificielle. Les huit branches, les longueurs inégales et l'anneau gravé l'en éloignent. L'anneau se perd en dessous de 24 px, une version sans anneau est fournie.",
    mesure: 'Lecture à 16 px : la version sans anneau prend le relais, les huit branches restent lisibles.',
  },
};

export const BILAN = {
  titre: 'Les cinq côte à côte',
  chapo: "Un logo se juge à la taille où il vit vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les cinq à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "Le Cerne, la piste 2. C'est la seule qui garde le C actuel tout en disant quelque chose de neuf, et la seule dont les deux lectures tombent juste toutes les deux : la croissance pour la clientèle, la portée pour le métier. Elle donne aussi le plus de matière aux supports, puisque les anneaux se déclinent en filets, en fonds et en séparateurs sur tout le site.",
      "L'Aube, la piste 1, vient juste derrière et pour la raison inverse : elle est imbattable en lisibilité et en calme, au prix d'une forme que d'autres marques emploient déjà. Elle est le choix sûr.",
      "L'Étoile fixe est la plus emblématique et la meilleure en gravure. L'Arche est la plus liée au territoire. La Ligature est la plus singulière, et la seule qui pose une vraie question commerciale, celle de l'orthographe affichée.",
    ],
  },
  suite: {
    titre: 'Si une piste est retenue',
    etapes: [
      ['Le dessin final', 'Reprise au dixième : corrections optiques, jonctions, épaisseurs relevées ou abaissées selon la taille. Un tracé juste en géométrie demande toujours quelques écarts pour paraître juste à l’œil.'],
      ['La famille complète', 'Lockups horizontal et vertical, monogramme nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur, image de partage et couverture de fiche Google.'],
      ['La charte', 'Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que des scripts de fabrication.'],
      ['Le site', 'En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis.'],
    ],
  },
};

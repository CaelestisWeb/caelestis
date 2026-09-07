/* Texte de la planche de la septieme serie. Regles de la charte tenues :
   aucune italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, septième série, septembre 2026',
  titre: 'Le moniteur enraciné',
  chapo: "Le carré devient un écran : format 16/10, angles peu arrondis, un col et un socle. Et comme un moniteur possède déjà un pied, il suffit d'échanger son socle contre des racines pour en faire un arbre.",
};

export const DEPART = {
  titre: 'Ce qui a changé depuis la série précédente',
  titreGarde: 'Les quatre pièces',
  specimen: { chemin: 'identite/pistes-arbre-ecran/enracine/tuile-creme-sur-vert.svg', legende: "L'Enraciné de la sixième série, écarté" },
  texte: [
    "Deux reproches, deux corrections. Le carré ne ressemblait pas à un ordinateur : un carré à coins très arrondis lit comme une icône d'application. L'écran est maintenant un rectangle en 16/10, angles à sept unités seulement, avec un col et un socle. C'est la silhouette que tout le monde reconnaît.",
    "Le dessin faisait illustration : les racines étaient courbes, fuselées et nombreuses. Elles sont devenues trois prismes droits, sans courbe ni renflement, dans le même vocabulaire géométrique que l'écran. Une racine tracée à main levée n'a pas sa place à côté d'un rectangle aux angles calculés.",
    "Le gain principal est ailleurs que dans le détail. Un moniteur possède déjà un col et un socle : rien ne s'ajoute au signe, une pièce est échangée. C'est ce qui empêche l'ensemble de ressembler à deux objets empilés, et c'est aussi ce qui règle le format. Les signes de cette série sont larges ou presque carrés, là où ceux de la précédente étaient deux fois plus hauts que larges.",
  ],
  garde: [
    ["L'écran", "76 sur 48 unités, soit du 16/10, angles à 7. Un rayon plus fort le ferait basculer du côté de l'icône d'application, et le signe cesserait de dire ordinateur."],
    ['Le col', "13 unités de large sur 18 de haut. Il doit rester visible entre l'écran et ce qui le porte, sinon les racines paraissent sortir de l'écran lui-même."],
    ['Les racines', "Trois prismes droits, le plus long au centre, les deux autres à quarante-six degrés. Trois est un plafond mesuré : au-delà, le signe lit comme un insecte."],
    ["La Pousse à l'écran", "Votre signe préféré, creusé dans l'écran. Sa tige s'arrête au point d'attache des feuilles, qui montent de là sans jamais la recouvrir, faute de quoi le creux se reboucherait."],
  ],
};

export const PLANCHES = {
  moniteur: {
    numero: 'Piste 1',
    resume: 'Le socle du moniteur est remplacé par trois racines.',
    idee: [
      "Le geste le plus court de la série : un moniteur ordinaire, dont le socle devient un système racinaire. Rien n'est ajouté au pictogramme, une pièce est échangée, et l'objet change de nature.",
      "L'écran est plein, ce qui donne au signe sa masse et le rend franc à toutes les tailles.",
    ],
    dit: "Un site qui tient parce qu'il est enraciné. C'est le récit qui convient le mieux au référencement, où ce qui porte un site ne se voit pas.",
    demande: "L'écran plein ne montre rien, il reste une surface. Qui cherche à voir ce que fait l'agence n'aura que la silhouette, ce qui est un choix défendable mais un choix.",
    mesure: 'Lecture à 16 px : franche, la masse de l’écran porte le signe.',
  },
  'pousse-ecran': {
    numero: 'Piste 2',
    resume: "Le moniteur garde son socle, la Pousse est à l'écran.",
    idee: [
      "Un moniteur complet, col et socle, avec votre signe préféré creusé dans l'écran. L'ordinateur montre le vivant : c'est exactement ce que fait un site pour un artisan qui travaille dehors.",
      "C'est la piste la plus économique en éléments : deux formes et un creux. Elle est aussi la plus proche des pictogrammes que les gens lisent tous les jours, donc la plus immédiate.",
    ],
    dit: "Ce que vous mettez à l'écran. Le propos se déplace de l'outil vers ce qu'on y montre.",
    demande: "Le socle classique est neutre, donc muet : il ne raconte rien. C'est le prix de la clarté. Et la Pousse creusée réclame un écran assez grand, ce qui interdit de réduire l'écran en dessous de 40 unités.",
    mesure: 'Lecture à 16 px : la meilleure de la série, la Pousse reste lisible dans le creux.',
  },
  plante: {
    numero: 'Piste 3',
    resume: "L'écran en contour, et les racines.",
    idee: [
      "La même idée que la piste 1, l'écran en contour plutôt qu'en aplat. Le signe s'allège, respire davantage et consomme moins d'encre à l'impression.",
      "Le contour laisse aussi l'écran vide, ce qui est une lecture juste : un site est une place à remplir.",
    ],
    dit: "La légèreté et la place à prendre. Le registre le plus discret de la série.",
    demande: "Un contour de 7,5 unités se referme en dessous de 20 px et l'écran devient un aplat. La version petite l'épaissit à 9,5, ce qui repousse le seuil sans le supprimer.",
    mesure: 'Lecture à 16 px : correcte, mais le contour se comble. C’est la plus fragile des cinq.',
  },
  complet: {
    numero: 'Piste 4',
    resume: "La Pousse à l'écran, et les racines à la place du socle.",
    idee: [
      "La somme des pistes 1 et 2 : le vivant à l'écran et le vivant sous l'écran. Ce qui se montre et ce qui tient, dans le même signe.",
      "C'est la piste qui dit le plus, et elle le dit sans rien ajouter d'étranger au pictogramme d'un moniteur.",
    ],
    dit: "Tout à la fois : ce que vous montrez et ce qui le fait tenir. Le récit le plus complet de la série.",
    demande: "C'est aussi la plus chargée. Le creux de la Pousse et les trois racines se disputent l'attention, et sous 24 px les deux se simplifient en même temps. Si l'un des deux doit partir, ce sont les racines : ce sont elles qui ramènent le risque d'illustration.",
    mesure: 'Lecture à 16 px : bonne, mais le signe est le plus dense de la série.',
  },
  portable: {
    numero: 'Piste 5',
    resume: "L'ordinateur portable, la Pousse à l'écran.",
    idee: [
      "Un portable plutôt qu'un moniteur : l'écran et sa base, rien d'autre. La silhouette est large et basse, ce qui la pose très bien à côté du mot Caelestis.",
      "C'est aussi l'objet le plus juste pour la clientèle visée : un artisan regarde son site sur un portable ou un téléphone, rarement sur un moniteur de bureau.",
    ],
    dit: "Le travail d'aujourd'hui, mobile et ordinaire. Le registre le plus proche du quotidien de vos clients.",
    demande: "Un portable date plus vite qu'un moniteur, dont la silhouette n'a pas bougé depuis vingt ans. Et le format large convient mal aux emplois carrés, avatar et favicon, où il faudra passer par la tuile.",
    mesure: 'Lecture à 16 px : bonne, la base souligne l’écran et tient la silhouette.',
  },
};

export const BILAN = {
  titre: 'Les cinq côte à côte',
  chapo: "Un logo se juge à la taille où il vit vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les cinq à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "La Pousse à l'écran, la piste 2. C'est la plus économique, la plus lisible en petit, et la seule dont chaque élément se justifie : un moniteur que tout le monde reconnaît, et dedans le signe que vous avez choisi. Elle relie aussi cette série à la Pousse, ce qui évite de repartir de zéro une fois de plus.",
      "Si les racines comptent pour vous, prenez l'Enraciné complet, la piste 4 : c'est la même chose, avec le socle échangé. Sachez seulement que ce sont les racines qui ramènent le risque d'illustration que vous avez signalé, et qu'elles sont la première chose à retirer si le signe paraît chargé.",
      "Le Portable est le plus juste pour vos clients, qui regardent rarement un moniteur de bureau. Il vieillira plus vite. Le Moniteur planté est le plus léger, et le plus fragile en petite taille.",
    ],
  },
  suite: {
    titre: 'Si une piste est retenue',
    etapes: [
      ['Le dessin final', "Reprise au dixième : rayon des angles de l’écran, largeur du col, angle et longueur de chaque racine, épaisseurs relevées ou abaissées selon la taille."],
      ['La famille complète', "Lockups horizontal et vertical, signe nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur, image de partage et couverture de fiche Google."],
      ['La charte', "Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que des scripts de fabrication."],
      ['Le site', "En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/pistes-moniteur/, onze par piste. Fabrication : node identite/pistes-moniteur/build-pistes.mjs. Cette planche : node identite/pistes-moniteur/build-planche.mjs. Toutes les séries se regardent ensemble avec node identite/serveur.mjs.",
};

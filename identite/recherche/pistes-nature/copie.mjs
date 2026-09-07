/* Texte de la planche de la seconde serie. Regles de la charte tenues :
   aucune italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, seconde série, septembre 2026',
  titre: "Le vivant et l'écran",
  chapo: "Cinq pistes bâties sur une seule règle : la nature et le web y sont la même forme, jamais deux objets posés côte à côte. Palette, typographie et épaisseur de trait inchangées, fichiers vectoriels complets, déclinaisons jusqu'au favicon.",
};

export const DEPART = {
  titre: 'La règle que ces cinq suivent',
  titreGarde: 'Ce que les cinq pistes tiennent',
  specimen: { chemin: 'identite/marque/signe/tuile-creme-sur-vert.svg', legende: "L'Écran planté, le signe retenu" },
  texte: [
    "La demande était un arbre dans un ordinateur. Prise au pied de la lettre, elle donne un pictogramme : un sapin dans une télévision, deux objets empilés dont l'un décore l'autre. Prise au sérieux, elle donne une règle de dessin : chercher les endroits où une forme du vivant et une forme du web sont déjà la même forme, et ne dessiner que celle-là.",
    "Ces endroits existent, et le vocabulaire du métier les nomme déjà. Une arborescence est le plan d'un site autant que la charpente d'un arbre. Une balise se ferme par une barre oblique, qui est le dessin d'une nervure. Une lentille de loupe et une feuille ont la même amande. Une flèche de croissance et une jeune pousse font le même geste. Chaque piste tient sur une de ces coïncidences, et sur une seule.",
    "La première série reste disponible dans identite/recherche/pistes-logo/ : elle cherchait un signe de marque, celle-ci cherche un signe de métier. Les deux se lisent ensemble.",
  ],
  garde: [
    ['La palette', 'Vert forêt #255C41 et crème #FCFBF8, rien d’autre. Le vert pomme écologique reste dehors, comme la charte le demande.'],
    ['Le registre', 'Les formes végétales sont géométriques : des arcs de cercle et des segments, tracés à la même épaisseur que le reste de la marque. Aucun feuillage dessiné, aucune veinure, aucun contour organique.'],
    ['La typographie', 'Satoshi Medium 500 à -0.02 em, sans point final, convertie en tracés dans chaque fichier. Le mot s’affiche à l’identique chez un imprimeur, dans Canva et dans Word.'],
    ['Le cadrage', 'Chaque fichier est mesuré au pixel après fabrication : l’encre touche ses quatre bords, une tuile est centrée sur l’encre du signe et non sur sa boîte.'],
  ],
};

export const PLANCHES = {
  arborescence: {
    numero: 'Piste 1',
    resume: "Le plan d'un site a la forme d'un arbre.",
    idee: [
      "Le mot est le même dans les deux métiers. Une arborescence, c'est la charpente d'un arbre, et c'est le plan d'un site : une racine, des embranchements, des pages au bout. Le signe ne rapproche pas deux images, il dessine le mot que les deux partagent.",
      "Les cinq disques au bout des branches sont des nœuds de schéma autant que des bourgeons. Ils donnent au signe sa lecture technique sans lui retirer sa lecture vivante, et ils lui donnent sa masse aux petites tailles, là où un trait seul disparaît.",
    ],
    dit: "La structure, la clarté du plan, la croissance. C'est la piste qui parle le plus directement de ce que vous faites : mettre de l'ordre dans ce qu'un artisan a à montrer.",
    demande: "Le schéma est symétrique, donc calme, alors qu'un arbre réel ne l'est jamais. La version définitive gagnerait à décaler une branche d'un ou deux degrés pour respirer. Et il faut tenir la limite du nombre : au-delà de cinq nœuds, la forme redevient un organigramme.",
    mesure: 'Lecture à 16 px : les branches basses se ferment. La version petite les retire et garde le tronc, deux branches et trois nœuds.',
  },
  balise: {
    numero: 'Piste 2',
    resume: 'Une feuille écrite en trois signes : le chevron, la barre, le chevron.',
    idee: [
      "Une page web se ferme par une balise, et cette balise porte une barre oblique. Posez les deux chevrons face à face et vous obtenez une amande, la forme d'une feuille. Laissez la barre au milieu et elle en devient la nervure. Rien n'est ajouté pour fabriquer la ressemblance, elle existe déjà.",
      "C'est la fusion la plus discrète des cinq. La plupart des gens verront une feuille. Ceux qui touchent au web verront la balise fermante. Les deux lectures sont justes, et la seconde arrive en second, ce qui est exactement le rôle d'un détail.",
    ],
    dit: "Le soin du détail et la matière du métier. Le signe dit le code sans montrer un écran, et la nature sans dessiner un feuillage.",
    demande: "La feuille est la forme la plus employée du secteur, et la charte s'en méfie à juste titre. Ce qui la sauve ici, c'est qu'elle est construite et non illustrée : deux arcs de cercle et un segment, aucune découpe organique. Le jour aux deux pointes doit rester visible, sinon les trois traits se referment en contour et la balise disparaît.",
    mesure: 'Lecture à 16 px : le jour se ferme. La version petite épaissit les traits et élargit l’amande pour le rouvrir.',
  },
  fenetre: {
    numero: 'Piste 3',
    resume: "Votre idée, tenue au plus court : l'arbre dans l'écran.",
    idee: [
      "L'écran est réduit à un filet fin, l'arbre est plein et occupe le cadre. Le rapport de force compte plus que les deux objets : ce n'est pas un ordinateur qui contient un arbre, c'est un arbre que l'écran encadre.",
      "La cime est une amande et non un rond, ce qui l'écarte de l'arbre de dessin animé. Le tronc court la relie au bas du cadre : l'arbre est posé dans l'écran, il ne flotte pas dedans.",
    ],
    dit: "Ce que vous faites, dit sans détour : le vivant, mis en vitrine. C'est la piste la plus immédiate, celle qu'un client comprend sans explication.",
    demande: "C'est aussi la plus littérale, donc celle qui vieillit le plus vite : un cadre d'écran date une identité, et les proportions des écrans changent tous les cinq ans. Elle demande de rester sur un rectangle neutre, sans barre d'adresse ni boutons, faute de quoi elle devient une capture d'écran.",
    mesure: 'Lecture à 16 px : le cadre se remplit. La version petite épaissit le filet et grossit la cime.',
  },
  loupe: {
    numero: 'Piste 4',
    resume: 'La lentille et la feuille ont la même amande.',
    idee: [
      "Le référencement tient en un mot : être trouvé. La loupe le dit depuis toujours, et son manche est déjà une tige. Il suffit de rendre à sa lentille la forme qu'elle partage avec une feuille pour que l'outil et le vivant deviennent un seul objet.",
      "Le signe fonctionne dans les deux sens de lecture. On regarde votre métier de près. Et ce qu'on y trouve, c'est du vivant.",
    ],
    dit: "La recherche, l'attention, le détail. C'est la piste la plus explicite sur le métier de référencement, et elle l'est sans écrire le mot.",
    demande: "La loupe est un pictogramme d'interface avant d'être un symbole de marque, et elle traîne avec elle l'idée de la barre de recherche. L'amande à la place du cercle l'en éloigne, mais il faut résister à toute envie de la rendre plus reconnaissable, sinon elle redevient une icône de bouton.",
    mesure: 'Lecture à 16 px : franche, deux masses simples et un angle net.',
  },
  pousse: {
    numero: 'Piste 5',
    resume: 'La flèche de croissance et la jeune pousse font le même geste.',
    idee: [
      "Une flèche vers le haut est le signe le plus usé du commerce. Deux feuilles ouvertes en V font exactement le même dessin, et disent la même chose sans rien promettre : ce qui pousse monte.",
      "La tige droite tient le signe, les deux amandes lui donnent son sens. Rien d'autre n'est ajouté, ce qui le laisse lisible à toute taille et le rend facile à broder, à graver et à tamponner.",
    ],
    dit: "La croissance, le début, l'élan. Le registre le plus commercial des cinq, tenu par une forme végétale.",
    demande: "Une flèche vers le haut promet des résultats, et le référencement n'en garantit aucun : le classement appartient à Google. Le signe doit donc rester une pousse et jamais un graphique qui monte, ce qui interdit de creuser l'angle du V. C'est aussi la piste la plus proche de ce que font d'autres marques, elle tient par la qualité du dessin des deux feuilles.",
    mesure: 'Lecture à 16 px : la meilleure des cinq, la silhouette reste entière.',
  },
};

export const BILAN = {
  titre: 'Les cinq côte à côte',
  chapo: "Un logo se juge à la taille où il vit vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les cinq à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "L'Arborescence, la piste 1. C'est la seule dont les deux lectures viennent d'un même mot plutôt que d'une ressemblance de formes : une arborescence est un plan de site et la charpente d'un arbre, sans métaphore à expliquer. Elle est aussi la plus utile en dehors du logo, puisque la structure en nœuds se décline en fils de navigation, en séparateurs et en schémas sur tout le site.",
      "La Balise, la piste 2, est la plus discrète, et c'est sa force : elle passe pour une feuille et se révèle après coup. Elle demande en échange qu'on tienne le jour aux pointes, faute de quoi elle redevient une feuille ordinaire.",
      "La Fenêtre est votre idée tenue au plus court, et la plus immédiate à comprendre. La Loupe est la plus explicite sur le référencement. La Pousse est la plus lisible et la plus vendeuse, au prix d'une forme que beaucoup emploient déjà.",
    ],
  },
  suite: {
    titre: 'Si une piste est retenue',
    etapes: [
      ['Le dessin final', 'Reprise au dixième : corrections optiques, jonctions, épaisseurs relevées ou abaissées selon la taille. Un tracé juste en géométrie demande toujours quelques écarts pour paraître juste à l’œil.'],
      ['La famille complète', 'Lockups horizontal et vertical, signe nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur, image de partage et couverture de fiche Google.'],
      ['La charte', 'Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que des scripts de fabrication.'],
      ['Le site', 'En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis.'],
    ],
  },
  pied: "Fichiers vectoriels dans identite/recherche/pistes-nature/, onze par piste. Fabrication : node identite/recherche/pistes-nature/build-pistes.mjs, qui écrit les fichiers puis mesure leur cadrage au pixel. Cette planche : node identite/recherche/pistes-nature/build-planche.mjs. La première série vit dans identite/recherche/pistes-logo/, avec sa propre planche.",
};

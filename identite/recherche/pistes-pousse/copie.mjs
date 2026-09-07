/* Texte de la planche de la troisieme serie. Regles de la charte tenues :
   aucune italique, aucun tiret cadratin ni demi-cadratin, aucun point median,
   formulation affirmative, espace insecable avant les signes doubles. */

export const OUVERTURE = {
  surtitre: 'Identité, troisième série, septembre 2026',
  titre: 'La pousse et le carré',
  chapo: "Cinq variations sur les deux signes retenus : la pousse, et le carré arrondi de l'icône. Un seul paramètre change d'une piste à l'autre, la place du carré. Le dessin de la feuille, lui, est repris de fond en comble.",
};

export const DEPART = {
  titre: 'Ce que le dessin gagne',
  titreGarde: 'La feuille, en quatre règles',
  specimen: { chemin: 'identite/recherche/pistes-nature/pousse/tuile-creme-sur-vert.svg', legende: 'La Pousse de la série précédente' },
  texte: [
    "La Pousse et la Fenêtre tenaient sur une bonne idée et un dessin approximatif. Trois défauts se voyaient. Les deux feuilles étaient des amandes symétriques, donc mortes. Elles flottaient à côté de la tige au lieu d'en sortir. Et la tige avait la même épaisseur du pied à la cime, ce qu'aucune plante ne fait.",
    "Les trois sont corrigés, et toute la série en découle. Chaque feuille a maintenant un ventre et un dos, deux arcs de rayons différents. Chaque feuille pivote sur son point d'attache, posé sur l'axe de la tige. La tige est fuselée, et son pied s'évase quand elle porte un arbre plutôt qu'une pousse.",
    "Le carré, lui, n'est pas un rectangle quelconque : c'est la tuile de la marque, rayon d'angle à 24 % du côté, la valeur exacte du monogramme en service et des icônes d'application. Le carré de ces cinq pistes est donc déjà celui de Caelestis. Les cinq ne changent qu'une chose, la place qu'il occupe : aucun carré, le carré dans la feuille, en cime, autour, au pied.",
  ],
  garde: [
    ['Le ventre et le dos', "Deux arcs de rayons différents, flèche extérieure à 13,5 unités et intérieure à 7,5. Une amande symétrique donne une feuille de pictogramme ; cet écart lui donne un sens de pousse et un côté qui regarde le ciel."],
    ["Le point d'attache", "La feuille pivote sur sa base, posée sur l'axe de la tige. Elle en sort au lieu de se poser à côté, et changer son inclinaison ne déplace jamais l'attache."],
    ['La tige fuselée', "11 unités au pied, 8,4 à la naissance des feuilles. L'écart est faible et se voit quand même : il donne au signe son sens de lecture, de bas en haut."],
    ['Le carré de la marque', "Rayon d'angle à 24 % du côté, la valeur du monogramme en service. Le carré n'est pas une forme empruntée à l'informatique, c'est la tuile de Caelestis."],
  ],
};

export const PLANCHES = {
  pousse: {
    numero: 'Piste 1',
    resume: 'Aucun carré. Le signe seul, redessiné.',
    idee: [
      "C'est votre préférée, reprise au dixième. Les feuilles gardent leur ouverture et leur masse, mais chacune a désormais un ventre vers l'extérieur et un dos vers la tige, elle pivote sur son point d'attache, et la tige s'épaissit vers le pied. Le signe raconte une croissance au lieu de dessiner un pictogramme.",
      "Elle ne dit rien du web, et c'est un choix tenable : le mot Caelestis et le métier s'en chargent partout ailleurs. Beaucoup d'agences vivent très bien avec un signe qui ne montre pas leur outil.",
    ],
    dit: "La croissance, le début, le soin. Le registre le plus simple et le plus large des cinq.",
    demande: "Elle demande d'assumer un signe végétal sans référence au métier. Et c'est la forme la plus employée du secteur, donc celle qui tient uniquement par la qualité du dessin. C'est justement ce qui a été travaillé ici.",
    mesure: 'Lecture à 16 px : la meilleure des cinq. Trois masses simples, aucune finesse à perdre.',
  },
  'pousse-carree': {
    numero: 'Piste 2',
    resume: 'Le carré est dans la feuille.',
    idee: [
      "Chaque feuille est la tuile de l'icône dont deux angles opposés se ferment en pointe. Le côté extérieur garde son arête droite, le côté intérieur son arrondi : la feuille et l'icône d'application deviennent la même forme.",
      "C'est la fusion la plus discrète de la série. La plupart des gens verront une pousse un peu anguleuse. Ceux qui posent le signe à côté d'une icône d'application verront que c'est la même géométrie.",
    ],
    dit: "Le vivant taillé, la précision. Le signe garde la chaleur de la pousse en y mettant une règle.",
    demande: "L'arête droite se perd dès que le signe descend sous 24 px, et la piste redevient alors la première. La version petite ouvre l'angle des feuilles et raccourcit le rayon pour garder l'arête lisible.",
    mesure: 'Lecture à 16 px : franche, mais l’arête droite se referme. La version petite la rouvre.',
  },
  'arbre-ecran': {
    numero: 'Piste 3',
    resume: 'Le carré est la cime.',
    idee: [
      "Deux formes, rien de plus : la tuile de la marque posée sur un tronc. L'arbre se lit d'un coup, et le carré arrondi reste ce qu'il est, une icône. C'est la piste la plus économique de la série, et la plus solide aux petites tailles.",
      "Le pied du tronc s'évase. Sans cet évasement, le signe lisait comme une pelle ou un miroir à main ; avec lui, il est planté.",
    ],
    dit: "La solidité, la permanence, l'ancrage. C'est la piste qui vieillira le mieux, parce qu'elle ne dessine aucun matériel.",
    demande: "Le carré ne montre pas d'écran, il le suggère. Qui cherche une lecture explicite du web restera sur sa faim, et c'est le prix de la simplicité. La proportion entre la cime et le tronc est le seul réglage qui compte : un tronc trop long en fait un panneau.",
    mesure: 'Lecture à 16 px : excellente, deux masses pleines.',
  },
  'pousse-cadree': {
    numero: 'Piste 4',
    resume: 'Le carré entoure.',
    idee: [
      "La pousse pousse dans le cadre, et la tige naît du bord bas : les deux ne sont pas superposés, ils partagent un trait. C'est la lecture la plus claire de votre idée de départ, le vivant dans l'écran.",
      "Le cadre en fait aussi un signe fermé, donc un sceau. Il se pose seul sur un tampon, une couverture de fiche Google ou un avatar, sans avoir besoin d'une tuile autour.",
    ],
    dit: "Le métier mis en vitrine, et un signe qui tient tout seul dans un carré. La piste la plus immédiate à comprendre.",
    demande: "C'est la plus dense des cinq : le cadre et la pousse se disputent la place sous 20 px, et la version petite épaissit le trait pour tenir. Un cadre rectangulaire daterait l'identité, celui-ci est carré et neutre, sans barre d'adresse ni boutons.",
    mesure: 'Lecture à 16 px : le cadre se referme sur la pousse. La version petite écarte les feuilles et épaissit le filet.',
  },
  'pousse-socle': {
    numero: 'Piste 5',
    resume: 'Le carré est le sol.',
    idee: [
      "La pousse sort d'un bloc plein. Le carré cesse d'être une fenêtre pour devenir une assise : ce que vous construisez est ce dans quoi le métier prend racine.",
      "Le bloc donne au signe une base large et une masse en bas, ce qui le pose sur une ligne de texte mieux que les autres et le rend lisible même très petit.",
    ],
    dit: "L'ancrage, l'assise, la fondation. Le registre le plus rassurant des cinq.",
    demande: "La lecture du pot de fleurs n'est jamais loin. Elle est tenue à distance par les proportions, un bloc plus large que haut et sans rebord, mais il faut résister à toute envie d'y ajouter un col ou une lèvre.",
    mesure: 'Lecture à 16 px : très bonne, la masse basse porte le signe.',
  },
};

export const BILAN = {
  titre: 'Les cinq côte à côte',
  chapo: "Un logo se juge à la taille où il vit vraiment : l'onglet du navigateur, l'avatar d'une fiche Google, le coin d'un devis. Voici les cinq à 64, 32 et 16 px, puis en une seule couleur.",
  recommandation: {
    titre: 'Ce que je recommande',
    texte: [
      "Prenez la Pousse, la piste 1, comme signe de marque, et la Pousse cadrée, la piste 4, comme icône. Ce sont la même identité : le cadre est un contenant, pas un autre logo. Le signe nu vit sur les documents, les en-têtes et le pied de page ; le signe cadré vit là où il faut un carré, l'onglet du navigateur, l'avatar de la fiche Google, le tampon. Beaucoup de marques fonctionnent ainsi, et cela vous évite de choisir entre les deux choses que vous aimez.",
      "Si une seule forme doit tout porter, prenez l'Arbre-écran, la piste 3. C'est la plus économique, la plus solide aux petites tailles et celle qui vieillira le mieux, parce qu'elle ne dessine aucun matériel.",
      "La Pousse carrée est la plus fine, et la plus fragile : son arête droite disparaît petit. La Pousse au socle est la plus rassurante, et la plus exposée à la lecture du pot de fleurs.",
    ],
  },
  suite: {
    titre: 'Si une piste est retenue',
    etapes: [
      ['Le dessin final', "Reprise au dixième : corrections optiques des jonctions feuille et tige, épaisseurs relevées ou abaissées selon la taille, et arbitrage de la symétrie. Une pousse strictement symétrique est calme, une feuille légèrement plus haute que l’autre est vivante ; c’est le dernier réglage à trancher."],
      ['La famille complète', "Lockups horizontal et vertical, signe nu, tuiles, favicon, versions monochromes, PNG et PDF pour l’imprimeur, image de partage et couverture de fiche Google."],
      ['La charte', "Zone de protection, tailles minimales à l’écran et à l’impression, interdits, et mise à jour de identite/CHARTE-GRAPHIQUE.md ainsi que des scripts de fabrication."],
      ['Le site', "En-tête, pied de page, favicon, icônes d’application, signature de courriel, cartes de visite et gabarits de devis."],
    ],
  },
  pied: "Fichiers vectoriels dans identite/recherche/pistes-pousse/, onze par piste. Fabrication : node identite/recherche/pistes-pousse/build-pistes.mjs, qui écrit les fichiers puis mesure leur cadrage au pixel. Cette planche : node identite/recherche/pistes-pousse/build-planche.mjs. Les deux séries précédentes vivent dans identite/recherche/pistes-logo/ et identite/recherche/pistes-nature/, chacune avec sa planche.",
};

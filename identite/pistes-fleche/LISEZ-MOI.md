# Quatrième série : la flèche de croissance et le vivant

Cinq pistes, septembre 2026. Demande de Célestin : une flèche de développement d'activité qui fasse quand même penser à la nature, ou un petit signe du registre entreprise verte.

**Planche de présentation** : `planche-fleche.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

> **Arbitrage du 7 septembre 2026, puis révision le même jour : la flèche est abandonnée entièrement, la Flèche feuillue comprise.** Célestin avait d'abord retenu **La Flèche feuillue** et écarté les quatre autres : la Courbe, les Trois pousses, l'Escalier et le Badge. Les fichiers restent en place comme trace de la recherche, et la page d'accueil les marque comme écartés. Les réglages du signe retenu vivent dans `identite/pistes-fleche-affinee/`. Ne pas rouvrir les quatre autres sans motif nouveau.

## Le problème posé, et les trois réponses

Une flèche vers le haut se comprend en un dixième de seconde, dans toutes les langues, et elle dit exactement ce qu'un artisan vient chercher. Elle a un défaut : **elle promet un résultat**, or le référencement n'en garantit aucun, le classement appartient à Google. Les cinq pistes cherchent la même énergie sans la promesse, par trois moyens.

| Dossier | Nom | Le moyen employé |
|---|---|---|
| `fleche-feuillue/` | La Flèche feuillue | Garder la flèche et lui donner une plante : le propos passe du résultat au travail |
| `courbe/` | La Courbe | La courbe de croissance, une pointe au bout, une feuille en chemin |
| `trois-pousses/` | Les Trois pousses | Remplacer la flèche par des hauteurs croissantes : un histogramme qui est un semis |
| `escalier/` | L'Escalier | Retirer la flèche, laisser l'alignement porter la direction |
| `badge/` | Le Badge | L'histogramme végétal dans la tuile de la marque, le signe du registre entreprise verte |

**Recommandation portée sur la planche** : aucune de ces cinq ne fait un meilleur logo que la Pousse. Elles sont plus bavardes, et un logo gagne à se taire. Leur service est ailleurs : ce sont de bons **signes secondaires**. Les Trois pousses en pictogramme de la croissance (page Référencement, puce de guide, filet de séparation) et le Badge en marque de fin de document (devis, facture, signature de courriel). Les deux vivent bien à côté de la Pousse, puisqu'ils sont faits de la même feuille. Si l'une doit devenir le logo, c'est la Courbe, en sachant qu'elle parle le langage du tableau de bord.

## Deux garde-fous tenus

- **Aucune promesse chiffrée.** Aucune piste ne dessine d'échelle, de valeur ni de pourcentage. Un graphique qui chiffre une progression invente un résultat, et le référencement se vend en obligation de moyens. Même raison que le retrait de « sans promesse de première place » de l'affiche 9 le 04/09.
- **Le Badge ne porte aucun texte.** Un badge se lit comme une certification : y écrire « site vert » ou « éco-certifié » produirait une allégation sans organisme derrière.

## Un piège de dessin, rencontré deux fois

**Deux feuilles symétriques sur une hampe font une seconde pointe.** La Flèche feuillue a d'abord porté ses feuilles à mi-hauteur, puis symétriques au pied : dans les deux cas le signe lisait comme une flèche à deux têtes, montante et descendante. Les feuilles sont maintenant **alternées**, une de chaque côté et à deux hauteurs, comme sur une tige réelle. Elles redeviennent des feuilles.

Autre réglage qui compte : **la pointe de la Courbe suit la tangente réelle** de la courbe, calculée sur son dernier segment de contrôle. Posée à l'œil, elle donnait un accent circonflexe collé au bout du trait.

## Fabriquer

```bash
node identite/pistes-fleche/build-pistes.mjs     # les 55 fichiers, puis le contrôle de cadrage
node identite/pistes-fleche/build-planche.mjs    # la planche de présentation
```

Le dessin de la feuille est celui de la troisième série, sans retouche : deux arcs de rayons différents, un ventre et un dos, pivot sur le point d'attache. Le carré du Badge garde `RAYON_TUILE = 0.24`, le rayon d'angle du monogramme en service.

# Cinquième série : cinq réglages de la Flèche feuillue

Septembre 2026. Célestin a retenu la Flèche feuillue de la quatrième série et écarté les quatre autres. Cette série ne cherche donc plus d'idée : elle fait varier **un seul réglage à la fois** sur le signe retenu, comme la troisième série l'avait fait pour la Pousse.

**Planche de présentation** : `planche-fleche-affinee.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

> **Arbitrage du 7 septembre 2026, quelques heures après.** Célestin abandonne la flèche entièrement, y compris la Flèche feuillue qu'il avait retenue. Les fichiers restent en place comme trace de la recherche, et la page d'accueil marque la série comme écartée. La voie suivante est l'ordinateur-arbre, dans `identite/recherche/pistes-arbre-ecran/`. Ne pas rouvrir la flèche sans motif nouveau.

| Dossier | Nom | Le réglage |
|---|---|---|
| `feuillue/` | La Flèche feuillue | Le signe tel que retenu, sans retouche. La référence |
| `elancee/` | L'Élancée | La proportion : tête de 32 à 27 unités de large, 4 de plus en hauteur, hampe moins 1 |
| `sobre/` | La Sobre | Le nombre de feuilles : une seule, posée plus bas et plus grande |
| `fuselee/` | La Fuselée | Le fuselage : la hampe passe de 14 unités au pied à 9,5 sous la tête |
| `cadree/` | La Cadrée | Le carré : la tuile de la marque, rayon d'angle à 24 % du côté |
| `combinee/` | La Combinée | Aucun réglage nouveau : la somme des trois recommandés (tête élancée, hampe fuselée, deux feuilles) |

**Les quatre réglages sont indépendants.** Ils se retirent ou s'ajoutent un par un, et le signe se refabrique sans celui qu'on écarte.

**Recommandation portée sur la planche** : la Combinée comme signe de marque, la Cadrée comme icône avec le même réglage à l'intérieur. C'est la logique déjà validée sur la Pousse, le cadre étant un contenant et non un second logo.

## Ce qui ne change dans aucune piste

**Les feuilles restent alternées**, une de chaque côté et à deux hauteurs. Posées symétriquement, elles forment une seconde pointe et le signe lit comme une flèche à deux têtes, montante et descendante. C'est le seul point non négociable du dessin, et il a été éprouvé deux fois.

Le dessin de la feuille est celui de la troisième série, sans retouche : deux arcs de rayons différents, un ventre et un dos, pivot sur le point d'attache.

## Un piège de centrage, à ne pas rejouer

**Le centre optique de la flèche tombe à (51, 54) et non au milieu de sa boîte** : la tête occupe le haut et les feuilles débordent à droite. La Cadrée vise donc ce point pour poser le signe dans la tuile. Centré sur (50, 50), le signe paraît poussé vers le bas et le cadre semble mal dessiné.

## Fabriquer

```bash
node identite/recherche/pistes-fleche-affinee/build-pistes.mjs     # les 66 fichiers, puis le contrôle de cadrage
node identite/recherche/pistes-fleche-affinee/build-planche.mjs    # la planche de présentation
```

# Troisième série : la pousse et le carré

Cinq variations, septembre 2026. Célestin a retenu deux signes de la série précédente, la Pousse (sa préférée) et la Fenêtre, en demandant un dessin plus soigné.

**Planche de présentation** : ouvrir `planche-pousse.html` dans un navigateur. Le fichier est autonome, polices comprises.

## Le principe

Les cinq pistes croisent les deux mêmes éléments, la pousse et le carré arrondi de l'icône, et **ne font varier qu'un seul paramètre : la place du carré.**

| Dossier | Nom | La place du carré |
|---|---|---|
| `pousse/` | La Pousse | Aucun carré. Le signe seul, redessiné |
| `pousse-carree/` | La Pousse carrée | Dans la feuille : chaque feuille est la tuile dont deux angles opposés se ferment en pointe |
| `arbre-ecran/` | L'Arbre-écran | En cime : la tuile posée sur un tronc évasé |
| `pousse-cadree/` | La Pousse cadrée | Autour : la tige naît du bord bas du cadre, les deux partagent un trait |
| `pousse-socle/` | La Pousse au socle | Au pied : la pousse sort d'un bloc plein |

**Recommandation portée sur la planche** : prendre la Pousse comme signe de marque et la Pousse cadrée comme icône. Ce sont la même identité, le cadre étant un contenant et non un second logo. Le signe nu vit sur les documents et les en-têtes, le signe cadré là où il faut un carré (onglet, avatar de fiche Google, tampon). Si une seule forme doit tout porter, l'Arbre-écran est la plus économique et la plus solide aux petites tailles.

## Ce que le dessin a gagné

Trois défauts de la série précédente sont corrigés, et toute la série en découle.

- **Le ventre et le dos.** Chaque feuille est faite de deux arcs de rayons différents, flèche extérieure à 13,5 unités et intérieure à 7,5. Une amande symétrique donne une feuille de pictogramme ; cet écart lui donne un sens de pousse.
- **Le point d'attache.** La feuille pivote sur sa base, posée sur l'axe de la tige. Elle en sort au lieu de se poser à côté, et changer son inclinaison ne déplace jamais l'attache.
- **La tige fuselée.** 11 unités au pied, 8,4 à la naissance des feuilles. L'écart est faible et se voit quand même : il donne au signe son sens de lecture, de bas en haut. Le pied s'évase davantage quand la tige porte un arbre plutôt qu'une pousse, sans quoi l'Arbre-écran lit comme une pelle.

Le carré, lui, n'est pas un rectangle quelconque : **`RAYON_TUILE = 0.24`**, le rayon d'angle du monogramme en service et des icônes d'application. Le carré de ces cinq pistes est déjà celui de Caelestis.

## Ce que chaque dossier contient

Onze fichiers par piste : `signe-vert`, `-creme`, `-encre`, `lockup-horizontal-vert`, `-creme`, `-encre`, `lockup-vertical-vert`, `-creme`, `tuile-creme-sur-vert`, `tuile-vert-sur-creme`, `favicon`.

Le `favicon` n'est pas la tuile réduite, c'est un dessin allégé : la Pousse carrée y ouvre l'angle de ses feuilles et raccourcit son rayon pour garder l'arête droite lisible, la Pousse cadrée y épaissit son filet et écarte ses feuilles, l'Arbre-écran y grossit sa cime.

## Fabriquer

```bash
node identite/pistes-pousse/build-pistes.mjs     # les 55 fichiers, puis le contrôle de cadrage
node identite/pistes-pousse/build-planche.mjs    # la planche de présentation
```

Le code de fabrication est commun aux trois séries : `identite/pistes-logo/fabrique.mjs` écrit les fichiers, mesure leur cadrage et monte la planche ; `identite/pistes-logo/artefacts.mjs` compose signe, tuile et lockups ; `identite/pistes-logo/planche.css` habille les trois planches. Une série ne fournit que ses signes, ses repères de construction et son texte.

## Un piège de rotation, à ne pas rejouer

La tuile pointue pivote sur son angle supérieur gauche et sa diagonale part à 45 degrés. Viser une inclinaison T depuis la verticale demande donc une rotation de `-45 - (90 - T)`, et non de T. Une première version posait les angles à la main : les deux feuilles sont sorties presque horizontales et dissymétriques.

## Reste à trancher

**La symétrie.** Les cinq pistes ont deux feuilles rigoureusement symétriques, ce qui est calme. Une feuille légèrement plus haute que l'autre serait plus vivante, et botaniquement plus juste. C'est le dernier réglage, il se décide sur le signe retenu et pas avant.

# Seconde série : la nature et le web dans la même forme

Cinq pistes, septembre 2026, à départager. Demande de Célestin : quelque chose de plus symbolique, la nature et le web ensemble, en restant subtil.

**Planche de présentation** : ouvrir `planche-nature.html` dans un navigateur. Le fichier est autonome, polices comprises.

La première série vit dans `identite/pistes-logo/` et reste disponible : elle cherchait un signe de marque, celle-ci cherche un signe de métier.

## La règle de dessin

Un arbre posé dans un écran donne deux objets empilés, dont l'un décore l'autre. La règle retenue est plus stricte : **ne garder que les endroits où une forme du vivant et une forme du web sont déjà la même forme**, et ne dessiner que celle-là. Le vocabulaire du métier les nomme déjà.

| Dossier | Nom | La coïncidence |
|---|---|---|
| `arborescence/` | L'Arborescence | Une arborescence est le plan d'un site et la charpente d'un arbre. Le mot est le même |
| `balise/` | La Balise | La balise fermante porte une barre oblique, qui est le dessin d'une nervure. Les deux chevrons font l'amande |
| `fenetre/` | La Fenêtre | L'idée de départ, tenue au plus court : le cadre est un filet fin, l'arbre est plein et l'occupe |
| `loupe/` | La Loupe | Une lentille et une feuille ont la même amande, et le manche est déjà une tige |
| `pousse/` | La Pousse | Une flèche de croissance et une jeune pousse font le même geste |

Recommandation portée sur la planche : **L'Arborescence**, parce que c'est la seule dont les deux lectures viennent d'un même mot plutôt que d'une ressemblance de formes, et parce que sa structure en nœuds se décline ensuite en fils de navigation et en séparateurs sur tout le site.

## Ce que chaque dossier contient

Onze fichiers par piste : `signe-vert`, `-creme`, `-encre` (le signe seul, cadré sur son encre), `lockup-horizontal-vert`, `-creme`, `-encre`, `lockup-vertical-vert`, `-creme`, `tuile-creme-sur-vert`, `tuile-vert-sur-creme`, `favicon`.

Le `favicon` n'est pas la tuile réduite, c'est un dessin allégé : l'Arborescence y perd ses branches basses, la Balise y rouvre son jour aux pointes, la Fenêtre y épaissit son filet. Une identité qui ne prévoit pas sa version petite se casse dans l'onglet du navigateur.

## Fabriquer

```bash
node identite/pistes-nature/build-pistes.mjs     # les 55 fichiers, puis le contrôle de cadrage
node identite/pistes-nature/build-planche.mjs    # la planche de présentation
```

Le code de fabrication est commun aux deux séries : `identite/pistes-logo/fabrique.mjs` écrit les fichiers, les mesure et monte la planche ; `identite/pistes-logo/artefacts.mjs` compose signe, tuile et lockups ; `identite/pistes-logo/planche.css` habille les deux planches. Une série ne fournit que ses signes, ses repères de construction et son texte, ce qui les empêche de diverger en silence.

## Le registre, et ce que la charte interdisait

La charte écarte « le vert pomme écologique et les feuilles illustrées ». Deux pistes emploient ici une forme de feuille, et elles s'y tiennent quand même : l'amande est construite avec deux arcs de cercle et un rayon calculé, jamais découpée à main levée. Aucune veinure, aucun contour organique, aucun second vert. C'est la géométrie qui fait la différence entre un signe et une vignette.

## Deux pièges rencontrés, à ne pas rejouer

- **Un arc tronqué en gardant son rayon change de panse.** La Balise a d'abord été décrite par le rayon du contour complet, puis coupée aux pointes pour ouvrir le jour : la feuille est sortie à 42 unités de large pour 73 de haut, deux fois plus étroite que voulu. L'arc se décrit par sa corde et sa flèche réelles, celles du trait visible.
- **Une barre à mi-hauteur fait lire une lettre.** Éprouvé sur l'Arche de la première série, qui lisait un A. Ici, le tronc de la Fenêtre s'arrête sous la cime au lieu de traverser le cadre, qui lisait autrement un sac.

## Si une piste est retenue

Reprise du dessin au dixième avec les corrections optiques, famille complète de fichiers (PNG, PDF pour l'imprimeur, image de partage, couverture de fiche Google), mise à jour de `identite/CHARTE-GRAPHIQUE.md` et de `identite/build-logos.mjs`, puis pose sur le site : en-tête, pied de page, favicon, icônes d'application, signature de courriel, cartes de visite et gabarits de devis.

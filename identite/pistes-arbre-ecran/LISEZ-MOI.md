# Sixième série : l'ordinateur-arbre

Septembre 2026. Demande de Célestin : un carré d'ordinateur avec du feuillage, ou avec un tronc et des racines. La flèche est abandonnée.

**Planche de présentation** : `planche-arbre-ecran.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

| Dossier | Nom | Ce qui pousse |
|---|---|---|
| `enracine/` | L'Enraciné | La tuile en cime, un tronc, trois racines |
| `plante/` | L'Écran planté | Les racines sortent du bord bas de l'écran, sans tronc |
| `festonnee/` | La Festonnée | Le bord haut de la tuile se découpe en trois bosses, comme un buis taillé |
| `reserve/` | La Réserve | L'arbre entier, évidé dans la tuile pleine |
| `feuillu/` | Le Feuillu | Deux feuilles alternées sur le tronc, en plus des racines |

**Recommandation portée sur la planche** : l'Enraciné comme signe de marque, la Réserve comme icône. Même logique que la Pousse et la Pousse cadrée, le sceau carré servant partout où il faut un carré.

**Un point à savoir avant de choisir** : les pistes 1, 3 et 5 sont presque deux fois plus hautes que larges. C'est juste pour un arbre et gênant pour un en-tête, une signature de courriel ou une carte de visite en paysage. La Réserve est carrée, ce qui explique qu'elle serve mieux d'icône.

## Trois réglages qui ont demandé plusieurs essais

Ils valent sur les cinq pistes, et c'est ce qui en fait une famille plutôt qu'une collection.

- **Une racine droite d'épaisseur constante lit comme un pied de chevalet.** Elle est fuselée, courbée, et se termine en pointe. Quatre versions ont été rendues avant que la forme tienne.
- **Trois racines longues et bien écartées valent mieux que cinq courtes.** Au-delà de trois, le signe lit comme un insecte. Le nombre est un plafond mesuré, pas un goût.
- **Le tronc doit rester long et mince**, vingt-quatre unités de haut pour neuf de large, avec un évasement à peine marqué. Avec un évasement fort il disparaît sous les racines et l'ensemble devient une carotte. C'est le défaut qu'ont montré les trois premiers essais.

Le carré ne change dans aucune piste : `RAYON_TUILE = 0.24`, le rayon d'angle du monogramme en service et des icônes d'application.

## La contreforme de la Réserve

La Réserve est un seul tracé en `fill-rule="evenodd"`. **Ses sous-tracés intérieurs se touchent sans jamais se recouvrir** : la cime pose son bord bas sur le haut du tronc, et les trois racines partent de trois segments voisins du bord bas du tronc. Deux formes qui se recouvriraient repeindraient leur intersection et le creux se reboucherait par endroits. Toute retouche de cette piste doit préserver cette propriété.

## Fabriquer

```bash
node identite/pistes-arbre-ecran/build-pistes.mjs     # les 55 fichiers, puis le contrôle de cadrage
node identite/pistes-arbre-ecran/build-planche.mjs    # la planche de présentation
```

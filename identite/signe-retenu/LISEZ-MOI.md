# Le signe retenu : l'écran planté

Septembre 2026. **C'est le seul signe encore travaillé.** Les neuf séries de recherche restent dans `identite/` comme trace, elles ne sont plus en jeu.

**Planche** : `planche-signe-retenu.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

## À quoi sert chaque fichier

| Fichier | Ce que c'est | Où il sert |
|---|---|---|
| `signe-vert`, `-creme`, `-encre` | **Le signe seul**, sans le mot, cadré au plus juste sur son encre | Partout où le nom est déjà écrit à côté ou juste au-dessus : filigrane, puce de liste, icône d'un bloc, tampon, gravure. Le crème sert sur fond vert, l'encre pour un tirage en une seule couleur |
| `tuile-creme-sur-vert`, `tuile-vert-sur-creme` | **La tuile** : le signe centré dans un carré arrondi, fond compris | Tous les emplois qui imposent un carré et où le fond n'est pas maîtrisé : avatar de la fiche Google, photo de profil sur les réseaux, icône d'application, vignette d'un annuaire |
| `favicon` | La même tuile, **redessinée pour la petite taille** : contour à 8 au lieu de 7,5, col et ligne d'une unité de plus | L'onglet du navigateur, la barre de favoris, la tuile d'écran d'accueil. Ce n'est pas la tuile réduite, c'est un dessin à part |
| `lockup-horizontal-vert`, `-creme`, `-encre` | **Le signe et le mot côte à côte** | L'usage courant : en-tête du site, haut d'un devis ou d'une facture, signature de courriel, bandeau |
| `lockup-vertical-vert`, `-creme` | **Le signe au-dessus du mot** | Les formats étroits ou carrés : publication sociale, carte de visite en portrait, tampon, marquage textile |
| `lockup-mot-a-l-ecran-vert`, `-creme`, `-encre` | **Le mot dans l'écran**, débordant de ses deux côtés | Les grands formats où le logo est le sujet : couverture, première page, affiche, écran d'accueil. À réserver aux tailles où le mot se lit |

**Signe et tuile, la différence en une phrase** : le signe est la forme nue, elle prend la couleur qu'on lui donne et le fond de la page. La tuile est la même forme livrée avec son fond, pour les endroits où l'on n'a pas la main sur ce qu'il y a derrière.

## Les trois pièces

| Pièce | Valeur |
|---|---|
| L'écran | 76 sur 48 unités, du 16/10, angles à 7, contour de 7,5. Son encre mesure 83,5 de large |
| Le col fuselé | 11 unités sous l'écran, 19 au sol |
| La ligne de sol | 68 unités sur 8 d'épaisseur |
| Le plongeon | 4 unités : le col est dans la ligne, pas posé dessus |

Tout se décrit en quatre nombres. Aucune courbe à main levée, aucune forme organique.

## La version optique du favicon

Le favicon portait un contour de **9,5** unités là où le signe en a 7,5. L'écart se voyait : la petite taille avait des bordures nettement plus grosses que le signe, et elle en donnait une version engraissée plutôt qu'une version optique.

Il est ramené à **8**, une demi-unité de plus que le signe au lieu de deux. Le col et la ligne suivent, une unité de plus au lieu de deux et quatre. Vérifié à 64, 48, 32, 24 et 16 px : le contour tient jusqu'au bout.

Les quatre valeurs vivent dans la constante `PETIT` de `signes.mjs`. Une seule ligne à changer si le contour doit encore maigrir.

## ⚠️ Les deux écarts à tenir

Sans la Pousse dans l'écran, ce qui distingue ce signe du pictogramme ordinaire du moniteur tient à deux valeurs :

- **le col s'évase de 11 à 19 unités**, là où un pied de moniteur est droit ;
- **la ligne fait 68**, là où un socle de moniteur ordinaire en fait 44.

Un col droit, ou une ligne ramenée à 48, et le signe devient une icône comme il en existe des milliers. Ces deux valeurs se tiennent au dixième sur tous les supports, et toute simplification qui les rabote est à refuser.

## Le mot à l'écran, et son relief

Le mot passe devant l'écran et déborde de ses deux côtés. **Le relief se fait sans seconde couleur ni ombre** : le cadre est tracé en deux morceaux, un pour le haut et un pour le bas, avec un jour de 3,2 unités de part et d'autre du mot. Ses montants s'interrompent là où le mot passe, et c'est cette interruption qui met le mot devant.

Peindre le mot par-dessus un cadre entier ne donnerait rien : le vert se confondrait avec le vert. Toute retouche de ce fichier doit conserver les deux morceaux et leur jour.

Le mot fait 108 unités de large pour un écran dont l'encre en mesure 83,5 : il déborde donc de 12,25 de chaque côté.

## Fabriquer

```bash
node identite/signe-retenu/build-pistes.mjs     # les 11 fichiers, puis le contrôle de cadrage
node identite/signe-retenu/build-planche.mjs    # la planche
```

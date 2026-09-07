# Le signe retenu : l'écran planté

Septembre 2026. Célestin retient la ligne de sol à 60 unités et fait retirer la Pousse de l'écran.

**Planche** : `planche-signe-retenu.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

## Les trois pièces, et leurs valeurs

| Pièce | Valeur |
|---|---|
| L'écran | 76 sur 48 unités, du 16/10, angles à 7, contour de 7,5. Son encre mesure 83,5 de large |
| Le col fuselé | 11 unités sous l'écran, 19 au sol |
| La ligne de sol | 60 unités sur 8 d'épaisseur |
| Le plongeon | 4 unités : le col est dans la ligne, pas posé dessus |

Tout se décrit en quatre nombres. Aucune courbe à main levée, aucune forme organique.

## ⚠️ Ce que le retrait de la Pousse coûte, et qu'il faut tenir

Le vivant ne repose plus que sur **deux écarts au pictogramme ordinaire du moniteur**, et ils sont fins :

- **le col s'évase de 11 à 19 unités**, là où un pied de moniteur est droit ;
- **la ligne fait 60**, là où un socle de moniteur ordinaire en fait 44.

C'est tout ce qui reste de la recherche. **Un col droit, ou une ligne ramenée à 48, et le signe devient une icône de moniteur comme il en existe des milliers.** Ces deux valeurs se tiennent au dixième sur tous les supports, et toute simplification qui les rabote est à refuser.

## Les trois réglages livrés à côté

| Dossier | Ce qui change |
|---|---|
| `retenu/` | **Le signe demandé**, contour 7,5, sol 60 |
| `contour-epais/` | Contour à 9,5. Un écran vide porte un trait plus fort qu'un écran habité |
| `sol-68/` | Ligne de sol à 68, si le signe paraît trop proche d'une icône ordinaire |
| `aplat/` | L'écran plein plutôt qu'en contour, pour un usage surtout en petite taille |

**Recommandation** : le signe tel que demandé, avec `contour-epais/` si vous êtes ouvert à un ajustement. Sans rien à l'intérieur de l'écran, le contour est le signe, et deux unités de plus lui rendent la masse que la Pousse apportait.

## La Pousse n'est pas perdue

Elle vit dans `identite/pistes-pousse/pousse/`, en famille complète. Elle ferait un bon **second signe** : pictogramme de section sur le site, motif, ou marque de fin de document. Elle n'a pas besoin de revenir dans l'écran pour servir.

## Fabriquer

```bash
node identite/signe-retenu/build-pistes.mjs     # les 44 fichiers, puis le contrôle de cadrage
node identite/signe-retenu/build-planche.mjs    # la planche
```

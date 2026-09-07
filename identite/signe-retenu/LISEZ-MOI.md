# Le signe retenu : l'écran planté

Septembre 2026. **C'est le seul signe encore travaillé.** Les neuf séries de recherche restent dans `identite/` comme trace, elles ne sont plus en jeu.

**Planche** : `planche-signe-retenu.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

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

## Fabriquer

```bash
node identite/signe-retenu/build-pistes.mjs     # les 11 fichiers, puis le contrôle de cadrage
node identite/signe-retenu/build-planche.mjs    # la planche
```

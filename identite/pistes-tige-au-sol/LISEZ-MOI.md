# Neuvième série : la largeur de la ligne de sol

Septembre 2026. La Tige au sol est retenue. Un seul réglage reste ouvert : la longueur de sa ligne de sol, qui débordait l'écran des deux côtés.

**Planche de présentation** : `planche-tige-au-sol.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

> **Arbitrage du 7 septembre 2026.** Célestin retient la largeur **60** (`minimale/`) et fait **retirer la Pousse de l'écran**. Le signe définitif vit dans `identite/signe-retenu/`, avec les conséquences du retrait notées.

| Dossier | Largeur | Le jour de chaque côté |
|---|---|---|
| `ras/` | 84 | Aucun, la ligne s'arrête au bord de l'encre de l'écran |
| `retrait/` | 80 | 2 unités. La valeur posée par défaut en huitième série |
| `aplomb/` | 76 | 4 unités. La largeur du rectangle de l'écran, contour non compris |
| `courte/` | 68 | 8 unités |
| `minimale/` | 60 | 12 unités. La limite basse |

## Les trois repères qui bornent la question

- **L'encre de l'écran fait 83,5 unités**, son rectangle de 76 plus son contour de 7,5. Au-delà, la ligne dépasse : c'est ce qui a été reproché à la version à 96.
- **Un socle de moniteur ordinaire fait 44.** La ligne doit rester nettement plus large pour lire comme le sol et non comme un pied.
- **En dessous d'une soixantaine, elle redevient un socle.** L'écart avec 44 ne suffit plus.

**Recommandation portée sur la planche** : `aplomb/`, 76 unités. C'est la seule des cinq dont la valeur se déduit du dessin plutôt que du goût, puisqu'elle est exactement la largeur du rectangle de l'écran sans son contour. Dans six mois, quand la question reviendra, la réponse sera une règle et non un souvenir. Le jour de quatre unités reste perceptible jusqu'à 16 px, ce qui n'est pas le cas des deux unités de `retrait/`.

## Ce qui ne bouge dans aucune piste

L'écran, le col fuselé, la Pousse et l'épaisseur du sol sont identiques sur les cinq : seule la longueur varie, pour que la comparaison porte sur un paramètre et un seul.

## Fabriquer

```bash
node identite/pistes-tige-au-sol/build-pistes.mjs     # les 55 fichiers, puis le contrôle de cadrage
node identite/pistes-tige-au-sol/build-planche.mjs    # la planche de présentation
```

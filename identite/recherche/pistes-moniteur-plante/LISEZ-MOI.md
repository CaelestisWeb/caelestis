# Huitième série : le moniteur planté, sans racines

Septembre 2026. Célestin retient le Moniteur planté de la septième série et écarte ses racines.

**Planche de présentation** : `planche-moniteur-plante.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

> **Arbitrage du 7 septembre 2026.** Célestin retient **La Tige au sol** (`tige-sol/`), col fuselé et ligne de sol, et écarte les quatre autres. **La ligne de sol est jugée trop longue** : elle mesurait 96 unités et débordait l'écran des deux côtés. Elle est raccourcie à 80 dans toute cette série, et sa valeur définitive se choisit dans `identite/recherche/pistes-tige-au-sol/`, qui en pose cinq entre 60 et 84.

## Dire planté sans dessiner de racine

Une racine est une forme organique : elle se courbe, elle se ramifie, elle se fusèle. À côté d'un rectangle aux angles calculés, elle fera toujours illustration. C'est le reproche adressé à la sixième série, et il valait encore pour la septième.

**La solution est géométrique : une ligne de sol nettement plus large qu'un socle, dans laquelle le col plonge de quatre unités.** 80 unités contre 44 pour un socle de moniteur ordinaire, 8 d'épaisseur. C'est cet écart avec le socle qui la fait lire comme le sol, et non le fait de déborder l'écran : la première version, à 96, débordait et le signe paraissait posé sur une planche.

## Les cinq pistes

Deux pièces à régler, le col et le pied, plus la question du traitement.

| Dossier | Nom | Le col | Le pied |
|---|---|---|---|
| `socle/` | Le Socle | Droit | Socle classique |
| `sol/` | Le Sol | Droit | Ligne de sol |
| `tige/` | La Tige | Fuselé | Socle classique |
| `tige-sol/` | La Tige au sol | Fuselé | Ligne de sol |
| `plein/` | L'Écran plein | Droit | Ligne de sol, et l'écran en aplat avec la Pousse creusée |

**Recommandation portée sur la planche** : le Sol, la piste 2. Elle dit planté sans une seule forme organique, garde la silhouette du moniteur intacte, et ne demande qu'une pièce de plus que le pictogramme ordinaire.

## Ce qui ne bouge dans aucune piste

- **L'écran** : 76 sur 48, du 16/10, angles à 7, contour de 7,5. Le dessin retenu, non retouché.
- **La Pousse** : le signe déjà choisi, posé dans l'écran. Même feuille que partout ailleurs.
- **Aucune forme organique** : aucune courbe à main levée, aucun renflement irrégulier. Le col fuselé de la piste 3 est un trapèze, pas une tige dessinée.

## Deux essais écartés

- **La Débordante** : les feuilles de la Pousse passant par-dessus le bord haut de l'écran. Elles lisaient comme un nœud posé dessus.
- **Le col sans pied** : le col s'arrêtant dans le vide. Le signe lisait comme un panneau de signalisation.

## Le creux de l'Écran plein

Comme partout où la Pousse est creusée, **les sous-tracés intérieurs se touchent sans jamais se recouvrir** : la tige s'arrête au point d'attache des feuilles, qui montent de là sans la recouvrir. Deux formes qui se recouvriraient repeindraient leur intersection sous la règle `evenodd`, et le creux se reboucherait par endroits.

## Fabriquer

```bash
node identite/recherche/pistes-moniteur-plante/build-pistes.mjs     # les 55 fichiers, puis le contrôle de cadrage
node identite/recherche/pistes-moniteur-plante/build-planche.mjs    # la planche de présentation
```

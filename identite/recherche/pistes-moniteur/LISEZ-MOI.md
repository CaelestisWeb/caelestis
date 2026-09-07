# Septième série : le moniteur enraciné

Septembre 2026. Célestin a trouvé la sixième série trop brouillonne et trop illustrative, et demande que le carré ressemble davantage à un ordinateur.

**Planche de présentation** : `planche-moniteur.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

> **Arbitrage du 7 septembre 2026.** Célestin retient **Le Moniteur planté** (`plante/`), l'écran en contour, et écarte les quatre autres pistes. **Il écarte aussi les racines.** La suite se règle dans `identite/recherche/pistes-moniteur-plante/`, où une ligne de sol remplace les racines.

| Dossier | Nom | Ce qui change |
|---|---|---|
| `moniteur/` | Le Moniteur enraciné | Écran plein, le socle est remplacé par trois racines |
| `pousse-ecran/` | La Pousse à l'écran | Moniteur complet, col et socle, la Pousse creusée dans l'écran |
| `plante/` | Le Moniteur planté | Écran en contour, et les racines |
| `complet/` | L'Enraciné complet | La Pousse à l'écran **et** les racines |
| `portable/` | Le Portable | Un portable plutôt qu'un moniteur, la Pousse à l'écran |

**Recommandation portée sur la planche** : la Pousse à l'écran, la piste 2. La plus économique, la plus lisible en petit, et la seule dont chaque élément se justifie. Elle relie aussi cette série à la Pousse, ce qui évite de repartir de zéro. Si les racines comptent, l'Enraciné complet est la même chose avec le socle échangé.

## Les deux corrections demandées

- **Le carré ne ressemblait pas à un ordinateur.** Un carré à coins très arrondis lit comme une icône d'application. L'écran est désormais un rectangle **76 sur 48 unités, soit du 16/10, angles à 7**, avec un col de 13 sur 18 et un socle. Un rayon d'angle plus fort le ferait rebasculer du côté de l'icône.
- **Le dessin faisait illustration.** Les racines de la sixième série étaient courbes, fuselées et nombreuses. Elles sont devenues **trois prismes droits**, sans courbe ni renflement, dans le même vocabulaire géométrique que l'écran. Trois reste un plafond mesuré : au-delà, le signe lit comme un insecte.

**Le gain principal est ailleurs que dans le détail.** Un moniteur possède déjà un col et un socle : rien ne s'ajoute au signe, une pièce est échangée. C'est ce qui empêche l'ensemble de ressembler à deux objets empilés, et c'est aussi ce qui règle le format. Les signes de cette série sont larges ou presque carrés, là où ceux de la sixième étaient deux fois plus hauts que larges.

## Deux pièges de tracé, à ne pas rejouer

- **Le miroir d'une feuille ne se fait pas en niant les abscisses.** La première version mirroir envoyait la pointe du mauvais côté et produisait deux croissants. Le miroir se fait par l'**angle opposé et le drapeau de balayage inversé**, ce qui garde le ventre du bon côté.
- **Le creux de la Pousse exige des sous-tracés disjoints.** La tige s'arrête au point d'attache des feuilles, qui montent de là sans jamais la recouvrir. Deux formes qui se recouvriraient repeindraient leur intersection sous la règle `evenodd`, et le creux se reboucherait par endroits.

## Fabriquer

```bash
node identite/recherche/pistes-moniteur/build-pistes.mjs     # les 55 fichiers, puis le contrôle de cadrage
node identite/recherche/pistes-moniteur/build-planche.mjs    # la planche de présentation
```

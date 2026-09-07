# Identité Caelestis

## Tout regarder dans un navigateur

```bash
node identite/serveur.mjs
```

Puis ouvrir **http://localhost:4600**. Aucune dépendance, aucun `npm install`, aucun build du site : le serveur sert le dossier `identite/` tel quel. `node identite/serveur.mjs 5000` choisit un autre port, et si le port est occupé le serveur passe au suivant tout seul.

Les planches sont aussi des fichiers autonomes : elles s'ouvrent par double-clic, polices comprises, et s'envoient par courriel.

## Trois dossiers, trois rôles

| Dossier | Contenu |
|---|---|
| `marque/` | **L'identité en vigueur** : l'Écran planté, le mot, et tous les exports |
| `supports/` | Ce qu'on en fait : les 23 affiches Instagram, la signature de courriel |
| `recherche/` | Les neuf séries de pistes qui ont mené au signe, gardées comme trace |

`CHARTE-GRAPHIQUE.md` est la source de vérité, et `charte-caelestis.html` sa planche visuelle, un fichier autonome qui s'envoie à un imprimeur.

### `marque/`, le détail

`signe/` porte les 16 SVG du signe et `mot/` le mot seul, en tracés. Tout le reste de `exports/` en découle : `png/` à fond transparent, `aplat/` sur fond plein en PNG et JPEG, `favicon/` le jeu complet pour `public/`, `google/` la fiche d'établissement, `reseaux/` l'avatar et les couvertures, `partage/` l'image Open Graph.

### `recherche/`, les neuf séries

`commun/` porte le code partagé. Les séries se lisent dans l'ordre : chacune part du signe retenu par la précédente et change un seul paramètre à la fois. Première série le signe de marque, deuxième la nature et le web, troisième la pousse et le carré, quatrième et cinquième la flèche (écartées), sixième l'ordinateur-arbre (écartée), septième le moniteur enraciné, huitième le même sans racines, neuvième la largeur de la ligne de sol.

## Fabriquer

```bash
node identite/marque/build-signe.mjs      # les 16 SVG, puis le contrôle de cadrage
node identite/marque/build-exports.mjs    # PNG, JPEG, favicons, Google, réseaux, partage
node identite/marque/build-planche.mjs    # la planche du signe
node identite/build-charte.mjs            # la charte en planche visuelle
node identite/build-index.mjs             # la page d'accueil
node identite/recherche/<série>/build-pistes.mjs    # les fichiers d'une série de recherche
```

**Tous ces scripts résolvent leurs chemins depuis `import.meta.url`.** Les huit scripts du monogramme portaient `C:/dev/caelestis` en dur et ne tournaient donc que sur un poste, depuis ce chemin exact. Ils sont partis avec le C.

**Le cadrage est mesuré, jamais calculé.** `build-signe.mjs` rasterise chaque fichier écrit et compare ses quatre marges : une coupe de trait, un cap ou un tracé de police déplacent le bord sans prévenir.

## Le signe, et les deux écarts qui le font

**L'Écran planté**, retenu le 7 septembre 2026 : un écran 16/10 en contour, un col fuselé qui plonge de quatre unités dans une ligne de sol de 68.

⚠️ **Deux valeurs seulement le séparent d'une icône de moniteur ordinaire.** Le col s'évase de 11 à 19 là où un pied de moniteur est droit, et la ligne fait 68 là où un socle en fait 44. Un col droit ou une ligne ramenée à 48, et le signe devient une icône comme il en existe des milliers. Ces valeurs se tiennent au dixième, elles vivent dans `marque/signes.mjs`.

**L'écran reste vide.** La Pousse en a été retirée le 7 septembre.

## Ce qui reste ouvert

⚠️ **Le site sert encore le monogramme en C.** Ses fichiers de `public/` sont en place et rien ne les régénère depuis le retrait du C. Le basculement est un geste à part : copier `marque/exports/favicon/` dans `public/`, y porter l'image de partage, puis incrémenter `?v=` sur les liens d'icônes dans `src/layouts/BaseLayout.astro`, sinon les navigateurs gardent l'ancienne.

**Les cartes de visite restent à redessiner.** Les fichiers d'impression sont partis avec le C. Format et contraintes sont dans la charte, section 5.

**Le rôle de la Pousse reste à décider.** Elle ferait un bon second signe : pictogramme de section, motif, ou marque de fin de document. Ses fichiers sont complets dans `recherche/pistes-pousse/pousse/`.

**Écarté le 7 septembre 2026, à ne pas rouvrir sans motif nouveau** : toute la voie de la flèche, l'ordinateur-arbre jugé trop illustratif, et toute forme de racine dessinée. Une racine est une forme organique, et à côté d'un rectangle aux angles calculés elle fait illustration. Le refus est une décision.

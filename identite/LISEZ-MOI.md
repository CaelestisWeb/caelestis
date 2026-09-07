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
| `RECHERCHE.md` | Ce qui a été essayé et pourquoi c'est écarté. Les fichiers sont dans l'historique git |

`CHARTE-GRAPHIQUE.md` est la source de vérité, et `charte-caelestis.html` sa planche visuelle, un fichier autonome qui s'envoie à un imprimeur.

### `marque/`, le détail

`signe/` porte les 16 SVG du signe et `mot/` le mot seul, en tracés. Tout le reste de `exports/` en découle : `png/` à fond transparent, `aplat/` sur fond plein en PNG et JPEG, `favicon/` le jeu complet pour `public/`, `google/` la fiche d'établissement, `reseaux/` l'avatar et les couvertures, `partage/` l'image Open Graph.

`marque/commun/` porte le code partagé : palette, polices, conversion du texte en tracés, composition des artefacts, contrôle de cadrage.

## Fabriquer

```bash
node identite/marque/build-signe.mjs      # les 16 SVG, puis le contrôle de cadrage
node identite/marque/build-exports.mjs    # PNG, JPEG, favicons, Google, réseaux, partage
node identite/marque/build-planche.mjs    # la planche du signe
node identite/marque/build-cartes.mjs     # les cartes de visite, puis leur cadrage
node identite/build-charte.mjs            # la charte en planche visuelle
node identite/build-index.mjs             # la page d'accueil
```

**Tous ces scripts résolvent leurs chemins depuis `import.meta.url`.** Les huit scripts du monogramme portaient `C:/dev/caelestis` en dur et ne tournaient donc que sur un poste, depuis ce chemin exact. Ils sont partis avec le C.

**Le cadrage est mesuré, jamais calculé.** `build-signe.mjs` rasterise chaque fichier écrit et compare ses quatre marges : une coupe de trait, un cap ou un tracé de police déplacent le bord sans prévenir.

## Le signe, et les deux écarts qui le font

**L'Écran planté**, retenu le 7 septembre 2026 : un écran 16/10 en contour, un col fuselé qui plonge de quatre unités dans une ligne de sol de 68.

⚠️ **Deux valeurs seulement le séparent d'une icône de moniteur ordinaire.** Le col s'évase de 11 à 19 là où un pied de moniteur est droit, et la ligne fait 68 là où un socle en fait 44. Un col droit ou une ligne ramenée à 48, et le signe devient une icône comme il en existe des milliers. Ces valeurs se tiennent au dixième, elles vivent dans `marque/signes.mjs`.

**L'écran reste vide.** La Pousse en a été retirée le 7 septembre.

## Ce qui reste ouvert

⚠️ **Le site sert encore le monogramme en C.** Ses fichiers de `public/` sont en place et rien ne les régénère depuis le retrait du C. Le basculement est un geste à part : copier `marque/exports/favicon/` dans `public/`, y porter l'image de partage, puis incrémenter `?v=` sur les liens d'icônes dans `src/layouts/BaseLayout.astro`, sinon les navigateurs gardent l'ancienne.

**Les cartes de visite sont redessinées**, deux pistes en recto et verso. Les fichiers d'impression vivent dans `marque/exports/impression/`, un PDF par face, et `marque/planche-cartes.html` les montre à l'échelle réelle. **La piste reste à choisir.**

**Le rôle de la Pousse reste à décider.** Elle ferait un bon second signe : pictogramme de section, motif, ou marque de fin de document. Son dessin est dans l'historique git, série 3, dossier `pousse` : `RECHERCHE.md` donne la commande pour le ressortir.

**Ce qui a été essayé et écarté vit dans `RECHERCHE.md`**, avec les impasses de dessin à ne pas reparcourir. Les 576 fichiers des neuf séries sont sortis du dépôt le 7 septembre 2026 ; le raisonnement, lui, est la seule chose qui se perdait.

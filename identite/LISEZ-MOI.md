# Identité Caelestis

## Tout regarder dans un navigateur

```bash
node identite/serveur.mjs
```

Puis ouvrir **http://localhost:4600**. Aucune dépendance, aucun `npm install`, aucun build du site : le serveur sert le dossier `identite/` tel quel. `node identite/serveur.mjs 5000` choisit un autre port, et si le port est occupé le serveur passe au suivant tout seul.

La page d'accueil rassemble les **neuf séries de pistes de logotype**, avec tous les signes en vignettes, les retenues mises en avant et les écartées marquées comme telles, un comparatif de tous à 32 et 16 px, et un lien vers chaque planche et chaque dossier de fichiers. Les dossiers sans page d'accueil sont listés, ce qui permet de parcourir les SVG un par un.

Les planches sont aussi des fichiers autonomes : elles s'ouvrent directement par double-clic, polices comprises, et s'envoient par courriel.

## Ce que contient ce dossier

| Dossier | Contenu |
|---|---|
| `logo/` | **L'identité en service**, le C ouvert. Rien n'en a été retiré |
| `pistes-logo/` | Première série, le signe de marque. Cinq signes abstraits |
| `pistes-nature/` | Deuxième série, la nature et le web dans la même forme |
| `pistes-pousse/` | Troisième série, la pousse et le carré. **Les deux préférées y sont** |
| `pistes-fleche/` | Quatrième série, la flèche de croissance et le vivant. Écartée |
| `pistes-fleche-affinee/` | Cinquième série, les réglages de la Flèche feuillue. Écartée |
| `pistes-arbre-ecran/` | Sixième série, l'ordinateur-arbre. Écartée |
| `pistes-moniteur/` | Septième série, le moniteur enraciné. Le Moniteur planté y est retenu |
| `pistes-moniteur-plante/` | Huitième série, le même sans racines. La Tige au sol y est retenue |
| `pistes-tige-au-sol/` | Neuvième série, cinq largeurs de ligne de sol pour le signe retenu |
| `reseaux/`, `signature-mail/` | Gabarits des supports |

`CHARTE-GRAPHIQUE.md` reste la source de vérité de l'identité en service, et `charte-caelestis.html` sa planche visuelle.

## Fabriquer

```bash
node identite/build-index.mjs                    # la page d'accueil
node identite/<série>/build-pistes.mjs           # les fichiers d'une série, puis le contrôle de cadrage
node identite/<série>/build-planche.mjs          # la planche d'une série
```

Le code de fabrication est commun aux quatre séries. `pistes-logo/fabrique.mjs` écrit les fichiers, mesure leur cadrage au pixel et monte les planches ; `pistes-logo/artefacts.mjs` compose signe, tuile et lockups ; `pistes-logo/planche.css` habille les planches et la page d'accueil. Une série ne fournit que ses signes, ses repères de construction et son texte, ce qui les empêche de diverger en silence.

Les scripts des pistes résolvent leurs chemins depuis `import.meta.url`, à la différence des scripts historiques de ce dossier qui portent encore `C:/dev/caelestis` en dur.

## Ce qui est décidé, et ce qui reste ouvert

**Décidé le 7 septembre 2026, deux voies ouvertes en parallèle.**

- **La Pousse** et **La Pousse cadrée** (`pistes-pousse/`) : le végétal seul. Elles peuvent former une seule identité, le cadre étant un contenant et non un second logo.
- **La Tige au sol** (`pistes-moniteur-plante/tige-sol/`) : un écran 16/10 en contour, un col fuselé qui plonge dans une ligne de sol, et la Pousse affichée dedans. Aucune racine. **C'est le signe le plus abouti de la recherche.** Un seul réglage reste ouvert, la largeur de la ligne de sol, et `pistes-tige-au-sol/` en pose cinq entre 60 et 84 unités. Proposition : 76, la largeur du rectangle de l'écran sans son contour.

**Écarté le 7 septembre 2026** : toute la voie de la flèche (quatrième et cinquième séries), l'ordinateur-arbre de la sixième, jugé trop illustratif et pas assez ordinateur, et **toute forme de racine dessinée**. Une racine est une forme organique, et à côté d'un rectangle aux angles calculés elle fait illustration. Le refus est une décision, ne pas les rouvrir sans motif nouveau.

**Ouvert** : la largeur de la ligne de sol, entre 60 et 84 unités (neuvième série). Et la symétrie des feuilles de la Pousse, rigoureusement symétriques aujourd'hui, ce qui est calme. Les deux se tranchent sur le signe retenu, pas avant.

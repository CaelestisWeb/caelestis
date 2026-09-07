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
| `pistes-tige-au-sol/` | Neuvième série, cinq largeurs de ligne de sol |
| `signe-retenu/` | **Le signe retenu**, l'Écran planté, et ses trois réglages |
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
- **L'Écran planté** (`signe-retenu/`) : un écran 16/10 en contour, un col fuselé qui plonge de quatre unités dans une ligne de sol de 60. Aucune racine, et **l'écran est vide**, la Pousse ayant été retirée le 7 septembre. C'est le signe retenu.
  - ⚠️ **Ce qui distingue ce signe d'une icône de moniteur ordinaire tient à deux écarts fins** : le col s'évase de 11 à 19 unités là où un pied de moniteur est droit, et la ligne fait 60 là où un socle en fait 44. Un col droit ou une ligne ramenée à 48, et le signe devient une icône comme il en existe des milliers. Ces valeurs se tiennent au dixième.

**Écarté le 7 septembre 2026** : toute la voie de la flèche (quatrième et cinquième séries), l'ordinateur-arbre de la sixième, jugé trop illustratif et pas assez ordinateur, et **toute forme de racine dessinée**. Une racine est une forme organique, et à côté d'un rectangle aux angles calculés elle fait illustration. Le refus est une décision, ne pas les rouvrir sans motif nouveau.

**Ouvert** : l'épaisseur du contour de l'écran, 7,5 ou 9,5 (`signe-retenu/contour-epais/`). Un écran vide porte un trait plus fort qu'un écran habité.

**Le rôle de la Pousse reste à décider.** Elle n'est plus dans l'écran, mais elle ferait un bon second signe : pictogramme de section sur le site, motif, ou marque de fin de document. Ses fichiers sont complets dans `pistes-pousse/pousse/`.

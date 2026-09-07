# Identité Caelestis

## Tout regarder dans un navigateur

```bash
node identite/serveur.mjs
```

Puis ouvrir **http://localhost:4600**. Aucune dépendance, aucun `npm install`, aucun build du site : le serveur sert le dossier `identite/` tel quel. `node identite/serveur.mjs 5000` choisit un autre port, et si le port est occupé le serveur passe au suivant tout seul.

La page d'accueil rassemble les **neuf séries de pistes de logotype** et le signe retenu, avec tous les signes en vignettes, les retenues mises en avant et les écartées marquées comme telles, un comparatif de tous à 32 et 16 px, et un lien vers chaque planche et chaque dossier de fichiers. Les dossiers sans page d'accueil sont listés, ce qui permet de parcourir les SVG un par un.

Les planches sont aussi des fichiers autonomes : elles s'ouvrent directement par double-clic, polices comprises, et s'envoient par courriel.

## Ce que contient ce dossier

Trois niveaux, du plus décidé au plus ancien.

| Dossier | Contenu |
|---|---|
| `logo/` | **L'identité en service**, le C ouvert. Rien n'en a été retiré |
| `signe-retenu/` | **Le signe retenu**, l'Écran planté. Le seul encore travaillé |
| `recherche/` | Les neuf séries de pistes, gardées comme trace de la recherche |
| `reseaux/`, `signature-mail/` | Gabarits des supports |

`CHARTE-GRAPHIQUE.md` reste la source de vérité de l'identité en service, et `charte-caelestis.html` sa planche visuelle.

### Le détail de `recherche/`

| Dossier | Contenu |
|---|---|
| `commun/` | Le code partagé par toutes les séries et par le signe retenu |
| `pistes-logo/` | Première série, le signe de marque. Cinq signes abstraits |
| `pistes-nature/` | Deuxième série, la nature et le web dans la même forme |
| `pistes-pousse/` | Troisième série, la pousse et le carré. **Les deux préférées y sont** |
| `pistes-fleche/` | Quatrième série, la flèche de croissance et le vivant. Écartée |
| `pistes-fleche-affinee/` | Cinquième série, les réglages de la Flèche feuillue. Écartée |
| `pistes-arbre-ecran/` | Sixième série, l'ordinateur-arbre. Écartée |
| `pistes-moniteur/` | Septième série, le moniteur enraciné. Le Moniteur planté y est retenu |
| `pistes-moniteur-plante/` | Huitième série, le même sans racines. La Tige au sol y est retenue |
| `pistes-tige-au-sol/` | Neuvième série, cinq largeurs de ligne de sol |

Les séries se lisent dans cet ordre : chacune part du signe retenu par la précédente et change un seul paramètre à la fois. Le classement du 7 septembre 2026 sépare **ce qui sert** (`logo/`), **ce qui se décide** (`signe-retenu/`) et **ce qui a été essayé** (`recherche/`), pour qu'une ouverture du dossier montre d'abord l'état des lieux et non l'historique.

## Fabriquer

```bash
node identite/build-index.mjs                            # la page d'accueil
node identite/signe-retenu/build-pistes.mjs              # les fichiers du signe retenu, puis le contrôle de cadrage
node identite/signe-retenu/build-planche.mjs             # sa planche
node identite/recherche/<série>/build-pistes.mjs         # les fichiers d'une série de recherche
node identite/recherche/<série>/build-planche.mjs        # la planche d'une série
```

Le code de fabrication est commun aux dix séries, et il vit dans `recherche/commun/`. `base.mjs` porte la palette de la charte, l'ouverture des polices, la conversion du texte en tracés et les primitives géométriques ; `artefacts.mjs` compose signe, tuile et lockups ; `fabrique.mjs` écrit les fichiers, mesure leur cadrage au pixel et monte les planches ; `planche.css` habille les planches et la page d'accueil. Une série ne fournit que ses signes, ses repères de construction et son texte, ce qui les empêche de diverger en silence.

Les scripts des pistes résolvent leurs chemins depuis `import.meta.url`, à la différence des scripts historiques de ce dossier qui portent encore `C:/dev/caelestis` en dur. C'est ce qui a permis de déplacer les neuf séries sans toucher un seul fichier livré : les **556 SVG sont identiques au bit près** avant et après le classement.

## Ce qui est décidé, et ce qui reste ouvert

**Décidé le 7 septembre 2026, deux voies ouvertes en parallèle.**

- **La Pousse** et **La Pousse cadrée** (`recherche/pistes-pousse/`) : le végétal seul. Elles peuvent former une seule identité, le cadre étant un contenant et non un second logo.
- **L'Écran planté** (`signe-retenu/`) : un écran 16/10 en contour, un col fuselé qui plonge de quatre unités dans une ligne de sol de 68. Aucune racine, et **l'écran est vide**, la Pousse ayant été retirée le 7 septembre. C'est le signe retenu.
  - ⚠️ **Ce qui distingue ce signe d'une icône de moniteur ordinaire tient à deux écarts fins** : le col s'évase de 11 à 19 unités là où un pied de moniteur est droit, et la ligne fait 68 là où un socle en fait 44. Un col droit ou une ligne ramenée à 48, et le signe devient une icône comme il en existe des milliers. Ces valeurs se tiennent au dixième.

**Écarté le 7 septembre 2026** : toute la voie de la flèche (quatrième et cinquième séries), l'ordinateur-arbre de la sixième, jugé trop illustratif et pas assez ordinateur, et **toute forme de racine dessinée**. Une racine est une forme organique, et à côté d'un rectangle aux angles calculés elle fait illustration. Le refus est une décision, ne pas les rouvrir sans motif nouveau.

**La recherche est close.** Seul `signe-retenu/` est encore travaillé, les neuf séries de `recherche/` restent comme trace et ne sont plus en jeu.

**Le rôle de la Pousse reste à décider.** Elle n'est plus dans l'écran, mais elle ferait un bon second signe : pictogramme de section sur le site, motif, ou marque de fin de document. Ses fichiers sont complets dans `recherche/pistes-pousse/pousse/`.

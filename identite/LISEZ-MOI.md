# Identité Caelestis

## Tout regarder dans un navigateur

```bash
node identite/serveur.mjs
```

Puis ouvrir **http://localhost:4600**. Aucune dépendance, aucun `npm install`, aucun build du site : le serveur sert le dossier `identite/` tel quel. `node identite/serveur.mjs 5000` choisit un autre port, et si le port est occupé le serveur passe au suivant tout seul.

La page d'accueil rassemble les **six séries de pistes de logotype**, avec tous les signes en vignettes, les retenues mises en avant et les écartées marquées comme telles, un comparatif de tous à 32 et 16 px, et un lien vers chaque planche et chaque dossier de fichiers. Les dossiers sans page d'accueil sont listés, ce qui permet de parcourir les SVG un par un.

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
| `pistes-arbre-ecran/` | Sixième série, l'ordinateur-arbre : le carré, un tronc, des racines |
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
- **L'ordinateur-arbre** (`pistes-arbre-ecran/`) : le carré de l'écran porté par un tronc et des racines. Proposition : l'Enraciné comme signe, la Réserve comme icône.

**Écarté le 7 septembre 2026** : toute la voie de la flèche, quatrième et cinquième séries comprises. La Flèche feuillue avait été retenue quelques heures, puis abandonnée avec le reste. Le refus est une décision, ne pas la rouvrir sans motif nouveau.

**Ouvert** : la symétrie des feuilles. Sur la Pousse elles sont rigoureusement symétriques, ce qui est calme ; sur la Flèche elles sont alternées, ce qui est vivant. Le choix se tranche sur le signe retenu, pas avant.

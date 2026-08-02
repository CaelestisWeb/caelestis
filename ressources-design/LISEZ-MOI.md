# Ressources design Caelestis

Documents de conseil design, à montrer ou envoyer à un client. **Ce dossier n'est pas déployé** (il est hors de `public/` et `src/`), rien ne part en ligne.

## Catalogue des modules

| Fichier | Usage |
|---|---|
| `Catalogue-modules-Caelestis.pdf` | **À montrer ou envoyer.** 13 pages, 456 Ko. |
| `catalogue-caelestis.html` | La source, à modifier pour compléter le catalogue. |

Également disponible dans l'admin, **Hub agence → Marketing**, avec le PDF téléchargeable.

**Deux usages :**
1. **Sur demande** : un client veut savoir ce qu'il est possible de faire sur son site.
2. **En proposition** : suggérer à un client existant des améliorations concrètes de son site, plusieurs mois après la livraison.

**Contenu :** 16 modules présentés par bénéfice client, en 4 familles (montrer votre savoir-faire, présenter votre offre, inspirer confiance, donner du relief). Aucun code, aucune règle interne.

**Message clé du document :** nous n'installons jamais tous ces modules sur un même site. Deux ou trois sont retenus selon le métier, et au moins un est conçu sur mesure. Deux entreprises du même secteur ne repartent jamais avec le même site.

### Régénérer le PDF après modification

Modifier `catalogue-caelestis.html`, puis **imprimer directement le fichier local** (aucun serveur nécessaire) :

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu ^
  --no-pdf-header-footer --virtual-time-budget=8000 ^
  --print-to-pdf="C:\dev\caelestis\ressources-design\Catalogue-modules-Caelestis.pdf" ^
  "file:///C:/dev/caelestis/ressources-design/catalogue-caelestis.html"
```

Le HTML contient déjà une feuille de style d'impression (A4, marges 14 mm, sauts de page propres).

**Trois points importants :**
- `--virtual-time-budget=9000` laisse le temps aux polices de charger. Sans lui, le PDF sort mal composé.
- **Vérifier le résultat** : le PDF doit faire **13 pages** et environ 456 Ko. S'il fait 1 page, la source n'a pas été chargée.
- **Ne pas ajouter de texture (grain) au document.** Testé le 22/07/2026 : le filtre `feTurbulence` est rasterisé en haute définition à l'impression et fait passer le PDF de 457 Ko à **8,6 Mo**, pour un effet quasi invisible sur papier. Un PDF doit pouvoir s'envoyer par mail.

### Après modification, mettre à jour le Hub

```bash
cd C:\dev\caelestis-admin
node scripts/add-catalogue.mjs
```

Le script téléverse le PDF dans le bucket `hub-agence` et met à jour l'entrée du Hub (catégorie Marketing).

## Source de vérité

La bibliothèque technique vit dans `C:\dev\_composants` :
- `index.html` : la galerie interne avec le code (usage développeur, **ne pas envoyer au client**)
- `composants.css` : les composants pilotés par variables
- `REGISTRE.md` : qui a reçu quel module, pour ne jamais se répéter d'un client à l'autre

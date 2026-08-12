# Affiches Instagram Caelestis

Trois affiches au format **1080 x 1350** (4:5, le format qui occupe le plus de place dans le fil). Elles forment un carrousel dans cet ordre : accroche, prix, univers et appel.

| Fichier | Rôle | Fond | Ce qu'elle montre |
|---|---|---|---|
| `caelestis-instagram-1-le-site` | Accroche | vert profond `#1B4733` | la promesse de marque, le site en fenêtre de navigateur, la version mobile |
| `caelestis-instagram-2-formules` | Prix | crème `#FCFBF8` | les quatre formules avec leur tarif, la page réalisations en pied |
| `caelestis-instagram-3-univers` | Univers et appel | crème puis pavé vert | trois photos d'ambiance, les statuts visés, le contact |

## Régénérer

```bash
node identite/reseaux/instagram/build.mjs
```

Le script rend chaque HTML dans Chromium à `deviceScaleFactor: 1`, donc en 1080 x 1350 exact : aucune interpolation, ni agrandissement ni réduction, avant l'envoi. Il écrit un PNG (source) et un JPEG qualité 92 sans sous-échantillonnage chroma (plus léger à téléverser depuis le téléphone). Playwright n'est pas une dépendance du site : le script le cherche là où `npx` l'a déposé.

Les captures du site (`captures/`) datent du 13/08/2026 et viennent de la production. Pour les rafraîchir après une refonte, relancer une capture de `.hero-ecran .browser` sur caelestis.fr, largeur 1800, `deviceScaleFactor: 2`.

## Règles tenues

- Satoshi uniquement, auto-hébergée depuis `src/assets/fonts`, aucune police de la liste noire.
- Palette Forêt Vivante relevée dans `src/styles/global.css`, aucun hex réécrit à la main.
- Aucun italique, aucun tiret cadratin ou demi-cadratin, aucun point médian, aucun dégradé décoratif. La matière vient d'un grain `feTurbulence` à 22 % en fusion multiply.
- Aucun bandeau de chiffres : chaque prix est collé à la formule qu'il désigne, en liste, jamais en rangée de nombres.
- Réserve de pixels vérifiée sur chaque image : capture desktop 2300 px pour 984 px affichés, capture mobile 1170 px pour 244 px, photos 736 px pour 293 px.
- Le titre de chaque affiche reste dans le carré central (y de 135 à 1215), donc lisible dans la grille du profil qui recadre en 1:1.

## Légendes proposées

**1, l'accroche**
Un site, ce n'est pas une carte de visite en ligne. C'est l'endroit où l'on vous compare aux autres, et où l'on décide. Voici le nôtre. Le vôtre peut lui ressembler. caelestis.fr

**2, les prix**
Combien coûte un site ? La réponse est sur notre site, pas au bout d'un rendez-vous. Quatre formules, un tarif affiché, un devis gratuit sous 48 h.

**3, l'univers**
Nous créons des sites pour les artisans, les commerçants, les indépendants et les lieux d'accueil de la Drôme et d'Auvergne-Rhône-Alpes. Votre activité vous tient à cœur : partagez-la. 07 69 36 27 27

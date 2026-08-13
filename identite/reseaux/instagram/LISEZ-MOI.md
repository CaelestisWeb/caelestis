# Affiches Instagram Caelestis

Dix affiches au format **1080 x 1350** (4:5, le format qui occupe le plus de place dans le fil). Elles se publient en carrousel de trois ou quatre, ou une par une sur plusieurs semaines.

| Fichier | Rôle | Fond | Ce qu'elle montre |
|---|---|---|---|
| `1-le-site` | Accroche | vert profond | la promesse de marque, le site en fenêtre de navigateur, la version mobile |
| `2-formules` | Prix | crème | les quatre formules avec leur tarif, la page réalisations en pied |
| `3-univers` | Univers et appel | crème puis pavé vert | trois photos d'ambiance, les statuts visés, le contact |
| `4-realisations` | Preuve | crème | les deux sites clients en ligne, chacun avec sa propre identité |
| `5-deroule` | Pédagogie | vert profond | les quatre temps, du premier échange à la mise en ligne |
| `6-fondateur` | Humain | lin mousse | qui répond au téléphone, d'où vient le nom, la fiche d'identité |
| `7-point-de-rencontre` | Problème résolu | crème | schéma des six canaux qui ramènent vers un seul endroit |
| `8-engagements` | Confiance | vert forêt | les quatre repères tenus, avec leurs icônes |
| `9-referencement` | Utilité | crème | une page de résultats évoquée, et la méthode en trois points |
| `10-identite` | Savoir-faire | crème | les neuf teintes de la charte, les quatre graisses de Satoshi |

Ordre conseillé pour un premier carrousel : 1, 4, 2. Pour un second : 7, 5, 8. Les affiches 6, 9 et 10 fonctionnent seules.

## Régénérer

```bash
node identite/reseaux/instagram/build.mjs
```

Le script rend chaque HTML dans Chromium à `deviceScaleFactor: 1`, donc en 1080 x 1350 exact : aucune interpolation, ni agrandissement ni réduction, avant l'envoi. Il écrit un PNG (source) et un JPEG qualité 92 sans sous-échantillonnage chroma (plus léger à téléverser depuis le téléphone). Playwright n'est pas une dépendance du site : le script le cherche là où `npx` l'a déposé.

Les captures de `captures/` datent du 13/08/2026 et viennent de la production. Pour les rafraîchir après une refonte :

- le site Caelestis, une capture de `.hero-ecran .browser` sur caelestis.fr, largeur 1800, `deviceScaleFactor: 2`, en cliquant sur `.dot[data-nav="…"]` pour changer de vue ;
- les sites clients, une capture pleine fenêtre en 1440 x 900 et une en 390 x 844 avec `isMobile`.

## Règles tenues

- Satoshi uniquement, auto-hébergée depuis `src/assets/fonts`, aucune police de la liste noire. Titres à -0.038em et surtitres à 0.18em, comme le prescrit `identite/CHARTE-GRAPHIQUE.md`.
- Les neuf teintes de la charte, aucune de plus, à deux exceptions documentées dans le CSS : `#EFEDE6` et `#CFCCC2` forment le châssis des fenêtres de navigateur, qui ne ressemblerait plus à un navigateur s'il était aux couleurs de la marque.
- La mousse `#B8C4BB` sert de couleur de texte **uniquement sur fond vert profond**, où elle donne un contraste de 5,8 : 1 (AA). La charte l'interdit sur fond clair, où elle tombe à 1,7 : 1.
- Aucun italique, aucun tiret cadratin ou demi-cadratin, aucun point médian, aucun dégradé décoratif, aucun emoji. La matière vient d'un grain `feTurbulence` à 22 % en fusion multiply, sauf sur le nuancier de l'affiche 10 où les aplats passent au-dessus du grain pour rester exacts.
- Aucun bandeau de chiffres : chaque montant est collé à la formule qu'il désigne, chaque délai à ce qu'il promet. Les numéros de l'affiche 5 sont des repères d'étape, format autorisé.
- Réserve de pixels vérifiée sur chaque image : capture desktop 2300 px pour 984 px affichés, capture mobile 1170 px pour 244 px, photos 736 px pour 396 px.
- Le titre de chaque affiche reste dans le carré central (y de 135 à 1215), donc lisible dans la grille du profil qui recadre en 1:1.
- Rien n'est affirmé qui ne soit vérifiable : les deux sites clients sont en ligne et visitables, les tarifs sont ceux de `src/utils/tarifs.ts`, les délais et engagements sont ceux publiés sur le site.

## Légendes proposées

**1, l'accroche.** Un site, ce n'est pas une carte de visite en ligne. C'est l'endroit où l'on vous compare aux autres, et où l'on décide. Voici le nôtre. Le vôtre peut lui ressembler. caelestis.fr

**2, les prix.** Combien coûte un site ? La réponse est sur notre site, pas au bout d'un rendez-vous. Quatre formules, un tarif affiché, un devis gratuit sous 48 h.

**3, l'univers.** Nous créons des sites pour les artisans, les commerçants, les indépendants et les lieux d'accueil de la Drôme et d'Auvergne-Rhône-Alpes. Votre activité vous tient à cœur : partagez-la. 07 69 36 27 27

**4, les réalisations.** Deux clientes, deux métiers, deux univers. Un atelier de bijoux et un salon de prothésie ongulaire. Rien n'a été réutilisé de l'un à l'autre : ni la palette, ni la structure, ni les photos. Les deux sites sont en ligne, allez les visiter.

**5, le déroulé.** Beaucoup de gens repoussent leur site parce qu'ils ne savent pas ce qui les attend. Voilà exactement comment ça se passe, du premier appel à la mise en ligne. Rien de plus, rien de caché.

**6, le fondateur.** On me demande souvent qui se cache derrière Caelestis. C'est moi, Célestin, depuis la Drôme. La personne qui répond au téléphone est celle qui construit le site, et c'est la même deux ans plus tard.

**7, le point de rencontre.** Votre fiche Google, vos réseaux, vos clients qui vous recommandent, votre stand sur le marché : tout cela travaille déjà pour vous. Il manque juste l'endroit où tout se rejoint.

**8, les engagements.** Quatre promesses que nous tenons avant même le premier échange. Aucune n'est un slogan : chacune se vérifie sur le site.

**9, le référencement.** Vos clients vous cherchent déjà. La question, c'est de savoir qui ils trouvent à votre place. Le référencement naturel, c'est un travail de fond, sans promesse de première place.

**10, l'identité.** Neuf teintes et une police : voilà toute notre charte. Chaque client repart avec la sienne, construite pour son métier. Un site qui ressemble à un modèle se voit tout de suite.

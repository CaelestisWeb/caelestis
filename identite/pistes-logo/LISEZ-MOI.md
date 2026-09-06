# Cinq pistes de logotype, septembre 2026

Cinq signes différents pour Caelestis, à départager. Ce dossier vit à côté de l'identité en service (`identite/logo/`), il ne la remplace pas : rien n'est retiré du site tant qu'une piste n'est pas retenue.

**Planche de présentation** : ouvrir `planche-pistes.html` dans un navigateur. Le fichier est autonome, polices comprises, il s'envoie par courriel et se lit hors ligne.

## Les cinq

| Dossier | Nom | Le signe | Ce qu'il dit |
|---|---|---|---|
| `aube/` | L'Aube | Un astre tangent à une ligne d'horizon | Le lever, la visibilité qui monte, le travail au dehors |
| `cerne/` | Le Cerne | Trois anneaux de croissance fendus à droite | La croissance lente et la portée. Garde le C actuel dans sa fente |
| `ligature/` | La Ligature | Le Æ latin de cælestis | Le lettré et le précis, sans métaphore |
| `arche/` | L'Arche | Un seuil plein cintre, le jour dessous | L'accueil et le passage, la forme des vieux villages de la Drôme |
| `etoile/` | L'Étoile fixe | Rose des vents à huit branches, anneau d'astrolabe | L'orientation et le repère, le sens propre du nom |

Recommandation portée sur la planche : **Le Cerne**, parce que c'est la seule piste qui garde le C actuel tout en disant quelque chose de neuf, et que ses deux lectures tombent juste toutes les deux. **L'Aube** est le choix sûr, imbattable en lisibilité, au prix d'une forme que d'autres marques emploient déjà.

## Ce que chaque dossier contient

Onze fichiers par piste, douze pour la ligature.

| Fichier | Usage |
|---|---|
| `signe-vert`, `signe-creme`, `signe-encre` | Le signe seul, cadré sur son encre |
| `lockup-horizontal-vert`, `-creme`, `-encre` | Usage courant, en-têtes, devis, bandeaux |
| `lockup-vertical-vert`, `-creme` | Formats carrés et étroits, publications sociales |
| `tuile-creme-sur-vert`, `tuile-vert-sur-creme` | Avatar, fiche Google, tampon |
| `favicon` | Version optique pour les petites tailles, tuile verte |
| `lockup-horizontal-vert-orthographe-courante` | Ligature seulement : le mot écrit Caelestis, pour l'administratif |

Le `favicon` n'est pas la tuile réduite : c'est un dessin allégé pour la petite taille. Le Cerne y passe de trois anneaux à deux, l'Étoile y perd son anneau, tous les traits y sont épaissis. Une identité qui ne prévoit pas sa version petite se casse dans l'onglet du navigateur.

## Fabriquer

```bash
node identite/pistes-logo/build-pistes.mjs     # les 56 fichiers, puis le contrôle de cadrage
node identite/pistes-logo/build-planche.mjs    # la planche de présentation
```

Les deux scripts réclament `fontkit` et `sharp` dans `node_modules`. Les chemins sont résolus depuis `import.meta.url` : ils tournent sur le poste comme sur une machine d'intégration, à la différence des scripts de `identite/` qui portent encore `C:/dev/caelestis` en dur.

## Ce qui a été tenu

- **Le texte est en tracés**, jamais en `<text>`. Un SVG qui embarque sa police ne s'affiche correctement qu'en navigateur : ailleurs la police est substituée et le mot déborde de son cadre.
- **Le cadrage est mesuré, pas calculé.** `build-pistes.mjs` rasterise chaque fichier écrit et compare ses quatre marges. Trois attentes selon la famille : le signe et les lockups touchent leurs quatre bords, les tuiles ont des marges opposées égales, un signe circulaire est cadré sur son cercle et garde au plus 4 % de marge du côté de sa fente. **Tout sort à zéro écart.**
- **Palette et typographie de la charte**, sans ajout : vert forêt `#255C41`, crème `#FCFBF8`, encre `#12160F`, Satoshi Medium 500 à -0.02 em, aucun dégradé, aucune ombre, une seule couleur par fichier.

## Trois pièges rencontrés, à ne pas rejouer

- **Une coupe de trait est radiale, pas horizontale.** L'Aube a d'abord été dessinée en arc ouvert posé sur une ligne : les coupes des extrémités laissaient deux ergots de part et d'autre, et le signe lisait comme un omega sur son socle. Quatre traitements ont été rendus avant de retenir le disque plein tangent.
- **Une barre à mi-hauteur d'une arche fait lire un A.** L'Arche portait une barre à la naissance des voûtes, elle annonçait la mauvaise initiale. Le disque posé dessous règle la lecture et remplit le vide.
- **Un fichier crème se mesure sur fond vert.** Aplati sur du blanc, son encre est invisible et l'audit conclut à tort au fichier vide. Le contrôle choisit son fond selon le nom du fichier.

## Si une piste est retenue

Reprise du dessin au dixième avec les corrections optiques, famille complète de fichiers (PNG, PDF pour l'imprimeur, image de partage, couverture de fiche Google), mise à jour de `identite/CHARTE-GRAPHIQUE.md` et de `identite/build-logos.mjs`, puis pose sur le site : en-tête, pied de page, favicon, icônes d'application, signature de courriel, cartes de visite et gabarits de devis.

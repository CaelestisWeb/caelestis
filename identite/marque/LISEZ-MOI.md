# La marque Caelestis : l'Écran planté

Septembre 2026. **C'est le signe de la marque**, retenu le 7 septembre. Il succède au monogramme en C, sorti du dépôt le même jour. Les neuf séries de recherche qui y ont mené sont sorties du dépôt le même jour : leur raisonnement est dans `identite/RECHERCHE.md`, leurs fichiers dans l'historique git.

**Planche** : `planche-marque.html`, ou `node identite/serveur.mjs` puis http://localhost:4600.

## Ce que contient ce dossier

| Dossier | Contenu |
|---|---|
| `signe/` | Les 16 SVG du signe, la source de tout le reste |
| `mot/` | Le mot « Caelestis » seul, en tracés. Il ne dépend pas du signe et lui survit |
| `exports/png/` | Fonds transparents, deux tailles par fichier |
| `exports/aplat/` | Fonds pleins, PNG et JPEG, zone de protection respectée |
| `exports/favicon/` | Le jeu complet pour `public/` : SVG, six PNG et un `favicon.ico` |
| `exports/google/` | Fiche d'établissement : logo carré 720 et couverture 1024 × 576 |
| `exports/reseaux/` | Avatar 1080, profil 720, couverture 1640 × 720 |
| `exports/partage/` | Image de partage Open Graph, 1200 × 630 |
| `exports/impression/` | Les cartes de visite : un PDF, un PNG et un SVG par face |

⚠️ **Rien n'écrit dans `public/`.** Le site sert encore le monogramme : le jeu de favicons attend dans `exports/favicon/`, à copier quand le basculement sera décidé, avec un `?v=` incrémenté dans `src/layouts/BaseLayout.astro`.

## À quoi sert chaque fichier

| Fichier | Ce que c'est | Où il sert |
|---|---|---|
| `signe-vert`, `-creme`, `-encre` | **Le signe seul**, sans le mot, cadré au plus juste sur son encre | Partout où le nom est déjà écrit à côté ou juste au-dessus : filigrane, puce de liste, icône d'un bloc, tampon, gravure. Le crème sert sur fond vert, l'encre pour un tirage en une seule couleur |
| `tuile-creme-sur-vert`, `tuile-vert-sur-creme` | **La tuile** : le signe centré dans un carré arrondi, fond compris | Tous les emplois qui imposent un carré et où le fond n'est pas maîtrisé : avatar de la fiche Google, photo de profil sur les réseaux, icône d'application, vignette d'un annuaire |
| `favicon` | La même tuile, **redessinée pour la petite taille** : contour à 8 au lieu de 7,5, col et ligne d'une unité de plus | L'onglet du navigateur, la barre de favoris, la tuile d'écran d'accueil. Ce n'est pas la tuile réduite, c'est un dessin à part |
| `lockup-horizontal-vert`, `-creme`, `-encre` | **Le signe et le mot côte à côte** | L'usage courant : en-tête du site, haut d'un devis ou d'une facture, signature de courriel, bandeau |
| `lockup-vertical-vert`, `-creme` | **Le signe au-dessus du mot** | Les formats étroits ou carrés : publication sociale, carte de visite en portrait, tampon, marquage textile |
| `lockup-mot-a-l-ecran-vert`, `-creme`, `-encre` | **Le mot dans l'écran**, à 58 unités, cadre entier | Les grands formats où le logo est le sujet : couverture, première page, affiche, écran d'accueil |
| `tuile-mot-creme-sur-vert`, `-vert-sur-creme` | La même chose **dans un carré**, fond compris | Les carrés affichés en grand : publication sociale, image de partage, tampon de document, carré imprimé. **À partir de 128 px, jamais en dessous** |

**Signe et tuile, la différence en une phrase** : le signe est la forme nue, elle prend la couleur qu'on lui donne et le fond de la page. La tuile est la même forme livrée avec son fond, pour les endroits où l'on n'a pas la main sur ce qu'il y a derrière.

## Les trois pièces

| Pièce | Valeur |
|---|---|
| L'écran | 76 sur 48 unités, du 16/10, angles à 7, contour de 7,5. Son encre mesure 83,5 de large |
| Le col fuselé | 11 unités sous l'écran, 19 au sol |
| La ligne de sol | 68 unités sur 8 d'épaisseur |
| Le plongeon | 4 unités : le col est dans la ligne, pas posé dessus |

Tout se décrit en quatre nombres. Aucune courbe à main levée, aucune forme organique.

## La version optique du favicon

Le favicon portait un contour de **9,5** unités là où le signe en a 7,5. L'écart se voyait : la petite taille avait des bordures nettement plus grosses que le signe, et elle en donnait une version engraissée plutôt qu'une version optique.

Il est ramené à **8**, une demi-unité de plus que le signe au lieu de deux. Le col et la ligne suivent, une unité de plus au lieu de deux et quatre. Vérifié à 64, 48, 32, 24 et 16 px : le contour tient jusqu'au bout.

Les quatre valeurs vivent dans la constante `PETIT` de `signes.mjs`. Une seule ligne à changer si le contour doit encore maigrir.

## ⚠️ Les deux écarts à tenir

Sans la Pousse dans l'écran, ce qui distingue ce signe du pictogramme ordinaire du moniteur tient à deux valeurs :

- **le col s'évase de 11 à 19 unités**, là où un pied de moniteur est droit ;
- **la ligne fait 68**, là où un socle de moniteur ordinaire en fait 44.

Un col droit, ou une ligne ramenée à 48, et le signe devient une icône comme il en existe des milliers. Ces deux valeurs se tiennent au dixième sur tous les supports, et toute simplification qui les rabote est à refuser.

## Quel fichier pour quel compte

| Emplacement | Fichier | Pourquoi |
|---|---|---|
| Photo de profil, fiche Google | `tuile-creme-sur-vert` | Elle est téléversée en 720 mais **affichée petite**, de l'ordre de 40 à 60 px dans les résultats, Maps et le panneau de droite |
| Photo de profil, Facebook, Instagram, LinkedIn, X | `tuile-creme-sur-vert` | Même chose : une centaine de pixels sur la page de profil, mais 32 à 60 dans les fils et les commentaires, là où elle est vue le plus souvent |
| Favicon du site | `favicon` | 16 à 32 px |
| Couverture de fiche Google, bannière de page sociale | `lockup-horizontal-creme` sur aplat vert | Format large : le lockup horizontal y est fait pour ça |
| Publication sociale carrée, 1080 × 1080 | `tuile-mot-creme-sur-vert` | Le carré est affiché en grand, le mot se lit |
| Image de partage d'une page, 1200 × 630 | `lockup-horizontal-creme` | Format large |
| Tampon de document, carré imprimé | `tuile-mot-*` si le carré fait plus de 128 px, sinon `tuile-*` | Le seuil de lisibilité du mot |

**L'argument qui tranche pour les avatars** : sur Google comme sur les réseaux, **la plateforme écrit déjà votre nom à côté de l'image**. Mettre le nom dans l'avatar redit ce que l'interface affiche déjà, et le paie en lisibilité. Un avatar sert à être reconnu d'un coup d'œil, pas à être lu.

La tuile au mot serait lisible sur la page de profil elle-même, où l'image est grande, et illisible dans les fils, les commentaires et les résultats de recherche. Comme on ne téléverse qu'une seule image pour les deux, c'est le petit affichage qui décide.

## Pourquoi la tuile au mot ne remplace ni la tuile ni le favicon

Mesure faite en montant le mot dans un carré : **il occupe 48,6 unités sur 100**, et sa hauteur d'encre 8,5. Rendu aux tailles réelles, le mot est une tache en dessous de 48 px, une barre grise à 48, devinable à 64, et il ne devient lisible qu'à partir de 96, confortable à 128.

Or **la tuile et le favicon vivent précisément en dessous de ce seuil** : le favicon s'affiche entre 16 et 32 px, et l'avatar d'une fiche Google ou d'un profil social s'affiche entre 32 et 60 px dans les résultats et les fils, même quand on le téléverse en 720. Un mot illisible n'est pas neutre, il salit l'écran et abîme la lecture du signe.

`tuile-mot-*` existe donc à côté, pour les carrés affichés en grand, avec un plancher écrit dans le code : `TUILE_MOT_MINIMUM = 128`.

## Le mot à l'écran, et les trois traitements écartés

Le mot rentre **entièrement dans l'écran, à 58 unités**, le cadre reste entier. Une seule couleur, aucun croisement, l'ordinateur intact.

Un mot qui déborderait de l'écran obligerait à traiter son croisement avec le cadre, puisqu'un cadre entier et un mot de la même couleur se confondent là où ils se croisent. Trois traitements ont été fabriqués puis écartés le 7 septembre. Ils restent disponibles dans `signes.mjs` par le paramètre `traitement`, sans être livrés en fichiers.

| Traitement | Pourquoi il est écarté |
|---|---|
| `ferme` | Le cadre entier et le mot par-dessus : le C et le s sont mangés par les montants, le mot ne se lit plus |
| `interrompu` | Le cadre s'ouvre de part et d'autre du mot : ça marche, mais l'écran est coupé en deux morceaux pour rien |
| `mousse` | Le cadre en `#B8C4BB` et le mot en vert forêt : le relief se lit, mais le logo passe à **deux couleurs**, ce que la charte interdit pour le signe, et le contraste de la mousse sur crème vaut 1,7 pour 1. Grands formats seulement |

Ne pas rouvrir ces trois-là sans motif nouveau. Le refus est une décision.

## Fabriquer

```bash
node identite/marque/build-signe.mjs      # les 16 SVG, puis le contrôle de cadrage
node identite/marque/build-exports.mjs    # tout le reste : PNG, JPEG, favicons, Google, réseaux, partage
node identite/marque/build-planche.mjs    # la planche
node identite/marque/build-cartes.mjs     # les cartes de visite, puis le contrôle du cadrage
```

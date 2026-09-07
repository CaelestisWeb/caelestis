# Caelestis, charte graphique

> Version 2026.09, relevée dans le code de production le 7 septembre 2026. Version visuelle à ouvrir dans un navigateur : `identite/charte-caelestis.html` (fichier autonome, polices incluses).
>
> Le signe de la marque est **l'Écran planté**, retenu le 7 septembre 2026. Il succède au monogramme en C, dont les fichiers sont sortis du dépôt le même jour.

## 1. Territoire de marque

Caelestis crée des sites internet et fait du référencement naturel, dans la Drôme, pour des artisans, producteurs et indépendants dont le métier touche à la nature.

L'identité doit paraître soignée sans être froide, sérieuse sans être corporate, végétale sans être folklorique. Registre visé : artisanal et précis, chaleureux (papier et forêt plutôt qu'écran et néon), calme, un seul vert profond qui porte toute la marque.

À fuir : le vert pomme écologique et les feuilles illustrées, le bleu technologique et les dégradés de start-up, les emoji en guise d'icônes, trois couleurs vives sur un même visuel.

## 2. Couleurs

Valeurs exactes du code (`@theme` dans `src/styles/global.css`). Neuf teintes, aucune de plus.

| Nom | Hex | RVB | Rôle | Token CSS |
|---|---|---|---|---|
| Vert forêt | `#255C41` | 37, 92, 65 | Couleur directrice : boutons, sections sombres, titres forts, le signe | `--color-ocre`, `--color-brun`, `--color-bois` |
| Vert profond | `#1B4733` | 27, 71, 51 | Survol des boutons, aplats les plus denses | `--color-ocre-dark` |
| Mousse foncée | `#2E7452` | 46, 116, 82 | Accents de texte sur fond clair, surtitres, liens | `--color-sauge-text`, `--color-sauge-vif` |
| Mousse | `#B8C4BB` | 184, 196, 187 | Bordures, filets, décor. **Jamais de texte** | `--color-sauge` |
| Lin mousse | `#E3EFE8` | 227, 239, 232 | Fonds de sections douces, encadrés, tableaux | `--color-sauge-pale` |
| Crème | `#FCFBF8` | 252, 251, 248 | Fond principal, texte sur aplat vert | `--color-cream` |
| Parchemin | `#E6E4DC` | 230, 228, 220 | Séparateurs, contours de cartes | `--color-cream-dark` |
| Pierre | `#5C6259` | 92, 98, 89 | Texte secondaire, légendes, mentions | `--color-brun-mid`, `--color-pierre` |
| Encre | `#12160F` | 18, 22, 15 | Texte courant. Un noir légèrement vert, jamais du noir pur | `--color-encre` |

### Répartition sur un visuel

60 % de crème **ou** de vert forêt (un seul des deux domine), 30 % de texte, 10 % d'accents.

### Contrastes, calculés selon la formule WCAG 2.1

| Association | Ratio | Verdict |
|---|---|---|
| Encre sur crème | 17,7 : 1 | AAA, lecture par défaut |
| Encre sur lin mousse | 15,5 : 1 | AAA |
| Vert forêt sur crème | 7,6 : 1 | AAA |
| Crème sur vert forêt | 7,6 : 1 | AAA |
| Vert forêt sur lin mousse | 6,6 : 1 | AAA |
| Pierre sur crème | 6,1 : 1 | AA |
| Mousse foncée sur crème | 5,4 : 1 | AA |
| Mousse sur crème | 1,7 : 1 | Décor uniquement |

### Impression

Canva imprime depuis le RVB, aucune conversion à faire. Pour un imprimeur classique : transmettre le hexadécimal, demander la conversion avec le profil du papier retenu et un bon à tirer couleur avant tirage. Ne pas convertir soi-même en CMJN, le vert forêt vire au terne avec une conversion automatique.

## 3. Typographie

**Satoshi**, seule famille, titres comme texte. Indian Type Foundry, distribuée gratuitement par Fontshare, licence autorisant l'usage commercial et l'intégration.

Graisses utilisées : 300, 400, 500, 700. **Satoshi n'a pas de graisse 600** : toute demande de demi-gras produit une fausse graisse synthétique, à proscrire.

| Usage | Graisse | Interlettrage | Interligne | Taille |
|---|---|---|---|---|
| Titre principal | 700 | -0.038em | 1.08 | plafond 68 px |
| Titre de section | 700 | -0.038em | 1.1 | 28 à 40 px |
| Sous-titre, titre de carte | 700 | -0.024em | 1.22 | 19 à 22 px |
| Texte courant | 400 | 0 | 1.7 | 17 px, 65 à 70 signes par ligne |
| Surtitre | 500 capitales | 0.18em | 1.4 | 12 px, en mousse foncée |
| Libellé de bouton | 500 | 0.04em | 1 | 14 px, hauteur mini 44 px |

### Installer la police

1. Télécharger la famille sur `fontshare.com/fonts/satoshi` (gratuit).
2. Décompresser, garder les `.otf` des graisses Light, Regular, Medium, Bold.
3. Les installer sur le poste (clic droit, Installer). **Satoshi n'est pas installée sur ce poste à ce jour.**
4. Canva : Marque, Polices de marque, Importer une police, un fichier `.otf` par graisse. Canva accepte OTF, TTF et WOFF, **refuse WOFF2 et les ZIP**. L'import demande un compte Canva Pro.

## 4. Logotype

Deux éléments : **l'Écran planté**, un moniteur en contour dont le col fuselé plonge dans une ligne de sol, et le mot « Caelestis » écrit en Satoshi Medium 500, interlettrage -0.02em, **sans point final**.

Fichiers dans `identite/marque/`. Le détail complet, avec le fichier à choisir pour chaque destination, est dans `identite/marque/LISEZ-MOI.md`.

| Fichier | Usage |
|---|---|
| `signe/signe-vert.svg`, `-creme`, `-encre` | Le signe seul, cadré au plus juste sur son encre : filigrane, puce, icône de bloc, tampon |
| `signe/tuile-creme-sur-vert.svg`, `tuile-vert-sur-creme.svg` | Le signe dans un carré arrondi, fond compris : avatar, icône d'application, annuaire |
| `signe/favicon.svg` | La tuile redessinée pour la petite taille, contour à 8 au lieu de 7,5 |
| `signe/lockup-horizontal-vert.svg`, `-creme`, `-encre` | Usage courant : en-tête du site, devis, facture, signature de courriel |
| `signe/lockup-vertical-vert.svg`, `-creme` | Formats étroits ou carrés : publication sociale, carte en portrait, marquage |
| `signe/lockup-mot-a-l-ecran-*.svg` | Le mot dans l'écran, pour les grands formats où le logo est le sujet |
| `signe/tuile-mot-*.svg` | Le mot dans l'écran, en carré. **À partir de 128 px, jamais en dessous** |
| `mot/wordmark-vert.svg`, `-creme`, `-encre-700` | Le mot seul, quand le signe est déjà présent |
| `exports/png/`, `exports/aplat/` | Les mêmes en PNG, fond transparent ou aplat composé, deux tailles |
| `exports/favicon/` | Le jeu complet pour `public/` : SVG, six PNG et un `favicon.ico` de 16, 32 et 48 px |
| `exports/google/` | Fiche d'établissement Google : logo carré 720 px et couverture 1024 × 576 |
| `exports/reseaux/` | Avatar 1080, photo de profil 720, couverture 1640 × 720 |
| `exports/partage/` | Image de partage Open Graph, 1200 × 630 |

**Le texte des SVG est en tracés**, jamais en `<text>` : un SVG qui embarque sa police ne s'affiche correctement que dans un navigateur, ailleurs la police est substituée et le mot déborde de son cadre. Ces fichiers s'affichent à l'identique partout, y compris chez un imprimeur et dans Canva.

### Les deux écarts qui font le signe, à tenir au dixième

Sur un carré de 100, l'écran mesure 76 × 48 en 16/10, angles à 7, contour à 7,5. Deux valeurs seulement le séparent d'une icône de moniteur ordinaire, et elles portent toute l'idée.

**1. Le col s'évase de 11 à 19.** Un pied de moniteur est droit. Le fuselage donne un tronc, et c'est lui qui fait lire l'arbre sous la machine.

**2. La ligne de sol fait 68, un socle en ferait 44.** L'écart avec la largeur d'un socle est ce qui fait lire le sol plutôt que le pied. Le col y plonge de quatre unités : il entre dans la terre au lieu de se poser dessus.

Un col droit ou une ligne ramenée à 48, et le signe redevient une icône comme il en existe des milliers. Ces valeurs vivent dans `identite/marque/signes.mjs`, source unique, aucun script ne les redéfinit.

### Le favicon est un dessin à part, jamais la tuile réduite

Aux petites tailles le contour passe à 8, le col et la ligne gagnent chacun une unité. Réduire la tuile donnerait un trait plus fin que l'écran ne peut rendre, et le signe deviendrait gris. Constante `PETIT` dans `signes.mjs`.

### Vérifier

```bash
node identite/marque/build-signe.mjs
```

Le script rasterise chaque fichier écrit et compare ses quatre marges. Il ne fait confiance à aucun calcul de géométrie : une coupe de trait, un cap ou un tracé de police déplacent le bord sans prévenir. Trois attentes selon la famille : le signe et les lockups touchent leurs quatre bords, les tuiles ont des marges opposées égales, un signe circulaire garde au plus 4 % de marge du côté de sa fente. **Tout doit sortir dans la tolérance.**

### Règles d'usage

- **Zone de protection** : un vide égal à la moitié de la hauteur du signe sur les quatre côtés. Aucun texte, aucune photo, aucun bord de page à l'intérieur.
- **Taille minimale imprimée** : 9 mm de haut pour le signe seul, 22 mm de large pour le logo horizontal.
- **Taille minimale écran** : 32 px pour le signe, 120 px pour le logo horizontal, 128 px pour une tuile au mot.
- **Sur photo** : uniquement en crème, sur une zone sombre et calme, jamais sur un feuillage détaillé.

### Interdits

Déformer, étirer, incliner. Changer la couleur hors palette ou appliquer un dégradé. Ajouter ombre portée, contour, reflet, relief. Réécrire le mot dans une autre police. Poser le vert sur du vert ou le crème sur du crème. Remplir l'écran d'un dessin : il reste vide, la Pousse en a été retirée le 7 septembre 2026. **Ajouter un point après le mot**, coloré ou non, dans un logo, une signature, un titre de page ou un document.

### Une seule valeur de crème, point tranché le 12/08/2026

La tuile du favicon utilisait `#F4F2EC`, seul îlot de cette valeur : les autres visuels de l'identité sont sur `#FCFBF8` ou sur le vert forêt. L'écart valait 8, 9 et 12 points par canal, invisible isolément, mais posée sur une page du site la tuile se détachait en carré gris au lieu de disparaître. **Tout est sur `#FCFBF8`**, favicons et icônes d'application compris.

Le point final a été supprimé le 02/08/2026, sur le site comme dans les fichiers de logo. La question de sa couleur ne se pose plus.

### Le signe retenu le 7 septembre 2026

L'Écran planté succède au monogramme en C, un arc de cercle ouvert à droite qui a porté la marque jusqu'à cette date. Le C disait le nom, il ne disait pas le métier. Neuf séries de recherche ont mené à ce signe. Elles sont sorties du dépôt le même jour : `identite/RECHERCHE.md` garde ce qui a été essayé et pourquoi c'est écarté, avec la commande pour ressortir les fichiers de l'historique git.

⚠️ **Le site sert encore le monogramme.** Les fichiers de `public/` datent du C et le basculement est un geste à part, à faire quand la décision est prise. Tant qu'il n'a pas eu lieu, la marque a deux visages : l'Écran planté sur les supports fabriqués depuis `identite/marque/`, le C sur caelestis.fr.

## 5. Carte de visite

Format français **85 × 55 mm**, fond perdu 3 mm (fichier 91 × 61 mm), zone de sécurité 5 mm.

- **Résolution** : 300 points par pouce, soit 1075 × 721 px pour le fichier avec fond perdu.
- **Papier** : 350 g, mat ou naturel. Le vert forêt s'assombrit sur non couché, prévoir un bon à tirer.
- **Pelliculage** : mat. Le brillant contredit le registre artisanal.
- **Canva** : format personnalisé 91 × 61 mm, repère de fond perdu activé, export PDF pour impression avec repères et fond perdu cochés.

Deux pistes ont été rendues à l'échelle réelle du temps du monogramme : recto vert forêt plein avec le signe en crème, ou recto crème avec le logo horizontal et une ligne de spécialité en capitales espacées. **Elles restent à redessiner pour l'Écran planté**, les fichiers d'impression ayant été retirés avec le C.

## 6. Applications

- **Signature de courriel** : nom en 700, fonction en mousse foncée capitales, filet mousse de 34 px, coordonnées en 400. Aucune image de fond, signe en 64 px maximum.
- **Réseaux sociaux** : carré 1080 × 1080 pour un conseil ou un chiffre, portrait 1080 × 1350 pour une réalisation (photo en haut, texte en bas sur aplat crème). Une idée par visuel, titre de six mots au plus, logo en bas à droite. Vert forêt en aplat plein, jamais en filtre sur une photo.
- **Devis et facture** : logo horizontal en haut à gauche sur 34 mm, texte Satoshi 400 en 10 points, titres de colonnes en 500 capitales mousse foncée, filets en parchemin. Mention de franchise de TVA en pied (article 293 B du code général des impôts).
- **Fiche d'audit A4** : fond crème, bandeau vert de 28 mm en tête avec logo crème, constats numérotés, coordonnées en pied sur filet mousse.

## 7. Règles d'écriture, tous supports

**Toujours** : vouvoyer, accentuer les capitales, espace insécable avant `: ? !`, chiffres réels et vérifiables collés à ce qu'ils prouvent, prix ronds (1 000, 2 000, 2 500, 3 500 euros).

**Jamais** : l'italique, le tiret cadratin et le demi-cadratin, le point médian comme séparateur décoratif, une rangée de trois ou quatre chiffres alignés à la même taille, un emoji en guise d'icône.

## 8. Mise en route dans Canva

1. Créer le kit de marque (rubrique Marque).
2. Coller les neuf codes hexadécimaux de la section 2, dans l'ordre du tableau.
3. Importer les quatre fichiers Satoshi, affecter 700 aux titres et 400 au texte.
4. Téléverser `identite/marque/signe/` et `identite/marque/mot/` dans les logos de la marque.
5. Créer un format personnalisé 91 × 61 mm pour les cartes, l'enregistrer comme modèle.
6. Avant export, vérifier trois points : aucune italique, aucun tiret long, aucun texte posé sur la mousse claire.

Canva ne peut plus substituer la police à l'import d'un logo : le mot y est en tracés, pas en texte. Les fichiers s'importent tels quels.

## Régénérer les fichiers

```bash
node identite/marque/build-signe.mjs      # les 16 SVG, puis le contrôle de cadrage
node identite/marque/build-exports.mjs    # les PNG, JPG, favicons, Google, réseaux, partage
node identite/marque/build-planche.mjs    # la planche du signe
node identite/build-charte.mjs            # cette charte en planche visuelle
node identite/build-index.mjs             # la page d'accueil de l'identité
```

`build-signe.mjs` écrit les SVG de référence, texte converti en tracés par fontkit, puis rasterise chaque fichier écrit pour comparer ses quatre marges. `build-exports.mjs` en tire tout le reste : PNG à fond transparent, aplats en PNG et JPG, jeu de favicons avec son `.ico`, visuels de la fiche Google, des réseaux sociaux et l'image de partage. `build-charte.mjs` recompose `charte-caelestis.html` en incorporant polices et logos, à partir de `charte.template.html`.

**Tous ces scripts résolvent leurs chemins depuis `import.meta.url`.** Les scripts du monogramme portaient `C:/dev/caelestis` en dur et ne tournaient donc que sur un poste, depuis ce chemin exact ; ils ont été retirés avec le C.

⚠️ **Rien n'écrit dans `public/`.** Le jeu de favicons sort dans `identite/marque/exports/favicon/` et attend d'être copié. Quand le basculement sera décidé, copier ce dossier dans `public/`, régénérer l'image de partage au même moment, et **incrémenter `?v=` sur les liens d'icônes dans `src/layouts/BaseLayout.astro`**, sinon les navigateurs gardent l'ancienne.

Les icônes se déclinent en deux familles : les favicons d'onglet gardent la tuile arrondie, tandis que `apple-touch-icon.png` et les icônes du manifeste sont destinées à un masque appliqué par le système, parfois circulaire pour une icône `maskable`. Le signe y est posé assez petit pour survivre au rognage.

# Caelestis, charte graphique

> Relevée dans le code de production le 1er août 2026. En cas d'écart, `src/styles/global.css` fait foi.
> Version visuelle à ouvrir dans un navigateur : `identite/charte-caelestis.html` (fichier autonome, polices incluses).

## 1. Territoire de marque

Caelestis crée des sites internet et fait du référencement naturel, dans la Drôme, pour des artisans, producteurs et indépendants dont le métier touche à la nature.

L'identité doit paraître soignée sans être froide, sérieuse sans être corporate, végétale sans être folklorique. Registre visé : artisanal et précis, chaleureux (papier et forêt plutôt qu'écran et néon), calme, un seul vert profond qui porte toute la marque.

À fuir : le vert pomme écologique et les feuilles illustrées, le bleu technologique et les dégradés de start-up, les emoji en guise d'icônes, trois couleurs vives sur un même visuel.

## 2. Couleurs

Valeurs exactes du code (`@theme` dans `src/styles/global.css`). Neuf teintes, aucune de plus.

| Nom | Hex | RVB | Rôle | Token CSS |
|---|---|---|---|---|
| Vert forêt | `#255C41` | 37, 92, 65 | Couleur directrice : boutons, sections sombres, titres forts, monogramme | `--color-ocre`, `--color-brun`, `--color-bois` |
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

Deux éléments : un monogramme géométrique en forme de C ouvert (arc de cercle, ouverture à droite, épaisseur de trait égale à 15 % du côté de la tuile) et le mot « Caelestis » écrit en Satoshi Medium 500, interlettrage -0.02em, **sans point final**.

Fichiers dans `identite/logo/`. Le détail complet, avec le fichier à choisir pour chaque destination, est dans `identite/logo/LISEZ-MOI.md`.

| Fichier | Usage |
|---|---|
| `lockup-horizontal-nu-vert.svg` | Usage courant sur fond clair, en-têtes, devis, factures |
| `lockup-horizontal-sur-clair.svg` | Avec tuile crème, quand le fond n'est pas maîtrisé |
| `lockup-horizontal-sur-vert.svg` | Bandeaux, couvertures, réseaux |
| `lockup-vertical-nu-vert.svg`, `-sur-clair.svg` | Formats carrés et étroits |
| `lockup-vertical-sur-vert.svg` | Publications sociales |
| `wordmark-vert.svg`, `wordmark-creme.svg` | Mot seul, quand le monogramme est déjà présent |
| `wordmark-encre-700.svg` | Mot en graisse 700, usage monochrome |
| `monogramme-nu-vert.svg`, `-creme`, `-encre` | Avatar, favicon, tampon, filigrane |
| `monogramme-vert-sur-creme.svg`, `monogramme-creme-sur-vert.svg` | Versions en tuile arrondie |
| `png/`, `png-aplat/` | Les mêmes en PNG, fond transparent ou aplat composé, deux tailles |
| `google/` | Fiche d'établissement Google : logo carré 720 px et couverture 1024 × 576, en PNG et en JPG |
| `impression/` | Cartes de visite, PDF vectoriel pour l'imprimeur et PNG 300 dpi |

**Le texte des SVG est en tracés**, jamais en `<text>` : un SVG qui embarque sa police ne s'affiche correctement que dans un navigateur, ailleurs la police est substituée et le mot déborde de son cadre. Ces fichiers s'affichent à l'identique partout, y compris chez un imprimeur et dans Canva.

### Règles d'usage

- **Zone de protection** : un vide égal à la moitié de la hauteur du monogramme sur les quatre côtés. Aucun texte, aucune photo, aucun bord de page à l'intérieur.
- **Taille minimale imprimée** : 9 mm de haut pour le monogramme seul, 22 mm de large pour le logo horizontal.
- **Taille minimale écran** : 32 px pour le monogramme, 120 px pour le logo horizontal.
- **Sur photo** : uniquement en crème, sur une zone sombre et calme, jamais sur un feuillage détaillé.

### Interdits

Déformer, étirer, incliner. Changer la couleur hors palette ou appliquer un dégradé. Ajouter ombre portée, contour, reflet, relief. Réécrire le mot dans une autre police. Poser le vert sur du vert ou le crème sur du crème. **Ajouter un point après le mot**, coloré ou non, dans un logo, une signature, un titre de page ou un document.

### Point ouvert

La tuile du favicon en production (`public/favicon.svg`) utilise le fond `#F4F2EC`, alors que le fond du site est `#FCFBF8`. Les fichiers de cette charte sont harmonisés sur `#FCFBF8`. À aligner dans le code, ou à assumer comme un écart voulu.

Le point final a été supprimé le 02/08/2026, sur le site comme dans les fichiers de logo. La question de sa couleur ne se pose plus.

## 5. Carte de visite

Format français **85 × 55 mm**, fond perdu 3 mm (fichier 91 × 61 mm), zone de sécurité 5 mm.

- **Résolution** : 300 points par pouce, soit 1075 × 721 px pour le fichier avec fond perdu.
- **Papier** : 350 g, mat ou naturel. Le vert forêt s'assombrit sur non couché, prévoir un bon à tirer.
- **Pelliculage** : mat. Le brillant contredit le registre artisanal.
- **Canva** : format personnalisé 91 × 61 mm, repère de fond perdu activé, export PDF pour impression avec repères et fond perdu cochés.

Deux pistes rendues à l'échelle réelle dans `charte-caelestis.html` :

- **Piste A** : recto vert forêt plein, monogramme crème en haut, nom et fonction en bas. Verso crème, coordonnées sur filet mousse.
- **Piste B** : recto crème avec logo horizontal et une ligne de spécialité en capitales espacées. Verso vert forêt avec les coordonnées.

## 6. Applications

- **Signature de courriel** : nom en 700, fonction en mousse foncée capitales, filet mousse de 34 px, coordonnées en 400. Aucune image de fond, monogramme en 64 px maximum.
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
4. Téléverser `identite/logo/` dans les logos de la marque.
5. Créer un format personnalisé 91 × 61 mm pour les cartes, l'enregistrer comme modèle.
6. Avant export, vérifier trois points : aucune italique, aucun tiret long, aucun texte posé sur la mousse claire.

Canva ne peut plus substituer la police à l'import d'un logo : le mot y est en tracés, pas en texte. Les fichiers s'importent tels quels.

## Régénérer les fichiers

```bash
node identite/build-logos.mjs
node identite/build-exports.mjs
node identite/build-cartes.mjs
node identite/build-reseaux.mjs
node identite/build-og.mjs
node identite/build-charte.mjs
```

`build-logos.mjs` écrit les SVG de référence, texte converti en tracés par fontkit. `build-exports.mjs` en tire les PNG, les JPG et le pack de la fiche Google. `build-cartes.mjs` compose les quatre faces des cartes de visite en PDF vectoriel et en PNG 300 dpi. `build-reseaux.mjs` et `build-og.mjs` produisent les visuels sociaux et l'image de partage. `build-charte.mjs` recompose `charte-caelestis.html` en incorporant polices et logos, à partir de `charte.template.html`, et doit passer en dernier.

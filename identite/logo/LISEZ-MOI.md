# Fichiers du logo Caelestis, quel fichier pour quel usage

Tous les fichiers de ce dossier sont fabriqués par des scripts, ils ne se
modifient pas à la main. Pour les régénérer après une évolution de la charte :

```
node identite/build-logos.mjs     les SVG
node identite/build-exports.mjs   les PNG et les JPG
node identite/build-cartes.mjs    les cartes de visite
node identite/build-favicon.mjs   les favicons du site
node identite/build-charte.mjs    la charte, qui embarque les SVG
node identite/audit-visuels.mjs   le contrôle, doit finir à zéro défaut
```

L'audit mesure l'encre réellement présente dans chaque fichier et compare les
quatre marges. Il est la seule preuve qu'un visuel est équilibré : les calculs
des scripts de fabrication ne suffisent pas, c'est ainsi qu'un monogramme
décalé de 7 % a vécu longtemps sans être vu.

## Le point important sur les SVG

Le texte du logo est converti en tracés, il ne dépend plus de la police
Satoshi. Un SVG qui embarque une police ne s'affiche correctement que dans un
navigateur : partout ailleurs, imprimeur, Canva, Word, la police est remplacée
par une autre et le mot déborde de son cadre. Ces fichiers-ci s'affichent
partout à l'identique.

Le SVG reste le fichier de référence : il ne perd jamais en qualité. Il faut
passer aux PNG ou aux JPG quand le service ne l'accepte pas, ce qui est le cas
de la fiche Google, de Facebook et de la plupart des plateformes.

## À la racine, les SVG de référence

| Fichier | Quand l'utiliser |
| --- | --- |
| `lockup-horizontal-nu-vert.svg` | Usage courant sur fond clair, en-tête de document, devis, facture |
| `lockup-horizontal-sur-vert.svg` | Le même en crème, à poser sur un fond vert ou une photo sombre |
| `lockup-horizontal-sur-clair.svg` | Avec sa tuile crème, quand le fond n'est ni crème ni maîtrisé |
| `lockup-vertical-*.svg` | Formats carrés et étroits, publications sociales |
| `wordmark-vert.svg`, `wordmark-creme.svg` | Le mot seul, quand le monogramme est déjà présent à côté |
| `wordmark-encre-700.svg` | Le mot en encre, réservé aux documents administratifs |
| `monogramme-nu-vert.svg` | Le C seul : favicon, tampon, filigrane |
| `monogramme-creme-sur-vert.svg` | Le C sur sa tuile verte, pour les avatars |

## `google/`, la fiche d'établissement Google

| Fichier | Où le déposer |
| --- | --- |
| `logo-720-vert.png` | Logo de la fiche. Format carré attendu par Google, le C survit au recadrage circulaire |
| `logo-720-creme.png` | Même chose en version claire, si le vert passe mal sur un fond donné |
| `couverture-1024x576.png` | Photo de couverture de la fiche, format 16:9 attendu |

Les mêmes fichiers existent en `.jpg` : Google accepte les deux, mais certains
formulaires refusent le PNG. Le logo affiché sur la fiche est identique à
l'avatar des réseaux sociaux, c'est voulu.

## `png/`, fond transparent

À poser sur n'importe quel support. Deux tailles par visuel, la petite pour
l'écran et un document, la grande pour l'impression et les grands formats.
Le suffixe est la dimension en pixels.

La règle de couleur ne change pas : le vert sur fond clair, le crème sur fond
sombre. Jamais de vert sur vert.

## `png-aplat/`, fond plein déjà composé

Le logo est déjà posé sur son aplat, avec la zone de protection de la charte,
soit la moitié de la hauteur du monogramme sur les quatre côtés. C'est le
fichier à donner quand on ne maîtrise pas le fond de destination, par exemple
un annuaire professionnel ou un partenaire qui demande un visuel.

Les tuiles carrées `monogramme-carre-*` servent partout où un carré est imposé.

## `impression/`, les cartes de visite

Les deux pistes de la charte, recto et verso, en 91 × 61 mm, soit le format
français 85 × 55 mm avec 3 mm de fond perdu sur chaque bord.

| Extension | Usage |
| --- | --- |
| `.pdf` | Le fichier à envoyer à l'imprimeur. Vectoriel, texte en tracés, aucune police à fournir |
| `.png` | 300 points par pouce, 1075 × 721 px, pour Canva ou un aperçu rapide |
| `.svg` | Pour retoucher la composition dans un logiciel de dessin |

Ce qui a été vérifié sur les PDF : page de 91 × 61 mm, tout le texte dans la
zone de sécurité de 5 mm, couleurs exactes de la charte.

Avant de lancer un tirage, demander un bon à tirer : le vert forêt s'assombrit
sur papier non couché.

# CLAUDE.md — Site caelestis.fr (production)

> Doc du site vitrine de l'agence Caelestis. Déplacée ici depuis le CLAUDE.md global (juillet 2026) et mise à jour d'après le code réel.

## Contexte

**Caelestis** : agence de création de sites internet + référencement naturel (SEO), basée dans la Drôme (Auvergne-Rhône-Alpes). Fondateur : Célestin.
**Cible** : artisans, producteurs et indépendants, niche nature/environnement (paysagistes, agriculture, éco-construction, bureaux d'études, énergies renouvelables, associations).
**Positionnement copy** : « Un site web qui valorise votre savoir-faire et attire vos futurs clients. » · « Clair, soigné et bien référencé, à la hauteur de votre travail. »

## Offres et coordonnées (source de vérité)

| Offre | Tarif |
|---|---|
| Site une page | dès 1 000 € |
| Site vitrine | dès 2 000 € |
| Boutique en ligne | dès 2 500 € |
| Sur mesure | dès 3 500 € |

Grille relevée dans le code réel (source de vérité vivante) le 31/07/2026, cohérente sur toutes les pages : services, métas, simulateur, guide `/ressources/tarifs`. Les anciens montants 500/800/1 200/2 500 € étaient périmés. Maintenance en abonnement dès 9,99 €/mois (offerte les 3 premiers mois).

Réponse sous 48h · Devis gratuit · Livraison 2 à 8 semaines.
Email : caelestis-pro@hotmail.com (envois : contact@caelestis.fr) · Tél : 07 69 36 27 27 · Du lundi au samedi, 9h à 18h (horaires cohérents sur tout le site : contact, accueil, footer).

## Stack

Astro + Tailwind + Vercel (déploiement : `npx vercel deploy --prod` depuis ce dossier, après chaque modification).
Endpoints API : `src/pages/api/` (contact, devis, brief, simulator).
Routes 410 Gone (`src/utils/gone.ts` + routes catch-all author/category/tag/feed/comments/page) : le domaine a un passé WordPress/WoW encore indexé, ne pas les supprimer.

## Pages

`index` · `services` · `a-propos` · `contact` · `simulateur` · `site-une-page` · `creation-site-internet-auvergne-rhone-alpes` (SEO local) · `questionnaire-client` · `questionnaire-devis` · `cgv` · `mentions-legales` · `politique-confidentialite` · `maintenance` · `404`.

## Charte graphique RÉELLE (relevée dans src/styles/global.css)

> Charte complète, logos et gabarits imprimés : dossier `identite/` (`CHARTE-GRAPHIQUE.md` pour le texte, `charte-caelestis.html` pour la planche visuelle autonome, `logo/` pour les SVG et PNG). Régénération : `node identite/build-logos.mjs` puis `node identite/build-charte.mjs`.

**Typographie** : `Satoshi` (display ET corps), auto-hébergée en `src/assets/fonts/*.woff2` (poids 300/400/500/700), zéro requête tierce, hors liste noire. `@theme` dans `src/styles/global.css` est la source de vérité, ne pas dupliquer les hex ailleurs sans les y relever.

Palette « forêt vivante » réelle (relevée dans `@theme`, `global.css`, le 31/07/2026) :

| Variable | Hex | Usage |
|---|---|---|
| `--color-cream` | `#FCFBF8` | fond principal, parchemin chaud |
| `--color-cream-dark` | `#E6E4DC` | séparateurs organiques |
| `--color-ocre` / `--color-brun` / `--color-bois` | `#255C41` | vert forêt : CTA, texte, sections sombres |
| `--color-ocre-dark` | `#1B4733` | vert profond, hover premium |
| `--color-brun-mid` / `--color-pierre` | `#5C6259` | olive chaud, texte secondaire |
| `--color-sauge` | `#B8C4BB` | mousse : bordures et accents (PAS de texte sur fond clair) |
| `--color-sauge-text` / `--color-sauge-vif` | `#2E7452` | mousse foncée : textes et accents sur fond clair |
| `--color-sauge-pale` | `#E3EFE8` | lin-mousse : fonds de sections douces |
| `--color-encre` | `#12160F` | encre brûlée, profondeur absolue |

Règle accessibilité en place : `.text-sauge` (accent décoratif `#B8C4BB`) ne porte jamais de texte sur fond clair ; les petits textes verts utilisent `--color-sauge-text` `#2E7452`. L'ancienne charte (Lora + DM Sans, palette olive `#889063`/`#EDE3D4`) est périmée.

## Règles rédactionnelles (strictes, comme partout)

- Jamais d'italique (aucune exception, y compris citations).
- Jamais de tiret cadratin ou demi-cadratin en ponctuation ni en décoration : utiliser virgule, deux-points, point, parenthèses ou « · ». Contrôler aussi title/meta/OG.
- Chiffres de réassurance réels uniquement, jamais inventés.

## SEO

- Le domaine est un ex-WordPress/WoW : surveiller Search Console, les routes 410 nettoient l'index.
- Chaque page : title unique 50-60 caractères, meta description 150-160, h1 unique, Schema.org LocalBusiness sur l'accueil.
- Core Web Vitals = argument commercial de l'agence : toute modification doit rester exemplaire (LCP < 2,5 s).

## Historique utile

- Une exploration de refonte « V2 Awwwards » a été stoppée en juillet 2026 sans direction validée (maquettes archivées dans `C:\dev\caelestis-v2-directions`). Ne pas relancer sans demander ce qui coinçait.

## Décisions de session

- **29/07/2026, doctrine images de l'accueil** : une image doit être soit une preuve (capture de site livré, avant/après), soit un ancrage réel (Célestin, la Drôme, un client). L'ambiance est tolérée uniquement si la photo est nette à la taille d'affichage.
  - **Critère greppable, la réserve de pixels** : `pixels de la source / pixels de la surface affichée` doit valoir au moins 4. Les quatre photos du bento sont entre 3,9 et 4,4. La photo « bureau au jardin » retirée était à 0,93 (736×258 pour une surface de 765×268) : aucune marge, donc molle à l'affichage et impossible à sauver sur écran haute densité. Un bandeau pleine largeur réclame donc une source d'au moins 1600 px de large.
  - **Rendu retenu, la frise de portraits** : les 4 sources d'ambiance sont toutes en portrait (ratio 0,56 à 0,75). Elles sont affichées en portrait (frise de 4 colonnes sur desktop, 2×2 sur mobile), jamais dans une cellule paysage plate qui les écraserait. Trois variantes ont été comparées le 31/07 (actuelle bento, mixte avec captures de réalisations, frise de portraits) : la frise l'emporte pour la cohérence de registre et le respect du cadrage. La variante mixte (screenshots de sites dans le bento) a été écartée : elle jure avec les photos organiques et fait doublon avec la section Réalisations juste en dessous.
  - À terme, si des photos d'ambiance sont remplacées par des captures de réalisations, le faire dans la section Réalisations dédiée, pas dans la galerie « pour qui ».

- **31/07/2026, titre du hero de l'accueil** : retenu « Un site web qui valorise votre savoir-faire et attire vos futurs clients » (h1, `src/pages/index.astro`). Choisi après relevé des heros d'agences web : la promesse gagnante est orientée bénéfice client, pas description de la prestation. Deux candidats écartés : « Transformez votre présence en ligne en un véritable levier de croissance » (jargon corporate abstrait, interchangeable, ne parle pas du métier) et « Valorisez votre activité avec un site web d'exception » (centrée sur la prestation « site d'exception », pas sur le résultat). « Savoir-faire » vise la niche métiers de la nature ; l'accent sauge couronne le bénéfice commercial « attire vos futurs clients ».
  - **Rendu** : titre plus long que l'ancien, donc posé en trois lignes en escalier (trois blocs `.sl`) et clamp ramené à `clamp(1.95rem, 4.4vw, 3.6rem)` (56 px à 1280, sous le plafond de 68 px). Règle d'animation `.hero-title .sl:nth-child(3)` ajoutée dans `global.css` (les deux premières existaient déjà). Vérifié : 3 lignes nettes en desktop, aucun débordement horizontal en 375 px, zéro erreur console.

- **04/08/2026, réassurance déplacée du hero de l'accueil vers /services** : les quatre gages (2 sites livrés vérifiables, tarifs affichés dès 1 000 €, réponse sous 48h, en ligne en 2 à 8 semaines) ont d'abord été remis en cases dans le hero (les deux retirés le 03/08 rétablis), puis Célestin les a jugées « pas belles » à cet endroit. Elles sont **sorties du hero** et posées sur **`/services`, section « Ce sur quoi vous pouvez compter »**, juste après les tarifs (le moment où le visiteur a vu le prix et cherche à se rassurer).
  - **Format retenu, variante C sur trois proposées** : liste éditoriale, chaque gage sur sa ligne avec icône en pastille, libellé en gras et une phrase qui le justifie. Les deux autres pistes (bande fine à filets verticaux, colonnes) étaient dans `zz-variantes-reassurance.astro`, page de travail supprimée après arbitrage. Classes `.reassur*` dans le `<style>` de services.astro. Deux colonnes (titre + intro / liste), empilées en mobile. `min-width:0` sur `.reassur-corps` (piège flex, voir mémoire [[css_min_width_auto_grille_flex]]).
  - **Hero de l'accueil rééquilibré** : sans les cases, il redevient une composition purement typographique (eyebrow, titre, sous-titre, boutons), centrée dans la hauteur d'écran, blanc symétrique (191 px haut / 175 px bas mesurés en 1440×900). Le CSS `.gages` a été entièrement retiré de index.astro. Ne pas y réintroduire de bloc de réassurance : c'est /services qui le porte désormais.

- **01/08/2026, ciblage de la section « Pour qui » de l'accueil** : la liste de 14 métiers nommés (Maraîchers, Boulangers, Apiculteurs, Brasseurs, Ébénistes, Paysagistes, Écuries, Gîtes, Praticiens bien-être…) est remplacée par cinq statuts larges : **Artisans, Commerçants, Indépendants, Lieux d'accueil, Métiers de passion**. Deux motifs : la liste tenait sur cinq lignes en mobile, et elle fermait la porte à tout métier non cité. Choix assumé d'élargir au-delà de la niche métiers de la nature, pour toucher plus large en accueil.
  - **Le geste métier est porté par l'accroche**, pas par les pastilles : « Vous cultivez, vous élevez, vous fabriquez, vous accueillez » reste au-dessus, c'est là qu'un maraîcher ou un apiculteur se reconnaît. Ne pas supprimer cette accroche sans réintroduire un signal métier ailleurs dans la section.
  - **Ne pas dépasser six pastilles** : au-delà, le retour à la ligne mobile redevient illisible. `white-space: nowrap` sur `.metiers li` interdit qu'un libellé se coupe en deux, donc tout libellé plus long que « Métiers de passion » (137 px en mobile) casse le pavage.
  - **Pavage mesuré sur huit largeurs** (320, 375, 414, 500, 640, 768, 841, 1280) : 2+2+1 à 320 px, franc 3+2 de 375 à 840 px, rangée unique dès 841 px, aucun débordement horizontal nulle part. Hauteur du bloc : 75 px en mobile, contre 177 px avec l'ancienne liste.
  - **Le palier `@media (max-width: 840px) { .metiers { max-width: 420px } }` porte tout le pavage** : sans lui, la plage 480 à 840 px loge quatre pastilles et abandonne la cinquième seule sur sa ligne. La borne 840 vient de la mesure : les cinq pastilles réclament 737 px de rangée, soit 817 px de fenêtre avec les marges de section ; 840 laisse une marge de sécurité de 24 px.
  - **Corps de 13 px assumé en mobile** (0,8125rem, la taille d'origine des pastilles) : à 14 px, trois pastilles ne tiennent plus sur une ligne à 375 px et le bloc repasse à trois lignes, soit 130 px de haut. C'est le seul réglage qui achète le 3+2.

- **01/08/2026, répartition des mots-clés entre les pages** : « création de site internet » figurait dans le title de quatre pages (accueil, `/services`, page régionale, `/contact`) qui se disputaient le même résultat. Une seule le porte désormais, la page régionale, dont c'est l'adresse. Répartition retenue, à ne pas défaire sans arbitrage :
  - **Accueil** : « Agence web en Auvergne-Rhône-Alpes, Caelestis ». Le terme « agence web » n'apparaissait dans aucun title alors que c'est l'une des deux requêtes principales du métier. Il est adossé au pied de page (« Agence web indépendante : création de site… »), donc présent sur toutes les pages sans bourrage.
  - **`/creation-site-internet-auvergne-rhone-alpes`** : garde « Création de site internet en Auvergne-Rhône-Alpes ».
  - **`/services`** : page du prix (« Tarifs et formules de création de site »), plus la requête générique.
  - **`/contact`** : « devis ». **`/a-propos`** : « développeur web freelance », qui n'existait que dans le JSON-LD.
  - **Pages offre** : le prix entre dans le title (dès 1 000, 2 000, 2 500, 3 500 €, 9,99 €/mois). Il trie les visiteurs avant le clic.
  - **Zone géographique** : arbitrage de Célestin, priorité à la région, pas à la ville. Aucune page ville n'est ouverte.
- **01/08/2026, gabarits de métadonnées** : title ≤ 60 signes, description ≤ 155, et l'argument décisif (prix, délai, garantie) placé **avant le 120e signe**, car c'est là que Google coupe en mobile. Onze descriptions dépassaient et perdaient leur argument. Le gabarit des études de cas (`realisations/[slug].astro`) visait 165, ramené à 155.
  - **Piège typographique** : dans les **métas**, le site pose une espace insécable **uniquement** entre le nombre et le €. Dans le **contenu**, il en pose aussi avant `?` `:` `!`. Un remplacement de chaîne qui ignore cette différence échoue silencieusement.
  - **Contrôle** : `npm run build` puis relevé sur `.vercel/output/static/**/*.html`, jamais sur les sources. C'est ce que reçoit Google.
- **02/08/2026, section « L'importance d'un site web » de l'accueil** : le pavé centré sur carte verte (`.para-card`, retirée) est remplacé par le **point de rencontre**, deux colonnes avec un schéma de six canaux (fiche Google, Instagram, Facebook, bouche à oreille, carte de visite, salon) qui convergent vers le site. Trois motifs mesurés : le registre pastille + titre centré + texte centré était celui de toutes les autres sections de la page, le pavé blanc sur vert était le bloc le plus dense de l'accueil, et la carte verte n'était plus une rupture puisque deux sections vert forêt suivent plus bas. Deux autres pistes ont été rendues et écartées, elles restent consultables dans `src/pages/zz-variantes-importance.astro` : la fiche éditoriale (quatre rôles en `<dl>` alignés à gauche, meilleur texte mais 985 px de haut et aucune image) et la bande de nuit (scène du dimanche soir sur fond vert profond, la plus belle mais elle ajoutait une troisième section verte).
  - **Le triptyque des cartes bénéfices ne doit jamais être rejoué ici** : « On vous trouve / On vous comprend / On vous contacte » se trouve deux sections plus haut. Toute réécriture de cette section doit prendre un autre angle, sinon la page dit deux fois la même chose.
  - **Géométrie du schéma en ellipse et non en cercle** : sur un cercle régulier, les quatre pastilles latérales tombaient à 19 % du centre en vertical, or à 320 px de large le noyau et une pastille occupent ensemble 23 % de la hauteur du carré, donc « Bouche à oreille » et « Marché, salon » chevauchaient le noyau. Latérales remontées à 24 et 76 %, écartées à 14 et 86 %. Vérifié sans chevauchement ni débordement à 320, 375, 768, 940 et 1440 px. Les repères `x/y` (pourcentages) et `sx/sy` (repère SVG 400×400) de la constante `CANAUX` doivent rester d'accord, sinon les traits ne rejoignent plus les pastilles, et le titre annonce SIX endroits.
  - **Texte** : la propriété remplace « le pilier de votre présence en ligne », chaque canal est opposé à sa limite (une fiche donne une adresse, Instagram des photos, une carte un numéro, aucun ne répond à « est-ce bien lui qu'il me faut »), et la chute porte un bénéfice (« Éparpillé, on vous survole. Rassemblé, on vous choisit. ») plutôt qu'un aphorisme. L'analogie des fleurs et du jardin est abandonnée : décorative, elle ne prouvait rien.

- **03/08/2026, barème des marges, valable pour toute nouvelle page** : relevé sur 10 pages à neuf largeurs (320 à 1920), puis comparaison à webflow.com et stripe.com mesurés à 1440.
  - **Horizontal, sans exception** : `px-6 md:px-10 lg:px-20`, soit 24 / 40 / 80 px. En-tête et pied de page compris. L'en-tête était à `lg:px-16`, soit 16 px de décalage avec le contenu des sections entre 1024 et 1152 px ; le simulateur et le pied de page n'avaient pas le palier `lg:` et restaient à 40 px sur grand écran.
  - **Haut de page** : `pt-20 md:pt-24` sur toutes les pages, l'accueil excepté (hero plein écran). Le padding-top allait de 80 à 112 px en mobile et de 80 à 144 en desktop, sans raison structurelle : **le header est `sticky`, il occupe sa place dans le flux, aucune page n'a à compenser sa hauteur**. Ne pas réintroduire de `pt-28 md:pt-36`.
  - **Blanc inter-sections** : plage tenue de 88 à 160 px en mobile, 96 à 160 en desktop, conformément à l'arbitrage du 02/08. Les enchaînements titre de page vers contenu (40 à 56 px sur /realisations, /outils/diagnostic, /outils/simulateur) sont des espaces intra-bloc, pas des blancs inter-sections : ils sont volontaires.
  - **Le rythme desktop n'a pas bougé, et c'est mesuré** : webflow.com affiche 160 px de blanc inter-sections et 1282 px de contenu, stripe.com 96 px de gouttière et 1120 px de contenu. Caelestis est à 160 px et 1152 px. Seule marge d'évolution possible, non retenue faute d'enjeu : élargir le contenu de 1152 à ~1250 px rapprocherait la gouttière effective (144 px à 1440) de celle de Stripe (96 px), au prix d'une remise en cause de toutes les mises en page.
  - **Débordement corrigé sur /services** : les cartes tarifaires mesuraient 325 px dans un conteneur de 268 à 320 px de large, et leur bord droit sortait de l'écran. Cause : un item de grille conserve `min-width: auto` et refuse de descendre sous la taille min-content de son contenu, ici la barre d'adresse de la vignette en `white-space: nowrap`. Correctif en deux temps, les deux sont nécessaires : `min-width: 0` sur `.tf-card` (l'item de grille) pour autoriser le rétrécissement, et sur `.fenetre-url` pour que l'ellipsis fasse enfin son travail. **Contrôle : plus aucun élément ne dépasse la largeur du viewport sur 10 pages à 320, 390, 768 et 1440 px.**

- **02/08/2026, correctif du poseur d'espaces insécables** : `integrations/typographie-francaise.mjs` traitait les commentaires HTML comme des balises ordinaires et leur appliquait sa règle des guillemets. Les commentaires du site étant rédigés en français, une apostrophe isolée (« n'exclure », « d'écran ») ouvrait une chaîne refermée des milliers de caractères plus loin, et tout le texte compris entre les deux était recopié comme s'il était dans une balise, donc jamais corrigé. Sur l'accueil, le commentaire de la galerie s'étendait de l'octet 41621 à 48412 et emportait la section suivante. Les commentaires sont désormais recopiés tels quels jusqu'à `-->`. Mesure après correctif : **426 insécables posées sur 36 fichiers, contre 182 sur 22**, et plus aucun signe double sur espace ordinaire dans le corps de l'accueil. Cinquième piège de parseur de cette intégration, à ne pas réintroduire.

- **01/08/2026, chantiers SEO laissés ouverts** : **aucune page métier** (paysagiste, apiculteur, viticulteur, maraîcher, pépiniériste : la niche est revendiquée dans le texte mais aucun de ces mots ne porte de page), **aucune page ville** (« Valence » apparaît une seule fois sur tout le site, dans une énumération de huit villes, ce qui ne classe pas). Décision de Célestin : métas d'abord, ces pages plus tard.

- **01/08/2026, couverture métier par les études de cas** : rédiger une page par métier est impraticable, Caelestis en regroupe une cinquantaine. Solution retenue : **chaque étude de cas EST la page métier de son métier**. Le title de `realisations/[slug].astro` s'ouvre donc sur le métier, pas sur le nom du client (« Site internet de prothésiste ongulaire, Fée des Ongles »). La couverture s'étend d'elle-même à chaque livraison, sans page inventée.
  - **Conséquence pour toute nouvelle réalisation** : le champ `metier` est un mot-clé, plus une étiquette. L'écrire tel qu'un prospect le taperait (« Paysagiste », pas « Créateur d'espaces verts »), au singulier, capitalisé (le gabarit décapitalise et gère l'élision : d'apiculteur, d'éleveur, d'ébéniste, d'horticulteur).
  - **L'accroche doit porter la ville ou la région** (« à Crest », « dans la Drôme ») : elle sort du title faute de place et n'existe plus que là.
  - **Reste ouvert, non lancé** : 3 ou 4 pages par **façon de travailler** et non par métier (vendre sa production, intervenir chez le client, recevoir sur rendez-vous, accueillir sur place). Chacune couvre 10 à 15 métiers en restant précise, puisqu'elle parle d'un besoin et non d'une liste de noms. Décision de Célestin le 01/08 : plus tard, après mesure des métas.

- **07/08/2026, épuration du site, mesure avant tout arbitrage** : dix sites d'agence relevés au navigateur (hauteur de page, mots visibles, sections, libellés de bouton), puis comparaison à Caelestis. La grandeur utile n'est pas la longueur de la page mais la **densité de texte, en mots visibles pour 1 000 px de hauteur**.

  | Site | Hauteur | Mots | Densité | Nav |
  |---|---|---|---|---|
  | studiometa.fr | 9 215 px | 469 | 51 | 5 |
  | agencevauclair.com | 12 029 px | 881 | 73 | 4 |
  | digidop.com | 11 618 px | 885 | 76 | 7 à 10 |
  | tatoun.fr | 6 591 px | 1 024 | 155 | 5 |
  | **caelestis.fr avant** | **11 100 px** | **2 088** | **188** | **7** |
  | **caelestis.fr après** | **8 848 px** | **1 333** | **151** | **6** |

  Également relevés sans mesure de hauteur : ags.heinlyacademie.com (30 sections, 8 000 mots, mais **deux libellés de bouton seulement**), seriousweb.fr, aleo.agency, wedezign.fr, octaveoctave.com, studioparici.com. Médiane des dix : 13 sections, 5 entrées de navigation.

  - **Les pages des top performers sont aussi longues que la nôtre, elles portent deux à trois fois moins de texte.** Chercher à raccourcir la page est donc un faux objectif : c'est le nombre de mots par écran qu'il faut tenir. Cible de travail : rester sous 155, la valeur de Tatoun, le seul des dix qui vende aux mêmes clients (TPE, artisans).
  - **Un seul libellé de bouton par page**, l'en-tête excepté qui porte le sien partout. C'est le point commun des trois meilleurs convertisseurs du relevé. L'accueil en affichait trois pour une seule action (« Parler de mon projet », « Demander un devis », « Écrivez-nous »), /services trois également.
  - **Ce qui a été retiré** : la section « Vérifiable avant de nous croire » de l'accueil (elle redisait Réalisations, cinq blocs plus haut, avec les mêmes liens) ; les trois blocs de l'accueil qui reprenaient /services mot pour mot (référencement, fiche Google, maintenance), remplacés par une phrase et un lien ; huit questions de FAQ sur quinze, toutes traitées sur une page dédiée ; la seconde version de la méthode, qui vivait sur /services avec ses propres textes et 246 lignes de code ; le bandeau « Une question, un conseil ? » du pied de page ; l'entrée « Accueil » de la barre de navigation.
  - **Règle qui en découle, à tenir** : l'accueil **annonce** l'offre, /services la **détaille**. Toute information qui existe sur une page dédiée ne revient sur l'accueil que sous forme d'une phrase et d'un lien. Ne pas réintroduire sur l'accueil les prestations Google, le détail de la maintenance ni un second appel à l'action en fin de section.
  - **La méthode n'existe plus qu'à un seul endroit, l'accueil** (`#methode`), parce que sa version y est la meilleure : durées et rôle du client à chaque étape. `/ressources/combien-de-temps-pour-creer-un-site` y renvoie déjà. Si elle devait revenir sur /services, il faudrait alors la retirer de l'accueil, pas la dupliquer.
  - **Conséquence de rythme traitée** : la frise de méthode portait le seul fond sombre de /services, qui se retrouvait avec six sections crème à la suite. Les engagements et le suivi sont passés en lin-mousse, une section sur deux est teintée. Toute suppression de section colorée demande ce contrôle : relever `getComputedStyle(section).backgroundColor` sur toutes les sections de la page.
  - **Piège d'édition, rencontré cinq fois** : les sources portent déjà les espaces insécables (`U+00A0`) avant `? : !` et entre le nombre et le `€`. Un remplacement de chaîne écrit avec une espace ordinaire échoue silencieusement. Éditer par script en tolérant `\s`, ou copier la chaîne depuis le fichier.

- **07/08/2026, second lot d'épuration, après arbitrage de Célestin** : densité de l'accueil laissée à 151 (« s'arrêter là »), le mockup de /services remplacé, les guides et les pages de formule passés au crible, le pied de page allégé.
  - **Le premier écran de /services montre un site livré**, la page d'accueil de Fée des Ongles, avec `feedesongles.fr` dans la barre du navigateur et un lien vers l'étude de cas. Il dessinait jusque-là une miniature en HTML reprenant une **ancienne version de caelestis.fr** : « Votre site devrait vous ressembler », « Développeur web indépendant, Drôme », boutons « Lancer mon projet » et « Nos services ». Un discours périmé, sur une page de vente, à l'endroit le plus regardé. 86 lignes de balisage et 117 lignes de style en moins.
  - **Règle qui en découle** : un mockup ne dessine pas un site imaginaire, il montre un site livré. À chaque nouvelle réalisation, la capture peut être remplacée (`src/assets/images/realisations/`), en tenant la réserve de pixels : source de 1440 px pour 418 px d'affichage, `widths={[418, 836]}`.
  - **Les onze guides de /ressources sont sains, c'est mesuré** : recouvrement maximal de **6 %** entre deux guides (« un site fait-il venir des clients » et « une page Facebook suffit-elle », qui partagent une source et un champ lexical), et **au plus 1 %** entre un guide et une page de service. Aucun guide ne redit une page de vente. Ne pas les retoucher sans une mesure qui contredirait celle-ci.
  - **Les quatre pages de formule partagent 13 à 18 % de leur contenu**, ce qui est le gabarit commun (le bloc de démonstration, « Ce qui est compris », la FAQ, « Les autres formules ») et non une redite : un visiteur n'en lit qu'une. Aucun de ces quatre blocs n'est de trop, chacun répond à une question différente. Le seul geste utile est de resserrer les textes du gabarit, puisqu'ils sont payés quatre fois.
  - **Méthode de contrôle, réutilisable** : comparer les pages par groupes de quatre mots consécutifs et rapporter le nombre de groupes communs à la plus courte des deux pages. Au-delà de 10 %, deux pages disent la même chose ou partagent un gabarit ; en dessous de 6 %, elles sont distinctes. Les scripts de mesure (densité, doublons de phrases, titres partagés, similarité, liens cassés) ne sont pas versionnés, ils se réécrivent en quelques lignes.

- **07/08/2026, cinq modules posés sur les pages secondaires** : arbitrage de Célestin, le plafond de modules passe de 2-3 à **10 pour le site** (2 ou 3 par page), au motif que « c'est plus important, des modules, que des textes ». Repérage des candidates par mesure et non à l'œil : une section qui dépasse 60 mots sans une seule image, un schéma ou un tableau est plate. Relevé sur toutes les pages, il en restait douze.
  - **`/services/fiche-google-entreprise`, la fiche dessinée** : la page vendait 300 € un encadré qu'elle n'a jamais montré, quatre de ses six sections ne portaient aucun dispositif. L'encadré est tracé à la main dans la palette du site, sans logo ni couleur Google, avec cinq repères numérotés qui remplacent l'énumération et portent l'information (le dessin est `aria-hidden`). Exemple fictif, numéro de la plage ARCEP.
  - **`realisations/[slug]`, la bascule** : « Ce qu'il fallait résoudre » et « Ce qui a été construit » se lisaient l'une après l'autre, séparées par 160 px de blanc. Mises face à face autour d'un filet fléché, la correspondance se voit. Listes **non appariées ligne à ligne** (cinq besoins pour sept réponses chez Fée des Ongles) : une contrainte appelle parfois deux réponses, et un appariement strict obligerait à réécrire chaque réalisation à venir. 1 126 px avant, 790 après.
  - **`/services/referencement-naturel`, le portique** : cinq fûts au trait sous un linteau, le fût du bloc sélectionné s'allume avec lui. La section s'appelait « Les 5 piliers » et empilait ses cinq blocs à la verticale, soit l'inverse du mot. Lin-mousse et non sauge pour l'état actif, la sauge plafonne à 4,34:1 sur le vert forêt.
  - **Page régionale, le territoire à l'échelle du temps de route** : Crest au centre, chaque ville dans sa direction réelle, un anneau par heure. **Ce n'est pas une carte géographique**, les contours ne sont pas tracés ; seules la direction et la durée sont vraies. Les villes et les durées sont reprises en clair dessous, c'est ce qu'indexe Google. Le schéma répond aussi à l'objection de la distance, dont la section a été supprimée. Piège : Chambéry et Annecy partagent presque l'azimut depuis Crest, leurs étiquettes se recouvraient, d'où le champ `pos` qui oriente chaque étiquette.
  - **`/maintenance`, la ligne de partage** : la section annonçait « deux choses bien distinctes » et les donnait à voir pareilles, deux cartes arrondies jumelles. Le partage passe au fond (teinté à gauche pour l'abonnement, crème à droite pour le devis) et à un filet. Chaque colonne porte sa liste, puce pleine pour l'acquis, puce en creux pour ce qui reste à demander.
  - **Contrôle après pose, à refaire pour tout module** : zéro débordement à 375 et 1280 px, zéro chevauchement d'étiquettes, zéro tiret cadratin, point médian ou italique dans le rendu. Deux manquements trouvés à cette occasion et corrigés : le point médian de « 4,8 · 62 avis » dans la fiche, et le tiret cadratin qui marquait « non compris » dans le tableau comparatif de la maintenance, remplacé par un trait fin en SVG.

- **07/08/2026, les douze modules du site, et les deux refusés** : le plafond de modules est passé de 2-3 à 10 par site (arbitrage de Célestin, « c'est plus important, des modules, que des textes »), puis à douze après réexamen. Le plafond par page reste à deux ou trois.

  | Page | Module | Ce qu'il montre que le texte ne montrait pas |
  |---|---|---|
  | `/services/fiche-google-entreprise` | La fiche dessinée | L'encadré Google que la page vendait 300 € sans jamais l'afficher |
  | `/services/fiche-google-entreprise` | Le mockup du hero | Un site livré (Fée des Ongles) au lieu d'une maquette dessinée |
  | `realisations/[slug]` | La bascule | Que « ce qui a été construit » répond à « ce qu'il fallait résoudre » |
  | `/services/referencement-naturel` | Le portique | Cinq piliers, quand la section les empilait à la verticale |
  | `/creation-site-internet-auvergne-rhone-alpes` | Le périmètre | Direction et temps de route réels depuis Crest |
  | `/creation-site-internet-auvergne-rhone-alpes` | Les quatre gestes | Quatorze métiers qui se noyaient dans une phrase |
  | `/maintenance` | La ligne de partage | Que l'abonnement et le devis sont deux choses, pas deux cartes jumelles |
  | `/outils/diagnostic` | La planche des huit familles | La grille de notation, jauges comprises |
  | `/services/site-une-page` | L'élévation | L'empilement des sections d'une page |
  | `/services/site-vitrine` | Le plan du site | Qu'aucune page n'est à plus d'un clic de l'accueil |
  | `/services/boutique-en-ligne` | Le tunnel | Les cinq endroits où une vente se perd |
  | `/services/site-sur-mesure` | Le socle et les greffes | Que le sur-mesure est le socle commun plus ce que le métier réclame |
  | `/a-propos` | Le feuillet de devis | Que les quatre engagements sont des clauses, pas des intentions |

  - **Deux sections ont été examinées puis refusées** : « Simple, et vous gardez la main » sur la fiche Google, et « Un travail de fond » sur le référencement. Les deux pages portent déjà leur module fort, et ces sections ont trois puces numérotées qui font le travail. **Un module de plus y aurait empilé sans clarifier.** Le refus est aussi une décision : ne pas le rouvrir sans motif nouveau.
  - **Règle des dessins honnêtes**, tenue partout : la jauge du diagnostic reste vide (une note avant analyse serait un décor mensonger), le feuillet de devis ne porte ni montant ni date (un document chiffré serait fabriqué), le rétrécissement du tunnel est une figure et non un taux, le schéma du périmètre ne trace aucun contour départemental puisque seules la direction et la durée sont vraies.
  - **Piège du serveur de développement** : Astro en dev a servi un CSS périmé pour un second bloc `<style>` ajouté après coup, alors que `npm run build` le compilait correctement. Un module peut donc paraître cassé en local et être juste. Fusionner les blocs `<style>` d'une page, et vérifier sur un serveur relancé avant de conclure à un défaut.
  - **Contrôle après pose d'un module**, à refaire à chaque fois : aucun débordement à 375 et 1280 px, aucun chevauchement d'étiquettes, aucun libellé coupé en deux, et le grep des interdits sur le rendu (tiret cadratin, point médian, italique).

- **07/08/2026, un seul questionnaire, envoyé à la main** : le questionnaire de devis est supprimé, avec ses quatre points d'entrée (bouton du simulateur, deux liens dans les e-mails de `api/contact.ts`, endpoint `api/devis.ts`). Motif mesuré : il reposait **treize des questions déjà posées par le simulateur** (type de site, nombre de pages, produits, contenus, fiche Google, délai). Un prospect qui faisait les deux répondait deux fois. Le simulateur et `/contact#devis` tiennent seuls le rôle d'avant-vente.
  - **Le questionnaire client reste, ramené de 57 champs à 10** (dont 54 cases à cocher supprimées). Ce qui est parti et pourquoi : les neuf « valeurs » à cocher (tout le monde coche tout, rien n'en sort qui oriente une décision, remplacées par une question ouverte sur ce qui distingue le client) ; les six statuts juridiques et le numéro de TVA (le SIRET seul suffit, l'API `recherche-entreprises` rend le reste) ; les sept cases « contenu fourni » (doublon de la zone d'envoi de fichiers du même formulaire) ; les sept cases de réseaux sociaux (la zone de texte demandait déjà les liens) ; le bloc boutique (cela se décide au cadrage).
  - **La page est orpheline et le reste** : aucun lien depuis le site, absente du sitemap, `noindex`. Elle s'envoie à la main au client dont le devis est signé. Ne pas y ajouter de lien depuis une page publique.
  - **`api/brief.ts` suit le formulaire** : e-mail administrateur, récapitulatif client et document Word passent de sept blocs à cinq. Toute suppression de champ dans le formulaire demande la même coupe ici, sinon chaque envoi produit des lignes « non précisé ». La clé de sauvegarde locale est passée en `caelestis_creation_v3` : restaurer un brouillon v1 ou v2 remplirait des champs qui n'existent plus.
  - **Piège du serveur de développement, rencontré trois fois dans la journée** : Astro en dev a servi un CSS périmé pour des règles pourtant présentes dans le build. Un module peut donc paraître cassé en local et être juste. Vérifier dans `.vercel/output/static/_astro/*.css` avant de conclure à un défaut, et se méfier des mesures de style faites au navigateur quand le panneau n'est pas affiché : sans compositing, `getComputedStyle` renvoie des valeurs figées que même un style en ligne ne fait pas bouger.

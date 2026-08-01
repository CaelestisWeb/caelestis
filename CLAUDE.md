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

Grille relevée dans le code réel (source de vérité vivante) le 31/07/2026, cohérente sur toutes les pages : services, métas, simulateur, guide `/ressources/tarifs`. Les anciens montants 500/800/1 200/2 500 € étaient périmés. Maintenance en abonnement dès 7,99 €/mois.

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
  - **Pages offre** : le prix entre dans le title (dès 1 000, 2 000, 2 500, 3 500 €, 7,99 €/mois). Il trie les visiteurs avant le clic.
  - **Zone géographique** : arbitrage de Célestin, priorité à la région, pas à la ville. Aucune page ville n'est ouverte.
- **01/08/2026, gabarits de métadonnées** : title ≤ 60 signes, description ≤ 155, et l'argument décisif (prix, délai, garantie) placé **avant le 120e signe**, car c'est là que Google coupe en mobile. Onze descriptions dépassaient et perdaient leur argument. Le gabarit des études de cas (`realisations/[slug].astro`) visait 165, ramené à 155.
  - **Piège typographique** : dans les **métas**, le site pose une espace insécable **uniquement** entre le nombre et le €. Dans le **contenu**, il en pose aussi avant `?` `:` `!`. Un remplacement de chaîne qui ignore cette différence échoue silencieusement.
  - **Contrôle** : `npm run build` puis relevé sur `.vercel/output/static/**/*.html`, jamais sur les sources. C'est ce que reçoit Google.
- **01/08/2026, chantiers SEO laissés ouverts** : **aucune page métier** (paysagiste, apiculteur, viticulteur, maraîcher, pépiniériste : la niche est revendiquée dans le texte mais aucun de ces mots ne porte de page), **aucune page ville** (« Valence » apparaît une seule fois sur tout le site, dans une énumération de huit villes, ce qui ne classe pas). Décision de Célestin : métas d'abord, ces pages plus tard.

- **01/08/2026, couverture métier par les études de cas** : rédiger une page par métier est impraticable, Caelestis en regroupe une cinquantaine. Solution retenue : **chaque étude de cas EST la page métier de son métier**. Le title de `realisations/[slug].astro` s'ouvre donc sur le métier, pas sur le nom du client (« Site internet de prothésiste ongulaire, Fée des Ongles »). La couverture s'étend d'elle-même à chaque livraison, sans page inventée.
  - **Conséquence pour toute nouvelle réalisation** : le champ `metier` est un mot-clé, plus une étiquette. L'écrire tel qu'un prospect le taperait (« Paysagiste », pas « Créateur d'espaces verts »), au singulier, capitalisé (le gabarit décapitalise et gère l'élision : d'apiculteur, d'éleveur, d'ébéniste, d'horticulteur).
  - **L'accroche doit porter la ville ou la région** (« à Crest », « dans la Drôme ») : elle sort du title faute de place et n'existe plus que là.
  - **Reste ouvert, non lancé** : 3 ou 4 pages par **façon de travailler** et non par métier (vendre sa production, intervenir chez le client, recevoir sur rendez-vous, accueillir sur place). Chacune couvre 10 à 15 métiers en restant précise, puisqu'elle parle d'un besoin et non d'une liste de noms. Décision de Célestin le 01/08 : plus tard, après mesure des métas.

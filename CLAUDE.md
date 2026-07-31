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

**Typographies** : `Lora` (serif, display/titres) + `DM Sans Variable` (corps). Auto-hébergées.

| Variable | Hex | Usage |
|---|---|---|
| `--color-cream` | `#EDE3D4` | fond principal chaleureux |
| `--color-cream-dark` | `#CFC0A0` | séparateurs organiques |
| `--color-ocre` | `#4C3D19` | boutons, actions (café) |
| `--color-ocre-dark` | `#362A10` | hover premium |
| `--color-golden` | `#CFBB99` | highlights |
| `--color-brun` | `#3d4f28` | texte, sections sombres (vert forêt) |
| `--color-brun-mid` | `#6B6040` | texte secondaire |
| `--color-sauge` | `#889063` | bordures, accents décoratifs (PAS de texte sur fond clair) |
| `--color-sauge-text` | `#5C6A40` | textes sauge sur fond clair (WCAG AA 4.6:1) |
| `--color-sauge-pale` | `#D8CDB0` | fonds de sections douces |
| `--color-pierre` | `#8A8470` | gris-beige naturel |
| `--color-encre` | `#2A1E0C` | profondeur absolue |

Règle accessibilité en place : les labels eyebrow `.text-sauge` sont forcés à `#5C6440` sur fond clair, sauge clair conservé sur `.bg-brun`.

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

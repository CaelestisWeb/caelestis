# CLAUDE.md — Site caelestis.fr (production)

> Doc du site vitrine de l'agence Caelestis. Déplacée ici depuis le CLAUDE.md global (juillet 2026) et mise à jour d'après le code réel.

## Contexte

**Caelestis** : agence de création de sites internet + référencement naturel (SEO), basée dans la Drôme (Auvergne-Rhône-Alpes). Fondateur : Célestin.
**Cible** : artisans, producteurs et indépendants, niche nature/environnement (paysagistes, agriculture, éco-construction, bureaux d'études, énergies renouvelables, associations).
**Positionnement copy** : « Valorisez votre activité avec votre site web. » · « Une présence en ligne à la hauteur de votre travail. »

## Offres et coordonnées (source de vérité)

| Offre | Tarif |
|---|---|
| Site une page | dès 500 € |
| Site vitrine | dès 800 € |
| Boutique en ligne | dès 1 200 € |
| Sur mesure | dès 2 500 € |

Réponse sous 48h · Devis gratuit · Livraison 2 à 6 semaines.
Email : caelestis-pro@hotmail.com (envois : contact@caelestis.fr) · Tél : 07 69 36 27 27 · Du lundi au vendredi, 9h à 18h.

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

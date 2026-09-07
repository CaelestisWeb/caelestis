# Indexation Google, relevé et actions du 7 septembre 2026

Source : Search Console, propriété domaine `sc-domain:caelestis.fr`, compte
contact@caelestis.fr. Données Google arrêtées au 04/09/2026. Chaque URL du rapport a été
relevée une par une, puis vérifiée en production (code HTTP, en-tête `X-Robots-Tag`,
présence dans le sitemap, maillage interne).

---

## Verdict

25 pages dans l'index, 22 hors index. Sur ces 22, quinze relèvent d'un comportement voulu ou
d'une information périmée. Le sujet réel tient en 7 pages que Google connaît et n'a jamais
explorées.

La technique reste saine : aucune erreur serveur, aucune boucle de redirection, aucune page
orpheline, sitemap complet avec ses 28 dates de modification.

---

## 1. Les 22 URL hors index, motif par motif

| Motif | Nb | Lecture |
|---|---|---|
| Page avec redirection | 8 | Comportement voulu |
| Exclue par la balise "noindex" | 3 | Comportement voulu |
| Introuvable (404) | 2 | Traitement correct, pages réellement supprimées |
| Bloquée par le fichier robots.txt | 1 | Information périmée, corrigée le 17/08 |
| Détectée, actuellement non indexée | 7 | **Le sujet réel** |
| Explorée, actuellement non indexée | 1 | `favicon.ico`, sans objet |

### 1.1 Les 8 redirections

`http://caelestis.fr/`, `http://www.caelestis.fr/`, `https://www.caelestis.fr/services`,
`https://www.caelestis.fr/a-propos`, `https://www.caelestis.fr/a-propos/`,
`https://caelestis.fr/a-propos/` : normalisation http vers https, www vers apex, barre finale
retirée. C'est exactement ce que la configuration prévoit.

`https://caelestis.fr/referencement-naturel` et `https://caelestis.fr/services/referencement-seo`
renvoient toutes deux en 301 vers `https://caelestis.fr/services/referencement-naturel`. Ce sont
les deux redirections d'anciennes URL portées par `src/pages/referencement-naturel.ts` et
`src/pages/services/referencement-seo.ts`. Vérifié le 07/09 : les deux répondent bien en 301.

### 1.2 Les 3 pages en noindex

`/cgv` et `/politique-confidentialite` (comptée deux fois, apex et www). Le `X-Robots-Tag:
noindex, nofollow` vient de `vercel.json`, la ligne 126. Elles sont volontairement crawlables
pour que la consigne soit lue, et volontairement hors sitemap.

### 1.3 Les 2 pages en 404

- `https://www.caelestis.fr/blog`, reliquat de l'ancienne communauté WoW qui occupait le
  domaine. Dernier passage de Google le 26/07.
- `https://caelestis.fr/demos/atelier-nera`, ancienne démo de prospection, aujourd'hui hébergée
  sur `apercus.caelestis.fr`. Dernier passage le 10/06.

Les deux restent en 404, conformément à ce que tranche l'audit du 21/08 : rediriger un contenu
supprimé vers une page d'agence produirait des soft 404.

### 1.4 Le blocage robots.txt, périmé

`https://caelestis.fr/mentions-legales`, dernier passage de Google le 2 juin. Vérifié le 07/09 :
la page répond en 200 avec `X-Robots-Tag: noindex, nofollow`, et le `robots.txt` en production
autorise explicitement son exploration depuis la correction du 17/08.

Action faite le 07/09 : validation de la correction lancée dans Search Console. État
« commencé », Google va repasser et sortir cette URL du motif.

---

## 2. Le sujet réel : 7 pages découvertes et jamais explorées

| URL | Découverte | Dernière exploration |
|---|---|---|
| `/maintenance` | 30/05/2026 | Sans objet |
| `/outils/simulateur` | 30/05/2026 | Sans objet |
| `/ressources/anatomie-d-un-site-qui-convertit` | 30/05/2026 | Sans objet |
| `/ressources/combien-de-temps-pour-creer-un-site` | 30/05/2026 | Sans objet |
| `/ressources/etre-trouve-par-chatgpt` | 30/05/2026 | Sans objet |
| `/ressources/site-vitrine-ou-boutique-en-ligne` | 30/05/2026 | Sans objet |
| `/ressources/tarifs` | 30/05/2026 | Sans objet |

« Sans objet » en dernière exploration veut dire que Google connaît l'adresse depuis plus de
trois mois et n'est jamais venu lire la page.

Ce qui a été vérifié sur ces 7 URL :

- code 200 en production ;
- présentes dans `sitemap-0.xml`, avec leur `lastmod` ;
- aucune consigne `noindex`, ni en balise ni en en-tête ;
- maillage interne réel : les onze guides sont tous listés sur `/ressources`,
  `/outils/simulateur` reçoit des liens de l'en-tête, du pied de page, de `/services` et de deux
  guides, `/maintenance` reçoit des liens de la page d'accueil, de `/services` et des quatre
  pages d'offre.

Rien ne distingue ces cinq guides des six autres guides du même dossier, qui sont indexés :
même gabarit, mêmes dates de modification (1er et 8 août). C'est donc un arbitrage de crawl de
Google sur un domaine jeune et peu cité, et non un défaut du site.

**Action faite le 07/09** : demande d'indexation déposée pour les 7 URL, une par une, via
l'inspection d'URL. Confirmation « Indexation demandée » obtenue sur chacune. Elles entrent dans
une file d'exploration prioritaire, comptez quelques jours à deux semaines.

Note relevée au passage : à l'inspection en direct, `/ressources/anatomie-d-un-site-qui-convertit`
remonte « Google ne reconnaît pas cette URL » là où le rapport la classe en « Détectée ». Les deux
états disent la même chose, la page n'a jamais été lue.

---

## 3. Ce qui est déjà réglé depuis l'audit du 21/08

Vérifié en production le 07/09 :

- sitemap : 28 `lastmod` sur 28 URL, zéro `changefreq`, zéro `priority` ;
- title de `/ressources/tarifs` : « Prix d'un site internet pour un artisan en 2026, Caelestis »,
  le mot « artisan » et l'année y sont ;
- fil d'Ariane visible : présent sur les pages internes.

---

## 4. La suite

La demande d'indexation force le passage de Google. Elle ne crée pas de raison d'indexer sur la
durée. Le levier de fond reste celui de `PLAN-AUTORITE-HORS-SITE.md` : gagner des domaines
référents, à commencer par le lien crédit sur chaque site client livré.

À contrôler dans une semaine, puis dans trois : le compte « Dans l'index » et la colonne
« Dernière exploration » des 7 URL. Une page passée de « Sans objet » à une date réelle veut dire
que la demande a porté.

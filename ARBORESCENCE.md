# Arborescence de caelestis.fr

Analyse du 29 juillet 2026, page par page et section par section, avec la structure cible et le plan pour y aller.

Sources : relevé factuel de la navigation d'Eskimoz, Junto et 1min30 (trois agences françaises de référence), plus le référentiel `C:\dev\seo-geo-reference.md` et les mémoires de conversion.

---

## 1. Ce que font réellement les meilleures agences

Relevé sur leurs pages d'accueil, pas sur ce qu'elles racontent d'elles-mêmes.

**Eskimoz**, structure à plat, une page par expertise nommée comme la requête cible : `/agence-seo`, `/agence-sea`, `/agence-geo`, `/agence-cro`, `/agence-social-ads`, `/agence-data-marketing`. Plus `/blog`, `/references`, `/contact`.

**Junto**, silo explicite : `/services/agence-ads`, `/services/agence-seo`, `/services/agence-web-analytics`, `/services/crm`, `/services/ia`, `/services/lead-gen`. Plus `/references`, `/a-propos`, `/contact`. Le maillage est massif : 46 liens vers la page Ads depuis la seule page d'accueil.

**1min30**, mixte, avec un espace de contenu très développé : `/le-blog`, `/centre-de-ressources`, `/webinaires`, `/formation`, `/references-1min30`, `/agence`.

**Les quatre constantes, sans exception :**

1. **Une page par expertise**, jamais une seule page fourre-tout. C'est la règle la plus universelle et c'est exactement celle que nous ne respectons pas.
2. **L'intention de recherche dans l'URL**, formulée comme le prospect la tape.
3. **Une page de références** séparée, avec des cas détaillés.
4. **Un espace de contenu** (blog, ressources, guides). Aucune des trois n'en est dépourvue.

---

## 2. Diagnostic de l'existant

### 2.1 Le défaut majeur : trois offres sur quatre n'existent pas comme pages

| Offre | Prix | État actuel |
|---|---|---|
| Site une page | 999 € | Page dédiée `/site-une-page` |
| Site vitrine | 1 499 € | **Ancre `#site-vitrine` dans `/services`** |
| Boutique en ligne | 2 499 € | **Ancre `#boutique-en-ligne` dans `/services`** |
| Site sur mesure | 3 499 € | **Ancre `#site-sur-mesure` dans `/services`** |

Une ancre n'est pas une page. Elle n'a pas de `title`, pas de `meta description`, pas de balisage propre, elle ne peut pas se positionner sur « créer une boutique en ligne » ni être citée par une IA sur cette requête. Les trois offres les plus chères du catalogue, celles qui représentent 1 499 à 3 499 €, sont invisibles.

C'est le point qui coûte le plus cher aujourd'hui, et de loin.

### 2.2 Aucune preuve sociale sur la page d'accueil

Zéro témoignage, deux mentions du mot « avis ». Or le pilier 7 des douze piliers de conversion, celui des tiers de confiance, est vide au moment exact où le visiteur décide. Le site vend de la crédibilité et n'en montre aucune.

### 2.3 Aucun espace de contenu

Pas de blog, pas de guides, pas de ressources. C'est le carburant du GEO : les FAQ et les guides sont ce que les moteurs IA citent le plus volontiers. Les trois agences relevées en ont toutes un. Nous n'avons rien.

Trace de l'ancien site WordPress : `/category`, `/tag`, `/author`, `/feed`, `/comments` existent encore comme endpoints qui renvoient 410. Il y avait donc un blog, il a disparu.

### 2.4 Le silo n'existe pas

`/services` chapeaute censément les offres, mais `/site-une-page`, `/referencement-naturel` et `/fiche-google-entreprise` sont à la racine, au même niveau. Rien dans l'URL n'indique la hiérarchie. Pour un moteur comme pour un LLM, ce sont sept pages sans relation entre elles.

Détail révélateur : l'ancienne URL `/services/referencement-seo` est encore redirigée dans le code. L'ancien site siloait déjà mieux que le nouveau.

### 2.5 Maillage interne famélique

Un seul lien par page depuis l'accueil, sauf `/contact` (3) et `/simulateur` (2). Junto en pose 46 vers sa page principale. Les liens en plein contenu sont le levier le plus puissant du référencement interne, et nous n'en avons quasiment aucun.

### 2.6 `/diagnostic` est orpheline

Zéro lien depuis l'accueil, absente du menu. Un outil gratuit qui capte des prospects, invisible.

### 2.7 `/a-propos` est trop mince

140 lignes, un seul titre, aucun sous-titre. C'est pourtant la page qui porte l'E-E-A-T : qui vous êtes, pourquoi vous êtes légitime. Les moteurs IA valorisent fortement l'auteur identifié.

### 2.8 Le hero promet dans le vide

« Valorisez votre activité avec votre site web » est exactement le type de promesse vague que les douze piliers bannissent. Elle pourrait figurer sur le site de n'importe quelle agence de France.

### 2.9 Ce qui va bien, et qu'il ne faut pas casser

L'ordre des sections de l'accueil est juste : hero, pour qui, transition, comparateur avant/après, réalisations, services, engagement, méthode, FAQ, appel final. Le parcours découverte, compréhension, confiance, décision est respecté. La méthode détaillée avec durées et rôle du client est un actif rare, la plupart des agences n'en ont pas. Le balisage est déjà excellent (18 types Schema.org). La recherche interne et le simulateur dans le menu sont de bonnes idées.

**Je ne propose donc aucun bouleversement de l'accueil.** Le problème n'est pas l'ordre des blocs, il est dans ce qui manque et dans l'arborescence.

---

## 3. L'arborescence cible

```
/                                             Accueil
│
├── /services/                                Chapeau : 4 offres de site + 3 leviers de visibilité
│   ├── /services/site-une-page/              999 €        (existe, à déplacer)
│   ├── /services/site-vitrine/               1 499 €      À CRÉER
│   ├── /services/boutique-en-ligne/          2 499 €      À CRÉER
│   ├── /services/site-sur-mesure/            3 499 €      À CRÉER
│   ├── /services/referencement-naturel/                   (existe, à déplacer)
│   ├── /services/fiche-google-entreprise/                 (existe, à déplacer)
│   └── /services/maintenance/                             (existe, à sortir du noindex)
│
├── /realisations/                            Preuve
│   ├── /realisations/fee-des-ongles/
│   └── /realisations/la-coquette/
│
├── /ressources/                              Carburant GEO           À CRÉER
│   └── /ressources/<guide>/
│
├── /outils/                                  Aimants à prospects     À CRÉER
│   ├── /outils/simulateur/                   (existe, à déplacer)
│   └── /outils/diagnostic/                   (existe, à déplacer)
│
├── /creation-site-internet-auvergne-rhone-alpes/          (existe, à garder tel quel)
├── /a-propos/                                À enrichir
└── /contact/
```

**Trois clics maximum depuis l'accueil, respecté partout.**

### Pourquoi le silo `/services/` plutôt que le modèle à plat d'Eskimoz

Eskimoz garde tout à plat et domine, c'est vrai. Mais Eskimoz a une autorité de domaine qu'aucun de nous n'a, et une seule ligne de métier déclinée en canaux. Nous avons deux familles distinctes (fabriquer un site, être trouvé) et sept pages qui doivent se soutenir mutuellement plutôt que se concurrencer. Le silo explicite est le bon choix quand le domaine est jeune, et il permet d'ajouter des offres sans réinventer la structure.

**Le moment est le bon.** Le site est indexé mais peu classé : déplacer des URL coûte peu aujourd'hui, et coûtera cher dans un an.

### Sur les pages par ville, la réponse est non pour l'instant

La tentation serait de créer `/creation-site-internet-crest`, `/valence`, `/romans`. **À ne pas faire tant qu'il n'y a pas de contenu réel par ville.** Des pages villes clonées avec le nom changé sont des pages satellites, détectées et pénalisées.

La bonne méthode, déjà appliquée : une page par réalisation, avec la commune dans le contenu et le titre. Deux réalisations aujourd'hui, à Crest et Saint-Paul-lès-Romans. Quand il y aura deux ou trois clients dans une même ville, la page ville deviendra légitime parce qu'elle aura de quoi se remplir.

---

## 4. Déplacements de sections, seulement ceux qui se justifient

### À ajouter sur l'accueil : les avis Google

Bloc note et extraits d'avis réels, avec lien vers la fiche, **placé juste au-dessus du dernier appel à l'action**, et un second rappel plus haut, après la section Réalisations. La règle est de multiplier les preuves, jamais de les poser en un seul exemplaire.

### À dédoublonner : la méthode

Elle est détaillée sur l'accueil (« Un site construit ensemble ») et reprise sur `/services` (« Comment se déroule un projet ? »). Deux versions du même contenu se cannibalisent.

Décision : la version complète, avec durées et rôle du client, reste sur l'accueil, qui est la page la plus visitée. Sur `/services`, quatre étapes résumées et un lien vers l'accueil.

### À requalifier : « Pourquoi moi »

La section s'intitule « Pourquoi moi » mais parle des 2 % reversés à la nature. C'est un engagement sincère et différenciant, ce n'est pas une réponse à « pourquoi vous plutôt qu'un autre ».

Décision : garder l'engagement, le renommer pour ce qu'il est, et ajouter au-dessus trois raisons concrètes de choisir Caelestis (délai annoncé et tenu, propriété du site, interlocuteur unique). L'engagement écologique gagne à venir après, en signature, pas en argument principal.

### À relier : le diagnostic

Ajouter un bloc court sur l'accueil, entre le comparateur et les réalisations : « votre site actuel tient-il la route », avec le lien vers l'outil. Et l'ajouter au menu sous une entrée Outils.

### À laisser tel quel

Hero, pour qui, transition éditoriale, comparateur avant/après, réalisations, services, FAQ, appel final. L'ordre est bon, ne pas y toucher.

Seule correction sur le hero, qui ne relève pas de la structure : remplacer la promesse vague par ce que le site produit concrètement.

---

## 5. Plan d'exécution, par rendement décroissant

> **Étapes 1 et 3 réalisées et déployées le 29 juillet 2026 au soir** (commit `8cefc5a`). La refonte des tarifs menée en parallèle par une autre session a été attendue puis reprise telle quelle : `/services` reste la page de comparaison des quatre formules, chaque page d'offre traite une intention de recherche distincte. C'est le modèle Junto.
>
> Vérifié en production : les six pages du silo répondent en 200, et les quatre anciennes URL redirigent en 301 directement vers leur destination finale, sans chaîne.
>
> **Restent les étapes 2, 4, 5 et 6** : preuve sociale sur l'accueil, `/ressources/`, regroupement des outils et enrichissement de `/a-propos`, densification du maillage.

**Étape 1, la plus rentable : les trois pages d'offre manquantes.**
`/services/site-vitrine`, `/services/boutique-en-ligne`, `/services/site-sur-mesure`. Même gabarit que `/site-une-page`, qui fonctionne déjà. Chacune avec son prix, sa FAQ propre, ses cas d'usage, son balisage `Service` et `Offer`. C'est la seule étape qui débloque un chiffre d'affaires aujourd'hui invisible.

**Étape 2 : la preuve sociale sur l'accueil.**
Récupérer les avis Google réels de Caelestis, les afficher en texte dans le HTML, pas en widget. Sans avis, se rabattre sur les deux témoignages clients existants, en demandant l'autorisation.

**Étape 3 : le silo.**
Déplacer les pages sous `/services/`, avec redirections 301. Le projet a déjà `utils/moved.ts`, l'outillage existe. **Point de vigilance : `/services/referencement-seo` redirige aujourd'hui vers `/referencement-naturel`. Le faire pointer directement vers `/services/referencement-naturel`**, sinon on crée une chaîne de redirections, qui dilue et ralentit.

**Étape 4 : `/ressources/`.**
Cinq à huit guides répondant aux vraies questions des prospects, écrits en chunks autonomes, avec `FAQPage`. C'est ce qui fera citer Caelestis par ChatGPT. Sujets qui viennent naturellement : combien coûte un site pour un artisan, faut-il un site quand on a déjà Facebook, à quoi sert la fiche Google, combien de temps prend un projet, que se passe-t-il si on change d'avis.

**Étape 5 : `/outils/` et l'enrichissement de `/a-propos`.**
Regrouper simulateur et diagnostic. Étoffer la page à propos : parcours, méthode de travail, photo, ce en quoi vous croyez. C'est la page que les moteurs IA lisent pour décider si vous êtes légitime.

**Étape 6 : le maillage.**
Chaque page d'offre cite en plein texte deux ou trois autres pages avec des ancres descriptives. L'accueil pose plusieurs liens vers chaque offre, pas un seul.

---

## 6. Ce qui ne doit pas être fait

- Créer les pages villes avant d'avoir de la matière réelle par ville.
- Déplacer les URL sans redirection 301, ou en créant des chaînes de redirections.
- Multiplier les pages d'offre au-delà des quatre réelles : un catalogue dilue, c'est le pilier 3.
- Remplir `/ressources/` de contenu générique produit à la chaîne. Cinq guides utiles valent mieux que trente pages creuses.
- Toucher à l'ordre des sections de l'accueil, qui est juste.

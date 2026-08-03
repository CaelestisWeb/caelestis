# Fiche Google Business Profile, contenu à coller

Document de travail interne. Rédigé le 03/08/2026, tarifs lus dans `src/utils/tarifs.ts`.
Les coordonnées reprennent à l'identique le schema Organization de `src/pages/index.astro`,
pour que Google lise la même information sur la fiche et sur le site.

---

## 0. Deux réglages à régler AVANT le contenu

Remplir une fiche mal localisée ne sert à rien : elle ne sortira sur aucune recherche locale.

**a. La localisation.** Le repère de la mini carte apparaît en plein océan Atlantique.
Ouvrir « Éditer la fiche », onglet « Localisation » :

- Si une adresse figure et que le repère est mal placé, le faire glisser sur Crest.
- Si aucune adresse ne figure, déclarer la fiche en « zone desservie », puis renseigner
  les zones de la section 6. Une fiche sans adresse ET sans zone n'est rattachée à rien.

**Recommandation : zone desservie, sans adresse publique.** L'activité ne reçoit pas de
clients dans un local. Google demande alors une adresse pour la validation, puis la masque.
C'est aussi ce que fait le site, dont le schema ne porte aucun numéro de rue.

**b. La visibilité.** Depuis un navigateur non connecté, la fiche ne ressort ni sur
« Caelestis Crest 26400 », ni sur Google Maps. Vérifier dans la fiche qu'aucun bandeau
d'établissement en attente de validation ou suspendu n'est affiché.

---

## 1. Nom

```
Caelestis
```

**Ne rien ajouter.** Pas de « création de site internet », pas de « Drôme ». Les mots clés
dans le nom sont contraires aux règles de Google et exposent la fiche à une suspension.
Le positionnement passe par la catégorie, la description et les services.

---

## 2. Catégories

**Catégorie principale**, à conserver telle quelle :

```
Concepteur de sites Web
```

**Catégories secondaires**, à ajouter dans cet ordre. Taper les premiers mots et choisir
dans la liste proposée par Google, les libellés exacts varient :

```
Service de marketing Internet
Consultant en marketing
Graphiste
Agence de publicité
```

La catégorie principale pèse le plus lourd dans le classement local. Ne pas la changer.

---

## 3. Description

750 caractères autorisés. Le texte ci-dessous en fait 688, marge comprise : certains
éditeurs comptent les sauts de ligne, mieux vaut ne pas frôler la limite.

```
Caelestis crée des sites internet sur mesure pour les artisans, les producteurs, les paysagistes et les indépendants de la Drôme et d'Auvergne-Rhône-Alpes.

Chaque site est conçu à la main, sans modèle réutilisé : votre métier, vos photos, vos mots. Il se charge vite, se lit sur téléphone et il est construit pour être trouvé sur Google.

Quatre formules selon le besoin : une seule page pour démarrer, un site vitrine pour présenter votre activité, une boutique pour vendre en ligne, un site sur mesure pour aller plus loin. Le référencement naturel est compris dès la mise en ligne.

Fondée par Célestin Fruleux, développeur web installé à Crest. Devis gratuit, réponse sous 48 heures.
```

---

## 4. Services et prix

À saisir dans « Éditer services ». Le prix se renseigne en « à partir de ».

Ces montants corrigent une information périmée qui circule : l'aperçu IA de Google annonce
aujourd'hui « à partir de 600 € » en citant Pages Jaunes. Un prospect arrive donc avec un
budget faux en tête.

| Service | Prix | Description (300 caractères max) |
|---|---|---|
| Création de site une page | 1 000 € | L'essentiel de votre activité sur une seule page qui défile. La formule la plus rapide à livrer, visible sur Google dès la mise en ligne. |
| Création de site vitrine | 2 000 € | Plusieurs pages pour présenter votre activité, vos services et vos réalisations. Formulaire de contact et coordonnées partout, bases du référencement en place. |
| Création de boutique en ligne | 2 500 € | Vendez vos produits depuis votre site. Catalogue en ligne, paiement sécurisé pour vos clients, commandes simples à suivre au quotidien. |
| Création de site sur mesure | 3 500 € | Un site entièrement adapté à votre projet : davantage de pages, des fonctionnalités propres à votre métier et un travail de référencement approfondi. |
| Référencement naturel | sur devis | Travail SEO pour être trouvé sur les recherches de votre métier et de votre secteur. Compris dans la création, disponible seul pour un site existant. |
| Création de fiche Google | 300 € | Création complète de votre fiche d'établissement : validation, catégories, description, services, photos et horaires. Comprise dans la formule sur mesure. |
| Refonte de fiche Google | 200 € | Reprise d'une fiche existante mal renseignée : catégories, description, services, photos, cohérence avec votre site. |
| Refonte de site internet | sur devis | Reconstruction d'un site vieillissant ou lent, en gardant ce qui fonctionne et en corrigeant ce qui freine vos visiteurs. |
| Maintenance de site | à partir de 9,99 €/mois | Hébergement, nom de domaine, certificat, sauvegardes, mises à jour de sécurité et veille des liens cassés. Offerte les trois premiers mois. |

---

## 5. Horaires

```
Lundi     09:00 à 18:00
Mardi     09:00 à 18:00
Mercredi  09:00 à 18:00
Jeudi     09:00 à 18:00
Vendredi  09:00 à 18:00
Samedi    09:00 à 18:00
Dimanche  Fermé
```

Ce sont les horaires du site. Pages Jaunes annonce 9h à 17h, ce qui contredit le site :
corriger aussi là bas, c'est la source que Google recopie aujourd'hui.

---

## 6. Zone desservie

Google en accepte vingt. En mettre trop dilue le signal, mieux vaut rester sur un rayon
cohérent autour de Crest.

```
Crest
Valence
Die
Montélimar
Romans-sur-Isère
Livron-sur-Drôme
Loriol-sur-Drôme
Chabeuil
Aouste-sur-Sye
Saillans
Drôme
Ardèche
```

---

## 7. Coordonnées et liens

```
Téléphone   07 69 36 27 27
Site Web    https://caelestis.fr
```

**Le lien du site doit être exactement `https://caelestis.fr`**, sans `www`, sans barre
oblique finale, et surtout sans paramètre de suivi type `?utm_source=`. C'est ce que
demande la balise canonical de l'accueil, et c'est ce qui concentre le signal sur la page
d'accueil au lieu de le disperser.

Lien de prise de contact, à mettre dans « Rendez vous » ou « Devis » :

```
https://caelestis.fr/contact
```

---

## 8. Attributs à cocher

- Entreprise dirigée par son propriétaire
- Prestations à distance
- Rendez vous en ligne
- Devis en ligne

---

## 9. Photos

La fiche n'en compte presque aucune, c'est un critère de classement et le premier élément
regardé par un prospect.

| Emplacement | Contenu |
|---|---|
| Logo | Le logotype sans le point, version carrée sur fond vert forêt |
| Photo de couverture | Un visuel large de site livré, ou un paysage drômois sobre |
| Photos supplémentaires | Captures des sites livrés : La Coquette, Fée des Ongles, et les démos de `apercus.caelestis.fr` |
| Photo d'équipe | Un portrait de Célestin, il vend la personne autant que la prestation |

Viser dix photos minimum, en format paysage, sans texte incrusté.

---

## 10. Questions et réponses

Le propriétaire peut poser lui même les questions et y répondre. C'est une section lue par
les moteurs et par les prospects, et elle est presque toujours vide chez les concurrents.

**Combien coûte un site internet chez Caelestis ?**
Quatre formules : une page à partir de 1 000 €, un site vitrine à partir de 2 000 €, une
boutique à partir de 2 500 € et un site sur mesure à partir de 3 500 €. Le devis est
gratuit et arrive sous 48 heures.

**En combien de temps un site est il livré ?**
Cela dépend de la formule et de la rapidité à réunir les textes et les photos. Une page
unique se livre en quelques jours, un site vitrine en deux à trois semaines.

**Travaillez vous en dehors de la Drôme ?**
Oui. L'atelier est à Crest et le travail se fait aussi bien sur place qu'à distance, dans
toute l'Auvergne-Rhône-Alpes et partout en France.

**Faut il payer un abonnement après la livraison ?**
Un abonnement de maintenance accompagne chaque site : hébergement, nom de domaine,
sécurité et sauvegardes. Il est offert les trois premiers mois, puis démarre à 9,99 € par
mois.

**Reprenez vous un site qui existe déjà ?**
Oui, la refonte fait partie des prestations. Ce qui fonctionne est conservé, le reste est
reconstruit.

---

## 11. Premier post

Les posts expirent au bout de six mois, il en faut un nouveau régulièrement.

**Titre**

```
Un site web digne de votre savoir-faire
```

**Texte**

```
Vous faites un métier qui se voit et qui se touche, et votre site ne le raconte pas.
Caelestis conçoit des sites sur mesure pour les artisans, les producteurs et les
indépendants de la Drôme : vos photos, vos mots, votre métier. Devis gratuit, réponse
sous 48 heures.
```

**Bouton** : « En savoir plus » vers `https://caelestis.fr`

---

## 12. Le vrai levier, les avis

La fiche affiche zéro avis. Les concurrents qui sortent sur « concepteur de sites web »
dans le secteur en affichent 329, 23, 22, 21, 11, 3, 3 et 2. Aucune fiche sans avis ne se
classe devant celles là, quelle que soit la qualité du remplissage.

Deux clientes peuvent laisser un avis dès cette semaine : Caro Deshayes pour La Coquette,
et Romane pour la Fée des Ongles. Le lien de demande d'avis se récupère dans la fiche,
bouton « Demander des avis ».

Un avis se demande par message personnel, jamais par envoi groupé, et sans jamais souffler
le texte : Google filtre les avis qui se ressemblent.

---

## À ne pas faire

- Ajouter des mots clés au nom de l'établissement, motif de suspension
- Créer une seconde fiche, les doublons se neutralisent
- Mettre un lien de suivi dans le champ « Site Web »
- Annoncer une promotion dans la description, c'est interdit par les règles
- Laisser Pages Jaunes annoncer 600 € et des horaires faux, Google y puise ses réponses

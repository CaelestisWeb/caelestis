# Fiche Google Business Profile, contenu à coller

Document de travail interne. Rédigé le 03/08/2026, tarifs lus dans `src/utils/tarifs.ts`.
Diagnostic et section 0 refaits le 21/08/2026.
Services et descriptions revus le 17/08/2026 : la création de fiche Google passe à 400 €,
sa reprise à 300 €.
Les coordonnées reprennent à l'identique le schema Organization de `src/pages/index.astro`,
pour que Google lise la même information sur la fiche et sur le site.

---

## 0. Diagnostic du 21/08/2026 : la fiche existe, mais elle n'est rattachée à aucun lieu

Mesuré ce jour, navigateur non connecté, adresse IP localisée en Drôme (Bourdeaux).

| Test | Résultat |
|---|---|
| Google Maps, « Caelestis Crest 26400 » | « Correspondance partielle », aucun établissement, Google propose « Ajouter un lieu manquant » |
| Google Maps, « Caelestis » centré sur Crest | Sept homonymes : un médium suisse, deux temples romains, un éleveur de chiens. Aucune agence web |
| Recherche « Caelestis Crest » | Aucun panneau de connaissance. Pages Jaunes et Mappy occupent la place, et l'aperçu IA les cite comme source |
| Le lien `sameAs` du site, `share.google/IKYSIPaXxlTN0W5Zz` | Redirige vers `kgmid=/g/11nk0p5w4n`. Google y affiche la déesse romaine, le Wiktionnaire et un projet aéronautique européen |

**La fiche existe donc bien**, elle porte un identifiant Knowledge Graph, **mais elle n'est rattachée à aucun point de la carte**. C'est exactement ce que montrait le repère en plein océan Atlantique relevé le 03/08 : latitude zéro, longitude zéro, autrement dit aucune localisation valide. Une fiche sans localisation ne peut sortir sur aucune recherche locale, d'où que l'on cherche. Dix-huit jours plus tard, rien n'a bougé : ce document a été écrit mais pas appliqué.

### La cause, trouvée le 21/08

Les mentions légales du site déclarent :

```
Adresse de l'établissement : 60 rue François 1er, 75008 Paris
Adresse de domiciliation : LegalPlace, 60 rue François 1er, 75008 Paris
```

Trois conséquences :

1. **Une adresse de domiciliation est éliminatoire chez Google.** La règle interdit les bureaux virtuels « sauf si du personnel y travaille pendant les horaires d'ouverture », ainsi que les boîtes aux lettres à adresse distante. Saisir Paris, c'est la suspension, et une localisation à 500 km du marché réel.
2. **Dans les registres publics, l'entreprise n'existe pas en Drôme.** SIREN 999 959 497, établissement unique à Paris 8e. Google ne trouve aucune source officielle pour corroborer une fiche à Crest, ce qui explique aussi qu'aucune fiche n'ait jamais été générée spontanément, alors que Google en crée pour la plupart des entreprises.
3. **Le site se contredit lui-même** : le contenu et le schema disent Crest 26400, les mentions légales disent Paris 75008.

### L'éligibilité, vérifiée à la source

Règle officielle : une entreprise présente uniquement en ligne, sans local recevant du public **et** sans déplacement chez le client, n'est pas éligible à une fiche. Caelestis se déplace chez une partie de ses clients, en Drôme et en Ardèche : **l'éligibilité est acquise**, en établissement de services de proximité, avec adresse renseignée puis masquée. Il n'est pas nécessaire de rencontrer tous ses clients, une partie suffit.

Le masquage n'est d'ailleurs pas une option, c'est une obligation : « si vous n'accueillez pas de clients dans votre établissement, vous devez supprimer votre adresse de votre fiche ».

### Les trois gestes, dans cet ordre

**a. Régulariser le lieu d'exercice à Crest.** Guichet unique INPI, gratuit : déclarer l'établissement à l'adresse réelle de travail à Crest, en gardant LegalPlace comme siège social. Google retrouve alors une trace officielle en Drôme. Sans ce geste, la validation ne repose que sur des preuves matérielles, et reste fragile.

**b. Localiser la fiche.** Dans « Éditer la fiche », onglet « Localisation » : saisir l'adresse de Crest, cocher « Je livre des biens et services à mes clients », ce qui masque l'adresse au public, puis renseigner les zones de la section 6. Contrôler que le repère se pose bien sur Crest, et non au large de l'Afrique.

**c. Aligner les mentions légales.** Ajouter le lieu d'exercice à côté du siège de domiciliation, pour que le site cesse de contredire la fiche.

### Ce que la validation demandera

Pour une activité sans local ouvert au public, Google demande presque toujours une vidéo en une seule prise, sans coupure. À préparer avant de lancer la demande, sous peine de refus :

- un repère extérieur reconnaissable, la rue et le numéro
- le poste de travail réel
- une preuve d'activité au nom de l'entreprise : facture, avis de situation SIRENE, espace d'administration ouvert à l'écran
- la preuve que c'est bien vous qui gérez, en accédant aux outils devant la caméra

### Ce que la fiche vaut, mesuré depuis Crest

Pack local Google Maps, requête « création site internet » centrée sur Crest, le 21/08/2026 :

| Établissement | Note et avis | Adresse affichée |
|---|---|---|
| Logia, résultat sponsorisé | 5,0 sur 107 avis | oui |
| Réacticom | 5,0 sur 30 avis | oui |
| Web et Plus | 5,0 sur 11 avis | oui |
| Les Oiseaux rares | 5,0 sur 7 avis | oui |
| Meteoben | 5,0 sur 4 avis | **non** |
| Eregion Web | 5,0 sur 4 avis | oui |
| Lucide Web | 5,0 sur 3 avis | **non** |
| Val d'Internet | aucun avis | oui |

Deux enseignements. Le ticket d'entrée n'est pas à cent avis : Lucide Web y figure avec trois, et Val d'Internet sans aucun. Et deux fiches sur huit n'affichent aucune adresse : la configuration visée ici, zone desservie sans adresse publique, ne ferme donc aucune porte.

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

À saisir dans « Éditer services ». Le prix se renseigne en « à partir de ». Si le menu
déroulant ne propose que « Aucun prix » ou « Prix fixe », choisir « Aucun prix » plutôt
qu'un prix fixe qui serait faux, et terminer la description par « À partir de 2 000 € »
(le montant de la ligne). Les deux prestations de fiche Google, elles, sont des montants
fermes : « Prix fixe » leur convient.

Ces montants corrigent une information périmée qui circule : l'aperçu IA de Google annonce
aujourd'hui « à partir de 600 € » en citant Pages Jaunes. Un prospect arrive donc avec un
budget faux en tête.

Ordre de saisie : Google affiche les services dans l'ordre où ils sont créés, le premier
porte le plus. Les descriptions ci-dessous sont calibrées sous 300 caractères, espaces
compris, et ne contiennent ni URL ni numéro de téléphone (Google les refuse).

| Service | Prix | Description (300 caractères max) |
|---|---|---|
| Création de site internet vitrine | 2 000 € | Un site de plusieurs pages pour présenter votre activité, vos services et vos réalisations. Dessiné pour votre métier, lisible sur téléphone comme sur ordinateur, avec les bases du référencement en place et un formulaire de contact accessible partout. |
| Création de site internet une page | 1 000 € | L'essentiel de votre activité sur une seule page qui défile : qui vous êtes, ce que vous proposez, comment vous joindre. La formule la plus rapide à mettre en ligne, et la plus abordable pour être présent sérieusement. |
| Création de boutique en ligne | 2 500 € | Vendez vos produits depuis votre site : catalogue clair, paiement sécurisé, commandes simples à suivre au quotidien. Vous restez maître de vos fiches, de vos prix et de vos stocks, sans dépendre d'une plateforme. |
| Création de site internet sur mesure | 3 500 € | Pour un projet qui sort du cadre : davantage de contenu, des fonctionnalités pensées pour votre métier (réservation, espace privé, outils de gestion) et un référencement approfondi. Fiche Google comprise. |
| Référencement naturel (SEO) | sur devis | Être trouvé au moment où l'on cherche votre métier. Audit de l'existant, structure et contenus repris, vitesse et lisibilité corrigées, fiche Google travaillée, positions suivies mois après mois. Sur un site Caelestis comme sur un site déjà en ligne. |
| Création de fiche Google Business | 400 € | Votre établissement sur Google Maps et dans la recherche locale : création et validation de la fiche, catégories, description, services, horaires, photos, zone desservie. Comprise dans la formule sur mesure. |
| Refonte de fiche Google | 300 € | Reprise d'une fiche existante mal renseignée : catégories, description, services, photos, cohérence avec votre site. |
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
Oui. La base est à Crest. Les rendez-vous se font sur place en Drôme et en Ardèche, et le
reste du travail à distance, partout en France.

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

La fiche affiche zéro avis. Relevé du 21/08/2026 dans le pack local de Crest : 107, 30, 11,
7, 4, 4 et 3 avis, plus une fiche visible sans aucun avis. Le remplissage seul ne suffit
donc pas, mais le ticket d’entrée est bas : trois avis suffisent à figurer dans ce classement.

Palier à viser : seize avis à 4,2 minimum. L’effet sur le classement se joue surtout entre
trois et seize avis. Ne pas chercher le 5,0, la zone de confiance est 4,2 à 4,7.

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

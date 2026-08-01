# Signature de courriel Caelestis

Deux variantes, toutes deux construites en tableaux HTML avec styles en ligne, la seule structure qu'Outlook rende correctement (son moteur de rendu est celui de Word, il ignore les feuilles de style, les marges modernes et les coins arrondis).

| Fichier | Quand l'utiliser |
|---|---|
| `signature-avec-monogramme.html` | Usage courant. Le monogramme est chargé depuis `caelestis.fr/apple-touch-icon.png`, donc aucune pièce jointe n'apparaît dans vos messages. |
| `signature-typographique.html` | Prospection et premiers contacts. Aucune image, donc rien à débloquer côté destinataire et aucun signal de courrier commercial pour les filtres. |

## Installer dans Outlook

1. Ouvrir le fichier voulu par double-clic, il s'affiche dans le navigateur.
2. Sélectionner tout (Ctrl+A), copier (Ctrl+C).
3. Outlook, Fichier, Options, Courrier, Signatures.
4. Créer une signature nommée `Caelestis`, coller dans la zone d'édition (Ctrl+V).
5. Affecter cette signature aux nouveaux messages et aux réponses, pour le compte `contact@caelestis.fr`.

Dans Outlook sur le web ou Gmail, même principe : coller dans la zone de signature des paramètres.

## Pourquoi la police n'est pas Satoshi

Aucun client de messagerie ne charge de police externe, Outlook et Gmail les suppriment. La signature utilise donc Segoe UI, puis Arial, puis Helvetica selon le poste du destinataire. Ces polices sont neutres et ne trahissent pas la marque, contrairement à un rendu cassé.

Ce qui porte l'identité dans ce contexte : le vert forêt `#255C41`, la mousse foncée `#2E7452` sur la ligne de fonction, le filet mousse `#B8C4BB` de 34 pixels, et le monogramme.

## Ce qu'il ne faut pas ajouter

- Aucune image de fond, aucun bandeau large : coupés ou déplacés par la moitié des clients.
- Aucune citation, aucun proverbe.
- Aucune mention légale à rallonge : elle alourdit tous les échanges et n'est pas obligatoire pour un courriel commercial de ce type.
- Aucun logo de réseau social tant que la page Facebook professionnelle n'est pas en ligne.

## À compléter

Les deux fichiers portent `Célestin` sans nom de famille. Remplacez-le dans le fichier, ou directement dans Outlook après le collage.

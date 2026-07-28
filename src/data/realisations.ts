/**
 * Source unique des réalisations.
 *
 * Règle de rédaction : on ne consigne ici que des faits vérifiables. Aucun
 * pourcentage, aucune progression de chiffre d'affaires tant que le client
 * ne l'a pas communiqué par écrit. Un résultat inventé se retourne toujours
 * contre celui qui l'affiche.
 *
 * Le témoignage reste facultatif : la page se rend proprement sans lui, et il
 * s'ajoute dès que le client l'a fourni.
 */

import imgFdoAccueil from '../assets/images/realisations/fee-des-ongles-accueil.jpg';
import imgFdoReservation from '../assets/images/realisations/fee-des-ongles-reservation.jpg';

export interface Realisation {
  slug: string;
  /** Nom public du projet, tel qu'il apparaît en ligne. */
  nom: string;
  metier: string;
  ville: string;
  /** Adresse du site livré, vérifiée en ligne. */
  url: string;
  annee: number;
  /** Titre de l'étude de cas, avec un élément chiffré vérifiable. */
  titre: string;
  /** Une phrase pour la vignette d'accueil. */
  accroche: string;
  /** Mention de délai affichée en vignette. */
  delai: string;
  situation: string;
  /** Ce qui coinçait avant, formulé sans jugement sur le client. */
  besoins: string[];
  /** Ce qui a été construit, en langage compréhensible par un non technicien. */
  reponses: string[];
  /** Ce qui est effectivement en service aujourd'hui, constatable par n'importe qui. */
  livre: string[];
  outils: string[];
  temoignage?: { texte: string; auteur: string };
  images: { src: ImageMetadata; alt: string; legende: string }[];
}

export const realisations: Realisation[] = [
  {
    slug: 'fee-des-ongles',
    nom: 'Fée des Ongles',
    metier: 'Prothésiste ongulaire',
    ville: 'Crest',
    url: 'https://www.feedesongles.fr',
    annee: 2026,
    titre: 'Un salon qui prend ses rendez-vous en ligne 24 h sur 24, livré en 14 jours',
    accroche:
      'Site vitrine et moteur de réservation sur mesure pour un salon de prothésie ongulaire, à Crest.',
    delai: 'Livré en 14 jours',
    situation:
      "Romane reçoit sur rendez-vous dans son salon de Crest. Les demandes arrivaient par téléphone et par messages, à des heures où elle travaille sur les ongles de quelqu'un d'autre. Chaque créneau devait être noté, vérifié, parfois rappelé.",
    besoins: [
      "Permettre à une cliente de réserver seule, y compris le soir et le week-end, sans attendre une réponse.",
      "Rendre impossible la double réservation d'un même créneau, quelle que soit l'affluence.",
      "Garder la main sur l'agenda pour les rendez-vous pris de vive voix ou par téléphone.",
      "Réduire les rendez-vous oubliés sans avoir à relancer chaque cliente à la main.",
      "Présenter les prestations et les tarifs sans dépendre d'une page de réseau social.",
    ],
    reponses: [
      "Une page unique qui présente le salon, les prestations, la galerie et les avis, avec les tarifs à jour.",
      "Un moteur de réservation développé sur mesure : les créneaux proposés sont calculés en temps réel à partir des horaires d'ouverture, des rendez-vous déjà pris et des congés.",
      "Une garantie technique contre la double réservation, assurée par la base de données elle-même et non par un simple contrôle à l'écran.",
      "Un rappel automatique avant le rendez-vous, par email ou par SMS au choix de la cliente.",
      "Une règle de trois absences non prévenues, appliquée automatiquement.",
      "Un espace de gestion privé où Romane tient son agenda, ajoute les rendez-vous pris au téléphone, modifie ses prestations, ses tarifs, ses horaires et ses congés sans passer par moi.",
    ],
    livre: [
      'Réservation ouverte en continu, sans intervention humaine.',
      'Agenda et tarifs administrés en autonomie par la cliente.',
      'Rappels envoyés automatiquement avant chaque rendez-vous.',
      'Site en ligne sur son propre nom de domaine, hébergé et sauvegardé.',
    ],
    outils: ['Astro', 'Tailwind CSS', 'React', 'PostgreSQL', 'Vercel'],
    images: [
      {
        src: imgFdoAccueil,
        alt: "Page d'accueil du site Fée des Ongles",
        legende: "La page d'accueil : présentation du salon, prestations et accès direct à la réservation.",
      },
      {
        src: imgFdoReservation,
        alt: 'Écran de réservation en ligne du site Fée des Ongles',
        legende: 'Le moteur de réservation, avec les créneaux réellement disponibles.',
      },
    ],
  },
];

export const realisationParSlug = (slug: string) =>
  realisations.find((r) => r.slug === slug);

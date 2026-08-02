/**
 * guides.ts : la liste des guides publiés dans /ressources/.
 *
 * Sert la page d'index et le maillage. Le contenu de chaque guide vit dans
 * sa page (src/pages/ressources/<slug>.astro) : un guide est un texte
 * travaillé, pas une donnée.
 *
 * Règle éditoriale, la même que pour tout le site : chaque guide répond à une
 * question que les prospects posent réellement, la réponse arrive dans les
 * premières lignes, et aucun chiffre n'est inventé.
 */

export type Guide = {
  slug: string;
  titre: string;
  /** La question à laquelle le guide répond, telle qu'on la pose. */
  question: string;
  description: string;
  date: string;
};

export const guides: readonly Guide[] = [
  {
    slug: 'anatomie-d-un-site-qui-convertit',
    titre: "Anatomie d'un site qui convertit : à quoi sert chaque partie",
    question: 'À quoi sert chaque partie d\'un site ?',
    description:
      'Le rôle de chaque section, décryptée l\'une après l\'autre : la promesse, les repères de confiance, l\'offre, l\'histoire, les avis, la FAQ et le point de contact. Pourquoi chacune est là et ce qu\'elle fait pour transformer un visiteur en client.',
    date: '2026-08-02',
  },
  {
    slug: 'tarifs',
    titre: 'Combien coûte un site internet pour un artisan ou un indépendant ?',
    question: 'Combien ça coûte, vraiment ?',
    description:
      'Le prix médian d\'un site professionnel en France tourne autour de 5 200 €. Les fourchettes réelles par type de site, ce qui fait varier un devis, et nos tarifs de 1 000 à 3 500 €.',
    date: '2026-07-29',
  },
  {
    slug: 'une-page-facebook-suffit-elle',
    titre: 'Une page Facebook suffit-elle, ou faut-il un site internet ?',
    question: 'Facebook ne suffit pas ?',
    description:
      'Ce qu\'une page Facebook fait bien, ce qu\'elle ne fera jamais, et comment décider si votre activité a besoin d\'un site. 87 % des clients passent par Google, presque jamais par Facebook.',
    date: '2026-07-29',
  },
  {
    slug: 'site-vitrine-ou-boutique-en-ligne',
    titre: 'Site vitrine ou boutique en ligne : lequel pour vendre ?',
    question: 'Vitrine ou boutique ?',
    description:
      'Le e-commerce français a dépassé 196 milliards d\'euros, mais une boutique n\'est pas toujours la bonne réponse. Comment choisir entre présenter et vendre en ligne.',
    date: '2026-07-31',
  },
  {
    slug: 'wordpress-wix-ou-site-sur-mesure',
    titre: 'WordPress, Wix ou site sur mesure : que choisir ?',
    question: 'WordPress, Wix ou sur mesure ?',
    description:
      'WordPress équipe près de 43 % du web, Wix progresse vite. Ce que valent vraiment les créateurs en ligne, WordPress et le sur mesure, et lequel pour votre activité.',
    date: '2026-07-31',
  },
  {
    slug: 'combien-de-temps-pour-creer-un-site',
    titre: 'Combien de temps faut-il pour créer un site internet ?',
    question: 'C\'est long à faire ?',
    description:
      'Sur le marché, comptez 3 à 6 semaines pour un site vitrine et 2 à 4 mois pour une boutique. Le détail étape par étape, et ce qui dépend surtout de vous.',
    date: '2026-07-29',
  },
  {
    slug: 'preparer-les-contenus-de-son-site',
    titre: 'Quels contenus préparer avant de créer votre site ?',
    question: 'Je dois préparer quoi ?',
    description:
      'Les contenus non prêts sont la première cause de retard d\'un projet de site. La liste de ce qui sert vraiment, ce qui peut attendre, et ce qui fait gagner des semaines.',
    date: '2026-07-29',
  },
  {
    slug: 'un-site-fait-il-venir-des-clients',
    titre: 'Un site fait-il vraiment venir des clients ?',
    question: 'Ça fait vraiment venir des clients ?',
    description:
      'Un site n\'apporte des clients que s\'il est trouvé, rapide et convaincant. 53 % des visiteurs quittent un site mobile trop lent : ce qui sépare exister de convertir.',
    date: '2026-07-31',
  },
  {
    slug: 'pourquoi-mon-site-n-apparait-pas-dans-google',
    titre: 'Pourquoi mon site n\'apparaît pas dans Google ?',
    question: 'Pourquoi Google ne me trouve pas ?',
    description:
      'Selon Ahrefs, plus de 90 % des pages web ne reçoivent aucun trafic de Google. Les vraies raisons pour lesquelles un site reste invisible, et comment y remédier.',
    date: '2026-07-31',
  },
  {
    slug: 'etre-trouve-par-chatgpt',
    titre: 'Comment être trouvé par ChatGPT et les moteurs IA ?',
    question: 'ChatGPT peut me recommander ?',
    description:
      'Un tiers des Français utilisent déjà un outil d\'IA. Ce que les moteurs comme ChatGPT lisent, pourquoi certains sites leur sont invisibles, et comment y figurer.',
    date: '2026-07-29',
  },
  {
    slug: 'avis-clients-comment-en-obtenir',
    titre: 'Les avis clients : comment en obtenir, et pourquoi ils font vendre',
    question: 'Comment avoir des avis ?',
    description:
      '98 % des consommateurs lisent les avis avant de choisir une entreprise locale. Pourquoi ils pèsent autant, comment en obtenir simplement, et ce qui est interdit.',
    date: '2026-07-31',
  },
] as const;

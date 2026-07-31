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
      'Ce qu\'une page Facebook fait bien, ce qu\'elle ne fera jamais, et comment décider si votre activité a besoin d\'un site internet en plus.',
    date: '2026-07-29',
  },
  {
    slug: 'combien-de-temps-pour-creer-un-site',
    titre: 'Combien de temps faut-il pour créer un site internet ?',
    question: 'C\'est long à faire ?',
    description:
      'De deux à huit semaines selon la formule. Le détail étape par étape, ce qui fait durer un projet, et ce qui dépend de vous.',
    date: '2026-07-29',
  },
  {
    slug: 'etre-trouve-par-chatgpt',
    titre: 'Comment être trouvé par ChatGPT et les moteurs IA ?',
    question: 'ChatGPT peut me recommander ?',
    description:
      'Vos futurs clients demandent déjà à ChatGPT quel artisan choisir. Ce que les moteurs IA lisent, pourquoi certains sites leur sont invisibles, et comment y figurer.',
    date: '2026-07-29',
  },
  {
    slug: 'preparer-les-contenus-de-son-site',
    titre: 'Quels contenus préparer avant de créer votre site ?',
    question: 'Je dois préparer quoi ?',
    description:
      'Photos, textes, avis, informations légales : la liste de ce qui sert vraiment, ce qui peut attendre, et ce qui fait gagner des semaines sur le délai.',
    date: '2026-07-29',
  },
] as const;

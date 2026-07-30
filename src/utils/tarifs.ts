/**
 * tarifs.ts : source unique des quatre formules de création.
 *
 * Toute évolution se fait ici : les pages Accueil, Services et Page unique
 * lisent ces valeurs. Ni les prix, ni les noms, ni les descriptions ne sont
 * réécrits en dur ailleurs, sinon ils finissent par se contredire d'une page
 * à l'autre.
 *
 * Le paiement échelonné n'est volontairement pas affiché sur le site : il est
 * proposé de vive voix, au cas par cas, et encadré par l'article 5 des CGV.
 */

export type Formule = {
  /** Identifiant technique, sert d'ancre. */
  id: 'page-unique' | 'site-vitrine' | 'boutique-en-ligne' | 'site-sur-mesure';
  nom: string;
  /** Prix de départ en euros, hors options. */
  prix: number;
  /**
   * Où en savoir plus sur la formule : sa page dédiée.
   *
   * Les quatre formules en ont une depuis le 29/07/2026. Auparavant, trois
   * d'entre elles n'étaient que des ancres dans la page Services : une ancre
   * n'a ni titre, ni description, ni balisage, elle ne peut donc ni se
   * positionner sur sa requête ni être citée par un moteur IA.
   */
  href: string;
  /**
   * L'action proposée depuis la page Services, une fois la formule détaillée :
   * découvrir la page dédiée, ou demander un devis.
   */
  action: { href: string; libelle: string };
  /** Intertitre : à qui la formule s'adresse, en trois mots. */
  kicker: string;
  /** Résumé court, pour la planche des formules en page d'accueil. */
  baseline: string;
  /** Description complète, pour la page Services. */
  resume: string;
  /** Trois repères de contenu, ce que la formule apporte concrètement. */
  points: readonly string[];
  /** Clé de l'aperçu du site de démonstration associé, page Services. */
  apercu: 'page-unique' | 'vitrine' | 'boutique' | 'sur-mesure';
  /** Une seule formule porte l'accent visuel : la plus demandée. */
  accent?: true;
};

export const FORMULES: readonly Formule[] = [
  {
    id: 'page-unique',
    nom: 'Page unique',
    prix: 1000,
    href: '/services/site-une-page',
    action: { href: '/services/site-une-page', libelle: "Découvrir l'offre" },
    kicker: 'Pour démarrer',
    baseline: "L'essentiel de votre activité sur une seule page, pour démarrer simplement.",
    resume: "L'essentiel de votre activité sur une seule page qui défile, pour être présent vite et simplement.",
    points: [
      'Tout tient sur une page, sans menu à chercher.',
      'Visible sur Google dès la mise en ligne.',
      'La formule la plus rapide à livrer.',
    ],
    apercu: 'page-unique',
  },
  {
    id: 'site-vitrine',
    nom: 'Site vitrine',
    prix: 1800,
    href: '/services/site-vitrine',
    action: { href: '/services/site-vitrine', libelle: "Découvrir l'offre" },
    kicker: 'Le plus demandé',
    baseline: 'Votre activité en ligne, claire et lisible sur tous les écrans.',
    resume: 'Un site professionnel pour présenter votre activité, vos services et permettre à vos clients de vous contacter facilement.',
    points: [
      'Plusieurs pages : activité, services, réalisations.',
      'Formulaire de contact et coordonnées partout.',
      'Les bases du référencement en place.',
    ],
    apercu: 'vitrine',
    accent: true,
  },
  {
    id: 'boutique-en-ligne',
    nom: 'Boutique en ligne',
    prix: 2500,
    href: '/services/boutique-en-ligne',
    action: { href: '/services/boutique-en-ligne', libelle: "Découvrir l'offre" },
    kicker: 'Pour vendre',
    baseline: 'Vendez vos produits depuis votre site, avec un paiement sécurisé.',
    resume: 'Vendez vos produits directement sur votre site grâce à une boutique simple, claire et facile à gérer au quotidien.',
    points: [
      'Votre catalogue de produits en ligne.',
      'Paiement sécurisé pour vos clients.',
      'Commandes simples à suivre au quotidien.',
    ],
    apercu: 'boutique',
  },
  {
    id: 'site-sur-mesure',
    nom: 'Site sur mesure',
    prix: 3500,
    href: '/services/site-sur-mesure',
    action: { href: '/services/site-sur-mesure', libelle: "Découvrir l'offre" },
    kicker: 'Pour aller plus loin',
    baseline: 'Entièrement conçu selon vos besoins, votre identité et vos objectifs.',
    resume: 'Un site entièrement adapté à votre projet, avec davantage de contenu, de fonctionnalités et un travail SEO plus approfondi.',
    points: [
      'Davantage de pages et de contenu.',
      'Des fonctionnalités adaptées à votre métier.',
      'Un travail de référencement approfondi.',
    ],
    apercu: 'sur-mesure',
  },
] as const;

/**
 * Formate un montant en euros à la française.
 * Les centimes ne sont affichés que lorsqu'ils existent.
 */
export function euros(montant: number): string {
  return montant.toLocaleString('fr-FR', {
    minimumFractionDigits: Number.isInteger(montant) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Retrouve une formule par son identifiant. */
export function formule(id: Formule['id']): Formule {
  const f = FORMULES.find((x) => x.id === id);
  if (!f) throw new Error(`Formule inconnue : ${id}`);
  return f;
}

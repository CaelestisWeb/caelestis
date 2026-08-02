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
    action: { href: '/services/site-une-page', libelle: 'Découvrir la page unique' },
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
    prix: 2000,
    href: '/services/site-vitrine',
    action: { href: '/services/site-vitrine', libelle: 'Découvrir le site vitrine' },
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
    action: { href: '/services/boutique-en-ligne', libelle: 'Découvrir la boutique en ligne' },
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
    action: { href: '/services/site-sur-mesure', libelle: 'Découvrir le site sur mesure' },
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
 * Abonnement de maintenance, en euros par mois, une ligne par formule.
 *
 * Grille arrêtée le 31/07/2026. Elle succède à celle de juin (7,99 / 9,99 /
 * 14,99 / 19,99), restée en ligne un mois de plus faute d'avoir été portée ici :
 * le montant vivait en dur à six endroits du site, et rien ne signalait l'écart.
 * C'est précisément ce que cette table empêche.
 *
 * Les centimes sont assumés : un abonnement mensuel ne suit pas la règle des
 * montants ronds qui s'applique au prix des sites. Décision de Célestin.
 *
 * La maintenance est obligatoire et OFFERTE LES TROIS PREMIERS MOIS : l'abonnement
 * ne démarre qu'au quatrième. Toute page qui annonce un montant doit le dire dans
 * la même phrase, sinon l'obligation se lit comme une contrainte sèche.
 *
 * Ne jamais réécrire cette durée en dur, ni ici ni ailleurs : elle vit dans
 * MAINTENANCE_MOIS_OFFERTS et dans sa forme en lettres, plus bas.
 */
export const MAINTENANCE: Record<Formule['id'], number> = {
  'page-unique': 9.99,
  'site-vitrine': 14.99,
  'boutique-en-ligne': 19.99,
  'site-sur-mesure': 24.99,
} as const;

/** Le montant d'appel : la formule la moins chère. */
export const MAINTENANCE_MIN = Math.min(...Object.values(MAINTENANCE));

/** Nombre de mois offerts avant la première échéance. Ramené de six à trois le 01/08/2026. */
export const MAINTENANCE_MOIS_OFFERTS = 3;

/**
 * Minutes de retouches de contenu comprises chaque mois, non reportables.
 *
 * Quinze minutes, décidé par Célestin le 01/08/2026. Au-delà, le travail est
 * chiffré avant d'être réalisé, au tarif horaire (voir TARIF_HORAIRE).
 *
 * Le chiffre a une conséquence directe sur la marge : à 60 € de l'heure, une
 * minute vaut 1 €, et la formule la moins chère ne dégage qu'environ 7 € une
 * fois l'hébergement et le domaine payés. Quinze minutes restent donc un geste
 * commercial, assumé comme tel ; trente le rendaient franchement déficitaire.
 */
export const MAINTENANCE_RETOUCHES_MIN = 15;

/** Tarif horaire des travaux hors abonnement, en euros. */
export const TARIF_HORAIRE = 60;

/**
 * Le même nombre, en lettres, pour le texte courant.
 *
 * L'usage français écrit en toutes lettres les nombres jusqu'à dix dans une
 * phrase, et en chiffres dans un titre ou une donnée. Sans cette seconde forme,
 * la page de maintenance mélangeait la durée en chiffres et en toutes lettres
 * d'un paragraphe à l'autre.
 */
export const MAINTENANCE_MOIS_OFFERTS_LETTRES = 'trois';

/**
 * Supplément pour la fiche Google Business, en euros.
 *
 * Cette prestation se vend en plus du site. Créer une fiche depuis zéro
 * (validation de l'établissement, catégories, description, photos, horaires)
 * demande plus de travail que reprendre une fiche qui existe déjà.
 *
 * La formule sur mesure la comprend : son supplément est nul, et c'est un
 * argument de vente annoncé sur la page comme dans le simulateur.
 */
export const FICHE_GOOGLE = {
  creation: 300,
  refonte: 200,
} as const;

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

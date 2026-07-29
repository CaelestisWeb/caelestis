/**
 * tarifs.ts : Source unique des tarifs de création et de leurs mensualités.
 *
 * Toute évolution de prix se fait ici : les pages Accueil, Services et
 * Page unique lisent ces valeurs, le tableau du paiement échelonné aussi.
 */

/** Durées de paiement échelonné proposées, en mois. */
export const DUREES = [3, 6] as const;

export type Formule = {
  /** Identifiant technique, sert d'ancre. */
  id: 'page-unique' | 'site-vitrine' | 'boutique-en-ligne' | 'site-sur-mesure';
  nom: string;
  /** Prix de départ en euros, hors options. */
  prix: number;
  href: string;
};

export const FORMULES: readonly Formule[] = [
  { id: 'page-unique',       nom: 'Page unique',       prix: 500,  href: '/site-une-page' },
  { id: 'site-vitrine',      nom: 'Site vitrine',      prix: 800,  href: '/services#site-vitrine' },
  { id: 'boutique-en-ligne', nom: 'Boutique en ligne', prix: 1200, href: '/services#boutique-en-ligne' },
  { id: 'site-sur-mesure',   nom: 'Site sur mesure',   prix: 2500, href: '/services#site-sur-mesure' },
] as const;

/** Durée mise en avant dans les mentions courtes, sous chaque prix. */
export const DUREE_VITRINE = 6;

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

/** Mensualité sans frais ni intérêts, arrondie au centime. */
export function mensualite(prix: number, mois: number): number {
  return Math.round((prix / mois) * 100) / 100;
}

/**
 * Mention courte à placer sous un prix affiché.
 * Exemple : « ou 83,33 € par mois sur 6 mois ».
 */
export function mentionMensuelle(prix: number, mois: number = DUREE_VITRINE): string {
  return `ou ${euros(mensualite(prix, mois))} € par mois sur ${mois} mois`;
}

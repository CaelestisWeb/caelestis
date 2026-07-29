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
  { id: 'page-unique',       nom: 'Page unique',       prix: 999,  href: '/site-une-page' },
  { id: 'site-vitrine',      nom: 'Site vitrine',      prix: 1499, href: '/services#site-vitrine' },
  { id: 'boutique-en-ligne', nom: 'Boutique en ligne', prix: 2499, href: '/services#boutique-en-ligne' },
  { id: 'site-sur-mesure',   nom: 'Site sur mesure',   prix: 3499, href: '/services#site-sur-mesure' },
] as const;

/** Durée mise en avant dans les mentions courtes, sous chaque prix. */
export const DUREE_VITRINE = 6;

/** Part du montant total réglée à la signature du devis. */
export const TAUX_ACOMPTE = 0.3;

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

/** Acompte réglé à la signature du devis, arrondi au centime. */
export function acompte(prix: number): number {
  return Math.round(prix * TAUX_ACOMPTE * 100) / 100;
}

/**
 * Mensualité du solde une fois l'acompte versé, sans frais ni intérêts.
 * Le total acompte + mensualités reste égal au montant du devis.
 */
export function mensualite(prix: number, mois: number): number {
  return Math.round(((prix - acompte(prix)) / mois) * 100) / 100;
}

/**
 * Mention courte à placer sous un prix affiché.
 * Exemple : « ou 30 % puis 6 x 93,33 € ».
 */
export function mentionMensuelle(prix: number, mois: number = DUREE_VITRINE): string {
  return `ou 30 % puis ${mois} x ${euros(mensualite(prix, mois))} €`;
}

/** Retrouve une formule par son identifiant. */
export function formule(id: Formule['id']): Formule {
  const f = FORMULES.find((x) => x.id === id);
  if (!f) throw new Error(`Formule inconnue : ${id}`);
  return f;
}

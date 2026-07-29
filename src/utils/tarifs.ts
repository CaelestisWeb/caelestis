/**
 * tarifs.ts : source unique des tarifs de création.
 *
 * Toute évolution de prix se fait ici : les pages Accueil, Services et
 * Page unique lisent ces valeurs, aucun prix n'est réécrit en dur ailleurs.
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
  href: string;
};

export const FORMULES: readonly Formule[] = [
  { id: 'page-unique',       nom: 'Page unique',       prix: 999.99,  href: '/site-une-page' },
  { id: 'site-vitrine',      nom: 'Site vitrine',      prix: 1499.99, href: '/services#site-vitrine' },
  { id: 'boutique-en-ligne', nom: 'Boutique en ligne', prix: 2499.99, href: '/services#boutique-en-ligne' },
  { id: 'site-sur-mesure',   nom: 'Site sur mesure',   prix: 3499.99, href: '/services#site-sur-mesure' },
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

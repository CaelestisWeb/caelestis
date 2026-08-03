/**
 * demos.ts : source unique des quatre sites de démonstration.
 *
 * Un site de démonstration illustre ce que change une formule par rapport à une
 * autre. Aucune des entreprises représentées n'existe : ce ne sont pas des
 * références clientes, et toute page qui les affiche doit le dire.
 *
 * Ces données vivaient dans services.astro. Elles sont remontées ici le
 * 03/08/2026, quand les quatre pages de formule ont reçu le même aperçu :
 * l'URL d'une démonstration, sa capture et sa légende ne peuvent pas être
 * réécrites à deux endroits sans finir par se contredire.
 *
 * Les captures sont dans src/assets/images/apercus/, au format 1600x900 : le
 * haut du site, pris sur la production à 1600 px de large. Elles ont remplacé
 * le 03/08/2026 des captures pleine longueur de 1100 px, qui n'existaient que
 * pour la visionneuse supprimée le même jour : quatre fois plus lourdes, et
 * trop peu définies pour la surface où elles s'affichent aujourd'hui.
 */
import type { ImageMetadata } from 'astro';

import apercuPageUnique from '../assets/images/apercus/page-unique-ferme.jpg';
import apercuVitrine from '../assets/images/apercus/vitrine-ecurie.jpg';
import apercuBoutique from '../assets/images/apercus/boutique-miellerie.jpg';
import apercuSurMesure from '../assets/images/apercus/sur-mesure-ebeniste.jpg';

/** La clé d'aperçu portée par chaque formule dans tarifs.ts. */
export type CleDemo = 'page-unique' | 'vitrine' | 'boutique' | 'sur-mesure';

export type Demo = {
  /** Capture du haut du site, importée pour passer par l'optimiseur d'images. */
  img: ImageMetadata;
  /** Le métier illustré, en une ligne. */
  titre: string;
  /** Ce qui s'affiche dans la barre de la fenêtre dessinée. */
  url: string;
  /** Description de la capture pour les lecteurs d'écran. */
  alt: string;
  /** Ce que la démonstration montre concrètement de la formule. */
  detail: string;
  /** L'adresse du site de démonstration, en ligne et navigable. */
  href: string;
};

export const DEMOS: Record<CleDemo, Demo> = {
  'page-unique': {
    img: apercuPageUnique,
    titre: 'Une micro-ferme maraîchère',
    url: 'exemple, une micro-ferme maraîchère',
    alt: "Aperçu du site d'une micro-ferme maraîchère, réalisé en page unique",
    detail: 'Tout sur une page : les légumes de saison, les horaires de vente, le contact.',
    href: 'https://apercus.caelestis.fr/ferme/',
  },
  'vitrine': {
    img: apercuVitrine,
    titre: 'Un centre équestre',
    url: 'exemple, un centre équestre',
    alt: "Aperçu du site d'un centre équestre, réalisé en site vitrine",
    detail: 'Sept pages : pension, cours, installations, équipe, tarifs, contact.',
    href: 'https://apercus.caelestis.fr/ecurie/',
  },
  'boutique': {
    img: apercuBoutique,
    titre: 'Une miellerie',
    url: 'exemple, une miellerie',
    alt: "Aperçu du site d'une miellerie, réalisé en boutique en ligne",
    detail: 'Catalogue, filtres, panier et calcul des frais de livraison.',
    href: 'https://apercus.caelestis.fr/ruche/',
  },
  'sur-mesure': {
    img: apercuSurMesure,
    titre: 'Un atelier d’ébénisterie',
    url: "exemple, un atelier d'ébénisterie",
    alt: "Aperçu du site d'un atelier d'ébénisterie, réalisé sur mesure",
    detail: 'Configurateur de mobilier avec estimation du prix et du délai en direct.',
    href: 'https://apercus.caelestis.fr/ebeniste/',
  },
};

/** Retrouve une démonstration par sa clé. */
export function demo(cle: CleDemo): Demo {
  const d = DEMOS[cle];
  if (!d) throw new Error(`Démonstration inconnue : ${cle}`);
  return d;
}

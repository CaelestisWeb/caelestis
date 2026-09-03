/**
 * Types, barème et bilan d'ensemble du diagnostic.
 *
 * Ce module ne touche ni au réseau ni au système : il est donc utilisable
 * aussi bien dans la fonction serveur que dans le navigateur. C'est ce qui
 * permet à la page de recalculer la note au fil du parcours du site sans
 * redemander au serveur, et sans qu'une seconde règle de calcul finisse par
 * diverger de la première.
 */

/**
 * Quatre niveaux. « reglage » désigne un point exact mais que presque aucun
 * site ne tient : sur 52 sites mesurés, les en-têtes de sécurité manquaient à
 * 58 à 79 % d'entre eux. Le relever reste utile, le facturer à la note ne
 * distingue plus personne : ces points sont donc affichés sans pénalité.
 */
export type Gravite = 'critique' | 'moyen' | 'mineur' | 'reglage';

export type Famille =
  | 'vitesse'
  | 'mobile'
  | 'securite'
  | 'referencement'
  | 'contenu'
  | 'conversion'
  | 'lisibilite'
  | 'confiance';

export interface Constat {
  famille: Famille;
  gravite: Gravite;
  fait: string;
  consequence: string;
}

export interface FamilleNotee {
  cle: Famille;
  libelle: string;
  note: number;
  points: number;
  bloquants: number;
}

/** Relevé d'une page du site, rapporté par le parcours. */
export interface PageParcourue {
  chemin: string;
  statut: number;
  titre: string | null;
  description: string | null;
  h1: number;
  mots: number;
  /** Adresses trouvées dans un sous-plan de site, à parcourir à leur tour. */
  decouvertes?: string[];
}

/** Ordre d'affichage et poids de chaque famille dans la note globale. */
export const FAMILLES: { cle: Famille; libelle: string; poids: number }[] = [
  { cle: 'vitesse', libelle: 'Vitesse', poids: 1.2 },
  { cle: 'mobile', libelle: 'Mobile', poids: 1.2 },
  { cle: 'securite', libelle: 'Sécurité', poids: 1.1 },
  { cle: 'referencement', libelle: 'Référencement', poids: 1.4 },
  { cle: 'contenu', libelle: 'Contenu', poids: 1 },
  { cle: 'conversion', libelle: 'Conversion', poids: 1.4 },
  { cle: 'lisibilite', libelle: 'Lisibilité', poids: 0.9 },
  { cle: 'confiance', libelle: 'Confiance', poids: 0.8 },
];

/** Coût d'un point relevé dans la note de sa famille. */
export const PENALITE: Record<Gravite, number> = { critique: 35, moyen: 18, mineur: 7, reglage: 0 };

export function noter(constats: Constat[]): {
  familles: FamilleNotee[];
  note: number;
  verdict: string;
} {
  const familles: FamilleNotee[] = FAMILLES.map(({ cle, libelle }) => {
    const propres = constats.filter((c) => c.famille === cle);
    const penalite = propres.reduce((total, c) => total + PENALITE[c.gravite], 0);
    return {
      cle,
      libelle,
      note: Math.max(0, 100 - penalite),
      points: propres.length,
      bloquants: propres.filter((c) => c.gravite === 'critique').length,
    };
  });

  const poidsTotal = FAMILLES.reduce((t, f) => t + f.poids, 0);
  const note = Math.round(
    familles.reduce((t, f, i) => t + f.note * FAMILLES[i].poids, 0) / poidsTotal,
  );

  const verdict =
    note >= 85 ? "Les fondations tiennent. Les points restants relèvent du réglage fin."
    : note >= 70 ? "Les fondations sont saines. Plusieurs réglages manquants coûtent des visites et des demandes."
    : note >= 50 ? "Le site est en ligne et fonctionne. Il lui reste à donner tout ce qu'il peut."
    : note >= 30 ? "Plusieurs fondations manquent à la fois : le site est moins visité qu'il ne devrait, et transforme moins qu'il ne pourrait."
    : "La majorité des points de contrôle reste à traiter, sur presque toutes les familles en même temps.";

  return { familles, note, verdict };
}

/** Par famille dans l'ordre d'affichage, puis du plus grave au plus bénin. */
export function trierConstats(constats: Constat[]): Constat[] {
  const ordreFamille = new Map(FAMILLES.map((f, i) => [f.cle, i]));
  const ordreGravite: Record<Gravite, number> = { critique: 0, moyen: 1, mineur: 2, reglage: 3 };
  return constats.sort(
    (a, b) =>
      (ordreFamille.get(a.famille) ?? 99) - (ordreFamille.get(b.famille) ?? 99) ||
      ordreGravite[a.gravite] - ordreGravite[b.gravite],
  );
}

/**
 * Bilan du parcours du site. Ces constats n'existent qu'à l'échelle de
 * l'ensemble : une page seule ne peut pas avoir un titre en double, et une
 * adresse morte ne se voit que depuis le plan ou la page qui la cite.
 */
export function constatsDuSite(pages: PageParcourue[]): Constat[] {
  const constats: Constat[] = [];
  const lues = pages.filter((p) => p.statut === 200 && !p.decouvertes);
  if (lues.length < 2) return constats;

  const parTitre = new Map<string, number>();
  const parDescription = new Map<string, number>();
  let sansTitre = 0;
  let sansDescription = 0;
  let sansH1 = 0;
  let maigres = 0;

  for (const p of lues) {
    if (!p.titre) sansTitre += 1;
    else parTitre.set(p.titre, (parTitre.get(p.titre) ?? 0) + 1);
    if (!p.description) sansDescription += 1;
    else parDescription.set(p.description, (parDescription.get(p.description) ?? 0) + 1);
    if (p.h1 === 0) sansH1 += 1;
    if (p.mots < 120) maigres += 1;
  }

  const enDouble = (m: Map<string, number>) =>
    [...m.values()].filter((n) => n > 1).reduce((t, n) => t + n, 0);
  const titresDoubles = enDouble(parTitre);
  const descriptionsDoubles = enDouble(parDescription);
  const total = lues.length;

  if (titresDoubles >= 2) {
    constats.push({
      famille: 'referencement',
      gravite: titresDoubles >= total * 0.3 ? 'moyen' : 'mineur',
      fait: `${titresDoubles} pages sur ${total} portent le même titre qu'une autre page.`,
      consequence:
        "Google affiche ce titre en tête de son résultat. Quand plusieurs pages partagent le même, Google choisit lui-même laquelle proposer, et leurs positions se font concurrence au lieu de s'additionner.",
    });
  }
  if (descriptionsDoubles >= 2) {
    constats.push({
      famille: 'referencement',
      gravite: 'mineur',
      fait: `${descriptionsDoubles} pages sur ${total} ont la même description que d'autres.`,
      consequence:
        "La description est le texte affiché sous le titre dans les résultats. Distincte pour chaque page, elle donne une raison de cliquer sur celle-ci plutôt qu'une autre.",
    });
  }
  if (sansTitre > 0) {
    constats.push({
      famille: 'referencement',
      gravite: sansTitre >= total * 0.2 ? 'moyen' : 'mineur',
      fait: `${sansTitre} page${sansTitre > 1 ? 's' : ''} sur ${total} n'${sansTitre > 1 ? 'ont' : 'a'} aucun titre.`,
      consequence: 'Google fabrique alors une ligne de résultat avec des bouts de page, souvent bancale.',
    });
  }
  if (sansDescription >= Math.max(2, total * 0.3)) {
    constats.push({
      famille: 'referencement',
      gravite: 'mineur',
      fait: `${sansDescription} pages sur ${total} n'ont pas de description pour les résultats de recherche.`,
      consequence:
        "Google compose alors un extrait au hasard dans la page, souvent très loin de ce qu'elle vend.",
    });
  }
  if (sansH1 >= Math.max(2, total * 0.3)) {
    constats.push({
      famille: 'referencement',
      gravite: sansH1 >= total * 0.5 ? 'moyen' : 'mineur',
      fait: `${sansH1} pages sur ${total} n'ont aucun titre principal.`,
      consequence:
        "C'est sur ce titre que Google s'appuie pour comprendre le sujet d'une page. Il rend son classement bien plus facile.",
    });
  }
  if (maigres >= Math.max(2, total * 0.3)) {
    constats.push({
      famille: 'contenu',
      gravite: 'mineur',
      fait: `${maigres} pages sur ${total} contiennent moins de 120 mots.`,
      consequence:
        'Une page trop courte a peu de chances de se classer, et donne au visiteur le sentiment que le site est inachevé.',
    });
  }

  const cassees = pages.filter((p) => p.statut >= 400 && p.statut !== 401 && p.statut !== 403);
  if (cassees.length > 0) {
    const liste = cassees.slice(0, 3).map((p) => p.chemin).join(', ');
    constats.push({
      famille: 'referencement',
      gravite: cassees.length >= 3 ? 'moyen' : 'mineur',
      fait: `${cassees.length} page${cassees.length > 1 ? 's' : ''} annoncée${cassees.length > 1 ? 's' : ''} par le site ${cassees.length > 1 ? 'répondent' : 'répond'} par une erreur : ${liste}${cassees.length > 3 ? '…' : ''}.`,
      consequence:
        "Ces adresses sont dans votre plan de site ou liées depuis vos pages : Google les demande, et un visiteur peut y arriver. Il tombe sur une erreur.",
    });
  }

  return constats;
}

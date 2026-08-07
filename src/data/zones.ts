/**
 * Les zones desservies par Caelestis, telles qu'elles sont déclarées sur la
 * fiche Google d'établissement (relevé du 07/08/2026). Source unique : la page
 * régionale et les variantes du schéma du territoire lisent ce fichier, jamais
 * une liste recopiée.
 *
 * `heures` est le temps de route depuis Crest, arrondi au quart d'heure.
 * `azimut` est la direction réelle en degrés depuis le nord, sens horaire :
 * c'est ce qui permet de placer une ville sur un schéma radial.
 * `grande` marque les villes assez connues pour parler à un visiteur qui n'est
 * pas de la Drôme : c'est le tri qu'utilise la variante radiale, qui ne peut
 * pas en afficher dix-neuf sans devenir illisible.
 */
export interface Zone {
  nom: string;
  /** Temps de route depuis Crest, en heures décimales. */
  heures: number;
  /** Direction depuis Crest, en degrés depuis le nord, sens horaire. */
  azimut: number;
  /** Ville repère, lisible par quelqu'un d'extérieur au département. */
  grande?: boolean;
  /** Hors Auvergne-Rhône-Alpes : desservie, mais pas dans le sujet de la page. */
  horsRegion?: boolean;
}

export const ZONES: Zone[] = [
  { nom: 'Chabeuil',              heures: 0.42, azimut: 345 },
  { nom: 'Étoile-sur-Rhône',      heures: 0.42, azimut: 300 },
  { nom: 'Valence',               heures: 0.5,  azimut: 322, grande: true },
  { nom: 'Montélimar',            heures: 0.6,  azimut: 193, grande: true },
  { nom: "Pont-de-l'Isère",       heures: 0.6,  azimut: 337 },
  { nom: 'Dieulefit',             heures: 0.67, azimut: 165 },
  { nom: 'Romans-sur-Isère',      heures: 0.67, azimut: 350, grande: true },
  { nom: 'Die',                   heures: 0.75, azimut: 100, grande: true },
  { nom: 'Saint-Jean-en-Royans',  heures: 0.83, azimut: 25 },
  { nom: 'Privas',                heures: 0.83, azimut: 277, grande: true },
  { nom: 'Saint-Marcellin',       heures: 1.0,  azimut: 10 },
  { nom: 'Aubenas',               heures: 1.17, azimut: 248, grande: true },
  { nom: 'Grenoble',              heures: 1.33, azimut: 42,  grande: true },
  { nom: 'Vienne',                heures: 1.33, azimut: 349 },
  { nom: 'Lyon',                  heures: 1.75, azimut: 353, grande: true },
  { nom: 'Saint-Étienne',         heures: 1.75, azimut: 318, grande: true },
  { nom: 'Aix-en-Provence',       heures: 2.0,  azimut: 187, horsRegion: true },
  { nom: 'Le Puy-en-Velay',       heures: 2.25, azimut: 285, grande: true },
];

/** Formate un temps de route pour l'affichage : 0.75 devient « 45 min ». */
export function duree(heures: number): string {
  const minutes = Math.round(heures * 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste === 0 ? `${h} h` : `${h} h ${reste}`;
}

/** Position d'une zone sur un schéma radial centré sur Crest. */
export function position(z: Zone, centre: number, pxParHeure: number) {
  const r = z.heures * pxParHeure;
  const a = (z.azimut * Math.PI) / 180;
  return {
    x: Math.round((centre + r * Math.sin(a)) * 10) / 10,
    y: Math.round((centre - r * Math.cos(a)) * 10) / 10,
  };
}

/** Les zones groupées par palier de temps, pour les variantes en couronnes. */
export const COURONNES = [
  { seuil: 0.5,  titre: 'Moins de 30 minutes' },
  { seuil: 1.0,  titre: "Moins d'une heure" },
  { seuil: 1.75, titre: 'Moins de deux heures' },
  { seuil: 99,   titre: 'Au-delà' },
].map((c, i, tous) => ({
  ...c,
  plancher: i === 0 ? 0 : tous[i - 1].seuil,
  zones: ZONES.filter((z) => z.heures <= c.seuil && z.heures > (i === 0 ? -1 : tous[i - 1].seuil)),
}));

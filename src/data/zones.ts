/**
 * Le périmètre de déplacement de Caelestis, depuis Crest.
 *
 * Base : les zones desservies déclarées sur la fiche Google d'établissement
 * (relevé du 07/08/2026), complétées par Avignon et Vallon-Pont-d'Arc à la
 * demande de Célestin. Source unique : la page régionale lit ce fichier, aucune
 * liste de villes n'est recopiée ailleurs.
 *
 * Les azimuts sont calculés (orthodromie entre Crest et chaque ville). Les temps
 * de route ont d'abord été relevés par l'API OSRM le 07/08/2026, puis arrondis
 * par Célestin à des durées rondes et lisibles, validées à la main le
 * 07/08/2026. Ce sont ces valeurs arrondies qui s'affichent : elles peuvent
 * s'écarter de quelques minutes d'un itinéraire réel, c'est volontaire.
 *
 * `carte` marque les villes affichées sur le schéma. Le critère est double :
 * dans les deux heures de route, et un nom qu'un visiteur extérieur au
 * département reconnaît. Quand elles sont nombreuses, ce sont les étiquettes les
 * plus longues, posées en premier, qui gardent le dessin lisible.
 */
export interface Zone {
  nom: string;
  /** Temps de route depuis Crest, en heures décimales (arrondi lisible). */
  heures: number;
  /** Kilomètres par la route. */
  km: number;
  /** Direction depuis Crest, en degrés depuis le nord, sens horaire. */
  azimut: number;
  /** Affichée sur le schéma du périmètre. */
  carte?: boolean;
  /** Hors Auvergne-Rhône-Alpes. */
  horsRegion?: boolean;
  /** Coin imposé pour l'étiquette, autour de son point (direction artistique de
   *  Célestin). Sinon le coin est choisi automatiquement, vers l'extérieur. */
  coin?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
}

export const ZONES: Zone[] = [
  { nom: 'Étoile-sur-Rhône',     heures: 0.35, km: 18,  azimut: 320 },
  { nom: 'Chabeuil',             heures: 0.45, km: 23,  azimut: 355 },
  { nom: 'Valence',              heures: 0.58, km: 30,  azimut: 336, carte: true, coin: 'NW' },
  { nom: "Pont-de-l'Isère",      heures: 0.70, km: 41,  azimut: 338 },
  { nom: 'Dieulefit',            heures: 0.72, km: 32,  azimut: 172 },
  { nom: 'Romans-sur-Isère',     heures: 0.75, km: 39,  azimut: 4,   carte: true },
  { nom: 'Die',                  heures: 0.75, km: 38,  azimut: 84,  carte: true },
  { nom: 'Privas',               heures: 0.75, km: 39,  azimut: 271, carte: true },
  { nom: 'Montélimar',           heures: 0.83, km: 38,  azimut: 229, carte: true },
  { nom: 'Saint-Marcellin',      heures: 0.98, km: 66,  azimut: 26 },
  { nom: 'Saint-Jean-en-Royans', heures: 1.02, km: 63,  azimut: 33 },
  { nom: 'Nyons',                heures: 1.17, km: 61,  azimut: 167, carte: true },
  { nom: 'Aubenas',              heures: 1.25, km: 68,  azimut: 257, carte: true },
  { nom: 'Vienne',               heures: 1.30, km: 101, azimut: 353 },
  { nom: 'Grenoble',             heures: 1.50, km: 111, azimut: 47,  carte: true },
  { nom: 'Avignon',              heures: 1.75, km: 125, azimut: 191, carte: true, horsRegion: true },
  { nom: "Vallon-Pont-d'Arc",    heures: 1.75, km: 102, azimut: 234 },
  { nom: 'Lyon',                 heures: 1.75, km: 131, azimut: 353, carte: true, coin: 'SW' },
  { nom: 'Saint-Étienne',        heures: 2.00, km: 150, azimut: 328, carte: true, coin: 'N' },
];

/**
 * Retirées du schéma le 07/08/2026 : elles dépassent les deux heures de route
 * que Célestin a fixées comme limite du périmètre de déplacement. Elles restent
 * desservies à distance, comme le reste de la France. Conservées ici pour qu'on
 * ne les recalcule pas à chaque fois, et pour qu'on sache pourquoi elles ne
 * figurent pas sur le dessin.
 *   Arles 2 h 00 · Le Puy-en-Velay 2 h 06 · Aix-en-Provence 2 h 11 ·
 *   Chambéry 2 h 11 · Gap 2 h 15 · Annecy 3 h 05 · Clermont-Ferrand 3 h 15
 */

/** Formate un temps de route : 0.72 devient « 45 min », 1.55 devient « 1 h 35 ». */
export function duree(heures: number): string {
  const minutes = Math.round(heures * 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste === 0 ? `${h} h` : `${h} h ${String(reste).padStart(2, '0')}`;
}

/** Position d'une zone sur le schéma radial centré sur Crest. */
export function position(z: Zone, centre: number, pxParHeure: number) {
  const r = z.heures * pxParHeure;
  const a = (z.azimut * Math.PI) / 180;
  return {
    x: Math.round((centre + r * Math.sin(a)) * 10) / 10,
    y: Math.round((centre - r * Math.cos(a)) * 10) / 10,
  };
}

/** Orientation de l'étiquette autour de son point, par quadrant. */
export function ancrage(azimut: number): 'n' | 'e' | 's' | 'o' {
  if (azimut >= 315 || azimut < 45) return 'n';
  if (azimut < 135) return 'e';
  if (azimut < 225) return 's';
  return 'o';
}

const DIRS: Record<NonNullable<Zone['coin']>, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
};

/**
 * Colle chaque nom de ville tout contre sa pastille, dans un coin, sans trait de
 * liaison : Célestin trouvait que les traits point -> étiquette (et le coude
 * qu'ils formaient) faisaient désordre. Le nom est donc simplement posé au coin
 * de son point (haut-gauche, gauche, au-dessus...), assez près pour qu'aucun
 * trait ne soit nécessaire. Seuls restent les rayons Crest -> point.
 *
 * Pour chaque ville on essaie les huit coins et on garde le premier qui reste
 * dans le cadre, ne chevauche ni une autre étiquette, ni les graduations, ni la
 * pastille d'une AUTRE ville (la sienne, elle, est juste à côté, c'est voulu).
 * L'ordre des coins essayés part du coin imposé s'il y en a un (`coin`, la
 * direction artistique : Valence en haut-gauche, Lyon en bas-gauche,
 * Saint-Étienne au-dessus), puis va du plus proche de l'extérieur au plus loin.
 * Les villes qui ont un coin imposé sont traitées en premier, puis les noms les
 * plus larges (les plus durs à caser).
 *
 * ECHELLE réserve les largeurs à l'échelle du DESKTOP, où la carte est grande
 * (720 px) : c'est là que le collage doit être parfait. Sur un téléphone la
 * carte est bien plus petite et les noms, à taille de police fixe, y seraient
 * trop gros pour tenir collés ; le schéma, purement décoratif, y est donc masqué
 * par CSS (la liste chiffrée en dessous porte la même information).
 *
 * `fixes` reçoit des obstacles supplémentaires (les graduations, passées par la
 * page) qu'aucune étiquette ne doit venir toucher.
 */
export function placerEtiquettes(
  zones: Zone[],
  centre: number,
  pxParHeure: number,
  fixes: { x: number; y: number; l: number }[] = [],
) {
  const ECHELLE = 0.9; // largeurs réservées à l'échelle desktop (voir en-tête)
  const HH = 9.5; // demi-hauteur d'une étiquette
  const GAP = 6; // écart entre la pastille et l'étiquette collée
  const MARGE = 3;
  const TAILLE = centre * 2;

  const points = zones.map((z) => position(z, centre, pxParHeure));
  const demiLargeurs = zones.map((z) => ((z.nom.length * 5.6 + 10) * ECHELLE) / 2);

  /* Boîtes déjà occupées : « Crest » au centre, puis les graduations. */
  const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [
    { x0: centre - 22, x1: centre + 22, y0: centre + 22 - HH, y1: centre + 22 + HH },
    ...fixes.map((f) => ({ x0: f.x - f.l / 2, x1: f.x + f.l / 2, y0: f.y - HH, y1: f.y + HH })),
  ];

  const angDist = (a: number, b: number) => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  };

  /* Décalage du centre de l'étiquette par rapport au point, pour un coin donné. */
  const decalage = (dir: number, demiL: number) => {
    const sx = Math.abs(Math.sin((dir * Math.PI) / 180)) < 0.01 ? 0 : Math.sign(Math.sin((dir * Math.PI) / 180));
    const sy = Math.abs(Math.cos((dir * Math.PI) / 180)) < 0.01 ? 0 : -Math.sign(Math.cos((dir * Math.PI) / 180));
    const diag = sx !== 0 && sy !== 0 ? 0.72 : 1; // un coin diagonal serre un peu
    return { dx: sx * (demiL + GAP) * diag, dy: sy * (HH + GAP) * diag };
  };

  const chevauche = (x0: number, x1: number, y0: number, y1: number, propre: { x: number; y: number }) =>
    boxes.some((b) => x0 < b.x1 && b.x0 < x1 && y0 < b.y1 && b.y0 < y1) ||
    points.some((p) => p !== propre && p.x > x0 - 6 && p.x < x1 + 6 && p.y > y0 - 6 && p.y < y1 + 6);

  const resultat: (Zone & { x: number; y: number; ex: number; ey: number; pos: ReturnType<typeof ancrage> })[] =
    new Array(zones.length);

  /* Villes à coin imposé d'abord, puis les noms les plus larges. */
  const coins = Object.keys(DIRS) as NonNullable<Zone['coin']>[];
  const ordre = zones
    .map((_, i) => i)
    .sort((a, b) => (zones[b].coin ? 1 : 0) - (zones[a].coin ? 1 : 0) || demiLargeurs[b] - demiLargeurs[a]);

  for (const i of ordre) {
    const z = zones[i];
    const p = points[i];
    const demiL = demiLargeurs[i];
    const parProximite = [...coins].sort((u, v) => angDist(DIRS[u], z.azimut) - angDist(DIRS[v], z.azimut));
    const essais = z.coin ? [z.coin, ...parProximite.filter((c) => c !== z.coin)] : parProximite;

    let choix: { cx: number; cy: number; x0: number; x1: number; y0: number; y1: number } | null = null;
    for (const coin of essais) {
      const { dx, dy } = decalage(DIRS[coin], demiL);
      const cx = p.x + dx;
      const cy = p.y + dy;
      const x0 = cx - demiL;
      const x1 = cx + demiL;
      const y0 = cy - HH;
      const y1 = cy + HH;
      if (x0 < MARGE || x1 > TAILLE - MARGE || y0 < MARGE || y1 > TAILLE - MARGE) continue;
      if (chevauche(x0, x1, y0, y1, p)) continue;
      choix = { cx, cy, x0, x1, y0, y1 };
      break;
    }
    if (!choix) {
      /* Repli : le coin préféré, même s'il touche un peu (cas très serré). */
      const { dx, dy } = decalage(DIRS[essais[0]], demiL);
      const cx = p.x + dx;
      const cy = p.y + dy;
      choix = { cx, cy, x0: cx - demiL, x1: cx + demiL, y0: cy - HH, y1: cy + HH };
    }

    boxes.push({ x0: choix.x0, x1: choix.x1, y0: choix.y0, y1: choix.y1 });
    resultat[i] = {
      ...z,
      x: p.x,
      y: p.y,
      ex: Math.round(choix.cx * 10) / 10,
      ey: Math.round(choix.cy * 10) / 10,
      pos: ancrage(z.azimut),
    };
  }

  return resultat;
}

export const SUR_CARTE = ZONES.filter((z) => z.carte);
export const HORS_CARTE = ZONES.filter((z) => !z.carte);

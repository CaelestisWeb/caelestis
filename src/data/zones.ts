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
  /** Étiquette placée en priorité, au plus près de son point (villes que
   *  Célestin veut voir collées à leur pastille : Privas, Saint-Étienne). */
  prioriteEtiquette?: boolean;
}

export const ZONES: Zone[] = [
  { nom: 'Étoile-sur-Rhône',     heures: 0.35, km: 18,  azimut: 320 },
  { nom: 'Chabeuil',             heures: 0.45, km: 23,  azimut: 355 },
  { nom: 'Valence',              heures: 0.58, km: 30,  azimut: 336, carte: true },
  { nom: "Pont-de-l'Isère",      heures: 0.70, km: 41,  azimut: 338 },
  { nom: 'Dieulefit',            heures: 0.72, km: 32,  azimut: 172 },
  { nom: 'Romans-sur-Isère',     heures: 0.75, km: 39,  azimut: 4,   carte: true },
  { nom: 'Die',                  heures: 0.75, km: 38,  azimut: 84,  carte: true },
  { nom: 'Privas',               heures: 0.75, km: 39,  azimut: 271, carte: true, prioriteEtiquette: true },
  { nom: 'Montélimar',           heures: 0.83, km: 38,  azimut: 229, carte: true },
  { nom: 'Saint-Marcellin',      heures: 0.98, km: 66,  azimut: 26 },
  { nom: 'Saint-Jean-en-Royans', heures: 1.02, km: 63,  azimut: 33 },
  { nom: 'Nyons',                heures: 1.17, km: 61,  azimut: 167, carte: true },
  { nom: 'Aubenas',              heures: 1.25, km: 68,  azimut: 257, carte: true },
  { nom: 'Vienne',               heures: 1.30, km: 101, azimut: 353 },
  { nom: 'Grenoble',             heures: 1.50, km: 111, azimut: 47,  carte: true },
  { nom: 'Avignon',              heures: 1.75, km: 125, azimut: 191, carte: true, horsRegion: true },
  { nom: "Vallon-Pont-d'Arc",    heures: 1.75, km: 102, azimut: 234 },
  { nom: 'Lyon',                 heures: 1.75, km: 131, azimut: 353, carte: true },
  { nom: 'Saint-Étienne',        heures: 2.00, km: 150, azimut: 328, carte: true, prioriteEtiquette: true },
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

/**
 * Place les étiquettes du schéma sans qu'aucune n'en recouvre une autre, ne
 * masque un point de ville, ni ne vienne toucher les graduations « 1 h » / « 2 h ».
 *
 * Plutôt que de repousser chaque nom en ligne droite vers l'extérieur (ce qui
 * l'envoyait très loin quand le couloir était pris : Privas finissait à 109 px
 * de son point), on cherche pour chacun la place libre LA PLUS PROCHE : on
 * essaie des distances croissantes et, à chaque distance, plusieurs angles
 * autour du rayon de la ville. Une place est libre si elle reste dans le cadre,
 * ne chevauche aucune étiquette déjà posée, et ne recouvre aucun point (le sien
 * comme les autres : le fond crème d'un nom cachait sinon la pastille voisine).
 *
 * L'ordre compte : d'abord les villes prioritaires (Privas, Saint-Étienne, que
 * Célestin veut collées à leur point), puis la plus contrainte d'abord (celle
 * qui a le moins de places libres proches, donc les noms larges comme
 * Romans-sur-Isère ou les secteurs encombrés). Une passe de relaxation rapproche
 * ensuite ce qui peut l'être. La liste de droite, elle, reste triée par temps.
 *
 * Les largeurs de texte sont estimées (environ 5,6 px par signe) puis gonflées
 * par ECHELLE : le schéma est dessiné dans un repère de 420 mais rendu plus
 * étroit sur mobile, alors que les étiquettes gardent leur taille en pixels ; on
 * calcule donc les largeurs comme si l'on était déjà au plus étroit.
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
  const HAUTEUR = 22;
  const ECHELLE = 1.3;
  const PT = 8; // demi-largeur d'un point (pastille + halo) à ne pas recouvrir
  const VT = 17; // idem en hauteur
  const TAILLE = centre * 2;
  const MARGE = 3;
  const DIST = [14, 18, 22, 26, 30, 34, 38, 43, 48, 54, 60, 68, 76, 84, 92];
  const ANG = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 108, -108, 126, -126, 144, -144, 162, -162, 180];

  const points = zones.map((z) => position(z, centre, pxParHeure));
  const largeurs = zones.map((z) => (z.nom.length * 5.6 + 10) * ECHELLE);
  /* « Crest » au centre + les graduations : obstacles présents dès le départ. */
  const fixesObs = [{ x: centre, y: centre + 22, l: 44 }, ...fixes];
  const pos: ({ x: number; y: number } | null)[] = new Array(zones.length).fill(null);

  const obstacles = (sauf: number) =>
    fixesObs.concat(
      zones
        .map((_, i) => i)
        .filter((i) => i !== sauf && pos[i])
        .map((i) => ({ x: pos[i]!.x, y: pos[i]!.y, l: largeurs[i] })),
    );

  const libre = (x: number, y: number, L: number, obs: { x: number; y: number; l: number }[]) => {
    if (x - L / 2 < MARGE || x + L / 2 > TAILLE - MARGE || y - 9.5 < MARGE || y + 9.5 > TAILLE - MARGE) return false;
    if (obs.some((q) => Math.abs(q.x - x) < (q.l + L) / 2 && Math.abs(q.y - y) < HAUTEUR * ECHELLE)) return false;
    if (points.some((q) => Math.abs(q.x - x) < L / 2 + PT && Math.abs(q.y - y) < VT)) return false;
    return true;
  };

  const meilleure = (idx: number, obs: { x: number; y: number; l: number }[]) => {
    const p = points[idx];
    const base = zones[idx].azimut;
    const L = largeurs[idx];
    for (const d of DIST) {
      for (const da of ANG) {
        const a = ((base + da) * Math.PI) / 180;
        const x = p.x + Math.sin(a) * d;
        const y = p.y - Math.cos(a) * d;
        if (libre(x, y, L, obs)) return { x, y, d };
      }
    }
    return null;
  };

  const nbSlots = (idx: number, obs: { x: number; y: number; l: number }[], seuil: number) => {
    const p = points[idx];
    const base = zones[idx].azimut;
    const L = largeurs[idx];
    let n = 0;
    for (const d of DIST) {
      if (d > seuil) break;
      for (const da of ANG) {
        const a = ((base + da) * Math.PI) / 180;
        if (libre(p.x + Math.sin(a) * d, p.y - Math.cos(a) * d, L, obs)) n++;
      }
    }
    return n;
  };

  const repli = (idx: number) => {
    const a = (zones[idx].azimut * Math.PI) / 180;
    return { x: points[idx].x + Math.sin(a) * 68, y: points[idx].y - Math.cos(a) * 68 };
  };

  const reste = new Set(zones.map((_, i) => i));

  // 1) Villes prioritaires : leur meilleure place, avant tout le monde.
  for (let i = 0; i < zones.length; i++) {
    if (zones[i].prioriteEtiquette) {
      pos[i] = meilleure(i, obstacles(i)) ?? repli(i);
      reste.delete(i);
    }
  }

  // 2) La plus contrainte d'abord (le moins de places libres proches).
  while (reste.size) {
    let pick = -1;
    let pn = Infinity;
    let pd = -1;
    for (const idx of reste) {
      const obs = obstacles(idx);
      const n = nbSlots(idx, obs, 38);
      const b = meilleure(idx, obs);
      const bd = b ? b.d : 1e6;
      if (n < pn || (n === pn && bd > pd)) {
        pn = n;
        pd = bd;
        pick = idx;
      }
    }
    pos[pick] = meilleure(pick, obstacles(pick)) ?? repli(pick);
    reste.delete(pick);
  }

  // 3) Relaxation : rapprocher les non-prioritaires de leur point si possible.
  for (let t = 0; t < 6; t++) {
    for (let i = 0; i < zones.length; i++) {
      if (zones[i].prioriteEtiquette) continue;
      const b = meilleure(i, obstacles(i));
      if (b) {
        const actuel = pos[i]!;
        const dOld = Math.hypot(actuel.x - points[i].x, actuel.y - points[i].y);
        if (b.d < dOld - 0.5) pos[i] = { x: b.x, y: b.y };
      }
    }
  }

  return zones.map((z, i) => ({
    ...z,
    x: points[i].x,
    y: points[i].y,
    ex: Math.round(pos[i]!.x * 10) / 10,
    ey: Math.round(pos[i]!.y * 10) / 10,
    pos: ancrage(z.azimut),
  }));
}

export const SUR_CARTE = ZONES.filter((z) => z.carte);
export const HORS_CARTE = ZONES.filter((z) => !z.carte);

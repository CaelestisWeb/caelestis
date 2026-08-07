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
}

export const ZONES: Zone[] = [
  { nom: 'Étoile-sur-Rhône',     heures: 0.35, km: 18,  azimut: 320 },
  { nom: 'Chabeuil',             heures: 0.45, km: 23,  azimut: 355 },
  { nom: 'Valence',              heures: 0.58, km: 30,  azimut: 336, carte: true },
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
  { nom: 'Lyon',                 heures: 1.75, km: 131, azimut: 353, carte: true },
  { nom: 'Saint-Étienne',        heures: 2.00, km: 150, azimut: 328, carte: true },
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
 * Place les étiquettes du schéma sans qu'aucune n'en recouvre une autre, ni ne
 * vienne masquer le point d'une ville voisine.
 *
 * Un simple ancrage par quadrant ne suffit pas : avec les temps de route,
 * Privas (45 min, azimut 271), Montélimar (50 min, 229) et Aubenas (1 h 15, 257)
 * tombent dans le même secteur sud-ouest et se superposaient, tout comme Lyon et
 * Saint-Étienne au nord. Chaque étiquette est donc posée sur le rayon de sa
 * ville, puis repoussée vers l'extérieur tant qu'elle croise une autre étiquette
 * OU le point d'une autre ville : sans ce second test, le fond crème d'un nom
 * pouvait se poser sur la pastille d'une ville voisine et la masquer. Le point,
 * lui, ne bouge jamais : la direction et la distance restent exactes, seule
 * l'étiquette s'écarte, reliée à son point par le rayon tracé jusqu'à elle.
 *
 * Les étiquettes les plus longues (Romans-sur-Isère, Saint-Étienne) sont
 * traitées en premier : ce sont les plus dures à caser, et les garder pour la
 * fin les repoussait hors du cadre. La liste de droite, elle, reste triée par
 * temps de route.
 *
 * Les largeurs de texte sont estimées (0,7 rem, environ 5,6 px par signe) : le
 * calcul se fait au build, sans navigateur. Marge volontairement large, un
 * chevauchement se voit, un écart d'un pixel non.
 */
export function placerEtiquettes(zones: Zone[], centre: number, pxParHeure: number) {
  /* Deux réglages viennent de mesures au navigateur, ne pas les baisser :
     — HAUTEUR à 22 et non 15, parce que l'étiquette porte un fond et une marge :
       sa boîte réelle mesure 19 px. Avec 15, Montélimar et Aubenas passaient le
       test au build et se recouvraient à l'affichage.
     — ÉCHELLE à 1,3, parce que le schéma est dessiné dans un repère de 420 mais
       rendu à 327 px sur un téléphone de 375, alors que les étiquettes, elles,
       gardent leur taille en pixels. Les positions se resserrent de 22 %, pas le
       texte : six étiquettes se recouvraient en mobile alors que le desktop
       était propre. On calcule donc les largeurs comme si l'on était déjà au
       plus étroit. */
  const HAUTEUR = 22;
  const ECHELLE = 1.3;
  const PAS = 13;
  const ESSAIS = 10;
  /* PT et VT : demi-tailles, en largeur et en hauteur, du point (pastille de
     8 px et son halo crème) qu'une étiquette ne doit jamais recouvrir. */
  const PT = 8;
  const VT = 17;

  /* Tous les points sont calculés d'avance : ils servent aussi d'obstacles,
     pour qu'aucune étiquette ne vienne se poser sur l'un d'eux. */
  const points = zones.map((z) => position(z, centre, pxParHeure));

  /* Ordre de placement : les noms les plus longs en premier (voir en-tête). Le
     résultat, lui, est réécrit dans l'ordre d'origine des villes. */
  const ordre = zones.map((_, i) => i).sort((a, b) => zones[b].nom.length - zones[a].nom.length);

  /* La case du centre est occupée d'avance par l'étiquette « Crest », posée
     vingt-deux pixels sous le point de départ, valeur relevée au navigateur et
     non déduite du CSS. Sans elle dans la liste, Montélimar, la plus proche du
     centre par le sud, venait se poser dessus. */
  const posees: { x: number; y: number; l: number }[] = [
    { x: centre, y: centre + 22, l: 44 },
  ];
  const resultat: (Zone & { x: number; y: number; ex: number; ey: number; pos: ReturnType<typeof ancrage> })[] = new Array(zones.length);

  for (const idx of ordre) {
    const z = zones[idx];
    const p = points[idx];
    const a = (z.azimut * Math.PI) / 180;
    const largeur = (z.nom.length * 5.6 + 10) * ECHELLE;

    let ecart = 18;
    let x = p.x + Math.sin(a) * ecart;
    let y = p.y - Math.cos(a) * ecart;

    for (let i = 0; i < ESSAIS; i++) {
      const surEtiquette = posees.some(
        (q) => Math.abs(q.x - x) < (q.l + largeur) / 2 && Math.abs(q.y - y) < HAUTEUR * ECHELLE,
      );
      const surPoint = points.some(
        (q, j) => j !== idx && Math.abs(q.x - x) < largeur / 2 + PT && Math.abs(q.y - y) < VT,
      );
      if (!surEtiquette && !surPoint) break;
      ecart += PAS;
      x = p.x + Math.sin(a) * ecart;
      y = p.y - Math.cos(a) * ecart;
    }

    posees.push({ x, y, l: largeur });
    resultat[idx] = {
      ...z,
      x: p.x,
      y: p.y,
      ex: Math.round(x * 10) / 10,
      ey: Math.round(y * 10) / 10,
      pos: ancrage(z.azimut),
    };
  }

  return resultat;
}

export const SUR_CARTE = ZONES.filter((z) => z.carte);
export const HORS_CARTE = ZONES.filter((z) => !z.carte);

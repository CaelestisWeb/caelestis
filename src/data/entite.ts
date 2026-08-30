/**
 * entite.ts : l'identité de Caelestis telle que les moteurs doivent la lire.
 *
 * Source unique. Avant le 21/08/2026, les coordonnées, le logo et la liste des
 * profils étaient recopiés dans trois schémas (deux dans index.astro, un dans
 * a-propos.astro). Trois copies, c'est trois occasions de diverger, et un moteur
 * qui lit deux valeurs différentes pour la même entreprise ne sait pas laquelle
 * croire. Toute page qui parle de l'entreprise lit désormais ce fichier.
 *
 * Même principe que src/utils/tarifs.ts pour les prix et src/data/zones.ts pour
 * le périmètre : la donnée vit à un seul endroit.
 */

export const SITE = 'https://caelestis.fr';

/**
 * Le logo, au sens où Google l'entend : une image carrée, en PNG ou JPG, qui
 * représente la marque.
 *
 * Ce qui était déclaré avant, et pourquoi c'était faux, relevé le 21/08/2026 :
 *   - ProfessionalService pointait vers favicon.svg, 340 octets. Google demande
 *     un format matriciel pour le logo, le SVG n'est pas retenu.
 *   - Organization pointait vers og-image-2026.jpg, une bannière 1200 par 630.
 *     Une bannière n'est pas un logo : le rapport doit être proche du carré,
 *     sans quoi l'image est écartée pour le panneau de connaissance.
 *
 * icon-512.png fait 512 par 512, c'est le même dessin que le favicon.
 */
export const LOGO = {
  url: `${SITE}/icon-512.png`,
  largeur: 512,
  hauteur: 512,
} as const;

/** L'image de partage, celle des aperçus sur les réseaux. Ce n'est pas le logo. */
export const IMAGE_PARTAGE = `${SITE}/og-image-2026.jpg`;

export const CONTACT = {
  email: 'contact@caelestis.fr',
  telephone: '+33769362727',
  telephoneAffiche: '07 69 36 27 27',
} as const;

export const ADRESSE = {
  '@type': 'PostalAddress',
  addressLocality: 'Crest',
  addressRegion: 'Drôme',
  postalCode: '26400',
  addressCountry: 'FR',
} as const;

/** Crest, mairie. Sert au geo du schéma et au centre du périmètre. */
export const COORDONNEES = { latitude: '44.7308', longitude: '5.0197' } as const;

/**
 * Identifiant de l'entreprise dans le Knowledge Graph de Google.
 *
 * Il sert à `identifier` : c'est la façon la moins ambiguë de dire à Google
 * « l'entreprise décrite ici est celle que tu connais déjà sous cet identifiant ».
 * Utile parce que le nom Caelestis est partagé : le domaine a d'abord hébergé une
 * communauté de jeu vidéo, dont des pages figurent encore dans les index.
 *
 * Corrigé le 30/08/2026. La valeur précédente, `/g/11nk0p5w4n`, venait d'un lien
 * de partage ; testée sur `google.com/search?kgmid=`, elle répond « aucun document
 * ne correspond ». La valeur ci-dessous vient du paramètre `16s` de l'URL Maps de
 * la fiche, et la même recherche affiche alors la fiche et le site.
 *
 * Pour la revérifier : ouvrir `google.com/maps?cid=4976660435782760136`, lire la
 * portion `16s%2Fg%2F…` de l'URL une fois la fiche chargée, puis contrôler avec
 * `google.com/search?kgmid=/g/…`.
 */
export const KGMID = '/g/11zdrv5m9q';

/**
 * L'adresse stable de la fiche d'établissement sur Maps, construite sur le CID
 * (identifiant public du lieu, relevé le 30/08/2026). Elle alimente `hasMap`,
 * la propriété que schema.org réserve à la carte d'un lieu : le site déclare
 * ainsi lui-même le lien vers sa fiche, en plus du `identifier` ci-dessus.
 *
 * Le CID reste hors des identifiants visibles dans l'interface Google Business,
 * qui affiche des numéros internes : celui-ci se lit dans l'URL Maps de la fiche
 * (second hexadécimal après `!1s`, converti en décimal).
 */
export const FICHE_GOOGLE = 'https://www.google.com/maps?cid=4976660435782760136';

/**
 * Les profils officiels, pour `sameAs`.
 *
 * Deux règles. D'abord, uniquement des profils que l'entreprise contrôle et qui
 * la nomment : un profil tiers ou un annuaire subi n'a rien à faire ici. Ensuite,
 * l'URL finale, jamais un lien de partage : `share.google/…` redirige deux fois
 * avant d'arriver quelque part, et une redirection est un signal plus faible
 * qu'une adresse stable.
 *
 * La fiche d'établissement n'y figure pas volontairement : Google la relie déjà
 * au site par la validation du domaine, et `identifier` porte le kgmid.
 */
export const PROFILS: string[] = [
  'https://www.facebook.com/CaelestisWeb',
  'https://www.instagram.com/caelestis_web/',
];

/** Les horaires réels, du lundi au samedi. */
export const HORAIRES = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  opens: '09:00',
  closes: '18:00',
} as const;

/**
 * Le territoire desservi, tel qu'il est déclaré aux moteurs. L'ordre va du plus
 * précis au plus large : c'est ainsi qu'on lit une couverture, et les deux
 * départements d'ancrage passent avant la région.
 */
export const TERRITOIRE = [
  { '@type': 'AdministrativeArea', name: 'Drôme' },
  { '@type': 'AdministrativeArea', name: 'Ardèche' },
  { '@type': 'AdministrativeArea', name: 'Auvergne-Rhône-Alpes' },
  { '@type': 'Country', name: 'France' },
] as const;

/** Le bloc `identifier` commun aux schémas d'entreprise. */
export const IDENTIFIANT = {
  '@type': 'PropertyValue',
  propertyID: 'Google Knowledge Graph',
  value: KGMID,
} as const;

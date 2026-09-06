/* Seconde serie de pistes, septembre 2026 : la nature et le web dans la
   meme forme.

   Regle de dessin commune : ne retenir que les endroits ou une forme du
   vivant et une forme du web sont deja la meme forme. Une arborescence est
   le plan d'un site et la charpente d'un arbre. Une balise se ferme par une
   barre oblique, qui est le dessin d'une nervure. Une lentille de loupe et
   une feuille ont la meme amande. Une fleche de croissance et une jeune
   pousse font le meme geste.

   Palette, typographie et epaisseur de trait identiques a la premiere serie.
   Les formes vegetales sont geometriques, arcs de cercle et segments : la
   charte ecarte les feuilles illustrees, et cette serie s'y tient. */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const DOSSIER = dirname(fileURLToPath(import.meta.url));

const f = (n) => +n.toFixed(3);

/* ── Amande : deux arcs de cercle, pointes sur l'axe long. `l` est la
      largeur, `h` la longueur, `rot` l'inclinaison en degres. C'est la forme
      commune a la feuille, a la lentille et a la cime. ─────────────────── */
const rayonAmande = (l, h) => f(((l / 2) ** 2 + (h / 2) ** 2) / l);

function amande(cx, cy, l, h, rot, { couleur, trait = 0 } = {}) {
  const R = rayonAmande(l, h), dy = f(h / 2);
  const d = `M0 ${-dy}A${R} ${R} 0 0 1 0 ${dy}A${R} ${R} 0 0 1 0 ${-dy}Z`;
  const peinture = trait
    ? `fill="none" stroke="${couleur}" stroke-width="${trait}" stroke-linejoin="round"`
    : `fill="${couleur}"`;
  return `<path transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})" d="${d}" ${peinture}/>`;
}

/* Les deux cercles porteurs d'une amande, pour la planche de construction. */
function cerclesAmande(cx, cy, l, h, rot) {
  const R = rayonAmande(l, h);
  const e = f(R - l / 2);
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">`
    + `<circle cx="${-e}" cy="0" r="${R}" fill="none"/><circle cx="${e}" cy="0" r="${R}" fill="none"/>`
    + `<line x1="0" y1="${f(-h / 2 - 6)}" x2="0" y2="${f(h / 2 + 6)}"/></g>`;
}

/* ══ 1. L'Arborescence : le plan d'un site a la forme d'un arbre ══════ */
function arborescence(c, { petit = false } = {}) {
  if (petit) {
    return `<g fill="none" stroke="${c}" stroke-linecap="butt">`
      + `<path d="M50 95L50 32" stroke-width="13"/><path d="M50 58L18 36M50 58L82 36" stroke-width="10"/></g>`
      + `<g fill="${c}"><circle cx="18" cy="36" r="9.5"/><circle cx="82" cy="36" r="9.5"/><circle cx="50" cy="30" r="9.5"/></g>`;
  }
  return `<g fill="none" stroke="${c}" stroke-linecap="butt">`
    + `<path d="M50 95L50 30" stroke-width="9.5"/>`
    + `<path d="M50 78L30 64M50 78L70 64" stroke-width="7"/>`
    + `<path d="M50 55L20 37M50 55L80 37" stroke-width="7"/></g>`
    + `<g fill="${c}"><circle cx="30" cy="64" r="7"/><circle cx="70" cy="64" r="7"/>`
    + `<circle cx="20" cy="37" r="7"/><circle cx="82" cy="37" r="7"/><circle cx="50" cy="28" r="7"/></g>`;
}

/* ══ 2. La Balise : le chevron, la barre oblique, le chevron ══════════
   Les trois traits de la balise fermante dessinent une feuille, et la barre
   oblique en devient la nervure. Le jour aux deux pointes doit rester
   visible, sinon les trois signes se referment en un contour ordinaire. */
function balise(c, { petit = false } = {}) {
  /* L'arc est decrit par sa corde et sa fleche, pas par le rayon du contour
     complet : trimmer un arc en gardant son rayon reduit la panse de la
     feuille sans prevenir, et la premiere version sortait a 42 unites de
     large pour 73 de haut. */
  const yA = petit ? 16 : 18, yB = petit ? 84 : 82;
  const fleche = petit ? 25 : 22, e = petit ? 3.5 : 3;
  const w = petit ? 11 : 9;
  const R = f((fleche * fleche + ((yB - yA) / 2) ** 2) / (2 * fleche));
  return `<g fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round">`
    + `<path d="M${50 - e} ${yA}A${R} ${R} 0 0 0 ${50 - e} ${yB}"/>`
    + `<path d="M${50 + e} ${yA}A${R} ${R} 0 0 1 ${50 + e} ${yB}"/>`
    + `<path d="M41 72L59 28" stroke-width="${w - 1}"/></g>`;
}

/* ══ 3. La Fenetre : l'arbre dans l'ecran ════════════════════════════
   Le cadre est un filet fin, la cime est pleine : ce n'est pas un ordinateur
   qui contient un arbre, c'est un arbre que l'ecran encadre. La cime est une
   amande et non un rond, ce qui l'ecarte de l'arbre de dessin anime. */
function fenetre(c, { petit = false } = {}) {
  const w = petit ? 7.5 : 5.5;
  const cime = petit ? { l: 34, h: 50, cy: 43 } : { l: 28, h: 46, cy: 44 };
  return `<rect x="10" y="20" width="80" height="60" rx="8" fill="none" stroke="${c}" stroke-width="${w}"/>`
    + `<path d="M50 74L50 58" stroke="${c}" stroke-width="${petit ? 9 : 7.5}" fill="none"/>`
    + amande(50, cime.cy, cime.l, cime.h, 0, { couleur: c });
}

/* ══ 4. La Loupe : la lentille et la feuille ont la meme amande ═══════ */
function loupe(c, { petit = false } = {}) {
  const w = petit ? 11 : 9;
  return amande(40, 38, petit ? 44 : 40, 62, -45, { couleur: c, trait: w })
    + `<path d="M62 60L86 84" stroke="${c}" stroke-width="${petit ? 14 : 12}" stroke-linecap="round" fill="none"/>`;
}

/* ══ 5. La Pousse : la fleche de croissance et la jeune pousse ════════ */
function pousse(c, { petit = false } = {}) {
  const l = petit ? 24 : 21;
  return `<path d="M50 94L50 48" stroke="${c}" stroke-width="${petit ? 12 : 10}" stroke-linecap="butt" fill="none"/>`
    + amande(33, 34, l, 52, 36, { couleur: c })
    + amande(67, 34, l, 52, -36, { couleur: c });
}

export const PISTES = [
  { cle: 'arborescence', nom: "L'Arborescence", signe: arborescence, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.44, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.45, occupation: 0.66, occupationPetit: 0.74 },
  { cle: 'balise', nom: 'La Balise', signe: balise, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.44, ecartH: 0.26, ecartV: 0.20, largeurMotV: 1.55, occupation: 0.64, occupationPetit: 0.72 },
  { cle: 'fenetre', nom: 'La Fenêtre', signe: fenetre, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.56, ecartH: 0.26, ecartV: 0.22, largeurMotV: 1.05, occupation: 0.60, occupationPetit: 0.70 },
  { cle: 'loupe', nom: 'La Loupe', signe: loupe, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.46, ecartH: 0.26, ecartV: 0.20, largeurMotV: 1.3, occupation: 0.64, occupationPetit: 0.72 },
  { cle: 'pousse', nom: 'La Pousse', signe: pousse, mot: 'Caelestis', cadre: 'encre', ratioMot: 0.42, ecartH: 0.24, ecartV: 0.20, largeurMotV: 1.5, occupation: 0.66, occupationPetit: 0.74 },
];

/* ── Reperes de construction, memes valeurs que les signes ─────────── */
const axe = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

export const REPERES = {
  arborescence: () => axe(50, -4, 50, 104) + axe(-4, 28, 104, 28) + axe(-4, 37, 104, 37)
    + axe(-4, 64, 104, 64) + axe(-4, 95, 104, 95)
    + axe(50, 55, 20, 37) + axe(50, 55, 82, 37) + axe(50, 78, 30, 64) + axe(50, 78, 70, 64),

  balise: () => {
    const fleche = 22, R = f((fleche * fleche + 32 * 32) / (2 * fleche)), e = f(R - fleche);
    return `<circle cx="${f(53 + e)}" cy="50" r="${R}" fill="none"/><circle cx="${f(47 - e)}" cy="50" r="${R}" fill="none"/>`
      + axe(50, -4, 50, 104) + axe(-4, 18, 104, 18) + axe(-4, 82, 104, 82) + axe(41, 72, 59, 28);
  },

  fenetre: () => `<rect x="10" y="20" width="80" height="60" rx="8" fill="none"/>`
    + cerclesAmande(50, 44, 28, 46, 0) + axe(50, -4, 50, 104) + axe(-4, 74, 104, 74),

  loupe: () => cerclesAmande(40, 38, 40, 62, -45) + axe(10, 8, 96, 94),

  pousse: () => cerclesAmande(33, 34, 21, 52, 36) + cerclesAmande(67, 34, 21, 52, -36)
    + axe(50, -4, 50, 104) + axe(-4, 48, 104, 48),
};

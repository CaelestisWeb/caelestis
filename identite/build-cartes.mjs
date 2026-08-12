/* Cartes de visite, ecrites dans identite/logo/impression/.

   Les deux pistes de la charte, recto et verso, au format francais 85 x 55 mm
   avec 3 mm de fond perdu sur chaque bord, soit un fichier de 91 x 61 mm.
   Deux sorties par face :
     .pdf  vectoriel, texte en traces, a envoyer a l'imprimeur
     .png  300 points par pouce, 1075 x 721 px, pour Canva et les apercus

   Une carte se decrit une seule fois, sous forme de liste d'elements, et deux
   moteurs la dessinent : l'un en SVG pour l'image, l'autre en PDF. Aucune
   police n'est embarquee, tout est trace, le rendu est donc identique chez
   l'imprimeur et a l'ecran.

   Lancement : node identite/build-cartes.mjs */

import { createWriteStream, mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import { police, VERT, CREME } from './lib-traces.mjs';

const SORTIE = 'C:/dev/caelestis/identite/logo/impression';
mkdirSync(SORTIE, { recursive: true });

/* Couleurs de la charte utilisees sur les cartes */
const ENCRE = '#12160F';
const PIERRE = '#5C6259';
const SAUGE = '#B8C4BB';
const SAUGE_TEXTE = '#2E7452';
const SAUGE_PALE = '#E3EFE8';

/* Geometrie, en millimetres */
const FOND_PERDU = 3;
const CARTE_L = 85;
const CARTE_H = 55;
const L = CARTE_L + FOND_PERDU * 2; // 91
const H = CARTE_H + FOND_PERDU * 2; // 61
const PAD_X = FOND_PERDU + 7;       // marges interieures de la charte
const PAD_Y = FOND_PERDU + 8;
const DROITE = L - PAD_X;
const BAS = H - PAD_Y;

const mm = (v) => (v * 72) / 25.4; // millimetres vers points PostScript

const f400 = police(400);
const f500 = police(500);
const f700 = police(700);

/* Glyphes d'un texte, en unites du dessin (millimetres ici). Sert aux deux
   moteurs : le SVG pose les chemins, le PDF les redessine a l'identique. */
function glyphes(font, texte, taille, ls = 0) {
  const k = taille / font.unitsPerEm;
  const run = font.layout(texte);
  let plume = 0;
  let haut = Infinity;
  let bas = -Infinity;
  const liste = [];
  run.glyphs.forEach((g, i) => {
    const d = g.path.toSVG();
    if (d) liste.push({ d, x: plume + (run.positions[i].xOffset || 0) * k });
    if (g.bbox && g.bbox.width > 0) {
      haut = Math.min(haut, -g.bbox.maxY * k);
      bas = Math.max(bas, -g.bbox.minY * k);
    }
    plume += run.positions[i].xAdvance * k + ls;
  });
  return { liste, k, avance: plume - ls, haut, bas };
}

/* ── Description d'une carte ───────────────────────────────── */
const fond = (couleur) => ({ type: 'fond', couleur });
const filet = (x, y, l, h, couleur) => ({ type: 'filet', x, y, l, h, couleur });
const mono = (x, y, largeur, couleur) => ({ type: 'mono', x, y, largeur, couleur });

/* `y` designe le sommet de l'encre, jamais la ligne de base : c'est ce que
   l'oeil aligne et ce que mesure la maquette de la charte. */
function texte(contenu, x, y, { taille, poids = 400, ls = 0, couleur = ENCRE, capitales = false, align = 'gauche' } = {}) {
  const t = capitales ? contenu.toLocaleUpperCase('fr-FR') : contenu;
  const font = poids === 700 ? f700 : poids === 500 ? f500 : f400;
  const g = glyphes(font, t, taille, ls);
  const gauche = align === 'droite' ? x - g.avance : x;
  return { type: 'texte', g, x: gauche, base: y - g.haut, couleur };
}

/* Bloc de coordonnees, interligne 1,75 comme la maquette */
function coordonnees(x, y, couleur, taille = 3) {
  const inter = taille * 1.75;
  return [
    texte('07 69 36 27 27', x, y, { taille, poids: 500, couleur }),
    texte('contact@caelestis.fr', x, y + inter, { taille, couleur }),
    texte('caelestis.fr', x, y + inter * 2, { taille, couleur }),
  ];
}

const ROLE = { taille: 2.7, poids: 500, ls: 2.7 * 0.13, capitales: true };
const NOM = { taille: 5.4, poids: 700, ls: 5.4 * -0.035 };

const CARTES = {
  'piste-A-recto': [
    fond(VERT),
    mono(PAD_X, PAD_Y, 13, CREME),
    texte('Célestin', PAD_X, BAS - 9.5, { ...NOM, couleur: CREME }),
    texte('Fondateur', PAD_X, BAS - 2.4, { ...ROLE, couleur: SAUGE_PALE }),
  ],
  'piste-A-verso': [
    fond(CREME),
    texte('Caelestis', PAD_X, PAD_Y, { taille: 2.6, poids: 500, ls: 2.6 * 0.13, couleur: SAUGE_TEXTE, capitales: true }),
    filet(PAD_X, 24, 9, 0.5, SAUGE),
    ...coordonnees(PAD_X, 28, PIERRE),
    texte('Création de sites internet et référencement, Drôme', PAD_X, BAS - 1.8, { taille: 2.5, couleur: PIERRE }),
  ],
  'piste-B-recto': [
    fond(CREME),
    { type: 'lockup', x: PAD_X, y: 20, largeur: 46, couleur: VERT },
    texte('Sites internet et référencement', PAD_X, 33.5, { taille: 2.7, poids: 500, ls: 2.7 * 0.1, couleur: SAUGE_TEXTE, capitales: true }),
  ],
  'piste-B-verso': [
    fond(VERT),
    texte('Célestin', PAD_X, 18, { taille: 4.6, poids: 700, ls: 4.6 * -0.035, couleur: CREME }),
    texte('Fondateur', PAD_X, 24.8, { ...ROLE, couleur: SAUGE_PALE }),
    ...coordonnees(PAD_X, 33.5, SAUGE_PALE),
  ],
};

/* ── Monogramme et lockup, geometrie de la charte ──────────── */
/* Encre du C : 13,5 a 72,2 en largeur et 13,5 a 86,5 en hauteur d'une tuile
   de 100. Les elements sont poses sur cette encre, pas sur la tuile. */
const ENCRE_MONO = { x: 13.5, y: 13.5, l: 58.7, h: 73 };
const arcC = 'M67.66 27 A29 29 0 1 0 67.66 73';

function monoSVG({ x, y, largeur, couleur }) {
  const k = largeur / ENCRE_MONO.l;
  return `<g transform="translate(${(x - ENCRE_MONO.x * k).toFixed(3)} ${(y - ENCRE_MONO.y * k).toFixed(3)}) scale(${k.toFixed(5)})"><path d="${arcC}" fill="none" stroke="${couleur}" stroke-width="15"/></g>`;
}

function monoPDF(doc, { x, y, largeur, couleur }) {
  const k = largeur / ENCRE_MONO.l;
  doc.save();
  doc.translate(mm(x - ENCRE_MONO.x * k), mm(y - ENCRE_MONO.y * k)).scale(mm(k));
  doc.path(arcC).lineWidth(15).strokeColor(couleur).stroke();
  doc.restore();
}

/* Lockup horizontal : tuile de 100 puis mot a 82 %, ecart de 28 %. */
function lockupParts(largeur, couleur) {
  const g = glyphes(f500, 'Caelestis', 100 * 0.82, 100 * 0.82 * -0.02);
  const totalUnites = 100 + 28 + g.avance;
  const k = largeur / totalUnites;
  return { g, k, mono: { largeur: 100 * k }, motX: (100 + 28) * k, base: 79.52 * k };
}

/* ── Moteur SVG ────────────────────────────────────────────── */
function versSVG(elements) {
  const corps = elements
    .map((e) => {
      if (e.type === 'fond') return `<rect width="${L}" height="${H}" fill="${e.couleur}"/>`;
      if (e.type === 'filet') return `<rect x="${e.x}" y="${e.y}" width="${e.l}" height="${e.h}" fill="${e.couleur}"/>`;
      if (e.type === 'mono') return monoSVG({ ...e, largeur: (e.largeur * ENCRE_MONO.l) / 100 });
      if (e.type === 'lockup') {
        const p = lockupParts(e.largeur, e.couleur);
        const mots = p.g.liste
          .map((c) => `<path transform="translate(${(e.x + p.motX + c.x * p.k).toFixed(3)} ${(e.y + p.base).toFixed(3)}) scale(${(p.g.k * p.k).toFixed(6)} ${(-p.g.k * p.k).toFixed(6)})" d="${c.d}"/>`)
          .join('');
        return `${monoSVG({ x: e.x + (ENCRE_MONO.x * p.mono.largeur) / 100, y: e.y + (ENCRE_MONO.y * p.mono.largeur) / 100, largeur: (p.mono.largeur * ENCRE_MONO.l) / 100, couleur: e.couleur })}<g fill="${e.couleur}">${mots}</g>`;
      }
      const chemins = e.g.liste
        .map((c) => `<path transform="translate(${(e.x + c.x).toFixed(3)} ${e.base.toFixed(3)}) scale(${e.g.k.toFixed(6)} ${(-e.g.k).toFixed(6)})" d="${c.d}"/>`)
        .join('');
      return `<g fill="${e.couleur}">${chemins}</g>`;
    })
    .join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}mm" height="${H}mm" viewBox="0 0 ${L} ${H}">\n  ${corps}\n</svg>`;
}

/* ── Moteur PDF ────────────────────────────────────────────── */
function versPDF(elements, chemin) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [mm(L), mm(H)], margin: 0 });
    const flux = doc.pipe(createWriteStream(chemin));
    flux.on('finish', resolve);
    flux.on('error', reject);

    for (const e of elements) {
      if (e.type === 'fond') {
        doc.rect(0, 0, mm(L), mm(H)).fill(e.couleur);
      } else if (e.type === 'filet') {
        doc.rect(mm(e.x), mm(e.y), mm(e.l), mm(e.h)).fill(e.couleur);
      } else if (e.type === 'mono') {
        monoPDF(doc, { ...e, largeur: (e.largeur * ENCRE_MONO.l) / 100 });
      } else if (e.type === 'lockup') {
        const p = lockupParts(e.largeur, e.couleur);
        monoPDF(doc, {
          x: e.x + (ENCRE_MONO.x * p.mono.largeur) / 100,
          y: e.y + (ENCRE_MONO.y * p.mono.largeur) / 100,
          largeur: (p.mono.largeur * ENCRE_MONO.l) / 100,
          couleur: e.couleur,
        });
        doc.save();
        doc.translate(mm(e.x + p.motX), mm(e.y + p.base)).scale(mm(p.g.k * p.k), -mm(p.g.k * p.k));
        p.g.liste.forEach((c) => doc.save().translate(c.x / p.g.k, 0).path(c.d).fillColor(e.couleur).fill().restore());
        doc.restore();
      } else {
        doc.save();
        doc.translate(mm(e.x), mm(e.base)).scale(mm(e.g.k), -mm(e.g.k));
        e.g.liste.forEach((c) => doc.save().translate(c.x / e.g.k, 0).path(c.d).fillColor(e.couleur).fill().restore());
        doc.restore();
      }
    }
    doc.end();
  });
}

/* ── Fabrication ───────────────────────────────────────────── */
for (const [nom, elements] of Object.entries(CARTES)) {
  const svg = versSVG(elements);
  writeFileSync(`${SORTIE}/carte-${nom}.svg`, svg);
  await sharp(Buffer.from(svg), { density: 300 })
    .resize({ width: Math.round((L / 25.4) * 300) })
    .png()
    .toFile(`${SORTIE}/carte-${nom}-300dpi.png`);
  await versPDF(elements, `${SORTIE}/carte-${nom}.pdf`);
}

console.log(`identite/logo/impression : ${Object.keys(CARTES).length} faces en PDF, PNG 300 dpi et SVG.`);

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
import { police, LOCKUP, ENCRE_MONO, DECALAGE_OPTIQUE_MONO, VERT, CREME } from './lib-traces.mjs';

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
  let gauche = Infinity;
  let droite = -Infinity;
  const liste = [];
  run.glyphs.forEach((g, i) => {
    const d = g.path.toSVG();
    const px = plume + (run.positions[i].xOffset || 0) * k;
    if (d) liste.push({ d, x: px });
    if (g.bbox && g.bbox.width > 0) {
      haut = Math.min(haut, -g.bbox.maxY * k);
      bas = Math.max(bas, -g.bbox.minY * k);
      gauche = Math.min(gauche, px + g.bbox.minX * k);
      droite = Math.max(droite, px + g.bbox.maxX * k);
    }
    plume += run.positions[i].xAdvance * k + ls;
  });
  return { liste, k, avance: plume - ls, haut, bas, gauche, droite, largeur: droite - gauche };
}

/* ── Geometrie du monogramme, partagee avec les logos ──────────
   Tout se pose sur l'encre du C, jamais sur sa tuile : le trajet passe par la
   gauche et s'arrete a l'ouverture, la tuile porte donc du vide a droite qui
   fausserait tout alignement. Les fractions viennent de lib-traces, source
   unique partagee avec les logos et les visuels sociaux. */
const ENC_L = ENCRE_MONO.x1 - ENCRE_MONO.x0;   // 0,587 de la tuile
const ENC_H = ENCRE_MONO.y1 - ENCRE_MONO.y0;   // 0,730 de la tuile
const arcC = 'M67.66 27 A29 29 0 1 0 67.66 73';

/* ── Description d'une carte ───────────────────────────────── */
const fond = (couleur) => ({ type: 'fond', couleur });
const filet = (x, y, l, h, couleur) => ({ type: 'filet', x, y, l, h, couleur });
/* `largeur` est celle de l'encre du C, comme dans la maquette de la charte ou
   le monogramme nu est pose a 13 mm de large. */
const mono = (x, y, largeur, couleur) => ({ type: 'mono', x, y, largeur, couleur });

/* `y` designe le sommet de l'encre, jamais la ligne de base : c'est ce que
   l'oeil aligne et ce que mesure la maquette de la charte. Avec ancre 'bas',
   `y` designe au contraire le pied de l'encre, ce qui sert a caler un bloc sur
   la marge basse sans dependre de la hauteur de ses capitales. */
function texte(contenu, x, y, { taille, poids = 400, ls = 0, couleur = ENCRE, capitales = false, align = 'gauche', ancre = 'haut' } = {}) {
  const t = capitales ? contenu.toLocaleUpperCase('fr-FR') : contenu;
  const font = poids === 700 ? f700 : poids === 500 ? f500 : f400;
  const g = glyphes(font, t, taille, ls);
  const gauche = align === 'droite' ? x - g.avance : x;
  return { type: 'texte', g, x: gauche, base: y - (ancre === 'bas' ? g.bas : g.haut), couleur };
}

/* Sommet de l'encre d'un texte deja place. */
const sommet = (e) => e.base + e.g.haut;

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

/* ── Calage vertical ───────────────────────────────────────────
   Les positions sont d'abord posees a la main, puis le bloc entier est cale
   par mesure de son encre. Ecrire des coordonnees justes du premier coup est
   illusoire : la hauteur d'un texte depend de ses capitales et de ses
   accents, deux libelles differents ne donnent pas la meme boite. */
function boiteY(elements) {
  let haut = Infinity, bas = -Infinity;
  for (const e of elements) {
    let y0, y1;
    if (e.type === 'fond') continue;
    else if (e.type === 'texte') { y0 = e.base + e.g.haut; y1 = e.base + e.g.bas; }
    else if (e.type === 'filet') { y0 = e.y; y1 = e.y + e.h; }
    else if (e.type === 'mono') { y0 = e.y; y1 = e.y + (e.largeur * ENC_H) / ENC_L; }
    else if (e.type === 'lockup') { y0 = e.y; y1 = e.y + (lockupParts(e.largeur).monoLargeur * ENC_H) / ENC_L; }
    else continue;
    haut = Math.min(haut, y0); bas = Math.max(bas, y1);
  }
  return { haut, bas, hauteur: bas - haut };
}

function decaler(elements, dy) {
  return elements.map((e) => {
    if (e.type === 'fond') return e;
    if (e.type === 'texte') return { ...e, base: +(e.base + dy).toFixed(3) };
    return { ...e, y: +(e.y + dy).toFixed(3) };
  });
}

/* Bloc centre entre le haut et le bas de la carte. */
const centrer = (elements) => decaler(elements, (H - boiteY(elements).hauteur) / 2 - boiteY(elements).haut);

/* Bloc cale de sorte que son encre laisse exactement `marge` en haut et en bas.
   La composition interne, elle, reste telle qu'ecrite. */
const caler = (elements, marge) => decaler(elements, marge - boiteY(elements).haut);

/* Pistes A, composition en vis-a-vis : le monogramme cale sur la marge haute,
   le bloc d'identite sur la marge basse. Les deux marges sont donc egales par
   construction, quelle que soit la hauteur des textes. */
const roleRecto = texte('Fondateur', PAD_X, BAS, { ...ROLE, couleur: SAUGE_PALE, ancre: 'bas' });
const ECART_NOM_ROLE = 1.6;  // margin-top du role dans la maquette de la charte
const nomRecto = texte('Célestin', PAD_X, sommet(roleRecto) - ECART_NOM_ROLE, { ...NOM, couleur: CREME, ancre: 'bas' });
const piedVerso = texte('Création de sites internet et référencement, Drôme', PAD_X, BAS, { taille: 2.5, couleur: PIERRE, ancre: 'bas' });

const CARTES = {
  'piste-A-recto': [
    fond(VERT),
    mono(PAD_X, PAD_Y, 13, CREME),
    nomRecto,
    roleRecto,
  ],
  'piste-A-verso': [
    fond(CREME),
    texte('Caelestis', PAD_X, PAD_Y, { taille: 2.6, poids: 500, ls: 2.6 * 0.13, couleur: SAUGE_TEXTE, capitales: true }),
    filet(PAD_X, 24, 9, 0.5, SAUGE),
    ...coordonnees(PAD_X, 28, PIERRE),
    piedVerso,
  ],
  // Pistes B : bloc unique, centre dans la hauteur de la carte.
  'piste-B-recto': centrer([
    fond(CREME),
    { type: 'lockup', x: PAD_X, y: 20, largeur: 46, couleur: VERT },
    texte('Sites internet et référencement', PAD_X, 33.5, { taille: 2.7, poids: 500, ls: 2.7 * 0.1, couleur: SAUGE_TEXTE, capitales: true }),
  ]),
  'piste-B-verso': centrer([
    fond(VERT),
    texte('Célestin', PAD_X, 18, { taille: 4.6, poids: 700, ls: 4.6 * -0.035, couleur: CREME }),
    texte('Fondateur', PAD_X, 24.8, { ...ROLE, couleur: SAUGE_PALE }),
    ...coordonnees(PAD_X, 33.5, SAUGE_PALE),
  ]),
};

/* ── Dessin du monogramme et du lockup ─────────────────────────
   (x, y) designe le coin haut gauche de l'encre, `largeur` sa largeur. */
function monoSVG({ x, y, largeur, couleur }) {
  const k = largeur / (ENC_L * 100);
  return `<g transform="translate(${(x - ENCRE_MONO.x0 * 100 * k).toFixed(3)} ${(y - ENCRE_MONO.y0 * 100 * k).toFixed(3)}) scale(${k.toFixed(5)})"><path d="${arcC}" fill="none" stroke="${couleur}" stroke-width="15"/></g>`;
}

function monoPDF(doc, { x, y, largeur, couleur }) {
  const k = largeur / (ENC_L * 100);
  doc.save();
  doc.translate(mm(x - ENCRE_MONO.x0 * 100 * k), mm(y - ENCRE_MONO.y0 * 100 * k)).scale(mm(k));
  doc.path(arcC).lineWidth(15).strokeColor(couleur).stroke();
  doc.restore();
}

/* Lockup horizontal, cadre sur l'encre : mot a 82 % de la tuile, ecart de
   28 % mesure depuis le bord de tuile, C recentre dans la sienne. `largeur`
   est celle de l'encre complete, du bord gauche du C au bord droit du mot. */
function lockupParts(largeur) {
  const g = glyphes(f500, 'Caelestis', 100 * LOCKUP.mot, 100 * LOCKUP.mot * LOCKUP.interlettrage);
  const gaucheEncre = (DECALAGE_OPTIQUE_MONO + ENCRE_MONO.x0) * 100;  // 20,65
  const motRel = (1 + LOCKUP.ecart) * 100 - gaucheEncre;              // 107,35
  const tuile = largeur / ((motRel + g.largeur) / 100);               // taille de tuile en mm
  return {
    g,
    tuile,
    monoLargeur: ENC_L * tuile,
    motX: (motRel / 100) * tuile - g.gauche * (tuile / 100),
    base: (LOCKUP.baseline - ENCRE_MONO.y0) * tuile,
    echelle: tuile / 100,
  };
}

/* ── Moteur SVG ────────────────────────────────────────────── */
function versSVG(elements) {
  const corps = elements
    .map((e) => {
      if (e.type === 'fond') return `<rect width="${L}" height="${H}" fill="${e.couleur}"/>`;
      if (e.type === 'filet') return `<rect x="${e.x}" y="${e.y}" width="${e.l}" height="${e.h}" fill="${e.couleur}"/>`;
      if (e.type === 'mono') return monoSVG(e);
      if (e.type === 'lockup') {
        const p = lockupParts(e.largeur);
        const mots = p.g.liste
          .map((c) => `<path transform="translate(${(e.x + p.motX + c.x * p.echelle).toFixed(3)} ${(e.y + p.base).toFixed(3)}) scale(${(p.g.k * p.echelle).toFixed(6)} ${(-p.g.k * p.echelle).toFixed(6)})" d="${c.d}"/>`)
          .join('');
        return `${monoSVG({ x: e.x, y: e.y, largeur: p.monoLargeur, couleur: e.couleur })}<g fill="${e.couleur}">${mots}</g>`;
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
        monoPDF(doc, e);
      } else if (e.type === 'lockup') {
        const p = lockupParts(e.largeur);
        monoPDF(doc, { x: e.x, y: e.y, largeur: p.monoLargeur, couleur: e.couleur });
        doc.save();
        doc.translate(mm(e.x + p.motX), mm(e.y + p.base)).scale(mm(p.g.k * p.echelle), -mm(p.g.k * p.echelle));
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

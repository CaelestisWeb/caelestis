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

/* Bornes de la zone de securite : 5 mm depuis le trait de coupe. Aucun texte
   ne doit les franchir, le massicot passe a 3 mm avec une tolerance. */
const SECURITE = FOND_PERDU + 5;
const GAUCHE_SURE = SECURITE;
const DROITE_SURE = L - SECURITE;

/* Repere en proportion de la carte finie, fond perdu exclu : les compositions
   se raisonnent sur ce que le client tient en main, pas sur le fichier. */
const uy = (ratio) => FOND_PERDU + ratio * CARTE_H;

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
const INTERLETTRAGE = LOCKUP.interlettrage;   // -0,02 em, reglage de la charte

const fond = (couleur) => ({ type: 'fond', couleur });
const filet = (x, y, l, h, couleur, opacite = 1) => ({ type: 'filet', x, y, l, h, couleur, opacite });
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
  // Le centrage se mesure sur l'encre, pas sur l'avance : un interlettrage
  // ajoute un blanc apres la derniere lettre qui decalerait le bloc.
  const gauche = align === 'droite' ? x - g.droite : align === 'centre' ? x - g.gauche - g.largeur / 2 : x - g.gauche;
  const cale = ancre === 'bas' ? g.bas : ancre === 'milieu' ? (g.haut + g.bas) / 2 : g.haut;
  return { type: 'texte', g, x: gauche, base: y - cale, couleur };
}

/* Taille de police qui fait tenir un texte dans une largeur donnee. */
function tailleAjustee(contenu, poids, largeurCible, ratioLs, essai = 10) {
  const font = poids === 700 ? f700 : poids === 500 ? f500 : f400;
  const g = glyphes(font, contenu, essai, essai * ratioLs);
  return +(essai * (largeurCible / g.largeur)).toFixed(4);
}

/* Sommet de l'encre d'un texte deja place. */
const sommet = (e) => e.base + e.g.haut;

/* ── Pictogrammes ──────────────────────────────────────────────
   Traits fins monochromes, jamais d'emoji : regle de la charte. Chaque dessin
   tient dans une grille de 24, decrit uniquement par des chemins pour que le
   SVG et le PDF le rendent a l'identique. */
const PICTOS = {
  globe: [
    'M21 12 A9 9 0 1 1 3 12 A9 9 0 1 1 21 12',
    'M3 12 H21',
    'M12 3 A4.6 9 0 1 1 12 21 A4.6 9 0 1 1 12 3',
  ],
  enveloppe: [
    'M3 6.6 H21 V17.4 H3 Z',
    'M3.7 7.3 L12 13.3 L20.3 7.3',
  ],
  telephone: [
    'M8.2 2.6 H15.8 A1.7 1.7 0 0 1 17.5 4.3 V19.7 A1.7 1.7 0 0 1 15.8 21.4 H8.2 A1.7 1.7 0 0 1 6.5 19.7 V4.3 A1.7 1.7 0 0 1 8.2 2.6 Z',
    'M10.7 5.4 H13.3',
  ],
};

/* (x, y) est le coin haut gauche, `taille` le cote du picto en millimetres. */
const picto = (nom, x, y, taille, couleur) => ({ type: 'picto', nom, x, y, taille, couleur });

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
    else if (e.type === 'picto') { y0 = e.y; y1 = e.y + e.taille; }
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
  /* Piste C : reprise de la toute premiere carte de l'agence, faite sur
     Canva. La composition est conservee au plus pres, mesuree sur l'original
     de 1575 x 910 px et reportee en proportions. Passe a la charte Foret
     Vivante : Satoshi au lieu de la police a empattements, vert foret au lieu
     du vert olive, aucun point apres le mot, pictogrammes en traits fins.
     Le filet reste plein : la charte interdit les degrades decoratifs. */
  'piste-C-recto': (() => {
    const mot = 0.295 * CARTE_L;                       // le mot occupait 29,5 % de la largeur
    const t = tailleAjustee('Caelestis', 500, mot, INTERLETTRAGE);
    const sous = 'Création de site internet';
    const tSous = tailleAjustee(sous.toLocaleUpperCase('fr-FR'), 500, 0.32 * CARTE_L, 0.22);
    return [
      fond(VERT),
      texte('Caelestis', L / 2, uy(0.485), { taille: t, poids: 500, ls: t * INTERLETTRAGE, couleur: CREME, align: 'centre', ancre: 'milieu' }),
      texte(sous, L / 2, uy(0.87), { taille: tSous, poids: 500, ls: tSous * 0.22, couleur: SAUGE_PALE, capitales: true, align: 'centre', ancre: 'milieu' }),
    ];
  })(),
  'piste-C-verso': (() => {
    const t = tailleAjustee('Caelestis', 500, 0.248 * CARTE_L, INTERLETTRAGE);
    const promesse = 'Des sites web pour ceux qui créent, cultivent et bâtissent avec passion.';
    // La promesse court d'une marge a l'autre, les memes que le reste.
    const tProm = tailleAjustee(promesse.toLocaleUpperCase('fr-FR'), 400, DROITE - PAD_X, 0.18);

    const PICTO = 3.4;
    const xFilet = L / 2;
    const xPicto = xFilet + 7;
    const xTexte = xPicto + PICTO + 2.6;
    // La ligne la plus longue s'arrete sur la marge droite, symetrique de
    // celle ou commence le mot : les deux masses s'equilibrent alors autour du
    // filet, et le bloc entier retombe sur l'axe de la carte.
    const tLigne = tailleAjustee('contact@caelestis.fr', 400, DROITE - xTexte, 0);
    const inter = 6.2;
    const lignes = [
      ['globe', 'caelestis.fr'],
      ['enveloppe', 'contact@caelestis.fr'],
      ['telephone', '07 69 36 27 27'],
    ].flatMap(([nom, valeur], i) => {
      const y = uy(0.485) + (i - 1) * inter;
      return [
        picto(nom, xPicto, y - PICTO / 2, PICTO, CREME),
        texte(valeur, xTexte, y, { taille: tLigne, couleur: CREME, ancre: 'milieu' }),
      ];
    });
    return [
      fond(VERT),
      texte('Caelestis', PAD_X, uy(0.485), { taille: t, poids: 500, ls: t * INTERLETTRAGE, couleur: CREME, ancre: 'milieu' }),
      filet(xFilet, uy(0.2), 0.22, CARTE_H * 0.6, CREME, 0.34),
      ...lignes,
      texte(promesse, L / 2, uy(0.87), { taille: tProm, poids: 400, ls: tProm * 0.18, couleur: SAUGE_PALE, capitales: true, align: 'centre', ancre: 'milieu' }),
    ];
  })(),

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
      if (e.type === 'filet') return `<rect x="${e.x}" y="${e.y}" width="${e.l}" height="${e.h}" fill="${e.couleur}"${e.opacite < 1 ? ` opacity="${e.opacite}"` : ''}/>`;
      if (e.type === 'mono') return monoSVG(e);
      if (e.type === 'picto') {
        const k = e.taille / 24;
        const trait = +(0.2 / k).toFixed(3);   // 0,2 mm reel, quelle que soit la taille
        return `<g transform="translate(${e.x} ${e.y}) scale(${k.toFixed(5)})" fill="none" stroke="${e.couleur}" stroke-width="${trait}" stroke-linecap="round" stroke-linejoin="round">${PICTOS[e.nom].map((d) => `<path d="${d}"/>`).join('')}</g>`;
      }
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
        doc.save();
        if (e.opacite < 1) doc.fillOpacity(e.opacite);
        doc.rect(mm(e.x), mm(e.y), mm(e.l), mm(e.h)).fill(e.couleur);
        doc.restore();
      } else if (e.type === 'mono') {
        monoPDF(doc, e);
      } else if (e.type === 'picto') {
        const k = e.taille / 24;
        doc.save();
        doc.translate(mm(e.x), mm(e.y)).scale(mm(k));
        doc.lineWidth(0.2 / k).strokeColor(e.couleur).lineCap('round').lineJoin('round');
        PICTOS[e.nom].forEach((d) => doc.path(d).stroke());
        doc.restore();
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
const PX = (mmValeur) => Math.round((mmValeur / 25.4) * 300);

for (const [nom, elements] of Object.entries(CARTES)) {
  const svg = versSVG(elements);
  writeFileSync(`${SORTIE}/carte-${nom}.svg`, svg);
  const rendu = await sharp(Buffer.from(svg), { density: 300 }).resize({ width: PX(L) }).png().toBuffer();
  writeFileSync(`${SORTIE}/carte-${nom}-300dpi.png`, rendu);

  /* Version au format fini, fond perdu rogne : c'est celle qu'on montre a
     l'ecran ou qu'on joint a un courriel, l'imprimeur seul a besoin des
     3 mm de debord. */
  await sharp(rendu)
    .extract({ left: PX(FOND_PERDU), top: PX(FOND_PERDU), width: PX(CARTE_L), height: PX(CARTE_H) })
    .png()
    .toFile(`${SORTIE}/carte-${nom}-apercu.png`);

  await versPDF(elements, `${SORTIE}/carte-${nom}.pdf`);
}

console.log(`identite/logo/impression : ${Object.keys(CARTES).length} faces en PDF, PNG 300 dpi et SVG.`);

/* Cartes de visite de l'Ecran plante.
   node identite/marque/build-cartes.mjs

   Format francais 85 x 55 mm, 3 mm de fond perdu sur chaque bord, soit un
   fichier de 91 x 61 mm. Trois sorties par face :
     .pdf       vectoriel, tout en traces, c'est le fichier de l'imprimeur
     .png       300 points par pouce, 1075 x 721 px, fond perdu compris
     -vue.png   format fini, fond perdu rogne, pour montrer a l'ecran

   Une face se decrit une seule fois, sous forme de liste d'elements, et deux
   moteurs la dessinent, l'un en SVG pour l'image, l'autre en PDF. Le rendu est
   donc le meme chez l'imprimeur et a l'ecran.

   Le logo n'est jamais redessine ici. Les fichiers de `signe/` sont poses tels
   quels par `commun/poser.mjs` : un export qui recomposerait le signe et le
   mot donnerait un centrage different de celui que recoit l'imprimeur, et
   l'ecart ne se verrait qu'a l'usage. Seuls les textes propres a la carte, le
   nom, le role et les coordonnees, sont traces ici par fontkit.

   Le controle de cadrage est en fin de fichier : chaque carte ecrite est
   rasterisee et son encre mesuree. Aucune position n'est crue sur parole. */

import { createWriteStream, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import { police, trace, VERT, CREME, LIN, PIERRE, MOUSSE_TEXTE, ENCRE } from './commun/base.mjs';
import { lireLivre, poserSVG, poserPDF, dimensions } from './commun/poser.mjs';
import { FACES } from './commun/fabrique.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const SORTIE = `${ICI}/exports/impression`;
mkdirSync(SORTIE, { recursive: true });

/* Geometrie, en millimetres */
const FOND_PERDU = 3;
const CARTE_L = 85;
const CARTE_H = 55;
const L = CARTE_L + FOND_PERDU * 2;   // 91
const H = CARTE_H + FOND_PERDU * 2;   // 61

/* Marge de composition : 8 mm depuis le trait de coupe. Elle vaut aussi zone
   de protection du logo, la charte demandant un vide egal a la moitie de sa
   hauteur : le signe de 16 mm en reclame 8, le lockup de 52 mm en reclame
   6,5. La marge est donc portee a 8, la plus exigeante des deux. */
const PAD = FOND_PERDU + 8;
const BAS = H - PAD;

/* Zone de securite de la charte : 5 mm depuis le trait de coupe. Le massicot
   passe a 3 mm avec sa tolerance, rien d'imprime ne s'en approche. */
const SECURITE = FOND_PERDU + 5;

const mm = (v) => (v * 72) / 25.4;    // millimetres vers points PostScript
const PX = (v) => Math.round((v / 25.4) * 300);

const f400 = police(400);
const f500 = police(500);
const f700 = police(700);
const fonte = (poids) => (poids === 700 ? f700 : poids === 500 ? f500 : f400);

/* Elements */
const fond = (couleur) => ({ type: 'fond', couleur });

/* `y` designe le sommet de l'encre, jamais la ligne de base : c'est ce que
   l'oeil aligne. Avec ancre 'bas', `y` designe le pied de l'encre, ce qui cale
   un bloc sur une marge basse sans dependre de la hauteur de ses capitales.

   L'element renvoye porte les deux reperes, et il faut s'en tenir a leur role :
   `plume` et `base` sont l'origine du trace, celle que reclament les moteurs,
   tandis que `x`, `y` et `h` decrivent la boite d'encre, celle que lit le
   calage. Les confondre decale un bloc de la hauteur d'une capitale, sans que
   rien ne le signale : `haut` est negatif, l'encre montant au-dessus de la
   ligne de base. */
function texte(contenu, xVoulu, yVoulu, { taille, poids = 400, ls = 0, couleur = ENCRE, capitales = false, align = 'gauche', ancre = 'haut' } = {}) {
  const t = capitales ? contenu.toLocaleUpperCase('fr-FR') : contenu;
  const m = trace(fonte(poids), t, taille, { ls });
  /* Le calage se mesure sur l'encre et non sur l'avance : un interlettrage
     ajoute un blanc apres la derniere lettre qui decalerait le bloc. */
  const x = align === 'droite' ? xVoulu - m.largeur
    : align === 'centre' ? xVoulu - m.largeur / 2
      : xVoulu;
  const y = ancre === 'bas' ? yVoulu - m.hauteur
    : ancre === 'milieu' ? yVoulu - m.hauteur / 2
      : yVoulu;
  return {
    type: 'texte', contenu: t, poids, taille, ls, couleur,
    x, y, l: m.largeur, h: m.hauteur,
    plume: +(x - m.gauche).toFixed(4), base: +(y - m.haut).toFixed(4),
  };
}

/* Un fichier livre pose sur la carte. (x, y) est le coin haut gauche de son
   encre ; l'une des deux dimensions suffit, l'autre suit le fichier. */
function logo(fichier, x, y, { largeur, hauteur } = {}) {
  const livre = lireLivre(`${ICI}/signe/${fichier}.svg`);
  const d = dimensions(livre, { largeur, hauteur });
  return { type: 'logo', livre, x, y, largeur, hauteur, l: d.l, h: d.h };
}

/* Sommet et pied de l'encre d'un element deja place. */
const sommet = (e) => e.y;
const pied = (e) => e.y + e.h;

/* Calage vertical. Les positions sont posees a la main, puis le bloc entier
   est cale par mesure de son encre. Ecrire des coordonnees justes du premier
   coup est illusoire : la hauteur d'un texte depend de ses capitales et de ses
   accents, deux libelles differents ne donnent pas la meme boite. */
function boiteY(elements) {
  let haut = Infinity, bas = -Infinity;
  for (const e of elements) {
    if (e.type === 'fond') continue;
    haut = Math.min(haut, e.y);
    bas = Math.max(bas, e.y + e.h);
  }
  return { haut, bas, hauteur: bas - haut };
}

const decaler = (elements, dy) => elements.map((e) => (e.type === 'fond' ? e
  : { ...e, y: +(e.y + dy).toFixed(4), ...(e.base === undefined ? {} : { base: +(e.base + dy).toFixed(4) }) }));

/* Bloc centre dans la hauteur du fichier, fond perdu compris : les 3 mm etant
   symetriques, c'est aussi le centre de la carte finie. */
const centrer = (elements) => {
  const b = boiteY(elements);
  return decaler(elements, (H - b.hauteur) / 2 - b.haut);
};

/* Les deux pistes de la charte, section 5. Elles presentent deux choses
   differentes, et c'est ce qui justifie d'en garder deux plutot qu'une.

   PISTE A, le signe seul. Recto vert foret plein, le signe en creme cale sur
   la marge haute, le nom sur la marge basse. Elle presente une personne, et le
   vert plein la fait reconnaitre de loin dans une pile de cartes.

   PISTE B, le logo et la specialite. Recto creme, le lockup horizontal et une
   ligne de specialite en capitales espacees, comme la charte la decrit, les
   deux calees sur la meme largeur. Elle presente une activite, le nom passant
   au verso.

   Les deux gardent la meme marge et la meme famille de corps : posees cote a
   cote, elles se lisent comme deux cartes d'une meme maison. */

const ROLE = { poids: 500, ls: 0.13, capitales: true };
const NOM = { taille: 6, poids: 700, ls: 6 * -0.035 };
const METIER = 'Création de sites internet et référencement, Drôme';
const SPECIALITE = 'Sites internet et référencement';

/* Taille qui donne a un texte une largeur d'encre voulue. Mesuree sur un essai
   puis mise a l'echelle : l'interlettrage etant proportionnel a la taille, le
   rapport des largeurs est exact et une seule sonde suffit. */
function tailleAjustee(contenu, poids, largeur, ratioLs, capitales = false) {
  const t = capitales ? contenu.toLocaleUpperCase('fr-FR') : contenu;
  const essai = 10;
  const m = trace(fonte(poids), t, essai, { ls: essai * ratioLs });
  return +(essai * (largeur / m.largeur)).toFixed(4);
}

/* Une ligne de capitales espacees calee sur une largeur donnee. C'est le seul
   moyen d'aligner exactement son bord droit sur celui du lockup : deux blocs
   de largeurs presque egales, mais pas egales, se lisent comme un defaut. */
function ligneCalee(contenu, x, y, largeur, { poids = 500, ls = 0.13, couleur, ancre = 'haut' }) {
  const taille = tailleAjustee(contenu, poids, largeur, ls, true);
  return texte(contenu, x, y, { taille, poids, ls: taille * ls, couleur, capitales: true, ancre });
}

/* Trois lignes de coordonnees, interligne 1,75. Le numero porte le poids 500,
   c'est la ligne qu'on cherche en premier sur une carte. */
function coordonnees(x, y, { couleur, accent = couleur, taille = 3, ancre = 'haut' } = {}) {
  const inter = taille * 1.75;
  const lignes = [
    ['07 69 36 27 27', 500, accent],
    ['contact@caelestis.fr', 400, couleur],
    ['caelestis.fr', 400, couleur],
  ];
  /* Avec ancre 'bas', `y` est le pied de la derniere ligne : le bloc remonte,
     et sa hauteur reste sans effet sur la marge basse. */
  const rang = (i) => (ancre === 'bas' ? y + (i - 2) * inter : y + i * inter);
  return lignes.map(([v, poids, c], i) => texte(v, x, rang(i), { taille, poids, couleur: c, ancre }));
}

/* Piste A, composition en vis-a-vis : le signe cale sur la marge haute, le
   bloc d'identite sur la marge basse. Les deux marges sont donc egales par
   construction, quelle que soit la hauteur des textes, et la colonne de gauche
   est habitee sur toute la hauteur de la carte.

   Une version posant le nom a cote du signe a ete essayee puis ecartee : la
   zone de protection de la charte, la moitie de la hauteur du signe, ouvrait
   entre eux un ecart de 8 mm qui scindait le bloc en deux. */
const SIGNE_H = 16;

function pisteARecto() {
  const signe = logo('signe-creme', PAD, PAD, { hauteur: SIGNE_H });
  const role = texte('Fondateur', PAD, BAS, { ...ROLE, taille: 2.7, ls: 2.7 * 0.13, couleur: LIN, ancre: 'bas' });
  const nom = texte('Célestin', PAD, sommet(role) - 1.8, { ...NOM, couleur: CREME, ancre: 'bas' });
  return [fond(VERT), signe, nom, role];
}

function pisteAVerso() {
  const marque = logo('lockup-horizontal-vert', PAD, PAD, { largeur: 26 });
  /* Zone de protection du lockup : la moitie de sa hauteur. */
  const metier = texte(METIER, PAD, pied(marque) + marque.h / 2, { taille: 2.6, couleur: PIERRE });
  return [fond(CREME), marque, metier, ...coordonnees(PAD, BAS, { couleur: PIERRE, accent: ENCRE, ancre: 'bas' })];
}

/* Piste B. Le lockup et la specialite ont exactement la meme largeur : les
   deux lignes forment un bloc net, et le blanc de droite devient une marge
   voulue au lieu d'un reste. */
const LOCKUP_L = 52;

function pisteBRecto() {
  const marque = logo('lockup-horizontal-vert', PAD, 0, { largeur: LOCKUP_L });
  const spec = ligneCalee(SPECIALITE, PAD, pied(marque) + marque.h / 2, LOCKUP_L, { couleur: MOUSSE_TEXTE });
  return centrer([fond(CREME), marque, spec]);
}

function pisteBVerso() {
  const nom = texte('Célestin', PAD, 0, { ...NOM, couleur: CREME });
  const role = texte('Fondateur', PAD, pied(nom) + 1.8, { ...ROLE, taille: 2.7, ls: 2.7 * 0.13, couleur: LIN });
  const coord = coordonnees(PAD, pied(role) + 6, { couleur: LIN, accent: CREME });
  return centrer([fond(VERT), nom, role, ...coord]);
}

const CARTES = {
  'piste-A-recto': pisteARecto(),
  'piste-A-verso': pisteAVerso(),
  'piste-B-recto': pisteBRecto(),
  'piste-B-verso': pisteBVerso(),
};

/* Moteur SVG */
function versSVG(elements) {
  const corps = elements.map((e) => {
    if (e.type === 'fond') return `<rect width="${L}" height="${H}" fill="${e.couleur}"/>`;
    if (e.type === 'logo') return poserSVG(e.livre, { x: e.x, y: e.y, largeur: e.largeur, hauteur: e.hauteur });
    return trace(fonte(e.poids), e.contenu, e.taille, { x: e.plume, y: e.base, couleur: e.couleur, ls: e.ls }).markup;
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}mm" height="${H}mm" viewBox="0 0 ${L} ${H}">\n  ${corps}\n</svg>\n`;
}

/* Moteur PDF */
function versPDF(elements, chemin) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [mm(L), mm(H)], margin: 0 });
    const flux = doc.pipe(createWriteStream(chemin));
    flux.on('finish', resolve);
    flux.on('error', reject);

    for (const e of elements) {
      if (e.type === 'fond') {
        doc.rect(0, 0, mm(L), mm(H)).fillColor(e.couleur).fill();
      } else if (e.type === 'logo') {
        poserPDF(doc, e.livre, { x: e.x, y: e.y, largeur: e.largeur, hauteur: e.hauteur }, mm);
      } else {
        /* Le meme trace que le SVG, glyphe par glyphe : fontkit rend un chemin
           dans un repere ou l'axe y monte, d'ou l'echelle negative. */
        const font = fonte(e.poids);
        const k = e.taille / font.unitsPerEm;
        const run = font.layout(e.contenu);
        let plume = e.plume;
        const base = e.base;
        run.glyphs.forEach((g, i) => {
          const d = g.path.toSVG();
          if (d) {
            doc.save();
            doc.translate(mm(plume + (run.positions[i].xOffset || 0) * k), mm(base)).scale(mm(k), -mm(k));
            doc.path(d).fillColor(e.couleur).fill();
            doc.restore();
          }
          plume += run.positions[i].xAdvance * k + e.ls;
        });
      }
    }
    doc.end();
  });
}

/* Fabrication */
const rendus = {};
for (const [nom, elements] of Object.entries(CARTES)) {
  const svg = versSVG(elements);
  writeFileSync(`${SORTIE}/carte-${nom}.svg`, svg);

  /* `density` rend un SVG a plus de quatre fois sa taille intrinseque : le
     `resize` explicite qui suit n'est pas une commodite, il est ce qui donne
     la dimension voulue. Une image de partage est deja sortie en 5000 px de
     large sans la moindre erreur, faute de cette ligne. */
  const png = await sharp(Buffer.from(svg), { density: 300 }).resize({ width: PX(L) }).png().toBuffer();
  writeFileSync(`${SORTIE}/carte-${nom}.png`, png);

  const vue = await sharp(png)
    .extract({ left: PX(FOND_PERDU), top: PX(FOND_PERDU), width: PX(CARTE_L), height: PX(CARTE_H) })
    .png().toBuffer();
  writeFileSync(`${SORTIE}/carte-${nom}-vue.png`, vue);

  await versPDF(elements, `${SORTIE}/carte-${nom}.pdf`);
  rendus[nom] = { png, vue };
}

/* Planche d'arbitrage. Un fichier autonome, polices et images comprises : il
   s'ouvre par double-clic et s'envoie par courriel, comme les autres planches
   de l'identite. Les cartes y sont a l'echelle reelle, 85 mm de large, ce qui
   est la seule facon de juger la taille d'un corps de texte imprime. */
const PISTES_PLANCHE = [
  ['A', 'Le signe seul', 'Le recto porte le signe et le nom, en vis-a-vis sur la hauteur de la carte. Elle presente une personne : le vert plein la fait reconnaitre de loin, dans une pile.'],
  ['B', 'Le logo et la specialite', 'Le recto porte le logo complet et ce que fait l\'agence, les deux lignes calees sur la meme largeur. Elle presente une activite, le nom passant au verso.'],
];

const face = (nom, legende) => `
        <figure class="carte">
          <img src="data:image/png;base64,${rendus[nom].vue.toString('base64')}" alt="Carte ${nom}" width="${PX(CARTE_L)}" height="${PX(CARTE_H)}">
          <figcaption>${legende}</figcaption>
        </figure>`;

const planche = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Caelestis, cartes de visite</title>
<style>
${FACES()}
:root { --vert: ${VERT}; --creme: ${CREME}; --encre: ${ENCRE}; --pierre: ${PIERRE}; --parchemin: #E6E4DC; --mousse: ${MOUSSE_TEXTE}; }
* { box-sizing: border-box; }
body { margin: 0; padding: 56px 32px 96px; background: var(--creme); color: var(--encre);
  font-family: Satoshi, "Helvetica Neue", Arial, sans-serif; font-weight: 400; line-height: 1.55; }
main { max-width: 900px; margin: 0 auto; }
h1 { font-size: 34px; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 10px; }
h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.025em; margin: 0 0 4px; }
.surtitre { font-size: 12px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mousse); margin: 0 0 14px; }
.chapo { color: var(--pierre); max-width: 62ch; margin: 0 0 8px; }
.piste { padding: 44px 0; border-top: 1px solid var(--parchemin); }
.piste .chapo { margin-bottom: 28px; }
.paire { display: flex; flex-wrap: wrap; gap: 28px; }
.carte { margin: 0; }
.carte img { display: block; width: 85mm; height: 55mm; border-radius: 2.4mm;
  box-shadow: 0 1px 2px rgba(18,22,15,.10), 0 14px 34px -16px rgba(18,22,15,.34); }
.carte figcaption { margin-top: 10px; font-size: 13px; color: var(--pierre); }
.impression { margin-top: 44px; padding: 28px 32px; background: #E3EFE8; border-radius: 10px; }
.impression h2 { font-size: 17px; margin-bottom: 14px; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 24px; margin: 0; font-size: 14px; }
dt { font-weight: 500; color: var(--mousse); }
dd { margin: 0; color: var(--pierre); }
</style>
</head>
<body>
<main>
  <p class="surtitre">Caelestis, identite</p>
  <h1>Cartes de visite</h1>
  <p class="chapo">Deux pistes a l'echelle reelle, recto et verso. Les fichiers d'impression sont dans
    <code>identite/marque/exports/impression/</code>, un PDF par face.</p>
${PISTES_PLANCHE.map(([cle, titre, propos]) => `
  <section class="piste">
    <h2>Piste ${cle}, ${titre.toLowerCase()}</h2>
    <p class="chapo">${propos}</p>
    <div class="paire">
${face(`piste-${cle}-recto`, 'Recto')}
${face(`piste-${cle}-verso`, 'Verso')}
    </div>
  </section>`).join('')}
  <section class="impression">
    <h2>Ce que recoit l'imprimeur</h2>
    <dl>
      <dt>Format</dt><dd>85 sur 55 mm, fond perdu de 3 mm, soit un fichier de 91 sur 61 mm</dd>
      <dt>Resolution</dt><dd>300 points par pouce, ${PX(L)} sur ${PX(H)} pixels avec le fond perdu</dd>
      <dt>Marges</dt><dd>composition a ${PAD - FOND_PERDU} mm du trait de coupe, zone de securite a ${SECURITE - FOND_PERDU} mm</dd>
      <dt>Papier</dt><dd>350 g, mat ou naturel. Le vert foret s'assombrit sur non couche, demander un bon a tirer</dd>
      <dt>Pelliculage</dt><dd>mat. Le brillant contredit le registre artisanal</dd>
      <dt>Texte</dt><dd>entierement en traces, aucune police a fournir</dd>
    </dl>
  </section>
</main>
</body>
</html>
`;
writeFileSync(`${ICI}/planche-cartes.html`, planche);

/* Controle mesure. Le cadrage ne se calcule pas, il se mesure : chaque carte
   ecrite est relue au pixel, on y cherche l'encre, c'est-a-dire tout pixel qui
   differe du fond, et on verifie qu'elle laisse la zone de securite libre. Une
   police plus large, un accent, un trait de contour deplacent un bord sans
   prevenir. */
async function marges(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const lire = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const [fr, fg, fb] = lire(2, 2);   // le fond, releve dans le fond perdu
  const different = (x, y) => {
    const [r, g, b] = lire(x, y);
    return Math.abs(r - fr) + Math.abs(g - fg) + Math.abs(b - fb) > 24;
  };
  let x0 = width, x1 = -1, y0 = height, y1 = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (different(x, y)) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const enMm = (px) => +((px / 300) * 25.4).toFixed(2);
  return { gauche: enMm(x0), droite: enMm(width - 1 - x1), haut: enMm(y0), bas: enMm(height - 1 - y1) };
}

/* Second controle, le PDF contre le PNG. Le PDF est le fichier qui part chez
   l'imprimeur, et c'est le seul des trois qu'aucun oeil ne verifie ici : il est
   ecrit par un moteur different de celui de l'image. Un decalage de repere, une
   echelle oubliee ou une face vide passeraient donc inapercus.

   Le controle relit le flux du PDF, suit sa pile graphique et ses matrices, et
   mesure la boite des points traces. Deux ecarts sont attendus et ne sont pas
   des defauts : les points de controle des courbes de Bezier tombent hors de la
   courbe, et la demi-largeur des traits de contour n'est pas comptee. La
   tolerance de 1,5 mm couvre les deux, tout en rattrapant le moindre decalage
   reel, qui se compterait en millimetres. */
function boitePDF(chemin) {
  const buf = readFileSync(chemin);
  const src = buf.toString('latin1');
  let flux = '';
  for (const m of src.matchAll(/stream\r?\n/g)) {
    const debut = m.index + m[0].length;
    try { flux += inflateSync(buf.subarray(debut, src.indexOf('endstream', debut))).toString('latin1'); } catch { /* flux non compresse ou hors contenu */ }
  }

  /* Matrice PDF [a b c d e f], appliquee a un point : x' = ax + cy + e. */
  const produit = (m, n) => [
    m[0] * n[0] + m[1] * n[2], m[0] * n[1] + m[1] * n[3],
    m[2] * n[0] + m[3] * n[2], m[2] * n[1] + m[3] * n[3],
    m[4] * n[0] + m[5] * n[2] + n[4], m[4] * n[1] + m[5] * n[3] + n[5],
  ];
  let ctm = [1, 0, 0, 1, 0, 0];
  const pile = [];
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const point = (x, y) => {
    const px = ctm[0] * x + ctm[2] * y + ctm[4];
    const py = ctm[1] * x + ctm[3] * y + ctm[5];
    x0 = Math.min(x0, px); x1 = Math.max(x1, px);
    y0 = Math.min(y0, py); y1 = Math.max(y1, py);
  };

  const jetons = flux.split(/\s+/);
  const pris = [];
  for (const j of jetons) {
    const n = Number(j);
    if (j !== '' && Number.isFinite(n)) { pris.push(n); continue; }
    const a = pris.slice(-6);
    if (j === 'q') pile.push(ctm.slice());
    else if (j === 'Q') ctm = pile.pop() || [1, 0, 0, 1, 0, 0];
    else if (j === 'cm' && a.length === 6) ctm = produit(a, ctm);
    else if ((j === 'm' || j === 'l') && pris.length >= 2) point(pris[pris.length - 2], pris[pris.length - 1]);
    else if (j === 'c' && pris.length >= 6) for (let i = 0; i < 3; i += 1) point(a[i * 2], a[i * 2 + 1]);
    else if (j === 're' && pris.length >= 4) {
      const [rx, ry, rl, rh] = pris.slice(-4);
      /* Le fond couvre la page entiere : il est ignore, sans quoi toute mesure
         de marge vaudrait zero. */
      if (!(rl >= mm(L) - 1 && rh >= mm(H) - 1)) { point(rx, ry); point(rx + rl, ry + rh); }
    }
    pris.length = 0;
  }
  const enMm = (pt) => +((pt * 25.4) / 72).toFixed(2);
  /* Le repere du PDF a son origine en bas a gauche, l'axe y monte. */
  return { gauche: enMm(x0), droite: +(L - enMm(x1)).toFixed(2), haut: +(H - enMm(y1)).toFixed(2), bas: enMm(y0) };
}

console.log(`identite/marque/exports/impression : ${Object.keys(CARTES).length} faces en PDF, PNG 300 dpi et SVG.\n`);
console.log('Cadrage mesure, marges de l\'encre depuis le bord du fichier, en millimetres.');
console.log(`Zone de securite : ${SECURITE} mm. Marge de composition : ${PAD} mm.\n`);

const TOLERANCE = 1.5;
let defauts = 0;
for (const [nom, { png }] of Object.entries(rendus)) {
  const m = await marges(png);
  const bon = Math.min(m.gauche, m.droite, m.haut, m.bas) >= SECURITE;

  const p = boitePDF(`${SORTIE}/carte-${nom}.pdf`);
  const ecart = Math.max(...['gauche', 'droite', 'haut', 'bas'].map((c) => Math.abs(p[c] - m[c])));
  const accord = ecart <= TOLERANCE;

  if (!bon || !accord) defauts += 1;
  console.log(`${bon ? 'ok  ' : 'HORS'} ${nom.padEnd(14)} gauche ${String(m.gauche).padStart(5)}  droite ${String(m.droite).padStart(5)}  haut ${String(m.haut).padStart(5)}  bas ${String(m.bas).padStart(5)}   pdf ${accord ? 'conforme' : 'ECART'} ${ecart.toFixed(2)} mm`);
}
console.log(defauts === 0
  ? `\nLes ${Object.keys(rendus).length} faces laissent la zone de securite libre, et leur PDF pose le meme dessin au meme endroit.`
  : `\nAttention : ${defauts} face(s) en defaut.`);

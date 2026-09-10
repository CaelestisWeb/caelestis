/* Carte de visite de l'Ecran plante, la piste retenue.
   node identite/marque/build-cartes.mjs

   Une seule carte, recto et verso. Neuf autres pistes ont ete dessinees puis
   comparees a l'echelle reelle, et sont sorties du fichier le 10 septembre
   2026 : leur raisonnement tient dans le commentaire de la carte, plus bas.

   Format francais 85 x 55 mm, 3 mm de fond perdu sur chaque bord, soit un
   fichier de 91 x 61 mm. Trois sorties par face :
     .pdf       vectoriel, tout en traces, c'est le fichier de l'imprimeur
     .png       300 points par pouce, 1075 x 721 px, fond perdu compris
     -vue.png   format fini, fond perdu rogne, pour montrer a l'ecran

   Une face se decrit une seule fois, sous forme de liste d'elements, et deux
   moteurs la dessinent, l'un en SVG pour l'image, l'autre en PDF. Le rendu est
   donc le meme chez l'imprimeur et a l'ecran.

   Le logo n'est jamais redessine ici. Les fichiers de `signe/` et de `mot/`
   sont poses tels quels par `commun/poser.mjs` : un export qui recomposerait
   le signe et le mot donnerait un centrage different de celui que recoit
   l'imprimeur, et l'ecart ne se verrait qu'a l'usage. Seuls les textes propres
   a la carte, le nom, le role et les coordonnees, sont traces ici par fontkit.

   QUATRE CONTROLES en fin de fichier, aucun n'est un calcul de confiance :
     1. cadrage      chaque face est rasterisee SANS ses aplats, et l'encre
                     mesuree au pixel doit laisser la zone de securite libre
     2. accord PDF   le flux du PDF est relu, ses matrices suivies, la boite
                     de ses traces comparee a celle de l'image
     3. protection   un logo pose garde un vide egal a la moitie de sa hauteur
                     jusqu'au trait de coupe, comme la charte le demande
     4. lisibilite   corps minimum de 7 points, et contraste WCAG de chaque
                     texte sur le fond qui se trouve reellement dessous */

import { createWriteStream, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import { police, trace, VERT, VERT_PROFOND, CREME, LIN, PIERRE, MOUSSE_TEXTE, PARCHEMIN, ENCRE } from './commun/base.mjs';
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
   de protection du logo pour les tailles employees ici, la charte demandant un
   vide egal a la moitie de sa hauteur : le lockup de 46 mm de large en reclame
   environ 5,7. */
const PAD = FOND_PERDU + 8;
const BAS = H - PAD;
const DROITE = L - PAD;

/* Zone de securite de la charte : 5 mm depuis le trait de coupe. Le massicot
   passe a 3 mm avec sa tolerance, rien d'imprime ne s'en approche. */
const SECURITE = FOND_PERDU + 5;

/* Corps minimum. Sept points est le plancher des imprimeurs francais pour une
   mention ; en dessous, l'encre bave a la coupe et la ligne se devine plus
   qu'elle ne se lit. Rien de ce qu'on veut voir lu ne descend sous huit, d'ou
   les coordonnees a 3 mm, qui valent 8,5 points. Un point vaut 0,3528 mm. */
const CORPS_MINIMUM_PT = 7;
const PT = 25.4 / 72;

const mm = (v) => (v * 72) / 25.4;    // millimetres vers points PostScript
const PX = (v) => Math.round((v / 25.4) * 300);

const f300 = police(300);
const f400 = police(400);
const f500 = police(500);
const f700 = police(700);
const fonte = (poids) => (poids === 700 ? f700 : poids === 500 ? f500 : poids === 300 ? f300 : f400);

/* ══ Elements ═══════════════════════════════════════════════════════════ */

const fond = (couleur) => ({ type: 'fond', couleur });

/* Un aplat. INVARIANTE : il touche au moins un bord du fichier, donc il file
   dans le fond perdu. Un aplat qui flotterait au milieu de la carte serait
   compte par le controle du PDF et ignore par celui de l'image, et les deux
   mesures divergeraient sans que rien ne le dise. Le controle la verifie. */
const bloc = (x, y, l, h, couleur) => ({ type: 'bloc', x, y, l, h, couleur });

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
function poserFichier(dossier, fichier, x, y, { largeur, hauteur } = {}) {
  const livre = lireLivre(`${ICI}/${dossier}/${fichier}.svg`);
  const d = dimensions(livre, { largeur, hauteur });
  return { type: 'logo', livre, nom: fichier, x, y, largeur, hauteur, l: d.l, h: d.h };
}

const logo = (fichier, x, y, taille) => poserFichier('signe', fichier, x, y, taille);
const mot = (fichier, x, y, taille) => poserFichier('mot', fichier, x, y, taille);

/* Sommet et pied de l'encre d'un element deja place. */
const sommet = (e) => e.y;
const pied = (e) => e.y + e.h;
const bord = (e) => e.x + e.l;

/* ══ Calage ═════════════════════════════════════════════════════════════
   Les positions sont posees a la main, puis le bloc entier est cale par
   mesure de son encre. Ecrire des coordonnees justes du premier coup est
   illusoire : la hauteur d'un texte depend de ses capitales et de ses
   accents, deux libelles differents ne donnent pas la meme boite. */

const decorable = (e) => e.type !== 'fond' && e.type !== 'bloc';

function boiteY(elements) {
  let haut = Infinity, bas = -Infinity;
  for (const e of elements) {
    if (!decorable(e)) continue;
    haut = Math.min(haut, e.y);
    bas = Math.max(bas, e.y + e.h);
  }
  return { haut, bas, hauteur: bas - haut };
}

function boiteX(elements) {
  let gauche = Infinity, droite = -Infinity;
  for (const e of elements) {
    if (!decorable(e)) continue;
    gauche = Math.min(gauche, e.x);
    droite = Math.max(droite, e.x + e.l);
  }
  return { gauche, droite, largeur: droite - gauche };
}

const decaler = (elements, dy) => elements.map((e) => (!decorable(e) ? e
  : { ...e, y: +(e.y + dy).toFixed(4), ...(e.base === undefined ? {} : { base: +(e.base + dy).toFixed(4) }) }));

const decalerX = (elements, dx) => elements.map((e) => (!decorable(e) ? e
  : { ...e, x: +(e.x + dx).toFixed(4), ...(e.plume === undefined ? {} : { plume: +(e.plume + dx).toFixed(4) }) }));

/* Bloc centre dans la hauteur du fichier, fond perdu compris : les 3 mm etant
   symetriques, c'est aussi le centre de la carte finie. */
const centrer = (elements) => {
  const b = boiteY(elements);
  return decaler(elements, (H - b.hauteur) / 2 - b.haut);
};

const centrerX = (elements) => {
  const b = boiteX(elements);
  return decalerX(elements, (L - b.largeur) / 2 - b.gauche);
};

/* Bloc centre dans une hauteur donnee plutot que dans la carte entiere. */
function centrerEntre(elements, haut, bas) {
  const b = boiteY(elements);
  return decaler(elements, haut + (bas - haut - b.hauteur) / 2 - b.haut);
}

/* ══ Textes de la carte ═════════════════════════════════════════════════ */

const NOM_COMPLET = 'Célestin Fruleux';
const ROLE = 'Fondateur';
/* La specialite, fiches Google comprises : c'est une offre reelle, elle reste
   ecrite en entier. En capitales espacees, la ligne complete demanderait 84 mm
   quand la carte en offre 63 : elle se coupe donc sur sa virgule et tient sur
   deux lignes, sans jamais descendre sous le corps minimum. C'est la longueur
   qui plie, jamais le corps. `SPECIALITE` garde la forme d'une seule ligne,
   pour un support qui aurait la largeur. */
const SPECIALITE = 'Sites internet, fiches Google et référencement';
const SPEC_LIGNES = ['Sites internet, fiches Google', 'et référencement'];
const LIEU = 'Auvergne-Rhône-Alpes';

const TEL = '07 69 36 27 27';
const MAIL = 'contact@caelestis.fr';
const SITE = 'caelestis.fr';

/* Reglages de corps partages, en millimetres. Un corps se lit en points chez
   l'imprimeur : la conversion est rappelee en commentaire. */
const CAPITALES = { poids: 500, ls: 0.13, capitales: true };
const NOM = { taille: 5.2, poids: 700, ls: 5.2 * -0.035 };   // 14,7 pt
const COORD = 3;     // 8,5 pt, la ligne qu'on veut lue sans lunettes

/* Une ligne de capitales espacees, a corps fixe.

   ⚠️ Elle a d'abord ete ecrite dans l'autre sens, le corps calcule pour
   remplir une largeur voulue, ce qui alignait joliment son bord droit sur
   celui du lockup. Le controle de lisibilite a montre ce que cela coutait :
   la specialite complete calee sur 34 mm tombait a 3 points, et sur 52 mm a
   4,7. Une ligne illisible parfaitement alignee reste une ligne illisible.

   Le corps est donc la contrainte, et c'est la largeur du logo qui suit celle
   du texte, jamais l'inverse. `largeurCapitales` la mesure avant de poser le
   logo. */
const capitalesEspacees = (contenu, x, y, { taille = 2.7, poids = 500, ls = 0.13, couleur, ancre = 'haut', align = 'gauche' } = {}) =>
  texte(contenu, x, y, { taille, poids, ls: taille * ls, couleur, capitales: true, ancre, align });

/* Le meme bloc sur deux lignes, coupe sur la virgule de la specialite. Chaque
   ligne est alignee pour son propre compte, ce qui donne un drapeau et non un
   pave : deux lignes de capitales espacees justifiees se liraient comme un
   tableau. */
const capitalesBloc = (lignes, x, y, { taille = 2.7, poids = 500, ls = 0.13, couleur, ancre = 'haut', align = 'gauche', interligne = 1.9 } = {}) =>
  paragraphe(lignes, x, y, { taille, poids, ls: taille * ls, couleur, capitales: true, ancre, align, interligne });

/* Plusieurs lignes d'un meme bloc. L'interligne se compte de ligne de base a
   ligne de base et non de sommet d'encre a sommet d'encre : sans cela, une
   ligne sans jambage remonterait et l'ecart deviendrait irregulier. */
function paragraphe(lignes, x, y, { interligne = 1.32, ...opts } = {}) {
  const pas = opts.taille * interligne;
  const premiere = texte(lignes[0], x, y, opts);
  return lignes.map((ligne, i) => {
    if (i === 0) return premiere;
    const e = texte(ligne, x, y, opts);
    return decaler([e], premiere.base + i * pas - e.base)[0];
  });
}

/* Trois lignes de coordonnees, interligne 1,75. Le numero porte le poids 500,
   c'est la ligne qu'on cherche en premier sur une carte. */
function coordonnees(x, y, { couleur, accent = couleur, taille = COORD, ancre = 'haut', align = 'gauche' } = {}) {
  const inter = taille * 1.75;
  const lignes = [[TEL, 500, accent], [MAIL, 400, couleur], [SITE, 400, couleur]];
  /* Avec ancre 'bas', `y` est le pied de la derniere ligne : le bloc remonte,
     et sa hauteur reste sans effet sur la marge basse. */
  const rang = (i) => (ancre === 'bas' ? y + (i - 2) * inter : y + i * inter);
  return lignes.map(([v, poids, c], i) => texte(v, x, rang(i), { taille, poids, couleur: c, ancre, align }));
}

/* Coordonnees sur une seule ligne, quand la composition demande une bande
   plutot qu'une colonne. Les trois valeurs sont separees par un blanc large :
   la charte bannit le point median comme separateur decoratif. */
function coordonneesEnLigne(x, y, { couleur, accent = couleur, taille = COORD, ancre = 'haut', ecart = 4, poids = 400 } = {}) {
  const tel = texte(TEL, x, y, { taille, poids: 500, couleur: accent, ancre });
  const mail = texte(MAIL, bord(tel) + ecart, y, { taille, poids, couleur, ancre });
  const site = texte(SITE, bord(mail) + ecart, y, { taille, poids, couleur, ancre });
  return [tel, mail, site];
}

/* ══ La carte, une seule ════════════════════════════════════════════════

   Le logo et la specialite. Neuf autres pistes ont ete dessinees puis
   comparees a l'echelle reelle, elles sont sorties du fichier le 10 septembre
   2026, celle-ci retenue. Leur raisonnement tient en une phrase : chacune
   presentait une chose differente, un signe, un nom, une question, une region.
   Celle-ci presente une activite, et c'est ce que la carte doit dire en
   premier a qui la recoit. Le nom passe au verso.

   ── Recto : composition en diagonale. La specialite en capitales espacees en
   haut a droite, le logo en bas a gauche, un grand vide entre les deux. Moins
   centree que le bloc empile, elle laisse le papier respirer et donne du
   mouvement a la face. */
const B_LOGO_L = 46;

function bRecto() {
  /* La specialite calee a droite sur la marge haute, le logo cale a gauche sur
     la marge basse : les deux angles opposes sont habites, la diagonale reste
     vide, et c'est ce vide qui fait la carte. */
  const spec = capitalesBloc(SPEC_LIGNES, DROITE, PAD, { couleur: MOUSSE_TEXTE, align: 'droite' });
  const marque = logo('lockup-horizontal-vert', PAD, 0, { largeur: B_LOGO_L });
  return [fond(CREME), ...spec, ...decaler([marque], BAS - marque.h - marque.y)];
}

/* Verso en trois zones. En tete, le nom a gauche et les coordonnees a droite,
   la premiere ligne des coordonnees calee sur la ligne de base du nom, si bien
   qu'elles partagent vraiment sa ligne. Au centre, un embleme : le signe seul,
   sans le mot, et la region juste en dessous, assez pres pour se lire d'un
   bloc. En pied, la phrase de l'agence, centree. Chaque zone occupe la carte
   sur toute sa largeur. */
function bVerso() {
  /* Un seul axe, celui du recto. La version d'avant melangeait trois calages,
     le nom a gauche, les coordonnees a droite, l'embleme au centre : ce sont
     les coordonnees alignees a droite, en escalier, qui paraissaient mal
     posees. Ici tout se centre, et la face se lit d'aplomb du haut au bas.

     Tete : le nom et la fonction, centres sur la marge haute. */
  const nom = texte(NOM_COMPLET, L / 2, PAD, { ...NOM, couleur: CREME, align: 'centre' });
  const role = texte(ROLE, L / 2, pied(nom) + 1.8, { ...CAPITALES, taille: 2.7, ls: 2.7 * 0.13, couleur: LIN, align: 'centre' });

  /* Pied : les coordonnees sur une seule ligne horizontale, centree et calee
     sur la marge basse. Telephone, courriel, site se suivent, separes par un
     blanc large plutot que par un point median, que la charte bannit. La ligne
     mesure 63 mm et laisse 3 mm de chaque cote. Le numero garde son poids,
     c'est ce qu'on cherche en premier. */
  /* Les trois valeurs en creme et toutes en graisse 500, comme la region, la
     fonction et le reste de la face. C'etait la finesse du 400 sur le courriel
     et le site, plus que leur couleur, qui les detachait du numero et du haut
     de la carte. Un cran plus petites que le reste, 2,6 mm soit 7,4 points,
     elles lisent alors comme une ligne de pied et non comme un corps etranger. */
  const ligne = coordonneesEnLigne(0, 0, { couleur: CREME, accent: CREME, taille: 2.6, ecart: 4.5, poids: 500 });
  const largeurLigne = bord(ligne[ligne.length - 1]) - ligne[0].x;
  const ligneCentree = decalerX(ligne, (L - largeurLigne) / 2 - ligne[0].x);
  const coord = decaler(ligneCentree, BAS - pied(ligneCentree[0]));

  /* Embleme central : le signe seul, sans le mot, centre, la region juste
     dessous. Region en creme, plus vive que le lin, parce que c'est le sujet
     de cette face. Le couple est centre dans le vide entre la tete et les
     coordonnees. Ce vide est plus large qu'avant, les deux lignes de
     coordonnees supprimees l'ayant rendu a l'air : c'est cet espace qui aere
     la face du haut en bas. */
  const signe = logo('signe-creme', 0, 0, { hauteur: 9 });
  const signeCentre = decalerX([signe], (L - signe.l) / 2 - signe.x)[0];
  const region = texte(LIEU, L / 2, pied(signeCentre) + 3, { taille: 3.4, poids: 500, couleur: CREME, align: 'centre' });
  const embleme = centrerEntre([signeCentre, region], pied(role), sommet(coord[0]));

  return [fond(VERT), nom, role, ...embleme, ...coord];
}

/* ══ Les deux faces ═════════════════════════════════════════════════════
   Une seule carte desormais. Les cles nomment les fichiers de sortie :
   carte-recto et carte-verso, sans plus de mention de piste. */

const CARTES = {
  recto: bRecto(),
  verso: bVerso(),
};

/* ══ Moteur SVG ═════════════════════════════════════════════════════════ */

function versSVG(elements, { controle = false } = {}) {
  const corps = elements.map((e) => {
    if (e.type === 'fond') return `<rect width="${L}" height="${H}" fill="${controle ? '#FFFFFF' : e.couleur}"/>`;
    if (e.type === 'bloc') {
      /* Le controle de cadrage ne dessine pas les aplats : ils filent dans le
         fond perdu par construction, et leur encre masquerait celle des
         textes, seule mesurable contre la zone de securite. */
      return controle ? '' : `<rect x="${e.x}" y="${e.y}" width="${e.l}" height="${e.h}" fill="${e.couleur}"/>`;
    }
    if (e.type === 'logo') {
      const pose = poserSVG(e.livre, { x: e.x, y: e.y, largeur: e.largeur, hauteur: e.hauteur });
      return controle ? pose.replace(/(fill|stroke)="(?!none)[^"]*"/g, '$1="#000000"') : pose;
    }
    const couleur = controle ? '#000000' : e.couleur;
    return trace(fonte(e.poids), e.contenu, e.taille, { x: e.plume, y: e.base, couleur, ls: e.ls }).markup;
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}mm" height="${H}mm" viewBox="0 0 ${L} ${H}">\n  ${corps}\n</svg>\n`;
}

/* ══ Moteur PDF ═════════════════════════════════════════════════════════ */

function versPDF(elements, chemin) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [mm(L), mm(H)], margin: 0 });
    const flux = doc.pipe(createWriteStream(chemin));
    flux.on('finish', resolve);
    flux.on('error', reject);

    for (const e of elements) {
      if (e.type === 'fond') {
        doc.rect(0, 0, mm(L), mm(H)).fillColor(e.couleur).fill();
      } else if (e.type === 'bloc') {
        doc.rect(mm(e.x), mm(e.y), mm(e.l), mm(e.h)).fillColor(e.couleur).fill();
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

/* ══ Fabrication ════════════════════════════════════════════════════════ */

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

  const controle = await sharp(Buffer.from(versSVG(elements, { controle: true })), { density: 300 })
    .resize({ width: PX(L) }).png().toBuffer();

  await versPDF(elements, `${SORTIE}/carte-${nom}.pdf`);
  rendus[nom] = { png, vue, controle };
}

/* ══ Planche d'arbitrage ════════════════════════════════════════════════
   Un fichier autonome, polices et images comprises : il s'ouvre par
   double-clic et s'envoie par courriel, comme les autres planches de
   l'identite. Les cartes y sont a l'echelle reelle, 85 mm de large, ce qui est
   la seule facon de juger la taille d'un corps de texte imprime. */

const NB = ' ';
const typo = (t) => t.replace(/ ([:;?!»])/g, `${NB}$1`).replace(/« /g, `«${NB}`);

const face = (nom, legende) => `
        <figure class="carte">
          <img src="data:image/png;base64,${rendus[nom].vue.toString('base64')}" alt="Carte ${nom}" width="${PX(CARTE_L)}" height="${PX(CARTE_H)}" loading="lazy">
          <figcaption>${legende}</figcaption>
        </figure>`;

const planche = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Caelestis, carte de visite</title>
<style>
${FACES()}
:root {
  --vert: ${VERT}; --vert-profond: ${VERT_PROFOND}; --creme: ${CREME}; --encre: ${ENCRE};
  --pierre: ${PIERRE}; --parchemin: ${PARCHEMIN}; --mousse: ${MOUSSE_TEXTE}; --lin: ${LIN};
}
* { box-sizing: border-box; }
body { margin: 0; padding: 64px 32px 120px; background: var(--creme); color: var(--encre);
  font-family: Satoshi, "Helvetica Neue", Arial, sans-serif; font-weight: 400; line-height: 1.6;
  -webkit-font-smoothing: antialiased; }
main { max-width: 980px; margin: 0 auto; }
h1 { font-size: 40px; font-weight: 700; letter-spacing: -0.038em; line-height: 1.08; margin: 0 0 12px; }
h2 { font-size: 24px; font-weight: 700; letter-spacing: -0.028em; margin: 0 0 6px; }
.surtitre { font-size: 12px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mousse); margin: 0 0 16px; }
.chapo { color: var(--pierre); max-width: 64ch; margin: 0 0 10px; font-size: 17px; }
.paire { display: flex; flex-wrap: wrap; gap: 30px; margin-top: 30px;
  padding: 34px 30px; background: var(--parchemin); border-radius: 12px; }
.carte { margin: 0; }
.carte img { display: block; width: 85mm; height: 55mm; border-radius: 2.4mm;
  box-shadow: 0 1px 2px rgba(18,22,15,.12), 0 18px 40px -18px rgba(18,22,15,.42); }
.carte figcaption { margin-top: 11px; font-size: 13px; color: var(--pierre); }
.fichiers { margin-top: 16px; font-size: 13px; color: var(--pierre); }
.fichiers a { color: var(--vert); }
.impression { margin-top: 56px; padding: 32px 34px; background: var(--lin); border-radius: 12px; }
.impression h2 { font-size: 18px; margin-bottom: 16px; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 9px 26px; margin: 0; font-size: 14.5px; }
dt { font-weight: 500; color: var(--mousse); }
dd { margin: 0; color: var(--pierre); }
@media (max-width: 760px) {
  body { padding: 40px 18px 80px; }
  .paire { padding: 22px 16px; gap: 22px; }
  .carte img { width: 100%; height: auto; }
}
</style>
</head>
<body>
<main>
  <p class="surtitre">Caelestis, identité</p>
  <h1>Carte de visite</h1>
  <p class="chapo">${typo('La carte retenue, recto et verso, à l\'échelle réelle. Le logo et la spécialité au recto, le nom et les contacts au verso. C\'est la face qui dit une activité que l\'on voit en premier.')}</p>
  <p class="chapo">${typo('Les fichiers d\'impression sont dans <code>identite/marque/exports/impression/</code>, un PDF vectoriel par face.')}</p>
  <div class="paire">
${face('recto', 'Recto')}
${face('verso', 'Verso')}
  </div>
  <p class="fichiers">Impression :
    <a href="exports/impression/carte-recto.pdf">carte-recto.pdf</a>,
    <a href="exports/impression/carte-verso.pdf">carte-verso.pdf</a></p>
  <section class="impression">
    <h2>Ce que reçoit l'imprimeur</h2>
    <dl>
      <dt>Format</dt><dd>85 sur 55 mm, fond perdu de 3 mm, soit un fichier de 91 sur 61 mm</dd>
      <dt>Résolution</dt><dd>300 points par pouce, ${PX(L)} sur ${PX(H)} pixels avec le fond perdu</dd>
      <dt>Marges</dt><dd>composition à ${PAD - FOND_PERDU} mm du trait de coupe, zone de sécurité à ${SECURITE - FOND_PERDU} mm</dd>
      <dt>Corps</dt><dd>${CORPS_MINIMUM_PT} points au plus petit pour un libellé, 8,5 pour les coordonnées. Le contraste de chaque texte est calculé sur le fond qui se trouve réellement dessous</dd>
      <dt>Papier</dt><dd>350 g au minimum, mat ou naturel. C'est le seuil où la carte se sent en main. Le vert forêt s'assombrit sur non couché, demander un bon à tirer</dd>
      <dt>Pelliculage</dt><dd>mat ou soft touch. Le brillant contredit le registre artisanal et refuse le stylo</dd>
      <dt>Encrage</dt><dd>total sous 300 %. Transmettre les valeurs hexadécimales et laisser l'imprimeur convertir avec le profil du papier retenu</dd>
      <dt>Texte</dt><dd>entièrement en tracés, aucune police à fournir</dd>
    </dl>
  </section>
  <section class="impression">
    <h2>Ce qui décide de la carte gardée</h2>
    <dl>
      <dt>La spécialité</dt><dd>elle se retient mieux que la fonction. On retrouve une carte trois semaines plus tard en cherchant un métier, rarement en cherchant un nom</dd>
      <dt>La matière</dt><dd>la main décide avant l'œil. Un non couché texturé ou un soft touch coûtent peu et se remarquent aussitôt</dd>
      <dt>Le verso</dt><dd>il ajoute au lieu de répéter le recto : le nom, la région et les contacts, que le recto ne porte pas</dd>
      <dt>La place pour écrire</dt><dd>garder une zone sans pelliculage brillant : on y note où l'on s'est rencontré, et c'est cette note qui rappelle la carte</dd>
      <dt>Le code QR</dt><dd>il se grefferait au verso, en 22 à 25 mm avec un vide de quatre modules autour. Il reste à décider vers quoi il pointe, la page de contact ou une fiche à enregistrer d'un geste</dd>
    </dl>
  </section>
  <section class="impression">
    <h2>Trois finitions qui valent leur prix</h2>
    <dl>
      <dt>Le gaufrage à sec</dt><dd>le signe en relief, sans encre, sur un papier épais et non couché. C'est le luxe le plus discret</dd>
      <dt>La tranche colorée</dt><dd>vert forêt sur la tranche : la carte se voit dans une pile et posée sur une table, ce qui fait quatre faces au lieu de deux</dd>
      <dt>Le pelliculage soft touch</dt><dd>il change la carte en main pour presque rien, et masque les traces de doigts sur le vert</dd>
    </dl>
    <p class="chapo" style="margin-top:18px">${typo('Écartés : la dorure brillante, le vernis en relief, la découpe compliquée. Aucune finition ne rattrape une composition ratée, elles rendent seulement mémorable une composition déjà juste.')}</p>
  </section>
</main>
</body>
</html>
`;
writeFileSync(`${ICI}/planche-cartes.html`, planche);

/* ══ Controle 1 : cadrage mesure ════════════════════════════════════════
   Le cadrage ne se calcule pas, il se mesure : chaque carte ecrite est relue
   au pixel, on y cherche l'encre, c'est-a-dire tout pixel qui differe du fond,
   et on verifie qu'elle laisse la zone de securite libre. Une police plus
   large, un accent, un trait de contour deplacent un bord sans prevenir.

   La mesure porte sur le rendu de controle, celui qui omet les aplats : un
   aplat file dans le fond perdu par construction, il donnerait une marge nulle
   et masquerait le seul defaut qui compte, un texte trop pres de la coupe. */
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

/* ══ Controle 2 : le PDF contre l'image ═════════════════════════════════
   Le PDF est le fichier qui part chez l'imprimeur, et c'est le seul des trois
   qu'aucun oeil ne verifie ici : il est ecrit par un moteur different de celui
   de l'image. Un decalage de repere, une echelle oubliee ou une face vide
   passeraient donc inapercus.

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
      /* Les aplats sont ignores : le fond couvre la page entiere, et un bloc
         touche toujours un bord, l'invariante etant verifiee par ailleurs.
         Sans cela, toute mesure de marge vaudrait zero sur les pistes
         bicolores, et le PDF ne serait plus comparable a l'image de controle,
         qui ne les dessine pas. Le rectangle de la ligne de sol du signe, lui,
         reste compte : il ne touche aucun bord. */
      const tx0 = ctm[0] * rx + ctm[2] * ry + ctm[4];
      const ty0 = ctm[1] * rx + ctm[3] * ry + ctm[5];
      const tx1 = ctm[0] * (rx + rl) + ctm[2] * (ry + rh) + ctm[4];
      const ty1 = ctm[1] * (rx + rl) + ctm[3] * (ry + rh) + ctm[5];
      const marge = 0.5;   // en points, la tolerance d'un arrondi
      const touche = Math.min(tx0, tx1) <= marge || Math.min(ty0, ty1) <= marge
        || Math.max(tx0, tx1) >= mm(L) - marge || Math.max(ty0, ty1) >= mm(H) - marge;
      if (!touche) { point(rx, ry); point(rx + rl, ry + rh); }
    }
    pris.length = 0;
  }
  const enMm = (pt) => +((pt * 25.4) / 72).toFixed(2);
  /* Le repere du PDF a son origine en bas a gauche, l'axe y monte. */
  return { gauche: enMm(x0), droite: +(L - enMm(x1)).toFixed(2), haut: +(H - enMm(y1)).toFixed(2), bas: enMm(y0) };
}

/* ══ Controle 3 : zone de protection ════════════════════════════════════
   La charte reclame autour d'un logo un vide egal a la moitie de sa hauteur,
   ou aucun bord de page n'entre. C'est ce qui plafonne la medaille de la piste
   C a 26 mm et interdit de faire filer un signe dans le fond perdu. */
function protection(elements) {
  const defauts = [];
  for (const e of elements) {
    if (e.type !== 'logo') continue;
    const vide = e.h / 2;
    const reelles = {
      gauche: e.x - FOND_PERDU, droite: L - FOND_PERDU - (e.x + e.l),
      haut: e.y - FOND_PERDU, bas: H - FOND_PERDU - (e.y + e.h),
    };
    for (const [cote, v] of Object.entries(reelles)) {
      if (v < vide - 0.05) defauts.push(`${e.nom} ${cote} ${v.toFixed(1)} mm pour ${vide.toFixed(1)} attendus`);
    }
  }
  return defauts;
}

/* ══ Controle 4 : lisibilite ════════════════════════════════════════════
   Corps minimum, et contraste WCAG de chaque texte sur le fond qui se trouve
   reellement dessous, aplat compris. La charte l'exige deux fois : elle donne
   ses ratios, et elle interdit la mousse claire en texte. Le calcul le
   verifie plutot que de le croire. */
const canal = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}
const contraste = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return +((x + 0.05) / (y + 0.05)).toFixed(2);
};

/* Le fond reellement sous un texte : le dernier aplat qui contient le centre
   de son encre, sinon le fond de la carte. */
function fondSous(elements, e) {
  const cx = e.x + e.l / 2;
  const cy = e.y + e.h / 2;
  let couleur = CREME;
  for (const a of elements) {
    if (a.type === 'fond') couleur = a.couleur;
    else if (a.type === 'bloc' && cx >= a.x && cx <= a.x + a.l && cy >= a.y && cy <= a.y + a.h) couleur = a.couleur;
  }
  return couleur;
}

function lisibilite(elements) {
  const defauts = [];
  for (const e of elements) {
    if (e.type !== 'texte') continue;
    const pt = e.taille / PT;
    if (pt < CORPS_MINIMUM_PT - 0.05) defauts.push(`corps ${pt.toFixed(1)} pt sur « ${e.contenu.slice(0, 22)} »`);
    const r = contraste(e.couleur, fondSous(elements, e));
    /* 4,5 pour un texte courant, 3 pour un gros corps, comme WCAG 1.4.3. Un
       corps imprime de 14 points ou plus en 700 vaut le gros corps. */
    const seuil = pt >= 14 && e.poids >= 700 ? 3 : 4.5;
    if (r < seuil) defauts.push(`contraste ${r} sur « ${e.contenu.slice(0, 22)} »`);
  }
  return defauts;
}

/* L'invariante des aplats : chacun touche un bord du fichier. */
function aplats(elements) {
  return elements.filter((e) => e.type === 'bloc'
    && e.x > 0.01 && e.y > 0.01 && e.x + e.l < L - 0.01 && e.y + e.h < H - 0.01)
    .map((e) => `aplat flottant ${e.x} ${e.y} ${e.l} ${e.h}`);
}

/* ══ Verdict ════════════════════════════════════════════════════════════ */

console.log(`identite/marque/exports/impression : ${Object.keys(CARTES).length} faces en PDF, PNG 300 dpi et SVG.\n`);
console.log('Cadrage mesure, marges de l\'encre depuis le bord du fichier, en millimetres.');
console.log(`Zone de securite : ${SECURITE} mm. Marge de composition : ${PAD} mm.\n`);

const TOLERANCE = 1.5;
let defauts = 0;
for (const [nom, { controle }] of Object.entries(rendus)) {
  const elements = CARTES[nom];
  const m = await marges(controle);
  const bon = Math.min(m.gauche, m.droite, m.haut, m.bas) >= SECURITE;

  const p = boitePDF(`${SORTIE}/carte-${nom}.pdf`);
  const ecart = Math.max(...['gauche', 'droite', 'haut', 'bas'].map((c) => Math.abs(p[c] - m[c])));
  const accord = ecart <= TOLERANCE;

  const autres = [...protection(elements), ...lisibilite(elements), ...aplats(elements)];
  if (!bon || !accord || autres.length) defauts += 1;

  console.log(`${bon ? 'ok  ' : 'HORS'} ${nom.padEnd(14)} gauche ${String(m.gauche).padStart(5)}  droite ${String(m.droite).padStart(5)}  haut ${String(m.haut).padStart(5)}  bas ${String(m.bas).padStart(5)}   pdf ${accord ? 'conforme' : 'ECART'} ${ecart.toFixed(2)} mm`);
  for (const d of autres) console.log(`     ⚠ ${d}`);
}

console.log(defauts === 0
  ? `\nLes ${Object.keys(rendus).length} faces laissent la zone de securite libre, leur PDF pose le meme dessin au meme endroit, les logos gardent leur zone de protection, et chaque texte tient le corps et le contraste.`
  : `\nAttention : ${defauts} face(s) en defaut.`);
console.log('\nPlanche : identite/marque/planche-cartes.html');

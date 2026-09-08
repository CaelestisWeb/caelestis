/* Poser un fichier livre, sans jamais le redessiner.

   La regle vient d'une faute commise le 7 septembre 2026 : les bandeaux de
   partage reassemblaient le signe et le mot a la main, et le mot n'etait donc
   pas centre comme dans le lockup livre. Un imprimeur recevait un cadrage,
   l'ecran en montrait un autre, et l'ecart ne se voyait qu'a l'usage.

   Ce module lit un SVG de `marque/signe/` ou de `marque/mot/` et le transporte
   tel quel vers deux destinations, une image SVG et un PDF d'impression. Il ne
   recompose rien : il lit la boite du fichier, applique une mise a l'echelle,
   et recopie les primitives. Le jeu de primitives des fichiers livres est
   ferme (path, rect, g) parce que le texte y est deja en traces.

   Le PDF ne sait pas lire un SVG : ses chemins sont redessines un a un par
   pdfkit, ce qui reste un transport et non une recomposition, la geometrie
   venant entierement du fichier. */

import { readFileSync } from 'node:fs';

const nombre = (s, def = 0) => (s === undefined ? def : parseFloat(s));
const attr = (balise, nom) => {
  const m = balise.match(new RegExp(`${nom}="([^"]*)"`));
  return m ? m[1] : undefined;
};

/* La transformation d'un glyphe, telle que l'ecrit `trace()` :
   translate(x y) scale(k -k). Aucune autre forme n'est produite, une forme
   inattendue leve plutot que de sortir un dessin faux. */
function lireTransform(t) {
  if (!t) return null;
  const tr = t.match(/translate\(([-\d.]+)\s+([-\d.]+)\)/);
  const sc = t.match(/scale\(([-\d.]+)(?:\s+([-\d.]+))?\)/);
  if (!tr && !sc) throw new Error(`transform non reconnu : ${t}`);
  const [sx, sy] = sc ? [parseFloat(sc[1]), sc[2] === undefined ? parseFloat(sc[1]) : parseFloat(sc[2])] : [1, 1];
  return { tx: tr ? parseFloat(tr[1]) : 0, ty: tr ? parseFloat(tr[2]) : 0, sx, sy };
}

/* Lit un fichier livre : sa boite (le viewBox, origine comprise) et ses
   primitives a plat, chacune portant sa couleur resolue.

   ⚠️ L'origine du viewBox ne vaut pas 0 0. Les fichiers sont cadres au plus
   juste sur leur encre et commencent a 8.25 4.25. Une page d'accueil l'a
   remise a zero le 7 septembre : le mot des lockups en est sorti decale et
   rogne. Reprendre le viewBox tel quel, origine comprise. */
export function lireLivre(chemin) {
  const src = readFileSync(chemin, 'utf8');
  const vb = src.match(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/);
  if (!vb) throw new Error(`viewBox absent de ${chemin}`);
  const boite = { x: +vb[1], y: +vb[2], l: +vb[3], h: +vb[4] };

  const corps = src.slice(src.indexOf('</title>') + 8, src.lastIndexOf('</svg>'));
  const elements = [];

  /* Un `<g fill="...">` ne porte que la couleur des glyphes qu'il groupe. */
  const groupes = [...corps.matchAll(/<g([^>]*)>([\s\S]*?)<\/g>/g)];
  const hors = groupes.reduce((s, g) => s.replace(g[0], ''), corps);

  const lireFormes = (fragment, fillHerite) => {
    for (const m of fragment.matchAll(/<path([^>]*)\/>/g)) {
      const b = m[1];
      elements.push({
        type: 'path', d: attr(b, 'd'),
        fill: attr(b, 'fill') ?? fillHerite,
        stroke: attr(b, 'stroke'),
        trait: nombre(attr(b, 'stroke-width'), 0),
        tr: lireTransform(attr(b, 'transform')),
      });
    }
    for (const m of fragment.matchAll(/<rect([^>]*)\/>/g)) {
      const b = m[1];
      elements.push({
        type: 'rect',
        x: nombre(attr(b, 'x')), y: nombre(attr(b, 'y')),
        l: nombre(attr(b, 'width')), h: nombre(attr(b, 'height')),
        r: nombre(attr(b, 'rx')),
        fill: attr(b, 'fill') ?? fillHerite,
      });
    }
  };

  lireFormes(hors, undefined);
  for (const g of groupes) lireFormes(g[2], attr(g[1], 'fill'));

  return { boite, elements, chemin };
}

/* Facteur d'echelle et decalage qui posent un fichier livre a (x, y), coin
   haut gauche de son encre, pour une largeur ou une hauteur voulue. */
function calage(livre, { x, y, largeur, hauteur }) {
  const k = largeur !== undefined ? largeur / livre.boite.l : hauteur / livre.boite.h;
  return { k, dx: x - livre.boite.x * k, dy: y - livre.boite.y * k };
}

export const dimensions = (livre, { largeur, hauteur }) => (largeur !== undefined
  ? { l: largeur, h: (largeur * livre.boite.h) / livre.boite.l }
  : { l: (hauteur * livre.boite.l) / livre.boite.h, h: hauteur });

/* Rendu SVG : le contenu du fichier est recopie sous une seule transformation.
   Rien n'est reecrit, pas meme les couleurs. */
export function poserSVG(livre, pose) {
  const { k, dx, dy } = calage(livre, pose);
  const corps = livre.elements.map((e) => {
    if (e.type === 'rect') {
      return `<rect x="${e.x}" y="${e.y}" width="${e.l}" height="${e.h}"${e.r ? ` rx="${e.r}"` : ''} fill="${e.fill}"/>`;
    }
    const t = e.tr ? ` transform="translate(${e.tr.tx} ${e.tr.ty}) scale(${e.tr.sx} ${e.tr.sy})"` : '';
    const peinture = e.stroke
      ? `fill="${e.fill}" stroke="${e.stroke}" stroke-width="${e.trait}"`
      : `fill="${e.fill}"`;
    return `<path${t} d="${e.d}" ${peinture}/>`;
  }).join('');
  return `<g transform="translate(${dx.toFixed(4)} ${dy.toFixed(4)}) scale(${k.toFixed(6)})">${corps}</g>`;
}

/* Rendu PDF. `mm` convertit les millimetres du dessin en points PostScript :
   l'echelle du fichier livre s'y compose, d'ou le produit mm(k). */
export function poserPDF(doc, livre, pose, mm) {
  const { k, dx, dy } = calage(livre, pose);
  doc.save();
  doc.translate(mm(dx), mm(dy)).scale(mm(k));
  for (const e of livre.elements) {
    if (e.type === 'rect') {
      doc.roundedRect(e.x, e.y, e.l, e.h, e.r || 0).fillColor(e.fill).fill();
      continue;
    }
    doc.save();
    if (e.tr) doc.translate(e.tr.tx, e.tr.ty).scale(e.tr.sx, e.tr.sy);
    if (e.stroke) {
      /* Le trait est decrit dans les unites du fichier, que la mise a
         l'echelle du contexte reduit deja : lineWidth le reprend tel quel. */
      doc.path(e.d).lineWidth(e.trait).strokeColor(e.stroke).stroke();
    } else {
      doc.path(e.d).fillColor(e.fill).fill();
    }
    doc.restore();
  }
  doc.restore();
}

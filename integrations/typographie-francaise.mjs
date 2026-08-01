import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Typographie française appliquée au HTML produit, après le build.
 *
 * En français, quatre signes réclament une espace AVANT eux (point-virgule,
 * deux-points, point d'interrogation, point d'exclamation), les guillemets
 * français en réclament une à l'intérieur, et un nombre ne se sépare jamais de
 * son unité. Cette espace doit être INSÉCABLE : sinon le navigateur coupe la
 * ligne juste devant le signe, et le « ? » se retrouve seul en début de ligne.
 * Le défaut est discret sur un écran large et systématique sur un téléphone,
 * là où la colonne fait quarante caractères.
 *
 * Pourquoi au build et non dans les sources : l'espace insécable est invisible
 * dans un éditeur. Écrite à la main, elle est perdue au premier copier-coller et
 * oubliée sur toute nouvelle page. Posée ici, elle s'applique aux 26 pages, y
 * compris à celles qui n'existent pas encore, et ne peut plus se dégrader.
 *
 * Périmètre volontairement étroit :
 *   - le corps de page seulement, jamais le <head> (les métadonnées suivent leur
 *     propre règle : une insécable entre le nombre et l'euro, pas ailleurs) ;
 *   - le texte seulement, jamais un attribut, jamais l'intérieur d'un <script>,
 *     <style>, <pre>, <code> ou <textarea> ;
 *   - U+00A0 (insécable classique) et non U+202F (fine insécable) : la fine
 *     n'existe pas dans toutes les graisses de Satoshi et retomberait alors sur
 *     une police de secours, ce qui se voit.
 */

/** Balises dont le contenu textuel ne doit jamais être retouché. */
const OPAQUES = new Set(['script', 'style', 'pre', 'code', 'textarea', 'kbd', 'samp']);

const NBSP = ' ';

/** Applique les règles à un fragment de texte nu (hors balises). */
function corrigerTexte(t) {
  return (
    t
      /* Espace ordinaire avant ; : ? ! » → insécable.
         La classe qui précède exclut une espace (pas de double espace à traiter)
         et les caractères d'un émoticône, pour ne pas figer « :) ». */
      .replace(/([^\s])[ \t]+([;:?!»])/g, `$1${NBSP}$2`)
      /* Espace ordinaire après un guillemet ouvrant → insécable. */
      .replace(/(«)[ \t]+/g, `$1${NBSP}`)
      /* Nombre et son unité : 1 000 €, 48 h, 30 %. Le séparateur de milliers
         est traité en amont par ailleurs ; ici on soude le dernier groupe. */
      .replace(/(\d)[ \t]+(€|%|h\b|km\b|Ko\b|Mo\b|min\b)/g, `$1${NBSP}$2`)
      /* Séparateur de milliers : 1 000 → insécable, sinon « 1 » finit une ligne
         et « 000 € » commence la suivante. */
      .replace(/(\d)[ \t](\d{3})(?!\d)/g, `$1${NBSP}$2`)
  );
}

/**
 * Parcourt le HTML en distinguant balises et texte, et n'applique la correction
 * qu'au texte du corps de page situé hors d'une balise opaque.
 */
export function typographierHtml(html) {
  let sortie = '';
  let i = 0;
  let profondeurOpaque = 0;
  let dansHead = false;

  while (i < html.length) {
    const debut = html.indexOf('<', i);

    /* Reste du document : du texte pur. */
    if (debut === -1) {
      const texte = html.slice(i);
      sortie += profondeurOpaque > 0 || dansHead ? texte : corrigerTexte(texte);
      break;
    }

    /* Texte qui précède la prochaine balise. */
    if (debut > i) {
      const texte = html.slice(i, debut);
      sortie += profondeurOpaque > 0 || dansHead ? texte : corrigerTexte(texte);
    }

    /* La balise elle-même est recopiée telle quelle : ses attributs ne sont
       jamais retouchés (un title="…" ou un alt="…" reste intact). */
    const fin = html.indexOf('>', debut);
    if (fin === -1) { sortie += html.slice(debut); break; }

    const balise = html.slice(debut, fin + 1);
    sortie += balise;
    i = fin + 1;

    const nom = balise.match(/^<\/?\s*([a-zA-Z][a-zA-Z0-9-]*)/);
    if (nom) {
      const t = nom[1].toLowerCase();
      const fermante = balise[1] === '/';
      const autoFermante = balise.endsWith('/>');
      if (t === 'head') dansHead = !fermante;
      if (OPAQUES.has(t) && !autoFermante) {
        if (fermante) profondeurOpaque = Math.max(0, profondeurOpaque - 1);
        else profondeurOpaque += 1;
      }
    }
  }

  return sortie;
}

function fichiersHtml(dossier, acc = []) {
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) fichiersHtml(chemin, acc);
    else if (entree.endsWith('.html')) acc.push(chemin);
  }
  return acc;
}

export default function typographieFrancaise() {
  return {
    name: 'caelestis:typographie-francaise',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        /* Le dossier de sortie d'Astro, plus celui de Vercel s'il a déjà été
           rempli : selon l'ordre des intégrations, l'un ou l'autre peut être en
           place, et traiter les deux évite de dépendre de cet ordre. */
        const dossiers = [];
        const sortieAstro = dir?.pathname ? decodeURIComponent(dir.pathname).replace(/^\/([A-Za-z]:)/, '$1') : null;
        if (sortieAstro && existsSync(sortieAstro)) dossiers.push(sortieAstro);
        const sortieVercel = join(process.cwd(), '.vercel', 'output', 'static');
        if (existsSync(sortieVercel)) dossiers.push(sortieVercel);

        let pages = 0;
        let corrections = 0;

        for (const dossier of dossiers) {
          for (const fichier of fichiersHtml(dossier)) {
            /* Les pages de travail déposées dans public/ ne sont pas du site. */
            if (fichier.includes('_variantes')) continue;
            const avant = readFileSync(fichier, 'utf8');
            const apres = typographierHtml(avant);
            if (apres !== avant) {
              writeFileSync(fichier, apres, 'utf8');
              pages += 1;
              /* Chaque insécable posée remplace une espace ordinaire : la
                 différence de longueur en octets les compte (U+00A0 pèse deux
                 octets en UTF-8, l'espace un seul). */
              corrections += Buffer.byteLength(apres) - Buffer.byteLength(avant);
            }
          }
        }

        logger.info(`typographie française : ${corrections} espaces insécables posées sur ${pages} fichiers`);
      },
    },
  };
}

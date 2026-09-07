/* Page d'accueil de l'identite : ce qu'il y a, et ou le prendre.
   node identite/build-index.mjs   ecrit identite/index.html
   node identite/serveur.mjs       la sert sur http://localhost:4600

   Les visuels ne sont pas redessines ici, ils viennent des memes modules que
   les fichiers livres. Une page qui recomposerait le signe de son cote
   finirait par montrer autre chose que ce qui est dans signe/. */

import { writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { VERT, CREME, RACINE } from './marque/commun/base.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const NB = ' ';
const typo = (t) => t.replace(/ ([:;?!»])/g, `${NB}$1`).replace(/« /g, `«${NB}`).replace(/(\d) ?%/g, `$1${NB}%`);

/* Un SVG livre, pose a la taille voulue. Le fichier est lu sur le disque : ce
   que montre cette page est exactement ce qu'un imprimeur recevrait. */
function poser(chemin, maxL, maxH, { recolorer = false } = {}) {
  let src = readFileSync(`${ICI}/${chemin}`, 'utf8');
  if (recolorer) src = src.replaceAll(VERT, 'currentColor');
  /* Le viewBox est repris tel quel, origine comprise : les fichiers sont
     cadres sur leur encre et commencent a 8.25 4.25, pas a 0 0. Le remettre a
     zero decale le dessin et rogne le mot par la droite. */
  const vb = src.match(/viewBox="([^"]+)"/)[1];
  const [, , l, h] = vb.split(/\s+/).map(Number);
  const corps = src.slice(src.indexOf('</title>') + 8, src.lastIndexOf('</svg>'));
  const k = Math.min(maxL / l, maxH / h);
  return `<svg viewBox="${vb}" width="${+(l * k).toFixed(1)}" height="${+(h * k).toFixed(1)}" aria-hidden="true">${corps}</svg>`;
}

/* Le compte des fichiers se lit sur le disque, jamais ecrit en dur : un total
   fige se perime au premier ajout et personne ne s'en apercoit. */
const compter = (d) => {
  const p = `${ICI}/${d}`;
  return readdirSync(p, { withFileTypes: true })
    .reduce((n, e) => n + (e.isDirectory() ? compter(`${d}/${e.name}`) : 1), 0);
};

const PIECES = [
  ['signe/signe-vert.svg', 'Le signe seul', 'Cadré au plus juste sur son encre. Filigrane, puce, icône de bloc, tampon.'],
  ['signe/lockup-horizontal-vert.svg', 'Le lockup horizontal', "L'usage courant : en-tête, devis, facture, signature de courriel."],
  ['signe/lockup-vertical-vert.svg', 'Le lockup vertical', 'Les formats étroits ou carrés.'],
  ['signe/tuile-creme-sur-vert.svg', 'La tuile', "Fond compris, pour les emplois où le fond n'est pas maîtrisé."],
  ['signe/favicon.svg', 'Le favicon', 'Redessiné pour la petite taille, contour à 8 au lieu de 7,5.'],
  ['signe/lockup-mot-a-l-ecran-vert.svg', "Le mot à l'écran", 'Les grands formats où le logo est le sujet.'],
  ['signe/tuile-mot-creme-sur-vert.svg', 'La tuile au mot', "Le même en carré. À partir de 128 px, jamais en dessous."],
  ['mot/wordmark-vert.svg', 'Le mot seul', 'Il ne dépend pas du signe et lui survit.'],
];

const EXPORTS = [
  ['exports/png', 'Fonds transparents', 'Deux tailles par fichier, de 512 à 3000 px.'],
  ['exports/aplat', 'Fonds pleins', 'PNG et JPEG, zone de protection respectée.'],
  ['exports/favicon', 'Favicons', "Le jeu complet pour public/, avec son .ico."],
  ['exports/google', 'Fiche Google', 'Logo carré 720 et couverture 1024 × 576.'],
  ['exports/reseaux', 'Réseaux sociaux', 'Avatar 1080, profil 720, couverture 1640 × 720.'],
  ['exports/partage', 'Image de partage', 'Open Graph, 1200 × 630.'],
];

const corps = `
  <div class="planche">
    <header class="tete">
      <p class="surtitre">Identité Caelestis, septembre 2026</p>
      <h1>L'Écran planté</h1>
      <p class="chapo">${typo("Le signe de la marque, livré en famille complète. Un écran 16/10 en contour, un col fuselé qui plonge de quatre unités dans une ligne de sol de 68. L'écran reste vide.")}</p>
      <p class="liens">
        <a class="bouton" href="marque/planche-marque.html">Ouvrir la planche du signe</a>
        <a href="charte-caelestis.html">La charte graphique</a>
        <a href="supports/instagram/planche.html">Les affiches</a>
      </p>
    </header>

    <section class="zone">
      <h2>Les huit pièces</h2>
      <p class="chapo">${typo("Chaque pièce répond à une question différente. Le détail, avec le fichier à choisir pour chaque destination, est dans marque/LISEZ-MOI.md.")}</p>
      <div class="grille">${PIECES.map(([f, nom, quoi]) => `
        <a class="carte" href="marque/${f}">
          <span class="scene">${poser(`marque/${f}`, 130, 118, { recolorer: true })}</span>
          <span class="nom">${nom}</span>
          <span class="quoi">${typo(quoi)}</span>
        </a>`).join('')}
      </div>
    </section>

    <section class="zone">
      <h2>Les exports</h2>
      <p class="chapo">${typo("Tous produits par une seule chaîne, node identite/marque/build-exports.mjs, qui résout ses chemins depuis import.meta.url et tourne donc sur n'importe quelle machine.")}</p>
      <div class="grille grille-serree">${EXPORTS.map(([d, nom, quoi]) => `
        <a class="carte carte-texte" href="marque/${d}/">
          <span class="nom">${nom}</span>
          <span class="quoi">${typo(quoi)}</span>
          <span class="compte">${compter(`marque/${d}`)} fichiers</span>
        </a>`).join('')}
      </div>
    </section>

    <section class="zone zone-avis">
      <h2>Le site sert encore le monogramme</h2>
      <p class="chapo">${typo("Rien n'écrit dans public/. Le jeu de favicons attend dans marque/exports/favicon/, à copier le jour du basculement, avec un ?v= incrémenté sur les liens d'icônes de src/layouts/BaseLayout.astro. Tant qu'il n'a pas eu lieu, la marque a deux visages.")}</p>
    </section>

    <footer class="pied">
      <p>${typo("Cette page : node identite/build-index.mjs. Le signe : node identite/marque/build-signe.mjs, qui écrit les fichiers puis mesure leur cadrage au pixel. Ses exports : node identite/marque/build-exports.mjs.")}</p>
      <p>${typo("Le monogramme en C et les neuf séries de recherche sont sortis du dépôt le 7 septembre 2026. Le raisonnement est gardé dans RECHERCHE.md, les fichiers dans l'historique git.")}</p>
    </footer>
  </div>`;

const fonte = (p) => readFileSync(resolve(RACINE, `src/assets/fonts/satoshi-${p}.woff2`)).toString('base64');
const FACES = [300, 400, 500, 700]
  .map((p) => `@font-face{font-family:Satoshi;src:url(data:font/woff2;base64,${fonte(p)}) format("woff2");font-weight:${p};font-style:normal;font-display:swap}`).join('');

const style = `${readFileSync(`${ICI}/marque/commun/planche.css`, 'utf8')}
/* ── Accueil ──────────────────────────────────────────────────────── */
.tete { padding-bottom: 48px; }
.zone { padding: 56px 0; border-bottom: 1px solid var(--filet); }
.zone > h2 + .chapo { margin-bottom: 30px; max-width: 68ch; }
.liens { display: flex; flex-wrap: wrap; gap: 10px 22px; align-items: center; margin-top: 26px; }
.liens a { color: var(--accent); text-decoration: none; font-size: 0.9375rem; font-weight: 500; border-bottom: 1px solid transparent; }
.liens a:hover { border-bottom-color: currentColor; }
.liens a:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.bouton { background: var(--bande); color: var(--bande-texte) !important; padding: 9px 18px; border-radius: 2px; }
.bouton:hover { background: var(--texte); }

.grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
.grille-serree { grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); }
.carte { display: flex; flex-direction: column; text-decoration: none; background: var(--creme-fixe);
  border: 1px solid var(--parchemin-fixe); color: var(--vert-fixe); }
.carte:hover { border-color: var(--vert-fixe); }
.carte:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.scene { display: grid; place-items: center; min-height: 150px; padding: 22px; }
.scene svg { display: block; max-width: 100%; height: auto; }
.nom { border-top: 1px solid var(--parchemin-fixe); padding: 11px 14px 3px; font-size: 0.9375rem;
  font-weight: 700; letter-spacing: -0.024em; color: #12160F; }
.carte-texte .nom { border-top: 0; padding-top: 18px; }
.quoi { padding: 0 14px 14px; font-size: 0.8125rem; line-height: 1.45; color: #5C6259; }
.compte { padding: 0 14px 16px; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--accent); }
.zone-avis { border-bottom: 0; }
.zone-avis h2 { color: var(--accent); }
.pied p + p { margin-top: 10px; }`;

writeFileSync(`${ICI}/index.html`,
  `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Identité Caelestis</title>\n<link rel="icon" href="marque/signe/tuile-creme-sur-vert.svg">\n<style>${FACES}\n${style}</style>\n</head>\n<body>${corps}\n</body>\n</html>\n`);
console.log('identite/index.html');

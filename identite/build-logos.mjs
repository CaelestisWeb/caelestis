/* Fichiers du logo, ecrits dans identite/logo/.

   Le texte est converti en traces (fontkit) et non pose en <text> : un SVG qui
   porte une @font-face en base64 ne s'affiche correctement que dans un
   navigateur. Partout ailleurs (imprimeur, Canva, Word, Illustrator, sharp)
   la police est remplacee par une substitution systeme, le mot change de
   dessin et deborde de son cadre. En traces, le fichier est identique partout
   et ne depend plus de Satoshi.

   Relancer apres toute evolution de la charte : node identite/build-logos.mjs
   puis node identite/build-exports.mjs et node identite/build-charte.mjs */

import { writeFileSync } from 'node:fs';
import { police, trace, monogramme, LOCKUP, DECALAGE_OPTIQUE_MONO, VERT, CREME, ENCRE } from './lib-traces.mjs';

const ID = 'C:/dev/caelestis/identite';
const MOT = 'Caelestis';
const INTERLETTRAGE = LOCKUP.interlettrage; // -0.02 em, reglage de la charte

const ecrire = (nom, svg) => {
  writeFileSync(`${ID}/logo/${nom}.svg`, svg);
  return nom;
};

/* width et height ne sont qu'une taille par defaut : le viewBox fait foi. Ils
   sont cales sur 1000 px de large pour qu'un import qui les lit sans mise a
   l'echelle (Word, Canva) ne donne pas une vignette de 60 px. */
const entete = (l, h, label = 'Caelestis', vb = `0 0 ${l} ${h}`) => {
  const k = 1000 / l;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="1000" height="${Math.round(h * k)}" role="img" aria-label="${label}"><title>${label}</title>`;
};

/* ── Wordmark seul, cadre au plus juste sur l'encre ────────── */
function wordmark(poids, couleur, nom) {
  const font = police(poids);
  const taille = 100;
  const ls = INTERLETTRAGE * taille;
  const m = trace(font, MOT, taille, { ls });
  const t = trace(font, MOT, taille, { x: -m.gauche, y: -m.haut, couleur, ls });
  const l = +(m.droite - m.gauche).toFixed(2);
  const h = +(m.bas - m.haut).toFixed(2);
  return ecrire(nom, `${entete(l, h)}\n  ${t.markup}\n</svg>\n`);
}

/* Encre du C dans sa tuile de 100 : le trajet passe par la gauche et s'arrete
   a l'ouverture, l'encre occupe donc 13,5 a 72,2 en largeur et 13,5 a 86,5 en
   hauteur. Elle n'est pas centree dans la tuile : la caler demande de la
   pousser de DECALAGE_OPTIQUE_MONO, sinon le C penche visiblement a gauche. */
const ENC = { x0: 13.5, x1: 72.2, y0: 13.5, y1: 86.5 };
const MONO_X = +(100 * DECALAGE_OPTIQUE_MONO).toFixed(2);   // 7,15
const ENCRE_G = +(ENC.x0 + MONO_X).toFixed(2);              // bord gauche reel du C
const ENCRE_D = +(ENC.x1 + MONO_X).toFixed(2);              // bord droit reel du C

/* ── Lockup horizontal : monogramme puis mot, tuile de 100 ───
   Avec tuile, le fichier est cadre sur la tuile. Sans tuile, il est cadre sur
   l'encre du C : garder le vide de la tuile ferait porter au fichier une marge
   parasite de 13,5 %, et tout usage centre paraitrait pousse vers la droite. */
function lockupH(fondTuile, arc, couleurTexte, nom) {
  const font = police(500);
  const taille = 100 * LOCKUP.mot;
  const ls = INTERLETTRAGE * taille;
  const ecart = 100 * LOCKUP.ecart;
  const m = trace(font, MOT, taille, { ls });
  const motX = 100 + ecart - m.gauche;
  const t = trace(font, MOT, taille, { x: motX, y: 100 * LOCKUP.baseline, couleur: couleurTexte, ls });
  const motDroite = motX + m.droite;
  const corps = `${fondTuile ? `<rect width="100" height="100" rx="24" fill="${fondTuile}"/>` : ''}\n  ${monogramme(MONO_X, 0, 100, arc)}\n  ${t.markup}`;

  if (fondTuile) {
    const l = +motDroite.toFixed(2);
    return ecrire(nom, `${entete(l, 100)}\n  ${corps}\n</svg>\n`);
  }
  const l = +(motDroite - ENCRE_G).toFixed(2);
  const h = +(ENC.y1 - ENC.y0).toFixed(2);
  return ecrire(nom, `${entete(l, h, 'Caelestis', `${ENCRE_G} ${ENC.y0} ${l} ${h}`)}\n  ${corps}\n</svg>\n`);
}

/* ── Lockup vertical : monogramme au-dessus du mot ───────────
   La tuile est centree sur la largeur du mot, et l'encre du C est centree dans
   la tuile : les deux centres coincident donc exactement. */
function lockupV(fondTuile, arc, couleurTexte, nom) {
  const font = police(500);
  const ech = 0.68;
  const taille = 100 * ech;
  const ls = INTERLETTRAGE * taille;
  const ecart = 26;
  const m = trace(font, MOT, taille, { ls });
  const l = +(m.droite - m.gauche).toFixed(2);
  const baseline = +(100 + ecart - m.haut).toFixed(2);
  const basMot = +(baseline + m.bas).toFixed(2);
  const tuileX = +((l - 100) / 2).toFixed(2);
  const t = trace(font, MOT, taille, { x: -m.gauche, y: baseline, couleur: couleurTexte, ls });
  const corps = `${fondTuile ? `<rect x="${tuileX}" width="100" height="100" rx="24" fill="${fondTuile}"/>` : ''}\n  ${monogramme(tuileX + MONO_X, 0, 100, arc)}\n  ${t.markup}`;

  if (fondTuile) {
    return ecrire(nom, `${entete(l, basMot)}\n  ${corps}\n</svg>\n`);
  }
  const h = +(basMot - ENC.y0).toFixed(2);
  return ecrire(nom, `${entete(l, h, 'Caelestis', `0 ${ENC.y0} ${l} ${h}`)}\n  ${corps}\n</svg>\n`);
}

/* ── Monogramme sur tuile ──────────────────────────────────── */
function mono(fond, arc, nom) {
  const tuile = `<rect width="100" height="100" rx="24" fill="${fond}"/>`;
  const label = 'Caelestis, monogramme';
  return ecrire(nom, `${entete(100, 100, label)}\n  ${tuile}\n  ${monogramme(MONO_X, 0, 100, arc)}\n</svg>\n`);
}

/* ── Monogramme nu : cadre sur l'encre du C, pas sur sa tuile ── */
function monoNu(couleur, nom) {
  const label = 'Caelestis, monogramme';
  const l = +(ENC.x1 - ENC.x0).toFixed(2);
  const h = +(ENC.y1 - ENC.y0).toFixed(2);
  return ecrire(nom, `${entete(l, h, label, `${ENC.x0} ${ENC.y0} ${l} ${h}`)}\n  ${monogramme(0, 0, 100, couleur)}\n</svg>\n`);
}

const faits = [
  wordmark(500, VERT, 'wordmark-vert'),
  wordmark(500, CREME, 'wordmark-creme'),
  wordmark(700, ENCRE, 'wordmark-encre-700'),

  lockupH(CREME, VERT, VERT, 'lockup-horizontal-sur-clair'),
  lockupH(null, CREME, CREME, 'lockup-horizontal-sur-vert'),
  lockupV(CREME, VERT, VERT, 'lockup-vertical-sur-clair'),
  lockupV(null, CREME, CREME, 'lockup-vertical-sur-vert'),

  // Sans tuile, tout en vert : la version a poser sur un fond clair
  // quelconque (papier a en-tete, document Word, diapositive blanche).
  lockupH(null, VERT, VERT, 'lockup-horizontal-nu-vert'),
  lockupV(null, VERT, VERT, 'lockup-vertical-nu-vert'),

  mono(CREME, VERT, 'monogramme-vert-sur-creme'),
  mono(VERT, CREME, 'monogramme-creme-sur-vert'),
  monoNu(VERT, 'monogramme-nu-vert'),
  monoNu(CREME, 'monogramme-nu-creme'),
  monoNu(ENCRE, 'monogramme-nu-encre'),
];

console.log(`identite/logo : ${faits.length} SVG en traces, sans dependance a Satoshi.`);

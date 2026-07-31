import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { formule, FICHE_GOOGLE, type Formule } from '../../utils/tarifs';

export const prerender = false;

/* ══════════════════════════════════════════════════════════
   RATE LIMITING — fenêtre glissante 15min / 5 envois / IP
══════════════════════════════════════════════════════════ */
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX       = 5;
const rateLimitMap   = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string) {
  const now   = Date.now();
  /* Purge opportuniste des entrées expirées — remplace le setInterval, inopérant en serverless. */
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap.entries()) if (now > v.resetAt) rateLimitMap.delete(k);
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }
  if (entry.count >= RATE_MAX) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSecs: 0 };
}

/* ══════════════════════════════════════════════════════════
   ORIGINES AUTORISÉES
══════════════════════════════════════════════════════════ */
const ALLOWED_ORIGINS = new Set([
  'https://caelestis.fr',
  'https://www.caelestis.fr',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:4321'] : []),
]);

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const FAKE_LOCALS  = new Set(['test','fake','temp','demo','sample','noreply','no-reply','spam','asdf','qwerty','toto','tata','azerty','blabla','aaa','bbb','xxx','null','undefined','admin@']);
const FAKE_DOMAINS = new Set(['test.com','test.fr','example.com','example.org','example.fr','fake.com','fake.fr','mailinator.com','guerrillamail.com','guerrillamail.fr','yopmail.com','throwaway.email','tempmail.com','trashmail.com','trashmail.me','maildrop.cc','sharklasers.com','spam4.me','dispostable.com','getairmail.com','filzmail.com','tempr.email','anonaddy.com','getnada.com']);

function isFakeEmail(email: string): boolean {
  const lower  = email.toLowerCase();
  const atIdx  = lower.indexOf('@');
  if (atIdx < 0) return false;
  const local  = lower.slice(0, atIdx);
  const domain = lower.slice(atIdx + 1);
  return FAKE_LOCALS.has(local) || FAKE_DOMAINS.has(domain);
}

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}

/* ══════════════════════════════════════════════════════════
   LISTES VALIDES
══════════════════════════════════════════════════════════ */
const VALID_TYPES = new Set(['pageUnique', 'vitrine', 'boutique', 'surMesure']);
const VALID_Q2    = new Set(['simple', 'standard', 'complet', 'small', 'medium', 'large', 'creation', 'refonte', 'ajout', 'autre']);
const VALID_Q3    = new Set(['ready', 'has_logo', 'nothing', 'starting', 'existing', 'collective', 'simple', 'medium', 'complex', 'autre']);
const VALID_QC    = new Set(['few', 'moderate', 'rich', 'brief', 'ideas', 'blank', 'autre']);
const VALID_Q4    = new Set(['slow', 'soon', 'urgent', 'autre']);
const VALID_GB    = new Set(['creation', 'refonte', 'no']);

function validateArray(arr: string[], valid: Set<string>): boolean {
  return arr.length > 0 && arr.every(v => valid.has(v));
}

/* ══════════════════════════════════════════════════════════
   TYPE DOMINANT (pour branchement et texte personnalisé)
══════════════════════════════════════════════════════════ */
function dominantType(types: string[]): string {
  if (types.includes('surMesure')) return 'surMesure';
  if (types.includes('boutique'))  return 'boutique';
  if (types.includes('pageUnique')) return 'pageUnique';
  return 'vitrine';
}

/* ══════════════════════════════════════════════════════════
   LABELS LISIBLES
══════════════════════════════════════════════════════════ */
const TYPE_LABELS: Record<string, string> = {
  pageUnique: 'Page unique',
  vitrine:   'Site vitrine',
  boutique:  'Boutique en ligne',
  surMesure: 'Site sur mesure',
};

const Q2_QUESTION: Record<string, string> = {
  vitrine:   'Nombre de pages',
  boutique:  'Nombre de produits',
  surMesure: 'Type de projet',
};

const Q3_QUESTION: Record<string, string> = {
  pageUnique: 'Contenu disponible',
  vitrine:   'Contenu disponible',
  boutique:  'État du stock',
  surMesure: 'Complexité',
};

const QC_QUESTION: Record<string, string> = {
  boutique:  'Volume de contenu',
  surMesure: 'Maturité du projet',
};

const QC_LABELS: Record<string, string> = {
  few:      'Peu de contenu',
  moderate: 'Volume modéré',
  rich:     'Contenu riche / volume important',
  brief:    'Tout est défini',
  ideas:    'Les grandes lignes sont claires',
  blank:    'Je cherche encore',
};

const Q2_LABELS: Record<string, Record<string, string>> = {
  vitrine:   {
    simple:   'Simple · 1 à 4 pages',
    standard: 'Standard · 4 à 6 pages',
    complet:  'Complet · 6 pages et plus',
  },
  boutique:  {
    small:  '0 à 10 produits',
    medium: '10 à 30 produits',
    large:  '30 à 50 produits',
  },
  surMesure: {
    creation: 'Création from scratch',
    refonte:  'Refonte d\'un site existant',
    ajout:    'Ajout de fonctionnalités',
  },
};

const Q3_LABELS: Record<string, Record<string, string>> = {
  pageUnique: {
    ready:    'Tout est prêt',
    has_logo: 'Logo existant, textes à rédiger',
    nothing:  'Tout est à créer',
  },
  vitrine:   {
    ready:    'Tout est prêt',
    has_logo: 'Logo existant, textes à rédiger',
    nothing:  'Tout est à créer',
  },
  boutique:  {
    starting:   'Je démarre',
    existing:   'Stock existant à intégrer',
    collective: 'Regroupement de producteurs / artisans',
  },
  surMesure: {
    simple:  'Design soigné, contenu riche',
    medium:  'Interactions & espace membre',
    complex: 'Application ou plateforme',
  },
};

const Q4_LABELS: Record<string, string> = {
  slow:   'Dans 2 à 3 mois',
  soon:   "D'ici 4 à 6 semaines",
  urgent: 'Dès que possible',
};

const INTEREST_LABELS: Record<number, string> = {
  1: 'Peu intéressé (1/5)',
  2: 'Peu intéressé (2/5)',
  3: 'Intéressé (3/5)',
  4: 'Très intéressé (4/5)',
  5: 'Prêt à lancer (5/5)',
};

/* Génère un label lisible pour un tableau de valeurs (joint par " · ") */
function getAnswerLabels(vals: string[], otherText: string, map: Record<string, string>): string {
  return vals.map(v => {
    if (v === 'autre') return otherText ? `Autre : ${otherText}` : 'Autre (non précisé)';
    return map[v] ?? v;
  }).join(' · ');
}

/* ══════════════════════════════════════════════════════════
   SCORING — points additifs par réponse (MAX si multi-select)
══════════════════════════════════════════════════════════ */
/* q2 n'existe que pour la vitrine (nombre de pages) et la boutique (nombre de
   produits). La page unique et le sur mesure ne posent pas cette question :
   aucun bareme ici, toute valeur recue y vaut donc 0 point. */
const Q2_SCORES: Record<string, Record<string, number>> = {
  vitrine:   { simple: 0, standard: 150, complet:          250, autre: 150 },
  boutique:  { small:  0, medium:   175, large:            350, autre: 200 },
};
const Q3_SCORES: Record<string, Record<string, number>> = {
  pageUnique: { ready: 0, has_logo:    100, nothing:       200, autre: 100 },
  vitrine:   { ready: 0, has_logo:     100, nothing:       200, autre: 100 },
  boutique:  { starting: 0, collective: 100, existing:     200, autre: 125 },
  surMesure: { simple: 0, medium: 200, complex: 450, autre: 225 },
};
const QC_SCORES: Record<string, Record<string, number>> = {
  boutique:  { few: 0, moderate: 200, rich: 450, autre: 200 },
  surMesure: { brief: 0, ideas: 175, blank: 350, autre: 200 },
};
const Q4_SCORES: Record<string, number> = {
  slow: 0, soon: 50, urgent: 100, autre: 50,
};

function maxScore(vals: string[], scores: Record<string, number>): number {
  if (vals.length === 0) return 0;
  return Math.max(...vals.map(v => scores[v] ?? 0));
}

/* ══════════════════════════════════════════════════════════
   CALCUL DU PRIX — 4 zones par type
   Le ratio score/scoreMax determine la zone (quartile).
   ─────────────────────────────────────────────────────────
   Chaque formule va de son prix plancher au double de ce plancher :
   la zone 1 part du prix affiche sur la page de l'offre, la zone 4
   s'arrete a son double. Une estimation qui commencerait sous le prix
   annonce serait un mensonge, au-dessus une incoherence.

   Au 31/07/2026, avec les prix en vigueur dans tarifs.ts :
   Page unique : 1000-1250 / 1250-1500 / 1500-1750 / 1750-2000
   Vitrine     : 2000-2500 / 2500-3000 / 3000-3500 / 3500-4000
   Boutique    : 2500-3100 / 3100-3800 / 3800-4400 / 4400-5000
   Sur mesure  : 3500-4400 / 4400-5300 / 5300-6200 / 6200-7000
══════════════════════════════════════════════════════════ */

/* Score maximum atteignable par type : somme des valeurs max des questions
   REELLEMENT posees. La question q2 n'est posee ni pour la page unique ni
   pour le sur mesure (le front envoie une valeur neutre a 0 point) : la
   compter ici rendrait la derniere zone mathematiquement inatteignable. */
const MAX_SCORE: Record<string, number> = {
  pageUnique: 300,   // q3 200 + q4 100
  vitrine:    550,   // q2 250 + q3 200 + q4 100
  boutique:  1100,   // q2 350 + q3 200 + qc 450 + q4 100
  surMesure:  900,   // q3 450 + qc 350 + q4 100
};

type PriceZone = { low: number; high: number };

/* Le simulateur nomme les formules autrement que tarifs.ts, pour des raisons
   historiques de front. Cette table fait le pont, et evite de recopier ici
   des prix qui finiraient par diverger de ceux affiches sur les offres. */
const FORMULE_ID: Record<string, Formule['id']> = {
  pageUnique: 'page-unique',
  vitrine:    'site-vitrine',
  boutique:   'boutique-en-ligne',
  surMesure:  'site-sur-mesure',
};

/* Seules les trois bornes intermediaires sont ecrites ici. Le plancher (le
   prix affiche sur la page de l'offre) et le plafond (son double) viennent de
   tarifs.ts : changer un prix la-bas suffit, le simulateur ne peut plus
   annoncer un prix de depart different de celui de l'offre. */
const PALIERS: Record<string, [number, number, number]> = {
  pageUnique: [1250, 1500, 1750],
  vitrine:    [2500, 3000, 3500],
  boutique:   [3100, 3800, 4400],
  surMesure:  [4400, 5300, 6200],
};

function construireZones(type: string): [PriceZone, PriceZone, PriceZone, PriceZone] {
  const plancher = formule(FORMULE_ID[type]).prix;
  const plafond  = plancher * 2;
  /* Les bornes sont ramenees dans l'intervalle puis remises en ordre. Si un
     prix bouge dans tarifs.ts sans que les paliers ci-dessus soient revus,
     l'estimation reste coherente (jamais un minimum au-dessus d'un maximum)
     au lieu d'annoncer une fourchette absurde au prospect. */
  const [a, b, c] = PALIERS[type]
    .map(v => Math.min(Math.max(v, plancher), plafond))
    .sort((x, y) => x - y);
  return [
    { low: plancher, high: a },
    { low: a,        high: b },
    { low: b,        high: c },
    { low: c,        high: plafond },
  ];
}

const PRICE_ZONES: Record<string, [PriceZone, PriceZone, PriceZone, PriceZone]> = {
  pageUnique: construireZones('pageUnique'),
  vitrine:    construireZones('vitrine'),
  boutique:   construireZones('boutique'),
  surMesure:  construireZones('surMesure'),
};

/* Fiche Google Business : un supplement, pas un pourcentage. Les montants
   viennent de tarifs.ts, le front affiche les memes sur ses etiquettes.
   Le sur mesure l'inclut : c'est un argument de vente de la formule haute. */
const GB_ADDONS: Record<string, number> = {
  creation: FICHE_GOOGLE.creation,
  refonte:  FICHE_GOOGLE.refonte,
  no:       0,
};
function gbAddon(dt: string, choice: string): number {
  if (dt === 'surMesure') return 0;
  return GB_ADDONS[choice] ?? 0;
}
const GB_LABELS: Record<string, string> = {
  creation: `Création de la fiche Google Business (+${FICHE_GOOGLE.creation} €)`,
  refonte:  `Refonte de la fiche existante (+${FICHE_GOOGLE.refonte} €)`,
  no:       'Non, pas pour l\'instant',
};
const GB_LABEL_INCLUS = 'Incluse dans la formule sur mesure';

function calculateEstimate(
  types:  string[],
  q2Vals: string[],
  q3Vals: string[],
  qcVals: string[],
  q4Vals: string[],
  gbVals: string[],
) {
  const dt  = dominantType(types);
  const q2s = Q2_SCORES[dt] ?? {};
  const q3s = Q3_SCORES[dt] ?? {};
  const qcs = QC_SCORES[dt] ?? {};

  const score = maxScore(q2Vals, q2s)
              + maxScore(q3Vals, q3s)
              + maxScore(qcVals, qcs)
              + maxScore(q4Vals, Q4_SCORES);

  const maxS    = MAX_SCORE[dt] ?? 550;
  const ratio   = maxS > 0 ? score / maxS : 0;
  const zoneIdx = ratio < 0.25 ? 0 : ratio < 0.5 ? 1 : ratio < 0.75 ? 2 : 3;
  const zone    = PRICE_ZONES[dt]?.[zoneIdx] ?? PRICE_ZONES.vitrine[0];
  const gbBonus = gbAddon(dt, gbVals[0] ?? 'no');

  return { low: zone.low + gbBonus, high: zone.high + gbBonus };
}

function getSummaryLine(type: string, q2: string, q3: string, qc: string, q2Other: string, q3Other: string, _qcOther: string): string {
  if (type === 'pageUnique') {
    const cont: Record<string, string> = {
      ready:    'contenus prêts',
      has_logo: 'logo existant, textes à rédiger',
      nothing:  'tout à construire ensemble',
    };
    return `Page unique, ${cont[q3] ?? esc(q3Other)}.`;
  }
  if (type === 'vitrine') {
    const pages: Record<string, string> = { simple: '1 à 4 pages', standard: '4 à 6 pages', complet: '6 pages et +' };
    const cont:  Record<string, string> = {
      ready:    'contenus prêts',
      has_logo: 'logo existant, textes à rédiger',
      nothing:  'tout à construire ensemble',
    };
    return `Site vitrine ${pages[q2] ?? esc(q2Other)}, ${cont[q3] ?? esc(q3Other)}.`;
  }
  if (type === 'boutique') {
    const prods: Record<string, string> = { small: '0 à 10 produits', medium: '10 à 30 produits', large: '30 à 50 produits' };
    const stock: Record<string, string> = { starting: 'démarrage', existing: 'stock existant à importer', collective: 'boutique collective' };
    const vol:   Record<string, string> = { few: 'peu de contenu', moderate: 'volume modéré', rich: 'catalogue dense' };
    const v = vol[qc] ? `, ${vol[qc]}` : '';
    return `Boutique ${prods[q2] ?? esc(q2Other)}, ${stock[q3] ?? esc(q3Other)}${v}.`;
  }
  const compl: Record<string, string> = {
    simple:  'axé design et contenus',
    medium:  'avec espace membre ou réservation',
    complex: 'technique avancé',
  };
  const mat: Record<string, string> = { brief: 'projet cadré', ideas: 'grandes lignes définies', blank: 'à co-construire' };
  const m = mat[qc] ? `, ${mat[qc]}` : '';
  return `Projet sur mesure ${compl[q3] ?? esc(q3Other)}${m}.`;
}

/* ══════════════════════════════════════════════════════════
   EMAIL PROSPECT
══════════════════════════════════════════════════════════ */
function buildProspectEmail(p: {
  prenom: string; activity: string; company: string; email: string;
  types: string[];
  q2Primary: string; q2Other: string;
  q3Primary: string; q3Other: string;
  qcPrimary: string; qcOther: string;
  q4Primary: string; q4Other: string;
  q2Label: string; q3Label: string; qcLabel: string; q4Label: string; gbLabel: string;
  q2Question: string; q3Question: string; qcQuestion: string;
  gbVals: string[];
  low: number; high: number;
}) {
  const dt           = dominantType(p.types);
  const typeLabel    = esc(p.types.map(t => TYPE_LABELS[t] ?? t).join(' · '));
  const safeActivity = esc(p.activity);
  const summaryLine  = getSummaryLine(dt, p.q2Primary, p.q3Primary, p.qcPrimary, p.q2Other, p.q3Other, p.qcOther);

  const rows = [
    ['Type de site',     typeLabel],
    ...((dt !== 'surMesure' && dt !== 'pageUnique') ? [[p.q2Question, esc(p.q2Label)]] : []),
    [p.q3Question,       esc(p.q3Label)],
    ...((dt === 'boutique' || dt === 'surMesure') ? [[p.qcQuestion, esc(p.qcLabel)]] : []),
    ['Délai souhaité',   esc(p.q4Label)],
    ['Google Business',  esc(p.gbLabel)],
  ];

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <style>
    @media only screen and (max-width:620px){
      .em-outer{padding:0!important;}
      .em-pad{padding-left:20px!important;padding-right:20px!important;}
      .em-price{font-size:26px!important;}
      .em-btn{width:100%!important;}
      .em-btn a{display:block!important;text-align:center!important;}
      td.rl{display:block!important;width:100%!important;border-bottom:none!important;padding-bottom:3px!important;}
      td.rv{display:block!important;width:100%!important;padding-top:2px!important;border-bottom:1px solid rgba(207,192,160,0.5)!important;padding-bottom:12px!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#E8DFCB;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table class="em-outer" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E8DFCB;padding:32px 16px;">
  <tr><td align="center">
    <table cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- Barre accent -->
      <tr><td height="4" style="background:linear-gradient(90deg,#255C41 0%,#7a9140 55%,#c8b46a 100%);font-size:0;line-height:0;mso-line-height-rule:exactly;"> </td></tr>

      <!-- Header -->
      <tr><td class="em-pad" style="background-color:#255C41;padding:26px 36px 22px;">
        <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(252, 251, 248,0.45);font-weight:500;">Caelestis · Création de site web</p>
        <p style="margin:0;font-size:24px;color:#F4F2EC;letter-spacing:-0.02em;line-height:1.25;"><span style="font-weight:300;">Votre estimation </span><strong style="font-weight:700;">personnalisée</strong></p>
      </td></tr>

      <!-- Intro -->
      <tr><td class="em-pad" style="background-color:#FCFBF8;padding:26px 36px 12px;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#255C41;">Bonjour ${esc(p.prenom)},</p>
        <p style="margin:0;font-size:14px;color:#5C6259;line-height:1.75;">Voici votre estimation pour <strong style="color:#255C41;">${safeActivity}</strong>. ${summaryLine}</p>
      </td></tr>

      <!-- Bloc prix -->
      <tr><td class="em-pad" style="background-color:#FCFBF8;padding:14px 36px 28px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="background-color:#255C41;padding:22px 24px 20px;border-radius:10px;text-align:center;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(252, 251, 248,0.5);">${typeLabel}</p>
            <p class="em-price" style="margin:0;font-size:34px;font-weight:700;color:#F4F2EC;letter-spacing:-0.03em;line-height:1.1;">${p.low === p.high ? `${p.low.toLocaleString('fr-FR')}&nbsp;€` : `${p.low.toLocaleString('fr-FR')}&nbsp;€&ensp;<span style="font-weight:200;font-size:22px;color:rgba(252, 251, 248,0.35);">à</span>&ensp;${p.high.toLocaleString('fr-FR')}&nbsp;€`}</p>
            <p style="margin:10px 0 0;font-size:11px;color:rgba(252, 251, 248,0.32);letter-spacing:0.02em;">Estimation indicative · devis précis après échange</p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Résumé -->
      <tr><td class="em-pad" style="background-color:#F5EEE0;padding:20px 36px 22px;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#B8C4BB;font-weight:600;">Vos réponses</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${rows.map(([label, value]) => `
          <tr>
            <td class="rl" style="padding:9px 0;border-bottom:1px solid rgba(207,192,160,0.4);width:38%;vertical-align:middle;">
              <p style="margin:0;font-size:11px;color:#5C6259;letter-spacing:0.06em;text-transform:uppercase;">${label}</p>
            </td>
            <td class="rv" style="padding:9px 0;border-bottom:1px solid rgba(207,192,160,0.4);vertical-align:middle;">
              <p style="margin:0;font-size:13px;color:#255C41;font-weight:500;line-height:1.4;">${value}</p>
            </td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td class="em-pad" style="background-color:#FCFBF8;padding:24px 36px 28px;">
        <p style="margin:0 0 20px;font-size:14px;color:#5C6259;line-height:1.7;">Cette fourchette est un premier repère. Pour un devis précis, je vous propose un <strong style="color:#255C41;">appel gratuit de 20 minutes</strong>, sans engagement.</p>
        <table class="em-btn" cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#255C41;padding:13px 30px;border-radius:8px;text-align:center;">
            <a href="https://caelestis.fr/contact" style="font-size:14px;font-weight:600;color:#F4F2EC;text-decoration:none;letter-spacing:0.03em;white-space:nowrap;">Discutons de votre projet →</a>
          </td></tr>
        </table>
      </td></tr>

      <!-- Signature -->
      <tr><td class="em-pad" style="background-color:#FCFBF8;padding:0 36px 28px;">
        <p style="margin:0 0 2px;font-size:14px;color:#5C6259;">À très bientôt,</p>
        <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#255C41;">Célestin</p>
        <p style="margin:0;font-size:12px;color:#5C6259;">Fondateur de Caelestis · 07&nbsp;69&nbsp;36&nbsp;27&nbsp;27</p>
      </td></tr>

      <!-- Pied -->
      <tr><td class="em-pad" style="background-color:#2e3b1a;padding:16px 36px;">
        <p style="margin:0;font-size:11px;color:rgba(252, 251, 248,0.30);line-height:1.6;">Vous recevez cet email suite à votre simulation sur <a href="https://caelestis.fr" style="color:rgba(252, 251, 248,0.52);text-decoration:none;">caelestis.fr</a> · contact@caelestis.fr</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   EMAIL ADMIN
══════════════════════════════════════════════════════════ */
function buildAdminEmail(p: {
  prenom: string; activity: string; company: string; email: string;
  types: string[];
  q2Label: string; q3Label: string; qcLabel: string; q4Label: string; gbLabel: string;
  q2Question: string; q3Question: string; qcQuestion: string;
  low: number; high: number; interest: number; date: string;
}) {
  const dt         = dominantType(p.types);
  const typeLabel  = esc(p.types.map(t => TYPE_LABELS[t] ?? t).join(' · '));
  const safeEmail  = esc(p.email);
  const safePrenom = esc(p.prenom);

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F2EC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F2EC;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <tr><td style="background-color:#255C41;padding:32px 40px;border-radius:4px 4px 0 0;">
        <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(252, 251, 248,0.45);">Caelestis · Simulateur</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#F4F2EC;">Nouveau prospect</h1>
        <p style="margin:6px 0 0;font-size:12px;color:rgba(252, 251, 248,0.38);">${esc(p.date)}</p>
      </td></tr>

      <!-- Badge estimation -->
      <tr><td style="background-color:#FCFBF8;padding:28px 40px 0;">
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#255C41;padding:10px 22px;border-radius:99px;">
            <p style="margin:0;font-size:14px;font-weight:500;color:#F4F2EC;">${p.low === p.high ? `${p.low.toLocaleString('fr-FR')}&nbsp;€` : `Entre ${p.low.toLocaleString('fr-FR')}&nbsp;€ et ${p.high.toLocaleString('fr-FR')}&nbsp;€`} · ${typeLabel}</p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Coordonnées -->
      <tr><td style="background-color:#FCFBF8;padding:24px 40px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#B8C4BB;font-weight:600;border-bottom:1px solid #F4F2EC;padding-bottom:10px;">Coordonnées</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${[['Prénom', safePrenom], ['Entreprise', esc(p.company) || 'non précisé'], ['Activité', esc(p.activity)]].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #F4F2EC;width:120px;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#5C6259;letter-spacing:0.08em;text-transform:uppercase;">${label}</p>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #F4F2EC;">
              <p style="margin:0;font-size:14px;color:#255C41;font-weight:500;">${value}</p>
            </td>
          </tr>`).join('')}
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#5C6259;letter-spacing:0.08em;text-transform:uppercase;">Email</p>
            </td>
            <td style="padding:8px 0;">
              <a href="mailto:${safeEmail}" style="font-size:14px;color:#255C41;font-weight:500;text-decoration:none;">${safeEmail}</a>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Projet simulé -->
      <tr><td style="background-color:#FCFBF8;padding:24px 40px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#B8C4BB;font-weight:600;border-bottom:1px solid #F4F2EC;padding-bottom:10px;">Projet simulé</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${[
            ['Type de site',      typeLabel],
            ...((dt !== 'surMesure' && dt !== 'pageUnique') ? [[p.q2Question, esc(p.q2Label)]] : []),
            [p.q3Question,        esc(p.q3Label)],
            ...((dt === 'boutique' || dt === 'surMesure') ? [[p.qcQuestion, esc(p.qcLabel)]] : []),
            ['Délai souhaité',    esc(p.q4Label)],
            ['Google Business',   esc(p.gbLabel)],
            ["Niveau d'intérêt",  esc(INTEREST_LABELS[p.interest] ?? `${p.interest}/5`)],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #F4F2EC;width:140px;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#5C6259;letter-spacing:0.08em;text-transform:uppercase;">${label}</p>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #F4F2EC;">
              <p style="margin:0;font-size:13px;color:#255C41;font-weight:500;line-height:1.5;">${value}</p>
            </td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- CTA répondre -->
      <tr><td style="background-color:#FCFBF8;padding:24px 40px 36px;">
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#255C41;padding:14px 28px;border-radius:99px;">
            <a href="mailto:${safeEmail}?subject=Suite%20%C3%A0%20votre%20simulation%20Caelestis&body=Bonjour%20${encodeURIComponent(p.prenom)}%2C%0A%0A" style="font-size:13px;font-weight:600;color:#F4F2EC;text-decoration:none;letter-spacing:0.04em;">Répondre à ${safePrenom} →</a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="background-color:#255C41;padding:20px 40px;border-radius:0 0 4px 4px;">
        <p style="margin:0;font-size:11px;color:rgba(252, 251, 248,0.32);">Envoyé via le simulateur de <strong style="color:rgba(252, 251, 248,0.55);">caelestis.fr</strong></p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   ENDPOINT POST /api/simulator
══════════════════════════════════════════════════════════ */
export const POST: APIRoute = async ({ request }) => {

  /* CORS */
  const origin = request.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ error: 'Accès non autorisé.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  /* Rate limiting */
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',').at(0)?.trim() ?? 'unknown';
  const { allowed, retryAfterSecs } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Trop de demandes. Réessayez dans ${Math.ceil(retryAfterSecs / 60)} minute(s).` }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfterSecs) } }
    );
  }

  const smtpPassword = import.meta.env.OVH_SMTP_PASSWORD;
  if (!smtpPassword) {
    return new Response(JSON.stringify({ error: 'Configuration serveur incomplète.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json() as Record<string, unknown>;

    /* Honeypot */
    if (body.website && String(body.website).length > 0) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    /* Extraction */
    const prenom   = String(body.prenom   ?? '').trim().slice(0, 100);
    const activity = String(body.activity ?? '').trim().slice(0, 200);
    const company  = String(body.company  ?? '').trim().slice(0, 200);
    const email    = String(body.email    ?? '').trim().slice(0, 254);
    const types    = toArray(body.types).map(v => v.slice(0, 20));
    const q2Vals   = toArray(body.q2Vals).map(v => v.slice(0, 30));
    const q2Other  = String(body.q2Other  ?? '').trim().slice(0, 300);
    const q3Vals   = toArray(body.q3Vals).map(v => v.slice(0, 30));
    const q3Other  = String(body.q3Other  ?? '').trim().slice(0, 300);
    const qcVals   = toArray(body.qcVals).map(v => v.slice(0, 30));
    const qcOther  = String(body.qcOther  ?? '').trim().slice(0, 300);
    const q4Vals   = toArray(body.q4Vals).map(v => v.slice(0, 30));
    const q4Other  = String(body.q4Other  ?? '').trim().slice(0, 300);
    const gbVals   = toArray(body.gbVals).map(v => v.slice(0, 10));
    const interest = Math.max(0, Math.min(5, parseInt(String(body.interest ?? '0'), 10)));

    /* Validation */
    if (!prenom || !activity || !email) {
      return new Response(JSON.stringify({ error: 'Données manquantes.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!EMAIL_REGEX.test(email) || /[,;\r\n]/.test(email)) {
      return new Response(JSON.stringify({ error: 'Adresse email invalide.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (isFakeEmail(email)) {
      return new Response(JSON.stringify({ error: 'Veuillez entrer votre vraie adresse email pour recevoir votre estimation.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!validateArray(types, VALID_TYPES)) {
      return new Response(JSON.stringify({ error: 'Type de site invalide.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!validateArray(q2Vals, VALID_Q2) || !validateArray(q3Vals, VALID_Q3) || !validateArray(q4Vals, VALID_Q4)) {
      return new Response(JSON.stringify({ error: 'Données invalides.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    /* Validation qcVals uniquement pour boutique/surMesure */
    const dtCheck = dominantType(types);
    if (gbVals.length > 0 && !validateArray(gbVals, VALID_GB)) {
      return new Response(JSON.stringify({ error: 'Données invalides (Google Business).' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if ((dtCheck === 'boutique' || dtCheck === 'surMesure') && !validateArray(qcVals, VALID_QC)) {
      return new Response(JSON.stringify({ error: 'Données invalides (contenu).' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!interest || interest < 1 || interest > 5) {
      return new Response(JSON.stringify({ error: "Veuillez indiquer votre niveau d'intérêt." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    /* Si "autre" sélectionné, le texte libre est requis */
    if ((q2Vals.includes('autre') && !q2Other) ||
        (q3Vals.includes('autre') && !q3Other) ||
        (qcVals.includes('autre') && !qcOther) ||
        (q4Vals.includes('autre') && !q4Other)) {
      return new Response(JSON.stringify({ error: 'Veuillez préciser votre réponse "Autre".' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    /* Type dominant + premières valeurs pour le texte personnalisé */
    const dt        = dtCheck;
    const q2Primary = q2Vals[0] ?? '';
    const q3Primary = q3Vals[0] ?? '';
    const qcPrimary = qcVals[0] ?? '';
    const q4Primary = q4Vals[0] ?? '';

    /* Libellés pour les tableaux récap (toutes valeurs jointes) */
    const q2Label    = getAnswerLabels(q2Vals, q2Other, Q2_LABELS[dt] ?? {});
    const q3Label    = getAnswerLabels(q3Vals, q3Other, Q3_LABELS[dt] ?? {});
    const qcLabel    = getAnswerLabels(qcVals, qcOther, QC_LABELS);
    const q4Label    = getAnswerLabels(q4Vals, q4Other, Q4_LABELS);
    const gbLabel    = dt === 'surMesure' ? GB_LABEL_INCLUS
                     : gbVals.length === 0 ? 'Non renseigné'
                     : (GB_LABELS[gbVals[0]] ?? gbVals[0]);
    const q2Question = Q2_QUESTION[dt] ?? 'Détail';
    const q3Question = Q3_QUESTION[dt] ?? 'Détail';
    const qcQuestion = QC_QUESTION[dt] ?? 'Volume de contenu';

    /* Calcul */
    const { low, high } = calculateEstimate(types, q2Vals, q3Vals, qcVals, q4Vals, gbVals);

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const baseParams     = { prenom, activity, company, email, types, q2Label, q3Label, qcLabel, q4Label, gbLabel, q2Question, q3Question, qcQuestion, low, high };
    const prospectParams = { ...baseParams, q2Primary, q2Other, q3Primary, q3Other, qcPrimary, qcOther, q4Primary, q4Other, gbVals };

    /* Envoi SMTP */
    const transporter = nodemailer.createTransport({
      host: 'pro2.mail.ovh.net', port: 465, secure: true,
      connectionTimeout: 10_000,
      greetingTimeout:   8_000,
      socketTimeout:     15_000,
      auth: { user: 'contact@caelestis.fr', pass: smtpPassword },
    });

    const [prospectResult, adminResult] = await Promise.allSettled([
      transporter.sendMail({
        from:    '"Célestin de Caelestis" <contact@caelestis.fr>',
        to:      email,
        replyTo: 'contact@caelestis.fr',
        subject: low === high ? `Votre estimation Caelestis : ${low.toLocaleString('fr-FR')} €` : `Votre estimation Caelestis : entre ${low.toLocaleString('fr-FR')} € et ${high.toLocaleString('fr-FR')} €`,
        html:    buildProspectEmail(prospectParams as Parameters<typeof buildProspectEmail>[0]),
      }),
      transporter.sendMail({
        from:    '"Simulateur Caelestis" <contact@caelestis.fr>',
        to:      'contact@caelestis.fr',
        replyTo: email,
        subject: `[Simulateur] ${prenom} · ${activity} · ${low === high ? `${low.toLocaleString('fr-FR')}€` : `${low.toLocaleString('fr-FR')}€ / ${high.toLocaleString('fr-FR')}€`}`,
        html:    buildAdminEmail({ ...baseParams, interest, date: dateStr } as Parameters<typeof buildAdminEmail>[0]),
      }),
    ]);

    if (adminResult.status === 'rejected') {
      console.error('[simulator] admin mail failed:', adminResult.reason?.message ?? adminResult.reason);
    }
    if (prospectResult.status === 'rejected') {
      throw prospectResult.reason;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[simulator API]', err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur. Réessayez ou écrivez à contact@caelestis.fr' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

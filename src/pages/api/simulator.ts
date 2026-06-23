import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

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
const VALID_TYPES = new Set(['vitrine', 'boutique', 'surMesure']);
const VALID_Q2    = new Set(['simple', 'standard', 'complet', 'small', 'medium', 'large', 'creation', 'refonte', 'ajout', 'autre']);
const VALID_Q3    = new Set(['ready', 'has_logo', 'nothing', 'starting', 'existing', 'collective', 'simple', 'medium', 'complex', 'autre']);
const VALID_QC    = new Set(['few', 'moderate', 'rich', 'brief', 'ideas', 'blank', 'autre']);
const VALID_Q4    = new Set(['slow', 'soon', 'urgent', 'autre']);
const VALID_GB    = new Set(['yes', 'no']);

function validateArray(arr: string[], valid: Set<string>): boolean {
  return arr.length > 0 && arr.every(v => valid.has(v));
}

/* ══════════════════════════════════════════════════════════
   TYPE DOMINANT (pour branchement et texte personnalisé)
══════════════════════════════════════════════════════════ */
function dominantType(types: string[]): string {
  if (types.includes('surMesure')) return 'surMesure';
  if (types.includes('boutique'))  return 'boutique';
  return 'vitrine';
}

/* ══════════════════════════════════════════════════════════
   LABELS LISIBLES
══════════════════════════════════════════════════════════ */
const TYPE_LABELS: Record<string, string> = {
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
const Q2_SCORES: Record<string, Record<string, number>> = {
  vitrine:   { simple: 0, standard: 150, complet:          250, autre: 150 },
  boutique:  { small:  0, medium:   175, large:            350, autre: 200 },
  surMesure: { creation: 0, refonte: 200, ajout: 400, autre: 200 },
};
const Q3_SCORES: Record<string, Record<string, number>> = {
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
   Le ratio score/scoreMax détermine la zone (quartile).
   Spreads : 200 € (vitrine/boutique) · 300 € (sur mesure)
   ─────────────────────────────────────────────────────────
   Vitrine    : 800–1000 / 1000–1200 / 1200–1400 / 1400–1600
   Boutique   : 1200–1400 / 1500–1700 / 1900–2100 / 2300–2500
   Sur mesure : 2500–2800 / 2900–3200 / 3300–3600 / 3700–4000
══════════════════════════════════════════════════════════ */

// Score maximum atteignable par type (somme des valeurs max de chaque question)
const MAX_SCORE: Record<string, number> = {
  vitrine:    550,   // 250 + 200 + 100
  boutique:  1100,   // 350 + 200 + 450 + 100
  surMesure: 1300,   // 400 + 350 + 450 + 100
};

type PriceZone = { low: number; high: number };
const PRICE_ZONES: Record<string, [PriceZone, PriceZone, PriceZone, PriceZone]> = {
  vitrine: [
    { low:  800, high: 1000 },
    { low: 1000, high: 1200 },
    { low: 1200, high: 1400 },
    { low: 1400, high: 1600 },
  ],
  boutique: [
    { low: 1200, high: 1400 },
    { low: 1500, high: 1700 },
    { low: 1900, high: 2100 },
    { low: 2300, high: 2500 },
  ],
  surMesure: [
    { low: 2500, high: 2800 },
    { low: 2900, high: 3200 },
    { low: 3300, high: 3600 },
    { low: 3700, high: 4000 },
  ],
};

const GB_ADDON = 150;
const GB_LABELS: Record<string, string> = {
  yes: 'Oui, optimisation incluse (+150 €)',
  no:  'Non, pas pour l\'instant',
};

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
  const zone    = PRICE_ZONES[dt]?.[zoneIdx] ?? { low: 800, high: 1000 };
  const gbBonus = gbVals.includes('yes') ? GB_ADDON : 0;

  return { low: zone.low + gbBonus, high: zone.high + gbBonus };
}

function getSummaryLine(type: string, q2: string, q3: string, qc: string, q2Other: string, q3Other: string, _qcOther: string): string {
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
    ...(dt !== 'surMesure' ? [[p.q2Question, esc(p.q2Label)]] : []),
    [p.q3Question,       esc(p.q3Label)],
    ...(dt !== 'vitrine' ? [[p.qcQuestion, esc(p.qcLabel)]] : []),
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
      <tr><td height="4" style="background:linear-gradient(90deg,#3d4f28 0%,#7a9140 55%,#c8b46a 100%);font-size:0;line-height:0;mso-line-height-rule:exactly;"> </td></tr>

      <!-- Header -->
      <tr><td class="em-pad" style="background-color:#3d4f28;padding:26px 36px 22px;">
        <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(237,227,212,0.45);font-weight:500;">Caelestis · Création de site web</p>
        <p style="margin:0;font-size:24px;color:#EDE3D0;letter-spacing:-0.02em;line-height:1.25;"><span style="font-weight:300;">Votre estimation </span><strong style="font-weight:700;">personnalisée</strong></p>
      </td></tr>

      <!-- Intro -->
      <tr><td class="em-pad" style="background-color:#FDFAF5;padding:26px 36px 12px;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#3d4f28;">Bonjour ${esc(p.prenom)},</p>
        <p style="margin:0;font-size:14px;color:#6B6040;line-height:1.75;">Voici votre estimation pour <strong style="color:#3d4f28;">${safeActivity}</strong>. ${summaryLine}</p>
      </td></tr>

      <!-- Bloc prix -->
      <tr><td class="em-pad" style="background-color:#FDFAF5;padding:14px 36px 28px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="background-color:#3d4f28;padding:22px 24px 20px;border-radius:10px;text-align:center;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(237,227,212,0.5);">${typeLabel}</p>
            <p class="em-price" style="margin:0;font-size:34px;font-weight:700;color:#EDE3D0;letter-spacing:-0.03em;line-height:1.1;">${p.low.toLocaleString('fr-FR')}&nbsp;€&ensp;<span style="font-weight:200;font-size:22px;color:rgba(237,227,212,0.35);">à</span>&ensp;${p.high.toLocaleString('fr-FR')}&nbsp;€</p>
            <p style="margin:10px 0 0;font-size:11px;color:rgba(237,227,212,0.32);letter-spacing:0.02em;">Estimation indicative · devis précis après échange</p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Résumé -->
      <tr><td class="em-pad" style="background-color:#F5EEE0;padding:20px 36px 22px;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#889063;font-weight:600;">Vos réponses</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${rows.map(([label, value]) => `
          <tr>
            <td class="rl" style="padding:9px 0;border-bottom:1px solid rgba(207,192,160,0.4);width:38%;vertical-align:middle;">
              <p style="margin:0;font-size:11px;color:#A08060;letter-spacing:0.06em;text-transform:uppercase;">${label}</p>
            </td>
            <td class="rv" style="padding:9px 0;border-bottom:1px solid rgba(207,192,160,0.4);vertical-align:middle;">
              <p style="margin:0;font-size:13px;color:#3d4f28;font-weight:500;line-height:1.4;">${value}</p>
            </td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td class="em-pad" style="background-color:#FDFAF5;padding:24px 36px 28px;">
        <p style="margin:0 0 20px;font-size:14px;color:#6B6040;line-height:1.7;">Cette fourchette est un premier repère. Pour un devis précis, je vous propose un <strong style="color:#3d4f28;">appel gratuit de 20 minutes</strong>, sans engagement.</p>
        <table class="em-btn" cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#3d4f28;padding:13px 30px;border-radius:8px;text-align:center;">
            <a href="https://caelestis.fr/contact" style="font-size:14px;font-weight:600;color:#EDE3D0;text-decoration:none;letter-spacing:0.03em;white-space:nowrap;">Discutons de votre projet →</a>
          </td></tr>
        </table>
      </td></tr>

      <!-- Signature -->
      <tr><td class="em-pad" style="background-color:#FDFAF5;padding:0 36px 28px;">
        <p style="margin:0 0 2px;font-size:14px;color:#6B6040;">À très bientôt,</p>
        <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#3d4f28;">Célestin</p>
        <p style="margin:0;font-size:12px;color:#A08060;">Fondateur de Caelestis · 07&nbsp;69&nbsp;36&nbsp;27&nbsp;27</p>
      </td></tr>

      <!-- Pied -->
      <tr><td class="em-pad" style="background-color:#2e3b1a;padding:16px 36px;">
        <p style="margin:0;font-size:11px;color:rgba(237,227,212,0.30);line-height:1.6;">Vous recevez cet email suite à votre simulation sur <a href="https://caelestis.fr" style="color:rgba(237,227,212,0.52);text-decoration:none;">caelestis.fr</a> · contact@caelestis.fr</p>
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
<body style="margin:0;padding:0;background-color:#EDE3D0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE3D0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <tr><td style="background-color:#3d4f28;padding:32px 40px;border-radius:4px 4px 0 0;">
        <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(237,227,212,0.45);">Caelestis · Simulateur</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#EDE3D0;">Nouveau prospect</h1>
        <p style="margin:6px 0 0;font-size:12px;color:rgba(237,227,212,0.38);">${esc(p.date)}</p>
      </td></tr>

      <!-- Badge estimation -->
      <tr><td style="background-color:#FDFAF5;padding:28px 40px 0;">
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#3d4f28;padding:10px 22px;border-radius:99px;">
            <p style="margin:0;font-size:14px;font-weight:500;color:#EDE3D0;">Entre ${p.low.toLocaleString('fr-FR')}&nbsp;€ et ${p.high.toLocaleString('fr-FR')}&nbsp;€ · ${typeLabel}</p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Coordonnées -->
      <tr><td style="background-color:#FDFAF5;padding:24px 40px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#889063;font-weight:600;border-bottom:1px solid #EDE3D0;padding-bottom:10px;">Coordonnées</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${[['Prénom', safePrenom], ['Entreprise', esc(p.company) || 'non précisé'], ['Activité', esc(p.activity)]].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #EDE3D0;width:120px;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#A08060;letter-spacing:0.08em;text-transform:uppercase;">${label}</p>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #EDE3D0;">
              <p style="margin:0;font-size:14px;color:#3d4f28;font-weight:500;">${value}</p>
            </td>
          </tr>`).join('')}
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#A08060;letter-spacing:0.08em;text-transform:uppercase;">Email</p>
            </td>
            <td style="padding:8px 0;">
              <a href="mailto:${safeEmail}" style="font-size:14px;color:#4C3D19;font-weight:500;text-decoration:none;">${safeEmail}</a>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Projet simulé -->
      <tr><td style="background-color:#FDFAF5;padding:24px 40px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#889063;font-weight:600;border-bottom:1px solid #EDE3D0;padding-bottom:10px;">Projet simulé</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${[
            ['Type de site',      typeLabel],
            ...(dt !== 'surMesure' ? [[p.q2Question, esc(p.q2Label)]] : []),
            [p.q3Question,        esc(p.q3Label)],
            ...(dt !== 'vitrine' ? [[p.qcQuestion, esc(p.qcLabel)]] : []),
            ['Délai souhaité',    esc(p.q4Label)],
            ['Google Business',   esc(p.gbLabel)],
            ["Niveau d'intérêt",  esc(INTEREST_LABELS[p.interest] ?? `${p.interest}/5`)],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #EDE3D0;width:140px;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#A08060;letter-spacing:0.08em;text-transform:uppercase;">${label}</p>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #EDE3D0;">
              <p style="margin:0;font-size:13px;color:#3d4f28;font-weight:500;line-height:1.5;">${value}</p>
            </td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- CTA répondre -->
      <tr><td style="background-color:#FDFAF5;padding:24px 40px 36px;">
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#4C3D19;padding:14px 28px;border-radius:99px;">
            <a href="mailto:${safeEmail}?subject=Suite%20%C3%A0%20votre%20simulation%20Caelestis&body=Bonjour%20${encodeURIComponent(p.prenom)}%2C%0A%0A" style="font-size:13px;font-weight:600;color:#EDE3D0;text-decoration:none;letter-spacing:0.04em;">Répondre à ${safePrenom} →</a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="background-color:#3d4f28;padding:20px 40px;border-radius:0 0 4px 4px;">
        <p style="margin:0;font-size:11px;color:rgba(237,227,212,0.32);">Envoyé via le simulateur de <strong style="color:rgba(237,227,212,0.55);">caelestis.fr</strong></p>
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
    if (dtCheck !== 'vitrine' && !validateArray(qcVals, VALID_QC)) {
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
    const gbLabel    = gbVals.length > 0 ? (GB_LABELS[gbVals[0]] ?? gbVals[0]) : 'Non renseigné';
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
      host: 'ssl0.ovh.net', port: 465, secure: true,
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
        subject: `Votre estimation Caelestis : entre ${low.toLocaleString('fr-FR')} € et ${high.toLocaleString('fr-FR')} €`,
        html:    buildProspectEmail(prospectParams as Parameters<typeof buildProspectEmail>[0]),
      }),
      transporter.sendMail({
        from:    '"Simulateur Caelestis" <contact@caelestis.fr>',
        to:      'contact@caelestis.fr',
        replyTo: email,
        subject: `[Simulateur] ${prenom} · ${activity} · ${low.toLocaleString('fr-FR')}€ / ${high.toLocaleString('fr-FR')}€`,
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

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, AlignmentType,
} from 'docx';

export const prerender = false;

/* ══════════════════════════════════════════════════════════
   RATE LIMITING — 15 min / 3 envois / IP
══════════════════════════════════════════════════════════ */
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX       = 3;
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
function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function str(v: unknown, maxLen = 500): string {
  return String(v ?? '').trim().slice(0, maxLen);
}

function toArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  if (typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}

function multiline(s: string): string {
  return esc(s).replace(/\n/g, '<br>');
}

/* ══════════════════════════════════════════════════════════
   MAPS DE LABELS LISIBLES
══════════════════════════════════════════════════════════ */
const RADIO_LABELS: Record<string, Record<string, string>> = {
  affichage_tarifs: { oui: 'Oui', non: 'Non', sur_demande: 'Sur demande uniquement' },
  boutique_actif:   { oui: 'Oui', non: 'Non' },
  textes: {
    je_fournis:   'Je fournis les textes moi-même',
    aide:         "Vous m'aidez à les améliorer",
    vous_redigez: 'Vous rédigez entièrement pour moi',
  },
  type_site: {
    vitrine:          'Site vitrine',
    boutique_en_ligne:'Boutique en ligne',
    sur_mesure:       'Site sur mesure',
  },
  delai: {
    asap:       'Dès que possible',
    un_mois:    'Dans 1 mois environ',
    trois_mois: 'Dans 3 mois environ',
    six_mois:   'Dans 6 mois ou plus',
    pas_urgent: 'Pas de délai particulier',
  },
  statut_juridique: {
    ei:          'Auto-entrepreneur / EI',
    eurl:        'EURL',
    sarl:        'SARL',
    sas:         'SAS / SASU',
    association: 'Association',
    autre:       'Autre',
  },
};

const CHECKBOX_LABELS: Record<string, Record<string, string>> = {
  type_client: {
    particuliers:'Particuliers', professionnels:'Professionnels (B2B)',
    collectivites:'Collectivités', associations:'Associations',
  },
  objectifs: {
    visibilite:'Gagner en visibilité', prospects:'Attirer des prospects',
    vente_ligne:'Vendre en ligne', notoriete:'Renforcer la notoriété',
    credibilite:"Crédibiliser l'activité", recrutement:'Faciliter le recrutement',
  },
  fonctionnalites: {
    formulaire_contact:'Formulaire de contact', galerie:'Galerie photos',
    blog:'Blog / Actualités', reservation:'Réservation en ligne',
    espace_client:'Espace client / connexion', carte:'Carte interactive',
    chat:'Chat / Messagerie', newsletter:'Newsletter', multilingue:'Multi-langue',
  },
  boutique_paiement: {
    cb:'Carte bancaire', virement:'Virement bancaire', cheque:'Chèque', paypal:'PayPal',
  },
  contenu_dispo: {
    logo:'Logo / charte graphique', photos:'Photos professionnelles',
    textes_rediges:'Textes rédigés', videos:'Vidéos',
    temoignages:'Témoignages clients', rien:"Rien pour l'instant",
  },
  reseaux: {
    facebook:'Facebook', instagram:'Instagram', linkedin:'LinkedIn',
    youtube:'YouTube', tiktok:'TikTok', pinterest:'Pinterest',
  },
  style_adjectifs: {
    moderne:'Moderne', epure:'Épuré / minimaliste', chaleureux:'Chaleureux',
    nature:'Nature / organique', professionnel:'Professionnel', dynamique:'Dynamique',
    luxe:'Luxe / premium', artisanal:'Artisanal', colore:'Coloré',
  },
  valeurs: {
    proximite:'Proximité', qualite:'Qualité', confiance:'Confiance',
    innovation:'Innovation', transparence:'Transparence', engagement:'Engagement',
    passion:'Passion', expertise:'Expertise',
  },
};

function radioLabel(category: string, value: string, otherVal = ''): string {
  if (!value) return '—';
  if (value === 'autre') return otherVal ? `Autre : ${esc(otherVal)}` : 'Autre';
  return esc(RADIO_LABELS[category]?.[value] ?? value);
}

function arrLabel(vals: string[], category: string, otherVal = ''): string {
  if (vals.length === 0) return '—';
  const map = CHECKBOX_LABELS[category] ?? {};
  return vals.map(v => {
    if (v === 'autre') return otherVal ? `Autre : ${esc(otherVal)}` : 'Autre';
    return esc(map[v] ?? v);
  }).join(' &nbsp;·&nbsp; ');
}

/* ══════════════════════════════════════════════════════════
   EMAIL ADMIN — CONSTRUCTEURS
══════════════════════════════════════════════════════════ */
function eRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 16px 8px 0;border-bottom:1px solid #eef2f7;width:170px;min-width:130px;vertical-align:top;font-size:11px;color:#8fa3b8;letter-spacing:.05em;text-transform:uppercase;line-height:1.4;">${esc(label)}</td>
    <td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;color:#2d3f54;line-height:1.65;">${value || '<span style="color:#ccc;">—</span>'}</td>
  </tr>`;
}

function eBlock(num: number | string, title: string, rows: string): string {
  return `<tr><td style="background:#fff;padding:20px 36px 12px;">
    <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#1dbd8e;padding-bottom:8px;border-bottom:2px solid #eef2f7;">${esc(String(num))}. ${esc(title)}</p>
    <table cellpadding="0" cellspacing="0" width="100%">${rows}</table>
  </td></tr>
  <tr><td style="height:2px;background:#f5f8fb;"></td></tr>`;
}

/* ══════════════════════════════════════════════════════════
   BUILD EMAIL ADMIN (9 sections + pièces jointes)
══════════════════════════════════════════════════════════ */
function buildAdminEmail(
  d: Record<string, unknown>,
  dateStr: string,
  attachedFilenames: string[],
): string {
  const g  = (k: string, mx = 2000) => multiline(str(d[k], mx)) || '<span style="color:#ccc;">—</span>';
  const rl = (cat: string, k: string, otherK = '') => radioLabel(cat, str(d[k]), str(d[otherK]));
  const al = (k: string, cat: string, otherK = '') => arrLabel(toArr(d[k]), cat, str(d[otherK]));

  const nominant    = str(d['nom_dirigeant']) || str(d['nom_entreprise']) || 'Client';
  const emailClient = str(d['email_contact']);

  const boutiqueActif = str(d['boutique_actif']);
  const boutiqueRows  = boutiqueActif === 'oui'
    ? eRow('Nb de produits', g('boutique_nb_produits'))
      + eRow('Livraison',     g('boutique_livraison'))
      + eRow('Modes de paiement', al('boutique_paiement', 'boutique_paiement', 'boutique_paiement_autre'))
    : '';

  const statutVal   = str(d['statut_juridique']);
  const statutLabel = statutVal === 'autre'
    ? `Autre : ${esc(str(d['statut_autre']))}`
    : radioLabel('statut_juridique', statutVal);

  const filesHtml = attachedFilenames.length > 0
    ? attachedFilenames.map(n => `📄 ${esc(n)}`).join('<br>')
    : '<span style="color:#ccc;">Aucun fichier joint</span>';

  const sections = [
    eBlock(1, 'Identification', [
      eRow('Entreprise',  g('nom_entreprise')),
      eRow('Nom',         g('nom_dirigeant')),
      eRow('Email', `<a href="mailto:${esc(emailClient)}" style="color:#1dbd8e;">${esc(emailClient)}</a>`),
      eRow('Téléphone',   g('telephone')),
    ].join('')),

    eBlock(2, 'Contenu disponible', [
      eRow('Éléments fournis',  al('contenu_dispo', 'contenu_dispo', 'contenu_dispo_autre')),
      eRow('Rédaction textes',  rl('textes', 'textes')),
    ].join('')),

    eBlock(3, 'Présence en ligne', [
      eRow('Réseaux sociaux',   al('reseaux', 'reseaux', 'reseaux_autre')),
      eRow('Comptes / pseudos', g('comptes_reseaux', 2000)),
    ].join('')),

    eBlock(4, 'Boutique en ligne', [
      eRow('Boutique', rl('boutique_actif', 'boutique_actif')),
      boutiqueRows,
    ].join('')),

    eBlock(5, 'Informations légales', [
      eRow('Statut juridique', statutLabel),
      eRow('SIRET',            g('siret')),
      eRow('N° TVA',           g('numero_tva')),
    ].join('')),

    eBlock(6, 'Valeurs et message', [
      eRow('Valeurs',           al('valeurs', 'valeurs', 'valeurs_autre')),
      eRow('Message important', g('message_important', 3000)),
    ].join('')),

    eBlock('📎', 'Pièces jointes', [
      eRow(`Fichiers (${attachedFilenames.length})`, filesHtml),
      str(d['wetransfer_link'])
        ? eRow('WeTransfer', `<a href="${esc(str(d['wetransfer_link']))}" style="color:#1dbd8e;">${esc(str(d['wetransfer_link']))}</a>`)
        : '',
    ].join('')),
  ].join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f8fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8fb;padding:32px 16px;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

  <!-- En-tête -->
  <tr><td style="background:linear-gradient(135deg,#028183 0%,#1dbd8e 100%);padding:32px 36px;border-radius:8px 8px 0 0;">
    <p style="margin:0;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.5);font-weight:500;">Caelestis · Questionnaire création</p>
    <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#fff;letter-spacing:-.02em;">Nouveau questionnaire de création — ${esc(nominant)}</h1>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.4);">${esc(dateStr)}</p>
  </td></tr>

  <!-- CTA rapide -->
  <tr><td style="background:#fff;padding:20px 36px 8px;">
    <table cellpadding="0" cellspacing="0">
      <tr><td style="background:#2d3f54;padding:12px 24px;border-radius:99px;">
        <a href="mailto:${esc(emailClient)}?subject=Suite%20%C3%A0%20votre%20questionnaire%20Caelestis&body=Bonjour%20${encodeURIComponent(nominant)}%2C%0A%0A" style="font-size:13px;font-weight:600;color:#fff;text-decoration:none;letter-spacing:.04em;">Répondre à ${esc(nominant)} →</a>
      </td></tr>
    </table>
  </td></tr>

  ${sections}

  <!-- Pied -->
  <tr><td style="background:#2d3f54;padding:20px 36px;border-radius:0 0 8px 8px;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,.3);line-height:1.65;">Reçu via le questionnaire de création de <strong style="color:rgba(255,255,255,.6);">caelestis.fr</strong></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   BUILD EMAIL CLIENT (confirmation + récapitulatif)
══════════════════════════════════════════════════════════ */
function buildClientEmail(d: Record<string, unknown>, dateStr: string, filenames: string[]): string {
  const prenom    = str(d['nom_dirigeant']) || str(d['nom_entreprise']) || 'Bonjour';
  const prenomEsc = esc(prenom);

  const g  = (k: string, mx = 2000) => multiline(str(d[k], mx)) || '<span style="color:#bbb;">—</span>';
  const rl = (cat: string, k: string, otherK = '') => radioLabel(cat, str(d[k]), str(d[otherK]));
  const al = (k: string, cat: string, otherK = '') => arrLabel(toArr(d[k]), cat, str(d[otherK]));

  const boutique     = str(d['boutique_actif']);
  const boutiqueRows = boutique === 'oui'
    ? eRow('Nb de produits', g('boutique_nb_produits'))
      + eRow('Livraison',    g('boutique_livraison'))
      + eRow('Paiement',     al('boutique_paiement', 'boutique_paiement', 'boutique_paiement_autre'))
    : '';
  const statutVal   = str(d['statut_juridique']);
  const statutLabel = statutVal === 'autre'
    ? `Autre : ${esc(str(d['statut_autre']))}`
    : radioLabel('statut_juridique', statutVal);
  const filesHtml = filenames.length > 0
    ? filenames.map(n => `📄 ${esc(n)}`).join('<br>')
    : '<span style="color:#bbb;">Aucun fichier joint</span>';

  const recap = [
    eBlock('01', 'Vos coordonnées', [
      eRow('Entreprise', g('nom_entreprise')),
      eRow('Nom',        g('nom_dirigeant')),
      eRow('Email',      g('email_contact')),
      eRow('Téléphone',  g('telephone')),
    ].join('')),
    eBlock('02', 'Contenu disponible', [
      eRow('Éléments fournis',  al('contenu_dispo', 'contenu_dispo', 'contenu_dispo_autre')),
      eRow('Rédaction textes',  rl('textes', 'textes')),
    ].join('')),
    eBlock('03', 'Présence en ligne', [
      eRow('Réseaux sociaux',   al('reseaux', 'reseaux', 'reseaux_autre')),
      eRow('Comptes / pseudos', g('comptes_reseaux', 2000)),
    ].join('')),
    eBlock('04', 'Boutique en ligne', [
      eRow('Boutique', rl('boutique_actif', 'boutique_actif')),
      boutiqueRows,
    ].join('')),
    eBlock('05', 'Informations légales', [
      eRow('Statut juridique', statutLabel),
      eRow('SIRET',            g('siret')),
      eRow('N° TVA',           g('numero_tva')),
    ].join('')),
    eBlock('06', 'Valeurs et message', [
      eRow('Valeurs',           al('valeurs', 'valeurs', 'valeurs_autre')),
      eRow('Message important', g('message_important', 3000)),
    ].join('')),
    eBlock('📎', 'Pièces jointes', [
      eRow(`Fichiers (${filenames.length})`, filesHtml),
      str(d['wetransfer_link'])
        ? eRow('WeTransfer', `<a href="${esc(str(d['wetransfer_link']))}" style="color:#1dbd8e;">${esc(str(d['wetransfer_link']))}</a>`)
        : '',
    ].join('')),
  ].join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f8fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8fb;padding:32px 16px;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

  <tr><td style="background:linear-gradient(135deg,#028183 0%,#1dbd8e 100%);padding:32px 36px;border-radius:8px 8px 0 0;">
    <p style="margin:0;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.55);font-weight:500;">Caelestis · Questionnaire de création</p>
    <h1 style="margin:10px 0 0;font-size:24px;font-weight:300;color:#fff;letter-spacing:-.02em;">Questionnaire bien reçu ✓</h1>
    <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,.45);">${esc(dateStr)}</p>
  </td></tr>

  <tr><td style="background:#fff;padding:28px 36px 20px;">
    <p style="margin:0 0 12px;font-size:15px;color:#2d3f54;">Bonjour <strong>${prenomEsc}</strong>,</p>
    <p style="margin:0 0 12px;font-size:14px;color:#52647a;line-height:1.8;">Votre questionnaire de création a bien été reçu. Je vais le lire attentivement et vous recontacterai <strong style="color:#2d3f54;">sous 48h maximum</strong>.</p>
    <p style="margin:0 0 4px;font-size:14px;color:#52647a;line-height:1.8;">Ci-dessous le récapitulatif de vos réponses. Si quelque chose est inexact ou si vous souhaitez ajouter une précision, répondez simplement à cet email.</p>
  </td></tr>

  <tr><td style="height:2px;background:#f5f8fb;"></td></tr>

  ${recap}

  <tr><td style="background:#fff;padding:20px 36px 28px;">
    <table cellpadding="0" cellspacing="0" style="border-top:1px solid #eef2f7;padding-top:18px;width:100%;">
      <tr>
        <td>
          <p style="margin:0;font-size:14px;color:#2d3f54;font-weight:600;">Célestin</p>
          <p style="margin:2px 0 0;font-size:12px;color:#8fa3b8;">Fondateur de Caelestis</p>
        </td>
        <td style="text-align:right;">
          <p style="margin:0;font-size:13px;color:#52647a;">07 69 36 27 27</p>
          <p style="margin:2px 0 0;font-size:12px;color:#1dbd8e;">caelestis.fr</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#2d3f54;padding:18px 36px;border-radius:0 0 8px 8px;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,.3);line-height:1.65;">Vous recevez cet email car vous avez complété le questionnaire de création sur <strong style="color:rgba(255,255,255,.55);">caelestis.fr</strong>.<br>Caelestis · Drôme, France · contact@caelestis.fr</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   GÉNÉRATION PDF — pièce jointe pour l'email admin
══════════════════════════════════════════════════════════ */
function generateQuestionnairePDF(
  d: Record<string, unknown>,
  dateStr: string,
  filenames: string[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end',  ()         => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const TEAL  = '#028183';
    const DARK  = '#2D3F54';
    const MUTED = '#52647A';
    const LIGHT = '#F5F8FB';
    const W     = doc.page.width - 100; // largeur utile (marges 50 de chaque côté)

    /* ── helpers ── */
    const clean = (k: string, mx = 1000) => str(d[k], mx) || '—';
    const chips = (k: string, cat: string, otherK = '') => {
      const vals = toArr(d[k]);
      if (!vals.length) return '—';
      const map = CHECKBOX_LABELS[cat] ?? {};
      return vals.map(v => {
        if (v === 'autre') return str(d[otherK]) ? `Autre : ${str(d[otherK])}` : 'Autre';
        return map[v] ?? v;
      }).join('  ·  ');
    };
    const radio = (cat: string, k: string, otherK = '') => radioLabel(cat, str(d[k]), str(d[otherK])).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");

    /* ── En-tête ── */
    doc.rect(0, 0, doc.page.width, 90).fill(TEAL);
    doc.fillColor('#FFFFFF')
       .fontSize(9).font('Helvetica')
       .text('CAELESTIS · QUESTIONNAIRE CLIENT', 50, 22, { characterSpacing: 1.5 });
    const nom = str(d['nom_dirigeant']) || str(d['nom_entreprise']) || 'Client';
    doc.fontSize(20).font('Helvetica-Bold')
       .text(nom, 50, 36);
    doc.fontSize(8).font('Helvetica')
       .text(dateStr, 50, 62, { characterSpacing: 0.5 });
    doc.fillColor(DARK);

    let y = 110;

    /* ── Fonction section ── */
    function section(num: string, title: string, rows: [string, string][]) {
      /* Vérifier espace restant — saut de page si besoin */
      if (y + 30 + rows.length * 22 > doc.page.height - 60) {
        doc.addPage();
        y = 50;
      }

      /* Bandeau section */
      doc.rect(50, y, W, 22).fill(LIGHT);
      doc.fillColor(TEAL).fontSize(7).font('Helvetica-Bold')
         .text(`${num}.`, 56, y + 7, { characterSpacing: 0.5 });
      doc.fillColor(DARK).fontSize(8).font('Helvetica-Bold')
         .text(title.toUpperCase(), 72, y + 7, { characterSpacing: 0.8 });
      y += 26;

      /* Lignes */
      rows.forEach(([label, value], i) => {
        if (y + 22 > doc.page.height - 60) { doc.addPage(); y = 50; }
        if (i % 2 === 0) doc.rect(50, y, W, 20).fill('#FAFBFC');
        doc.fillColor(MUTED).fontSize(7.5).font('Helvetica')
           .text(label, 58, y + 6, { width: 130 });
        doc.fillColor(DARK).fontSize(8).font('Helvetica')
           .text(value, 195, y + 6, { width: W - 145 });
        y += 20;
      });
      y += 10;
    }

    /* ── 01. Identification ── */
    section('01', 'Identification', [
      ['Entreprise',  clean('nom_entreprise')],
      ['Nom',         clean('nom_dirigeant')],
      ['Email',       clean('email_contact')],
      ['Téléphone',   clean('telephone')],
    ]);

    /* ── 02. Contenu disponible ── */
    section('02', 'Contenu disponible', [
      ['Éléments fournis',  chips('contenu_dispo', 'contenu_dispo', 'contenu_dispo_autre')],
      ['Rédaction textes',  radio('textes', 'textes')],
    ]);

    /* ── 03. Présence en ligne ── */
    section('03', 'Présence en ligne', [
      ['Réseaux sociaux',  chips('reseaux', 'reseaux', 'reseaux_autre')],
      ['Comptes / liens',  clean('comptes_reseaux', 300)],
    ]);

    /* ── 04. Boutique en ligne ── */
    const boutique = str(d['boutique_actif']);
    const boutiqueRows: [string, string][] = boutique === 'oui' ? [
      ['Nb produits', clean('boutique_nb_produits')],
      ['Livraison',   clean('boutique_livraison')],
      ['Paiement',    chips('boutique_paiement', 'boutique_paiement', 'boutique_paiement_autre')],
    ] : [];
    section('04', 'Boutique en ligne', [
      ['Boutique', radio('boutique_actif', 'boutique_actif')],
      ...boutiqueRows,
    ]);

    /* ── 05. Informations légales ── */
    const statutVal   = str(d['statut_juridique']);
    const statutLabel = statutVal === 'autre'
      ? `Autre : ${clean('statut_autre')}`
      : (RADIO_LABELS['statut_juridique']?.[statutVal] ?? (statutVal || '—'));
    section('05', 'Informations légales', [
      ['Statut', statutLabel],
      ['SIRET',  clean('siret')],
      ['N° TVA', clean('numero_tva')],
    ]);

    /* ── 06. Valeurs et message ── */
    section('06', 'Valeurs et message', [
      ['Valeurs',           chips('valeurs', 'valeurs', 'valeurs_autre')],
      ['Message important', clean('message_important', 500)],
    ]);

    /* ── Pièces jointes ── */
    const wtLink = str(d['wetransfer_link']);
    const pjRows: [string, string][] = [
      [`Fichiers (${filenames.length})`, filenames.length ? filenames.join(', ') : 'Aucun'],
      ...(wtLink ? [['WeTransfer', wtLink] as [string, string]] : []),
    ];
    section('PJ', 'Pièces jointes', pjRows);

    /* ── Pied de page sur toutes les pages ── */
    const totalPages = (doc.bufferedPageRange().count);
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.rect(0, doc.page.height - 30, doc.page.width, 30).fill(DARK);
      doc.fillColor('white').fontSize(7).font('Helvetica')
         .text(
           `Caelestis · questionnaire création · caelestis.fr · contact@caelestis.fr   |   Page ${i + 1} / ${totalPages}`,
           50, doc.page.height - 19,
           { align: 'center', width: W },
         );
    }

    doc.end();
  });
}

/* ══════════════════════════════════════════════════════════
   GÉNÉRATION DOCX — document modifiable (Google Docs)
══════════════════════════════════════════════════════════ */
function generateQuestionnaireDocx(
  d: Record<string, unknown>,
  dateStr: string,
  filenames: string[],
): Promise<Buffer> {
  const TEAL  = '028183';
  const DARK  = '2D3F54';
  const LIGHT = 'F5F8FB';
  const MUTED = '52647A';

  const clean = (k: string, mx = 1000) => str(d[k], mx) || '—';
  const chips = (k: string, cat: string, otherK = '') => {
    const vals = toArr(d[k]);
    if (!vals.length) return '—';
    const map = CHECKBOX_LABELS[cat] ?? {};
    return vals.map(v => {
      if (v === 'autre') return str(d[otherK]) ? `Autre : ${str(d[otherK])}` : 'Autre';
      return map[v] ?? v;
    }).join('  ·  ');
  };
  const radio = (cat: string, k: string, otherK = '') =>
    radioLabel(cat, str(d[k]), str(d[otherK]))
      .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");

  /* ── helpers DOM ── */
  const heading = (text: string, num: string) => new Paragraph({
    children: [
      new TextRun({ text: `${num}. ${text}`, bold: true, color: TEAL, size: 24, font: 'Calibri' }),
    ],
    spacing: { before: 280, after: 80 },
    shading: { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT },
  });

  const dataRow = (label: string, value: string) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E8EDF2' },
      left:   { style: BorderStyle.NONE },
      right:  { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: 28, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: label, color: MUTED, size: 18, font: 'Calibri' })], spacing: { before: 60, after: 60 } })],
        shading: { type: ShadingType.SOLID, color: 'FAFBFC', fill: 'FAFBFC' },
      }),
      new TableCell({
        width: { size: 72, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: value, color: DARK, size: 19, font: 'Calibri' })], spacing: { before: 60, after: 60 } })],
      }),
    ]})],
  });

  const spacer = () => new Paragraph({ text: '', spacing: { before: 60, after: 60 } });

  /* ── Sections ── */
  const nom = str(d['nom_dirigeant']) || str(d['nom_entreprise']) || 'Client';

  const children = [
    /* Titre principal */
    new Paragraph({
      children: [new TextRun({ text: 'QUESTIONNAIRE DE CRÉATION', bold: true, color: TEAL, size: 32, font: 'Calibri', characterSpacing: 80 })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: nom, bold: true, color: DARK, size: 44, font: 'Calibri' })],
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: dateStr, color: MUTED, size: 18, font: 'Calibri' })],
      spacing: { before: 0, after: 400 },
    }),

    /* 01. Identification */
    heading('Identification', '01'),
    dataRow('Entreprise', clean('nom_entreprise')),
    dataRow('Nom',        clean('nom_dirigeant')),
    dataRow('Email',      clean('email_contact')),
    dataRow('Téléphone',  clean('telephone')),
    spacer(),

    /* 02. Contenu disponible */
    heading('Contenu disponible', '02'),
    dataRow('Éléments fournis',  chips('contenu_dispo', 'contenu_dispo', 'contenu_dispo_autre')),
    dataRow('Rédaction textes',  radio('textes', 'textes')),
    spacer(),

    /* 03. Présence en ligne */
    heading('Présence en ligne', '03'),
    dataRow('Réseaux sociaux',  chips('reseaux', 'reseaux', 'reseaux_autre')),
    dataRow('Comptes / liens',  clean('comptes_reseaux', 300)),
    spacer(),

    /* 04. Boutique en ligne */
    heading('Boutique en ligne', '04'),
    dataRow('Boutique', radio('boutique_actif', 'boutique_actif')),
    ...(str(d['boutique_actif']) === 'oui' ? [
      dataRow('Nb produits', clean('boutique_nb_produits')),
      dataRow('Livraison',   clean('boutique_livraison')),
      dataRow('Paiement',    chips('boutique_paiement', 'boutique_paiement', 'boutique_paiement_autre')),
    ] : []),
    spacer(),

    /* 05. Informations légales */
    heading('Informations légales', '05'),
    dataRow('Statut', (() => {
      const v = str(d['statut_juridique']);
      return v === 'autre' ? `Autre : ${clean('statut_autre')}` : (RADIO_LABELS['statut_juridique']?.[v] ?? (v || '—'));
    })()),
    dataRow('SIRET',  clean('siret')),
    dataRow('N° TVA', clean('numero_tva')),
    spacer(),

    /* 06. Valeurs et message */
    heading('Valeurs et message', '06'),
    dataRow('Valeurs',           chips('valeurs', 'valeurs', 'valeurs_autre')),
    dataRow('Message important', clean('message_important', 600)),
    spacer(),

    /* Pièces jointes */
    heading('Pièces jointes', 'PJ'),
    dataRow(`Fichiers (${filenames.length})`, filenames.length ? filenames.join(', ') : 'Aucun'),
    ...(str(d['wetransfer_link']) ? [dataRow('WeTransfer', str(d['wetransfer_link']))] : []),
    spacer(),

    /* Pied de page */
    new Paragraph({
      children: [new TextRun({ text: 'Caelestis · caelestis.fr · contact@caelestis.fr · 07 69 36 27 27', color: MUTED, size: 16, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'E8EDF2' } },
    }),
  ];

  const doc = new Document({
    sections: [{ children }],
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 20, color: DARK } },
      },
    },
  });

  return Packer.toBuffer(doc) as Promise<Buffer>;
}

/* ══════════════════════════════════════════════════════════
   ENDPOINT POST /api/brief
══════════════════════════════════════════════════════════ */
export const POST: APIRoute = async ({ request }) => {

  /* CORS */
  const origin = request.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ error: 'Accès non autorisé.' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  /* Rate limiting */
  const ip = request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',').at(0)?.trim()
    ?? 'unknown';
  const { allowed, retryAfterSecs } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Trop de demandes. Réessayez dans ${Math.ceil(retryAfterSecs / 60)} minute(s).` }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfterSecs) } },
    );
  }

  const smtpPassword = import.meta.env.OVH_SMTP_PASSWORD;
  if (!smtpPassword) {
    return new Response(JSON.stringify({ error: 'Configuration serveur incomplète.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    /* ── Parsing FormData (multipart) ── */
    const fd = await request.formData();
    const body: Record<string, unknown> = {};
    const fileAttachments: { filename: string; content: Buffer; contentType: string }[] = [];

    for (const [key, value] of fd.entries()) {
      if (key === 'files' && value instanceof File && value.size > 0) {
        const buffer = Buffer.from(await value.arrayBuffer());
        fileAttachments.push({
          filename:    value.name,
          content:     buffer,
          contentType: value.type || 'application/octet-stream',
        });
      } else if (typeof value === 'string') {
        if (key in body) {
          const existing = body[key];
          if (Array.isArray(existing)) {
            (existing as string[]).push(value);
          } else {
            body[key] = [existing as string, value];
          }
        } else {
          body[key] = value;
        }
      }
    }

    /* Honeypot */
    if (body.website && String(body.website).length > 0) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }

    /* Sanitize WeTransfer link — n'autoriser que les URLs https:// */
    const rawWt = str(body['wetransfer_link'], 500);
    if (rawWt && !/^https:\/\//i.test(rawWt)) {
      body['wetransfer_link'] = '';
    }

    /* Champ requis : email */
    const emailContact = str(body['email_contact']).slice(0, 254);
    if (!emailContact) {
      return new Response(JSON.stringify({ error: 'Votre adresse email est requise.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!EMAIL_REGEX.test(emailContact) || /[,;\r\n]/.test(emailContact)) {
      return new Response(JSON.stringify({ error: 'Adresse email invalide.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net', port: 465, secure: true,
      auth: { user: 'contact@caelestis.fr', pass: smtpPassword },
    });

    const nominant = str(body['nom_dirigeant']) || str(body['nom_entreprise']) || 'Client';

    /* Génération du PDF et du DOCX récapitulatifs */
    const slug = nominant.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const dateSlug = new Date().toISOString().slice(0, 10);
    const filenames = fileAttachments.map(f => f.filename);

    const [pdfBuffer, docxBuffer] = await Promise.all([
      generateQuestionnairePDF(body, dateStr, filenames),
      generateQuestionnaireDocx(body, dateStr, filenames),
    ]);

    await Promise.all([
      /* Email admin — questionnaire complet avec PDF + DOCX + pièces jointes */
      transporter.sendMail({
        from:        '"Questionnaire Caelestis" <contact@caelestis.fr>',
        to:          'contact@caelestis.fr',
        replyTo:     emailContact,
        subject:     `[Création] ${nominant} — questionnaire de création`,
        html:        buildAdminEmail(body, dateStr, filenames),
        attachments: [
          { filename: `questionnaire-${slug}-${dateSlug}.pdf`,  content: pdfBuffer,  contentType: 'application/pdf' },
          { filename: `questionnaire-${slug}-${dateSlug}.docx`, content: docxBuffer, contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
          ...fileAttachments,
        ],
      }),
      /* Email client — confirmation */
      transporter.sendMail({
        from:    '"Célestin — Caelestis" <contact@caelestis.fr>',
        to:      emailContact,
        replyTo: 'contact@caelestis.fr',
        subject: 'Votre questionnaire Caelestis a bien été reçu',
        html:    buildClientEmail(body, dateStr, filenames),
      }),
    ]);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    console.error('[brief API]', err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur. Réessayez ou écrivez à contact@caelestis.fr' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

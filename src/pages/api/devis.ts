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
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap.entries()) if (now > v.resetAt) rateLimitMap.delete(k);
}, RATE_WINDOW_MS);

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
   MAPS DE LABELS
══════════════════════════════════════════════════════════ */
const RADIO_LABELS: Record<string, Record<string, string>> = {
  affichage_tarifs: { oui: 'Oui', non: 'Non', sur_demande: 'Sur demande uniquement' },
  boutique_actif:   { oui: 'Oui', non: 'Non' },
  type_site: {
    vitrine:           'Site vitrine',
    boutique_en_ligne: 'Boutique en ligne',
    sur_mesure:        'Site sur mesure',
  },
  delai: {
    asap:       'Dès que possible',
    un_mois:    'Dans 1 mois environ',
    trois_mois: 'Dans 3 mois environ',
    six_mois:   'Dans 6 mois ou plus',
    pas_urgent: 'Pas de délai particulier',
  },
  budget: {
    moins_800:  'Moins de 800 €',
    '800_1500': 'Entre 800 et 1 500 €',
    '1500_3000':'Entre 1 500 et 3 000 €',
    plus_3000:  'Plus de 3 000 €',
    ne_sais_pas:'Je ne sais pas encore',
  },
};

const CHECKBOX_LABELS: Record<string, Record<string, string>> = {
  type_client: {
    particuliers: 'Particuliers', professionnels: 'Professionnels (B2B)',
    collectivites: 'Collectivités', associations: 'Associations',
  },
  objectifs: {
    visibilite: 'Gagner en visibilité', prospects: 'Attirer des prospects',
    vente_ligne: 'Vendre en ligne', notoriete: 'Renforcer la notoriété',
    credibilite: "Crédibiliser l'activité", recrutement: 'Faciliter le recrutement',
  },
  fonctionnalites: {
    formulaire_contact: 'Formulaire de contact', galerie: 'Galerie de photos',
    blog: 'Blog et actualités', reservation: 'Réservation en ligne',
    espace_client: 'Espace client', carte: 'Carte interactive',
    newsletter: 'Newsletter', multilingue: 'Site multilingue',
  },
  style_adjectifs: {
    moderne: 'Moderne', epure: 'Épuré et minimaliste', chaleureux: 'Chaleureux',
    nature: 'Nature et organique', professionnel: 'Professionnel', dynamique: 'Dynamique',
    luxe: 'Luxe et premium', artisanal: 'Artisanal', colore: 'Coloré et vivant',
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
   EMAIL ADMIN
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

function buildAdminEmail(d: Record<string, unknown>, dateStr: string): string {
  const g  = (k: string, mx = 2000) => multiline(str(d[k], mx)) || '<span style="color:#ccc;">—</span>';
  const rl = (cat: string, k: string, otherK = '') => radioLabel(cat, str(d[k]), str(d[otherK]));
  const al = (k: string, cat: string, otherK = '') => arrLabel(toArr(d[k]), cat, str(d[otherK]));

  const nominant    = str(d['nom_dirigeant']) || str(d['nom_entreprise']) || 'Client';
  const emailClient = str(d['email_contact']);

  const services = [1,2,3,4,5]
    .map(n => str(d[`service_${n}`]))
    .filter(Boolean)
    .map((sv, i) => `${i+1}. ${esc(sv)}`)
    .join('<br>');

  const boutiqueActif = str(d['boutique_actif']);
  const boutiqueRows  = boutiqueActif === 'oui'
    ? eRow('Nb de produits', g('boutique_nb_produits'))
    : '';

  const pagesList = [1,2,3,4,5,6,7,8]
    .map(n => str(d[`page_${n}`]))
    .filter(Boolean);
  const pagesHtml = pagesList.length
    ? pagesList.map((p, i) => `${i+1}. ${esc(p)}`).join('<br>')
    : '<span style="color:#ccc;">—</span>';

  const sections = [
    eBlock(1, 'À propos du porteur', [
      eRow('Entreprise',       g('nom_entreprise')),
      eRow('Nom',              g('nom_dirigeant')),
      eRow('Activité',         g('activite')),
      eRow('Ville',            g('ville')),
      eRow('Téléphone',        g('telephone')),
      eRow('Email', `<a href="mailto:${esc(emailClient)}" style="color:#1dbd8e;">${esc(emailClient)}</a>`),
      eRow('Site actuel',      g('site_actuel')),
      eRow('Domaine souhaité', g('domaine_souhaite')),
    ].join('')),

    eBlock(2, 'Votre activité', [
      eRow('Description',      g('description_activite', 3000)),
      eRow('Différenciation',  g('ce_qui_vous_differencie', 2000)),
      eRow('Clientèle',        al('type_client', 'type_client', 'type_client_autre')),
      eRow('Zone géographique',g('zone_geo')),
    ].join('')),

    eBlock(3, 'Vos services', [
      eRow('Prestations',      services || '<span style="color:#ccc;">—</span>'),
      eRow('Tarifs en ligne',  rl('affichage_tarifs', 'affichage_tarifs')),
    ].join('')),

    eBlock(4, 'Votre futur site', [
      eRow('Type de site',     rl('type_site', 'type_site')),
      eRow('Objectifs',        al('objectifs', 'objectifs', 'objectifs_autre')),
      eRow('Nombre de pages',  esc(str(d['nb_pages'])) || '<span style="color:#ccc;">—</span>'),
      eRow('Pages souhaitées', pagesHtml),
      eRow('Fonctionnalités',  al('fonctionnalites', 'fonctionnalites', 'fonctionnalites_autre')),
      eRow('Boutique',         rl('boutique_actif', 'boutique_actif')),
      boutiqueRows,
    ].join('')),

    eBlock(5, 'Univers visuel', [
      eRow('Style',            al('style_adjectifs', 'style_adjectifs', 'style_autre')),
      eRow('Couleurs aimées',  g('couleurs_aimees', 1000)),
      eRow('Couleurs à éviter',g('couleurs_non_aimees', 1000)),
      eRow('Sites inspirants', g('sites_aimes', 2000)),
    ].join('')),

    eBlock(6, 'Budget et délai', [
      eRow('Budget',           rl('budget', 'budget')),
      eRow('Délai',            rl('delai', 'delai')),
      eRow('Message',          g('message_important', 3000)),
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
    <p style="margin:0;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.5);font-weight:500;">Caelestis · Questionnaire devis</p>
    <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#fff;letter-spacing:-.02em;">Nouvelle demande de devis — ${esc(nominant)}</h1>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.4);">${esc(dateStr)}</p>
  </td></tr>

  <tr><td style="background:#fff;padding:20px 36px 8px;">
    <table cellpadding="0" cellspacing="0">
      <tr><td style="background:#2d3f54;padding:12px 24px;border-radius:99px;">
        <a href="mailto:${esc(emailClient)}?subject=Votre%20devis%20Caelestis&body=Bonjour%20${encodeURIComponent(nominant)}%2C%0A%0A" style="font-size:13px;font-weight:600;color:#fff;text-decoration:none;letter-spacing:.04em;">Répondre à ${esc(nominant)} →</a>
      </td></tr>
    </table>
  </td></tr>

  ${sections}

  <tr><td style="background:#2d3f54;padding:20px 36px;border-radius:0 0 8px 8px;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,.3);line-height:1.65;">Reçu via le questionnaire devis de <strong style="color:rgba(255,255,255,.6);">caelestis.fr</strong></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   EMAIL CLIENT — confirmation devis
══════════════════════════════════════════════════════════ */
function buildClientEmail(d: Record<string, unknown>): string {
  const prenom      = str(d['nom_dirigeant']) || str(d['nom_entreprise']) || 'Bonjour';
  const prenomEsc   = esc(prenom);

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f8fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8fb;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr><td style="background:linear-gradient(135deg,#028183 0%,#1dbd8e 100%);padding:36px 40px;border-radius:8px 8px 0 0;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.55);">Caelestis · Création de site web</p>
    <h1 style="margin:12px 0 0;font-size:26px;font-weight:300;color:#fff;letter-spacing:-.02em;">Demande bien reçue ✓</h1>
    <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,.55);">Merci pour le temps que vous y avez consacré</p>
  </td></tr>

  <tr><td style="background:#fff;padding:36px 40px 28px;">
    <p style="margin:0 0 16px;font-size:15px;color:#2d3f54;">Bonjour <strong>${prenomEsc}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;color:#52647a;line-height:1.8;">J'ai bien reçu votre demande de devis. Je vais l'étudier avec attention et vous préparer une proposition personnalisée, adaptée à votre situation précise.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#52647a;line-height:1.8;">Vous recevrez votre devis <strong style="color:#2d3f54;">sous 48h maximum</strong>. Si vous avez une question ou souhaitez échanger directement, n'hésitez pas à m'appeler ou à répondre à cet email.</p>

    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f5f8fb;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#1dbd8e;">Ce qui se passe maintenant</p>
        ${[
          ['Lecture de votre demande',   'Célestin analyse vos besoins et votre projet en détail'],
          ['Préparation du devis',       "Élaboration d'une proposition précise et personnalisée"],
          ['Envoi du devis',             'Vous recevrez votre devis chiffré sous 48h maximum'],
        ].map(([title, desc]) => `
        <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
          <tr>
            <td style="width:20px;vertical-align:top;padding-top:2px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#1dbd8e;"></span>
            </td>
            <td>
              <p style="margin:0;font-size:13px;color:#2d3f54;font-weight:600;">${esc(title)}</p>
              <p style="margin:2px 0 0;font-size:12px;color:#52647a;">${esc(desc)}</p>
            </td>
          </tr>
        </table>`).join('')}
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="background:#fff;padding:0 40px 32px;">
    <table cellpadding="0" cellspacing="0" style="border-top:1px solid #eef2f7;padding-top:20px;width:100%;">
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

  <tr><td style="background:#2d3f54;padding:20px 40px;border-radius:0 0 8px 8px;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,.3);line-height:1.65;">Vous recevez cet email car vous avez complété le questionnaire de devis sur <strong style="color:rgba(255,255,255,.55);">caelestis.fr</strong>.<br>Caelestis · Drôme, France · contact@caelestis.fr</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   PDF
══════════════════════════════════════════════════════════ */
function generateDevisPDF(d: Record<string, unknown>, dateStr: string): Promise<Buffer> {
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
    const W     = doc.page.width - 100;

    const clean  = (k: string, mx = 1000) => str(d[k], mx) || '—';
    const chips  = (k: string, cat: string, otherK = '') => {
      const vals = toArr(d[k]);
      if (!vals.length) return '—';
      const map = CHECKBOX_LABELS[cat] ?? {};
      return vals.map(v => {
        if (v === 'autre') return str(d[otherK]) ? `Autre : ${str(d[otherK])}` : 'Autre';
        return map[v] ?? v;
      }).join('  ·  ');
    };
    const radio  = (cat: string, k: string, otherK = '') =>
      radioLabel(cat, str(d[k]), str(d[otherK]))
        .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");

    doc.rect(0, 0, doc.page.width, 90).fill(TEAL);
    doc.fillColor('#FFFFFF')
       .fontSize(9).font('Helvetica')
       .text('CAELESTIS · QUESTIONNAIRE DEVIS', 50, 22, { characterSpacing: 1.5 });
    const nom = str(d['nom_dirigeant']) || str(d['nom_entreprise']) || 'Client';
    doc.fontSize(20).font('Helvetica-Bold').text(nom, 50, 36);
    doc.fontSize(8).font('Helvetica').text(dateStr, 50, 62, { characterSpacing: 0.5 });
    doc.fillColor(DARK);

    let y = 110;

    function section(num: string, title: string, rows: [string, string][]) {
      if (y + 30 + rows.length * 22 > doc.page.height - 60) { doc.addPage(); y = 50; }
      doc.rect(50, y, W, 22).fill(LIGHT);
      doc.fillColor(TEAL).fontSize(7).font('Helvetica-Bold').text(`${num}.`, 56, y + 7, { characterSpacing: 0.5 });
      doc.fillColor(DARK).fontSize(8).font('Helvetica-Bold').text(title.toUpperCase(), 72, y + 7, { characterSpacing: 0.8 });
      y += 26;
      rows.forEach(([label, value], i) => {
        if (y + 22 > doc.page.height - 60) { doc.addPage(); y = 50; }
        if (i % 2 === 0) doc.rect(50, y, W, 20).fill('#FAFBFC');
        doc.fillColor(MUTED).fontSize(7.5).font('Helvetica').text(label, 58, y + 6, { width: 130 });
        doc.fillColor(DARK).fontSize(8).font('Helvetica').text(value, 195, y + 6, { width: W - 145 });
        y += 20;
      });
      y += 10;
    }

    section('01', 'À propos du porteur', [
      ['Entreprise',        clean('nom_entreprise')],
      ['Nom',               clean('nom_dirigeant')],
      ['Activité',          clean('activite')],
      ['Ville',             clean('ville')],
      ['Téléphone',         clean('telephone')],
      ['Email',             clean('email_contact')],
      ['Site actuel',       clean('site_actuel')],
      ['Domaine souhaité',  clean('domaine_souhaite')],
    ]);

    section('02', 'Votre activité', [
      ['Description',       clean('description_activite', 400)],
      ['Différenciation',   clean('ce_qui_vous_differencie', 300)],
      ['Clientèle',         chips('type_client', 'type_client', 'type_client_autre')],
      ['Zone géographique', clean('zone_geo')],
    ]);

    const services = [1,2,3,4,5].map(n => str(d[`service_${n}`])).filter(Boolean).join('  ·  ') || '—';
    section('03', 'Vos services', [
      ['Prestations',      services],
      ['Tarifs en ligne',  radio('affichage_tarifs', 'affichage_tarifs')],
    ]);

    const boutique     = str(d['boutique_actif']);
    const boutiqueRows: [string, string][] = boutique === 'oui' ? [['Nb produits', clean('boutique_nb_produits')]] : [];
    const pagesList    = [1,2,3,4,5,6,7,8].map(n => str(d[`page_${n}`])).filter(Boolean);
    section('04', 'Votre futur site', [
      ['Type de site',     radio('type_site', 'type_site')],
      ['Objectifs',        chips('objectifs', 'objectifs', 'objectifs_autre')],
      ['Nb de pages',      clean('nb_pages')],
      ['Pages souhaitées', pagesList.length ? pagesList.map((p,i) => `${i+1}. ${p}`).join('  |  ') : '—'],
      ['Fonctionnalités',  chips('fonctionnalites', 'fonctionnalites', 'fonctionnalites_autre')],
      ['Boutique',         radio('boutique_actif', 'boutique_actif')],
      ...boutiqueRows,
    ]);

    section('05', 'Univers visuel', [
      ['Style',             chips('style_adjectifs', 'style_adjectifs', 'style_autre')],
      ['Couleurs aimées',   clean('couleurs_aimees', 200)],
      ['Couleurs à éviter', clean('couleurs_non_aimees', 200)],
      ['Sites inspirants',  clean('sites_aimes', 300)],
    ]);

    section('06', 'Budget et délai', [
      ['Budget',  radio('budget', 'budget')],
      ['Délai',   radio('delai', 'delai')],
      ['Message', clean('message_important', 500)],
    ]);

    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.rect(0, doc.page.height - 30, doc.page.width, 30).fill(DARK);
      doc.fillColor('white').fontSize(7).font('Helvetica')
         .text(
           `Caelestis · questionnaire devis · caelestis.fr · contact@caelestis.fr   |   Page ${i + 1} / ${totalPages}`,
           50, doc.page.height - 19,
           { align: 'center', width: W },
         );
    }

    doc.end();
  });
}

/* ══════════════════════════════════════════════════════════
   DOCX
══════════════════════════════════════════════════════════ */
function generateDevisDocx(d: Record<string, unknown>, dateStr: string): Promise<Buffer> {
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

  const heading = (text: string, num: string) => new Paragraph({
    children: [new TextRun({ text: `${num}. ${text}`, bold: true, color: TEAL, size: 24, font: 'Calibri' })],
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
  const nom = str(d['nom_dirigeant']) || str(d['nom_entreprise']) || 'Client';

  const children = [
    new Paragraph({
      children: [new TextRun({ text: 'QUESTIONNAIRE DEVIS', bold: true, color: TEAL, size: 32, font: 'Calibri', characterSpacing: 80 })],
      alignment: AlignmentType.LEFT, spacing: { before: 0, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: nom, bold: true, color: DARK, size: 44, font: 'Calibri' })],
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: dateStr, color: MUTED, size: 18, font: 'Calibri' })],
      spacing: { before: 0, after: 400 },
    }),

    heading('À propos du porteur', '01'),
    dataRow('Entreprise',       clean('nom_entreprise')),
    dataRow('Nom',              clean('nom_dirigeant')),
    dataRow('Activité',         clean('activite')),
    dataRow('Ville',            clean('ville')),
    dataRow('Téléphone',        clean('telephone')),
    dataRow('Email',            clean('email_contact')),
    dataRow('Site actuel',      clean('site_actuel')),
    dataRow('Domaine souhaité', clean('domaine_souhaite')),
    spacer(),

    heading('Votre activité', '02'),
    dataRow('Description',       clean('description_activite', 600)),
    dataRow('Différenciation',   clean('ce_qui_vous_differencie', 400)),
    dataRow('Clientèle',         chips('type_client', 'type_client', 'type_client_autre')),
    dataRow('Zone géographique', clean('zone_geo')),
    spacer(),

    heading('Vos services', '03'),
    dataRow('Prestations',    [1,2,3,4,5].map(n => str(d[`service_${n}`])).filter(Boolean).join('  ·  ') || '—'),
    dataRow('Tarifs en ligne', radio('affichage_tarifs', 'affichage_tarifs')),
    spacer(),

    heading('Votre futur site', '04'),
    dataRow('Type de site',     radio('type_site', 'type_site')),
    dataRow('Objectifs',        chips('objectifs', 'objectifs', 'objectifs_autre')),
    dataRow('Nb de pages',      clean('nb_pages')),
    dataRow('Pages souhaitées', [1,2,3,4,5,6,7,8].map(n => str(d[`page_${n}`])).filter(Boolean).map((p,i) => `${i+1}. ${p}`).join('  ·  ') || '—'),
    dataRow('Fonctionnalités',  chips('fonctionnalites', 'fonctionnalites', 'fonctionnalites_autre')),
    dataRow('Boutique',         radio('boutique_actif', 'boutique_actif')),
    ...(str(d['boutique_actif']) === 'oui' ? [dataRow('Nb produits', clean('boutique_nb_produits'))] : []),
    spacer(),

    heading('Univers visuel', '05'),
    dataRow('Style',             chips('style_adjectifs', 'style_adjectifs', 'style_autre')),
    dataRow('Couleurs aimées',   clean('couleurs_aimees', 200)),
    dataRow('Couleurs à éviter', clean('couleurs_non_aimees', 200)),
    dataRow('Sites inspirants',  clean('sites_aimes', 300)),
    spacer(),

    heading('Budget et délai', '06'),
    dataRow('Budget',  radio('budget', 'budget')),
    dataRow('Délai',   radio('delai', 'delai')),
    dataRow('Message', clean('message_important', 600)),
    spacer(),

    new Paragraph({
      children: [new TextRun({ text: 'Caelestis · caelestis.fr · contact@caelestis.fr · 07 69 36 27 27', color: MUTED, size: 16, font: 'Calibri' })],
      alignment: AlignmentType.CENTER, spacing: { before: 400 },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'E8EDF2' } },
    }),
  ];

  const doc = new Document({
    sections: [{ children }],
    styles: { default: { document: { run: { font: 'Calibri', size: 20, color: DARK } } } },
  });

  return Packer.toBuffer(doc) as Promise<Buffer>;
}

/* ══════════════════════════════════════════════════════════
   ENDPOINT POST /api/devis
══════════════════════════════════════════════════════════ */
export const POST: APIRoute = async ({ request }) => {

  const origin = request.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ error: 'Accès non autorisé.' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
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
    const fd = await request.formData();
    const body: Record<string, unknown> = {};

    for (const [key, value] of fd.entries()) {
      if (typeof value === 'string') {
        if (key in body) {
          const existing = body[key];
          if (Array.isArray(existing)) (existing as string[]).push(value);
          else body[key] = [existing as string, value];
        } else {
          body[key] = value;
        }
      }
    }

    if (body.website && String(body.website).length > 0) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }

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
    const slug     = nominant.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const dateSlug = new Date().toISOString().slice(0, 10);

    const [pdfBuffer, docxBuffer] = await Promise.all([
      generateDevisPDF(body, dateStr),
      generateDevisDocx(body, dateStr),
    ]);

    await Promise.all([
      transporter.sendMail({
        from:        '"Devis Caelestis" <contact@caelestis.fr>',
        to:          'contact@caelestis.fr',
        replyTo:     emailContact,
        subject:     `[Devis] ${nominant} — ${str(body['activite']).slice(0, 60) || 'demande de devis'}`,
        html:        buildAdminEmail(body, dateStr),
        attachments: [
          { filename: `devis-${slug}-${dateSlug}.pdf`,  content: pdfBuffer,  contentType: 'application/pdf' },
          { filename: `devis-${slug}-${dateSlug}.docx`, content: docxBuffer, contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        ],
      }),
      transporter.sendMail({
        from:    '"Célestin — Caelestis" <contact@caelestis.fr>',
        to:      emailContact,
        replyTo: 'contact@caelestis.fr',
        subject: 'Votre demande de devis Caelestis a bien été reçue',
        html:    buildClientEmail(body),
      }),
    ]);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    console.error('[devis API]', err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur. Réessayez ou écrivez à contact@caelestis.fr' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

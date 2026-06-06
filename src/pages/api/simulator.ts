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
function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/* ══════════════════════════════════════════════════════════
   LABELS LISIBLES
══════════════════════════════════════════════════════════ */
const TYPE_LABELS: Record<string,string> = {
  vitrine:   'Site vitrine',
  boutique:  'Boutique en ligne',
  surMesure: 'Site sur mesure',
};
const Q2_VITRINE: Record<string,string> = {
  simple: 'Simple et soigné (3–4 pages)',
  blog:   'Avec blog / actualités',
  rdv:    'Avec réservation en ligne',
};
const Q2_BOUTIQUE: Record<string,string> = {
  small:  'Moins de 20 produits',
  medium: 'Entre 20 et 100 produits',
  large:  'Plus de 100 produits',
};
const Q2_SURMESURE: Record<string,string> = {
  refonte: 'Refonte d\'un site existant',
  avance:  'Avec fonctions avancées',
  autre:   'Projet spécifique',
};
const CONTENT_LABELS: Record<string,string> = {
  ready:   'Logo + textes déjà prêts',
  logo:    'Logo seul (textes à rédiger)',
  nothing: 'À construire entièrement',
};
const TIMELINE_LABELS: Record<string,string> = {
  slow:   '2 à 3 mois',
  medium: 'D\'ici un mois',
  urgent: 'Dès que possible',
};

function getQ2Label(type: string, q2: string): string {
  if (type === 'vitrine')   return Q2_VITRINE[q2]   ?? q2;
  if (type === 'boutique')  return Q2_BOUTIQUE[q2]  ?? q2;
  if (type === 'surMesure') return Q2_SURMESURE[q2] ?? q2;
  return q2;
}

/* ══════════════════════════════════════════════════════════
   CALCUL DU PRIX
══════════════════════════════════════════════════════════ */
function calculateEstimate(type: string, q2: string, content: string, timeline: string) {
  let base = 0;
  if (type === 'vitrine') {
    base = 800;
    if (q2 === 'blog') base += 300;
    else if (q2 === 'rdv') base += 600;
  } else if (type === 'boutique') {
    base = 1200;
    if (q2 === 'medium') base += 300;
    else if (q2 === 'large') base += 600;
  } else {
    base = 2500;
    if (q2 === 'avance') base += 1000;
    else if (q2 === 'autre') base += 500;
  }
  if (content === 'logo')    base += 150;
  if (content === 'nothing') base += 350;
  if (timeline === 'urgent') base += 250;
  const low  = Math.round(base * 0.90 / 50) * 50;
  const high = Math.round(base * 1.15 / 50) * 50;
  return { low, high };
}

/* ══════════════════════════════════════════════════════════
   EMAIL PROSPECT — chaleureux, personnel
══════════════════════════════════════════════════════════ */
function buildProspectEmail(p: {
  prenom: string; activity: string; email: string;
  type: string; q2: string; content: string; timeline: string;
  low: number; high: number;
}) {
  const typeLabel = esc(TYPE_LABELS[p.type] ?? p.type);
  const q2Label   = esc(getQ2Label(p.type, p.q2));
  const contentL  = esc(CONTENT_LABELS[p.content] ?? p.content);
  const timeL     = esc(TIMELINE_LABELS[p.timeline] ?? p.timeline);
  const rows = [
    ['Type de site',  typeLabel],
    ['Votre projet',  q2Label],
    ['Contenus',      contentL],
    ['Délai',         timeL],
  ];

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#D8E8D0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#D8E8D0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- En-tête -->
      <tr><td style="background-color:#1C3828;padding:32px 40px;border-radius:4px 4px 0 0;">
        <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(242,247,240,0.45);font-weight:500;">Caelestis · Création de site web</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#F2F7F0;letter-spacing:-0.02em;">Votre estimation personnalisée</h1>
        <p style="margin:6px 0 0;font-size:12px;color:rgba(242,247,240,0.38);">Basée sur vos réponses au simulateur</p>
      </td></tr>

      <!-- Intro -->
      <tr><td style="background-color:#F2F7F0;padding:32px 40px 24px;">
        <p style="margin:0 0 6px;font-size:15px;color:#1C3828;">Bonjour <strong>${esc(p.prenom)}</strong>,</p>
        <p style="margin:0;font-size:14px;color:#4A7260;line-height:1.65;">Merci d'avoir pris quelques minutes pour simuler votre projet. Voici l'estimation que j'ai calculée pour vous.</p>
      </td></tr>

      <!-- Estimation mise en avant -->
      <tr><td style="background-color:#F2F7F0;padding:0 40px 28px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="background-color:#1C3828;padding:28px 32px;border-radius:4px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(242,247,240,0.45);">${typeLabel}</p>
            <p style="margin:10px 0 0;font-size:34px;font-weight:300;color:#F2F7F0;letter-spacing:-0.02em;">Entre <strong style="font-weight:500;">${p.low}&nbsp;€</strong> et <strong style="font-weight:500;">${p.high}&nbsp;€</strong></p>
            <p style="margin:10px 0 0;font-size:12px;color:rgba(242,247,240,0.38);">Estimation indicative · Devis précis après notre échange</p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Résumé du projet -->
      <tr><td style="background-color:#F2F7F0;padding:0 40px 28px;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;border-bottom:1px solid #D8E8D0;padding-bottom:10px;">Votre projet en résumé</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${rows.map(([label, value]) => `
          <tr>
            <td style="padding:9px 0;border-bottom:1px solid #D8E8D0;width:140px;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">${label}</p>
            </td>
            <td style="padding:9px 0;border-bottom:1px solid #D8E8D0;vertical-align:top;">
              <p style="margin:0;font-size:14px;color:#1C3828;font-weight:500;">${value}</p>
            </td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- Ce qui est inclus -->
      <tr><td style="background-color:#DFF0D6;padding:24px 40px;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;">Inclus dans chaque projet Caelestis</p>
        ${[
          'Design soigné, personnalisé à votre activité',
          'Site optimisé pour apparaître sur Google (SEO)',
          'Adapté à tous les écrans — mobile, tablette, bureau',
          'Livraison en 2 à 6 semaines',
          'Accompagnement après le lancement',
        ].map(item => `<p style="margin:0 0 6px;font-size:13px;color:#1C3828;">✓ &nbsp;${item}</p>`).join('')}
      </td></tr>

      <!-- Prochaine étape -->
      <tr><td style="background-color:#F2F7F0;padding:28px 40px;">
        <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;border-bottom:1px solid #D8E8D0;padding-bottom:10px;">La prochaine étape</p>
        <p style="margin:0 0 20px;font-size:14px;color:#4A7260;line-height:1.65;">Cette estimation est une base de réflexion. Pour un devis précis, adapté à votre activité, je vous propose un premier appel gratuit de 20 minutes — sans engagement.</p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#D4603A;padding:14px 28px;border-radius:3px;">
            <a href="https://caelestis.fr/contact" style="font-size:13px;font-weight:600;color:#F2F7F0;text-decoration:none;letter-spacing:0.04em;">Réserver mon appel gratuit →</a>
          </td></tr>
        </table>
      </td></tr>

      <!-- Signature -->
      <tr><td style="background-color:#F2F7F0;padding:0 40px 32px;border-radius:0 0 4px 4px;">
        <p style="margin:0;font-size:13px;color:#4A7260;line-height:1.7;">À très bientôt,<br><strong style="color:#1C3828;font-weight:600;">Célestin</strong><br><span style="font-size:12px;">Fondateur de Caelestis</span></p>
      </td></tr>

      <!-- Pied de page -->
      <tr><td style="background-color:#1C3828;padding:20px 40px;border-radius:0 0 4px 4px;">
        <p style="margin:0;font-size:11px;color:rgba(242,247,240,0.32);line-height:1.65;">Vous recevez cet email car vous avez réalisé une simulation sur <strong style="color:rgba(242,247,240,0.55);">caelestis.fr</strong>.<br>Caelestis · Drôme, France · contact@caelestis.fr</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   EMAIL ADMIN — fiche prospect complète
══════════════════════════════════════════════════════════ */
function buildAdminEmail(p: {
  prenom: string; activity: string; email: string;
  type: string; q2: string; content: string; timeline: string;
  low: number; high: number; date: string;
}) {
  const typeLabel = esc(TYPE_LABELS[p.type] ?? p.type);
  const q2Label   = esc(getQ2Label(p.type, p.q2));
  const contentL  = esc(CONTENT_LABELS[p.content] ?? p.content);
  const timeL     = esc(TIMELINE_LABELS[p.timeline] ?? p.timeline);
  const safeEmail = esc(p.email);
  const safePrenom = esc(p.prenom);

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#D8E8D0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#D8E8D0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <tr><td style="background-color:#1C3828;padding:32px 40px;border-radius:4px 4px 0 0;">
        <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(242,247,240,0.45);">Caelestis · Simulateur</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#F2F7F0;">Nouveau prospect</h1>
        <p style="margin:6px 0 0;font-size:12px;color:rgba(242,247,240,0.38);">${esc(p.date)}</p>
      </td></tr>

      <!-- Estimation en badge -->
      <tr><td style="background-color:#F2F7F0;padding:28px 40px 0;">
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#1C3828;padding:10px 22px;border-radius:3px;">
            <p style="margin:0;font-size:14px;font-weight:500;color:#F2F7F0;">🌱 &nbsp;Entre ${p.low}&nbsp;€ et ${p.high}&nbsp;€ — ${typeLabel}</p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Contact -->
      <tr><td style="background-color:#F2F7F0;padding:24px 40px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;border-bottom:1px solid #D8E8D0;padding-bottom:10px;">Coordonnées</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${[
            ['Prénom',   safePrenom],
            ['Activité', esc(p.activity)],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #D8E8D0;width:120px;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">${label}</p>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #D8E8D0;">
              <p style="margin:0;font-size:14px;color:#1C3828;font-weight:500;">${value}</p>
            </td>
          </tr>`).join('')}
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">Email</p>
            </td>
            <td style="padding:8px 0;">
              <a href="mailto:${safeEmail}" style="font-size:14px;color:#D4603A;font-weight:500;text-decoration:none;">${safeEmail}</a>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Projet -->
      <tr><td style="background-color:#F2F7F0;padding:24px 40px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;border-bottom:1px solid #D8E8D0;padding-bottom:10px;">Projet simulé</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${[
            ['Type de site',  typeLabel],
            ['Complexité',    q2Label],
            ['Contenus',      contentL],
            ['Délai',         timeL],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #D8E8D0;width:120px;vertical-align:top;">
              <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">${label}</p>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #D8E8D0;">
              <p style="margin:0;font-size:14px;color:#1C3828;font-weight:500;">${value}</p>
            </td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- CTA répondre -->
      <tr><td style="background-color:#F2F7F0;padding:24px 40px 36px;">
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#D4603A;padding:14px 28px;border-radius:3px;">
            <a href="mailto:${safeEmail}?subject=Suite%20à%20votre%20simulation%20Caelestis&body=Bonjour%20${encodeURIComponent(p.prenom)}%2C%0A%0A" style="font-size:13px;font-weight:600;color:#F2F7F0;text-decoration:none;">Répondre à ${safePrenom} →</a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="background-color:#1C3828;padding:20px 40px;border-radius:0 0 4px 4px;">
        <p style="margin:0;font-size:11px;color:rgba(242,247,240,0.32);">Envoyé via le simulateur de <strong style="color:rgba(242,247,240,0.55);">caelestis.fr</strong></p>
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
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ?? 'unknown';
  const { allowed, retryAfterSecs } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Trop de demandes. Réessayez dans ${Math.ceil(retryAfterSecs / 60)} minute(s).` }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfterSecs) } }
    );
  }

  /* SMTP */
  const smtpPassword = import.meta.env.OVH_SMTP_PASSWORD;
  if (!smtpPassword) {
    return new Response(JSON.stringify({ error: 'Configuration serveur incomplète.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json() as Record<string, string>;

    /* Honeypot */
    if (body.website && body.website.length > 0) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    /* Extraction */
    const prenom   = (body.prenom   ?? '').trim().slice(0, 100);
    const activity = (body.activity ?? '').trim().slice(0, 200);
    const email    = (body.email    ?? '').trim().slice(0, 254);
    const type     = (body.type     ?? '').trim().slice(0, 20);
    const q2       = (body.q2       ?? '').trim().slice(0, 20);
    const content  = (body.content  ?? '').trim().slice(0, 20);
    const timeline = (body.timeline ?? '').trim().slice(0, 20);

    /* Validation */
    if (!prenom || !activity || !email || !type || !q2 || !content || !timeline) {
      return new Response(JSON.stringify({ error: 'Données manquantes.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!EMAIL_REGEX.test(email) || /[,;\r\n]/.test(email)) {
      return new Response(JSON.stringify({ error: 'Adresse email invalide.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const validTypes     = ['vitrine', 'boutique', 'surMesure'];
    const validQ2        = ['simple','blog','rdv','small','medium','large','refonte','avance','autre'];
    const validContent   = ['ready','logo','nothing'];
    const validTimeline  = ['slow','medium','urgent'];
    if (!validTypes.includes(type) || !validQ2.includes(q2) || !validContent.includes(content) || !validTimeline.includes(timeline)) {
      return new Response(JSON.stringify({ error: 'Données invalides.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    /* Calcul */
    const { low, high } = calculateEstimate(type, q2, content, timeline);

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const params = { prenom, activity, email, type, q2, content, timeline, low, high };

    /* Envoi SMTP */
    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net', port: 465, secure: true,
      auth: { user: 'contact@caelestis.fr', pass: smtpPassword },
    });

    await Promise.all([
      /* Email au prospect */
      transporter.sendMail({
        from:    '"Célestin — Caelestis" <contact@caelestis.fr>',
        to:      email,
        replyTo: 'contact@caelestis.fr',
        subject: `Votre estimation Caelestis — entre ${low} € et ${high} €`,
        html:    buildProspectEmail(params),
      }),
      /* Notification admin */
      transporter.sendMail({
        from:    '"Simulateur Caelestis" <contact@caelestis.fr>',
        to:      'contact@caelestis.fr',
        replyTo: email,
        subject: `[Simulateur] ${prenom} · ${activity} — ${low}€/${high}€`,
        html:    buildAdminEmail({ ...params, date: dateStr }),
      }),
    ]);

    return new Response(
      JSON.stringify({ success: true, low, high, prenom }),
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

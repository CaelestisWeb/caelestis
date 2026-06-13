import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

/* ══════════════════════════════════════════════════════════
   RATE LIMITING — en mémoire (par IP, fenêtre glissante 15min)
   Limite : 5 envois par IP sur 15 minutes
══════════════════════════════════════════════════════════ */
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_MAX       = 5;              // tentatives max

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now  = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= RATE_MAX) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSecs };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSecs: 0 };
}

/* Nettoyage périodique des entrées expirées (évite fuite mémoire) */
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, RATE_WINDOW_MS);

/* ══════════════════════════════════════════════════════════
   ORIGINES AUTORISÉES (CSRF / CORS)
══════════════════════════════════════════════════════════ */
const ALLOWED_ORIGINS = new Set([
  'https://caelestis.fr',
  'https://www.caelestis.fr',
]);

/* ══════════════════════════════════════════════════════════
   LONGUEURS MAXIMALES DES CHAMPS
══════════════════════════════════════════════════════════ */
const MAX_LEN = {
  type:    20,
  prenom:  100,
  email:   254,  // RFC 5321 max
  societe: 200,
  projet:  5000,
};

/* ══════════════════════════════════════════════════════════
   ECHAPPEMENT HTML — empêche XSS dans le corps de l'email
══════════════════════════════════════════════════════════ */
function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ══════════════════════════════════════════════════════════
   VALIDATION EMAIL STRICTE (RFC 5321 simplifiée)
   — empêche header injection (virgule, point-virgule, CRLF)
══════════════════════════════════════════════════════════ */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isValidEmail(email: string): boolean {
  if (!EMAIL_REGEX.test(email)) return false;
  // Interdit les caractères qui permettent l'injection de headers
  if (/[,;\r\n\t]/.test(email)) return false;
  return true;
}

/* ══════════════════════════════════════════════════════════
   TYPES DE DEMANDES AUTORISÉS (whitelist stricte)
══════════════════════════════════════════════════════════ */
const TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  message: { label: 'Message simple',       emoji: '✉️',  color: '#6BA05A' },
  appel:   { label: 'Réservation d\'appel',  emoji: '📞', color: '#D4603A' },
  devis:   { label: 'Demande de devis',      emoji: '📋', color: '#1C3828' },
};

/* ══════════════════════════════════════════════════════════
   TEMPLATE EMAIL HTML (avec données échappées)
══════════════════════════════════════════════════════════ */
function buildEmailHtml(params: {
  type: string;
  prenom: string;
  email: string;
  societe: string;
  projet: string;
  date: string;
  extras: Array<[string, string]>;
}) {
  const { type, prenom, email, societe, projet, date, extras } = params;
  const typeInfo = TYPE_LABELS[type] ?? { label: 'Demande', emoji: '📩', color: '#1C3828' };

  // Toutes les données utilisateur sont échappées avant injection dans le HTML
  const safePrenom  = escHtml(prenom);
  const safeEmail   = escHtml(email);
  const safeSociete = escHtml(societe);
  const safeDate    = escHtml(date);
  // Sauts de ligne convertis en <br> après échappement
  const safeProjet  = escHtml(projet).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande — Caelestis</title>
</head>
<body style="margin:0;padding:0;background-color:#D8E8D0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#D8E8D0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ─── EN-TÊTE ─── -->
          <tr>
            <td style="background-color:#1C3828;padding:32px 40px;border-radius:4px 4px 0 0;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(242,247,240,0.45);font-weight:500;">Caelestis · Création de site web</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#F2F7F0;letter-spacing:-0.02em;">Nouvelle demande reçue</h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(242,247,240,0.38);">${safeDate}</p>
            </td>
          </tr>

          <!-- ─── BADGE TYPE ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:28px 40px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${typeInfo.color};padding:9px 20px;border-radius:3px;">
                    <p style="margin:0;font-size:12px;font-weight:600;color:#F2F7F0;letter-spacing:0.08em;">
                      ${typeInfo.emoji}&nbsp;&nbsp;${escHtml(typeInfo.label.toUpperCase())}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── COORDONNÉES CLIENT ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:28px 40px 0;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;border-bottom:1px solid #D8E8D0;padding-bottom:10px;">
                Coordonnées client
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #D8E8D0;width:130px;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">Prénom</p>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #D8E8D0;vertical-align:top;">
                    <p style="margin:0;font-size:15px;color:#1C3828;font-weight:500;">${safePrenom}</p>
                  </td>
                </tr>
                ${safeSociete ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #D8E8D0;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">Entreprise</p>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #D8E8D0;vertical-align:top;">
                    <p style="margin:0;font-size:15px;color:#1C3828;font-weight:500;">${safeSociete}</p>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">Email</p>
                  </td>
                  <td style="padding:10px 0;vertical-align:top;">
                    <a href="mailto:${safeEmail}" style="margin:0;font-size:15px;color:#D4603A;font-weight:500;text-decoration:none;">${safeEmail}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── DÉTAILS COMPLÉMENTAIRES (créneau, type projet, etc.) ─── -->
          ${extras.length > 0 ? `
          <tr>
            <td style="background-color:#F2F7F0;padding:0 40px 20px;">
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;border-bottom:1px solid #D8E8D0;padding-bottom:10px;">
                Détails complémentaires
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                ${extras.map(([label, value]) => `
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #D8E8D0;width:160px;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">${escHtml(label)}</p>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #D8E8D0;vertical-align:top;">
                    <p style="margin:0;font-size:14px;color:#1C3828;font-weight:500;">${escHtml(value)}</p>
                  </td>
                </tr>`).join('')}
              </table>
            </td>
          </tr>` : ''}

          ${projet ? `
          <!-- ─── DESCRIPTION DU PROJET ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:28px 40px;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;border-bottom:1px solid #D8E8D0;padding-bottom:10px;">
                Description de la demande
              </p>
              <div style="background-color:#DFF0D6;border-left:3px solid #6BA05A;padding:20px 24px;border-radius:0 4px 4px 0;">
                <p style="margin:0;font-size:15px;color:#1C3828;line-height:1.78;">${safeProjet}</p>
              </div>
            </td>
          </tr>` : ''}

          <!-- ─── ACTION RAPIDE ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:0 40px 36px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#D4603A;padding:14px 28px;border-radius:3px;">
                    <a href="mailto:${safeEmail}?subject=Re%20%3A%20votre%20demande%20%E2%80%94%20Caelestis&body=Bonjour%20${encodeURIComponent(prenom)}%2C%0A%0A" style="font-size:13px;font-weight:600;color:#F2F7F0;text-decoration:none;letter-spacing:0.04em;">
                      Répondre à ${safePrenom} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── PIED DE PAGE ─── -->
          <tr>
            <td style="background-color:#1C3828;padding:22px 40px;border-radius:0 0 4px 4px;">
              <p style="margin:0;font-size:11px;color:rgba(242,247,240,0.32);line-height:1.65;">
                Ce message a été envoyé via le formulaire de contact de <strong style="color:rgba(242,247,240,0.55);">caelestis.fr</strong><br>
                L'adresse de réponse est définie automatiquement sur l'email du client.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   EMAIL CLIENT — Invitation questionnaire devis
══════════════════════════════════════════════════════════ */
function buildDevisInviteEmail(prenom: string, dateStr: string): string {
  const safePrenom = escHtml(prenom);
  const safeDate   = escHtml(dateStr);
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre questionnaire de devis — Caelestis</title>
</head>
<body style="margin:0;padding:0;background-color:#D8E8D0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#D8E8D0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ─── EN-TÊTE ─── -->
          <tr>
            <td style="background-color:#1C3828;padding:32px 40px;border-radius:4px 4px 0 0;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(242,247,240,0.45);font-weight:500;">Caelestis · Création de site web</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#F2F7F0;letter-spacing:-0.02em;">Votre questionnaire de devis</h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(242,247,240,0.38);">${safeDate}</p>
            </td>
          </tr>

          <!-- ─── CORPS ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:36px 40px 28px;">
              <p style="margin:0 0 20px;font-size:17px;font-weight:300;color:#1C3828;line-height:1.6;">Bonjour ${safePrenom},</p>
              <p style="margin:0 0 16px;font-size:15px;font-weight:300;color:#3d4f28;line-height:1.75;">
                Merci de votre intérêt pour Caelestis. Pour vous établir un devis précis et personnalisé, nous avons besoin de quelques informations sur votre projet.
              </p>
              <p style="margin:0 0 28px;font-size:15px;font-weight:300;color:#3d4f28;line-height:1.75;">
                Remplissez le questionnaire en cliquant sur le bouton ci-dessous — il ne prend que quelques minutes.
              </p>
            </td>
          </tr>

          <!-- ─── CTA ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:0 40px 36px;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1C3828;padding:16px 32px;border-radius:3px;">
                    <a href="https://caelestis.fr/questionnaire-devis" style="font-size:14px;font-weight:600;color:#F2F7F0;text-decoration:none;letter-spacing:0.04em;">
                      Remplir mon questionnaire de devis →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── NOTE ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:0 40px 36px;border-bottom:1px solid #D8E8D0;">
              <p style="margin:0;font-size:13px;color:#4A7260;line-height:1.65;">
                Votre devis vous sera transmis sous <strong>48H</strong> après réception de vos réponses.<br>
                Si vous avez la moindre question, répondez simplement à cet email.
              </p>
            </td>
          </tr>

          <!-- ─── SIGNATURE ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:28px 40px 36px;">
              <p style="margin:0;font-size:15px;font-weight:300;color:#1C3828;line-height:1.6;">À très vite,</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:500;color:#1C3828;">Célestin — Caelestis</p>
            </td>
          </tr>

          <!-- ─── PIED DE PAGE ─── -->
          <tr>
            <td style="background-color:#1C3828;padding:22px 40px;border-radius:0 0 4px 4px;">
              <p style="margin:0;font-size:11px;color:rgba(242,247,240,0.32);line-height:1.65;">
                Vous recevez cet email suite à votre demande de devis sur <strong style="color:rgba(242,247,240,0.55);">caelestis.fr</strong><br>
                Lien direct : <a href="https://caelestis.fr/questionnaire-devis" style="color:rgba(242,247,240,0.45);text-decoration:underline;">caelestis.fr/questionnaire-devis</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   ENDPOINT POST /api/contact
══════════════════════════════════════════════════════════ */
export const POST: APIRoute = async ({ request }) => {

  /* ── 1. CORS / CSRF — vérification de l'origine ── */
  /* Bloque si Origin absent (curl, Postman, scripts tiers) OU non autorisé */
  const origin = request.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new Response(
      JSON.stringify({ error: 'Accès non autorisé.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  /* ── 2. Rate limiting par IP ── */
  /* Sur Vercel, x-real-ip est injecté par le CDN et ne peut pas être forgé par le client.
     x-forwarded-for peut être manipulé (le client contrôle les premières valeurs) ;
     on lit la DERNIÈRE entrée, ajoutée par Vercel, qui correspond à l'IP réelle. */
  const ip = (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown'
  );
  const { allowed, retryAfterSecs } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Trop de demandes. Réessayez dans ${Math.ceil(retryAfterSecs / 60)} minute(s).` }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSecs),
        },
      }
    );
  }

  /* ── 3. Vérification configuration SMTP ── */
  const smtpPassword = import.meta.env.OVH_SMTP_PASSWORD;
  if (!smtpPassword) {
    console.error('[contact API] OVH_SMTP_PASSWORD manquant');
    return new Response(
      JSON.stringify({ error: 'Configuration serveur incomplète. Contactez-moi directement à contact@caelestis.fr' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  /* ── 3b. Vérification Content-Type (doit être un FormData) ── */
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
    return new Response(
      JSON.stringify({ error: 'Format de requête invalide.' }),
      { status: 415, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await request.formData();

    /* ── 4a. Honeypot anti-bot — doit rester vide ── */
    const honeypot = data.get('website')?.toString() ?? '';
    if (honeypot.length > 0) {
      /* Réponse silencieuse — ne pas alerter le bot */
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    /* ── 4b. Extraction et nettoyage des champs principaux ── */
    const type    = data.get('formType')?.toString().trim()  ?? '';
    const prenom  = data.get('prenom')?.toString().trim()    ?? '';
    const email   = data.get('email')?.toString().trim()     ?? '';
    const societe = data.get('societe')?.toString().trim()   ?? '';
    /* 'projet' est le nom unifié côté formulaire HTML pour les 3 types de demande */
    const projet  = data.get('projet')?.toString().trim()    ?? '';

    /* ── 4c. Champs complémentaires selon le type de formulaire ── */
    const extras: Array<[string, string]> = [];
    if (type === 'message') {
      const sujet = data.get('sujet')?.toString().trim() ?? '';
      if (sujet) extras.push(['Sujet', sujet]);
    }
    if (type === 'appel') {
      const telephone = data.get('telephone')?.toString().trim() ?? '';
      const creneau   = data.get('creneau')?.toString().trim()   ?? '';
      const jours     = data.getAll('jours').map(j => j.toString().trim()).filter(Boolean).join(', ');
      if (telephone) {
        /* Validation basique du numéro (chiffres, espaces, +, tirets) */
        if (!/^[\d\s\+\-\.\(\)]{6,20}$/.test(telephone)) {
          return new Response(
            JSON.stringify({ error: 'Numéro de téléphone invalide.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        extras.push(['Téléphone', telephone]);
      }
      if (creneau) extras.push(['Créneau préféré', creneau]);
      if (jours)   extras.push(['Jours disponibles', jours]);
    }
    if (type === 'devis') {
      extras.push(['Questionnaire', 'Envoyé par email au client']);
    }

    /* ── 5. Validation longueurs (DoS) ── */
    const fields: [string, string, number][] = [
      ['type', type, MAX_LEN.type],
      ['prenom', prenom, MAX_LEN.prenom],
      ['email', email, MAX_LEN.email],
      ['societe', societe, MAX_LEN.societe],
      ['projet', projet, MAX_LEN.projet],
    ];
    for (const [name, val, max] of fields) {
      if (val.length > max) {
        return new Response(
          JSON.stringify({ error: `Le champ "${name}" dépasse la longueur autorisée.` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    /* ── 6. Validation des champs obligatoires ── */
    if (!type || !prenom || !email || (type !== 'devis' && !projet)) {
      return new Response(
        JSON.stringify({ error: 'Veuillez remplir tous les champs obligatoires.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    /* ── 7. Type sur liste blanche (pas d'injection de libellés arbitraires) ── */
    if (!Object.prototype.hasOwnProperty.call(TYPE_LABELS, type)) {
      return new Response(
        JSON.stringify({ error: 'Type de demande invalide.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    /* ── 8. Validation email stricte (injection, format) ── */
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'L\'adresse email semble invalide.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    /* ── 9. Envoi SMTP ── */
    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true,
      auth: {
        user: 'contact@caelestis.fr',
        pass: smtpPassword,
      },
    });

    const typeInfo = TYPE_LABELS[type];
    const dateStr  = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const subject = `[Caelestis] ${typeInfo.label} — ${prenom}${societe ? ' · ' + societe : ''}`;
    const html    = buildEmailHtml({ type, prenom, email, societe, projet, date: dateStr, extras });

    await transporter.sendMail({
      from:    '"Caelestis" <contact@caelestis.fr>',
      to:      'contact@caelestis.fr',
      replyTo: email,   // validé et sécurisé ci-dessus
      subject,
      html,
    });

    /* ── Email client : lien vers le questionnaire de devis ── */
    if (type === 'devis') {
      await transporter.sendMail({
        from:    '"Caelestis" <contact@caelestis.fr>',
        to:      email,
        subject: 'Votre questionnaire de devis — Caelestis',
        html:    buildDevisInviteEmail(prenom, dateStr),
      });
    }

    return new Response(
      JSON.stringify({ success: true, prenom }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    /* Erreur générique — aucun détail exposé au client */
    const message = err instanceof Error ? err.message : String(err);
    console.error('[contact API] Erreur d\'envoi :', message);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur. Veuillez réessayer ou écrire directement à contact@caelestis.fr' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

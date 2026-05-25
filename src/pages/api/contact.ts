import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

const TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  message: { label: 'Message simple',       emoji: '✉️',  color: '#6BA05A' },
  appel:   { label: 'Réservation d\'appel',  emoji: '📞', color: '#D4603A' },
  devis:   { label: 'Demande de devis',      emoji: '📋', color: '#1C3828' },
};

function buildEmailHtml(params: {
  type: string;
  prenom: string;
  email: string;
  societe: string;
  projet: string;
  date: string;
}) {
  const { type, prenom, email, societe, projet, date } = params;
  const typeInfo       = TYPE_LABELS[type] ?? { label: type, emoji: '📩', color: '#1C3828' };
  const projetFormatted = projet.replace(/\n/g, '<br>');

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
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(242,247,240,0.45);font-weight:500;">Caelestis · Agence web</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#F2F7F0;letter-spacing:-0.02em;">Nouvelle demande reçue</h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(242,247,240,0.38);">${date}</p>
            </td>
          </tr>

          <!-- ─── BADGE TYPE ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:28px 40px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${typeInfo.color};padding:9px 20px;border-radius:3px;">
                    <p style="margin:0;font-size:12px;font-weight:600;color:#F2F7F0;letter-spacing:0.08em;">
                      ${typeInfo.emoji}&nbsp;&nbsp;${typeInfo.label.toUpperCase()}
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
                    <p style="margin:0;font-size:15px;color:#1C3828;font-weight:500;">${prenom}</p>
                  </td>
                </tr>
                ${societe ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #D8E8D0;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">Entreprise</p>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #D8E8D0;vertical-align:top;">
                    <p style="margin:0;font-size:15px;color:#1C3828;font-weight:500;">${societe}</p>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#4A7260;letter-spacing:0.08em;text-transform:uppercase;">Email</p>
                  </td>
                  <td style="padding:10px 0;vertical-align:top;">
                    <a href="mailto:${email}" style="margin:0;font-size:15px;color:#D4603A;font-weight:500;text-decoration:none;">${email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── DESCRIPTION DU PROJET ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:28px 40px;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6BA05A;font-weight:600;border-bottom:1px solid #D8E8D0;padding-bottom:10px;">
                Description de la demande
              </p>
              <div style="background-color:#DFF0D6;border-left:3px solid #6BA05A;padding:20px 24px;border-radius:0 4px 4px 0;">
                <p style="margin:0;font-size:15px;color:#1C3828;line-height:1.78;">${projetFormatted}</p>
              </div>
            </td>
          </tr>

          <!-- ─── ACTION RAPIDE ─── -->
          <tr>
            <td style="background-color:#F2F7F0;padding:0 40px 36px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#D4603A;padding:14px 28px;border-radius:3px;">
                    <a href="mailto:${email}?subject=Re%20%3A%20votre%20demande%20%E2%80%94%20Caelestis&body=Bonjour%20${encodeURIComponent(prenom)}%2C%0A%0A" style="font-size:13px;font-weight:600;color:#F2F7F0;text-decoration:none;letter-spacing:0.04em;">
                      Répondre à ${prenom} →
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

export const POST: APIRoute = async ({ request }) => {
  /* ── Vérification configuration SMTP ── */
  const smtpPassword = import.meta.env.OVH_SMTP_PASSWORD;
  if (!smtpPassword || smtpPassword === 'MOT_DE_PASSE_OVH_ICI') {
    console.error('[contact API] OVH_SMTP_PASSWORD manquant dans .env');
    return new Response(
      JSON.stringify({ error: 'Configuration serveur incomplète. Contactez-moi directement à contact@caelestis.fr' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  /* ── Transporter SMTP OVH ── */
  const transporter = nodemailer.createTransport({
    host: 'ssl0.ovh.net',
    port: 465,
    secure: true,
    auth: {
      user: 'contact@caelestis.fr',
      pass: smtpPassword,
    },
  });

  try {
    const data = await request.formData();

    const type    = data.get('type')?.toString().trim()    ?? '';
    const prenom  = data.get('prenom')?.toString().trim()  ?? '';
    const email   = data.get('email')?.toString().trim()   ?? '';
    const societe = data.get('societe')?.toString().trim() ?? '';
    const projet  = data.get('projet')?.toString().trim()  ?? '';

    /* Validation */
    if (!type || !prenom || !email || !projet) {
      return new Response(
        JSON.stringify({ error: 'Veuillez remplir tous les champs obligatoires.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'L\'adresse email semble invalide.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const typeInfo = TYPE_LABELS[type] ?? { label: type, emoji: '📩', color: '#1C3828' };
    const dateStr  = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const subject = `[Caelestis] ${typeInfo.label} — ${prenom}${societe ? ' · ' + societe : ''}`;
    const html    = buildEmailHtml({ type, prenom, email, societe, projet, date: dateStr });

    await transporter.sendMail({
      from:    '"Caelestis" <contact@caelestis.fr>',
      to:      'contact@caelestis.fr',
      replyTo: email,
      subject,
      html,
    });

    return new Response(
      JSON.stringify({ success: true, prenom }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[contact API]', err);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur inattendue. Veuillez réessayer.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

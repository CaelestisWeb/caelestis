import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false; // Cet endpoint est dynamique (SSR)

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  message: { label: 'Message simple',      emoji: '✉️',  color: '#7A8B5C' },
  appel:   { label: 'Réservation d\'appel', emoji: '📞', color: '#C97B45' },
  devis:   { label: 'Demande de devis',     emoji: '📋', color: '#3D2E1F' },
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
  const typeInfo = TYPE_LABELS[type] ?? { label: type, emoji: '📩', color: '#3D2E1F' };
  const projetFormatted = projet.replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande — Caelestis</title>
</head>
<body style="margin:0;padding:0;background-color:#F0E8DA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0E8DA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ─── EN-TÊTE ─── -->
          <tr>
            <td style="background-color:#3D2E1F;padding:32px 40px;border-radius:2px 2px 0 0;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(250,246,240,0.5);font-weight:500;">Caelestis · Agence web</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#FAF6F0;letter-spacing:-0.02em;">Nouvelle demande reçue</h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(250,246,240,0.4);">${date}</p>
            </td>
          </tr>

          <!-- ─── BADGE TYPE DE DEMANDE ─── -->
          <tr>
            <td style="background-color:#FAF6F0;padding:28px 40px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${typeInfo.color};padding:8px 18px;border-radius:2px;">
                    <p style="margin:0;font-size:12px;font-weight:600;color:#FAF6F0;letter-spacing:0.05em;">
                      ${typeInfo.emoji}&nbsp;&nbsp;${typeInfo.label.toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── COORDONNÉES CLIENT ─── -->
          <tr>
            <td style="background-color:#FAF6F0;padding:28px 40px 0;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7A8B5C;font-weight:600;border-bottom:1px solid #F0E8DA;padding-bottom:10px;">
                Coordonnées client
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F0E8DA;width:130px;">
                    <p style="margin:0;font-size:11px;color:#6B5344;letter-spacing:0.08em;text-transform:uppercase;">Prénom</p>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #F0E8DA;">
                    <p style="margin:0;font-size:15px;color:#3D2E1F;font-weight:500;">${prenom}</p>
                  </td>
                </tr>
                ${societe ? `
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F0E8DA;">
                    <p style="margin:0;font-size:11px;color:#6B5344;letter-spacing:0.08em;text-transform:uppercase;">Entreprise</p>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #F0E8DA;">
                    <p style="margin:0;font-size:15px;color:#3D2E1F;font-weight:500;">${societe}</p>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:11px;color:#6B5344;letter-spacing:0.08em;text-transform:uppercase;">Email</p>
                  </td>
                  <td style="padding:8px 0;">
                    <a href="mailto:${email}" style="margin:0;font-size:15px;color:#C97B45;font-weight:500;text-decoration:none;">${email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── DESCRIPTION DU PROJET ─── -->
          <tr>
            <td style="background-color:#FAF6F0;padding:28px 40px;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7A8B5C;font-weight:600;border-bottom:1px solid #F0E8DA;padding-bottom:10px;">
                Description de la demande
              </p>
              <div style="background-color:#EBF0E3;border-left:3px solid #7A8B5C;padding:20px 24px;border-radius:0 2px 2px 0;">
                <p style="margin:0;font-size:15px;color:#3D2E1F;line-height:1.75;">${projetFormatted}</p>
              </div>
            </td>
          </tr>

          <!-- ─── ACTION RAPIDE ─── -->
          <tr>
            <td style="background-color:#FAF6F0;padding:0 40px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#C97B45;padding:14px 28px;border-radius:2px;">
                    <a href="mailto:${email}?subject=Re: votre demande — Caelestis" style="font-size:13px;font-weight:600;color:#FAF6F0;text-decoration:none;letter-spacing:0.03em;">
                      Répondre à ${prenom} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── PIED DE PAGE ─── -->
          <tr>
            <td style="background-color:#3D2E1F;padding:20px 40px;border-radius:0 0 2px 2px;">
              <p style="margin:0;font-size:11px;color:rgba(250,246,240,0.35);line-height:1.6;">
                Ce message a été envoyé via le formulaire de contact de <strong style="color:rgba(250,246,240,0.6);">caelestis.fr</strong><br>
                Adresse de réponse automatiquement définie sur l'email du client.
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
  try {
    const data = await request.formData();

    const type    = data.get('type')?.toString().trim()    ?? '';
    const prenom  = data.get('prenom')?.toString().trim()  ?? '';
    const email   = data.get('email')?.toString().trim()   ?? '';
    const societe = data.get('societe')?.toString().trim() ?? '';
    const projet  = data.get('projet')?.toString().trim()  ?? '';

    // Validation basique
    if (!type || !prenom || !email || !projet) {
      return new Response(
        JSON.stringify({ error: 'Veuillez remplir tous les champs obligatoires.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const typeInfo  = TYPE_LABELS[type] ?? { label: type, emoji: '📩', color: '#3D2E1F' };
    const now       = new Date();
    const dateStr   = now.toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const subject = `[Caelestis] ${typeInfo.label} — ${prenom}${societe ? ' · ' + societe : ''}`;

    const html = buildEmailHtml({ type, prenom, email, societe, projet, date: dateStr });

    await resend.emails.send({
      // ⚠️ Remplacez par votre domaine vérifié sur resend.com avant de mettre en prod
      // Ex: 'Formulaire Caelestis <formulaire@caelestis.fr>'
      from: 'Caelestis <onboarding@resend.dev>',
      to:   ['caelestis-pro@hotmail.com'],
      replyTo: email,
      subject,
      html,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[contact API]', err);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer ou m\'écrire directement.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

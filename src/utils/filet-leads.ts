/**
 * Filet de sécurité des demandes entrantes.
 *
 * Quand l'envoi SMTP échoue (mot de passe périmé, serveur OVH injoignable),
 * la demande du visiteur disparaissait sans laisser la moindre trace : pas de
 * mail, et un log qui ne retenait que le message d'erreur, jamais le contenu.
 * La panne du 2 août 2026 a duré deux jours et il a été impossible, après coup,
 * de savoir combien de prospects avaient été perdus ni qui ils étaient.
 *
 * Ce module rejoue la demande vers le hub interne, qui l'enregistre comme un
 * prospect à contacter. Le contrat est celui de la route d'ingestion du hub
 * (`src/app/api/leads/route.ts` côté admin) : `email` obligatoire et plausible,
 * `source` libre jusqu'à 60 caractères, `notes` jusqu'à 2000. Le hub déduplique
 * lui-même sur l'email et enrichit les notes existantes plutôt que de les
 * écraser, donc un doublon n'a aucune conséquence.
 */

export type DemandeDeSecours = {
  /** Adresse du visiteur. Sans elle le hub refuse, on retombe sur le log. */
  email: string;
  nom?: string;
  siteWeb?: string;
  /** Identifie le formulaire d'origine dans le hub : contact, devis, brief… */
  source: string;
  /** Récapitulatif de la demande. Les valeurs vides sont ignorées. */
  details: Array<[string, string | undefined | null]>;
};

const DELAI_MAX_MS = 8000;

/** Longueur maximale acceptée par le hub, tronquer ici évite un rejet inutile. */
const MAX_NOTES = 2000;

function construireNotes(demande: DemandeDeSecours, motif: string): string {
  const date = new Date().toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  });

  const lignes = [
    `⚠️ Demande reçue le ${date} via le formulaire « ${demande.source} ».`,
    `L'envoi de l'e-mail a échoué (${motif}), elle est enregistrée ici pour ne pas être perdue.`,
    '',
    ...demande.details
      .filter(([, valeur]) => typeof valeur === 'string' && valeur.trim().length > 0)
      .map(([intitule, valeur]) => `${intitule} : ${String(valeur).trim()}`),
  ];

  return lignes.join('\n').slice(0, MAX_NOTES);
}

/**
 * Transmet la demande au hub. Ne lève jamais d'exception : cette fonction est
 * appelée depuis un `catch`, et une erreur levée ici masquerait la panne
 * d'origine tout en reperdant la demande.
 *
 * @returns `true` seulement si le hub a confirmé la prise en compte.
 */
export async function enregistrerDemandeDeSecours(
  demande: DemandeDeSecours,
  motif: string,
): Promise<boolean> {
  const notes = construireNotes(demande, motif);

  const urlHub = import.meta.env.HUB_LEADS_URL;
  const secret = import.meta.env.HUB_LEADS_SECRET;

  /* Liaison absente : le hub ne peut rien recevoir, mais un log complet reste
     récupérable pendant la durée de rétention Vercel. C'est le dernier recours,
     et il vaut infiniment mieux que le silence. */
  if (!urlHub || !secret) {
    console.error('[filet-leads] hub non configuré, demande consignée dans les logs :', {
      email: demande.email,
      nom: demande.nom,
      source: demande.source,
      notes,
    });
    return false;
  }

  try {
    const reponse = await fetch(urlHub, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-caelestis-ingest': secret,
      },
      body: JSON.stringify({
        email: demande.email,
        nom: demande.nom || undefined,
        site_web: demande.siteWeb || undefined,
        source: demande.source.slice(0, 60),
        notes,
      }),
      signal: AbortSignal.timeout(DELAI_MAX_MS),
    });

    if (!reponse.ok) {
      /* Le hub a refusé : on consigne tout, sinon la demande disparaît deux fois. */
      console.error(
        `[filet-leads] hub en erreur ${reponse.status}, demande consignée dans les logs :`,
        { email: demande.email, nom: demande.nom, source: demande.source, notes },
      );
      return false;
    }

    console.warn(`[filet-leads] demande sauvée vers le hub (source : ${demande.source})`);
    return true;
  } catch (erreur) {
    console.error('[filet-leads] hub injoignable, demande consignée dans les logs :', {
      email: demande.email,
      nom: demande.nom,
      source: demande.source,
      notes,
      erreur: erreur instanceof Error ? erreur.message : String(erreur),
    });
    return false;
  }
}

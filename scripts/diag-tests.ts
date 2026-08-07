/**
 * Contrôles de non-régression du diagnostic.
 *
 * Chaque cas reproduit un constat faux relevé sur un vrai site en août 2026 :
 * des mentions légales écrites avec des entités HTML et déclarées absentes, un
 * robots.txt qui bloque un aspirateur et non Google, une description coupée à
 * la première apostrophe.
 *
 *   node scripts/diag-tests.ts             contrôles hors ligne, immédiats
 *   node scripts/diag-tests.ts --reseau    plus les sites témoins réels
 */
import {
  analyserSite,
  attribut,
  constatsDuSite,
  cspFaible,
  decoderEntites,
  normaliserUrl,
  parcourirPages,
  robotsBloqueTout,
  texteVisible,
  PAGES_PAR_PAQUET,
} from '../src/utils/analyse-site.ts';

let reussis = 0;
const echecs: string[] = [];

function verifier(intitule: string, condition: boolean, detail = '') {
  if (condition) { reussis += 1; return; }
  echecs.push(`${intitule}${detail ? ` : ${detail}` : ''}`);
}
const egal = (intitule: string, obtenu: unknown, attendu: unknown) =>
  verifier(intitule, obtenu === attendu, `obtenu ${JSON.stringify(obtenu)}, attendu ${JSON.stringify(attendu)}`);

/* ══ Entités HTML ══════════════════════════════════════════
   hostelquartierlibre.fr écrit « Mentions l&eacute;gales » : la version
   précédente remplaçait l'entité par une espace et déclarait les mentions
   légales absentes, constat le plus lourd de la famille confiance. */
egal('entité nommée', decoderEntites('Mentions l&eacute;gales'), 'Mentions légales');
egal('entité numérique', decoderEntites('l&#039;Ard&egrave;che'), "l'Ardèche");
egal('entité hexadécimale', decoderEntites('caf&#xE9;'), 'café');
egal('esperluette et euro', decoderEntites('12&nbsp;&euro; &amp; plus'), '12 € & plus');
egal('entité inconnue laissée telle quelle', decoderEntites('&zzz; ok'), '&zzz; ok');
egal('texte sans entité inchangé', decoderEntites('rien à décoder'), 'rien à décoder');
verifier('mentions légales encodées reconnues',
  /mentions?[-_\s]{0,3}l[ée]gal/i.test(decoderEntites('<a href="/legal">Mentions l&eacute;gales</a>')));

/* Le mot « légal » suffit, quel que soit le libellé choisi : accuser à tort un
   site d'être hors la loi coûte bien plus cher que de rater une vraie absence. */
const MOT_LEGAL = /(?:^|[/_\-\s])l[ée]gal(?:e|es|s|ement)?(?:$|[/_\-\s.?#])/i;
for (const chemin of ['/mentions-legales', '/nos-garanties-tres-legales', '/legal', '/fr/legal/', '/infos_legales', '/legal-notice']) {
  verifier(`chemin reconnu comme légal : ${chemin}`, MOT_LEGAL.test(chemin));
}
for (const chemin of ['/blog/illegal-downloads', '/paralegal', '/legalisation-de-signature']) {
  verifier(`chemin non confondu : ${chemin}`, !MOT_LEGAL.test(chemin), 'reconnu à tort');
}

/* ══ Lecture d'attributs ═══════════════════════════════════
   lebonplant-rosieres.fr : description de 150 caractères, mesurée à 43 parce
   que la lecture s'arrêtait à l'apostrophe de « l'Ardèche ». */
const META = `<meta name="description" content="La Pépinière LE BON PLANT à Rosières dans l'Ardèche vous accueille pour ses produits.">`;
egal('apostrophe dans un attribut entre guillemets doubles',
  attribut(META, 'content')?.length, 85);
egal("guillemets simples et guillemet double à l'intérieur",
  attribut(`<meta content='dit "bonjour"'>`, 'content'), 'dit "bonjour"');
egal('attribut sans guillemets', attribut('<a href=/contact class=x>', 'href'), '/contact');
egal('attribut absent', attribut('<img src="a.jpg">', 'alt'), null);
egal('attribut décodé à la lecture', attribut('<meta content="caf&eacute;">', 'content'), 'café');
egal("un nom d'attribut n'est pas confondu avec un autre",
  attribut('<img data-src="a.jpg" src="b.jpg">', 'src'), 'b.jpg');

/* ══ robots.txt ════════════════════════════════════════════
   fab-rique.com et pepinieres-roux.com autorisent tout le monde et bloquent un
   aspirateur en fin de fichier. Ils étaient accusés d'interdire Google. */
verifier('groupe générique ouvert, aspirateur bloqué plus bas',
  !robotsBloqueTout('User-agent: *\nAllow: /\nDisallow: *?lightbox=\n\nUser-agent: PetalBot\nDisallow: /\n'));
verifier('disallow vide veut dire tout autorisé',
  !robotsBloqueTout('User-agent: *\nDisallow:\nCrawl-delay: 1\n\nUser-agent: MJ12bot\nDisallow: /\n'));
verifier('blocage réel du groupe générique',
  robotsBloqueTout('User-agent: *\nDisallow: /\n'));
verifier('blocage réel avec commentaires et casse mêlée',
  robotsBloqueTout('# interdit\nUSER-AGENT: *\n  disallow:  /   # tout\n'));
verifier('règle propre à Google prioritaire sur le groupe générique',
  robotsBloqueTout('User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nDisallow: /\n'));
verifier('groupe générique bloquant annulé par un Allow',
  !robotsBloqueTout('User-agent: *\nDisallow: /\nAllow: /\n'));
verifier('agents groupés partagent leurs règles',
  robotsBloqueTout('User-agent: Bingbot\nUser-agent: *\nDisallow: /\n'));
verifier('fichier vide ne bloque rien', !robotsBloqueTout(''));
verifier('sitemap seul ne bloque rien', !robotsBloqueTout('Sitemap: https://exemple.fr/sitemap.xml\n'));

/* ══ Texte visible ═════════════════════════════════════════ */
egal('scripts et styles écartés du texte',
  texteVisible('<style>p{color:red}</style><p>Bonjour</p><script>var x=1</script>'), 'Bonjour');
egal('entités décodées dans le texte visible',
  texteVisible('<p>Tarif&nbsp;: 12&euro;</p>'), 'Tarif : 12€');

/* ══ Bilan d'ensemble ══════════════════════════════════════
   Ces constats n'existent qu'à l'échelle du site : une page seule ne peut pas
   avoir un titre en double. */
const page = (chemin: string, titre: string | null, description: string | null, h1 = 1, mots = 400) =>
  ({ chemin, statut: 200, titre, description, h1, mots });

{
  const doublons = constatsDuSite([
    page('/a', 'Pépinière du Val', 'Nos plants et arbustes'),
    page('/b', 'Pépinière du Val', 'Nos plants et arbustes'),
    page('/c', 'Nos horaires', 'Les horaires de la pépinière'),
  ]);
  verifier('titres en double repérés', doublons.some((c) => c.fait.includes('même titre')));
  verifier('descriptions en double repérées', doublons.some((c) => c.fait.includes('même description')));
}
verifier('aucun constat sur une seule page', constatsDuSite([page('/a', 'Unique', 'Seule')]).length === 0);
verifier('des titres tous différents ne produisent rien',
  !constatsDuSite([page('/a', 'Un', 'Un texte'), page('/b', 'Deux', 'Un autre texte')])
    .some((c) => c.fait.includes('même titre')));
{
  const cassees = constatsDuSite([
    page('/a', 'Un', 'Un texte'), page('/b', 'Deux', 'Un autre'),
    { chemin: '/vieux', statut: 404, titre: null, description: null, h1: 0, mots: 0 },
  ]);
  verifier('adresse morte signalée', cassees.some((c) => c.fait.includes('erreur')));
  verifier("une page en erreur n'est pas comptée comme page sans titre",
    !cassees.some((c) => c.fait.includes('aucun titre')));
}

/* ══ Garde-fous d'entrée ═══════════════════════════════════ */
egal('domaine nu complété', normaliserUrl('exemple.fr')?.href, 'https://exemple.fr/');
egal('mot sans point refusé', normaliserUrl('localhost'), null);
egal('protocole exotique refusé', normaliserUrl('ftp://exemple.fr'), null);
egal('saisie vide refusée', normaliserUrl('   '), null);

/* ══ Qualité de la CSP ═════════════════════════════════════
   'unsafe-inline' n'est un défaut que sans empreinte : une CSP qui liste des
   hashes (comme celle du site) neutralise 'unsafe-inline', et la signaler serait
   un faux positif. Or accuser à tort coûte plus cher que rater une absence. */
verifier('CSP absente : aucun défaut', !cspFaible(''));
verifier('CSP stricte : aucun défaut', !cspFaible("default-src 'self'; script-src 'self'"));
verifier("'unsafe-inline' seul : signalé", cspFaible("script-src 'self' 'unsafe-inline'"));
verifier("'unsafe-inline' + hash : non signalé (le navigateur l'ignore)",
  !cspFaible("script-src 'self' 'unsafe-inline' 'sha256-AbC123='"));
verifier("'unsafe-inline' + nonce : non signalé",
  !cspFaible("script-src 'self' 'nonce-r4nd0m' 'unsafe-inline'"));
verifier("'unsafe-eval' : signalé même avec un hash",
  cspFaible("script-src 'self' 'sha256-AbC123=' 'unsafe-eval'"));
verifier('repli sur default-src quand script-src absent',
  cspFaible("default-src 'self' 'unsafe-inline'"));
verifier("script-src strict l'emporte sur un default-src permissif",
  !cspFaible("default-src 'self' 'unsafe-inline'; script-src 'self'"));
verifier('style-src permissif seul : aucun défaut (on ne juge que les scripts)',
  !cspFaible("script-src 'self' 'sha256-AbC123='; style-src 'self' 'unsafe-inline'"));
verifier('CSP en majuscules reconnue', cspFaible("SCRIPT-SRC 'SELF' 'UNSAFE-INLINE'"));

/* ══ Sites témoins ═════════════════════════════════════════ */
if (process.argv.includes('--reseau')) {
  const attendu: [string, (a: any) => void][] = [
    ['www.feedesongles.fr', (a) => {
      /* Site de référence : note parfaite, aucun constat qui pénalise. Les
         relevés « reglage » (0 point) sont tolérés : ce site partage encore la
         CSP à 'unsafe-inline' que caelestis.fr a durcie le 07/08, d'où un relevé
         de qualité de CSP attendu jusqu'à ce que le durcissement lui soit porté. */
      const penalisants = a.constats.filter((c: any) => c.gravite !== 'reglage');
      verifier('site de référence : note parfaite et aucun constat pénalisant',
        a.note === 100 && penalisants.length === 0,
        `note ${a.note} | ${penalisants.map((c: any) => c.fait).join(' | ')}`);
    }],
    ['www.hostelquartierlibre.fr', (a) => {
      verifier('page de plus de deux mégaoctets : mentions légales reconnues',
        !a.constats.some((c: any) => c.fait.includes('mentions légales')));
      verifier('page de plus de deux mégaoctets lue en entier', a.mesures.poids > 2 * 1024 * 1024,
        `poids lu ${a.mesures.poids}`);
    }],
    ['www.fab-rique.com', (a) => {
      verifier("robots.txt d'un autre robot non imputé à Google",
        !a.constats.some((c: any) => c.fait.includes('robots.txt interdit')));
    }],
    ['www.lebonplant-rosieres.fr', (a) => {
      const c = a.constats.find((x: any) => x.fait.includes('description des résultats'));
      verifier('description avec apostrophe mesurée en entier', !c, c?.fait ?? '');
    }],
    ['www.lesamanins.com', (a) => {
      const c = a.constats.find((x: any) => x.fait.includes('serveurs extérieurs'));
      verifier('liens sortants non comptés comme serveurs appelés', !c, c?.fait ?? '');
    }],
  ];

  for (const [site, controler] of attendu) {
    const a = await analyserSite(site);
    if (a.etat !== 'ok') { echecs.push(`${site} injoignable (${a.etat}), contrôle ignoré`); continue; }
    controler(a);
  }

  /* Réponses qui ne disent rien de l'état du site : elles ne doivent produire
     aucun verdict. la-poste.fr répond 400 à un outil et 200 à un navigateur. */
  const refuse = await analyserSite('www.la-poste.fr');
  verifier("un code 400 n'est pas traité comme une page d'accueil disparue",
    refuse.etat === 'injoignable',
    `état ${refuse.etat}` + (refuse.etat === 'constat-unique' ? ` : ${refuse.constats[0].fait}` : ''));

  /* Domaine qui ne pointe nulle part : le dire, plutôt que de laisser croire
     que l'outil refuse d'examiner le site. */
  const mort = await analyserSite('www.le-potager-fleuri.com');
  verifier('domaine sans serveur nommé comme tel',
    mort.etat === 'refuse' && mort.raison.includes('ne pointe vers aucun serveur'),
    mort.etat === 'refuse' ? mort.raison : `état ${mort.etat}`);

  /* Pages internes : micheletaugustin.com nomme ses mentions légales
     « Nos garanties très légales » et les place une page plus loin. */
  const interne = await analyserSite('www.micheletaugustin.com');
  if (interne.etat === 'ok') {
    verifier('pages internes réellement ouvertes', (interne.mesures.pagesLues ?? 1) > 1,
      `${interne.mesures.pagesLues ?? 1} page(s)`);
    verifier('mentions légales trouvées sur une page interne',
      !interne.constats.some((c) => c.fait.includes('mentions légales')));
  } else {
    echecs.push(`micheletaugustin.com injoignable (${interne.etat})`);
  }

  /* Un renvoi vers une page légale pour consulter des horaires ou des prix
     n'aide personne : ces pages en contiennent toujours par obligation. */
  const renvoisDouteux: string[] = [];
  for (const site of ['www.jacopain.fr', 'www.lasavonneriedeladrome.fr', 'escalin.com']) {
    const a = await analyserSite(site);
    if (a.etat !== 'ok') continue;
    for (const c of a.constats) {
      const page = c.fait.match(/(?:sur|jusqu'à|ouvrir) (\/[^\s.]*)/)?.[1];
      if (page && /mention|legal|cgv|cgu|confidentialit|privacy|rgpd|cookie/i.test(page)) {
        renvoisDouteux.push(`${site} → ${c.fait}`);
      }
    }
  }
  verifier('aucun renvoi vers une page légale pour un point de conversion',
    renvoisDouteux.length === 0, renvoisDouteux.join(' | '));

  /* Parcours du site. escalin.com déclare ses pages sans barre finale : elles
     répondent toutes par une redirection, et ne pas la suivre revenait à ne
     rien lire du tout. */
  const depart = await analyserSite('escalin.com');
  if (depart.etat === 'ok') {
    verifier('le reste du site est annoncé au navigateur', (depart.aExplorer?.length ?? 0) > 5,
      `${depart.aExplorer?.length ?? 0} adresse(s)`);
    verifier("les pages lues d'emblée sont relevées", (depart.relevees?.length ?? 0) > 0);

    const paquet = (depart.aExplorer ?? []).filter((c) => !c.startsWith('plan:')).slice(0, PAGES_PAR_PAQUET);
    const parcours = await parcourirPages('escalin.com', paquet);
    if (parcours.etat === 'ok') {
      const lues = parcours.pages.filter((p) => p.statut === 200);
      verifier('redirections suivies pendant le parcours', lues.length >= paquet.length - 1,
        `${lues.length} lue(s) sur ${paquet.length} demandée(s)`);
      verifier('relevé exploitable', lues.every((p) => typeof p.h1 === 'number' && typeof p.mots === 'number'));
    } else {
      echecs.push(`parcours d'escalin.com refusé : ${parcours.raison}`);
    }

    /* Une adresse d'un autre domaine ne doit jamais être suivie : sans ce
       verrou, l'outil deviendrait un moyen de frapper n'importe quel serveur. */
    const intrus = await parcourirPages('escalin.com', ['https://example.com/', '//example.org/x']);
    verifier('adresse hors du domaine analysé écartée',
      intrus.etat === 'ok' && intrus.pages.length === 0,
      intrus.etat === 'ok' ? `${intrus.pages.length} page(s) lue(s)` : intrus.raison);
  } else {
    echecs.push(`escalin.com injoignable (${depart.etat})`);
  }
}

console.log(`\n${reussis} contrôle(s) réussi(s), ${echecs.length} échec(s).`);
for (const e of echecs) console.log('  ÉCHEC : ' + e);
process.exit(echecs.length ? 1 : 0);

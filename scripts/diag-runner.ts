import { analyserSite } from '../src/utils/analyse-site.ts';

const cibles = process.argv.slice(2);
if (cibles.length === 0) {
  cibles.push('caelestis.fr', 'lacoquette-bycaro.fr', 'www.feedesongles.fr');
}

for (const cible of cibles) {
  const a = await analyserSite(cible);
  console.log('\n══════════════════════════════════════════════');
  console.log('SITE :', cible, '→ état :', a.etat);
  if (a.etat === 'ok') {
    console.log('NOTE GLOBALE :', a.note, '—', a.verdict);
    console.log('FAMILLES :');
    for (const f of a.familles) {
      const flag = f.note >= 99 ? 'OK ' : '!! ';
      console.log(`  ${flag}${f.libelle.padEnd(16)} ${String(f.note).padStart(3)}/100  (${f.points} constat(s), ${f.bloquants} bloquant(s))`);
    }
    console.log('MESURES :', JSON.stringify(a.mesures));
    if (a.constats.length) {
      console.log('CONSTATS :');
      for (const c of a.constats) {
        console.log(`  [${c.famille}/${c.gravite}] ${c.fait}`);
      }
    } else {
      console.log('AUCUN CONSTAT — 100/100.');
    }
  } else if (a.etat === 'constat-unique') {
    console.log('CONSTAT UNIQUE :', JSON.stringify(a.constats[0]));
  } else if (a.etat === 'injoignable') {
    console.log('INJOIGNABLE :', a.raison);
  } else {
    console.log('REFUSÉ :', a.raison);
  }
}

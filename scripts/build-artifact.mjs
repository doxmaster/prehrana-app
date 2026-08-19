/**
 * Slaže cijelu aplikaciju u JEDNU HTML datoteku.
 *
 * Čemu: Claude artefakt (i svaki drugi način dijeljenja jednom datotekom)
 * poslužuje samo jednu stranicu bez ijednog dodatnog zahtjeva — nema /assets/,
 * nema mrežnog poziva. Vite izbaci JS, CSS i slike odvojeno, pa se ovdje sve
 * to uvuče unutra: slike kao data-URI, stil u <style>, kod u <script>.
 *
 * Izlaz namjerno NEMA <html>, <head> i <body>: artefakt sam omata sadržaj u
 * kostur, pa bi ih dupliciranje razbilo. Zato se piše samo ono što ide unutra.
 *
 * Pokretanje: npm run build && node scripts/build-artifact.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(root, 'dist')
const IZLAZ = resolve(DIST, 'prehrana-artefakt.html')

function jedina(uzorak) {
  const nadeno = readdirSync(resolve(DIST, 'assets')).filter((f) => uzorak.test(f))
  if (nadeno.length !== 1) {
    throw new Error(`Ocekivana tocno jedna datoteka za ${uzorak}, nadeno ${nadeno.length}`)
  }
  return nadeno[0]
}

/** Slika kao data-URI; base64 je siguran za SVG s navodnicima i #. */
function dataUri(naziv) {
  const bytes = readFileSync(resolve(DIST, 'assets', naziv))
  return `data:image/svg+xml;base64,${bytes.toString('base64')}`
}

/**
 * Zamjenjuje sve /assets/*.svg putanje ugradenom slikom.
 *
 * Ista funkcija radi i za CSS i za JS jer je putanja u oba slucaja obican
 * niz znakova; razlikuje se samo je li pisana s vodecom kosom crtom.
 */
function ugradiSlike(tekst) {
  const svg = readdirSync(resolve(DIST, 'assets')).filter((f) => f.endsWith('.svg'))
  let out = tekst
  let zamijenjeno = 0
  for (const naziv of svg) {
    const uri = dataUri(naziv)
    for (const putanja of [`/assets/${naziv}`, `assets/${naziv}`, `./assets/${naziv}`]) {
      while (out.includes(putanja)) {
        out = out.replace(putanja, uri)
        zamijenjeno++
      }
    }
  }
  return { out, zamijenjeno }
}

const jsNaziv = jedina(/^index-.*\.js$/)
const cssNaziv = jedina(/^index-.*\.css$/)

const css = ugradiSlike(readFileSync(resolve(DIST, 'assets', cssNaziv), 'utf8'))
const js = ugradiSlike(readFileSync(resolve(DIST, 'assets', jsNaziv), 'utf8'))

/*
 * Niz "</script" u kodu prekinuo bi <script> blok i ostatak bi zavrsio kao
 * tekst na stranici. Escape je bezopasan: parser ga vraca u izvorni oblik.
 */
const sigurniJs = js.out.replaceAll('</script', '<\\/script')

/*
 * Viewport ide uz sadrzaj jer kostur oko artefakta nije nas: bez njega je
 * aplikacija na mobitelu prikazana kao stolna stranica, umanjena.
 */
const html = `<title>Prehrana</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="Planiranje prehrane i praćenje hranjivih tvari" />
<style>
${css.out}
</style>
<div id="root"></div>
<script type="module">
${sigurniJs}
</script>
`

writeFileSync(IZLAZ, html, 'utf8')

const kb = (n) => `${(n / 1024).toFixed(0)} kB`
console.log(`Složeno: ${IZLAZ}`)
console.log(`  ukupno   ${kb(html.length)}`)
console.log(`  stil     ${kb(css.out.length)} (${css.zamijenjeno} slika ugrađeno)`)
console.log(`  kod      ${kb(js.out.length)} (${js.zamijenjeno} slika ugrađeno)`)

/* Ostatak /assets/ u izlazu znaci da bi stranica ipak trazila datoteku. */
const ostatak = html.match(/["'(]\/?(?:\.\/)?assets\/[^"')]+/g)
if (ostatak) {
  console.error(`\nUPOZORENJE: ostale su vanjske putanje, stranica nije samostalna:`)
  for (const p of [...new Set(ostatak)]) console.error(`  ${p}`)
  process.exitCode = 1
}

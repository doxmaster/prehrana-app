/**
 * Dohvaca pakirane proizvode iz Open Food Factsa i racuna MEDIJAN vrijednosti
 * po pojmu, umjesto da uzima jedan proizvod.
 *
 * OFF je korisnicki unos: pojedinacni zapisi znaju biti pogresni za red velicine
 * (npr. kalorije upisane po pakiranju umjesto na 100 g). Medijan preko vise
 * proizvoda te promasaje odbacuje, a kvartilni raspon pokazuje koliko je pojam
 * uopce pouzdan.
 *
 * Ne treba API kljuc. Rezultat: scripts/off-values.json + reports/off-izvjestaj.md
 * Pokretanje: node scripts/off-fetch.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MAP_PATH = resolve(root, 'scripts/off-map.json')
const OUT_PATH = resolve(root, 'scripts/off-values.json')
const REPORT_PATH = resolve(root, 'reports/off-izvjestaj.md')

/** OFF drzi minerale u gramima; nase jedinice su mg odnosno µg. */
const FIELDS = [
  { key: 'kcal', off: 'energy-kcal_100g', factor: 1 },
  { key: 'p', off: 'proteins_100g', factor: 1 },
  { key: 'c', off: 'carbohydrates_100g', factor: 1 },
  { key: 'f', off: 'fat_100g', factor: 1 },
  { key: 'fib', off: 'fiber_100g', factor: 1 },
  { key: 'fe', off: 'iron_100g', factor: 1000 },
  { key: 'ca', off: 'calcium_100g', factor: 1000 },
  { key: 'mg', off: 'magnesium_100g', factor: 1000 },
  { key: 'vc', off: 'vitamin-c_100g', factor: 1000 },
  { key: 'vd', off: 'vitamin-d_100g', factor: 1e6 },
]

const REQUIRED = ['kcal', 'p', 'c', 'f']
const MIN_SAMPLES = 3

/**
 * Najveci dopusteni medukvartilni raspon kalorija, u postocima medijana.
 *
 * Medijan sam po sebi nije dovoljan: OFF kategorije znaju biti preduboke, pa
 * "sauerkraut" osim kiselog kupusa (19 kcal) sadrzi i gotova jela s kobasicom.
 * Takav pojam dao je medijan od 87 kcal uz raspon od 109 % — vrijednost bez
 * znacenja. Kad se proizvodi medusobno ne slazu, pojam se odbacuje.
 */
const MAX_SPREAD = 35
const USER_AGENT = 'Prehrana/3.0 (osobna aplikacija za pracenje prehrane)'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function quartiles(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
  return { q1: q(0.25), q3: q(0.75) }
}

/**
 * Atwater s vlaknima po 2 kcal/g. Tolerancija mora biti ISTA kao
 * ATWATER_TOLERANCE u src/domain/nutrients.ts — inace ovdje prode vrijednost
 * koju aplikacija poslije oznaci kao nekonzistentnu.
 */
const ATWATER_TOLERANCE = 0.15

function atwaterOk(v) {
  const net = Math.max(0, (v.c ?? 0) - (v.fib ?? 0))
  const computed = 4 * (v.p ?? 0) + 4 * net + 2 * (v.fib ?? 0) + 9 * (v.f ?? 0)
  const base = Math.max(v.kcal ?? 0, computed)
  if (base < 20) return true
  return Math.abs((v.kcal ?? 0) - computed) / base <= ATWATER_TOLERANCE
}

/**
 * Dohvat po KATEGORIJI, ne po slobodnom tekstu: `search_terms` u v2 tiho vraca
 * nasumicne proizvode iz cijele baze, a cjelotekstualni endpoint (cgi/search.pl)
 * dosljedno odgovara s 503. Kategorije su kontrolirani rjecnik i rade pouzdano.
 */
async function fetchCategory(tag) {
  const url = new URL('https://world.openfoodfacts.org/api/v2/search')
  url.searchParams.set('categories_tags_en', tag)
  url.searchParams.set('fields', ['product_name', 'code', 'countries_tags', 'nutriments'].join(','))
  url.searchParams.set('page_size', '50')

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (res.ok) {
      const data = await res.json()
      return data.products ?? []
    }
    if (res.status === 503 || res.status === 429) {
      await sleep(15000 * (attempt + 1))
      continue
    }
    throw new Error(`OFF ${res.status}`)
  }
  throw new Error('OFF ne odgovara nakon 3 pokusaja (503)')
}

/** Izvlaci vrijednosti jednog proizvoda ili null ako ne zadovoljava minimum. */
function extract(product) {
  const n = product.nutriments ?? {}
  const values = {}
  for (const f of FIELDS) {
    const raw = n[f.off]
    if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) values[f.key] = raw * f.factor
  }
  if (!REQUIRED.every((k) => typeof values[k] === 'number')) return null
  if (values.kcal > 900 || values.p > 100 || values.c > 100 || values.f > 100) return null
  if (!atwaterOk(values)) return null
  return values
}

const map = JSON.parse(readFileSync(MAP_PATH, 'utf8'))
const results = {}
const rows = []

for (const entry of map.products) {
  try {
    const products = await fetchCategory(entry.tag)
    const samples = []
    for (const p of products) {
      const values = extract(p)
      if (values) samples.push({ values, name: p.product_name ?? '', code: p.code })
    }

    if (samples.length < MIN_SAMPLES) {
      rows.push({ ...entry, status: 'premalo uzoraka', count: samples.length })
      continue
    }

    const merged = {}
    const spread = {}
    for (const f of FIELDS) {
      const vals = samples.map((s) => s.values[f.key]).filter((v) => typeof v === 'number')
      if (vals.length < MIN_SAMPLES) continue
      merged[f.key] = Math.round(median(vals) * 100) / 100
      const { q1, q3 } = quartiles(vals)
      const mid = merged[f.key]
      spread[f.key] = mid > 0 ? Math.round(((q3 - q1) / mid) * 100) : 0
    }

    // Ako medijan sam po sebi ne prolazi Atwatera, pojam je presarolik za bazu.
    if (!atwaterOk(merged)) {
      rows.push({ ...entry, status: 'nekonzistentno', count: samples.length })
      continue
    }

    if ((spread.kcal ?? 0) > MAX_SPREAD) {
      rows.push({
        ...entry,
        status: 'preširok raspon',
        count: samples.length,
        kcal: merged.kcal,
        spread: spread.kcal,
      })
      continue
    }

    results[entry.name] = {
      cat: entry.cat,
      serv: entry.serv,
      values: merged,
      samples: samples.length,
      spread,
    }
    rows.push({ ...entry, status: 'ok', count: samples.length, kcal: merged.kcal, spread: spread.kcal })
    process.stdout.write(`\r ${Object.keys(results).length} proizvoda prihvaceno   `)
    await sleep(7000) // OFF ogranicava pretragu na ~10 zahtjeva u minuti
  } catch (err) {
    rows.push({ ...entry, status: 'greska', note: err.message })
  }
}

writeFileSync(OUT_PATH, JSON.stringify(results, null, 2) + '\n', 'utf8')

const ok = rows.filter((r) => r.status === 'ok')
const rejected = rows.filter((r) => r.status !== 'ok')

let md = `# Pakirani proizvodi iz Open Food Factsa\n\n`
md += `Prihvaceno: ${ok.length} · odbaceno: ${rejected.length}\n\n`
md += `Vrijednost je **medijan** preko najmanje ${MIN_SAMPLES} proizvoda, ne jedan zapis. `
md += `Stupac "raspon" je medukvartilni raspon kalorija u postocima medijana — velik broj znaci `
md += `da se proizvodi pod tim pojmom jako razlikuju, pa vrijednost treba shvatiti kao okvirnu.\n\n`

md += `## Prihvaceno\n\n| Proizvod | Kategorija | kcal/100 g | Uzoraka | Raspon |\n|---|---|---:|---:|---:|\n`
for (const r of ok) {
  md += `| ${r.name} | ${r.cat} | ${r.kcal} | ${r.count} | ${r.spread} % |\n`
}

md += `\n## Odbaceno\n\n`
for (const r of rejected) {
  md += `- **${r.name}** — ${r.status}${r.count !== undefined ? ` (${r.count} uzoraka)` : ''}${r.note ? `: ${r.note}` : ''}\n`
}

mkdirSync(dirname(REPORT_PATH), { recursive: true })
writeFileSync(REPORT_PATH, md, 'utf8')

console.log(`\n\nPrihvaceno ${ok.length}, odbaceno ${rejected.length}`)
console.log(`Izvjestaj: reports/off-izvjestaj.md`)

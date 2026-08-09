/**
 * Usporeduje ugradenu bazu namirnica s USDA FoodData Central.
 *
 * Ne mijenja nista sam od sebe: zapisuje izvjestaj odstupanja u
 * reports/usda-izvjestaj.md i provjerene vrijednosti u scripts/usda-values.json.
 * Tek `node scripts/generate-foods.mjs` te vrijednosti ugraduje u src/data/foods.ts.
 *
 * Pokretanje:  node --env-file=.env scripts/usda-verify.mjs
 *              node --env-file=.env scripts/usda-verify.mjs b0 b13   (samo odabrane)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MAP_PATH = resolve(root, 'scripts/usda-map.json')
const VALUES_PATH = resolve(root, 'scripts/usda-values.json')
const REPORT_PATH = resolve(root, 'reports/usda-izvjestaj.md')

const API_KEY = process.env.USDA_API_KEY
if (!API_KEY) {
  console.error('Nedostaje USDA_API_KEY. Pokreni s: node --env-file=.env scripts/usda-verify.mjs')
  process.exit(1)
}

/**
 * USDA vraca nutrijente na dva nacina:
 *  - format=abridged: polje `number` s NDB brojem ("208" = energija)
 *  - format=full:     ugnijezdeno `nutrient.id` ("1008" = energija)
 * Podrzana su oba jer se tiho razlikuju, a kriva pretpostavka daje same nule.
 */
const BY_NUMBER = {
  208: 'kcal', // Energy (kcal)
  203: 'p', // Protein
  205: 'c', // Carbohydrate, by difference
  204: 'f', // Total lipid (fat)
  291: 'fib', // Fiber, total dietary
  303: 'fe', // Iron, Fe
  301: 'ca', // Calcium, Ca
  304: 'mg', // Magnesium, Mg
  401: 'vc', // Vitamin C
  328: 'vd', // Vitamin D (D2 + D3), µg
}
const BY_ID = {
  1008: 'kcal',
  1003: 'p',
  1005: 'c',
  1004: 'f',
  1079: 'fib',
  1089: 'fe',
  1087: 'ca',
  1090: 'mg',
  1162: 'vc',
  1114: 'vd',
}

/**
 * Foundation unosi cesto nemaju klasicnu energiju (208), nego samo racunatu po
 * Atwaterovim faktorima. Bez ovoga kruh i jogurt ispadnu 0 kcal.
 */
const ENERGY_FALLBACK_NUMBERS = [957, 958] // Atwater General / Specific
const ENERGY_FALLBACK_IDS = [2047, 2048]

const KEYS = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'mg', 'vc', 'vd']

/* ---------- trenutne vrijednosti iz generirane datoteke ---------- */

function readCurrentFoods() {
  const src = readFileSync(resolve(root, 'src/data/foods.ts'), 'utf8')
  const out = new Map()
  const rowRe = /\{ id: '([^']+)', name: '((?:[^'\\]|\\.)*)', cat: '([^']+)',([^}]+)\}/g
  for (const m of src.matchAll(rowRe)) {
    const values = {}
    for (const pair of m[4].matchAll(/(\w+): (-?[\d.]+)/g)) values[pair[1]] = Number(pair[2])
    out.set(m[1], { id: m[1], name: m[2].replace(/\\'/g, "'"), cat: m[3], ...values })
  }
  return out
}

/* ---------- USDA ---------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function usda(path, params) {
  const url = new URL(`https://api.nal.usda.gov/fdc/v1/${path}`)
  url.searchParams.set('api_key', API_KEY)
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v)

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res.json()
    if (res.status === 429) {
      await sleep(2000 * (attempt + 1))
      continue
    }
    throw new Error(`USDA ${res.status} za ${path}`)
  }
  throw new Error(`USDA ne odgovara nakon 3 pokusaja: ${path}`)
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Provjera na razini rijeci, ne podniza — inace "milk" pogada "milkfat",
 * pa se mlijeko poklopi sa svjezim sirom.
 */
function hasTerm(description, term) {
  return new RegExp(`(?<![a-z0-9])${escapeRe(term)}(?![a-z])`, 'i').test(description)
}

/**
 * Bira najbolji pogodak: opis mora sadrzavati sve rijeci iz `must`, ne smije
 * sadrzavati nijednu iz `avoid`, a Foundation podaci imaju prednost pred SR Legacy.
 */
function pickBest(candidates, entry, avoidGlobal) {
  const must = (entry.must ?? []).map((s) => s.toLowerCase())
  const avoid = [...(entry.avoid ?? []), ...avoidGlobal].map((s) => s.toLowerCase())

  const scored = []
  for (const food of candidates) {
    const desc = (food.description ?? '').toLowerCase()
    if (avoid.some((w) => hasTerm(desc, w))) continue
    if (!must.every((w) => hasTerm(desc, w))) continue
    let score = 0
    if (food.dataType === 'Foundation') score += 10
    else if (food.dataType === 'SR Legacy') score += 8
    score -= desc.split(',').length // kraci, generickiji opisi su bolji
    scored.push({ food, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.food ?? null
}

/**
 * Vraca samo one tvari koje USDA stvarno navodi. Tvar koja nedostaje ostaje
 * nedefinirana — NE nula. Razlika je bitna: skusa nema izmjeren vitamin D u
 * SR Legacy zapisu, a tretiranje toga kao nule obrisalo bi ispravnu vrijednost.
 */
function extractNutrients(detail) {
  const values = {}
  const energyCandidates = []

  for (const n of detail.foodNutrients ?? []) {
    const number = Number(n.number ?? n.nutrient?.number)
    const id = Number(n.nutrient?.id ?? n.nutrientId)
    const amount = Number(n.amount ?? n.value ?? n.nutrient?.amount)
    if (!Number.isFinite(amount)) continue

    if (ENERGY_FALLBACK_NUMBERS.includes(number) || ENERGY_FALLBACK_IDS.includes(id)) {
      energyCandidates.push(amount)
      continue
    }
    const key = BY_NUMBER[number] ?? BY_ID[id]
    if (key !== undefined) values[key] = amount
  }

  if (values.kcal === undefined && energyCandidates.length) values.kcal = energyCandidates[0]

  if (Object.keys(values).length === 0) {
    throw new Error('nijedan poznati nutrijent u odgovoru — provjeri format API-ja')
  }
  return values
}

/* ---------- glavni tijek ---------- */

const map = JSON.parse(readFileSync(MAP_PATH, 'utf8'))
const current = readCurrentFoods()
const only = process.argv.slice(2).filter((a) => /^b\d+$/.test(a))
const entries = map.foods.filter((e) => (only.length ? only.includes(e.id) : true))

// Kod djelomicnog pokretanja (npr. samo b0 b13) ranije provjerene vrijednosti
// moraju ostati — inace bi ih zapis pregazio.
let results = {}
try {
  results = JSON.parse(readFileSync(VALUES_PATH, 'utf8'))
} catch {
  results = {}
}
const rows = []
const problems = []
let checked = 0

for (const entry of entries) {
  const food = current.get(entry.id)
  if (!food) {
    problems.push(`${entry.id}: nema u src/data/foods.ts`)
    continue
  }
  if (entry.skip) {
    rows.push({ id: entry.id, name: food.name, status: 'preskoceno', note: entry.skip })
    continue
  }

  try {
    let fdcId = entry.fdcId
    let description = entry.description

    if (!fdcId) {
      const search = await usda('foods/search', {
        query: entry.query,
        dataType: 'Foundation,SR Legacy',
        pageSize: '25',
      })
      const best = pickBest(search.foods ?? [], entry, map._avoidGlobal ?? [])
      if (!best) {
        rows.push({ id: entry.id, name: food.name, status: 'bez pogotka', note: entry.query })
        problems.push(`${entry.id} (${food.name}): nijedan rezultat ne zadovoljava must/avoid`)
        continue
      }
      fdcId = best.fdcId
      description = best.description
      entry.fdcId = fdcId
      entry.description = description
    }

    const detail = await usda(`food/${fdcId}`, { format: 'abridged' })
    const usdaValues = extractNutrients(detail)

    const diffs = []
    const unmeasured = []
    for (const k of KEYS) {
      const newV = usdaValues[k]
      if (newV === undefined) {
        if ((food[k] ?? 0) > 0) unmeasured.push(k)
        continue
      }
      const oldV = food[k] ?? 0
      const base = Math.max(Math.abs(oldV), Math.abs(newV))
      if (base < 0.5) continue
      const dev = Math.abs(newV - oldV) / base
      if (dev >= 0.2) diffs.push({ k, oldV, newV, dev })
    }

    results[entry.id] = { fdcId, description, values: usdaValues }
    rows.push({
      id: entry.id,
      name: food.name,
      status: diffs.length ? 'odstupa' : 'poklapa se',
      fdcId,
      description,
      diffs,
      unmeasured,
    })
    checked++
    process.stdout.write(`\r Provjereno ${checked}/${entries.filter((e) => !e.skip).length}   `)
    await sleep(120)
  } catch (err) {
    problems.push(`${entry.id} (${food.name}): ${err.message}`)
    rows.push({ id: entry.id, name: food.name, status: 'greska', note: err.message })
  }
}

/* ---------- zapis ---------- */

writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + '\n', 'utf8')
writeFileSync(VALUES_PATH, JSON.stringify(results, null, 2) + '\n', 'utf8')

const fmt = (v) => (Math.round(v * 100) / 100).toString()
const deviating = rows.filter((r) => r.status === 'odstupa')
const matching = rows.filter((r) => r.status === 'poklapa se')

let md = `# Usporedba baze namirnica s USDA FoodData Central\n\n`
md += `Provjereno: ${checked} namirnica · poklapa se: ${matching.length} · odstupa: ${deviating.length} · preskoceno: ${rows.filter((r) => r.status === 'preskoceno').length}\n\n`
md += `Prag prijave je 20 % razlike. Vrijednosti su na 100 g.\n\n`

md += `## Namirnice s odstupanjem\n\n`
for (const r of deviating) {
  md += `### ${r.name} (\`${r.id}\`)\n\n`
  md += `USDA: ${r.description} — fdcId ${r.fdcId}\n\n`
  md += `| Tvar | Sada | USDA | Razlika |\n|---|---:|---:|---:|\n`
  for (const d of r.diffs) {
    md += `| ${d.k} | ${fmt(d.oldV)} | ${fmt(d.newV)} | ${Math.round(d.dev * 100)} % |\n`
  }
  if (r.unmeasured?.length) {
    md += `\nUSDA ne navodi: ${r.unmeasured.join(', ')} — postojeca vrijednost se zadrzava.\n`
  }
  md += `\n`
}

md += `## Namirnice koje se poklapaju\n\n`
for (const r of matching) md += `- **${r.name}** (\`${r.id}\`) — ${r.description}\n`

md += `\n## Preskoceno\n\n`
for (const r of rows.filter((x) => x.status === 'preskoceno')) md += `- **${r.name}** — ${r.note}\n`

if (problems.length) {
  md += `\n## Zahtijeva rucni pregled\n\n`
  for (const p of problems) md += `- ${p}\n`
}

mkdirSync(dirname(REPORT_PATH), { recursive: true })
writeFileSync(REPORT_PATH, md, 'utf8')

console.log(`\n\nIzvjestaj: reports/usda-izvjestaj.md`)
console.log(`Poklapa se: ${matching.length} · Odstupa: ${deviating.length} · Problema: ${problems.length}`)

/**
 * Pretvara scripts/off-values.json u src/data/offFoods.ts.
 *
 * Primjenjuje isti prag raspona kao off-fetch.mjs, pa ako je datoteka nastala
 * prije uvodenja praga, ovdje se svejedno odbace pojmovi kod kojih se proizvodi
 * medusobno ne slazu.
 *
 * Pokretanje: node scripts/generate-off-foods.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VALUES = resolve(root, 'scripts/off-values.json')
const OUT = resolve(root, 'src/data/offFoods.ts')
const VERIFIED_AT = process.env.VERIFIED_AT ?? new Date().toISOString().slice(0, 10)
const MAX_SPREAD = 35

const ORDER = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'mg', 'vc', 'vd']
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

let values
try {
  values = JSON.parse(readFileSync(VALUES, 'utf8'))
} catch {
  console.error('Nedostaje scripts/off-values.json — prvo pokreni node scripts/off-fetch.mjs')
  process.exit(1)
}

/** Ista formula i tolerancija kao atwaterDeviation() u src/domain/nutrients.ts. */
function atwaterDeviation(v) {
  const net = Math.max(0, (v.c ?? 0) - (v.fib ?? 0))
  const computed = 4 * (v.p ?? 0) + 4 * net + 2 * (v.fib ?? 0) + 9 * (v.f ?? 0)
  const base = Math.max(v.kcal ?? 0, computed)
  if (base < 20) return 0
  return Math.abs((v.kcal ?? 0) - computed) / base
}

const kept = []
const dropped = []

for (const [name, entry] of Object.entries(values)) {
  const spread = entry.spread?.kcal ?? 0
  if (spread > MAX_SPREAD) {
    dropped.push({ name, spread, kcal: entry.values.kcal, razlog: `raspon ${spread} %` })
    continue
  }

  const deviation = atwaterDeviation(entry.values)
  if (deviation > 0.15) {
    dropped.push({
      name,
      spread,
      kcal: entry.values.kcal,
      razlog: `kalorije ne odgovaraju makronutrijentima (${Math.round(deviation * 100)} %)`,
    })
    continue
  }
  const food = {
    id: `off:${name.toLowerCase().replace(/[^a-zà-ž0-9]+/gi, '-').replace(/^-|-$/g, '')}`,
    name,
    cat: entry.cat,
    serv: entry.serv,
    samples: entry.samples,
  }
  for (const key of ORDER) food[key] = Math.round((entry.values[key] ?? 0) * 100) / 100
  kept.push(food)
}

kept.sort((a, b) => a.name.localeCompare(b.name, 'hr'))

const line = (f) =>
  `  { id: ${q(f.id)}, name: ${q(f.name)}, cat: ${q(f.cat)}, ` +
  ORDER.map((k) => `${k}: ${f[k]}`).join(', ') +
  `, serv: ${f.serv}, source: 'off', sourceId: ${q(`${f.samples} proizvoda`)}, verifiedAt: ${q(VERIFIED_AT)}, base: true },`

const out = `/**
 * GENERIRANO — ne uređivati ručno.
 * Izvor: Open Food Facts, generator: scripts/generate-off-foods.mjs
 *
 * Ovo su PAKIRANI proizvodi. Vrijednost je medijan preko više proizvoda iste
 * kategorije, pa je tržišni prosjek, a ne analiza konkretnog artikla. Za točne
 * vrijednosti proizvoda koji stvarno kupuješ koristi barkod skener.
 *
 * Uvršteni su samo pojmovi kod kojih se proizvodi međusobno slažu
 * (međukvartilni raspon kalorija do ${MAX_SPREAD} %).
 */
import type { Food } from '../domain/types'

export const OFF_FOODS: Food[] = [
${kept.map(line).join('\n')}
]
`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, out, 'utf8')

console.log(`Zapisano ${kept.length} proizvoda u src/data/offFoods.ts`)
if (dropped.length) {
  console.log(`\nOdbaceno:`)
  for (const d of dropped) console.log(`  ${d.name}: medijan ${d.kcal} kcal — ${d.razlog}`)
}

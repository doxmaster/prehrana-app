/**
 * Izvlači ugrađenu bazu namirnica iz legacy/index.html i zapisuje je kao
 * tipizirani src/data/foods.ts.
 *
 * Identifikatori ('b0', 'b1', ...) MORAJU ostati vezani uz redoslijed iz stare
 * datoteke — postojeći dnevnici korisnika pokazuju upravo na njih.
 *
 * Pokretanje:  node scripts/generate-foods.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LEGACY = resolve(root, 'legacy/index.html')
const OUT = resolve(root, 'src/data/foods.ts')
const USDA_VALUES = resolve(root, 'scripts/usda-values.json')
const USDA_MAP = resolve(root, 'scripts/usda-map.json')
/** Datum provjere; predaje se izvana da bi generiranje bilo ponovljivo. */
const VERIFIED_AT = process.env.VERIFIED_AT ?? new Date().toISOString().slice(0, 10)

const readJson = (path, fallback) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

const html = readFileSync(LEGACY, 'utf8')
const start = html.indexOf('const BASE_FOODS=[')
if (start < 0) throw new Error('BASE_FOODS nije pronađen u legacy/index.html')
const open = html.indexOf('[', start)
const close = html.indexOf('];', open)
if (close < 0) throw new Error('Kraj BASE_FOODS niza nije pronađen')

const literal = html
  .slice(open, close + 1)
  .replace(/,\s*\]$/, ']') // zadnji zarez nije valjan JSON
const rows = JSON.parse(literal)

// Redoslijed polja u starom nizu: [naziv, kategorija, kcal, p, c, f, fib, fe, ca, vc, vd, mg, (serv)]
const FIELDS = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'vc', 'vd', 'mg']

const foods = rows.map((row, i) => {
  const [name, cat, ...rest] = row
  const food = { id: `b${i}`, name, cat }
  FIELDS.forEach((key, j) => {
    food[key] = typeof rest[j] === 'number' ? rest[j] : 0
  })
  food.serv = typeof rest[10] === 'number' ? rest[10] : 100
  return food
})

/* ---------- primjena vrijednosti provjerenih prema USDA ---------- */

const usdaValues = readJson(USDA_VALUES, {})
const usdaMap = readJson(USDA_MAP, { foods: [] })
const mapById = new Map(usdaMap.foods.map((e) => [e.id, e]))

const applied = []
const reportOnly = []

for (const food of foods) {
  const verified = usdaValues[food.id]
  const entry = mapById.get(food.id)
  if (!verified) continue

  if (entry?.reportOnly) {
    reportOnly.push({ name: food.name, note: entry.note })
    continue
  }

  // Prepisuju se SAMO tvari koje USDA stvarno navodi. Nemjerena tvar nije nula.
  const changed = []
  for (const [key, value] of Object.entries(verified.values)) {
    if (!FIELDS.includes(key) || typeof value !== 'number') continue
    if (food[key] !== value) changed.push(key)
    food[key] = Math.round(value * 1000) / 1000
  }
  food.source = 'usda'
  food.sourceId = String(verified.fdcId)
  food.verifiedAt = VERIFIED_AT
  applied.push({ name: food.name, changed: changed.length })
}

// Atwaterova provjera — mora ostati usklađena s atwaterDeviation() u src/domain/nutrients.ts
const isAlcoholic = (name, cat) =>
  cat === 'Pića' && /pivo|vino|rakij|liker|viski|votk|\bgin\b|žesti|šampanj|prošek/i.test(name)

const suspicious = []
for (const f of foods) {
  if (isAlcoholic(f.name, f.cat)) continue
  const netCarbs = Math.max(0, f.c - f.fib)
  const computed = 4 * f.p + 4 * netCarbs + 2 * f.fib + 9 * f.f
  const base = Math.max(f.kcal, computed)
  if (base < 20) continue
  const dev = Math.abs(f.kcal - computed) / base
  if (dev > 0.15) suspicious.push({ name: f.name, kcal: f.kcal, computed: Math.round(computed), dev })
}

const ORDER = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'mg', 'vc', 'vd']
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const line = (f) => {
  const source = f.source ?? 'user'
  const extra =
    source === 'usda' ? `, sourceId: ${q(f.sourceId)}, verifiedAt: ${q(f.verifiedAt)}` : ''
  return (
    `  { id: ${q(f.id)}, name: ${q(f.name)}, cat: ${q(f.cat)}, ` +
    ORDER.map((k) => `${k}: ${f[k]}`).join(', ') +
    `, serv: ${f.serv}, source: ${q(source)}${extra}, base: true },`
  )
}

const out = `/**
 * GENERIRANO — ne uređivati ručno.
 * Izvor: legacy/index.html, generator: scripts/generate-foods.mjs
 *
 * Vrijednosti su na 100 g (100 ml za pića). \`serv\` je uobičajena porcija.
 * \`source: 'user'\` znači ručno unesen prosjek koji još nije provjeren prema
 * vanjskoj bazi; provjerene namirnice dobivaju 'usda' ili 'off' i \`verifiedAt\`.
 */
import type { Food } from '../domain/types'

export const BASE_FOODS: Food[] = [
${foods.map(line).join('\n')}
]
`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, out, 'utf8')

console.log(`Zapisano ${foods.length} namirnica u src/data/foods.ts`)
console.log(`Provjereno prema USDA: ${applied.length} · zadrzano rucno: ${foods.length - applied.length}`)
if (reportOnly.length) {
  console.log(`\nNamjerno zadrzane nase vrijednosti (USDA je samo priblizan):`)
  for (const r of reportOnly) console.log(`  ${r.name} — ${r.note}`)
}
if (suspicious.length) {
  console.log(`\nAtwaterova provjera — ${suspicious.length} namirnica za pregled:`)
  for (const s of suspicious) {
    console.log(
      `  ${s.name}: navedeno ${s.kcal} kcal, iz makronutrijenata ${s.computed} kcal (${Math.round(s.dev * 100)}%)`,
    )
  }
} else {
  console.log('Atwaterova provjera: sve namirnice unutar tolerancije.')
}

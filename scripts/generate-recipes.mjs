/**
 * Pretvara scripts/recipes-source.json u src/data/recipes.ts.
 *
 * Sastojci se u izvoru pisu IMENOM namirnice, a ovdje se razrjesavaju u
 * identifikatore prema stvarnoj bazi. Nepoznato ime je greska, ne tiho
 * preskakanje — recept bez sastojka izgleda ispravno, a daje krive vrijednosti.
 *
 * Pokretanje: node scripts/generate-recipes.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(root, 'scripts/recipes-source.json')
const OUT = resolve(root, 'src/data/recipes.ts')
const REPORT = resolve(root, 'reports/recepti.md')

const NAME_RE = /id: '((?:[^'\\]|\\.)*)', name: '((?:[^'\\]|\\.)*)', cat: '([^']+)'/g
const VALUE_RE = /(\w+): (-?[\d.]+)/g

/** Cita generirane datoteke s namirnicama i vraca mapu naziv -> {id, vrijednosti}. */
function loadFoods() {
  const byName = new Map()
  for (const file of ['src/data/foods.ts', 'src/data/extraFoods.ts', 'src/data/offFoods.ts']) {
    const text = readFileSync(resolve(root, file), 'utf8')
    for (const line of text.split('\n')) {
      NAME_RE.lastIndex = 0
      const m = NAME_RE.exec(line)
      if (!m) continue
      const values = {}
      VALUE_RE.lastIndex = 0
      for (const v of line.matchAll(VALUE_RE)) values[v[1]] = Number(v[2])
      const name = m[2].replace(/\\'/g, "'")
      byName.set(name.toLowerCase(), { id: m[1], name, cat: m[3], values })
    }
  }
  return byName
}

const foods = loadFoods()
const source = JSON.parse(readFileSync(SOURCE, 'utf8'))

const errors = []
const warnings = []
const recipes = []

const NUTRIENTS = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'mg', 'vc', 'vd']

/** Atwater s vlaknima po 2 kcal/g — usklađeno s src/domain/nutrients.ts. */
function atwaterDeviation(v) {
  const net = Math.max(0, (v.c ?? 0) - (v.fib ?? 0))
  const computed = 4 * (v.p ?? 0) + 4 * net + 2 * (v.fib ?? 0) + 9 * (v.f ?? 0)
  const base = Math.max(v.kcal ?? 0, computed)
  if (base < 20) return 0
  return Math.abs((v.kcal ?? 0) - computed) / base
}

for (const entry of source.recipes) {
  const items = []
  let missing = false

  for (const [name, grams] of entry.items) {
    const food = foods.get(String(name).toLowerCase())
    if (!food) {
      errors.push(`${entry.name}: nepoznata namirnica "${name}"`)
      missing = true
      continue
    }
    if (!(grams > 0)) {
      errors.push(`${entry.name}: "${name}" ima gramažu ${grams}`)
      missing = true
      continue
    }
    items.push({ foodId: food.id, g: grams, _name: food.name, _values: food.values })
  }
  if (missing) continue

  // Vrijednosti gotovog jela na 100 g — ista formula kao recipeTotals u domeni.
  const total = Object.fromEntries(NUTRIENTS.map((k) => [k, 0]))
  let rawGrams = 0
  for (const item of items) {
    const k = item.g / 100
    for (const key of NUTRIENTS) total[key] += (item._values[key] ?? 0) * k
    rawGrams += item.g
  }
  const grams = Math.max(1, rawGrams * (entry.yieldFactor ?? 1))
  const per100 = Object.fromEntries(NUTRIENTS.map((k) => [k, (total[k] / grams) * 100]))

  if (per100.kcal < 20) warnings.push(`${entry.name}: samo ${Math.round(per100.kcal)} kcal/100 g`)
  if (per100.kcal > 600) warnings.push(`${entry.name}: čak ${Math.round(per100.kcal)} kcal/100 g`)

  const dev = atwaterDeviation(per100)
  if (dev > 0.15) {
    warnings.push(`${entry.name}: Atwater odstupa ${Math.round(dev * 100)} %`)
  }

  const serving = Math.round(grams / Math.max(1, entry.servings))
  if (serving < 60) warnings.push(`${entry.name}: porcija je samo ${serving} g`)
  if (serving > 900) warnings.push(`${entry.name}: porcija je ${serving} g`)

  let drink = null
  if (entry.drink) {
    const [drinkName, drinkGrams] = entry.drink
    const food = foods.get(String(drinkName).toLowerCase())
    if (!food) errors.push(`${entry.name}: nepoznato piće "${drinkName}"`)
    else drink = { foodId: food.id, g: drinkGrams, name: food.name }
  }

  recipes.push({
    id: entry.id,
    name: entry.name,
    cat: entry.cat,
    cuisine: entry.cuisine,
    servings: entry.servings,
    yieldFactor: entry.yieldFactor,
    note: entry.note,
    items: items.map((i) => ({ foodId: i.foodId, g: i.g, name: i._name })),
    drink,
    _kcal: Math.round(per100.kcal),
    _serving: serving,
  })
}

const ids = recipes.map((r) => r.id)
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i)
if (dupIds.length) errors.push(`dvostruki identifikatori: ${[...new Set(dupIds)].join(', ')}`)

const names = recipes.map((r) => r.name.toLowerCase())
const dupNames = names.filter((n, i) => names.indexOf(n) !== i)
if (dupNames.length) errors.push(`dvostruki nazivi: ${[...new Set(dupNames)].join(', ')}`)

if (errors.length) {
  console.error(`\nNeispravni recepti (${errors.length}):`)
  for (const e of errors) console.error(`  ${e}`)
  console.error('\nNijedna datoteka nije zapisana.')
  process.exit(1)
}

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const body = recipes
  .map((r) => {
    const lines = [
      `  {`,
      `    id: ${q(r.id)},`,
      `    name: ${q(r.name)},`,
      `    cat: ${q(r.cat)},`,
      `    cuisine: ${q(r.cuisine)},`,
      `    servings: ${r.servings},`,
    ]
    if (r.yieldFactor !== undefined) lines.push(`    yieldFactor: ${r.yieldFactor},`)
    if (r.note) lines.push(`    note: ${q(r.note)},`)
    if (r.drink) lines.push(`    drink: { foodId: ${q(r.drink.foodId)}, g: ${r.drink.g} },`)
    lines.push(`    items: [`)
    for (const item of r.items) {
      lines.push(`      { foodId: ${q(item.foodId)}, g: ${item.g} }, // ${item.name}`)
    }
    lines.push(`    ],`)
    lines.push(`  },`)
    return lines.join('\n')
  })
  .join('\n')

const out = `/**
 * GENERIRANO — ne uređivati ručno.
 * Izvor: scripts/recipes-source.json, generator: scripts/generate-recipes.mjs
 *
 * ${recipes.length} tradicionalnih jela hrvatske i susjednih kuhinja. Vrijednosti se
 * računaju iz sastojaka provjerenih prema USDA, pa nijedna brojka nije procijenjena.
 *
 * \`drink\` je preporučeno piće uz jelo — dodaje se posebno i NE ulazi u
 * hranjive vrijednosti jela.
 */
import type { Recipe } from '../domain/types'

export const STARTER_RECIPES: Recipe[] = [
${body}
]
`

writeFileSync(OUT, out, 'utf8')

let md = `# Ugrađeni recepti\n\nUkupno: ${recipes.length}\n\n`
md += `Jela su tradicionalni repertoar hrvatske i susjednih kuhinja. Popisi sastojaka i gramaže su vlastiti; `
md += `iz kuharica nije preuzet nikakav tekst.\n\n`
md += `| Jelo | Kuhinja | Porcija | kcal/100 g | Piće |\n|---|---|---:|---:|---|\n`
for (const r of recipes) {
  md += `| ${r.name} | ${r.cuisine} | ${r._serving} g | ${r._kcal} | ${r.drink ? r.drink.name : '—'} |\n`
}
if (warnings.length) {
  md += `\n## Za pregled\n\n`
  for (const w of warnings) md += `- ${w}\n`
}
mkdirSync(dirname(REPORT), { recursive: true })
writeFileSync(REPORT, md, 'utf8')

const withDrink = recipes.filter((r) => r.drink).length
console.log(`Zapisano ${recipes.length} recepata u src/data/recipes.ts (${withDrink} s preporučenim pićem)`)
if (warnings.length) {
  console.log(`\nZa pregled (${warnings.length}):`)
  for (const w of warnings) console.log(`  ${w}`)
}

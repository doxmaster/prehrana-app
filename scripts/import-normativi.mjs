/**
 * Pretvara sluzbene normative u recepte za scripts/recipes-source.json.
 *
 * Kljucna provjera: sluzbeni normativ za svako jelo navodi ukupne kalorije po
 * porciji. Nas izracun iz baze mora ih pogoditi — ako ne pogodi, mapiranje
 * sastojka je krivo (najcesce sirovo naspram kuhanog) i recept se odbacuje
 * umjesto da ude s krivim brojkama.
 *
 * Pokretanje: node scripts/import-normativi.mjs <normativi.json> <izlaz.json>
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mapping = JSON.parse(readFileSync(resolve(root, 'scripts/normativi-map.json'), 'utf8'))
const parsed = JSON.parse(readFileSync(process.argv[2], 'utf8'))

const NAME_RE = /name: '((?:[^'\\]|\\.)*)', cat: '([^']+)'/
const VALUE_RE = /(\w+): (-?[\d.]+)/g

const foods = new Map()
for (const file of ['src/data/foods.ts', 'src/data/extraFoods.ts', 'src/data/offFoods.ts']) {
  for (const line of readFileSync(resolve(root, file), 'utf8').split('\n')) {
    const m = NAME_RE.exec(line)
    if (!m) continue
    const values = {}
    VALUE_RE.lastIndex = 0
    for (const v of line.matchAll(VALUE_RE)) values[v[1]] = Number(v[2])
    foods.set(m[1].replace(/\\'/g, "'"), { name: m[1], cat: m[2], values })
  }
}

const skip = new Set(mapping.skip)
const KATEGORIJE = {
  NAPITCI: 'Pića',
  'ŽITARICE ZA DORUČAK': 'Žitarice i kruh',
  NAMAZI: 'Ostalo',
  'NARESCI I JAJA': 'Mliječno i jaja',
  JUHE: 'Meso i riba',
  'MESNA JELA': 'Meso i riba',
  'MESNA JELA - SLOŽENCI': 'Meso i riba',
  VARIVA: 'Mahunarke',
  PRILOZI: 'Žitarice i kruh',
  'JELA OD RIBA': 'Meso i riba',
  'POVRTNI SLOŽENCI': 'Povrće',
  SALATE: 'Povrće',
  DESERTI: 'Ostalo',
  'KRUH I PEKARSKI PROIZVODI': 'Žitarice i kruh',
  VOĆE: 'Voće',
  OSTALO: 'Ostalo',
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-zà-ž0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 44)

const titleCase = (s) => {
  const lower = s.toLowerCase().replace(/\s{2,}/g, ' ').trim()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

const accepted = []
const rejected = []
const unmapped = new Map()

for (const recipe of parsed.recipes) {
  const items = []
  let missing = 0

  for (const ing of recipe.items) {
    if (skip.has(ing.name)) continue

    const cookedName = mapping.cookedMap[ing.name]
    const targetName = cookedName ?? mapping.map[ing.name]
    if (!targetName) {
      unmapped.set(ing.name, (unmapped.get(ing.name) ?? 0) + 1)
      missing++
      continue
    }
    const food = foods.get(targetName)
    if (!food) {
      unmapped.set(`${ing.name} -> ${targetName} (nema u bazi)`, 1)
      missing++
      continue
    }

    const factor = mapping.factors[ing.name] ?? 1
    const grams = Math.round(ing.g * factor * 10) / 10
    if (grams <= 0) continue
    items.push([targetName, grams])
  }

  if (items.length < 2) {
    rejected.push({ name: recipe.name, why: 'premalo prepoznatih sastojaka' })
    continue
  }

  // Nasa procjena kalorija po porciji naspram sluzbene.
  let kcal = 0
  for (const [name, grams] of items) kcal += ((foods.get(name)?.values.kcal ?? 0) * grams) / 100

  const official = recipe.kcalTotal
  const diff = official > 0 ? Math.abs(kcal - official) / official : 1

  if (missing > 2 || diff > 0.25) {
    rejected.push({
      name: recipe.name,
      why: `naša ${Math.round(kcal)} vs službena ${official} kcal (${Math.round(diff * 100)} %)` +
        (missing ? `, ${missing} nepovezanih sastojaka` : ''),
    })
    continue
  }

  accepted.push({
    id: `rc-hr-${slug(recipe.name)}`,
    name: titleCase(recipe.name),
    cat: KATEGORIJE[recipe.category] ?? 'Ostalo',
    cuisine: 'hrvatska',
    servings: 1,
    note: `Službeni normativ za školsku prehranu (${official} kcal po porciji).`,
    items,
    _kcal: Math.round(kcal),
    _official: official,
  })
}

writeFileSync(process.argv[3], JSON.stringify({ recipes: accepted }, null, 2), 'utf8')

console.log(`Prihvaćeno ${accepted.length}, odbačeno ${rejected.length}`)
if (unmapped.size) {
  console.log(`\nNepovezani sastojci (${unmapped.size}):`)
  for (const [name, n] of [...unmapped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
    console.log(`  ${String(n).padStart(2)}× ${name}`)
  }
}
if (rejected.length) {
  console.log(`\nOdbačeni recepti:`)
  for (const r of rejected.slice(0, 20)) console.log(`  ${r.name}: ${r.why}`)
}

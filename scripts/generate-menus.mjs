/**
 * Slaze dnevne jelovnike iz kataloga jela u src/data/generatedMenus.ts.
 *
 * Rucno pisanje jelovnika je usko grlo: recepata ima 186, a rucno slozenih dana
 * svega 14 — dvije tjedne rotacije, premalo da se u dva tjedna nista ne ponovi.
 * Ovdje se za svako glavno jelo slozi jedan dan (dorucak, rucak, vecera,
 * meduobrok) i zadrzava samo ako padne u ciljani raspon kalorija i bjelancevina.
 *
 * Vrijednosti se racunaju iz istih namirnica i recepata koje koristi aplikacija,
 * pa nijedna brojka nije procijenjena. Rezultat provjerava tests/generatedMenus.test.ts
 * ponovnim izracunom preko domenskog koda — ako generator odluta, test pukne.
 *
 * Pokretanje: node scripts/generate-menus.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'src/data/generatedMenus.ts')

/** Ciljani dan za JEDNU referentnu odraslu osobu (oko 2000 kcal). */
const KCAL = { min: 1950, max: 2250 }
const MIN_PROTEIN = 70
const NUTRIENT_KEYS = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'mg', 'vc', 'vd']

const FOOD_RE = /id: '((?:[^'\\]|\\.)*)', name: '((?:[^'\\]|\\.)*)', cat: '([^']+)'/
const VALUE_RE = /(\w+): (-?[\d.]+)/g

function loadFoods() {
  const byId = new Map()
  for (const file of ['src/data/foods.ts', 'src/data/extraFoods.ts', 'src/data/offFoods.ts']) {
    for (const line of readFileSync(resolve(root, file), 'utf8').split('\n')) {
      const m = FOOD_RE.exec(line)
      if (!m) continue
      const food = { id: m[1], name: m[2].replace(/\\'/g, "'"), cat: m[3] }
      VALUE_RE.lastIndex = 0
      for (const v of line.matchAll(VALUE_RE)) food[v[1]] = Number(v[2])
      byId.set(food.id, food)
    }
  }
  return byId
}

function loadRecipes() {
  const text = readFileSync(resolve(root, 'src/data/recipes.ts'), 'utf8')
  const re = /\{\s*id: '([^']+)',\s*name: '((?:[^'\\]|\\.)*)',\s*cat: '([^']+)',([\s\S]*?)\n  \},\n/g
  const out = []
  for (const m of text.slice(text.indexOf('[')).matchAll(re)) {
    // Pice uz jelo je zapisano istim oblikom kao sastojak, a NE ulazi u
    // hranjive vrijednosti — bez ovoga bi recept s vinom ispao tezi nego jest.
    const rest = m[4].replace(/drink: \{[^}]*\},?/g, '')
    out.push({
      id: m[1],
      name: m[2].replace(/\\'/g, "'"),
      cat: m[3],
      cuisine: /cuisine: '([^']+)'/.exec(rest)?.[1],
      servings: Number(/servings: ([\d.]+)/.exec(rest)?.[1] ?? 1),
      yieldFactor: Number(/yieldFactor: ([\d.]+)/.exec(rest)?.[1] ?? 1),
      items: [...rest.matchAll(/\{ foodId: '([^']+)', g: ([\d.]+) \}/g)]
        .map((i) => ({ foodId: i[1], g: Number(i[2]) })),
    })
  }
  return out
}

/** Glavna jela koja vec imaju rucno slozen dan — da se dan ne ponovi pod drugim imenom. */
function loadHandwrittenMains() {
  const text = readFileSync(resolve(root, 'src/data/menus.ts'), 'utf8')
  return new Set([...text.matchAll(/foodId: 'r:([^']+)'/g)].map((m) => m[1]))
}

/**
 * Naslovi rucno slozenih jelovnika.
 *
 * Slozeni jelovnik nosi ime svog glavnog jela, pa bi novi recept istog imena
 * kao rucni jelovnik dao dva jelovnika s istim naslovom — u izborniku se ne bi
 * razlikovali. Provjera ide po NASLOVU, ne po receptu, jer rucni jelovnik moze
 * nositi ime jela koje uopce ne koristi kao sastojak.
 */
function loadHandwrittenTitles() {
  const text = readFileSync(resolve(root, 'src/data/menus.ts'), 'utf8')
  return new Set([...text.matchAll(/title: '([^']+)'/g)].map((m) => m[1]))
}

const foods = loadFoods()
const recipes = loadRecipes()
const taken = loadHandwrittenMains()
const takenTitles = loadHandwrittenTitles()

/** Recept kao namirnica: vrijednosti na 100 g gotovog jela i predlozena porcija. */
function asFood(recipe) {
  const total = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0]))
  let raw = 0
  for (const item of recipe.items) {
    const food = foods.get(item.foodId)
    if (!food) throw new Error(`Recept ${recipe.id}: nepoznata namirnica ${item.foodId}`)
    for (const k of NUTRIENT_KEYS) total[k] += ((food[k] ?? 0) * item.g) / 100
    raw += item.g
  }
  const grams = Math.max(1, raw * recipe.yieldFactor)
  const per100 = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, (total[k] / grams) * 100]))
  return { id: `r:${recipe.id}`, name: recipe.name, cat: recipe.cat, serv: Math.round(grams / Math.max(1, recipe.servings)), ...per100 }
}

const asFoodById = new Map(recipes.map((r) => [r.id, asFood(r)]))
const lookup = (id) => (id.startsWith('r:') ? asFoodById.get(id.slice(2)) : foods.get(id))

function sum(items) {
  const t = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0]))
  for (const item of items) {
    const food = lookup(item.foodId)
    if (!food) throw new Error(`Nepoznata namirnica ${item.foodId}`)
    for (const k of NUTRIENT_KEYS) t[k] += ((food[k] ?? 0) * item.g) / 100
  }
  return t
}

const g = (foodId, grams) => ({ foodId, g: grams })

/**
 * Dorucci i meduobroci od osnovnih namirnica. Namjerno ih je vise nego sto
 * treba: dan se slaze tako da se prolazi kroz kombinacije dok jedna ne padne u
 * ciljani raspon, pa sira ponuda znaci vise upotrebljivih dana.
 */
const BREAKFASTS = [
  { name: 'zobena kaša', items: [g('b25', 70), g('b13', 250), g('b48', 120)] },
  { name: 'kruh sa sirom i jajem', items: [g('b21', 100), g('b16', 50), g('b11', 60), g('b38', 100)] },
  { name: 'jaja i šunka', items: [g('b11', 120), g('b20', 80), g('b10', 60), g('b40', 80)] },
  { name: 'jogurt s pahuljicama', items: [g('b15', 200), g('b25', 40), g('b51', 100), g('b57', 20)] },
  { name: 'kruh s maslacem', items: [g('b21', 90), g('b19', 15), g('b49', 150), g('b13', 200)] },
  { name: 'svježi sir s kruhom', items: [g('b17', 200), g('b21', 80), g('b39', 100)] },
  { name: 'palenta s mlijekom', items: [g('b27', 250), g('b13', 200), g('b47', 150)] },
  { name: 'kruh s kulenom', items: [g('b20', 90), g('off:kulen', 40), g('b14', 250)] },
  { name: 'jogurt s jagodama', items: [g('b14', 250), g('b25', 50), g('b50', 120), g('b56', 20)] },
  { name: 'kruh s fetom', items: [g('b21', 90), g('b18', 50), g('b11', 60), g('b45', 60)] },
]

const SNACKS = [
  { name: 'jabuka i bademi', items: [g('b47', 150), g('b56', 30)] },
  { name: 'jogurt i orasi', items: [g('b14', 200), g('b57', 25)] },
  { name: 'banana i lješnjaci', items: [g('b48', 120), g('b58', 25)] },
  { name: 'naranča i sir', items: [g('b49', 150), g('b16', 40)] },
  { name: 'kruška i kikiriki', items: [g('b53', 150), g('b59', 30)] },
  { name: 'grožđe i bademi', items: [g('b52', 150), g('b56', 25)] },
  { name: 'kivi i grčki jogurt', items: [g('b54', 150), g('b15', 150)] },
  { name: 'kruh sa sirom', items: [g('b20', 60), g('b16', 40)] },
]

/**
 * Prilog uz rucak. Zasitno glavno jelo prolazi bez priloga, a juha ili varivo
 * bez veceg priloga nikad ne bi doseglo dnevni raspon — zato i krupniji izbor.
 */
const SIDES = [
  null,
  [g('b21', 60)],
  [g('b26', 150)],
  [g('b20', 70)],
  [g('b45', 80), g('b62', 10)],
  [g('b26', 250), g('b21', 60)],
  [g('b27', 250), g('b21', 60)],
  [g('b21', 120), g('b16', 40)],
]

const MAIN_CATS = new Set(['Meso i riba', 'Žitarice i kruh', 'Mahunarke', 'Povrće'])
const DINNER_CATS = new Set(['Meso i riba', 'Mahunarke', 'Povrće', 'Mliječno i jaja', 'Žitarice i kruh'])

const isDomestic = (r) => r.cuisine === 'hrvatska' || r.cuisine === 'regionalna'
const kcalOf = (r) => {
  const f = asFoodById.get(r.id)
  return (f.kcal / 100) * f.serv
}

const mains = recipes
  .filter(
    (r) =>
      isDomestic(r) &&
      MAIN_CATS.has(r.cat) &&
      kcalOf(r) >= 320 &&
      !taken.has(r.id) &&
      !takenTitles.has(r.name),
  )
  .sort((a, b) => a.name.localeCompare(b.name, 'hr'))

const dinners = recipes
  .filter((r) => isDomestic(r) && DINNER_CATS.has(r.cat) && kcalOf(r) >= 150 && kcalOf(r) <= 430)
  .sort((a, b) => a.name.localeCompare(b.name, 'hr'))

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/č|ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const menus = []
const skipped = []

mains.forEach((main, index) => {
  const mainFood = asFoodById.get(main.id)
  const lunchBase = [g(`r:${main.id}`, mainFood.serv)]

  let built = null
  // Kombinacije se obilaze od pomaka koji ovisi o glavnom jelu, pa susjedni
  // jelovnici ne dobivaju isti dorucak i isti meduobrok.
  outer: for (let d = 0; d < dinners.length; d++) {
    const dinner = dinners[(index * 3 + d) % dinners.length]
    if (dinner.id === main.id) continue
    const dinnerFood = asFoodById.get(dinner.id)

    for (let s = 0; s < SIDES.length; s++) {
      const side = SIDES[(index + s) % SIDES.length]
      const lunch = side ? [...lunchBase, ...side] : lunchBase

      for (let b = 0; b < BREAKFASTS.length; b++) {
        const breakfast = BREAKFASTS[(index * 7 + b) % BREAKFASTS.length]
        for (let k = 0; k < SNACKS.length; k++) {
          const snack = SNACKS[(index * 5 + k) % SNACKS.length]
          const meals = [breakfast.items, lunch, [g(`r:${dinner.id}`, dinnerFood.serv)], snack.items]
          const totals = sum(meals.flat())
          if (totals.kcal < KCAL.min || totals.kcal > KCAL.max || totals.p < MIN_PROTEIN) continue
          built = { meals, dinner, totals }
          break outer
        }
      }
    }
  }

  if (!built) {
    skipped.push(main.name)
    return
  }

  menus.push({
    id: `mn-g-${slug(main.name)}`,
    cuisine: main.cuisine,
    title: main.name,
    desc: `Uz večeru: ${built.dinner.name}`,
    meals: built.meals,
    kcal: Math.round(built.totals.kcal),
    p: Math.round(built.totals.p),
  })
})

const seen = new Set()
for (const m of menus) {
  if (seen.has(m.id)) throw new Error(`Dvostruki id jelovnika: ${m.id}`)
  seen.add(m.id)
}

const nameOf = (id) => lookup(id)?.name ?? id
const line = (item) => `        { foodId: '${item.foodId}', g: ${item.g} }, // ${nameOf(item.foodId)}`

const body = menus
  .map(
    (m) => `  {
    id: '${m.id}',
    cuisine: '${m.cuisine}',
    title: ${JSON.stringify(m.title)},
    desc: ${JSON.stringify(m.desc)},
    // ${m.kcal} kcal, bjelančevine ${m.p} g
    meals: [
${m.meals.map((meal) => `      [\n${meal.map(line).join('\n')}\n      ],`).join('\n')}
    ],
  },`,
  )
  .join('\n')

writeFileSync(
  OUT,
  `/**
 * GENERIRANO — ne uređivati ručno.
 * Generator: scripts/generate-menus.mjs
 *
 * ${menus.length} dnevnih jelovnika složenih iz kataloga jela. Svaki dan ima doručak,
 * ručak, večeru i međuobrok, a količine su za JEDNU referentnu odraslu osobu
 * (${KCAL.min}–${KCAL.max} kcal, najmanje ${MIN_PROTEIN} g bjelančevina).
 *
 * Zajedno s ručno složenima iz menus.ts daju dovoljno dana da se u dva tjedna
 * ništa ne mora ponoviti — vidi src/domain/generateWeek.ts.
 */
import type { Menu } from '../domain/types'

export const GENERATED_MENUS: Menu[] = [
${body}
]
`,
  'utf8',
)

console.log(`Zapisano ${menus.length} jelovnika u src/data/generatedMenus.ts`)
console.log(`Glavnih jela u katalogu: ${mains.length}, večera na raspolaganju: ${dinners.length}`)
if (skipped.length) console.log(`Bez upotrebljive kombinacije (${skipped.length}): ${skipped.join(', ')}`)

import { CATEGORIES, NUTRIENT_KEYS } from './types'
import type {
  AppState,
  BaseFoodOverrides,
  Category,
  DayMeals,
  Food,
  Household,
  MealItem,
  Measurement,
  Menu,
  Nutrients,
  Person,
  Profile,
  Recipe,
  WeekPlan,
} from './types'
import { emptyMeals, isEmptyMeals } from './nutrients'
import { WEEK_LENGTH } from './weeks'
import { addDays, isISODate, mondayOf, todayISO } from './dates'
import { uid } from './id'
import { PROFILE_LIMITS, clampNum } from './targets'

/* ---------- sigurni pristup nepoznatim podacima ---------- */

type Dict = Record<string, unknown>

const asDict = (v: unknown): Dict | undefined =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Dict) : undefined

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

const num = (v: unknown, def = 0): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v)
  return Number.isFinite(n) ? n : def
}

const str = (v: unknown, def = ''): string => (typeof v === 'string' ? v : def)

const asCategory = (v: unknown): Category =>
  CATEGORIES.includes(v as Category) ? (v as Category) : 'Ostalo'

function asNutrients(v: unknown): Nutrients {
  const d = asDict(v) ?? {}
  const out = {} as Nutrients
  for (const k of NUTRIENT_KEYS) out[k] = num(d[k], 0)
  return out
}

/* ---------- pojedinačne strukture ---------- */

function migrateItem(v: unknown): MealItem | null {
  const d = asDict(v)
  if (!d) return null
  const g = num(d.g, 0)
  if (!(g > 0)) return null

  if (typeof d.foodId === 'string' && d.foodId) return { foodId: d.foodId, g }

  const name = str(d.name).trim()
  if (!name) return null
  const item: MealItem = { name, g, n: asNutrients(d.n) }
  if (d.drink) item.drink = true
  const cat = d.cat
  if (typeof cat === 'string' && CATEGORIES.includes(cat as Category)) item.cat = cat as Category
  return item
}

function migrateMeals(v: unknown): DayMeals {
  const arr = asArray(v)
  const meals = emptyMeals()
  for (let i = 0; i < 4; i++) {
    meals[i] = asArray(arr[i])
      .map(migrateItem)
      .filter((x): x is MealItem => x !== null)
  }
  return meals
}

function migrateDayMap(v: unknown): Record<string, DayMeals> {
  const d = asDict(v) ?? {}
  const out: Record<string, DayMeals> = {}
  for (const key of Object.keys(d)) {
    if (!isISODate(key)) continue
    const meals = migrateMeals(d[key])
    if (!isEmptyMeals(meals)) out[key] = meals
  }
  return out
}

/** v1 je čuvao tjedan kao 7×4 polje bez datuma — pripisuje se tekućem tjednu. */
function migrateWeek(v: unknown, target: Record<string, DayMeals>): void {
  const week = asArray(v)
  if (week.length !== 7) return
  const mon = mondayOf(todayISO())
  week.forEach((day, i) => {
    const meals = migrateMeals(day)
    if (!isEmptyMeals(meals)) target[addDays(mon, i)] = meals
  })
}

function migrateProfile(v: unknown): Profile {
  const d = asDict(v) ?? {}
  return {
    sex: d.sex === 'z' ? 'z' : 'm',
    age: clampNum(d.age, PROFILE_LIMITS.age.min, PROFILE_LIMITS.age.max, PROFILE_LIMITS.age.def),
    act: clampNum(d.act, PROFILE_LIMITS.act.min, PROFILE_LIMITS.act.max, PROFILE_LIMITS.act.def),
    weight: clampNum(
      d.weight,
      PROFILE_LIMITS.weight.min,
      PROFILE_LIMITS.weight.max,
      PROFILE_LIMITS.weight.def,
    ),
    height: clampNum(
      d.height,
      PROFILE_LIMITS.height.min,
      PROFILE_LIMITS.height.max,
      PROFILE_LIMITS.height.def,
    ),
    goal: clampNum(d.goal, PROFILE_LIMITS.goal.min, PROFILE_LIMITS.goal.max, PROFILE_LIMITS.goal.def),
  }
}

function migrateMeasurements(v: unknown): Measurement[] {
  return asArray(v)
    .map((raw): Measurement | null => {
      const d = asDict(raw)
      if (!d || !isISODate(d.date)) return null
      const m: Measurement = { date: d.date }
      if (d.weight !== undefined && num(d.weight, 0) > 0) m.weight = num(d.weight)
      if (d.waist !== undefined && num(d.waist, 0) > 0) m.waist = num(d.waist)
      const note = str(d.note).trim()
      if (note) m.note = note
      return m
    })
    .filter((x): x is Measurement => x !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
}

function migratePerson(v: unknown, index: number): Person {
  const d = asDict(v) ?? {}
  const person: Person = {
    id: str(d.id) || uid('p'),
    name: str(d.name).trim() || `Osoba ${index + 1}`,
    profile: migrateProfile(d.profile),
    log: migrateDayMap(d.log),
    measurements: migrateMeasurements(d.measurements),
  }
  // Rucno zadan udio u nabavi i zdravstvena stanja nisu dio starijih zapisa;
  // kad postoje, moraju prezivjeti ucitavanje jer se migracija vrti pri svakom.
  const factor = num(d.portionFactor, 0)
  if (factor > 0) person.portionFactor = factor
  const conditions = asArray(d.conditions).filter((c): c is string => typeof c === 'string')
  if (conditions.length) person.conditions = [...new Set(conditions)]
  // v1: tjedan bez datuma
  if (d.week) migrateWeek(d.week, person.log)
  // v2: planovi po danu — zadržavaju se privremeno da bi se pretvorili u jelovnike
  const plan = migrateDayMap(d.plan)
  if (Object.keys(plan).length) person.plan = plan
  return person
}

function migrateFood(v: unknown): Food | null {
  const d = asDict(v)
  if (!d) return null
  const name = str(d.name).trim()
  if (!name) return null
  const cat = asCategory(d.cat)
  const food: Food = {
    id: str(d.id) || uid('c'),
    name,
    cat,
    serv: Math.max(1, Math.round(num(d.serv, 100)) || 100),
    source: d.source === 'usda' || d.source === 'off' || d.source === 'ai' ? d.source : 'user',
    ...asNutrients(d),
  }
  if (typeof d.sourceId === 'string') food.sourceId = d.sourceId
  if (isISODate(d.verifiedAt)) food.verifiedAt = d.verifiedAt
  return food
}

function migrateRecipe(v: unknown): Recipe | null {
  const d = asDict(v)
  if (!d) return null
  const name = str(d.name).trim()
  if (!name) return null
  const items = asArray(d.items)
    .map(migrateItem)
    .filter((it): it is { foodId: string; g: number } => it !== null && 'foodId' in it)
  const recipe: Recipe = {
    id: str(d.id) || uid('rc'),
    name,
    cat: asCategory(d.cat),
    servings: Math.max(1, Math.round(num(d.servings, 1)) || 1),
    items,
  }
  const y = num(d.yieldFactor, 1)
  if (y > 0 && y !== 1) recipe.yieldFactor = y
  const note = str(d.note).trim()
  if (note) recipe.note = note
  return recipe
}

function migrateMenu(v: unknown): Menu {
  const d = asDict(v) ?? {}
  const menu: Menu = { id: str(d.id) || uid('mn'), meals: migrateMeals(d.meals) }
  const title = str(d.title).trim()
  if (title) menu.title = title
  const desc = str(d.desc).trim()
  if (desc) menu.desc = desc
  return menu
}

function migrateHousehold(v: unknown, index: number): Household | null {
  const d = asDict(v)
  if (!d) return null
  return {
    id: str(d.id) || uid('h'),
    name: str(d.name).trim() || `Kućanstvo ${index + 1}`,
    memberIds: asArray(d.memberIds).filter((x): x is string => typeof x === 'string'),
  }
}

const SEASONS = ['proljeće', 'ljeto', 'jesen', 'zima'] as const

function migrateWeekPlan(v: unknown): WeekPlan | null {
  const d = asDict(v)
  if (!d) return null
  const raw = asArray(d.days)
  // Tjedan uvijek ima točno sedam mjesta, bez obzira što je zapisano.
  const days = Array.from({ length: WEEK_LENGTH }, (_, i) => {
    const value = raw[i]
    return typeof value === 'string' && value ? value : null
  })
  const week: WeekPlan = { id: str(d.id) || uid('wk'), days }
  const title = str(d.title).trim()
  if (title) week.title = title
  const desc = str(d.desc).trim()
  if (desc) week.desc = desc
  if (typeof d.householdId === 'string' && d.householdId) week.householdId = d.householdId
  const season = SEASONS.find((s) => s === d.season)
  if (season) week.season = season
  // Datum se svodi na ponedjeljak da tjedan uvijek pocinje na istom mjestu,
  // bez obzira koji je dan upisan.
  if (isISODate(d.startDate)) week.startDate = mondayOf(d.startDate)
  return week
}

/**
 * v2 je izmjene nad ugrađenim namirnicama držao u pet odvojenih objekata.
 * U v3 su spojeni u jedan `overrides`.
 */
/**
 * Izmjene dolaze iz dva oblika: v2 ih je držao u pet ravnih objekata
 * (foodRenames, foodCat, foodVals, foodServ, foodHidden), a v3 u jednom
 * `overrides`. Oba se čitaju i spajaju, pa uvoz v3 izvoza ništa ne gubi.
 */
function migrateOverrides(root: Dict): BaseFoodOverrides {
  const v3 = asDict(root.overrides) ?? {}

  const names: Record<string, string> = {}
  for (const src of [asDict(root.foodRenames), asDict(v3.names)]) {
    for (const [k, v] of Object.entries(src ?? {})) {
      const n = str(v).trim()
      if (n) names[k] = n
    }
  }

  const cats: Record<string, Category> = {}
  for (const src of [asDict(root.foodCat), asDict(v3.cats)]) {
    for (const [k, v] of Object.entries(src ?? {})) {
      if (typeof v === 'string' && CATEGORIES.includes(v as Category)) cats[k] = v as Category
    }
  }

  const vals: Record<string, Partial<Nutrients>> = {}
  for (const src of [asDict(root.foodVals), asDict(v3.vals)]) {
    for (const [k, v] of Object.entries(src ?? {})) {
      const d = asDict(v)
      if (!d) continue
      const partial: Partial<Nutrients> = { ...vals[k] }
      for (const key of NUTRIENT_KEYS) if (typeof d[key] === 'number') partial[key] = d[key] as number
      if (Object.keys(partial).length) vals[k] = partial
    }
  }

  const servs: Record<string, number> = {}
  for (const src of [asDict(root.foodServ), asDict(v3.servs)]) {
    for (const [k, v] of Object.entries(src ?? {})) {
      const n = num(v, 0)
      if (n > 0) servs[k] = Math.round(n)
    }
  }

  const hidden = [...asArray(root.foodHidden), ...asArray(v3.hidden)].filter(
    (x): x is string => typeof x === 'string',
  )

  return { names, cats, vals, servs, hidden: [...new Set(hidden)] }
}

/* ---------- glavni ulaz ---------- */

export function emptyState(): AppState {
  const person: Person = {
    id: uid('p'),
    name: 'Osoba 1',
    profile: {
      sex: 'm',
      age: PROFILE_LIMITS.age.def,
      act: PROFILE_LIMITS.act.def,
      weight: PROFILE_LIMITS.weight.def,
      height: PROFILE_LIMITS.height.def,
      goal: 0,
    },
    log: {},
    measurements: [],
  }
  return {
    version: 4,
    profiles: [person],
    activeProfileId: person.id,
    households: [{ id: uid('h'), name: 'Obitelj', memberIds: [person.id] }],
    menus: [{ id: uid('mn'), meals: emptyMeals() }],
    weeks: [],
    recipes: [],
    customFoods: [],
    overrides: { names: {}, cats: {}, vals: {}, servs: {}, hidden: [] },
    updatedAt: Date.now(),
  }
}

/**
 * Pretvara bilo koji poznati oblik podataka (v1, v2, v3 ili uvezeni JSON) u v3.
 * Nikad ne baca iznimku — neispravan ulaz daje prazno stanje.
 */
export function migrateState(raw: unknown): AppState {
  const root = asDict(raw)
  if (!root) return emptyState()

  const profiles = asArray(root.profiles).map(migratePerson)
  if (!profiles.length) return emptyState()

  const menus = asArray(root.menus).map(migrateMenu)

  // v1/v2: planovi po danu i zajednički plan postaju numerirani jelovnici
  if (!menus.length) {
    const sources: Record<string, DayMeals>[] = []
    for (const p of profiles) if (p.plan) sources.push(p.plan)
    const shared = migrateDayMap(root.sharedPlan)
    if (Object.keys(shared).length) sources.push(shared)
    if (root.sharedWeek) {
      const fromWeek: Record<string, DayMeals> = {}
      migrateWeek(root.sharedWeek, fromWeek)
      if (Object.keys(fromWeek).length) sources.push(fromWeek)
    }
    for (const map of sources) {
      for (const date of Object.keys(map).sort()) {
        const meals = map[date]
        if (meals && !isEmptyMeals(meals)) menus.push({ id: uid('mn'), meals })
      }
    }
  }
  if (!menus.length) menus.push({ id: uid('mn'), meals: emptyMeals() })

  for (const p of profiles) delete p.plan

  const activeId = str(root.activeProfileId)
  const active = profiles.find((p) => p.id === activeId)

  // Kucanstva: postojeci se cisti od clanova kojih vise nema; ako ih nema
  // uopce, svi profili postaju jedna obitelj — tako stariji podaci odmah rade.
  const knownIds = new Set(profiles.map((p) => p.id))
  const households = asArray(root.households)
    .map(migrateHousehold)
    .filter((h): h is Household => h !== null)
    .map((h) => ({ ...h, memberIds: [...new Set(h.memberIds.filter((id) => knownIds.has(id)))] }))

  if (!households.length) {
    households.push({ id: uid('h'), name: 'Obitelj', memberIds: profiles.map((p) => p.id) })
  }

  const menuIds = new Set(menus.map((m) => m.id))
  const householdIds = new Set(households.map((h) => h.id))
  const weeks = asArray(root.weeks)
    .map(migrateWeekPlan)
    .filter((w): w is WeekPlan => w !== null)
    .map((week) => {
      // Dan koji pokazuje na obrisani jelovnik postaje slobodan, a ne pokvaren.
      const days = week.days.map((id) => (id && menuIds.has(id) ? id : null))
      const cleaned: WeekPlan = { ...week, days }
      if (cleaned.householdId && !householdIds.has(cleaned.householdId)) delete cleaned.householdId
      return cleaned
    })

  return {
    version: 4,
    profiles,
    activeProfileId: active ? active.id : profiles[0]!.id,
    households,
    menus,
    weeks,
    recipes: asArray(root.recipes)
      .map(migrateRecipe)
      .filter((r): r is Recipe => r !== null),
    customFoods: asArray(root.customFoods)
      .map(migrateFood)
      .filter((f): f is Food => f !== null),
    overrides: migrateOverrides(root),
    updatedAt: num(root.updatedAt, Date.now()),
  }
}

/** Uklanja dane bez ijedne stavke — sprječava rast pohrane praznim ključevima. */
export function pruneState(state: AppState): AppState {
  for (const person of state.profiles) {
    for (const date of Object.keys(person.log)) {
      const meals = person.log[date]
      if (!meals || isEmptyMeals(meals)) delete person.log[date]
    }
  }
  return state
}

import { emptyMeals } from './nutrients'
import { uid } from './id'
import type { AppState, Menu, Recipe, WeekPlan } from './types'

/**
 * Sto se sve moze obrisati. Svaki dio je neovisan, pa se moze pocistiti samo
 * ono sto smeta — npr. testni dnevnik, a da jelovnici i namirnice ostanu.
 */
export const RESET_PARTS = [
  {
    key: 'log',
    label: 'Dnevnik (pojedeno)',
    description: 'Svi uneseni obroci po danima, za sve osobe.',
  },
  {
    key: 'measurements',
    label: 'Mjerenja težine',
    description: 'Zabilježene težine i mjere, za sve osobe.',
  },
  {
    key: 'weeks',
    label: 'Tjedni planovi',
    description: 'Raspored jelovnika po tjednima. Sami jelovnici ostaju.',
  },
  {
    key: 'menus',
    label: 'Jelovnici',
    description: 'Dnevni jelovnici. Tjedni koji ih koriste ostaju bez dodjele.',
  },
  {
    key: 'recipes',
    label: 'Recepti',
    description: 'Vlastita jela složena od sastojaka.',
  },
  {
    key: 'customFoods',
    label: 'Vlastite namirnice',
    description: 'Namirnice koje si sam dodao. Ugrađena baza ostaje.',
  },
  {
    key: 'overrides',
    label: 'Izmjene ugrađenih namirnica',
    description: 'Preimenovanja, izmijenjene vrijednosti i sakrivene namirnice.',
  },
  {
    key: 'households',
    label: 'Kućanstva',
    description: 'Obitelji i članstva. Same osobe ostaju.',
  },
  {
    key: 'profiles',
    label: 'Osobe',
    description:
      'SVE osobe s njihovim dnevnicima, mjerenjima i ciljevima. Ostaje jedna prazna osoba.',
  },
] as const

export type ResetKey = (typeof RESET_PARTS)[number]['key']

/**
 * Brise odabrane dijelove stanja. Radi na kopiji i nikad ne ostavlja stanje bez
 * osobe, kucanstva ili jelovnika — aplikacija bi inace ostala bez tocke oslonca.
 */
export function resetParts(state: AppState, keys: readonly ResetKey[]): AppState {
  const next = structuredClone(state)
  const selected = new Set<ResetKey>(keys)

  if (selected.has('profiles')) {
    const fresh = {
      id: uid('p'),
      name: 'Osoba 1',
      profile: { sex: 'm' as const, age: 30, act: 1.55, weight: 75, height: 178, goal: 0 },
      log: {},
      measurements: [],
    }
    next.profiles = [fresh]
    next.activeProfileId = fresh.id
    // Kucanstva ostaju, ali bez clanova kojih vise nema.
    for (const household of next.households) household.memberIds = []
  } else {
    if (selected.has('log')) for (const person of next.profiles) person.log = {}
    if (selected.has('measurements')) for (const person of next.profiles) person.measurements = []
  }

  if (selected.has('households')) {
    next.households = [{ id: uid('h'), name: 'Obitelj', memberIds: next.profiles.map((p) => p.id) }]
    for (const week of next.weeks) delete week.householdId
  }

  if (selected.has('weeks')) next.weeks = []

  if (selected.has('menus')) {
    next.menus = [{ id: uid('mn'), meals: emptyMeals() }]
    // Tjedni koji su pokazivali na obrisane jelovnike ostaju, ali prazni.
    for (const week of next.weeks) week.days = week.days.map(() => null)
  }

  if (selected.has('recipes')) next.recipes = []

  if (selected.has('customFoods')) next.customFoods = []

  if (selected.has('overrides')) {
    next.overrides = { names: {}, cats: {}, vals: {}, servs: {}, hidden: [] }
  }

  next.updatedAt = Date.now()
  return next
}

export interface RestoreResult {
  state: AppState
  added: { recipes: number; menus: number; weeks: number }
}

/**
 * Vraca ugradene recepte, jelovnike i sezonske tjedne koji nedostaju.
 *
 * Sijanje se inace dogada samo pri prvom pokretanju, pa stanje nastalo prije
 * nego sto je neki sadrzaj uopce postojao nikad ne bi doslo do njega. Dodaje se
 * samo ono cega nema — postojece se ne dira, pa se izmijenjeni jelovnik nece
 * pregaziti izvornikom.
 */
export function restoreStarterContent(
  state: AppState,
  starter: { recipes: Recipe[]; menus: Menu[]; weeks: WeekPlan[] },
): RestoreResult {
  const next = structuredClone(state)
  const added = { recipes: 0, menus: 0, weeks: 0 }

  const haveRecipes = new Set(next.recipes.map((r) => r.id))
  for (const recipe of starter.recipes) {
    if (haveRecipes.has(recipe.id)) continue
    next.recipes.push(structuredClone(recipe))
    added.recipes++
  }

  const haveMenus = new Set(next.menus.map((m) => m.id))
  for (const menu of starter.menus) {
    if (haveMenus.has(menu.id)) continue
    next.menus.push(structuredClone(menu))
    added.menus++
  }

  // Prazan jelovnik bez naziva je onaj koji stanje dobiva na startu; kad stignu
  // pravi, on samo smeta u popisu.
  if (added.menus > 0) {
    next.menus = next.menus.filter(
      (m) => m.title?.trim() || m.desc?.trim() || m.meals.some((meal) => meal.length > 0),
    )
  }

  const haveWeeks = new Set(next.weeks.map((w) => w.id))
  const knownMenus = new Set(next.menus.map((m) => m.id))
  for (const week of starter.weeks) {
    if (haveWeeks.has(week.id)) {
      // Tjedan postoji, ali su mu dani mozda ispraznjeni jer jelovnika nije bilo.
      const existing = next.weeks.find((w) => w.id === week.id)!
      if (existing.days.every((d) => d === null)) {
        existing.days = week.days.map((id) => (id && knownMenus.has(id) ? id : null))
      }
      continue
    }
    next.weeks.push(structuredClone(week))
    added.weeks++
  }

  next.updatedAt = Date.now()
  return { state: next, added }
}

/** Kratak opis onoga sto ce nestati — za potvrdu prije brisanja. */
export function describeReset(state: AppState, keys: readonly ResetKey[]): string[] {
  const lines: string[] = []
  const has = (k: ResetKey) => keys.includes(k)

  if (has('profiles')) lines.push(`${state.profiles.length} osoba sa svim njihovim podacima`)
  else {
    if (has('log')) {
      const days = state.profiles.reduce((sum, p) => sum + Object.keys(p.log).length, 0)
      lines.push(`${days} dana dnevnika`)
    }
    if (has('measurements')) {
      const count = state.profiles.reduce((sum, p) => sum + p.measurements.length, 0)
      lines.push(`${count} mjerenja težine`)
    }
  }
  if (has('households')) lines.push(`${state.households.length} kućanstava`)
  if (has('weeks')) lines.push(`${state.weeks.length} tjednih planova`)
  if (has('menus')) lines.push(`${state.menus.length} jelovnika`)
  if (has('recipes')) lines.push(`${state.recipes.length} recepata`)
  if (has('customFoods')) lines.push(`${state.customFoods.length} vlastitih namirnica`)
  if (has('overrides')) {
    const count =
      Object.keys(state.overrides.names).length +
      Object.keys(state.overrides.vals).length +
      state.overrides.hidden.length
    lines.push(`${count} izmjena ugrađenih namirnica`)
  }
  return lines
}

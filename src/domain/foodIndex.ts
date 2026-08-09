import { BASE_FOODS } from '../data/foods'
import { OFF_FOODS } from '../data/offFoods'
import type { AppState, BaseFoodOverrides, Food, MealItem } from './types'
import { NUTRIENT_KEYS, isFoodRef } from './types'
import type { FoodLookup } from './nutrients'
import { recipeAsFood } from './recipes'

export interface FoodIndex extends FoodLookup {
  all(): Food[]
  /** Samo prave namirnice — bez jela izvedenih iz recepata. */
  ingredients(): Food[]
}

function applyOverrides(food: Food, ov: BaseFoodOverrides): Food {
  const name = ov.names[food.id]
  const cat = ov.cats[food.id]
  const serv = ov.servs[food.id]
  const vals = ov.vals[food.id]
  if (!name && !cat && !serv && !vals) return food

  const out: Food = { ...food }
  if (name) out.name = name
  if (cat) out.cat = cat
  if (serv && serv > 0) out.serv = serv
  if (vals) {
    for (const k of NUTRIENT_KEYS) {
      const v = vals[k]
      if (typeof v === 'number') out[k] = v
    }
    // ručno izmijenjena vrijednost više nije ona iz vanjske baze
    out.source = 'user'
    delete out.verifiedAt
  }
  return out
}

/**
 * Gradi pretraživač namirnica iz ugrađene baze, korisničkih izmjena, vlastitih
 * namirnica i recepata. Recepti se pretvaraju u izvedene namirnice tek nakon što
 * su sastojci poznati, pa recept ne može sadržavati drugi recept.
 */
export function buildFoodIndex(state: AppState): FoodIndex {
  const hidden = new Set(state.overrides.hidden)

  const ingredients: Food[] = []
  for (const food of [...BASE_FOODS, ...OFF_FOODS]) {
    if (hidden.has(food.id)) continue
    ingredients.push(applyOverrides(food, state.overrides))
  }
  for (const food of state.customFoods) {
    if (!hidden.has(food.id)) ingredients.push(food)
  }

  const ingredientIndex = indexOf(ingredients)
  const derived = state.recipes.map((r) => recipeAsFood(r, ingredientIndex))
  const all = [...ingredients, ...derived]
  const allIndex = indexOf(all)

  return {
    all: () => all,
    ingredients: () => ingredients,
    byId: allIndex.byId,
    byName: allIndex.byName,
  }
}

function indexOf(foods: Food[]): FoodLookup {
  const byId = new Map<string, Food>()
  const byName = new Map<string, Food>()
  for (const f of foods) {
    byId.set(f.id, f)
    const key = f.name.trim().toLowerCase()
    if (!byName.has(key)) byName.set(key, f)
  }
  return {
    byId: (id) => byId.get(id),
    byName: (name) => byName.get(String(name ?? '').trim().toLowerCase()),
  }
}

/** Prolazi kroz svaki popis stavki u stanju: dnevnici, jelovnici i sastojci recepata. */
function forEachItemList(state: AppState, fn: (items: MealItem[]) => void): void {
  for (const person of state.profiles) {
    for (const meals of Object.values(person.log)) for (const meal of meals) fn(meal)
  }
  for (const menu of state.menus) for (const meal of menu.meals) fn(meal)
  for (const recipe of state.recipes) fn(recipe.items)
}

/** Broji koliko puta se namirnica koristi u dnevnicima, jelovnicima i receptima. */
export function foodUsage(state: AppState, foodId: string): number {
  let count = 0
  forEachItemList(state, (items) => {
    for (const item of items) if (isFoodRef(item) && item.foodId === foodId) count++
  })
  return count
}

/**
 * Uklanja sve stavke koje pokazuju na namirnicu i vraca koliko ih je maknuto.
 * Bez ovoga bi brisanje namirnice ostavilo stavke koje se nigdje ne prikazuju
 * ni ne zbrajaju, ali i dalje zauzimaju mjesto u pohrani.
 */
export function removeFoodReferences(state: AppState, foodId: string): number {
  let removed = 0
  forEachItemList(state, (items) => {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]
      if (item && isFoodRef(item) && item.foodId === foodId) {
        items.splice(i, 1)
        removed++
      }
    }
  })
  return removed
}

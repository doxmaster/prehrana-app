import { NUTRIENT_KEYS, isFoodRef } from './types'
import type { Category, DayMeals, Food, MealItem, Nutrients } from './types'

/** Pretraživač namirnica — domena ne poznaje store, samo ovo sučelje. */
export interface FoodLookup {
  byId(id: string): Food | undefined
  byName(name: string): Food | undefined
}

export function zeroNutrients(): Nutrients {
  const t = {} as Nutrients
  for (const k of NUTRIENT_KEYS) t[k] = 0
  return t
}

export function emptyMeals(): DayMeals {
  return [[], [], [], []]
}

export function isEmptyMeals(meals: DayMeals): boolean {
  return meals.every((m) => m.length === 0)
}

/** Vrijednosti stavke na 100 g/ml, ili undefined ako namirnica više ne postoji. */
export function itemPer100(it: MealItem, foods: FoodLookup): Nutrients | undefined {
  if (isFoodRef(it)) return foods.byId(it.foodId)
  return it.n
}

export function itemName(it: MealItem, foods: FoodLookup): string {
  if (isFoodRef(it)) return foods.byId(it.foodId)?.name ?? 'Nepoznata namirnica'
  return it.name || 'AI stavka'
}

export function itemCategory(it: MealItem, foods: FoodLookup): Category {
  if (isFoodRef(it)) return foods.byId(it.foodId)?.cat ?? 'Ostalo'
  return it.cat ?? (it.drink ? 'Pića' : 'Ostalo')
}

/** Pića se mjere u ml, sve ostalo u gramima. */
export function foodUnit(cat: string, name = ''): 'g' | 'ml' {
  return cat === 'Pića' || /mlijeko/i.test(name) ? 'ml' : 'g'
}

export function itemUnit(it: MealItem, foods: FoodLookup): 'g' | 'ml' {
  if (isFoodRef(it)) {
    const f = foods.byId(it.foodId)
    return f ? foodUnit(f.cat, f.name) : 'g'
  }
  return it.drink ? 'ml' : 'g'
}

export function isDrink(it: MealItem, foods: FoodLookup): boolean {
  return itemCategory(it, foods) === 'Pića'
}

/** Skalira vrijednosti sa 100 g na zadanu količinu. */
export function scale(n: Nutrients, grams: number): Nutrients {
  const k = grams / 100
  const out = {} as Nutrients
  for (const key of NUTRIENT_KEYS) out[key] = (n[key] || 0) * k
  return out
}

export function addInto(target: Nutrients, add: Nutrients): Nutrients {
  for (const key of NUTRIENT_KEYS) target[key] += add[key] || 0
  return target
}

/** Zbroj stavki; stavke čija namirnica više ne postoji preskaču se. */
export function sumItems(items: MealItem[], foods: FoodLookup): Nutrients {
  const total = zeroNutrients()
  for (const it of items) {
    const per100 = itemPer100(it, foods)
    if (!per100) continue
    addInto(total, scale(per100, it.g))
  }
  return total
}

export function mealsTotals(meals: DayMeals, foods: FoodLookup): Nutrients {
  return sumItems(meals.flat(), foods)
}

/** Ukupna tekućina u litrama. */
export function mealsFluid(meals: DayMeals, foods: FoodLookup): number {
  let ml = 0
  for (const it of meals.flat()) if (isDrink(it, foods)) ml += it.g
  return ml / 1000
}

/**
 * Alkoholna pića nose ~7 kcal/g iz etanola, koji se ne vodi ni pod jednim
 * makronutrijentom — Atwaterova provjera na njima uvijek pada, pa se preskaču.
 */
export function isAlcoholic(name: string, cat: string): boolean {
  return cat === 'Pića' && /pivo|vino|rakij|liker|viski|votk|\bgin\b|žesti|šampanj|prošek/i.test(name)
}

/**
 * Kalorije bi trebale odgovarati zbroju makronutrijenata: 4 kcal/g za
 * bjelančevine i probavljive ugljikohidrate, 9 kcal/g za masti i ~2 kcal/g za
 * vlakna (zato se vlakna odbijaju od ugljikohidrata — inače povrće bogato
 * vlaknima lažno ispada nekonzistentno).
 *
 * Vraća null kad provjera nema smisla: suplementi bez kalorija, alkohol.
 * NAPOMENA: ista formula postoji i u scripts/generate-foods.mjs jer generator
 * ne može uvoziti TypeScript.
 */
export function atwaterDeviation(n: Nutrients): number | null {
  const netCarbs = Math.max(0, (n.c || 0) - (n.fib || 0))
  const computed = 4 * (n.p || 0) + 4 * netCarbs + 2 * (n.fib || 0) + 9 * (n.f || 0)
  if (n.kcal < 20 && computed < 20) return null
  const base = Math.max(n.kcal, computed)
  if (base <= 0) return null
  return Math.abs(n.kcal - computed) / base
}

export const ATWATER_TOLERANCE = 0.15

/** Jesu li vrijednosti energetski konzistentne — koristi se nad AI odgovorima. */
export function isPlausible(n: Nutrients, name = '', cat = ''): boolean {
  if (isAlcoholic(name, cat)) return true
  const dev = atwaterDeviation(n)
  return dev === null || dev <= ATWATER_TOLERANCE
}

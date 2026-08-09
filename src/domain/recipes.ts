import { NUTRIENT_KEYS } from './types'
import type { Food, FoodRefItem, Nutrients, Recipe } from './types'
import { addInto, scale, zeroNutrients, type FoodLookup } from './nutrients'

export interface RecipeTotals {
  /** Zbroj svih sastojaka. */
  total: Nutrients
  /** Masa gotovog jela u gramima (nakon yieldFactor). */
  grams: number
  /** Vrijednosti na 100 g gotovog jela. */
  per100: Nutrients
  /** Sastojci koji više ne postoje u bazi. */
  missing: number
}

export function recipeTotals(recipe: Recipe, foods: FoodLookup): RecipeTotals {
  const total = zeroNutrients()
  let rawGrams = 0
  let missing = 0

  for (const item of recipe.items) {
    const food = foods.byId(item.foodId)
    if (!food) {
      missing++
      continue
    }
    addInto(total, scale(food, item.g))
    rawGrams += item.g
  }

  const grams = Math.max(1, rawGrams * (recipe.yieldFactor ?? 1))
  const per100 = zeroNutrients()
  for (const k of NUTRIENT_KEYS) per100[k] = (total[k] / grams) * 100

  return { total, grams, per100, missing }
}

/**
 * Recept se u ostatku aplikacije ponaša kao obična namirnica: vrijednosti na 100 g
 * gotovog jela, a predložena porcija je jedna porcija recepta. Time cijeli lanac
 * izračuna (zbrajanje obroka, popis za kupovinu, ciljevi) radi bez izmjena.
 */
export function recipeAsFood(recipe: Recipe, foods: FoodLookup): Food {
  const { per100, grams } = recipeTotals(recipe, foods)
  const servings = Math.max(1, recipe.servings || 1)
  return {
    id: `r:${recipe.id}`,
    recipeId: recipe.id,
    name: recipe.name,
    cat: recipe.cat,
    serv: Math.round(grams / servings),
    source: 'recipe',
    ...per100,
  }
}

export function isRecipeFoodId(id: string): boolean {
  return id.startsWith('r:')
}

export function recipeIdFromFoodId(id: string): string {
  return id.slice(2)
}

/**
 * Razlaze stavku na stvarne namirnice.
 *
 * Za nabavu je ovo nuzno: "sarma 450 g" se ne moze kupiti, nego kupus, mljeveno
 * meso i riza u odgovarajucim kolicinama. Uzeta kolicina se pretvara u udio
 * cijelog recepta, pa se svaki sastojak skalira tim udjelom.
 *
 * Recepti ne mogu sadrzavati druge recepte, pa razlaganje ide samo jednu razinu.
 */
export function expandToIngredients(
  item: FoodRefItem,
  foods: FoodLookup,
  recipes: Recipe[],
): FoodRefItem[] {
  if (!isRecipeFoodId(item.foodId)) return [item]

  const recipe = recipes.find((r) => r.id === recipeIdFromFoodId(item.foodId))
  if (!recipe) return [item]

  const { grams } = recipeTotals(recipe, foods)
  if (!(grams > 0)) return []

  const share = item.g / grams
  return recipe.items.map((ingredient) => ({
    foodId: ingredient.foodId,
    g: ingredient.g * share,
  }))
}

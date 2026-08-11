import { useMemo } from 'react'
import { personConditions, rateDish, worstFlag } from '../domain/conditions'
import { itemCategory, itemName, itemPer100 } from '../domain/nutrients'
import { useActivePerson, useAppStore, useFoods } from '../store/useAppStore'
import type { FoodFlag } from '../domain/conditions'
import type { DayMeals, Food, MealItem } from '../domain/types'

export interface ConditionCheck {
  /** Stanja odabrane osobe; prazno kad ih nema. */
  ids: string[]
  active: boolean
  /** Najteža primjedba na namirnicu ili jelo (jelo uključuje i sastojke). */
  food(food: Food): FoodFlag | undefined
  item(item: MealItem): FoodFlag | undefined
  /** Sve primjedbe na dan ili jelovnik, bez ponavljanja. */
  meals(meals: DayMeals): FoodFlag[]
}

/**
 * Ocjena namirnica prema stanjima ODABRANE osobe.
 *
 * Jelovnici i recepti zajednicki su za sve ukucane, pa se ocjenjuje prema onome
 * tko je trenutno odabran gore — isto kao sto se i ciljevi prikazuju za njega.
 */
export function useConditionCheck(): ConditionCheck {
  const person = useActivePerson()
  const foods = useFoods()
  const recipes = useAppStore((s) => s.data.recipes)
  const ids = useMemo(() => personConditions(person), [person])

  return useMemo(() => {
    const byRecipe = new Map(recipes.map((r) => [r.id, r]))

    const food = (f: Food): FoodFlag | undefined => {
      if (!ids.length) return undefined
      const recipe = f.recipeId ? byRecipe.get(f.recipeId) : undefined
      if (!recipe) return worstFlag(f, ids)
      const parts = recipe.items
        .map((i) => foods.byId(i.foodId))
        .filter((x): x is Food => Boolean(x))
      return rateDish(f, parts, ids)[0]
    }

    const item = (it: MealItem): FoodFlag | undefined => {
      if (!ids.length) return undefined
      const known = 'foodId' in it ? foods.byId(it.foodId) : undefined
      if (known) return food(known)

      const per100 = itemPer100(it, foods)
      if (!per100) return undefined
      // AI stavka nije u bazi, pa se sastavlja privremena namirnica s istim
      // vrijednostima — pravila gledaju vrijednosti i naziv, ne podrijetlo.
      return worstFlag(
        { ...per100, id: 'x', name: itemName(it, foods), cat: itemCategory(it, foods), serv: 100, source: 'user' },
        ids,
      )
    }

    return {
      ids,
      active: ids.length > 0,
      food,
      item,
      meals: (meals: DayMeals) => {
        if (!ids.length) return []
        const best = new Map<string, FoodFlag>()
        for (const meal of meals) {
          for (const it of meal) {
            const flag = item(it)
            if (!flag) continue
            const existing = best.get(flag.condition)
            if (!existing || (existing.level === 'oprez' && flag.level === 'izbjegavaj')) {
              best.set(flag.condition, flag)
            }
          }
        }
        return [...best.values()].sort((a, b) =>
          a.level === b.level ? 0 : a.level === 'izbjegavaj' ? -1 : 1,
        )
      },
    }
  }, [ids, foods, recipes])
}

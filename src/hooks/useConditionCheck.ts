import { useMemo } from 'react'
import { capBreaches, conditionPlan, personConditions, rateDish, worstFlag } from '../domain/conditions'
import { itemCategory, itemName, itemPer100, mealsTotals } from '../domain/nutrients'
import { portionFactor } from '../domain/household'
import { portionedMeals } from '../domain/plan'
import { targetsFor, weightOn } from '../domain/targets'
import { todayISO } from '../domain/dates'
import { useActivePerson, useAppStore, useFoods } from '../store/useAppStore'
import type { CapBreach, ConditionPlan, FoodFlag } from '../domain/conditions'
import type { DayMeals, Food, MealItem } from '../domain/types'

export interface ConditionCheck {
  /** Stanja odabrane osobe; prazno kad ih nema. */
  ids: string[]
  active: boolean
  /** Ciljevi i granice odabrane osobe. */
  plan: ConditionPlan
  /** Najteža primjedba na namirnicu ili jelo (jelo uključuje i sastojke). */
  food(food: Food): FoodFlag | undefined
  item(item: MealItem): FoodFlag | undefined
  /** Sve primjedbe na dan ili jelovnik, bez ponavljanja. */
  meals(meals: DayMeals): FoodFlag[]
  /**
   * Ocjena CIJELOG dana ili jelovnika.
   *
   * Gdje stanje ima brojcanu granicu, gleda se zbroj dana — jedan komad
   * junetine nije problem, prekoracena granica zeljeza jest. Gdje granice nema
   * (gluten, laktoza), i dalje vrijedi sastojak, jer se drukcije ne moze znati.
   */
  day(meals: DayMeals): { breaches: CapBreach[]; flags: FoodFlag[]; worst?: FoodFlag }
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

  const plan = useMemo(() => {
    const today = todayISO()
    return conditionPlan(targetsFor(person, today), person, weightOn(person, today))
  }, [person])

  return useMemo(() => {
    const byRecipe = new Map(recipes.map((r) => [r.id, r]))
    /** Stanja koja se mjere brojkom — kod njih sastojak nije mjerilo, zbroj jest. */
    const numeric = new Set(plan.caps.map((c) => c.condition))
    const factor = portionFactor(person)

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

    const meals = (list: DayMeals) => {
      if (!ids.length) return []
      const best = new Map<string, FoodFlag>()
      for (const meal of list) {
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
    }

    return {
      ids,
      active: ids.length > 0,
      plan,
      food,
      item,
      meals,
      day: (list: DayMeals) => {
        if (!ids.length) return { breaches: [], flags: [] }
        const totals = mealsTotals(portionedMeals(list, factor), foods)
        const breaches = capBreaches(totals, plan.caps)
        const flags = meals(list).filter((f) => !numeric.has(f.condition))

        const worst: FoodFlag | undefined = breaches.length
          ? {
              level: 'izbjegavaj',
              why: breaches
                .map((b) => `${b.cap.why.split('.')[0]} — dan daje ${Math.round(b.value)}, granica je ${b.cap.max}.`)
                .join(' '),
              condition: breaches[0]!.cap.condition,
              conditionName: breaches[0]!.cap.conditionName,
            }
          : flags[0]

        const out: { breaches: CapBreach[]; flags: FoodFlag[]; worst?: FoodFlag } = { breaches, flags }
        if (worst) out.worst = worst
        return out
      },
    }
  }, [ids, foods, recipes, plan, person])
}

import { NUTRIENT_KEYS, isFoodRef } from './types'
import type { MealItem, Menu, Nutrients, Recipe, WeekPlan } from './types'
import { addInto, emptyMeals, foodUnit, itemName, mealsTotals, zeroNutrients, type FoodLookup } from './nutrients'
import { expandToIngredients } from './recipes'

export const WEEK_LENGTH = 7

export function emptyWeekDays(): (string | null)[] {
  return Array.from({ length: WEEK_LENGTH }, () => null)
}

/** Jelovnik dodijeljen danu u tjednu, ili undefined ako je dan slobodan. */
export function menuForDay(
  week: WeekPlan,
  dayIndex: number,
  menus: Menu[],
): Menu | undefined {
  const id = week.days[dayIndex]
  if (!id) return undefined
  return menus.find((m) => m.id === id)
}

export interface WeekSummary {
  /** Zbroj za cijeli tjedan, za jednu referentnu odraslu osobu. */
  total: Nutrients
  /** Prosjek po danu koji ima jelovnik. */
  average: Nutrients
  /** Koliko dana u tjednu ima dodijeljen jelovnik. */
  plannedDays: number
  /** Dani koji pokazuju na jelovnik koji vise ne postoji. */
  brokenDays: number[]
}

export function weekSummary(week: WeekPlan, menus: Menu[], foods: FoodLookup): WeekSummary {
  const total = zeroNutrients()
  const brokenDays: number[] = []
  let plannedDays = 0

  week.days.forEach((menuId, index) => {
    if (!menuId) return
    const menu = menus.find((m) => m.id === menuId)
    if (!menu) {
      brokenDays.push(index)
      return
    }
    plannedDays++
    addInto(total, mealsTotals(menu.meals, foods))
  })

  const average = zeroNutrients()
  if (plannedDays > 0) for (const key of NUTRIENT_KEYS) average[key] = total[key] / plannedDays

  return { total, average, plannedDays, brokenDays }
}

export interface ShoppingLine {
  name: string
  cat: string
  /** Kolicina za cijelo kucanstvo, zaokruzena na gram. */
  grams: number
  unit: 'g' | 'ml'
}

/**
 * Popis za nabavu preko cijelog tjedna. Kolicine iz jelovnika vrijede za jednu
 * referentnu odraslu osobu, pa se mnoze udjelom kucanstva.
 */
export function weekShoppingList(
  week: WeekPlan,
  menus: Menu[],
  foods: FoodLookup,
  /** Obvezno: bez recepata popis bi sadrzavao "sarma" umjesto sastojaka. */
  recipes: Recipe[],
  factor = 1,
): Record<string, ShoppingLine[]> {
  const totals = new Map<string, { grams: number; cat: string }>()

  const add = (item: MealItem) => {
    const name = itemName(item, foods)
    const cat = isFoodRef(item) ? (foods.byId(item.foodId)?.cat ?? 'Ostalo') : (item.cat ?? 'Ostalo')
    const entry = totals.get(name) ?? { grams: 0, cat }
    entry.grams += item.g * factor
    totals.set(name, entry)
  }

  for (const menuId of week.days) {
    if (!menuId) continue
    const menu = menus.find((m) => m.id === menuId)
    if (!menu) continue

    for (const meal of menu.meals) {
      for (const item of meal) {
        // Jelo iz recepta se razlaze na sastojke — sarma se ne kupuje, nego
        // kupus, mljeveno meso i riza.
        if (isFoodRef(item)) {
          for (const ingredient of expandToIngredients(item, foods, recipes)) add(ingredient)
        } else {
          add(item)
        }
      }
    }
  }

  const byCategory: Record<string, ShoppingLine[]> = {}
  for (const [name, { grams, cat }] of totals) {
    ;(byCategory[cat] ??= []).push({
      name,
      cat,
      grams: Math.round(grams),
      unit: foodUnit(cat, name),
    })
  }
  for (const lines of Object.values(byCategory)) {
    lines.sort((a, b) => a.name.localeCompare(b.name, 'hr'))
  }
  return byCategory
}

/** Kratki opis tjedna iz naziva dodijeljenih jelovnika. */
export function weekDescription(week: WeekPlan, menus: Menu[]): string {
  const names: string[] = []
  week.days.forEach((id) => {
    if (!id) return
    const menu = menus.find((m) => m.id === id)
    const name = menu?.title?.trim()
    if (name && !names.includes(name)) names.push(name)
  })
  if (!names.length) return 'nema dodijeljenih jelovnika'
  return names.slice(0, 4).join(', ') + (names.length > 4 ? '…' : '')
}

/** Prazan jelovnik za dan bez dodjele — koristi se pri prikazu. */
export const EMPTY_DAY = emptyMeals()

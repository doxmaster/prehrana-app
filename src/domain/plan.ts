import { WEEK_LENGTH } from './weeks'
import { emptyMeals } from './nutrients'
import { mondayOf } from './dates'
import { isFoodRef } from './types'
import type { DayMeals, MealItem, Menu, WeekPlan } from './types'

/** Sto je za neki datum bilo planirano. */
export interface PlannedDay {
  week: WeekPlan
  /** 0 = ponedjeljak. */
  dayIndex: number
  /** Jelovnik dodijeljen tom danu; nedostaje kad je dan ostavljen slobodnim. */
  menu?: Menu
}

/**
 * Tjedan koji pokriva zadani datum.
 *
 * Vezu drzi `startDate` — tjedan bez njega je samo obrazac (npr. sezonski) i
 * namjerno se ne vezuje ni uz jedan datum. Kad dva tjedna imaju isti pocetak,
 * uzima se zadnji: to je onaj koji je korisnik napravio kasnije.
 */
export function planForDate(
  weeks: readonly WeekPlan[],
  menus: readonly Menu[],
  date: string,
): PlannedDay | undefined {
  const monday = mondayOf(date)
  const week = [...weeks].reverse().find((w) => w.startDate === monday)
  if (!week) return undefined

  const dayIndex = dayIndexOf(date)
  const menuId = week.days[dayIndex]
  const menu = menuId ? menus.find((m) => m.id === menuId) : undefined

  const planned: PlannedDay = { week, dayIndex }
  if (menu) planned.menu = menu
  return planned
}

/** Redni broj dana u tjednu, 0 = ponedjeljak. */
export function dayIndexOf(date: string): number {
  const monday = mondayOf(date)
  const diff = Math.round((Date.parse(date) - Date.parse(monday)) / 86_400_000)
  return Math.min(WEEK_LENGTH - 1, Math.max(0, diff))
}

/**
 * Skalira kolicine na porciju jedne osobe.
 *
 * Jelovnik je pisan za jednu referentnu odraslu osobu, pa dijete ne upisuje
 * isti tanjur. Gram se nikad ne zaokruzuje na nulu — stavka bez kolicine je
 * gora od nepreciznog grama.
 */
export function portionedMeals(meals: DayMeals, factor: number): DayMeals {
  const f = factor > 0 ? factor : 1
  return meals.map((meal) => meal.map((item) => ({ ...item, g: Math.max(1, Math.round(item.g * f)) })))
}

export type DayStatus =
  /** Za taj datum nema tjedna s datumom ili je dan ostavljen slobodnim. */
  | 'bez-plana'
  /** Plan postoji, dnevnik je prazan. */
  | 'planirano'
  /** Dnevnik odgovara planu. */
  | 'potvrdeno'
  /** Dnevnik postoji, ali se razlikuje od plana. */
  | 'izmijenjeno'

const sameItem = (a: MealItem, b: MealItem): boolean => {
  if (isFoodRef(a) !== isFoodRef(b)) return false
  if (isFoodRef(a) && isFoodRef(b)) return a.foodId === b.foodId && a.g === b.g
  return !isFoodRef(a) && !isFoodRef(b) && a.name === b.name && a.g === b.g
}

/** Odgovara li obrok u dnevniku onome sto je planirano. */
export function mealMatches(logged: MealItem[] | undefined, planned: MealItem[]): boolean {
  const have = logged ?? []
  if (have.length !== planned.length) return false
  return planned.every((item, i) => sameItem(have[i]!, item))
}

export function dayStatus(logged: DayMeals | undefined, planned: DayMeals | undefined): DayStatus {
  if (!planned) return 'bez-plana'
  const empty = !logged || logged.every((meal) => meal.length === 0)
  if (empty) return 'planirano'
  return planned.every((meal, i) => mealMatches(logged[i], meal)) ? 'potvrdeno' : 'izmijenjeno'
}

/**
 * Upisuje planirani obrok u dnevnik.
 *
 * Kopiraju se STAVKE, ne veza na jelovnik: kad se recept poslije promijeni,
 * vec zabiljezen dan mora ostati kakav je bio. Isto nacelo vrijedi i za
 * recepte u dnevniku.
 */
export function confirmMeal(day: DayMeals, mealIndex: number, planned: MealItem[]): DayMeals {
  const next = emptyMeals()
  day.forEach((meal, i) => {
    if (i < next.length) next[i] = [...meal]
  })
  next[mealIndex] = planned.map((item) => ({ ...item }))
  return next
}

/** Upisuje cijeli planirani dan. */
export function confirmDay(planned: DayMeals): DayMeals {
  const next = emptyMeals()
  planned.forEach((meal, i) => {
    next[i] = meal.map((item) => ({ ...item }))
  })
  return next
}

/**
 * Kopija tjedna vezana uz konkretan ponedjeljak.
 *
 * Predlozak (sezonski tjedan) namjerno se KOPIRA umjesto da mu se upise datum:
 * inace bi "Ljetni tjedan" prestao biti predlozak cim ga se jednom upotrijebi,
 * pa bi ga za sljedeci tjedan trebalo raditi ispocetka. Oznaka sezone se ne
 * prenosi jer kopija vise nije predlozak nego jedan konkretan tjedan.
 */
export function weekAppliedTo(
  week: WeekPlan,
  date: string,
  identity: { id: string; title: string },
): WeekPlan {
  const copy: WeekPlan = {
    ...structuredClone(week),
    id: identity.id,
    title: identity.title,
    startDate: mondayOf(date),
  }
  delete copy.season
  return copy
}

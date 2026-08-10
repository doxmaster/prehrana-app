import { addDays } from './dates'
import { mealsTotals, type FoodLookup } from './nutrients'
import { targetsFor } from './targets'
import type { NutrientKey, Person } from './types'

export interface SeriesPoint {
  date: string
  value: number
}

/** Raspon dana koji grafovi pokrivaju. */
export const RANGES = [
  { days: 30, label: '30 dana' },
  { days: 90, label: '3 mjeseca' },
  { days: 365, label: 'godina' },
] as const

export type RangeDays = (typeof RANGES)[number]['days']

export function rangeStart(endDate: string, days: number): string {
  return addDays(endDate, -(days - 1))
}

/**
 * Izmjerena tezina kroz vrijeme. Vraca samo dane kad je stvarno izmjereno —
 * povlacenje ravne crte kroz razdoblje bez vaganja lagalo bi o podacima.
 */
export function weightSeries(person: Person, from: string, to: string): SeriesPoint[] {
  return (person.measurements ?? [])
    .filter((m) => typeof m.weight === 'number' && m.date >= from && m.date <= to)
    .map((m) => ({ date: m.date, value: m.weight as number }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Unesene kalorije po danu; dani bez unosa se izostavljaju, ne broje kao nula. */
export function kcalSeries(
  person: Person,
  foods: FoodLookup,
  from: string,
  to: string,
): SeriesPoint[] {
  const out: SeriesPoint[] = []
  for (const [date, meals] of Object.entries(person.log)) {
    if (date < from || date > to) continue
    const kcal = mealsTotals(meals, foods).kcal
    if (kcal > 0) out.push({ date, value: kcal })
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

export function nutrientSeries(
  person: Person,
  foods: FoodLookup,
  key: NutrientKey,
  from: string,
  to: string,
): SeriesPoint[] {
  const out: SeriesPoint[] = []
  for (const [date, meals] of Object.entries(person.log)) {
    if (date < from || date > to) continue
    const totals = mealsTotals(meals, foods)
    if (totals.kcal > 0) out.push({ date, value: totals[key] })
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

/** Cilj kalorija za dan — mijenja se ako se mijenjala izmjerena tezina. */
export function kcalTargetOn(person: Person, date: string): number {
  return targetsFor(person, date).kcal
}

export interface TrendSummary {
  first: SeriesPoint | null
  last: SeriesPoint | null
  /** Razlika zadnje − prvo; null kad nema barem dvije tocke. */
  change: number | null
  min: number
  max: number
  average: number
}

export function summarize(points: SeriesPoint[]): TrendSummary {
  if (!points.length) {
    return { first: null, last: null, change: null, min: 0, max: 0, average: 0 }
  }
  const values = points.map((p) => p.value)
  const first = points[0]!
  const last = points.at(-1)!
  return {
    first,
    last,
    change: points.length > 1 ? last.value - first.value : null,
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((a, b) => a + b, 0) / values.length,
  }
}

/**
 * Klizni prosjek kroz `window` dana. Tezina dnevno oscilira i po kilogram zbog
 * vode, pa je trend citljiv tek kroz prosjek.
 */
export function movingAverage(points: SeriesPoint[], window = 7): SeriesPoint[] {
  if (points.length < 2) return []
  return points.map((point) => {
    const from = addDays(point.date, -(window - 1))
    const inWindow = points.filter((p) => p.date >= from && p.date <= point.date)
    const sum = inWindow.reduce((acc, p) => acc + p.value, 0)
    return { date: point.date, value: sum / inWindow.length }
  })
}

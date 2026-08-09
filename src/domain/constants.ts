import type { Category, NutrientKey } from './types'

export const MEALS = ['Doručak', 'Ručak', 'Večera', 'Međuobrok'] as const
export type MealName = (typeof MEALS)[number]

export const MEAL_INDEX: Record<MealName, number> = {
  Doručak: 0,
  Ručak: 1,
  Večera: 2,
  Međuobrok: 3,
}

export interface NutrientMeta {
  key: NutrientKey
  label: string
  unit: string
  /** Broj decimala pri prikazu. */
  dec: number
}

export const NUTRIENTS: NutrientMeta[] = [
  { key: 'kcal', label: 'Kalorije', unit: 'kcal', dec: 0 },
  { key: 'p', label: 'Bjelančevine', unit: 'g', dec: 1 },
  { key: 'c', label: 'Ugljikohidrati', unit: 'g', dec: 1 },
  { key: 'f', label: 'Masti', unit: 'g', dec: 1 },
  { key: 'fib', label: 'Vlakna', unit: 'g', dec: 1 },
  { key: 'fe', label: 'Željezo', unit: 'mg', dec: 1 },
  { key: 'ca', label: 'Kalcij', unit: 'mg', dec: 0 },
  { key: 'mg', label: 'Magnezij', unit: 'mg', dec: 0 },
  { key: 'vc', label: 'Vitamin C', unit: 'mg', dec: 1 },
  { key: 'vd', label: 'Vitamin D', unit: 'µg', dec: 1 },
]

/** Makronutrijenti — prikazuju se odvojeno od mikronutrijenata. */
export const MACRO_KEYS: NutrientKey[] = ['p', 'c', 'f', 'fib']
export const MICRO_KEYS: NutrientKey[] = ['fe', 'ca', 'mg', 'vc', 'vd']

export const CAT_COLORS: Record<Category, string> = {
  'Meso i riba': '#d15a52',
  'Mliječno i jaja': '#d9a521',
  'Žitarice i kruh': '#c17d1a',
  Mahunarke: '#7f8b2e',
  Povrće: '#2e9d5f',
  Voće: '#d1568f',
  'Orašasti i masti': '#9c6b3f',
  Pića: '#3a86c4',
  Suplementi: '#7c4dd6',
  Ostalo: '#7a8a80',
}

export function catColor(cat: string): string {
  return CAT_COLORS[cat as Category] ?? CAT_COLORS['Ostalo']
}

export const STORAGE_KEY = 'prehrana_v3'
/** Ključevi ranijih verzija — čitaju se jednom, radi migracije. */
export const LEGACY_KEYS = ['prehrana_artifact_v2', 'prehrana_artifact_v1']

/** Ključevi hranjivih tvari koje aplikacija prati. */
export const NUTRIENT_KEYS = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'mg', 'vc', 'vd'] as const
export type NutrientKey = (typeof NUTRIENT_KEYS)[number]

/** Vrijednosti hranjivih tvari — uvijek na 100 g (100 ml za pića). */
export type Nutrients = Record<NutrientKey, number>

export const CATEGORIES = [
  'Meso i riba',
  'Mliječno i jaja',
  'Žitarice i kruh',
  'Mahunarke',
  'Povrće',
  'Voće',
  'Orašasti i masti',
  'Pića',
  'Suplementi',
  'Ostalo',
] as const
export type Category = (typeof CATEGORIES)[number]

/**
 * Odakle vrijednosti dolaze:
 * `usda`/`off` = provjereno prema bazi, `ai` = Claudeova procjena, `user` = ručni unos,
 * `recipe` = izvedeno iz sastojaka recepta.
 */
export type FoodSource = 'usda' | 'off' | 'ai' | 'user' | 'recipe'

export interface Food extends Nutrients {
  id: string
  name: string
  cat: Category
  /** Uobičajena porcija u g (ml za pića) — koristi se kao predložena količina. */
  serv: number
  source: FoodSource
  /** Identifikator u izvornoj bazi (USDA fdcId ili OFF barkod). */
  sourceId?: string
  /** ISO datum zadnje provjere prema izvoru. */
  verifiedAt?: string
  /** Namirnica iz ugrađene baze (nije korisnička). */
  base?: boolean
  /** Postavljeno kad je namirnica izvedena iz recepta. */
  recipeId?: string
}

/** Stavka obroka koja pokazuje na namirnicu iz baze. */
export interface FoodRefItem {
  foodId: string
  g: number
}

/** Stavka koju je AI procijenio, a nije spremljena u bazu — nosi vlastite vrijednosti. */
export interface AdHocItem {
  name: string
  g: number
  n: Nutrients
  drink?: boolean
  cat?: Category
}

export type MealItem = FoodRefItem | AdHocItem

export function isFoodRef(it: MealItem): it is FoodRefItem {
  return 'foodId' in it && typeof it.foodId === 'string'
}

/** Četiri obroka u danu, redoslijedom iz MEALS. */
export type DayMeals = MealItem[][]

export interface Recipe {
  id: string
  name: string
  cat: Category
  /** Broj porcija koje sastojci daju — koristi se za prijedlog porcije. */
  servings: number
  items: FoodRefItem[]
  /** Gubitak/dobitak mase pri pripremi (npr. 0.85 za kuhanje). 1 = bez promjene. */
  yieldFactor?: number
  note?: string
}

export interface Measurement {
  /** ISO datum (YYYY-MM-DD). */
  date: string
  weight?: number
  waist?: number
  note?: string
}

export interface Profile {
  sex: 'm' | 'z'
  age: number
  act: number
  weight: number
  height: number
  goal: number
}

export interface Person {
  id: string
  name: string
  profile: Profile
  /** Pojedeno, po ISO datumu. */
  log: Record<string, DayMeals>
  /** Naslijeđeno iz v1/v2 — zadržano samo radi migracije u jelovnike. */
  plan?: Record<string, DayMeals>
  measurements: Measurement[]
  /**
   * Ručno zadan udio u nabavi. Kad ga nema, računa se iz dnevnog cilja kalorija
   * naspram referentnog odraslog unosa (2000 kcal).
   */
  portionFactor?: number
}

/**
 * Podrijetlo jela. Generator tjedana drzi se domace i regionalne kuhinje, a
 * `ostalo` pusta najvise jednom tjedno kao izuzetak.
 */
export const CUISINES = ['hrvatska', 'regionalna', 'ostalo'] as const
export type Cuisine = (typeof CUISINES)[number]

/** Jedan dan jelovnika — gradivni element tjednog plana. */
export interface Menu {
  id: string
  title?: string
  desc?: string
  meals: DayMeals
  cuisine?: Cuisine
}

export interface Household {
  id: string
  name: string
  /** Identifikatori osoba; osoba može biti član više kućanstava. */
  memberIds: string[]
}

/** Dani u tjednu, od ponedjeljka. */
export const WEEKDAY_NAMES = [
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Petak',
  'Subota',
  'Nedjelja',
] as const

/**
 * Tjedni plan ne kopira obroke nego pokazuje na dnevne jelovnike, pa se izmjena
 * jelovnika odražava na sve tjedne koji ga koriste. `null` je slobodan dan.
 */
export interface WeekPlan {
  id: string
  title?: string
  desc?: string
  /** Točno 7 mjesta, od ponedjeljka; svako je id jelovnika ili null. */
  days: (string | null)[]
  /** Kućanstvo za koje se računaju količine i nabava. */
  householdId?: string
  /** Oznaka sezone kod ugrađenih jelovnika. */
  season?: 'proljeće' | 'ljeto' | 'jesen' | 'zima'
}

/** Izmjene nad ugrađenim namirnicama, ključ je id namirnice. */
export interface BaseFoodOverrides {
  names: Record<string, string>
  cats: Record<string, Category>
  vals: Record<string, Partial<Nutrients>>
  servs: Record<string, number>
  hidden: string[]
}

export interface AppState {
  version: 4
  profiles: Person[]
  activeProfileId: string
  households: Household[]
  menus: Menu[]
  weeks: WeekPlan[]
  recipes: Recipe[]
  customFoods: Food[]
  overrides: BaseFoodOverrides
  updatedAt: number
}

export interface Targets extends Nutrients {
  bmr: number
  tdee: number
  water: number
}

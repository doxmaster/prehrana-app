import { describe, expect, it } from 'vitest'
import { STARTER_MENUS, STARTER_WEEKS } from '../src/data/menus'
import { STARTER_RECIPES } from '../src/data/recipes'
import { emptyState } from '../src/domain/migrate'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { mealsTotals } from '../src/domain/nutrients'
import { WEEK_LENGTH, weekShoppingList, weekSummary } from '../src/domain/weeks'
import { isFoodRef } from '../src/domain/types'

/** Stanje kakvo dobiva novi korisnik: ugrađeni recepti, jelovnici i tjedni. */
function seeded() {
  const state = emptyState()
  state.recipes = structuredClone(STARTER_RECIPES)
  state.menus = structuredClone(STARTER_MENUS)
  state.weeks = structuredClone(STARTER_WEEKS)
  return state
}

const state = seeded()
const foods = buildFoodIndex(state)

describe('ugrađeni dnevni jelovnici', () => {
  it('identifikatori su jedinstveni', () => {
    const ids = STARTER_MENUS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('svaka stavka pokazuje na postojeću namirnicu ili recept', () => {
    const missing: string[] = []
    for (const menu of STARTER_MENUS) {
      for (const meal of menu.meals) {
        for (const item of meal) {
          if (!isFoodRef(item)) continue
          if (!foods.byId(item.foodId)) missing.push(`${menu.title} → ${item.foodId}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it('svaki jelovnik ima točno četiri obroka', () => {
    for (const menu of STARTER_MENUS) expect(menu.meals).toHaveLength(4)
  })

  it.each(STARTER_MENUS.map((m) => [m.title ?? m.id, m] as const))(
    '%s daje razuman dnevni unos za odraslu osobu',
    (_title, menu) => {
      const kcal = mealsTotals(menu.meals, foods).kcal
      expect(kcal).toBeGreaterThan(1800)
      expect(kcal).toBeLessThan(2800)
    },
  )

  it.each(STARTER_MENUS.map((m) => [m.title ?? m.id, m] as const))(
    '%s ima bjelančevine u smislenom rasponu',
    (_title, menu) => {
      const totals = mealsTotals(menu.meals, foods)
      expect(totals.p).toBeGreaterThan(70)
      expect(totals.p).toBeLessThan(250)
    },
  )

  it('svaki jelovnik ima ručak — bez njega dan nema smisla', () => {
    for (const menu of STARTER_MENUS) expect(menu.meals[1]!.length).toBeGreaterThan(0)
  })
})

describe('ugrađeni sezonski tjedni', () => {
  it('pokrivaju sve četiri sezone', () => {
    expect(STARTER_WEEKS.map((w) => w.season).sort()).toEqual(
      ['jesen', 'ljeto', 'proljeće', 'zima'].sort(),
    )
  })

  it('svaki tjedan ima sedam popunjenih dana', () => {
    for (const week of STARTER_WEEKS) {
      expect(week.days).toHaveLength(WEEK_LENGTH)
      expect(week.days.every((d) => typeof d === 'string' && d.length > 0)).toBe(true)
    }
  })

  it('svi dani pokazuju na postojeći jelovnik', () => {
    const known = new Set(STARTER_MENUS.map((m) => m.id))
    for (const week of STARTER_WEEKS) {
      for (const day of week.days) expect(known.has(day!), `${week.title}: ${day}`).toBe(true)
    }
  })

  it('nijedan tjedan nema pokvarenih dana', () => {
    for (const week of STARTER_WEEKS) {
      const summary = weekSummary(week, state.menus, foods)
      expect(summary.brokenDays).toEqual([])
      expect(summary.plannedDays).toBe(WEEK_LENGTH)
    }
  })

  it.each(STARTER_WEEKS.map((w) => [w.title ?? w.id, w] as const))(
    '%s ima razuman tjedni prosjek',
    (_title, week) => {
      const { average } = weekSummary(week, state.menus, foods)
      expect(average.kcal).toBeGreaterThan(1900)
      expect(average.kcal).toBeLessThan(2600)
    },
  )

  it('tjedni se međusobno razlikuju', () => {
    const potpisi = STARTER_WEEKS.map((w) => w.days.join('|'))
    expect(new Set(potpisi).size).toBe(STARTER_WEEKS.length)
  })

  it('nabava za tjedan nije prazna i raste s veličinom kućanstva', () => {
    const week = STARTER_WEEKS[0]!
    const zaJednog = weekShoppingList(week, state.menus, foods, STARTER_RECIPES, 1)
    const zaObitelj = weekShoppingList(week, state.menus, foods, STARTER_RECIPES, 3)

    expect(Object.keys(zaJednog).length).toBeGreaterThan(3)

    const zbroj = (list: ReturnType<typeof weekShoppingList>) =>
      Object.values(list)
        .flat()
        .reduce((sum, line) => sum + line.grams, 0)
    // Svaka se stavka zaokruzuje na gram, pa se usporeduje omjer, ne apsolutna razlika.
    expect(zbroj(zaObitelj) / zbroj(zaJednog)).toBeCloseTo(3, 2)
  })

  it('recepti se u nabavi razlažu na sastojke, ne kupuje se "sarma"', () => {
    const zima = STARTER_WEEKS.find((w) => w.season === 'zima')!
    const list = weekShoppingList(zima, state.menus, foods, STARTER_RECIPES, 1)
    const names = Object.values(list)
      .flat()
      .map((l) => l.name)
    expect(names).not.toContain('Sarma')
    expect(names).toContain('Kupus')
    expect(names).toContain('Mljeveno meso (miješano)')
  })
})

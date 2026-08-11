import { describe, expect, it } from 'vitest'
import { GENERATED_MENUS } from '../src/data/generatedMenus'
import { STARTER_MENUS, STARTER_WEEKS } from '../src/data/menus'
import { STARTER_RECIPES } from '../src/data/recipes'
import { emptyState } from '../src/domain/migrate'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { mealsTotals } from '../src/domain/nutrients'
import { NO_REPEAT_WEEKS, generateWeek } from '../src/domain/generateWeek'
import { WEEK_LENGTH } from '../src/domain/weeks'
import type { WeekPlan } from '../src/domain/types'

const state = emptyState()
state.recipes = structuredClone(STARTER_RECIPES)
state.menus = structuredClone(STARTER_MENUS)
const foods = buildFoodIndex(state)

describe('složeni dnevni jelovnici', () => {
  it('ima ih dovoljno za tri tjedna bez ijednog ponavljanja', () => {
    expect(STARTER_MENUS.length).toBeGreaterThanOrEqual(WEEK_LENGTH * (NO_REPEAT_WEEKS + 1))
  })

  it('svi su dio ugrađene knjižnice', () => {
    const ids = new Set(STARTER_MENUS.map((m) => m.id))
    for (const menu of GENERATED_MENUS) expect(ids.has(menu.id)).toBe(true)
  })

  it('nijedan ne nosi isti naslov kao ručno složeni dan', () => {
    const naslovi = STARTER_MENUS.map((m) => m.title)
    expect(new Set(naslovi).size).toBe(naslovi.length)
  })

  it('svaki ima oznaku domaće ili regionalne kuhinje', () => {
    for (const menu of GENERATED_MENUS) {
      expect(['hrvatska', 'regionalna'], menu.title).toContain(menu.cuisine)
    }
  })

  it('svaki ima sva četiri obroka popunjena', () => {
    for (const menu of GENERATED_MENUS) {
      expect(menu.meals).toHaveLength(4)
      for (const meal of menu.meals) expect(meal.length, menu.title).toBeGreaterThan(0)
    }
  })

  it.each(GENERATED_MENUS.map((m) => [m.title ?? m.id, m] as const))(
    '%s pada u ciljani raspon dana',
    (_title, menu) => {
      // Ponovni izračun preko domenskog koda — generator računa sam, pa bi tiho
      // odstupanje inače prošlo nezapaženo.
      const totals = mealsTotals(menu.meals, foods)
      expect(totals.kcal).toBeGreaterThanOrEqual(1950)
      expect(totals.kcal).toBeLessThanOrEqual(2250)
      expect(totals.p).toBeGreaterThanOrEqual(70)
    },
  )

  it('ručak je uvijek jelo iz kataloga, ne skup namirnica', () => {
    for (const menu of GENERATED_MENUS) {
      const lunch = menu.meals[1]!
      expect(lunch.some((i) => 'foodId' in i && i.foodId.startsWith('r:')), menu.title).toBe(true)
    }
  })
})

describe('tri uzastopna tjedna iz ugrađene knjižnice', () => {
  it('ne dijele nijedan dan', () => {
    const recent: WeekPlan[] = []
    const svi: string[] = []

    for (let i = 0; i < 3; i++) {
      const r = generateWeek(STARTER_MENUS, { recentWeeks: recent })
      expect(r.unfilled).toBe(0)
      expect(r.note).toBeUndefined()
      recent.unshift({ id: `w${i}`, days: r.days })
      svi.push(...r.days.filter((d): d is string => d !== null))
    }

    expect(new Set(svi).size).toBe(svi.length)
  })
})

describe('sezonski tjedni i dalje pokazuju na ručno složene dane', () => {
  it('nijedan dan nije nestao dodavanjem složenih jelovnika', () => {
    const known = new Set(STARTER_MENUS.map((m) => m.id))
    for (const week of STARTER_WEEKS) {
      for (const day of week.days) expect(known.has(day!), `${week.title}: ${day}`).toBe(true)
    }
  })
})

import { describe, expect, it } from 'vitest'
import { BASE_FOODS } from '../src/data/foods'
import { migrateState } from '../src/domain/migrate'
import { mealsTotals, type FoodLookup } from '../src/domain/nutrients'
import { WEEK_LENGTH, emptyWeekDays, menuForDay, weekDescription, weekShoppingList, weekSummary } from '../src/domain/weeks'
import type { Menu, WeekPlan } from '../src/domain/types'

const byId = new Map(BASE_FOODS.map((f) => [f.id, f]))
const byName = new Map(BASE_FOODS.map((f) => [f.name.toLowerCase(), f]))
const foods: FoodLookup = { byId: (id) => byId.get(id), byName: (n) => byName.get(n.toLowerCase()) }

const id = (name: string) => byName.get(name.toLowerCase())!.id

const RADNI: Menu = {
  id: 'mn-radni',
  title: 'Radni dan',
  meals: [
    [{ foodId: id('Zobene pahuljice'), g: 80 }],
    [{ foodId: id('Pileća prsa (pečena)'), g: 180 }, { foodId: id('Riža bijela (kuhana)'), g: 200 }],
    [{ foodId: id('Jaje (cijelo)'), g: 100 }],
    [{ foodId: id('Jabuka'), g: 150 }],
  ],
}

const RIBLJI: Menu = {
  id: 'mn-ribl',
  title: 'Riblji petak',
  meals: [
    [{ foodId: id('Grčki jogurt'), g: 150 }],
    [{ foodId: id('Losos'), g: 200 }, { foodId: id('Krumpir (kuhani)'), g: 250 }],
    [],
    [],
  ],
}

const MENUS = [RADNI, RIBLJI]

function weekWith(days: (string | null)[]): WeekPlan {
  return { id: 'wk1', title: 'Test tjedan', days }
}

describe('weekSummary', () => {
  it('zbraja samo dane koji imaju jelovnik', () => {
    const week = weekWith(['mn-radni', 'mn-radni', null, null, 'mn-ribl', null, null])
    const summary = weekSummary(week, MENUS, foods)

    expect(summary.plannedDays).toBe(3)
    const expected = 2 * mealsTotals(RADNI.meals, foods).kcal + mealsTotals(RIBLJI.meals, foods).kcal
    expect(summary.total.kcal).toBeCloseTo(expected, 6)
    expect(summary.average.kcal).toBeCloseTo(expected / 3, 6)
  })

  it('prazan tjedan ne dijeli s nulom', () => {
    const summary = weekSummary(weekWith(emptyWeekDays()), MENUS, foods)
    expect(summary.plannedDays).toBe(0)
    expect(summary.total.kcal).toBe(0)
    expect(Number.isFinite(summary.average.kcal)).toBe(true)
    expect(summary.average.kcal).toBe(0)
  })

  it('prijavljuje dane koji pokazuju na obrisani jelovnik', () => {
    const week = weekWith(['mn-radni', 'obrisan', null, null, null, null, null])
    const summary = weekSummary(week, MENUS, foods)
    expect(summary.brokenDays).toEqual([1])
    expect(summary.plannedDays).toBe(1)
  })
})

describe('menuForDay', () => {
  it('vraća jelovnik dodijeljen danu', () => {
    const week = weekWith(['mn-radni', null, null, null, null, null, 'mn-ribl'])
    expect(menuForDay(week, 0, MENUS)?.title).toBe('Radni dan')
    expect(menuForDay(week, 6, MENUS)?.title).toBe('Riblji petak')
    expect(menuForDay(week, 3, MENUS)).toBeUndefined()
  })
})

describe('weekShoppingList', () => {
  const week = weekWith(['mn-radni', 'mn-radni', null, null, 'mn-ribl', null, null])

  it('zbraja iste namirnice preko cijelog tjedna', () => {
    const list = weekShoppingList(week, MENUS, foods, [], 1)
    const zitarice = list['Žitarice i kruh'] ?? []
    const zobene = zitarice.find((l) => l.name === 'Zobene pahuljice')
    expect(zobene?.grams).toBe(160) // 2 × 80 g
  })

  it('množi količine udjelom kućanstva', () => {
    const zaJednog = weekShoppingList(week, MENUS, foods, [], 1)
    const zaObitelj = weekShoppingList(week, MENUS, foods, [], 2.5)
    const naziv = (list: ReturnType<typeof weekShoppingList>) =>
      (list['Žitarice i kruh'] ?? []).find((l) => l.name === 'Zobene pahuljice')!.grams
    expect(naziv(zaObitelj)).toBe(Math.round(naziv(zaJednog) * 2.5))
  })

  it('pića se vode u mililitrima', () => {
    const sPicem: Menu = {
      id: 'mn-pice',
      meals: [[{ foodId: id('Voda'), g: 500 }], [], [], []],
    }
    const list = weekShoppingList(weekWith(['mn-pice', null, null, null, null, null, null]), [sPicem], foods, [], 1)
    expect(list['Pića']?.[0]).toMatchObject({ name: 'Voda', grams: 500, unit: 'ml' })
  })

  it('prazan tjedan daje prazan popis', () => {
    expect(weekShoppingList(weekWith(emptyWeekDays()), MENUS, foods, [], 2)).toEqual({})
  })

  it('dan s obrisanim jelovnikom se preskače', () => {
    const list = weekShoppingList(weekWith(['obrisan', null, null, null, null, null, null]), MENUS, foods, [], 1)
    expect(list).toEqual({})
  })
})

describe('weekDescription', () => {
  it('nabraja nazive dodijeljenih jelovnika bez ponavljanja', () => {
    const week = weekWith(['mn-radni', 'mn-radni', 'mn-ribl', null, null, null, null])
    expect(weekDescription(week, MENUS)).toBe('Radni dan, Riblji petak')
  })

  it('prazan tjedan ima jasnu poruku', () => {
    expect(weekDescription(weekWith(emptyWeekDays()), MENUS)).toBe('nema dodijeljenih jelovnika')
  })
})

describe('migracija tjednih planova', () => {
  it('tjedan uvijek dobiva točno sedam mjesta', () => {
    const state = migrateState({
      profiles: [{ id: 'p1', name: 'A', profile: {} }],
      menus: [{ id: 'mn1', meals: [[], [], [], []] }],
      weeks: [{ id: 'wk1', days: ['mn1', 'mn1'] }],
    })
    expect(state.weeks[0]!.days).toHaveLength(WEEK_LENGTH)
    expect(state.weeks[0]!.days.slice(2).every((d) => d === null)).toBe(true)
  })

  it('dan koji pokazuje na obrisani jelovnik postaje slobodan', () => {
    const state = migrateState({
      profiles: [{ id: 'p1', name: 'A', profile: {} }],
      menus: [{ id: 'mn1', meals: [[], [], [], []] }],
      weeks: [{ id: 'wk1', days: ['mn1', 'nepostoji', null, null, null, null, null] }],
    })
    expect(state.weeks[0]!.days[0]).toBe('mn1')
    expect(state.weeks[0]!.days[1]).toBeNull()
  })

  it('veza na obrisano kućanstvo se uklanja', () => {
    const state = migrateState({
      profiles: [{ id: 'p1', name: 'A', profile: {} }],
      menus: [{ id: 'mn1', meals: [[], [], [], []] }],
      weeks: [{ id: 'wk1', days: [], householdId: 'nepostoji' }],
    })
    expect(state.weeks[0]!.householdId).toBeUndefined()
  })
})

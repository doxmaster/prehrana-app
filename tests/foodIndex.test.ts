import { describe, expect, it } from 'vitest'
import { buildFoodIndex, foodUsage, removeFoodReferences } from '../src/domain/foodIndex'
import { migrateState } from '../src/domain/migrate'
import { mealsTotals } from '../src/domain/nutrients'
import type { AppState } from '../src/domain/types'

function stateWithUsage(): AppState {
  return migrateState({
    profiles: [
      {
        id: 'p1',
        name: 'Test',
        profile: { sex: 'm', age: 30, act: 1.55, weight: 75, height: 178, goal: 0 },
        log: {
          '2026-08-01': [[{ foodId: 'b48', g: 100 }], [{ foodId: 'b0', g: 200 }], [], []],
          '2026-08-02': [[{ foodId: 'b48', g: 150 }], [], [], []],
        },
      },
    ],
    menus: [{ id: 'mn1', meals: [[{ foodId: 'b48', g: 80 }], [], [], []] }],
    recipes: [
      {
        id: 'rc1',
        name: 'Voćna salata',
        cat: 'Voće',
        servings: 2,
        items: [
          { foodId: 'b48', g: 200 },
          { foodId: 'b47', g: 150 },
        ],
      },
    ],
    customFoods: [],
  })
}

describe('foodUsage', () => {
  it('broji stavke u dnevnicima, jelovnicima i receptima', () => {
    const state = stateWithUsage()
    expect(foodUsage(state, 'b48')).toBe(4) // 2 dana + 1 jelovnik + 1 recept
    expect(foodUsage(state, 'b0')).toBe(1)
    expect(foodUsage(state, 'nepostoji')).toBe(0)
  })
})

describe('removeFoodReferences', () => {
  it('uklanja sve stavke i vraća njihov broj', () => {
    const state = stateWithUsage()
    expect(removeFoodReferences(state, 'b48')).toBe(4)
    expect(foodUsage(state, 'b48')).toBe(0)
  })

  it('ne dira ostale namirnice', () => {
    const state = stateWithUsage()
    removeFoodReferences(state, 'b48')
    expect(foodUsage(state, 'b0')).toBe(1)
    expect(state.recipes[0]!.items).toEqual([{ foodId: 'b47', g: 150 }])
  })

  it('nakon brisanja dan više ne broji uklonjene kalorije', () => {
    const state = stateWithUsage()
    const foods = buildFoodIndex(state)
    const before = mealsTotals(state.profiles[0]!.log['2026-08-01']!, foods).kcal
    removeFoodReferences(state, 'b48')
    const after = mealsTotals(state.profiles[0]!.log['2026-08-01']!, buildFoodIndex(state)).kcal
    expect(after).toBeLessThan(before)
    expect(after).toBeGreaterThan(0) // b0 je ostao
  })
})

describe('buildFoodIndex', () => {
  it('skrivena namirnica nestaje iz popisa i pretrage', () => {
    const state = stateWithUsage()
    state.overrides.hidden.push('b48')
    const foods = buildFoodIndex(state)
    expect(foods.byId('b48')).toBeUndefined()
    expect(foods.byName('Banana')).toBeUndefined()
  })

  it('recepti su u popisu, ali ne među sastojcima', () => {
    const foods = buildFoodIndex(stateWithUsage())
    expect(foods.byId('r:rc1')?.name).toBe('Voćna salata')
    expect(foods.ingredients().some((f) => f.id === 'r:rc1')).toBe(false)
    expect(foods.all().some((f) => f.id === 'r:rc1')).toBe(true)
  })

  it('izmjena vrijednosti poništava oznaku provjere prema USDA', () => {
    const state = stateWithUsage()
    const before = buildFoodIndex(state).byId('b48')!
    expect(before.source).toBe('usda')

    state.overrides.vals['b48'] = { kcal: 999 }
    const after = buildFoodIndex(state).byId('b48')!
    expect(after.kcal).toBe(999)
    expect(after.source).toBe('user')
    expect(after.verifiedAt).toBeUndefined()
  })
})

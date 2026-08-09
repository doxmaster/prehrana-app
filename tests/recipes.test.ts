import { describe, expect, it } from 'vitest'
import { BASE_FOODS } from '../src/data/foods'
import { recipeAsFood, recipeTotals } from '../src/domain/recipes'
import { scale, sumItems, type FoodLookup } from '../src/domain/nutrients'
import type { Recipe } from '../src/domain/types'

const byId = new Map(BASE_FOODS.map((f) => [f.id, f]))
const byName = new Map(BASE_FOODS.map((f) => [f.name.toLowerCase(), f]))
const foods: FoodLookup = { byId: (id) => byId.get(id), byName: (n) => byName.get(n.toLowerCase()) }

const id = (name: string) => byName.get(name.toLowerCase())!.id

const PILETINA_S_RIZOM: Recipe = {
  id: 'rc1',
  name: 'Piletina s rižom',
  cat: 'Meso i riba',
  servings: 4,
  items: [
    { foodId: id('Pileća prsa (pečena)'), g: 600 },
    { foodId: id('Riža bijela (kuhana)'), g: 800 },
    { foodId: id('Maslinovo ulje'), g: 30 },
    { foodId: id('Mrkva'), g: 200 },
  ],
}

describe('recipeTotals', () => {
  it('zbroj sastojaka jednak je zbroju istih stavki u obroku', () => {
    const { total } = recipeTotals(PILETINA_S_RIZOM, foods)
    expect(total).toEqual(sumItems(PILETINA_S_RIZOM.items, foods))
  })

  it('masa jela je zbroj gramaža sastojaka', () => {
    expect(recipeTotals(PILETINA_S_RIZOM, foods).grams).toBe(1630)
  })

  it('yieldFactor smanjuje masu i podiže gustoću', () => {
    const kuhano = { ...PILETINA_S_RIZOM, yieldFactor: 0.8 }
    const a = recipeTotals(PILETINA_S_RIZOM, foods)
    const b = recipeTotals(kuhano, foods)
    expect(b.grams).toBeCloseTo(a.grams * 0.8, 6)
    expect(b.per100.kcal).toBeCloseTo(a.per100.kcal / 0.8, 6)
    expect(b.total.kcal).toBeCloseTo(a.total.kcal, 6) // ukupna energija se ne mijenja
  })

  it('prijavljuje sastojke kojih više nema u bazi', () => {
    const brokenRecipe = {
      ...PILETINA_S_RIZOM,
      items: [...PILETINA_S_RIZOM.items, { foodId: 'nepostoji', g: 100 }],
    }
    const r = recipeTotals(brokenRecipe, foods)
    expect(r.missing).toBe(1)
    expect(r.total).toEqual(recipeTotals(PILETINA_S_RIZOM, foods).total)
  })

  it('prazan recept ne dijeli s nulom', () => {
    const prazan: Recipe = { ...PILETINA_S_RIZOM, items: [] }
    const r = recipeTotals(prazan, foods)
    expect(Number.isFinite(r.per100.kcal)).toBe(true)
    expect(r.per100.kcal).toBe(0)
  })
})

describe('recipeAsFood', () => {
  const food = recipeAsFood(PILETINA_S_RIZOM, foods)

  it('porcija je masa jela podijeljena brojem porcija, zaokruženo na gram', () => {
    expect(food.serv).toBe(Math.round(1630 / 4))
  })

  it('jedna porcija daje četvrtinu ukupnih vrijednosti', () => {
    const { total, grams } = recipeTotals(PILETINA_S_RIZOM, foods)
    expect(scale(food, grams / 4).kcal).toBeCloseTo(total.kcal / 4, 6)
    // zaokruživanje porcije na cijeli gram smije odstupati najviše 1 %
    expect(scale(food, food.serv).kcal).toBeCloseTo(total.kcal / 4, -1)
  })

  it('označen je kao izveden iz recepta', () => {
    expect(food.source).toBe('recipe')
    expect(food.recipeId).toBe('rc1')
    expect(food.id).toBe('r:rc1')
  })
})

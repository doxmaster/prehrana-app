import { describe, expect, it } from 'vitest'
import { BASE_FOODS } from '../src/data/foods'
import { STARTER_RECIPES } from '../src/data/recipes'
import { recipeAsFood, recipeTotals } from '../src/domain/recipes'
import { atwaterDeviation, type FoodLookup } from '../src/domain/nutrients'
import { CATEGORIES } from '../src/domain/types'

const byId = new Map(BASE_FOODS.map((f) => [f.id, f]))
const byName = new Map(BASE_FOODS.map((f) => [f.name.toLowerCase(), f]))
const foods: FoodLookup = { byId: (id) => byId.get(id), byName: (n) => byName.get(n.toLowerCase()) }

describe('ugrađeni recepti', () => {
  it('svi sastojci postoje u bazi', () => {
    const missing: string[] = []
    for (const recipe of STARTER_RECIPES) {
      for (const item of recipe.items) {
        if (!byId.has(item.foodId)) missing.push(`${recipe.name} → ${item.foodId}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('nijedan recept ne referencira drugi recept', () => {
    for (const recipe of STARTER_RECIPES) {
      for (const item of recipe.items) expect(item.foodId.startsWith('r:')).toBe(false)
    }
  })

  it('identifikatori su jedinstveni', () => {
    const ids = STARTER_RECIPES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('nazivi se ne sudaraju s namirnicama iz baze', () => {
    for (const recipe of STARTER_RECIPES) {
      expect(byName.has(recipe.name.toLowerCase())).toBe(false)
    }
  })

  it('kategorije su iz dopuštenog popisa', () => {
    for (const recipe of STARTER_RECIPES) expect(CATEGORIES).toContain(recipe.cat)
  })

  it.each(STARTER_RECIPES.map((r) => [r.name, r] as const))(
    '%s daje realne vrijednosti po porciji',
    (_name, recipe) => {
      const { per100, grams, missing } = recipeTotals(recipe, foods)
      expect(missing).toBe(0)
      expect(grams).toBeGreaterThan(0)

      // Gotovo jelo rijetko prelazi 400 kcal/100 g; iznad toga je vjerojatno
      // pogresna gramaza nekog sastojka.
      expect(per100.kcal).toBeGreaterThan(20)
      expect(per100.kcal).toBeLessThan(400)

      const food = recipeAsFood(recipe, foods)
      expect(food.serv).toBeGreaterThan(50)
      expect(food.serv).toBeLessThan(700)
    },
  )

  it.each(STARTER_RECIPES.map((r) => [r.name, r] as const))(
    '%s je energetski konzistentan',
    (_name, recipe) => {
      const { per100 } = recipeTotals(recipe, foods)
      expect(atwaterDeviation(per100)!).toBeLessThan(0.15)
    },
  )

  it('yieldFactor koncentrira vrijednosti, ne mijenja ukupnu energiju', () => {
    const cevapi = STARTER_RECIPES.find((r) => r.id === 'rc-cevapi')!
    expect(cevapi.yieldFactor).toBe(0.8)
    const withYield = recipeTotals(cevapi, foods)
    const withoutYield = recipeTotals({ ...cevapi, yieldFactor: 1 }, foods)
    expect(withYield.total.kcal).toBeCloseTo(withoutYield.total.kcal, 6)
    expect(withYield.per100.kcal).toBeGreaterThan(withoutYield.per100.kcal)
  })
})

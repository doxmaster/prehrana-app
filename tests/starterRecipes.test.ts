import { describe, expect, it } from 'vitest'
import { STARTER_RECIPES } from '../src/data/recipes'
import { STARTER_MENUS } from '../src/data/menus'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { emptyState } from '../src/domain/migrate'
import { recipeAsFood, recipeTotals } from '../src/domain/recipes'
import { atwaterDeviation } from '../src/domain/nutrients'
import { CATEGORIES, CUISINES, isFoodRef } from '../src/domain/types'

/** Pretrazivac nad cijelom bazom — recepti posezu i za dopunom i za OFF proizvodima. */
const foods = buildFoodIndex(emptyState())

describe('ugrađeni recepti — struktura', () => {
  it('ima ih barem stotinu', () => {
    expect(STARTER_RECIPES.length).toBeGreaterThanOrEqual(100)
  })

  it('svi sastojci postoje u bazi', () => {
    const missing: string[] = []
    for (const recipe of STARTER_RECIPES) {
      for (const item of recipe.items) {
        if (!foods.byId(item.foodId)) missing.push(`${recipe.name} → ${item.foodId}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('nijedan recept ne referencira drugi recept', () => {
    for (const recipe of STARTER_RECIPES) {
      for (const item of recipe.items) expect(item.foodId.startsWith('r:')).toBe(false)
    }
  })

  it('identifikatori i nazivi su jedinstveni', () => {
    const ids = STARTER_RECIPES.map((r) => r.id)
    const names = STARTER_RECIPES.map((r) => r.name.toLowerCase())
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(names).size).toBe(names.length)
  })

  it('nazivi se ne sudaraju s namirnicama iz baze', () => {
    for (const recipe of STARTER_RECIPES) {
      expect(foods.byName(recipe.name), recipe.name).toBeUndefined()
    }
  })

  it('kategorije i kuhinje su iz dopuštenih popisa', () => {
    for (const recipe of STARTER_RECIPES) {
      expect(CATEGORIES).toContain(recipe.cat)
      if (recipe.cuisine) expect(CUISINES).toContain(recipe.cuisine)
    }
  })

  it('svaki recept ima barem dva sastojka i pozitivne gramaže', () => {
    for (const recipe of STARTER_RECIPES) {
      expect(recipe.items.length, recipe.name).toBeGreaterThanOrEqual(2)
      for (const item of recipe.items) expect(item.g, `${recipe.name}/${item.foodId}`).toBeGreaterThan(0)
      expect(recipe.servings, recipe.name).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('ugrađeni recepti — vrijednosti', () => {
  it.each(STARTER_RECIPES.map((r) => [r.name, r] as const))(
    '%s daje realne vrijednosti po porciji',
    (_name, recipe) => {
      const { per100, grams, missing } = recipeTotals(recipe, foods)
      expect(missing).toBe(0)
      expect(grams).toBeGreaterThan(0)

      // Gotovo jelo rijetko izlazi iz ovog raspona; izvan njega je vjerojatno
      // pogresna gramaza nekog sastojka.
      expect(per100.kcal).toBeGreaterThan(20)
      expect(per100.kcal).toBeLessThan(600)

      const food = recipeAsFood(recipe, foods)
      expect(food.serv).toBeGreaterThan(40)
      expect(food.serv).toBeLessThan(900)
    },
  )

  it.each(STARTER_RECIPES.map((r) => [r.name, r] as const))(
    '%s je energetski konzistentan',
    (_name, recipe) => {
      const { per100 } = recipeTotals(recipe, foods)
      expect(atwaterDeviation(per100)!).toBeLessThan(0.15)
    },
  )
})

describe('preporučeno piće', () => {
  const withDrink = STARTER_RECIPES.filter((r) => r.drink)

  it('barem dvadesetak jela ima prijedlog pića', () => {
    expect(withDrink.length).toBeGreaterThanOrEqual(20)
  })

  it('svako preporučeno piće postoji i jest piće', () => {
    for (const recipe of withDrink) {
      const drink = foods.byId(recipe.drink!.foodId)
      expect(drink, `${recipe.name}`).toBeDefined()
      expect(drink!.cat, `${recipe.name} → ${drink!.name}`).toBe('Pića')
      expect(recipe.drink!.g).toBeGreaterThan(0)
    }
  })

  it('piće NE ulazi u vrijednosti jela', () => {
    // Namjerno se NE tvrdi da pice ne smije biti i sastojak: pasticada ima crno
    // vino u umaku i uz to ga preporucuje za piti. Prava invarijanta je da
    // prijedlog pica ne mijenja izracun jela.
    for (const recipe of withDrink) {
      const withoutSuggestion = recipeTotals({ ...recipe, drink: undefined }, foods)
      const withSuggestion = recipeTotals(recipe, foods)
      expect(withSuggestion.total, recipe.name).toEqual(withoutSuggestion.total)
      expect(withSuggestion.grams, recipe.name).toBe(withoutSuggestion.grams)
    }
  })
})

describe('veza s ugrađenim jelovnicima', () => {
  it('svaki recept koji jelovnik koristi i dalje postoji', () => {
    const known = new Set(STARTER_RECIPES.map((r) => `r:${r.id}`))
    const missing: string[] = []
    for (const menu of STARTER_MENUS) {
      for (const meal of menu.meals) {
        for (const item of meal) {
          if (!isFoodRef(item) || !item.foodId.startsWith('r:')) continue
          if (!known.has(item.foodId)) missing.push(`${menu.title} → ${item.foodId}`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})

describe('yieldFactor', () => {
  it('koncentrira vrijednosti, ne mijenja ukupnu energiju', () => {
    const cevapi = STARTER_RECIPES.find((r) => r.id === 'rc-cevapi')!
    const withYield = recipeTotals(cevapi, foods)
    const withoutYield = recipeTotals({ ...cevapi, yieldFactor: 1 }, foods)
    expect(withYield.total.kcal).toBeCloseTo(withoutYield.total.kcal, 6)
    expect(withYield.per100.kcal).toBeGreaterThan(withoutYield.per100.kcal)
  })
})

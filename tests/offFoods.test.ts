import { describe, expect, it } from 'vitest'
import { BASE_FOODS } from '../src/data/foods'
import { OFF_FOODS } from '../src/data/offFoods'
import { atwaterDeviation, isPlausible } from '../src/domain/nutrients'
import { CATEGORIES } from '../src/domain/types'

describe('pakirani proizvodi iz Open Food Factsa', () => {
  it('identifikatori se ne sudaraju s ugrađenom bazom', () => {
    const baseIds = new Set(BASE_FOODS.map((f) => f.id))
    for (const food of OFF_FOODS) expect(baseIds.has(food.id)).toBe(false)
  })

  it('identifikatori su jedinstveni i nose prefiks izvora', () => {
    const ids = OFF_FOODS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.startsWith('off:')).toBe(true)
  })

  it('nazivi se ne sudaraju s ugrađenom bazom', () => {
    const baseNames = new Set(BASE_FOODS.map((f) => f.name.toLowerCase()))
    for (const food of OFF_FOODS) expect(baseNames.has(food.name.toLowerCase())).toBe(false)
  })

  it('svi su označeni kao OFF izvor s brojem proizvoda', () => {
    for (const food of OFF_FOODS) {
      expect(food.source).toBe('off')
      expect(food.sourceId).toMatch(/^\d+ proizvoda$/)
      expect(food.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('kategorije su iz dopuštenog popisa', () => {
    for (const food of OFF_FOODS) expect(CATEGORIES).toContain(food.cat)
  })

  it('vrijednosti su energetski konzistentne', () => {
    for (const food of OFF_FOODS) {
      expect(isPlausible(food, food.name, food.cat), `${food.name}: ${atwaterDeviation(food)}`).toBe(
        true,
      )
    }
  })

  it('kalorije su u smislenom rasponu za hranu', () => {
    for (const food of OFF_FOODS) {
      expect(food.kcal, food.name).toBeGreaterThan(0)
      expect(food.kcal, food.name).toBeLessThanOrEqual(900)
    }
  })

  it('porcije su pozitivne', () => {
    for (const food of OFF_FOODS) expect(food.serv).toBeGreaterThan(0)
  })

  it('ne sadrži pojmove kod kojih se proizvodi ne slažu', () => {
    // Kategorije poput "sauerkraut" mijesaju kiseli kupus i gotova jela s
    // kobasicom, pa im medijan nema znacenja — moraju biti odbaceni.
    const names = OFF_FOODS.map((f) => f.name)
    expect(names).not.toContain('Kiseli kupus')
    expect(names).not.toContain('Slanina')
    expect(names).not.toContain('Ajvar')
  })
})

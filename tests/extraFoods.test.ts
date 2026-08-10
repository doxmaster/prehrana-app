import { describe, expect, it } from 'vitest'
import { BASE_FOODS } from '../src/data/foods'
import { EXTRA_FOODS } from '../src/data/extraFoods'
import { OFF_FOODS } from '../src/data/offFoods'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { emptyState } from '../src/domain/migrate'
import { CATEGORIES } from '../src/domain/types'

const ALL = [...BASE_FOODS, ...EXTRA_FOODS, ...OFF_FOODS]

describe('dopuna baze iz USDA', () => {
  it('identifikatori se ne sudaraju ni s jednim drugim izvorom', () => {
    const ids = ALL.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('identifikatori nose prefiks izvora', () => {
    for (const f of EXTRA_FOODS) expect(f.id.startsWith('u:')).toBe(true)
  })

  it('nazivi se ne ponavljaju kroz cijelu bazu', () => {
    const names = ALL.map((f) => f.name.toLowerCase())
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i)
    expect(duplicates).toEqual([])
  })

  it('svaka namirnica ima izvor, USDA oznaku i datum provjere', () => {
    for (const f of EXTRA_FOODS) {
      expect(f.source).toBe('usda')
      expect(f.sourceId).toMatch(/^\d+$/)
      expect(f.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('kategorije su iz dopuštenog popisa', () => {
    for (const f of EXTRA_FOODS) expect(CATEGORIES).toContain(f.cat)
  })

  it('vrijednosti su u fizički mogućem rasponu', () => {
    for (const f of EXTRA_FOODS) {
      expect(f.kcal, f.name).toBeGreaterThanOrEqual(0)
      // Cista mast je ~900 kcal/100 g i to je gornja granica hrane; svinjska
      // mast mjeri 902, pa granica mora ostaviti mjesta za zaokruzivanje.
      expect(f.kcal, f.name).toBeLessThanOrEqual(920)
      expect(f.p, f.name).toBeLessThanOrEqual(100)
      expect(f.c, f.name).toBeLessThanOrEqual(100)
      expect(f.f, f.name).toBeLessThanOrEqual(100)
      expect(f.serv, f.name).toBeGreaterThan(0)
    }
  })

  it('pokriva ono što je nedostajalo', () => {
    const names = ALL.map((f) => f.name.toLowerCase())
    for (const traženo of ['mahune', 'vino bijelo (suho)', 'šampinjoni', 'blitva', 'lignje']) {
      expect(names, traženo).toContain(traženo)
    }
  })

  it('bijelih vina ima više vrsta', () => {
    const vina = EXTRA_FOODS.filter((f) => /vino bijelo/i.test(f.name))
    expect(vina.length).toBeGreaterThanOrEqual(4)
  })
})

describe('cijela baza kroz pretraživač', () => {
  const foods = buildFoodIndex(emptyState())

  it('sadrži sve tri skupine', () => {
    expect(foods.all().length).toBeGreaterThanOrEqual(ALL.length)
  })

  it('nove namirnice se pronalaze po nazivu', () => {
    expect(foods.byName('Mahune')?.source).toBe('usda')
    expect(foods.byName('Blitva')).toBeDefined()
    expect(foods.byName('Vino bijelo (Chardonnay)')).toBeDefined()
  })

  it('stari identifikatori i dalje rade', () => {
    expect(foods.byId('b0')?.name).toBe('Pileća prsa (pečena)')
    expect(foods.byId('b92')).toBeDefined()
  })
})

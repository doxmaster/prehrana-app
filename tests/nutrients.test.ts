import { describe, expect, it } from 'vitest'
import { BASE_FOODS } from '../src/data/foods'
import {
  atwaterDeviation,
  foodUnit,
  isAlcoholic,
  isPlausible,
  itemName,
  mealsFluid,
  mealsTotals,
  scale,
  sumItems,
  zeroNutrients,
  type FoodLookup,
} from '../src/domain/nutrients'
import type { DayMeals, Food, MealItem } from '../src/domain/types'

const byId = new Map(BASE_FOODS.map((f) => [f.id, f]))
const byName = new Map(BASE_FOODS.map((f) => [f.name.toLowerCase(), f]))
const foods: FoodLookup = {
  byId: (id) => byId.get(id),
  byName: (n) => byName.get(n.toLowerCase()),
}

function ref(name: string, g: number): MealItem {
  const f = byName.get(name.toLowerCase())
  if (!f) throw new Error(`Namirnica nije u bazi: ${name}`)
  return { foodId: f.id, g }
}

/** Isti dan izračunat u legacy/index.html — služi kao referenca. */
const GOLDEN_DAY: DayMeals = [
  [ref('Zobene pahuljice', 80), ref('Mlijeko 2.8%', 250), ref('Banana', 120)],
  [
    ref('Pileća prsa (pečena)', 180),
    ref('Riža bijela (kuhana)', 200),
    ref('Brokula', 150),
    ref('Maslinovo ulje', 15),
  ],
  [ref('Losos', 150), ref('Krumpir (kuhani)', 250), ref('Špinat', 100)],
  [
    ref('Grčki jogurt', 150),
    ref('Bademi', 30),
    ref('Voda', 1500),
    ref('Kava (crna, nezaslađena)', 200),
    ref('Pivo svijetlo (5%)', 500),
  ],
]

const GOLDEN_TOTAL = {
  kcal: 2407.3,
  p: 148.97,
  c: 242.95,
  f: 80.04,
  fib: 26.27,
  fe: 14.865,
  ca: 851.05,
  mg: 620.2,
  vc: 206.94,
  vd: 16.93,
}

const GOLDEN_MEALS = [
  { kcal: 578, p: 23.17, c: 92.4, f: 14.71, fib: 11.12, fe: 4.245, ca: 349.2, mg: 201.5, vc: 12.94, vd: 0.25 },
  { kcal: 740.6, p: 65.4, c: 66.5, f: 22.68, fib: 4.7, fe: 5.34, ca: 117.65, mg: 107.7, vc: 133.5, vd: 0.18 },
  { kcal: 552.5, p: 37.9, c: 53.6, f: 20.15, fib: 6.7, fe: 3.9, ca: 129.5, mg: 177.5, vc: 60.5, vd: 16.5 },
  { kcal: 536.2, p: 22.5, c: 30.45, f: 22.5, fib: 3.75, fe: 1.38, ca: 254.7, mg: 133.5, vc: 0, vd: 0 },
]

describe('zbrajanje obroka — poklapanje sa starom aplikacijom', () => {
  it('dnevni zbroj', () => {
    const total = mealsTotals(GOLDEN_DAY, foods)
    for (const [key, value] of Object.entries(GOLDEN_TOTAL)) {
      expect(total[key as keyof typeof GOLDEN_TOTAL]).toBeCloseTo(value, 6)
    }
  })

  it('zbroj po obroku', () => {
    GOLDEN_DAY.forEach((meal, i) => {
      const sum = sumItems(meal, foods)
      const expected = GOLDEN_MEALS[i]!
      for (const [key, value] of Object.entries(expected)) {
        expect(sum[key as keyof typeof expected]).toBeCloseTo(value, 6)
      }
    })
  })

  it('tekućina broji samo pića', () => {
    expect(mealsFluid(GOLDEN_DAY, foods)).toBeCloseTo(2.2, 6)
  })
})

describe('skaliranje', () => {
  it('vrijednosti se množe s količinom kroz 100', () => {
    const f = byName.get('bademi')!
    expect(scale(f, 30).kcal).toBeCloseTo((f.kcal * 30) / 100, 6)
    expect(scale(f, 0).kcal).toBe(0)
  })

  it('prazan obrok daje nule', () => {
    expect(sumItems([], foods)).toEqual(zeroNutrients())
  })
})

describe('stavke bez poznate namirnice', () => {
  it('preskaču se u zbroju, ne ruše izračun', () => {
    const withGhost: MealItem[] = [ref('Banana', 100), { foodId: 'nepostoji', g: 500 }]
    expect(sumItems(withGhost, foods)).toEqual(sumItems([ref('Banana', 100)], foods))
  })

  it('dobiju razumljiv naziv u sučelju', () => {
    expect(itemName({ foodId: 'nepostoji', g: 100 }, foods)).toBe('Nepoznata namirnica')
  })
})

describe('AI stavke s vlastitim vrijednostima', () => {
  const adhoc: MealItem = {
    name: 'Sarma',
    g: 250,
    n: { kcal: 120, p: 8, c: 6, f: 7, fib: 2, fe: 1.2, ca: 40, mg: 20, vc: 10, vd: 0.2 },
  }

  it('zbrajaju se jednako kao namirnice iz baze', () => {
    expect(sumItems([adhoc], foods).kcal).toBeCloseTo(300, 6)
    expect(sumItems([adhoc], foods).p).toBeCloseTo(20, 6)
  })
})

describe('jedinice', () => {
  it('pića i mlijeko idu u ml', () => {
    expect(foodUnit('Pića', 'Voda')).toBe('ml')
    expect(foodUnit('Mliječno i jaja', 'Mlijeko 2.8%')).toBe('ml')
    expect(foodUnit('Mliječno i jaja', 'Grčki jogurt')).toBe('g')
    expect(foodUnit('Meso i riba', 'Losos')).toBe('g')
  })
})

describe('Atwaterova provjera', () => {
  it('prihvaća uravnoteženu namirnicu', () => {
    const ok = { ...zeroNutrients(), kcal: 165, p: 31, c: 0, f: 3.6 }
    expect(isPlausible(ok)).toBe(true)
  })

  it('odbija besmislenu AI procjenu', () => {
    const bad = { ...zeroNutrients(), kcal: 50, p: 30, c: 40, f: 20 }
    expect(isPlausible(bad)).toBe(false)
  })

  it('vlakna se računaju kao 2 kcal/g, ne 4', () => {
    const brokula = byName.get('brokula')!
    expect(isPlausible(brokula)).toBe(true)
    expect(atwaterDeviation(brokula)!).toBeLessThan(0.15)
  })

  it('alkoholna pića se preskaču jer etanol nije makronutrijent', () => {
    const vino = byName.get('vino crno')!
    expect(isAlcoholic(vino.name, vino.cat)).toBe(true)
    expect(isPlausible(vino, vino.name, vino.cat)).toBe(true)
    expect(isPlausible(vino)).toBe(false)
  })

  it('suplementi bez kalorija nemaju smislenu provjeru', () => {
    expect(atwaterDeviation(zeroNutrients())).toBeNull()
  })
})

describe('ugrađena baza', () => {
  it('svaka namirnica ima jedinstven id', () => {
    expect(new Set(BASE_FOODS.map((f) => f.id)).size).toBe(BASE_FOODS.length)
  })

  it('identifikatori su bN po redoslijedu — stari dnevnici pokazuju na njih', () => {
    BASE_FOODS.forEach((f: Food, i) => expect(f.id).toBe(`b${i}`))
  })

  it('nema duplih naziva', () => {
    const names = BASE_FOODS.map((f) => f.name.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })

  it('porcije su pozitivne', () => {
    expect(BASE_FOODS.every((f) => f.serv > 0)).toBe(true)
  })
})

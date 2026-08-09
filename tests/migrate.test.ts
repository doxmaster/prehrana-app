import { describe, expect, it } from 'vitest'
import { emptyState, migrateState, pruneState } from '../src/domain/migrate'
import { mealsTotals } from '../src/domain/nutrients'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { mondayOf, todayISO } from '../src/domain/dates'
import { BASE_FOODS } from '../src/data/foods'

/** Stanje kakvo je zapisivala stara aplikacija (prehrana_artifact_v2). */
const V2 = {
  profiles: [
    {
      id: 'p1',
      name: 'Darijo',
      profile: { sex: 'm', age: 42, act: 1.55, weight: 88, height: 182, goal: -500 },
      log: {
        '2026-08-01': [
          [{ foodId: 'b25', g: 80 }],
          [{ foodId: 'b0', g: 200 }],
          [],
          [{ name: 'Sarma', g: 300, n: { kcal: 120, p: 8, c: 6, f: 7, fib: 2, fe: 1, ca: 40, mg: 20, vc: 5, vd: 0 }, drink: false }],
        ],
        '2026-08-02': [[], [], [], []],
      },
      plan: {
        '2026-08-05': [[{ foodId: 'b11', g: 120 }], [], [], []],
      },
    },
    { id: 'p2', name: 'Ana', profile: { sex: 'z', age: 38, act: 1.375, weight: 62, height: 168, goal: 0 }, log: {} },
  ],
  activeProfileId: 'p2',
  sharedPlan: {},
  menuMode: 'own',
  customFoods: [
    { id: 'c1', name: 'Domaći ajvar', cat: 'Povrće', kcal: 130, p: 2, c: 9, f: 9, fib: 3, fe: 0.8, ca: 20, vc: 25, vd: 0, mg: 15, serv: 100, base: false },
  ],
  foodRenames: { b0: 'Pileći file' },
  foodCat: { b0: 'Meso i riba' },
  foodVals: { b0: { kcal: 170, p: 32 } },
  foodServ: { b0: 150 },
  foodHidden: ['b60'],
  menus: [{ id: 'mn1', title: 'Radni tjedan', desc: '', meals: [[{ foodId: 'b30', g: 100 }], [], [], []] }],
  servNorm: 1,
  updatedAt: 1754000000000,
}

describe('migracija v2 → v3', () => {
  const state = migrateState(V2)

  it('zadržava obje osobe i aktivnu osobu', () => {
    expect(state.profiles.map((p) => p.name)).toEqual(['Darijo', 'Ana'])
    expect(state.activeProfileId).toBe('p2')
  })

  it('zadržava profil bez izmjena', () => {
    expect(state.profiles[0]!.profile).toEqual({ sex: 'm', age: 42, act: 1.55, weight: 88, height: 182, goal: -500 })
  })

  it('prenosi dnevnik i odbacuje prazne dane', () => {
    const log = state.profiles[0]!.log
    expect(Object.keys(log)).toEqual(['2026-08-01'])
    expect(log['2026-08-01']![0]).toEqual([{ foodId: 'b25', g: 80 }])
  })

  it('čuva AI stavku s njezinim vrijednostima', () => {
    const adhoc = state.profiles[0]!.log['2026-08-01']![3]![0]!
    expect(adhoc).toMatchObject({ name: 'Sarma', g: 300 })
    expect('n' in adhoc && adhoc.n.kcal).toBe(120)
  })

  it('spaja pet objekata s izmjenama u jedan overrides', () => {
    expect(state.overrides.names.b0).toBe('Pileći file')
    expect(state.overrides.cats.b0).toBe('Meso i riba')
    expect(state.overrides.vals.b0).toEqual({ kcal: 170, p: 32 })
    expect(state.overrides.servs.b0).toBe(150)
    expect(state.overrides.hidden).toEqual(['b60'])
  })

  it('prenosi vlastite namirnice i označava im izvor', () => {
    expect(state.customFoods).toHaveLength(1)
    expect(state.customFoods[0]).toMatchObject({ name: 'Domaći ajvar', source: 'user', serv: 100 })
  })

  it('zadržava postojeće jelovnike i ne dira ih', () => {
    expect(state.menus).toHaveLength(1)
    expect(state.menus[0]!.title).toBe('Radni tjedan')
  })

  it('uklanja naslijeđene planove po danu', () => {
    expect(state.profiles[0]!.plan).toBeUndefined()
  })

  it('dodaje prazno polje mjerenja', () => {
    expect(state.profiles[0]!.measurements).toEqual([])
  })

  it('izmjene se stvarno primjenjuju na ugrađenu namirnicu', () => {
    const foods = buildFoodIndex(state)
    const f = foods.byId('b0')!
    expect(f.name).toBe('Pileći file')
    expect(f.kcal).toBe(170)
    expect(f.serv).toBe(150)
    expect(foods.byId('b60')).toBeUndefined() // skrivena
  })

  it('zbroj dana kombinira bazu, korisnicku izmjenu i AI stavku', () => {
    const foods = buildFoodIndex(state)
    const total = mealsTotals(state.profiles[0]!.log['2026-08-01']!, foods)
    // b25 iz baze 80 g + b0 izmijenjen na 170 kcal/100 g × 200 g + Sarma 120 kcal/100 g × 300 g.
    // Vrijednost za b25 se cita iz baze jer se ona osvjezava prema USDA.
    const zobene = BASE_FOODS.find((f) => f.id === 'b25')!
    expect(total.kcal).toBeCloseTo(0.8 * zobene.kcal + 2 * 170 + 3 * 120, 6)
  })
})

describe('migracija v2 bez jelovnika', () => {
  it('planove po danu pretvara u numerirane jelovnike', () => {
    const { menus } = migrateState({ ...V2, menus: undefined })
    expect(menus).toHaveLength(1)
    expect(menus[0]!.meals[0]).toEqual([{ foodId: 'b11', g: 120 }])
  })
})

describe('migracija v1', () => {
  it('tjedan bez datuma pripisuje tekućem tjednu', () => {
    const v1 = {
      profiles: [
        {
          id: 'p1',
          name: 'Stari',
          profile: { sex: 'm', age: 30, act: 1.55, weight: 75, height: 178, goal: 0 },
          week: [
            [[{ foodId: 'b0', g: 100 }], [], [], []],
            [[], [], [], []],
            [[], [], [], []],
            [[], [], [], []],
            [[], [], [], []],
            [[], [], [], []],
            [[], [], [], []],
          ],
        },
      ],
      customFoods: [],
    }
    const state = migrateState(v1)
    const monday = mondayOf(todayISO())
    expect(Object.keys(state.profiles[0]!.log)).toEqual([monday])
  })
})

describe('otpornost na neispravan ulaz', () => {
  it.each([null, undefined, 42, 'tekst', [], {}, { profiles: [] }, { profiles: 'ne' }])(
    'ulaz %o daje upotrebljivo prazno stanje',
    (input) => {
      const state = migrateState(input)
      expect(state.version).toBe(3)
      expect(state.profiles.length).toBeGreaterThan(0)
      expect(state.menus.length).toBeGreaterThan(0)
      expect(state.profiles.some((p) => p.id === state.activeProfileId)).toBe(true)
    },
  )

  it('odbacuje stavke bez količine i bez naziva', () => {
    const state = migrateState({
      profiles: [
        {
          id: 'p1',
          name: 'X',
          profile: {},
          log: { '2026-01-01': [[{ foodId: 'b0', g: 0 }, { g: 100 }, { name: '  ', g: 50 }, { foodId: 'b1', g: 50 }], [], [], []] },
        },
      ],
    })
    expect(state.profiles[0]!.log['2026-01-01']![0]).toEqual([{ foodId: 'b1', g: 50 }])
  })

  it('neispravan datum se ne prenosi', () => {
    const state = migrateState({
      profiles: [{ id: 'p1', name: 'X', profile: {}, log: { 'ne-datum': [[{ foodId: 'b0', g: 10 }], [], [], []] } }],
    })
    expect(Object.keys(state.profiles[0]!.log)).toEqual([])
  })

  it('nepoznata kategorija postaje Ostalo', () => {
    const state = migrateState({
      profiles: [{ id: 'p1', name: 'X', profile: {} }],
      customFoods: [{ id: 'c1', name: 'Nešto', cat: 'Izmišljeno', kcal: 100 }],
    })
    expect(state.customFoods[0]!.cat).toBe('Ostalo')
  })
})

describe('krug izvoz → uvoz', () => {
  it('ponovna migracija vlastitog izlaza ništa ne mijenja', () => {
    const once = migrateState(V2)
    const twice = migrateState(JSON.parse(JSON.stringify(once)))
    expect(twice).toEqual(once)
  })

  it('prazno stanje preživi krug', () => {
    const s = emptyState()
    expect(migrateState(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })
})

describe('pruneState', () => {
  it('briše dane koji su ostali bez stavki', () => {
    const state = migrateState(V2)
    state.profiles[0]!.log['2026-09-09'] = [[], [], [], []]
    pruneState(state)
    expect(state.profiles[0]!.log['2026-09-09']).toBeUndefined()
    expect(state.profiles[0]!.log['2026-08-01']).toBeDefined()
  })
})

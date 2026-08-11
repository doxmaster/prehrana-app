import { describe, expect, it } from 'vitest'
import {
  CONDITIONS,
  CONDITION_IDS,
  capBreaches,
  conditionPlan,
  conflictsIn,
  personConditions,
  rateDish,
  rateFood,
  worstFlag,
} from '../src/domain/conditions'
import type { ConditionId } from '../src/domain/conditions'
import { computeTargets } from '../src/domain/targets'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { emptyState, migrateState } from '../src/domain/migrate'
import { STARTER_RECIPES } from '../src/data/recipes'
import type { Food, Person } from '../src/domain/types'

const state = emptyState()
state.recipes = structuredClone(STARTER_RECIPES)
const foods = buildFoodIndex(state)

const byName = (name: string): Food => {
  const food = foods.byName(name)
  if (!food) throw new Error(`Nema namirnice "${name}" — test se oslanja na ugrađenu bazu`)
  return food
}

const osoba = (...conditions: ConditionId[]): Person => ({
  id: 'p1',
  name: 'Test',
  profile: { sex: 'm', age: 45, act: 1.55, weight: 85, height: 180, goal: 0 },
  log: {},
  measurements: [],
  conditions,
})

const targets = computeTargets(osoba().profile)

describe('katalog stanja', () => {
  it('svako stanje ima naziv i opis', () => {
    expect(CONDITIONS).toHaveLength(CONDITION_IDS.length)
    for (const c of CONDITIONS) {
      expect(c.name.length).toBeGreaterThan(3)
      expect(c.short.length).toBeGreaterThan(10)
      expect(c.advice.length).toBeGreaterThan(0)
    }
  })

  it('stanje koje se oslanja na podatak izvan tablice to i kaže', () => {
    // Bez ovoga bi ocjena po nazivu izgledala kao mjerenje.
    for (const id of ['hipertenzija', 'celijakija', 'giht', 'bubrezi'] as const) {
      expect(CONDITIONS.find((c) => c.id === id)?.blind, id).toBeTruthy()
    }
  })

  it('nepoznata oznaka se tiho preskače', () => {
    const p = { ...osoba('dijabetes2'), conditions: ['dijabetes2', 'izmisljeno'] }
    expect(personConditions(p)).toEqual(['dijabetes2'])
  })

  it('hemokromatoza i anemija se prijavljuju kao proturječne', () => {
    expect(conflictsIn(['hemokromatoza', 'anemija'])).toHaveLength(1)
    expect(conflictsIn(['hemokromatoza', 'dijabetes2'])).toEqual([])
  })
})

describe('hemokromatoza', () => {
  const ids: ConditionId[] = ['hemokromatoza']

  it('postavlja gornju granicu željeza umjesto cilja', () => {
    const plan = conditionPlan(targets, osoba(...ids), 85)
    const cap = plan.caps.find((c) => c.key === 'fe')
    expect(cap?.max).toBeLessThanOrEqual(8)
    // Cilj se spušta na granicu — inače bi napredak prema njemu izgledao dobro.
    expect(plan.targets.fe).toBe(cap?.max)
  })

  it('prijavljuje prekoračenje granice za dan', () => {
    const plan = conditionPlan(targets, osoba(...ids), 85)
    const totals = { kcal: 2000, p: 90, c: 200, f: 70, fib: 30, fe: 18, ca: 900, mg: 350, vc: 90, vd: 5 }
    const breaches = capBreaches(totals, plan.caps)
    expect(breaches).toHaveLength(1)
    expect(breaches[0]!.cap.key).toBe('fe')
    expect(breaches[0]!.value).toBe(18)
  })

  it('iznutrice su izbjegavanje, a crveno meso oprez', () => {
    const jetra = { ...byName('Jaje (cijelo)'), id: 'x', name: 'Pileća jetrica', fe: 9 }
    expect(worstFlag(jetra, ids)?.level).toBe('izbjegavaj')
    expect(worstFlag(byName('Junetina (nemasna)'), ids)?.level).toBe('oprez')
  })

  it('ne dira namirnice bez željeza', () => {
    expect(worstFlag(byName('Jabuka'), ids)).toBeUndefined()
  })

  it('dodatak željeza se izričito izbjegava', () => {
    const dodatak: Food = { ...byName('Jabuka'), id: 's1', name: 'Željezo (tablete)', cat: 'Suplementi', fe: 14 }
    expect(worstFlag(dodatak, ids)?.why).toContain('Dodatak željeza')
  })
})

describe('dijabetes tip 2', () => {
  const ids: ConditionId[] = ['dijabetes2']

  it('ograničava ugljikohidrate na oko 45 % energije', () => {
    const plan = conditionPlan(targets, osoba(...ids), 85)
    const cap = plan.caps.find((c) => c.key === 'c')
    expect(cap?.max).toBe(Math.round((0.45 * targets.kcal) / 4))
    expect(plan.targets.c).toBeLessThanOrEqual(cap!.max)
  })

  it('podiže cilj vlakana na najmanje 30 g', () => {
    const plan = conditionPlan(targets, osoba(...ids), 85)
    expect(plan.targets.fib).toBeGreaterThanOrEqual(30)
  })

  it('slatko piće se izbjegava, a bijeli kruh je oprez', () => {
    const sok: Food = { ...byName('Jabuka'), id: 'd1', name: 'Sok od naranče', cat: 'Pića', c: 10, fib: 0 }
    expect(worstFlag(sok, ids)?.level).toBe('izbjegavaj')
    expect(worstFlag(byName('Kruh bijeli'), ids)?.level).toBe('oprez')
  })

  it('cjelovito ne kažnjava jednako kao bijelo', () => {
    const bijeli = worstFlag(byName('Kruh bijeli'), ids)
    const zob = worstFlag(byName('Zobene pahuljice'), ids)
    expect(bijeli).toBeDefined()
    // Zob ima puno UH, ali i 10 g vlakana — ne smije završiti u istoj ladici.
    expect(zob?.level).not.toBe('izbjegavaj')
  })
})

describe('ostala stanja', () => {
  it('celijakija označava kruh i tjesteninu', () => {
    expect(worstFlag(byName('Kruh integralni'), ['celijakija'])?.level).toBe('izbjegavaj')
    expect(worstFlag(byName('Tjestenina (kuhana)'), ['celijakija'])?.level).toBe('izbjegavaj')
    expect(worstFlag(byName('Riža bijela (kuhana)'), ['celijakija'])).toBeUndefined()
  })

  it('laktoza razlikuje mlijeko od jajeta', () => {
    expect(worstFlag(byName('Mlijeko 2.8%'), ['laktoza'])?.level).toBe('izbjegavaj')
    expect(worstFlag(byName('Jaje (cijelo)'), ['laktoza'])).toBeUndefined()
  })

  it('bubrežna bolest računa granicu bjelančevina iz tjelesne mase', () => {
    const plan = conditionPlan(targets, osoba('bubrezi'), 85)
    expect(plan.caps.find((c) => c.key === 'p')?.max).toBe(68)
  })

  it('osteoporoza podiže kalcij i vitamin D', () => {
    const plan = conditionPlan(targets, osoba('osteoporoza'), 85)
    expect(plan.targets.ca).toBeGreaterThanOrEqual(1200)
    expect(plan.targets.vd).toBeGreaterThanOrEqual(20)
  })

  it('anemija podiže cilj željeza', () => {
    const plan = conditionPlan(targets, osoba('anemija'), 85)
    expect(plan.targets.fe).toBeGreaterThan(targets.fe)
  })
})

describe('više stanja zajedno', () => {
  it('uzima strožu granicu kad dva stanja diraju istu vrijednost', () => {
    const plan = conditionPlan(targets, osoba('dijabetes2', 'hemokromatoza'), 85)
    expect(plan.caps.map((c) => c.key).sort()).toEqual(['c', 'fe'])
  })

  it('primjedbe se slažu od najteže prema lakšoj', () => {
    const kulen = byName('Kulen')
    const flags = rateFood(kulen, ['giht', 'hipertenzija', 'kolesterol'])
    expect(flags.length).toBeGreaterThan(0)
    for (let i = 1; i < flags.length; i++) {
      if (flags[i - 1]!.level === 'oprez') expect(flags[i]!.level).toBe('oprez')
    }
  })

  it('bez stanja nema ni granica ni primjedbi', () => {
    const plan = conditionPlan(targets, osoba(), 85)
    expect(plan.caps).toEqual([])
    expect(plan.targets).toEqual(targets)
    expect(rateFood(byName('Kruh bijeli'), [])).toEqual([])
  })
})

describe('nad ugrađenom bazom', () => {
  it('nijedno stanje ne označi baš sve — inače pravilo ne razlikuje ništa', () => {
    for (const id of CONDITION_IDS) {
      const all = foods.ingredients()
      const flagged = all.filter((f) => worstFlag(f, [id])).length
      expect(flagged, id).toBeLessThan(all.length * 0.6)
    }
  })

  it('svaka primjedba ima objašnjenje', () => {
    for (const food of foods.all()) {
      for (const flag of rateFood(food, CONDITION_IDS)) {
        expect(flag.why.length, `${food.name}/${flag.condition}`).toBeGreaterThan(10)
      }
    }
  })
})

describe('stanja preživljavaju spremanje i učitavanje', () => {
  it('migracija zadržava odabrana stanja i ručni udio', () => {
    const migrated = migrateState({
      profiles: [
        {
          id: 'p1',
          name: 'A',
          profile: { sex: 'm', age: 45, act: 1.55, weight: 85, height: 180, goal: 0 },
          log: {},
          conditions: ['hemokromatoza', 'dijabetes2', 'hemokromatoza'],
          portionFactor: 1.2,
        },
      ],
    })
    const p = migrated.profiles[0]!
    expect(p.conditions).toEqual(['hemokromatoza', 'dijabetes2'])
    expect(p.portionFactor).toBe(1.2)
  })

  it('osoba bez stanja ostaje bez polja', () => {
    const migrated = migrateState({ profiles: [{ id: 'p1', name: 'A', profile: {}, log: {} }] })
    expect(migrated.profiles[0]!.conditions).toBeUndefined()
  })
})

describe('jela se ocjenjuju i po sastojcima', () => {
  it('sarma je glutenska zbog riže? ne — ali jelo s kruhom jest', () => {
    const kruh = byName('Kruh bijeli')
    const jelo: Food = { ...byName('Jabuka'), id: 'r:x', name: 'Zapečeno jelo', recipeId: 'x' }
    // Gotovo jelo samo po sebi ne izgleda glutensko; sastojak ga odaje.
    expect(worstFlag(jelo, ['celijakija'])).toBeUndefined()
    expect(rateDish(jelo, [kruh], ['celijakija'])[0]?.why).toContain('Kruh bijeli')
  })

  it('po stanju ostaje samo najteža primjedba', () => {
    const jelo: Food = { ...byName('Jabuka'), id: 'r:y', name: 'Miješano', recipeId: 'y' }
    const flags = rateDish(jelo, [byName('Kruh bijeli'), byName('Tjestenina (kuhana)')], ['celijakija'])
    expect(flags).toHaveLength(1)
  })
})

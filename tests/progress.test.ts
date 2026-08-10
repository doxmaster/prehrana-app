import { describe, expect, it } from 'vitest'
import { BASE_FOODS } from '../src/data/foods'
import {
  kcalSeries,
  kcalTargetOn,
  movingAverage,
  rangeStart,
  summarize,
  weightSeries,
} from '../src/domain/progress'
import { buildYAxis, makeScales, niceStep } from '../src/components/charts/scale'
import type { FoodLookup } from '../src/domain/nutrients'
import type { Person } from '../src/domain/types'

const byId = new Map(BASE_FOODS.map((f) => [f.id, f]))
const foods: FoodLookup = { byId: (id) => byId.get(id), byName: () => undefined }

const person: Person = {
  id: 'p1',
  name: 'Test',
  profile: { sex: 'm', age: 40, act: 1.55, weight: 90, height: 180, goal: 0 },
  log: {
    '2026-06-01': [[{ foodId: 'b48', g: 100 }], [], [], []],
    '2026-06-03': [[{ foodId: 'b48', g: 200 }], [], [], []],
    '2026-06-05': [[], [], [], []], // dan bez ijedne stavke
    '2026-05-01': [[{ foodId: 'b48', g: 300 }], [], [], []], // izvan raspona
  },
  measurements: [
    { date: '2026-06-01', weight: 90 },
    { date: '2026-06-08', weight: 89.2 },
    { date: '2026-06-15', weight: 88.5 },
    { date: '2026-06-10', note: 'bez vaganja' },
    { date: '2026-05-01', weight: 92 },
  ],
}

describe('weightSeries', () => {
  it('vraća samo mjerenja s težinom, u rasponu i po datumu', () => {
    const s = weightSeries(person, '2026-06-01', '2026-06-30')
    expect(s.map((p) => p.date)).toEqual(['2026-06-01', '2026-06-08', '2026-06-15'])
    expect(s.map((p) => p.value)).toEqual([90, 89.2, 88.5])
  })

  it('ne izmišlja točke za dane bez vaganja', () => {
    const s = weightSeries(person, '2026-06-01', '2026-06-30')
    expect(s.some((p) => p.date === '2026-06-10')).toBe(false)
  })

  it('prazan raspon daje prazan niz, ne grešku', () => {
    expect(weightSeries(person, '2027-01-01', '2027-12-31')).toEqual([])
  })
})

describe('kcalSeries', () => {
  it('preskače dane bez unosa umjesto da ih broji kao nulu', () => {
    const s = kcalSeries(person, foods, '2026-06-01', '2026-06-30')
    expect(s.map((p) => p.date)).toEqual(['2026-06-01', '2026-06-03'])
  })

  it('poštuje granice raspona', () => {
    const s = kcalSeries(person, foods, '2026-06-02', '2026-06-30')
    expect(s.map((p) => p.date)).toEqual(['2026-06-03'])
  })
})

describe('rangeStart', () => {
  it('raspon od 30 dana uključuje i zadnji dan', () => {
    expect(rangeStart('2026-06-30', 30)).toBe('2026-06-01')
    expect(rangeStart('2026-06-30', 1)).toBe('2026-06-30')
  })
})

describe('summarize', () => {
  it('računa promjenu, raspon i prosjek', () => {
    const s = summarize([
      { date: 'a', value: 10 },
      { date: 'b', value: 20 },
      { date: 'c', value: 30 },
    ])
    expect(s.change).toBe(20)
    expect(s.min).toBe(10)
    expect(s.max).toBe(30)
    expect(s.average).toBe(20)
  })

  it('jedna točka nema promjenu', () => {
    expect(summarize([{ date: 'a', value: 5 }]).change).toBeNull()
  })

  it('prazan niz ne ruši izračun', () => {
    const s = summarize([])
    expect(s.first).toBeNull()
    expect(s.average).toBe(0)
  })
})

describe('movingAverage', () => {
  it('izglađuje oscilacije', () => {
    const raw = [
      { date: '2026-06-01', value: 90 },
      { date: '2026-06-02', value: 92 },
      { date: '2026-06-03', value: 88 },
    ]
    const smooth = movingAverage(raw, 7)
    expect(smooth[0]!.value).toBe(90)
    expect(smooth[2]!.value).toBeCloseTo(90, 6)
  })

  it('gleda samo unatrag, nikad u budućnost', () => {
    const raw = [
      { date: '2026-06-01', value: 100 },
      { date: '2026-06-02', value: 0 },
    ]
    expect(movingAverage(raw, 7)[0]!.value).toBe(100)
  })

  it('ispod dvije točke nema što izgladiti', () => {
    expect(movingAverage([{ date: 'a', value: 1 }], 7)).toEqual([])
  })
})

describe('kcalTargetOn', () => {
  it('koristi izmjerenu težinu tog dana', () => {
    const rani = kcalTargetOn(person, '2026-06-01')
    const kasni = kcalTargetOn(person, '2026-06-15')
    expect(kasni).toBeLessThan(rani) // izgubljeno 1,5 kg
  })
})

describe('geometrija osi', () => {
  it('korak je uvijek okrugao broj', () => {
    for (const range of [7, 23, 137, 1480, 0.4]) {
      const step = niceStep(range, 4)
      const mantissa = step / 10 ** Math.floor(Math.log10(step))
      expect([1, 2, 2.5, 5, 10]).toContain(Math.round(mantissa * 10) / 10)
    }
  })

  it('os za stupce uvijek kreće od nule', () => {
    const y = buildYAxis([1800, 2100, 2400], { zeroBased: true })
    expect(y.min).toBe(0)
    expect(y.max).toBeGreaterThanOrEqual(2400)
  })

  it('os za crtu smije odsjeći bazu jer se prate male promjene', () => {
    const y = buildYAxis([88.5, 90])
    expect(y.min).toBeGreaterThan(0)
    expect(y.min).toBeLessThanOrEqual(88.5)
    expect(y.max).toBeGreaterThanOrEqual(90)
  })

  it('referentna vrijednost ulazi u raspon osi', () => {
    const y = buildYAxis([1200, 1400], { zeroBased: true, include: [2600] })
    expect(y.max).toBeGreaterThanOrEqual(2600)
  })

  it('jedna jedina vrijednost ne daje raspon nula', () => {
    const y = buildYAxis([75])
    expect(y.max).toBeGreaterThan(y.min)
  })

  it('prazni podaci daju upotrebljivu os', () => {
    const y = buildYAxis([])
    expect(y.max).toBeGreaterThan(y.min)
    expect(y.ticks.length).toBeGreaterThan(0)
  })

  it('skale drže točke unutar plohe', () => {
    const y = buildYAxis([0, 100], { zeroBased: true })
    const s = makeScales(640, 200, { top: 10, right: 10, bottom: 20, left: 40 }, 5, y)
    expect(s.x(0)).toBeGreaterThanOrEqual(40)
    expect(s.x(4)).toBeLessThanOrEqual(630)
    expect(s.yPos(y.max)).toBeCloseTo(10, 6)
    expect(s.yPos(y.min)).toBeCloseTo(180, 6)
  })

  it('jedna točka se centrira umjesto da sjedne na rub', () => {
    const y = buildYAxis([5])
    const s = makeScales(640, 200, { top: 10, right: 10, bottom: 20, left: 40 }, 1, y)
    expect(s.x(0)).toBeCloseTo(40 + 590 / 2, 6)
  })
})

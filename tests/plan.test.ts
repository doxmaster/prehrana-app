import { describe, expect, it } from 'vitest'
import {
  confirmDay,
  confirmMeal,
  dayIndexOf,
  dayStatus,
  mealMatches,
  planForDate,
  portionedMeals,
  weekAppliedTo,
  weekIdForDate,
} from '../src/domain/plan'
import { emptyMeals } from '../src/domain/nutrients'
import type { DayMeals, Menu, WeekPlan } from '../src/domain/types'

const menu = (id: string): Menu => ({
  id,
  title: id,
  meals: [
    [{ foodId: 'b25', g: 70 }],
    [{ foodId: 'b0', g: 200 }],
    [{ foodId: 'b14', g: 250 }],
    [{ foodId: 'b47', g: 150 }],
  ],
})

const menus = [menu('mn-a'), menu('mn-b')]

const week = (startDate?: string): WeekPlan => {
  const w: WeekPlan = {
    id: 'wk1',
    days: ['mn-a', 'mn-b', null, 'mn-a', 'mn-b', 'mn-a', 'mn-b'],
  }
  if (startDate) w.startDate = startDate
  return w
}

const emptyDays = (): (string | null)[] => [null, null, null, null, null, null, null]

// 10.8.2026. je ponedjeljak.
const PONEDJELJAK = '2026-08-10'

describe('koji je dan u tjednu', () => {
  it('ponedjeljak je nula, nedjelja šest', () => {
    expect(dayIndexOf(PONEDJELJAK)).toBe(0)
    expect(dayIndexOf('2026-08-16')).toBe(6)
  })

  it('svaki dan tjedna dobiva svoje mjesto', () => {
    const indeksi = ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16'].map(dayIndexOf)
    expect(indeksi).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('plan za datum', () => {
  it('nalazi tjedan po datumu ponedjeljka', () => {
    const found = planForDate([week(PONEDJELJAK)], menus, '2026-08-13')
    expect(found?.dayIndex).toBe(3)
    expect(found?.menu?.id).toBe('mn-a')
  })

  it('tjedan bez datuma nije vezan ni uz jedan dan', () => {
    // Sezonski tjedni su obrasci; da se vežu, svaki bi datum imao slučajan plan.
    expect(planForDate([week()], menus, '2026-08-13')).toBeUndefined()
  })

  it('datum izvan tjedna nema plan', () => {
    expect(planForDate([week(PONEDJELJAK)], menus, '2026-08-20')).toBeUndefined()
  })

  it('slobodan dan daje tjedan, ali bez jelovnika', () => {
    const found = planForDate([week(PONEDJELJAK)], menus, '2026-08-12')
    expect(found).toBeDefined()
    expect(found?.menu).toBeUndefined()
  })

  it('kad dva tjedna pokrivaju isti datum, vrijedi noviji', () => {
    const stari = { ...week(PONEDJELJAK), id: 'stari' }
    const novi = { ...week(PONEDJELJAK), id: 'novi', days: ['mn-b', null, null, null, null, null, null] }
    expect(planForDate([stari, novi], menus, PONEDJELJAK)?.week.id).toBe('novi')
  })
})

describe('porcija po osobi', () => {
  it('množi sve gramaže udjelom', () => {
    const scaled = portionedMeals(menu('x').meals, 0.5)
    expect(scaled[0]![0]!.g).toBe(35)
    expect(scaled[1]![0]!.g).toBe(100)
  })

  it('nikad ne svede stavku na nula grama', () => {
    const scaled = portionedMeals([[{ foodId: 'b62', g: 2 }], [], [], []], 0.2)
    expect(scaled[0]![0]!.g).toBe(1)
  })

  it('udio 1 ostavlja plan nepromijenjenim', () => {
    expect(portionedMeals(menu('x').meals, 1)).toEqual(menu('x').meals)
  })

  it('ne dira izvorni jelovnik', () => {
    const original = menu('x').meals
    const snapshot = JSON.stringify(original)
    portionedMeals(original, 2)
    expect(JSON.stringify(original)).toBe(snapshot)
  })
})

describe('stanje dana', () => {
  const planned = menu('x').meals

  it('bez plana je bez plana', () => {
    expect(dayStatus(undefined, undefined)).toBe('bez-plana')
  })

  it('prazan dnevnik uz plan je planirano', () => {
    expect(dayStatus(undefined, planned)).toBe('planirano')
    expect(dayStatus(emptyMeals(), planned)).toBe('planirano')
  })

  it('dnevnik jednak planu je potvrđen', () => {
    expect(dayStatus(confirmDay(planned), planned)).toBe('potvrdeno')
  })

  it('promijenjena gramaža znači izmijenjeno', () => {
    const logged = confirmDay(planned)
    logged[1]![0]!.g = 250
    expect(dayStatus(logged, planned)).toBe('izmijenjeno')
  })

  it('dodana stavka znači izmijenjeno', () => {
    const logged = confirmDay(planned)
    logged[3]!.push({ foodId: 'b56', g: 30 })
    expect(dayStatus(logged, planned)).toBe('izmijenjeno')
  })

  it('obrok se uspoređuje po sadržaju', () => {
    expect(mealMatches([{ foodId: 'b0', g: 100 }], [{ foodId: 'b0', g: 100 }])).toBe(true)
    expect(mealMatches([{ foodId: 'b0', g: 100 }], [{ foodId: 'b0', g: 101 }])).toBe(false)
    expect(mealMatches([], [])).toBe(true)
  })
})

describe('potvrda plana', () => {
  const planned = menu('x').meals

  it('cijeli dan se upisuje u dnevnik', () => {
    const day = confirmDay(planned)
    expect(day).toHaveLength(4)
    expect(day[1]![0]).toEqual({ foodId: 'b0', g: 200 })
  })

  it('upisuje se snimka, ne veza na jelovnik', () => {
    const source = menu('x').meals
    const day = confirmDay(source)
    source[1]![0]!.g = 999
    // Kasnija izmjena jelovnika ne smije prepisati zabilježeni dan.
    expect(day[1]![0]!.g).toBe(200)
  })

  it('pojedini obrok se potvrđuje bez diranja ostalih', () => {
    const day: DayMeals = [[{ foodId: 'b47', g: 100 }], [], [], []]
    const next = confirmMeal(day, 1, planned[1]!)
    expect(next[0]).toEqual([{ foodId: 'b47', g: 100 }])
    expect(next[1]).toEqual([{ foodId: 'b0', g: 200 }])
    expect(next[2]).toEqual([])
  })

  it('potvrda obroka zamjenjuje ono što je ondje bilo', () => {
    const day: DayMeals = [[], [{ foodId: 'b9', g: 50 }], [], []]
    expect(confirmMeal(day, 1, planned[1]!)).toEqual([[], [{ foodId: 'b0', g: 200 }], [], []])
  })

  it('ne dira dan koji je predan', () => {
    const day: DayMeals = [[{ foodId: 'b47', g: 100 }], [], [], []]
    const snapshot = JSON.stringify(day)
    confirmMeal(day, 1, planned[1]!)
    expect(JSON.stringify(day)).toBe(snapshot)
  })
})

describe('primjena tjedna na konkretan datum', () => {
  const predlozak: WeekPlan = {
    id: 'wk-ljeto',
    title: 'Ljetni tjedan',
    season: 'ljeto',
    days: ['mn-a', 'mn-b', null, 'mn-a', 'mn-b', 'mn-a', 'mn-b'],
  }

  it('veže kopiju uz ponedjeljak tog tjedna', () => {
    const kopija = weekAppliedTo(predlozak, '2026-08-13', { id: 'wk-novi', title: 'Tjedan' })
    expect(kopija.startDate).toBe(PONEDJELJAK)
    expect(kopija.id).toBe('wk-novi')
    expect(kopija.days).toEqual(predlozak.days)
  })

  it('ne dira predložak — inače bi se potrošio prvom upotrebom', () => {
    const snapshot = JSON.stringify(predlozak)
    weekAppliedTo(predlozak, PONEDJELJAK, { id: 'x', title: 'Y' })
    expect(JSON.stringify(predlozak)).toBe(snapshot)
  })

  it('kopija više nije sezonski predložak', () => {
    const kopija = weekAppliedTo(predlozak, PONEDJELJAK, { id: 'x', title: 'Y' })
    expect(kopija.season).toBeUndefined()
  })

  it('dani su odvojena kopija, ne ista referenca', () => {
    const kopija = weekAppliedTo(predlozak, PONEDJELJAK, { id: 'x', title: 'Y' })
    kopija.days[0] = 'promijenjeno'
    expect(predlozak.days[0]).toBe('mn-a')
  })

  it('nakon primjene plan za taj datum postoji', () => {
    const kopija = weekAppliedTo(predlozak, '2026-08-13', { id: 'wk-novi', title: 'Tjedan' })
    const found = planForDate([kopija], menus, '2026-08-13')
    expect(found?.menu?.id).toBe('mn-a')
  })
})

describe('koji je tjedan na snazi', () => {
  it('bira datirani tjedan koji pokriva datum', () => {
    const datirani = week(PONEDJELJAK)
    expect(weekIdForDate([datirani], '2026-08-13')).toBe('wk1')
  })

  it('predložak bez datuma nije na snazi', () => {
    // Inace bi kartica Tjedni otvorila predlozak, a Dnevnik citao datiranu
    // kopiju — isti sadrzaj, dva zapisa, i izgleda kao da nisu usklađeni.
    expect(weekIdForDate([week()], '2026-08-13')).toBeNull()
  })

  it('među predlošcima i datiranom kopijom bira kopiju', () => {
    const predlozak: WeekPlan = { id: 'wk-ljeto', title: 'Ljetni', season: 'ljeto', days: emptyDays() }
    const kopija = { ...week(PONEDJELJAK), id: 'wk-kopija' }
    expect(weekIdForDate([predlozak, kopija], PONEDJELJAK)).toBe('wk-kopija')
  })

  it('datum izvan svih tjedana nema tjedan na snazi', () => {
    expect(weekIdForDate([week(PONEDJELJAK)], '2026-09-01')).toBeNull()
  })
})

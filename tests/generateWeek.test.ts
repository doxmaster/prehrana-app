import { describe, expect, it } from 'vitest'
import {
  MAX_FOREIGN_PER_WEEK,
  NO_REPEAT_WEEKS,
  generateWeek,
  recentlyUsed,
} from '../src/domain/generateWeek'
import { WEEK_LENGTH } from '../src/domain/weeks'
import { STARTER_MENUS } from '../src/data/menus'
import type { Cuisine, Menu, WeekPlan } from '../src/domain/types'

/** Determinističan izvor slučajnosti da testovi ne budu nestabilni. */
function seeded(seed = 1) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

const menu = (id: string, cuisine: Cuisine): Menu => ({
  id,
  title: id,
  cuisine,
  meals: [[{ foodId: 'b0', g: 100 }], [], [], []],
})

const domestic = (count: number) =>
  Array.from({ length: count }, (_, i) => menu(`d${i}`, i % 2 ? 'regionalna' : 'hrvatska'))

const week = (days: (string | null)[]): WeekPlan => ({ id: 'w', days })

describe('generateWeek — osnovno', () => {
  it('popuni svih sedam dana kad ima dovoljno jelovnika', () => {
    const r = generateWeek(domestic(10), { random: seeded() })
    expect(r.days).toHaveLength(WEEK_LENGTH)
    expect(r.unfilled).toBe(0)
    expect(r.days.every((d) => d !== null)).toBe(true)
  })

  it('unutar tjedna nema ponavljanja', () => {
    const r = generateWeek(domestic(10), { random: seeded(7) })
    const ids = r.days.filter(Boolean)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('preskače prazne jelovnike', () => {
    const prazan: Menu = { id: 'prazan', cuisine: 'hrvatska', meals: [[], [], [], []] }
    const r = generateWeek([...domestic(7), prazan], { random: seeded(3) })
    expect(r.days).not.toContain('prazan')
  })

  it('bez ijednog upotrebljivog jelovnika vraća prazan tjedan uz obrazloženje', () => {
    const r = generateWeek([{ id: 'x', meals: [[], [], [], []] }], { random: seeded() })
    expect(r.unfilled).toBe(WEEK_LENGTH)
    expect(r.note).toContain('Nema nijednog jelovnika')
  })
})

describe('pravilo o neponavljanju kroz tjedne', () => {
  it('ne koristi jelovnike iz zadnja dva tjedna', () => {
    const menus = domestic(21)
    const prosli = week(['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'])
    const pretprosli = week(['d7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13'])

    const r = generateWeek(menus, { recentWeeks: [prosli, pretprosli], random: seeded(11) })
    const zabranjeni = new Set([...prosli.days, ...pretprosli.days])
    for (const id of r.days) expect(zabranjeni.has(id)).toBe(false)
    expect(r.unfilled).toBe(0)
  })

  it('tjedan stariji od dva se opet smije koristiti', () => {
    const menus = domestic(14)
    const w1 = week(['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'])
    const w2 = week(['d7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13'])
    const w3 = week(['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'])

    // Tri tjedna unatrag, ali gleda se samo zadnja dva.
    const r = generateWeek(menus, { recentWeeks: [w1, w2, w3], random: seeded(5) })
    expect(recentlyUsed([w1, w2, w3]).size).toBe(14)
    expect(r.days.filter(Boolean).length).toBeGreaterThan(0)
  })

  it('kad nema dovoljno jelovnika, radije ponovi nego ostavi prazno', () => {
    const menus = domestic(7)
    const prosli = week(['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'])
    const r = generateWeek(menus, { recentWeeks: [prosli], random: seeded(2) })

    expect(r.unfilled).toBe(0)
    expect(r.note).toContain('ponovljeni')
  })

  it('recentlyUsed gleda točno zadana dva tjedna', () => {
    const w1 = week(['a', null, null, null, null, null, null])
    const w2 = week(['b', null, null, null, null, null, null])
    const w3 = week(['c', null, null, null, null, null, null])
    expect([...recentlyUsed([w1, w2, w3], NO_REPEAT_WEEKS)].sort()).toEqual(['a', 'b'])
  })
})

describe('pravilo o kuhinji', () => {
  it('strano jelo se pojavi najviše jednom tjedno', () => {
    const menus = [...domestic(3), ...Array.from({ length: 10 }, (_, i) => menu(`f${i}`, 'ostalo'))]
    const r = generateWeek(menus, { random: seeded(9) })
    const strani = r.days.filter((id) => id?.startsWith('f')).length
    expect(strani).toBeLessThanOrEqual(MAX_FOREIGN_PER_WEEK)
  })

  it('domaća jela imaju prednost i kad stranih ima više', () => {
    const menus = [...domestic(7), ...Array.from({ length: 20 }, (_, i) => menu(`f${i}`, 'ostalo'))]
    const r = generateWeek(menus, { random: seeded(4) })
    const domaci = r.days.filter((id) => id?.startsWith('d')).length
    expect(domaci).toBe(WEEK_LENGTH)
  })

  it('jelovnik bez oznake kuhinje broji se kao strani', () => {
    const bezOznake: Menu = { id: 'x', meals: [[{ foodId: 'b0', g: 100 }], [], [], []] }
    const r = generateWeek([bezOznake], { random: seeded() })
    expect(r.days.filter((d) => d === 'x')).toHaveLength(MAX_FOREIGN_PER_WEEK)
    expect(r.unfilled).toBe(WEEK_LENGTH - MAX_FOREIGN_PER_WEEK)
  })

  it('radije ostavi dan prazan nego prekrši granicu stranih jela', () => {
    const menus = Array.from({ length: 10 }, (_, i) => menu(`f${i}`, 'ostalo'))
    const r = generateWeek(menus, { random: seeded(6) })
    expect(r.days.filter(Boolean)).toHaveLength(MAX_FOREIGN_PER_WEEK)
    expect(r.note).toContain('slobodn')
  })
})

describe('nad ugrađenim jelovnicima', () => {
  it('svi ugrađeni jelovnici imaju oznaku kuhinje', () => {
    for (const m of STARTER_MENUS) expect(m.cuisine).toBeDefined()
  })

  it('nijedan ugrađeni jelovnik nije stran', () => {
    for (const m of STARTER_MENUS) expect(m.cuisine).not.toBe('ostalo')
  })

  it('iz ugrađene knjižnice složi puni tjedan bez ponavljanja', () => {
    const r = generateWeek(STARTER_MENUS, { random: seeded(13) })
    expect(r.unfilled).toBe(0)
    expect(new Set(r.days).size).toBe(WEEK_LENGTH)
    expect(r.note).toBeUndefined()
  })

  it('dva uzastopna tjedna ne dijele nijedan jelovnik', () => {
    const prvi = generateWeek(STARTER_MENUS, { random: seeded(21) })
    const drugi = generateWeek(STARTER_MENUS, {
      recentWeeks: [week(prvi.days)],
      random: seeded(22),
    })
    const presjek = drugi.days.filter((id) => id && prvi.days.includes(id))
    expect(presjek).toEqual([])
  })
})

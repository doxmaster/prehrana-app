import { describe, expect, it } from 'vitest'
import { rankMenus } from '../src/domain/menuFit'
import { generateWeek } from '../src/domain/generateWeek'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { emptyState } from '../src/domain/migrate'
import { STARTER_RECIPES } from '../src/data/recipes'
import { STARTER_MENUS } from '../src/data/menus'
import type { Household, Menu, Person } from '../src/domain/types'

const DATE = '2026-08-11'

const state = emptyState()
state.recipes = structuredClone(STARTER_RECIPES)
state.menus = structuredClone(STARTER_MENUS)
const foods = buildFoodIndex(state)

const osoba = (over: Partial<Person> = {}): Person => ({
  id: 'p1',
  name: 'Test',
  profile: { sex: 'm', age: 45, act: 1.55, weight: 85, height: 180, goal: 0 },
  log: {},
  measurements: [],
  ...over,
})

const kucanstvo = (ids: string[]): Household => ({ id: 'h1', name: 'Obitelj', memberIds: ids })

/** Jelovnik sastavljen tako da je jasno sto se ocjenjuje. */
const menu = (id: string, items: { foodId: string; g: number }[]): Menu => ({
  id,
  title: id,
  cuisine: 'hrvatska',
  meals: [items, [], [], []],
})

describe('ocjena jelovnika prema ukućanima', () => {
  it('bez stanja i bez ciljeva ocjena postoji, ali nitko nije blokiran', () => {
    const people = [osoba()]
    const fit = rankMenus(STARTER_MENUS, kucanstvo(['p1']), people, foods, DATE)
    expect(fit.active).toBe(true)
    expect([...fit.byId.values()].every((f) => !f.blocked)).toBe(true)
  })

  it('dan koji probije granicu željeza kod hemokromatoze je blokiran', () => {
    const people = [osoba({ conditions: ['hemokromatoza'] })]
    // Zobene pahuljice imaju 3,8 mg/100 g — 400 g probije granicu od 8 mg.
    const zeljezni = menu('zeljezni', [{ foodId: 'b25', g: 400 }])
    const lagani = menu('lagani', [{ foodId: 'b47', g: 200 }])

    const fit = rankMenus([zeljezni, lagani], kucanstvo(['p1']), people, foods, DATE)
    expect(fit.byId.get('zeljezni')!.blocked).toBe(true)
    expect(fit.byId.get('lagani')!.blocked).toBe(false)
    expect(fit.byId.get('zeljezni')!.score).toBeLessThan(fit.byId.get('lagani')!.score)
    expect(fit.byId.get('zeljezni')!.why.join(' ')).toContain('Hemokromatoza')
  })

  it('kod celijakije jelovnik s kruhom pada ispod onog bez njega', () => {
    const people = [osoba({ conditions: ['celijakija'] })]
    const sKruhom = menu('kruh', [{ foodId: 'b21', g: 120 }, { foodId: 'b16', g: 60 }])
    const bezKruha = menu('riza', [{ foodId: 'b22', g: 250 }, { foodId: 'b16', g: 60 }])

    const fit = rankMenus([sKruhom, bezKruha], kucanstvo(['p1']), people, foods, DATE)
    expect(fit.byId.get('kruh')!.score).toBeLessThan(fit.byId.get('riza')!.score)
  })

  it('tko mršavi dobiva bolju ocjenu za dan bliži svom nižem cilju', () => {
    const mrsavi = [osoba({ profile: { sex: 'm', age: 45, act: 1.55, weight: 110, height: 180, goal: -500 } })]
    const obilan = menu('obilan', [{ foodId: 'b56', g: 400 }])
    const umjeren = menu('umjeren', [{ foodId: 'b47', g: 300 }, { foodId: 'b15', g: 200 }])

    const fit = rankMenus([obilan, umjeren], kucanstvo(['p1']), mrsavi, foods, DATE)
    expect(fit.byId.get('umjeren')!.score).toBeGreaterThan(fit.byId.get('obilan')!.score)
  })

  it('vlakna iznad cilja dižu ocjenu', () => {
    const people = [osoba({ conditions: ['dijabetes2'] })]
    const vlaknasti = menu('vlakna', [{ foodId: 'b32', g: 400 }, { foodId: 'b25', g: 100 }])
    const prazni = menu('prazan', [{ foodId: 'b19', g: 60 }])

    const fit = rankMenus([vlaknasti, prazni], kucanstvo(['p1']), people, foods, DATE)
    expect(fit.byId.get('vlakna')!.score).toBeGreaterThan(fit.byId.get('prazan')!.score)
  })

  it('ista sporna namirnica ne kažnjava se jednom po članu obitelji', () => {
    const jedan = [osoba({ id: 'p1', conditions: ['celijakija'] })]
    const cetvero = [
      osoba({ id: 'p1', conditions: ['celijakija'] }),
      osoba({ id: 'p2', name: 'B' }),
      osoba({ id: 'p3', name: 'C' }),
      osoba({ id: 'p4', name: 'D' }),
    ]
    const sKruhom = menu('kruh', [{ foodId: 'b21', g: 120 }])

    const a = rankMenus([sKruhom], kucanstvo(['p1']), jedan, foods, DATE).byId.get('kruh')!
    const b = rankMenus([sKruhom], kucanstvo(['p1', 'p2', 'p3', 'p4']), cetvero, foods, DATE).byId.get('kruh')!
    // Prosjek po clanu: kod cetvero se ista kazna dijeli, ne mnozi.
    expect(b.score).toBeGreaterThan(a.score)
  })

  it('objašnjenje ne nabraja beskonačno', () => {
    const people = [osoba({ conditions: ['celijakija', 'laktoza', 'dijabetes2'] })]
    const los = menu('los', [
      { foodId: 'b21', g: 200 },
      { foodId: 'b13', g: 400 },
      { foodId: 'b20', g: 200 },
      { foodId: 'b24', g: 300 },
    ])
    const fit = rankMenus([los], kucanstvo(['p1']), people, foods, DATE).byId.get('los')!
    expect(fit.why.length).toBeLessThanOrEqual(4)
  })
})

describe('generator koristi ocjenu', () => {
  const seeded = (seed = 1) => {
    let value = seed
    return () => {
      value = (value * 1664525 + 1013904223) % 4294967296
      return value / 4294967296
    }
  }

  const many = (prefix: string, count: number) =>
    Array.from({ length: count }, (_, i) => menu(`${prefix}${i}`, [{ foodId: 'b0', g: 150 }]))

  it('bolje ocijenjeni ulaze u tjedan prije slabijih', () => {
    const dobri = many('dobar', 7)
    const losi = many('los', 7)
    const r = generateWeek([...losi, ...dobri], {
      random: seeded(5),
      score: (m) => (m.id.startsWith('dobar') ? 100 : 0),
    })
    expect(r.days.every((id) => id?.startsWith('dobar'))).toBe(true)
  })

  it('bliske ocjene ostaju u slučajnom poretku, pa se tjedni razlikuju', () => {
    const menus = many('m', 20)
    const prvi = generateWeek(menus, { random: seeded(3), score: () => 10 })
    const drugi = generateWeek(menus, { random: seeded(9), score: () => 10 })
    expect(prvi.days).not.toEqual(drugi.days)
  })

  it('blokirani jelovnik ide iza svih, bez obzira na ocjenu', () => {
    const menus = [...many('ok', 7), ...many('blok', 3)]
    const r = generateWeek(menus, {
      random: seeded(11),
      discouraged: (m) => m.id.startsWith('blok'),
      score: (m) => (m.id.startsWith('blok') ? 1000 : 0),
    })
    expect(r.days.some((id) => id?.startsWith('blok'))).toBe(false)
  })

  it('nad ugrađenim jelovnicima i stvarnom obitelji složi puni tjedan', () => {
    const people = [
      osoba({ id: 'p1', name: 'Otac', conditions: ['hemokromatoza', 'dijabetes2'] }),
      osoba({ id: 'p2', name: 'Dijete', profile: { sex: 'z', age: 10, act: 1.55, weight: 32, height: 138, goal: 0 } }),
    ]
    const fit = rankMenus(STARTER_MENUS, kucanstvo(['p1', 'p2']), people, foods, DATE)
    const r = generateWeek(STARTER_MENUS, {
      random: seeded(21),
      score: (m) => fit.byId.get(m.id)?.score ?? 0,
      discouraged: (m) => fit.byId.get(m.id)?.blocked ?? false,
    })
    expect(r.unfilled).toBe(0)
    expect(new Set(r.days).size).toBe(7)
  })
})

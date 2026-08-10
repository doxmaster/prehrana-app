import { describe, expect, it } from 'vitest'
import { RESET_PARTS, describeReset, resetParts, restoreStarterContent } from '../src/domain/reset'
import { migrateState } from '../src/domain/migrate'
import { STARTER_MENUS, STARTER_WEEKS } from '../src/data/menus'
import { STARTER_RECIPES } from '../src/data/recipes'
import type { AppState } from '../src/domain/types'

function populated(): AppState {
  return migrateState({
    profiles: [
      {
        id: 'p1',
        name: 'A',
        profile: { sex: 'm', age: 40, act: 1.55, weight: 85, height: 180, goal: 0 },
        log: { '2026-08-01': [[{ foodId: 'b0', g: 100 }], [], [], []] },
        measurements: [{ date: '2026-08-01', weight: 85 }],
      },
      { id: 'p2', name: 'B', profile: {}, log: {} },
    ],
    households: [{ id: 'h1', name: 'Obitelj', memberIds: ['p1', 'p2'] }],
    menus: [{ id: 'mn1', title: 'Radni', meals: [[{ foodId: 'b0', g: 100 }], [], [], []] }],
    weeks: [{ id: 'wk1', days: ['mn1', null, null, null, null, null, null], householdId: 'h1' }],
    recipes: [{ id: 'rc1', name: 'Jelo', cat: 'Ostalo', servings: 2, items: [{ foodId: 'b0', g: 200 }] }],
    customFoods: [{ id: 'c1', name: 'Moje', cat: 'Ostalo', kcal: 100 }],
    foodRenames: { b0: 'Preimenovano' },
    foodHidden: ['b1'],
  })
}

describe('resetParts — pojedinačni dijelovi', () => {
  it('briše samo dnevnik, ostalo ostaje', () => {
    const r = resetParts(populated(), ['log'])
    expect(Object.keys(r.profiles[0]!.log)).toEqual([])
    expect(r.profiles[0]!.measurements).toHaveLength(1)
    expect(r.menus).toHaveLength(1)
    expect(r.customFoods).toHaveLength(1)
  })

  it('briše samo mjerenja', () => {
    const r = resetParts(populated(), ['measurements'])
    expect(r.profiles[0]!.measurements).toEqual([])
    expect(Object.keys(r.profiles[0]!.log)).toHaveLength(1)
  })

  it('briše tjedne, a jelovnici ostaju', () => {
    const r = resetParts(populated(), ['weeks'])
    expect(r.weeks).toEqual([])
    expect(r.menus).toHaveLength(1)
  })

  it('briše izmjene ugrađenih namirnica', () => {
    const before = populated()
    expect(before.overrides.names.b0).toBe('Preimenovano')
    const r = resetParts(before, ['overrides'])
    expect(r.overrides).toEqual({ names: {}, cats: {}, vals: {}, servs: {}, hidden: [] })
  })

  it('brisanje osoba ostavlja jednu praznu i prazni kućanstva', () => {
    const r = resetParts(populated(), ['profiles'])
    expect(r.profiles).toHaveLength(1)
    expect(r.profiles[0]!.log).toEqual({})
    expect(r.activeProfileId).toBe(r.profiles[0]!.id)
    expect(r.households[0]!.memberIds).toEqual([])
  })

  it('brisanje jelovnika prazni dane u tjednima umjesto da ostavi mrtve veze', () => {
    const r = resetParts(populated(), ['menus'])
    expect(r.menus).toHaveLength(1)
    expect(r.weeks[0]!.days.every((d) => d === null)).toBe(true)
  })

  it('brisanje kućanstava miče i vezu iz tjedna', () => {
    const r = resetParts(populated(), ['households'])
    expect(r.households).toHaveLength(1)
    expect(r.weeks[0]!.householdId).toBeUndefined()
  })

  it('nikad ne ostavlja stanje bez osobe, kućanstva i jelovnika', () => {
    const r = resetParts(populated(), RESET_PARTS.map((p) => p.key))
    expect(r.profiles.length).toBeGreaterThan(0)
    expect(r.households.length).toBeGreaterThan(0)
    expect(r.menus.length).toBeGreaterThan(0)
    expect(r.profiles.some((p) => p.id === r.activeProfileId)).toBe(true)
  })

  it('ne dira izvorno stanje', () => {
    const original = populated()
    const snapshot = JSON.stringify(original)
    resetParts(original, ['log', 'menus', 'profiles'])
    expect(JSON.stringify(original)).toBe(snapshot)
  })

  it('prazan odabir ništa ne mijenja', () => {
    const original = populated()
    const r = resetParts(original, [])
    expect({ ...r, updatedAt: 0 }).toEqual({ ...original, updatedAt: 0 })
  })
})

describe('describeReset', () => {
  it('nabraja koliko čega nestaje', () => {
    const lines = describeReset(populated(), ['log', 'menus'])
    expect(lines.join(' ')).toContain('1 dana dnevnika')
    expect(lines.join(' ')).toContain('1 jelovnika')
  })

  it('brisanje osoba nadjačava pojedinačne dijelove u opisu', () => {
    const lines = describeReset(populated(), ['profiles', 'log'])
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('osoba')
  })
})

describe('restoreStarterContent', () => {
  const starter = { recipes: STARTER_RECIPES, menus: STARTER_MENUS, weeks: STARTER_WEEKS }

  it('dodaje ugrađeni sadržaj koji nedostaje', () => {
    const { state, added } = restoreStarterContent(populated(), starter)
    expect(added.menus).toBe(STARTER_MENUS.length)
    expect(state.menus.length).toBeGreaterThanOrEqual(STARTER_MENUS.length)
    expect(state.recipes.length).toBeGreaterThan(1)
  })

  it('ne duplicira ono što već postoji', () => {
    const once = restoreStarterContent(populated(), starter)
    const twice = restoreStarterContent(once.state, starter)
    expect(twice.added).toEqual({ recipes: 0, menus: 0, weeks: 0 })
    expect(twice.state.menus.length).toBe(once.state.menus.length)
  })

  it('ne pregazi jelovnik koji je korisnik izmijenio', () => {
    const base = populated()
    base.menus.push({ ...structuredClone(STARTER_MENUS[0]!), title: 'Moja izmjena' })
    const { state } = restoreStarterContent(base, starter)
    const mine = state.menus.find((m) => m.id === STARTER_MENUS[0]!.id)
    expect(mine?.title).toBe('Moja izmjena')
  })

  it('popunjava sezonske tjedne koji su ostali prazni bez jelovnika', () => {
    const base = populated()
    base.weeks = STARTER_WEEKS.map((w) => ({ ...structuredClone(w), days: w.days.map(() => null) }))
    const { state } = restoreStarterContent(base, starter)
    for (const week of state.weeks) {
      expect(week.days.some(Boolean), week.title).toBe(true)
    }
  })

  it('izbacuje prazan početni jelovnik kad stignu pravi', () => {
    const base = populated()
    base.menus = [{ id: 'prazan', meals: [[], [], [], []] }]
    const { state } = restoreStarterContent(base, starter)
    expect(state.menus.find((m) => m.id === 'prazan')).toBeUndefined()
  })

  it('ne dira izvorno stanje', () => {
    const original = populated()
    const snapshot = JSON.stringify(original)
    restoreStarterContent(original, starter)
    expect(JSON.stringify(original)).toBe(snapshot)
  })
})

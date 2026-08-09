import { describe, expect, it } from 'vitest'
import {
  PORTION_LIMITS,
  REFERENCE_KCAL,
  householdFactor,
  householdKcal,
  memberShares,
  membersOf,
  portionFactor,
} from '../src/domain/household'
import { computeTargets } from '../src/domain/targets'
import { migrateState } from '../src/domain/migrate'
import type { Household, Person, Profile } from '../src/domain/types'

const person = (id: string, name: string, profile: Profile, override?: number): Person => ({
  id,
  name,
  profile,
  log: {},
  measurements: [],
  ...(override !== undefined ? { portionFactor: override } : {}),
})

const OTAC = person('p1', 'Otac', { sex: 'm', age: 42, act: 1.55, weight: 88, height: 182, goal: 0 })
const MAJKA = person('p2', 'Majka', { sex: 'z', age: 40, act: 1.375, weight: 65, height: 168, goal: 0 })
const DIJETE = person('p3', 'Dijete', { sex: 'm', age: 10, act: 1.375, weight: 32, height: 138, goal: 0 })

const OBITELJ: Household = { id: 'h1', name: 'Obitelj', memberIds: ['p1', 'p2', 'p3'] }
const SVI = [OTAC, MAJKA, DIJETE]

describe('portionFactor', () => {
  it('odrasli muškarac traži više od referentnog unosa', () => {
    const factor = portionFactor(OTAC)
    expect(factor).toBeGreaterThan(1)
    expect(factor).toBeCloseTo(computeTargets(OTAC.profile).kcal / REFERENCE_KCAL, 1)
  })

  it('dijete traži bitno manje od odraslog', () => {
    expect(portionFactor(DIJETE)).toBeLessThan(portionFactor(MAJKA))
    expect(portionFactor(DIJETE)).toBeLessThan(1)
  })

  it('ručno zadan udio ima prednost pred izračunom', () => {
    const sOverrideom = person('p9', 'X', OTAC.profile, 0.5)
    expect(portionFactor(sOverrideom)).toBe(0.5)
  })

  it('besmislen ručni udio se ignorira, a ne ruši izračun', () => {
    for (const bad of [0, -3, Number.NaN]) {
      const p = person('p9', 'X', OTAC.profile, bad)
      expect(portionFactor(p)).toBe(portionFactor(OTAC))
    }
  })

  it('udio se drži unutar granica i za ekstremne profile', () => {
    const div = person('p9', 'Div', { sex: 'm', age: 25, act: 1.9, weight: 250, height: 220, goal: 1000 })
    expect(portionFactor(div)).toBeLessThanOrEqual(PORTION_LIMITS.max)
    expect(portionFactor(div)).toBeGreaterThanOrEqual(PORTION_LIMITS.min)
  })
})

describe('householdFactor', () => {
  it('zbraja udjele svih članova', () => {
    const expected = portionFactor(OTAC) + portionFactor(MAJKA) + portionFactor(DIJETE)
    expect(householdFactor(OBITELJ, SVI)).toBeCloseTo(expected, 2)
  })

  it('obitelj s djetetom traži manje nego tri odrasla', () => {
    const troOdraslih: Household = { id: 'h2', name: 'Tri odrasla', memberIds: ['p1', 'p1', 'p1'] }
    expect(householdFactor(OBITELJ, SVI)).toBeLessThan(householdFactor(troOdraslih, SVI))
  })

  it('prazno kućanstvo daje nulu umjesto greške', () => {
    expect(householdFactor({ id: 'h0', name: 'Prazno', memberIds: [] }, SVI)).toBe(0)
  })

  it('član kojeg više nema ne broji se', () => {
    const sDuhom: Household = { id: 'h3', name: 'X', memberIds: ['p1', 'obrisan'] }
    expect(householdFactor(sDuhom, SVI)).toBeCloseTo(portionFactor(OTAC), 2)
    expect(membersOf(sDuhom, SVI)).toHaveLength(1)
  })
})

describe('householdKcal', () => {
  it('zbraja dnevne ciljeve članova', () => {
    const expected = SVI.reduce((sum, p) => sum + computeTargets(p.profile).kcal, 0)
    expect(householdKcal(OBITELJ, SVI)).toBe(expected)
  })
})

describe('memberShares', () => {
  it('označava je li udio ručni ili izračunat', () => {
    const ljudi = [OTAC, person('p2', 'Majka', MAJKA.profile, 0.8)]
    const shares = memberShares({ id: 'h', name: 'X', memberIds: ['p1', 'p2'] }, ljudi)
    expect(shares[0]!.manual).toBe(false)
    expect(shares[1]!.manual).toBe(true)
    expect(shares[1]!.factor).toBe(0.8)
  })
})

describe('migracija u v4 — kućanstva', () => {
  it('stariji podaci dobivaju jednu obitelj sa svim osobama', () => {
    const state = migrateState({
      profiles: [
        { id: 'p1', name: 'A', profile: {} },
        { id: 'p2', name: 'B', profile: {} },
      ],
    })
    expect(state.households).toHaveLength(1)
    expect(state.households[0]!.memberIds).toEqual(['p1', 'p2'])
  })

  it('član kojeg više nema izbacuje se iz kućanstva', () => {
    const state = migrateState({
      profiles: [{ id: 'p1', name: 'A', profile: {} }],
      households: [{ id: 'h1', name: 'Obitelj', memberIds: ['p1', 'obrisan', 'p1'] }],
    })
    expect(state.households[0]!.memberIds).toEqual(['p1'])
  })
})

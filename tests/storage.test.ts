import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../src/domain/constants'
import {
  buildExport,
  exportFilename,
  loadState,
  parseImport,
  readLastExport,
  writeLastExport,
} from '../src/store/storage'
import { migrateState } from '../src/domain/migrate'
import { STARTER_RECIPES } from '../src/data/recipes'
import { STARTER_MENUS } from '../src/data/menus'

/** Stanje kakvo je zapisano prije nego sto je katalog jela narastao. */
function staroStanje(recepata: number) {
  return migrateState({
    profiles: [{ id: 'p1', name: 'A', profile: {}, log: {} }],
    menus: STARTER_MENUS.slice(0, 3).map((m) => structuredClone(m)),
    recipes: STARTER_RECIPES.slice(0, recepata).map((r) => structuredClone(r)),
  })
}

describe('loadState — dopuna kataloga jela', () => {
  beforeEach(() => localStorage.clear())

  it('prvi start dobiva cijeli ugrađeni sadržaj', () => {
    const { state, from } = loadState()
    expect(from).toBeNull()
    expect(state.recipes).toHaveLength(STARTER_RECIPES.length)
    expect(state.menus).toHaveLength(STARTER_MENUS.length)
  })

  it('starom stanju s 10 recepata dopunjava ostatak kataloga', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staroStanje(10)))
    const { state } = loadState()
    expect(state.recipes).toHaveLength(STARTER_RECIPES.length)
  })

  it('ne dira recept koji već postoji', () => {
    const stanje = staroStanje(10)
    stanje.recipes[0]!.name = 'Moje ime'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stanje))

    const { state } = loadState()
    const mine = state.recipes.filter((r) => r.id === stanje.recipes[0]!.id)
    expect(mine).toHaveLength(1)
    expect(mine[0]!.name).toBe('Moje ime')
  })

  it('ne duplicira pri ponovnom učitavanju', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staroStanje(10)))
    const prvi = loadState().state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prvi))
    const drugi = loadState().state

    expect(drugi.recipes).toHaveLength(STARTER_RECIPES.length)
    expect(new Set(drugi.recipes.map((r) => r.id)).size).toBe(drugi.recipes.length)
  })

  it('jelovnike NE dopunjava sam — njih korisnik smije obrisati', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staroStanje(10)))
    const { state } = loadState()
    expect(state.menus).toHaveLength(3)
  })
})

/**
 * Izvoz je zadnja obrana od gubitka podataka, pa se testira ono sto se od njega
 * ocekuje: da odnese SVE i da se moze vratiti natrag.
 */
describe('izvoz i uvoz', () => {
  beforeEach(() => localStorage.clear())

  function stanjeSaSvime() {
    const state = staroStanje(5)
    state.profiles[0]!.log['2026-08-19'] = [[{ foodId: 'f1', g: 100 }], [], [], []]
    state.customFoods.push({
      id: 'c1',
      name: 'Moja namirnica',
      cat: 'ostalo',
      kcal: 100,
      p: 1,
      c: 2,
      f: 3,
      fib: 0,
      fe: 0,
      ca: 0,
      mg: 0,
      vc: 0,
      vd: 0,
      serv: 100,
      source: 'user',
    })
    state.weeks.push({ id: 'w1', title: 'Tjedan', days: [] })
    return state
  }

  it('nosi cijeli zapis stanja, ne izbor polja', () => {
    const state = stanjeSaSvime()
    const { state: izvezeno } = buildExport(state)

    // Usporedba cijelog objekta: novo polje u stanju ne smije tiho ispasti.
    expect(izvezeno).toEqual(state)
  })

  it('sažetak govori što je u datoteci', () => {
    const { summary } = buildExport(stanjeSaSvime())
    expect(summary.osoba).toBe(1)
    expect(summary.danaSUnosom).toBe(1)
    expect(summary.recepata).toBe(5)
    expect(summary.vlastitihNamirnica).toBe(1)
  })

  it('uvoz vraća isto stanje koje je izvezeno', () => {
    const state = stanjeSaSvime()
    const tekst = JSON.stringify(buildExport(state))

    const vraceno = parseImport(tekst)
    expect(vraceno.profiles[0]!.log['2026-08-19']).toEqual(state.profiles[0]!.log['2026-08-19'])
    expect(vraceno.customFoods).toHaveLength(1)
    expect(vraceno.recipes).toHaveLength(5)
    expect(vraceno.weeks).toHaveLength(1)
  })

  it('prima i stare kopije bez omotnice', () => {
    const state = stanjeSaSvime()
    const vraceno = parseImport(JSON.stringify(state))
    expect(vraceno.profiles).toHaveLength(1)
    expect(vraceno.customFoods).toHaveLength(1)
  })

  it('datoteka bez osoba se odbija, a ne uveze prazno preko podataka', () => {
    expect(() => parseImport('{"state":{"profiles":[]}}')).toThrow()
    expect(() => parseImport('nije json')).toThrow()
  })

  it('naziv datoteke nosi datum, pa se kopije ne prepisuju', () => {
    expect(exportFilename(new Date(2026, 7, 9))).toBe('prehrana-2026-08-09.json')
    expect(exportFilename(new Date(2026, 11, 31))).toBe('prehrana-2026-12-31.json')
  })

  it('pamti kad je izvoz napravljen', () => {
    expect(readLastExport()).toBeNull()
    const kada = new Date(2026, 7, 19, 10, 30)
    writeLastExport(kada)
    expect(readLastExport()).toBe(kada.toISOString())
  })
})

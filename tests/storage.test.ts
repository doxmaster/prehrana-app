import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../src/domain/constants'
import { loadState } from '../src/store/storage'
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

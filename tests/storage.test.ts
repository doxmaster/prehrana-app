import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../src/domain/constants'
import {
  buildExport,
  exportFilename,
  jeArtefaktnoPodrijetlo,
  loadState,
  parseImport,
  readExportMark,
  writeExportMark,
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

    const { state: vraceno } = parseImport(tekst)
    expect(vraceno.profiles[0]!.log['2026-08-19']).toEqual(state.profiles[0]!.log['2026-08-19'])
    expect(vraceno.customFoods).toHaveLength(1)
    expect(vraceno.recipes).toHaveLength(5)
    expect(vraceno.weeks).toHaveLength(1)
  })

  it('prima i stare kopije bez omotnice', () => {
    const state = stanjeSaSvime()
    const { state: vraceno, exportedAt } = parseImport(JSON.stringify(state))
    expect(vraceno.profiles).toHaveLength(1)
    expect(vraceno.customFoods).toHaveLength(1)
    expect(exportedAt).toBeNull()
  })

  it('uvoz javlja kad je datoteka izvezena — inače bi pisalo da kopije nema', () => {
    const kada = new Date(2026, 7, 19, 11, 27)
    const tekst = JSON.stringify(buildExport(stanjeSaSvime(), kada))
    expect(parseImport(tekst).exportedAt).toBe(kada.toISOString())
  })

  it('pokvaren datum u omotnici se ignorira, podaci se svejedno uvezu', () => {
    const omotnica = { ...buildExport(stanjeSaSvime()), exportedAt: 'jučer navečer' }
    const { state, exportedAt } = parseImport(JSON.stringify(omotnica))
    expect(exportedAt).toBeNull()
    expect(state.profiles).toHaveLength(1)
  })

  it('datoteka bez osoba se odbija, a ne uveze prazno preko podataka', () => {
    expect(() => parseImport('{"state":{"profiles":[]}}')).toThrow()
    expect(() => parseImport('nije json')).toThrow()
  })

  it('naziv datoteke nosi datum, pa se kopije ne prepisuju', () => {
    expect(exportFilename(new Date(2026, 7, 9))).toBe('prehrana-2026-08-09.json')
    expect(exportFilename(new Date(2026, 11, 31))).toBe('prehrana-2026-12-31.json')
  })

  it('pamti datum kopije i stanje podataka u njoj', () => {
    expect(readExportMark()).toBeNull()
    const mark = { at: new Date(2026, 7, 19, 10, 30).toISOString(), dataAt: 1755000000000 }
    writeExportMark(mark)
    expect(readExportMark()).toEqual(mark)
  })

  it('čita i zapis prvog izdanja, koji je pamtio samo datum', () => {
    localStorage.setItem(`${STORAGE_KEY}_zadnji_izvoz`, '2026-08-01T09:00:00.000Z')
    // dataAt 0 znaci "ne zna se", pa se podaci racunaju kao promijenjeni.
    expect(readExportMark()).toEqual({ at: '2026-08-01T09:00:00.000Z', dataAt: 0 })
  })

  it('pokvaren zapis ne ruši karticu', () => {
    localStorage.setItem(`${STORAGE_KEY}_zadnji_izvoz`, '{ nije json')
    expect(readExportMark()).toBeNull()
  })
})

/**
 * Prepoznavanje Claudeova okvira.
 *
 * O ovome ovisi hoce li se javiti lazni uspjeh spremanja: u okviru veza za
 * preuzimanje ne radi, pa se na nju ne smije pasti natrag.
 */
describe('podrijetlo artefakta', () => {
  it('prepoznaje okvir artefakta', () => {
    expect(jeArtefaktnoPodrijetlo('9d76aca7-39aa.frame.claudeusercontent.com')).toBe(true)
    expect(jeArtefaktnoPodrijetlo('claudeusercontent.com')).toBe(true)
  })

  it('obično računalo i vlastiti poslužitelj nisu okvir', () => {
    expect(jeArtefaktnoPodrijetlo('localhost')).toBe(false)
    expect(jeArtefaktnoPodrijetlo('darijo.github.io')).toBe(false)
  })

  it('ne nasjeda na podmetnuto ime domene', () => {
    expect(jeArtefaktnoPodrijetlo('claudeusercontent.com.zlonamjerno.hr')).toBe(false)
    expect(jeArtefaktnoPodrijetlo('lazniclaudeusercontent.com')).toBe(false)
  })
})

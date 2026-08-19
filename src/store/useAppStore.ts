import { create } from 'zustand'
import { buildFoodIndex, type FoodIndex } from '../domain/foodIndex'
import { emptyMeals } from '../domain/nutrients'
import { todayISO } from '../domain/dates'
import { weekIdForDate } from '../domain/plan'
import { uid } from '../domain/id'
import { loadState, saveState, writeSafetyBackup } from './storage'
import type { AppState, DayMeals, Person } from '../domain/types'

const initial = loadState()

/**
 * Tjedan na koji se kartica Tjedni otvara: onaj koji POKRIVA danasnji datum,
 * a ne prvi u popisu.
 *
 * Dnevnik plan cita po datumu, pa bi Tjedni otvoreni na nekom drugom tjednu
 * pokazivali drugi raspored od onoga koji se u Dnevniku nudi na potvrdu —
 * izgleda kao da dva zaslona nisu usklađena, iako su podaci ispravni.
 */
function startingWeekId(state: AppState): string | null {
  return weekIdForDate(state.weeks, todayISO()) ?? state.weeks[0]?.id ?? null
}

interface StoreState {
  data: AppState
  /** Pretraživač namirnica — ponovno se gradi samo kad se podaci promijene. */
  foods: FoodIndex
  selectedDate: string
  activeMenuIndex: number
  /** Odabrani tjedni plan; null kad ih nema. */
  activeWeekId: string | null
  /**
   * Kucanstvo odabrano u zaglavlju. Tjedan ima svoje, pa ovo vrijedi kao izbor
   * dok se ne otvori tjedan koji je vec vezan uz neko drugo.
   */
  activeHouseholdId: string | null
  /** Poruka o neuspjelom spremanju, npr. puna memorija preglednika. */
  saveError: string | null
  /** Podaci su pri prvom pokretanju preuzeti iz stare verzije. */
  migratedFrom: string | null
  /**
   * Stanje prije zadnje promjene. Postoji da se svaka izmjena moze poništiti
   * jednim klikom — jeftinije od potvrde na svakom gumbu i hvata i ono sto se
   * nije predvidjelo (krivo obrisana stavka, prepisan raspored).
   */
  previous: { state: AppState; label: string } | null

  /**
   * Jedina točka izmjene podataka — mutira nacrt, sprema i osvježava indeks.
   * `label` opisuje sto se mijenjalo i pojavljuje se u ponudi za poništavanje.
   */
  update: (recipe: (draft: AppState) => void, label?: string) => void
  /** Zamjena cijelog stanja (uvoz, brisanje dijelova, obnova). */
  replaceAll: (next: AppState, label?: string) => void
  /** Vraca stanje na ono prije zadnje promjene. */
  undo: () => boolean
  setSelectedDate: (date: string) => void
  setActiveMenuIndex: (index: number) => void
  setActiveWeekId: (id: string | null) => void
  setActiveHouseholdId: (id: string | null) => void
  dismissMigrationNotice: () => void
}

export const useAppStore = create<StoreState>()((set, get) => ({
  data: initial.state,
  foods: buildFoodIndex(initial.state),
  selectedDate: todayISO(),
  activeMenuIndex: 0,
  activeWeekId: startingWeekId(initial.state),
  activeHouseholdId: initial.state.households[0]?.id ?? null,
  saveError: null,
  migratedFrom: initial.migrated ? initial.from : null,
  previous: null,

  update: (recipe, label = 'promjena') => {
    const before = get().data
    const next = structuredClone(before)
    recipe(next)
    const outcome = saveState(next)
    set({
      data: next,
      foods: buildFoodIndex(next),
      previous: { state: before, label },
      saveError:
        outcome.ok === true
          ? null
          : outcome.reason === 'quota'
            ? 'Memorija preglednika je puna — izvezi podatke i obriši starije unose.'
            : 'Spremanje nije uspjelo.',
    })
  },

  replaceAll: (next, label = 'zamjena podataka') => {
    const before = get().data
    // Veliki zahvati dobivaju i kopiju koja prezivi zatvaranje preglednika;
    // poništavanje u sucelju vrijedi samo dok je kartica otvorena.
    writeSafetyBackup(before, label)
    saveState(next)
    set({
      data: next,
      foods: buildFoodIndex(next),
      activeMenuIndex: 0,
      activeWeekId: startingWeekId(next),
      activeHouseholdId: next.households[0]?.id ?? null,
      saveError: null,
      previous: { state: before, label },
    })
  },

  undo: () => {
    const { previous } = get()
    if (!previous) return false
    saveState(previous.state)
    set({
      data: previous.state,
      foods: buildFoodIndex(previous.state),
      activeWeekId: startingWeekId(previous.state),
      previous: null,
      saveError: null,
    })
    return true
  },

  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setActiveMenuIndex: (activeMenuIndex) => set({ activeMenuIndex }),
  setActiveWeekId: (activeWeekId) => set({ activeWeekId }),
  setActiveHouseholdId: (activeHouseholdId) => set({ activeHouseholdId }),
  dismissMigrationNotice: () => set({ migratedFrom: null }),
}))

/* ---------- selektori ---------- */

export const useFoods = () => useAppStore((s) => s.foods)
export const useUpdate = () => useAppStore((s) => s.update)

export function useActivePerson(): Person {
  return useAppStore((s) => s.data.profiles.find((p) => p.id === s.data.activeProfileId) ?? s.data.profiles[0]!)
}

/**
 * Vraca samo referencu na polje iz stanja. Mapiranje u nove objekte ovdje bi
 * pri svakom citanju dalo nove reference, pa bi useSyncExternalStore vrtio
 * beskonacnu petlju — useShallow usporeduje elemente po referenci, ne dubinski.
 */
export function usePeople(): readonly Person[] {
  return useAppStore((s) => s.data.profiles)
}

export function useDayMeals(date: string): DayMeals {
  return useAppStore((s) => {
    const person = s.data.profiles.find((p) => p.id === s.data.activeProfileId) ?? s.data.profiles[0]!
    return person.log[date] ?? EMPTY
  })
}

/** Zajednička referenca da useSyncExternalStore ne vidi novi objekt pri svakom čitanju. */
const EMPTY: DayMeals = emptyMeals()

/* ---------- pomoćnici za izmjene ---------- */

export function activePersonOf(state: AppState): Person {
  return state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0]!
}

export function ensureDay(state: AppState, date: string): DayMeals {
  const person = activePersonOf(state)
  const existing = person.log[date]
  if (existing) return existing
  const fresh = emptyMeals()
  person.log[date] = fresh
  return fresh
}

export function newPerson(name: string): Person {
  return {
    id: uid('p'),
    name,
    profile: { sex: 'm', age: 30, act: 1.55, weight: 75, height: 178, goal: 0 },
    log: {},
    measurements: [],
  }
}

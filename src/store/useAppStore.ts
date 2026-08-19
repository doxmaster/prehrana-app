import { create } from 'zustand'
import { buildFoodIndex, type FoodIndex } from '../domain/foodIndex'
import { emptyMeals } from '../domain/nutrients'
import { todayISO } from '../domain/dates'
import { weekIdForDate } from '../domain/plan'
import { uid } from '../domain/id'
import { loadState, saveState } from './storage'
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

  /** Jedina točka izmjene podataka — mutira nacrt, sprema i osvježava indeks. */
  update: (recipe: (draft: AppState) => void) => void
  /** Zamjena cijelog stanja (uvoz sigurnosne kopije). */
  replaceAll: (next: AppState) => void
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

  update: (recipe) => {
    const next = structuredClone(get().data)
    recipe(next)
    const outcome = saveState(next)
    set({
      data: next,
      foods: buildFoodIndex(next),
      saveError:
        outcome.ok === true
          ? null
          : outcome.reason === 'quota'
            ? 'Memorija preglednika je puna — izvezi podatke i obriši starije unose.'
            : 'Spremanje nije uspjelo.',
    })
  },

  replaceAll: (next) => {
    saveState(next)
    set({
      data: next,
      foods: buildFoodIndex(next),
      activeMenuIndex: 0,
      activeWeekId: startingWeekId(next),
      activeHouseholdId: next.households[0]?.id ?? null,
      saveError: null,
    })
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

import { planForDate, portionedMeals } from '../domain/plan'
import { portionFactor } from '../domain/household'
import { useActivePerson, useAppStore } from '../store/useAppStore'
import type { DayMeals } from '../domain/types'

/**
 * Veza izmedu tjednog plana i dnevnika.
 *
 * Plan je PRIJEDLOG, dnevnik je CINJENICA — samo se dnevnik broji. Ranije su
 * to bile dvije kartice jedna ispod druge, pa je isti popis obroka stajao
 * dvaput i nitko nije znao gdje se sto upisuje. Sada plan zivi UNUTAR obroka:
 * jedan redak nad popisom za cijeli dan, i po jedan prijedlog u obroku koji
 * jos nije upisan. Cim se upise, prijedlog nestaje — jer je postao cinjenica.
 *
 * Kolicine se prije upisa mnoze udjelom osobe: jelovnik je pisan za jednu
 * referentnu odraslu osobu, pa dijete ne biljezi isti tanjur. Upisuje se
 * snimka stavaka, ne veza na jelovnik, da kasnija izmjena recepta ne prepise
 * ono sto je vec pojedeno.
 */
export interface PlanZaDan {
  /** Obroci iz jelovnika, vec preracunati na udio osobe. */
  meals: DayMeals | undefined
  naslovJelovnika: string | undefined
  naslovTjedna: string
  factor: number
  /** Tjedan pokriva datum, ali taj dan namjerno nema jelovnik. */
  slobodanDan: boolean
}

/** Sto tjedni planovi kazu za zadani datum. Vraca null kad tjedna nema. */
export function usePlanZaDan(date: string): PlanZaDan | null {
  const person = useActivePerson()
  const menus = useAppStore((s) => s.data.menus)
  const weeks = useAppStore((s) => s.data.weeks)

  const planned = planForDate(weeks, menus, date)
  if (!planned) return null

  const factor = portionFactor(person)
  return {
    meals: planned.menu ? portionedMeals(planned.menu.meals, factor) : undefined,
    naslovJelovnika: planned.menu?.title?.trim() || undefined,
    naslovTjedna: planned.week.title ?? 'Tjedan',
    factor,
    slobodanDan: !planned.menu,
  }
}

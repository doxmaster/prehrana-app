import { computeTargets } from './targets'
import type { Household, Person } from './types'

/**
 * Referentni dnevni unos odrasle osobe (EU oznaka hranjivih vrijednosti).
 * Sluzi kao mjerilo za udio pojedinog clana u nabavi.
 */
export const REFERENCE_KCAL = 2000

export const PORTION_LIMITS = { min: 0.2, max: 2.5 } as const

/**
 * Udio jednog clana u kolicinama. Dijete od osam godina ispadne oko 0,6,
 * odrasli muskarac oko 1,3 — pa nabava za obitelj prati stvarne potrebe umjesto
 * da svakog clana broji jednako.
 *
 * Rucno zadan `portionFactor` uvijek ima prednost.
 */
export function portionFactor(person: Person): number {
  if (typeof person.portionFactor === 'number' && person.portionFactor > 0) {
    return clamp(person.portionFactor)
  }
  const kcal = computeTargets(person.profile).kcal
  return clamp(Math.round((kcal / REFERENCE_KCAL) * 20) / 20)
}

function clamp(value: number): number {
  return Math.min(PORTION_LIMITS.max, Math.max(PORTION_LIMITS.min, value))
}

export function membersOf(household: Household, people: Person[]): Person[] {
  const byId = new Map(people.map((p) => [p.id, p]))
  return household.memberIds.map((id) => byId.get(id)).filter((p): p is Person => p !== undefined)
}

/**
 * Zbroj udjela svih clanova. Jelovnik je definiran za jednu referentnu odraslu
 * osobu, pa se njegove kolicine mnoze ovim brojem da bi pokrile cijelo kucanstvo.
 */
export function householdFactor(household: Household, people: Person[]): number {
  const total = membersOf(household, people).reduce((sum, p) => sum + portionFactor(p), 0)
  return Math.round(total * 100) / 100
}

/** Ukupna dnevna energetska potreba kucanstva. */
export function householdKcal(household: Household, people: Person[]): number {
  return membersOf(household, people).reduce((sum, p) => sum + computeTargets(p.profile).kcal, 0)
}

export interface MemberShare {
  person: Person
  factor: number
  kcal: number
  /** Je li udio rucno zadan ili izracunat. */
  manual: boolean
}

export function memberShares(household: Household, people: Person[]): MemberShare[] {
  return membersOf(household, people).map((person) => ({
    person,
    factor: portionFactor(person),
    kcal: computeTargets(person.profile).kcal,
    manual: typeof person.portionFactor === 'number' && person.portionFactor > 0,
  }))
}

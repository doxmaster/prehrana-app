import {
  ADULT_AGE,
  MIN_SUPPORTED_AGE,
  calciumRDA,
  ironRDA,
  magnesiumRDA,
  proteinPerKg,
  schofieldBMR,
  vitaminCRDA,
  vitaminDRDA,
  waterTarget,
} from './dri'
import type { Measurement, Person, Profile, Targets } from './types'

export function clampNum(v: unknown, min: number, max: number, def: number): number {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v)
  return Number.isFinite(n) && n >= min && n <= max ? n : def
}

export const PROFILE_LIMITS = {
  // Donja granica dobi je 7 — ispod toga preporuke nisu pouzdane bez pedijatra.
  age: { min: MIN_SUPPORTED_AGE, max: 100, def: 30 },
  weight: { min: 15, max: 250, def: 75 },
  height: { min: 100, max: 220, def: 178 },
  act: { min: 1, max: 2.5, def: 1.55 },
  goal: { min: -1000, max: 1000, def: 0 },
} as const

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sjedilački (bez vježbanja)' },
  { value: 1.375, label: 'Lagana (1–3×/tj)' },
  { value: 1.55, label: 'Umjerena (3–5×/tj)' },
  { value: 1.725, label: 'Aktivna (6–7×/tj)' },
  { value: 1.9, label: 'Vrlo aktivna' },
] as const

export const GOALS = [
  { value: -500, label: 'Mršavljenje (−500 kcal)' },
  { value: -250, label: 'Blago mršavljenje (−250 kcal)' },
  { value: 0, label: 'Održavanje' },
  { value: 300, label: 'Dobivanje mase (+300 kcal)' },
] as const

/**
 * Zadnje izmjereno stanje na zadani datum (ili prije njega). Kad mjerenja nema,
 * vraća težinu upisanu u profilu — tako stari profili rade nepromijenjeno.
 */
export function weightOn(person: Person, date: string): number {
  const relevant = (person.measurements ?? [])
    .filter((m): m is Measurement & { weight: number } => typeof m.weight === 'number')
    .filter((m) => m.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date))
  const last = relevant.at(-1)
  return last ? last.weight : person.profile.weight
}

/**
 * Dnevni ciljevi po Mifflin-St Jeor formuli.
 * Mikronutrijenti prate DRI preporuke po spolu i dobi.
 * `weightOverride` omogućuje računanje iz stvarno izmjerene težine za neki dan.
 */
export function computeTargets(profile: Profile, weightOverride?: number): Targets {
  const w = clampNum(
    weightOverride ?? profile.weight,
    PROFILE_LIMITS.weight.min,
    PROFILE_LIMITS.weight.max,
    PROFILE_LIMITS.weight.def,
  )
  const h = clampNum(
    profile.height,
    PROFILE_LIMITS.height.min,
    PROFILE_LIMITS.height.max,
    PROFILE_LIMITS.height.def,
  )
  const a = clampNum(profile.age, PROFILE_LIMITS.age.min, PROFILE_LIMITS.age.max, PROFILE_LIMITS.age.def)
  const act = clampNum(profile.act, PROFILE_LIMITS.act.min, PROFILE_LIMITS.act.max, PROFILE_LIMITS.act.def)
  const rawGoal = clampNum(
    profile.goal,
    PROFILE_LIMITS.goal.min,
    PROFILE_LIMITS.goal.max,
    PROFILE_LIMITS.goal.def,
  )
  const sex = profile.sex
  const isAdult = a >= ADULT_AGE

  /**
   * Djeci se energetski deficit ne primjenjuje. Mrsavljenje u dobi rasta nije
   * stvar racunanja kalorija nego pedijatra, a bez ovoga bi profil od 10 godina
   * s ciljem −1000 kcal dobio dnevni cilj od 430 kcal.
   */
  const goal = isAdult ? rawGoal : Math.max(0, rawGoal)

  /**
   * Mifflin-St Jeor vrijedi za odrasle i koristi visinu; za djecu i mlade do 18
   * nije validiran, pa se ondje uzima Schofield (FAO/WHO/UNU) koji se oslanja na
   * masu i dob. Odrasli tako dobivaju identicne brojke kao i prije.
   */
  const bmr = isAdult ? 10 * w + 6.25 * h - 5 * a + (sex === 'm' ? 5 : -161) : schofieldBMR(w, a, sex)

  const tdee = bmr * act
  const kcal = Math.round((tdee + goal) / 10) * 10

  const p = Math.round(proteinPerKg(a) * w)
  const f = Math.round((0.25 * kcal) / 9)
  const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4))
  const fib = Math.round((14 * kcal) / 1000)

  return {
    kcal,
    p,
    c,
    f,
    fib,
    fe: ironRDA(a, sex),
    ca: calciumRDA(a, sex),
    mg: magnesiumRDA(a, sex),
    vc: vitaminCRDA(a, sex),
    vd: vitaminDRDA(a),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    water: waterTarget(w, a),
  }
}

/** Je li profil djeteta ili mlade osobe — sucelje uz to prikazuje napomenu. */
export function isMinor(profile: Profile): boolean {
  return clampNum(profile.age, PROFILE_LIMITS.age.min, PROFILE_LIMITS.age.max, PROFILE_LIMITS.age.def) < ADULT_AGE
}

export { ADULT_AGE, MIN_SUPPORTED_AGE }

/** Ciljevi za osobu na određeni dan — uzima u obzir izmjerenu težinu tog dana. */
export function targetsFor(person: Person, date: string): Targets {
  return computeTargets(person.profile, weightOn(person, date))
}

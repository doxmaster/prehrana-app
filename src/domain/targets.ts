import type { Measurement, Person, Profile, Targets } from './types'

export function clampNum(v: unknown, min: number, max: number, def: number): number {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v)
  return Number.isFinite(n) && n >= min && n <= max ? n : def
}

export const PROFILE_LIMITS = {
  age: { min: 10, max: 100, def: 30 },
  weight: { min: 30, max: 250, def: 75 },
  height: { min: 120, max: 220, def: 178 },
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
  const goal = clampNum(profile.goal, PROFILE_LIMITS.goal.min, PROFILE_LIMITS.goal.max, PROFILE_LIMITS.goal.def)
  const female = profile.sex === 'z'

  const bmr = 10 * w + 6.25 * h - 5 * a + (female ? -161 : 5)
  const tdee = bmr * act
  const kcal = Math.round((tdee + goal) / 10) * 10

  const p = Math.round(1.6 * w)
  const f = Math.round((0.25 * kcal) / 9)
  const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4))
  const fib = Math.round((14 * kcal) / 1000)

  return {
    kcal,
    p,
    c,
    f,
    fib,
    fe: female && a < 51 ? 18 : 8,
    ca: (female && a >= 51) || (!female && a >= 71) ? 1200 : 1000,
    mg: female ? (a <= 30 ? 310 : 320) : a <= 30 ? 400 : 420,
    vc: female ? 75 : 90,
    vd: a >= 71 ? 20 : 15,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    water: Math.round((35 * w) / 100) / 10,
  }
}

/** Ciljevi za osobu na određeni dan — uzima u obzir izmjerenu težinu tog dana. */
export function targetsFor(person: Person, date: string): Targets {
  return computeTargets(person.profile, weightOn(person, date))
}

import { ADULT_AGE, PROFILE_LIMITS, clampNum, computeTargets } from './targets'
import { schofieldBMR } from './dri'
import type { Profile } from './types'

/**
 * Koliko sna model uzima kad ga nema zapisanog.
 *
 * Formule za dnevnu potrosnju (Mifflin-St Jeor × faktor aktivnosti) vec u sebi
 * pretpostavljaju uobicajenu noc, pa je referenca 8 h: uz toliko sna racun daje
 * tocno ono sto je davao i prije uvodenja sna.
 */
export const REFERENCE_SLEEP = 8

/** Razuman raspon zapisa; izvan njega je rijec o pogresci u unosu. */
export const SLEEP_LIMITS = { min: 3, max: 14 } as const

/**
 * Tijelo u snu trosi oko 5 % manje od bazalnog metabolizma.
 *
 * Bazalni metabolizam mjeri se budan i u mirovanju; tijekom sna potrosnja jos
 * malo padne. Razlika je mala, pa je i ucinak sna na dnevni racun mali — i to
 * treba biti vidljivo, a ne prikriveno velikim brojkama.
 */
const SLEEP_FACTOR = 0.95

/**
 * Sat manjka sna zamjenjuje se SJEDILACKIM budnim satom, ne prosjecno aktivnim.
 *
 * Tko legne u dva ujutro, ta dva sata u pravilu sjedi — ne trenira. Kad bi se
 * racunala prosjecna budna potrosnja, kratak san bi ispao kao da se njime trosi
 * stotinjak kalorija vise, sto bi bila poruka suprotna od istinite.
 */
const SEDENTARY_FACTOR = 1.2

export interface EnergyBreakdown {
  /** Bazalni metabolizam (24 h u potpunom mirovanju). */
  bmr: number
  /** Sati sna koji su usli u racun. */
  sleep: number
  /** Je li san zapisan ili je uzeta referenca. */
  sleepAssumed: boolean
  /** Potrosnja tijekom sna. */
  sleepKcal: number
  /** Potrosnja dok je budan, ali u mirovanju (disanje, probava, mozak). */
  awakeRestKcal: number
  /** Sve iznad mirovanja: kretanje, rad, vjezbanje, termicki ucinak hrane. */
  activityKcal: number
  /** Ukupna dnevna potrosnja. */
  total: number
  /** Potrosnja kakvu bi dao racun bez zapisanog sna — za usporedbu. */
  baseline: number
}

/**
 * Rastavlja dnevnu potrosnju na san, mirovanje i aktivnost.
 *
 * Polazi se od uobicajenog racuna (BMR × faktor aktivnosti) i taj se iznos
 * rastavlja na dijelove, umjesto da se gradi novi model. Zapisan san samo
 * pomice granicu izmedu sna i budnog dijela dana: manje sna znaci vise sati
 * budne potrosnje, pa potrosnja blago raste.
 *
 * Namjerno se NE tvrdi vise od toga. Glavni ucinak kratkog sna ide preko
 * apetita, inzulinske osjetljivosti i volje za kretanjem — a to nijedna
 * formula ne mjeri iz sati.
 */
export function energyBreakdown(profile: Profile, weight: number, sleepHours?: number): EnergyBreakdown {
  const w = clampNum(weight, PROFILE_LIMITS.weight.min, PROFILE_LIMITS.weight.max, PROFILE_LIMITS.weight.def)
  const h = clampNum(profile.height, PROFILE_LIMITS.height.min, PROFILE_LIMITS.height.max, PROFILE_LIMITS.height.def)
  const age = clampNum(profile.age, PROFILE_LIMITS.age.min, PROFILE_LIMITS.age.max, PROFILE_LIMITS.age.def)
  const act = clampNum(profile.act, PROFILE_LIMITS.act.min, PROFILE_LIMITS.act.max, PROFILE_LIMITS.act.def)

  const bmr =
    age >= ADULT_AGE
      ? 10 * w + 6.25 * h - 5 * age + (profile.sex === 'm' ? 5 : -161)
      : schofieldBMR(w, age, profile.sex)

  const baseline = bmr * act
  const perHour = bmr / 24

  const sleepAssumed = !Number.isFinite(sleepHours as number)
  const sleep = sleepAssumed
    ? REFERENCE_SLEEP
    : clampNum(sleepHours, SLEEP_LIMITS.min, SLEEP_LIMITS.max, REFERENCE_SLEEP)

  /**
   * Polaziste je uobicajeni racun, a odstupanje od referentnog sna samo pomice
   * sate izmedu sna i sjedenja. Uz 8 h razlika je nula, pa onima koji san nisu
   * upisali brojke ostaju iste kao prije.
   */
  const total = baseline + (REFERENCE_SLEEP - sleep) * perHour * (SEDENTARY_FACTOR - SLEEP_FACTOR)

  const sleepKcal = Math.round(sleep * perHour * SLEEP_FACTOR)
  const awakeRestKcal = Math.round((24 - sleep) * perHour)
  const rounded = Math.round(total)

  return {
    bmr: Math.round(bmr),
    sleep,
    sleepAssumed,
    sleepKcal,
    awakeRestKcal,
    // Ostatak, da se dijelovi uvijek zbroje u ukupno bez razlike od zaokruzivanja.
    activityKcal: Math.max(0, rounded - sleepKcal - awakeRestKcal),
    total: rounded,
    baseline: Math.round(baseline),
  }
}

/** Koliko kalorija odgovara jednom kilogramu tjelesne masti (7700 kcal/kg). */
export const KCAL_PER_KG = 7700

export interface EnergyBalance {
  intake: number
  expenditure: number
  /** Unos minus potrosnja: pozitivno je visak, negativno manjak. */
  balance: number
  /** Cilj iz profila (mrsavljenje, odrzavanje, dobivanje). */
  targetKcal: number
  /** Razlika unosa od cilja. */
  vsTarget: number
  /** Procijenjena promjena mase ako bi ovakav dan trajao tjedan dana. */
  weeklyKg: number
}

/**
 * Bilanca dana: koliko je uneseno naspram potroseno.
 *
 * Procjena promjene mase daje se TJEDNO, ne dnevno: dnevna razlika je unutar
 * pogreske i same procjene potrosnje i vaganja, pa bi brojka po danu sugerirala
 * preciznost koje nema.
 */
export function energyBalance(
  intake: number,
  breakdown: EnergyBreakdown,
  profile: Profile,
  weight: number,
): EnergyBalance {
  const targetKcal = computeTargets(profile, weight).kcal
  const balance = intake - breakdown.total
  return {
    intake: Math.round(intake),
    expenditure: breakdown.total,
    balance: Math.round(balance),
    targetKcal,
    vsTarget: Math.round(intake - targetKcal),
    weeklyKg: (balance * 7) / KCAL_PER_KG,
  }
}

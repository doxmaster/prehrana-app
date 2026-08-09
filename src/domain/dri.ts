/**
 * Preporucen dnevni unos (DRI, Institute of Medicine) po dobi i spolu.
 *
 * Odrasle vrijednosti namjerno su ostavljene onakvima kakve su bile prije uvodenja
 * djece, da se ciljevi postojecih korisnika ne bi promijenili.
 *
 * Djeca imaju bitno drukcije potrebe od odraslih — kalcij im je VISI (rast kostiju),
 * a zeljezo, magnezij i vitamin C nizi. Skaliranje odraslih vrijednosti po tjelesnoj
 * masi dalo bi krive brojke u oba smjera.
 */

export type Sex = 'm' | 'z'

/** Dob od koje se koriste jednadzbe i preporuke za odrasle. */
export const ADULT_AGE = 18

/** Najniza podrzana dob — ispod toga preporuke za djecu nisu pouzdane bez pedijatra. */
export const MIN_SUPPORTED_AGE = 7

/** Zeljezo (mg/dan). Djevojkama raste s pubertetom zbog gubitka menstruacijom. */
export function ironRDA(age: number, sex: Sex): number {
  if (age < 9) return 10
  if (age < 14) return 8
  if (age < 19) return sex === 'z' ? 15 : 11
  if (sex === 'z' && age < 51) return 18
  return 8
}

/** Kalcij (mg/dan). Najveca potreba je u dobi rasta kostiju, 9–18 godina. */
export function calciumRDA(age: number, sex: Sex): number {
  if (age < 9) return 1000
  if (age < 19) return 1300
  if (age < 51) return 1000
  if (sex === 'z') return 1200
  return age >= 71 ? 1200 : 1000
}

/** Magnezij (mg/dan). */
export function magnesiumRDA(age: number, sex: Sex): number {
  if (age < 9) return 130
  if (age < 14) return 240
  if (age < 19) return sex === 'z' ? 360 : 410
  if (age <= 30) return sex === 'z' ? 310 : 400
  return sex === 'z' ? 320 : 420
}

/** Vitamin C (mg/dan). */
export function vitaminCRDA(age: number, sex: Sex): number {
  if (age < 9) return 25
  if (age < 14) return 45
  if (age < 19) return sex === 'z' ? 65 : 75
  return sex === 'z' ? 75 : 90
}

/** Vitamin D (µg/dan). */
export function vitaminDRDA(age: number): number {
  return age >= 71 ? 20 : 15
}

/**
 * Bjelancevine u g po kg tjelesne mase.
 *
 * Odraslima 1,6 g/kg — vrijednost koju aplikacija koristi od pocetka, primjerena
 * aktivnoj odrasloj osobi. Djeci se namjerno NE daje ista vrijednost: DRI je
 * 0,95 g/kg (4–13) odnosno 0,85 g/kg (14–18), pa je ovdje uzet umjeren dodatak
 * iznad toga umjesto udvostrucenja.
 */
export function proteinPerKg(age: number): number {
  if (age < 14) return 1.1
  if (age < ADULT_AGE) return 1.2
  return 1.6
}

/**
 * Dnevna potreba za tekucinom u litrama.
 *
 * Odraslima 35 ml/kg, kao i dosad. Djeci se koristi Holliday-Segar: 100 ml/kg za
 * prvih 10 kg, 50 ml/kg za sljedecih 10, pa 20 ml/kg dalje. Za dijete od 25 kg
 * to daje 1,6 L, dok bi pravilo od 35 ml/kg dalo 0,9 L — premalo.
 */
export function waterTarget(weightKg: number, age: number): number {
  if (age >= ADULT_AGE) return Math.round((35 * weightKg) / 100) / 10

  const first = Math.min(weightKg, 10) * 100
  const second = Math.min(Math.max(weightKg - 10, 0), 10) * 50
  const rest = Math.max(weightKg - 20, 0) * 20
  return Math.round((first + second + rest) / 100) / 10
}

/**
 * Bazalni metabolizam po Schofieldu (FAO/WHO/UNU), jednadzbe na temelju mase.
 * Koriste se za djecu i mlade do 18 godina, gdje Mifflin-St Jeor nije validiran.
 */
export function schofieldBMR(weightKg: number, age: number, sex: Sex): number {
  const male = sex === 'm'
  if (age < 3) return male ? 59.512 * weightKg - 30.4 : 58.317 * weightKg - 31.1
  if (age < 10) return male ? 22.706 * weightKg + 504.3 : 20.315 * weightKg + 485.9
  if (age < ADULT_AGE) return male ? 17.686 * weightKg + 658.2 : 13.384 * weightKg + 692.6
  return male ? 15.057 * weightKg + 692.2 : 14.818 * weightKg + 486.6
}

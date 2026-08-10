/**
 * Zajednicki dio rada s USDA FoodData Central API-jem.
 *
 * Koriste ga usda-verify.mjs (provjera postojece baze) i usda-extra.mjs
 * (dohvat novih namirnica), pa pravila podudaranja i citanja nutrijenata
 * postoje na jednom mjestu.
 */

/**
 * USDA vraca nutrijente na dva nacina:
 *  - format=abridged: polje `number` s NDB brojem ("208" = energija)
 *  - format=full:     ugnijezdeno `nutrient.id` ("1008" = energija)
 * Podrzana su oba jer se tiho razlikuju, a kriva pretpostavka daje same nule.
 */
const BY_NUMBER = {
  208: 'kcal',
  203: 'p',
  205: 'c',
  204: 'f',
  291: 'fib',
  303: 'fe',
  301: 'ca',
  304: 'mg',
  401: 'vc',
  328: 'vd',
}

const BY_ID = {
  1008: 'kcal',
  1003: 'p',
  1005: 'c',
  1004: 'f',
  1079: 'fib',
  1089: 'fe',
  1087: 'ca',
  1090: 'mg',
  1162: 'vc',
  1114: 'vd',
}

/**
 * Foundation unosi cesto nemaju klasicnu energiju (208), nego samo racunatu po
 * Atwaterovim faktorima. Bez ovoga kruh i jogurt ispadnu 0 kcal.
 */
const ENERGY_FALLBACK_NUMBERS = [957, 958]
const ENERGY_FALLBACK_IDS = [2047, 2048]

export const NUTRIENT_KEYS = ['kcal', 'p', 'c', 'f', 'fib', 'fe', 'ca', 'mg', 'vc', 'vd']

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function usda(path, params, apiKey) {
  const url = new URL(`https://api.nal.usda.gov/fdc/v1/${path}`)
  url.searchParams.set('api_key', apiKey)
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v)

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res.json()
    if (res.status === 429) {
      await sleep(2000 * (attempt + 1))
      continue
    }
    throw new Error(`USDA ${res.status} za ${path}`)
  }
  throw new Error(`USDA ne odgovara nakon 3 pokusaja: ${path}`)
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Provjera na razini rijeci, ne podniza — inace "milk" pogada "milkfat",
 * pa se mlijeko poklopi sa svjezim sirom.
 */
export function hasTerm(description, term) {
  return new RegExp(`(?<![a-z0-9])${escapeRe(term)}(?![a-z])`, 'i').test(description)
}

/**
 * Opis mora sadrzavati sve rijeci iz `must`, ne smije sadrzavati nijednu iz
 * `avoid`, a Foundation podaci imaju prednost pred SR Legacy.
 */
export function pickBest(candidates, entry, avoidGlobal = []) {
  const must = (entry.must ?? []).map((s) => s.toLowerCase())
  const avoid = [...(entry.avoid ?? []), ...avoidGlobal].map((s) => s.toLowerCase())

  const scored = []
  for (const food of candidates) {
    const desc = (food.description ?? '').toLowerCase()
    if (avoid.some((w) => hasTerm(desc, w))) continue
    if (!must.every((w) => hasTerm(desc, w))) continue
    let score = 0
    if (food.dataType === 'Foundation') score += 10
    else if (food.dataType === 'SR Legacy') score += 8
    score -= desc.split(',').length // kraci, generickiji opisi su bolji
    scored.push({ food, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.food ?? null
}

/**
 * Vraca samo one tvari koje USDA stvarno navodi. Tvar koja nedostaje ostaje
 * nedefinirana — NE nula. Razlika je bitna: skusa nema izmjeren vitamin D u
 * SR Legacy zapisu, a tretiranje toga kao nule obrisalo bi ispravnu vrijednost.
 */
export function extractNutrients(detail) {
  const values = {}
  const energyCandidates = []

  for (const n of detail.foodNutrients ?? []) {
    const number = Number(n.number ?? n.nutrient?.number)
    const id = Number(n.nutrient?.id ?? n.nutrientId)
    const amount = Number(n.amount ?? n.value ?? n.nutrient?.amount)
    if (!Number.isFinite(amount)) continue

    if (ENERGY_FALLBACK_NUMBERS.includes(number) || ENERGY_FALLBACK_IDS.includes(id)) {
      energyCandidates.push(amount)
      continue
    }
    const key = BY_NUMBER[number] ?? BY_ID[id]
    if (key !== undefined) values[key] = amount
  }

  if (values.kcal === undefined && energyCandidates.length) values.kcal = energyCandidates[0]

  if (Object.keys(values).length === 0) {
    throw new Error('nijedan poznati nutrijent u odgovoru — provjeri format API-ja')
  }
  return values
}

/** Ista tolerancija kao ATWATER_TOLERANCE u src/domain/nutrients.ts. */
export const ATWATER_TOLERANCE = 0.15

export function isAlcoholic(name, cat) {
  return (
    cat === 'Pića' &&
    /pivo|vino|rakij|liker|viski|votk|\bgin\b|žesti|šampanj|prošek|konjak|brandy|rum|tekil/i.test(name)
  )
}

export function atwaterDeviation(v) {
  const net = Math.max(0, (v.c ?? 0) - (v.fib ?? 0))
  const computed = 4 * (v.p ?? 0) + 4 * net + 2 * (v.fib ?? 0) + 9 * (v.f ?? 0)
  const base = Math.max(v.kcal ?? 0, computed)
  if (base < 20) return 0
  return Math.abs((v.kcal ?? 0) - computed) / base
}

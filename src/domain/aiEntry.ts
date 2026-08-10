import { CATEGORIES, NUTRIENT_KEYS } from './types'
import { atwaterDeviation, isAlcoholic, type FoodLookup } from './nutrients'
import { MEALS } from './constants'
import type { AdHocItem, Category, MealItem, Nutrients } from './types'

/**
 * Upit koji korisnik zalijepi u Claude (ili bilo koji jezicni model) i vrati
 * odgovor natrag u aplikaciju.
 *
 * Zasto ovako, a ne poziv API-ja iz aplikacije: kljuc bi morao stajati u
 * pregledniku, gdje ga svatko moze procitati, a i trosio bi se. Ovako nema
 * kljuca, nema troska i radi bilo gdje — cijena je jedno kopiraj/zalijepi.
 */
export function buildEntryPrompt(text: string, knownFoods: string[]): string {
  const lines = [
    'Ti si nutricionisticki asistent. Korisnik na hrvatskom opisuje sto je pojeo ili popio.',
    '',
    'Vrati ISKLJUCIVO JSON, bez teksta okolo i bez markdown ograda, ovog oblika:',
    '{"items":[{"meal":"Doručak|Ručak|Večera|Međuobrok","name":"kratak naziv",',
    '"grams":broj,"drink":true_ili_false,"match":"","cat":"kategorija",',
    '"per100":{"kcal":0,"p":0,"c":0,"f":0,"fib":0,"fe":0,"ca":0,"mg":0,"vc":0,"vd":0}}]}',
    '',
    'Pravila:',
    `- grams = UKUPNA pojedena kolicina u gramima (za pica u ml). Ako korisnik navede broj komada, pomnozi masom jednog komada: "dvije kriske pizze" -> 250.`,
    '- per100 su vrijednosti na 100 g (za pica na 100 ml): kcal, p (bjelancevine g), c (ugljikohidrati g), f (masti g), fib (vlakna g), fe (zeljezo mg), ca (kalcij mg), mg (magnezij mg), vc (vitamin C mg), vd (vitamin D µg).',
    `- cat je tocno jedna od: ${CATEGORIES.join(', ')}.`,
    '- match: ako namirnica odgovara nekoj s popisa nize, upisi njezin TOCAN naziv; inace prazan string. per100 ispuni u svakom slucaju.',
    '- Svaku namirnicu navedi kao zasebnu stavku. Ako obrok nije naveden, procijeni najlogicniji.',
    '- Koristi realne prosjecne vrijednosti za hrvatske namirnice i jela.',
    '- VAZNO: kalorije moraju odgovarati makronutrijentima (4 kcal/g bjelancevine i ugljikohidrati, 9 kcal/g masti). Provjeri prije nego odgovoris.',
    '',
    `POPIS POZNATIH NAMIRNICA (za match): ${knownFoods.join('; ')}`,
    '',
    `SAMO JSON. Korisnik je pojeo: ${text}`,
  ]
  return lines.join('\n')
}

export class AiParseError extends Error {}

export interface ParsedEntry {
  items: MealItem[]
  /** Indeks obroka za svaku stavku. */
  mealIndex: number[]
  /** Stavke koje su prepoznate u bazi. */
  matched: number
  /** Upozorenja koja ne sprjecavaju unos. */
  warnings: string[]
}

const asNumber = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/**
 * Cita odgovor jezicnog modela. Model zna dodati objasnjenje ili markdown ogradu
 * oko JSON-a, pa se izvlaci najveci objekt izmedu prve `{` i zadnje `}`.
 */
export function parseAiResponse(raw: string, foods: FoodLookup): ParsedEntry {
  const text = String(raw ?? '').trim()
  if (!text) throw new AiParseError('Odgovor je prazan.')

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) {
    throw new AiParseError('U odgovoru nema JSON-a. Zalijepi cijeli odgovor modela.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text.slice(start, end + 1))
  } catch {
    throw new AiParseError('JSON u odgovoru nije ispravan — provjeri jesi li zalijepio cijeli tekst.')
  }

  const rawItems = (parsed as { items?: unknown })?.items
  if (!Array.isArray(rawItems) || !rawItems.length) {
    throw new AiParseError('Odgovor ne sadrži nijednu stavku.')
  }

  const items: MealItem[] = []
  const mealIndex: number[] = []
  const warnings: string[] = []
  let matched = 0

  for (const raw of rawItems) {
    const entry = raw as Record<string, unknown>
    const name = String(entry.name ?? '').trim()
    const grams = asNumber(entry.grams)
    if (!name || grams <= 0) continue

    const mealName = String(entry.meal ?? '')
    const index = MEALS.indexOf(mealName as (typeof MEALS)[number])
    mealIndex.push(index >= 0 ? index : 3)

    // Ako model prepozna namirnicu iz baze, koristi se provjerena vrijednost
    // umjesto njegove procjene.
    const byMatch = typeof entry.match === 'string' && entry.match.trim()
      ? foods.byName(entry.match)
      : undefined
    const known = byMatch ?? foods.byName(name)
    if (known) {
      items.push({ foodId: known.id, g: grams })
      matched++
      continue
    }

    const per100 = (entry.per100 ?? {}) as Record<string, unknown>
    const values = {} as Nutrients
    for (const key of NUTRIENT_KEYS) values[key] = asNumber(per100[key])

    const cat = CATEGORIES.includes(entry.cat as Category)
      ? (entry.cat as Category)
      : entry.drink
        ? 'Pića'
        : 'Ostalo'

    if (values.kcal === 0 && values.p === 0 && values.c === 0 && values.f === 0) {
      warnings.push(`${name}: model nije dao nikakve vrijednosti`)
    } else if (!isAlcoholic(name, cat)) {
      const dev = atwaterDeviation(values)
      if (dev !== null && dev > 0.25) {
        warnings.push(
          `${name}: kalorije ne odgovaraju makronutrijentima (${Math.round(dev * 100)} %) — provjeri prije spremanja`,
        )
      }
    }

    const item: AdHocItem = { name, g: grams, n: values, cat }
    if (entry.drink) item.drink = true
    items.push(item)
  }

  if (!items.length) throw new AiParseError('Nijedna stavka nema naziv i količinu.')

  return { items, mealIndex, matched, warnings }
}

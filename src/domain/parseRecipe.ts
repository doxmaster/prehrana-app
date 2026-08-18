import type { Food, FoodRefItem } from './types'

/**
 * Pretvara zalijepljeni popis sastojaka u jelo.
 *
 * Postoji zato da korisnik moze dodati JELO IZ BILO KOJEG IZVORA — s videa, s
 * kuharskog portala, iz biljeznice — bez prepisivanja svakog sastojka kroz
 * obrazac. Ugradeni katalog ostaje ono sto aplikacija sama nosi; ovo je ono sto
 * korisnik dodaje u svoje podatke.
 *
 * Namjerno ne pogada: sto se ne prepozna, vraca se kao `unknown` i korisnik to
 * vidi prije spremanja. Tiho preskakanje sastojka dalo bi jelo koje izgleda
 * ispravno, a ima krive vrijednosti.
 */

/** Mjere koje se pojavljuju u receptima, svedene na grame ili mililitre. */
const UNITS: { match: RegExp; grams: number; perPiece?: boolean }[] = [
  { match: /^(kg|kilogram\w*)$/, grams: 1000 },
  { match: /^(dag|deka|dkg|dekagram\w*)$/, grams: 10 },
  { match: /^(g|gr|gram\w*)$/, grams: 1 },
  { match: /^(l|lit\w*)$/, grams: 1000 },
  { match: /^(dl|decilit\w*)$/, grams: 100 },
  { match: /^(ml|mililit\w*)$/, grams: 1 },
  // Kuhinjske mjere: priblizne, ali bolje od izostavljenog sastojka.
  { match: /^(zlic[ae]|zlica|zlice|tbsp)$/, grams: 15 },
  { match: /^(zlicic[ae]|zlicica|tsp)$/, grams: 5 },
  { match: /^(salic[ae]|salica|solja|solje|cup)$/, grams: 250 },
  { match: /^(prstohvat\w*)$/, grams: 1 },
  { match: /^(kom|komad\w*|kos|kosad|glavic\w*|struk\w*|reznj\w*|cesnj\w*)$/, grams: 0, perPiece: true },
]

/** Slovima pisane kolicine koje se cesto pojavljuju umjesto brojke. */
const WORD_NUMBERS: Record<string, number> = {
  pola: 0.5,
  pol: 0.5,
  jedan: 1,
  jedna: 1,
  jedno: 1,
  dva: 2,
  dvije: 2,
  tri: 3,
  cetiri: 4,
  pet: 5,
  sest: 6,
  sedam: 7,
  osam: 8,
  devet: 9,
  deset: 10,
}

/** Bez dijakritika i u malim slovima — usporedba ne smije ovisiti o kvacicama. */
export function plain(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'd')
}

/**
 * Grubo skidanje hrvatskih nastavaka.
 *
 * "mljevenog mesa" i "mljeveno meso" moraju dati isti korijen, inace se
 * sastojak iz recepta nikad ne poklopi s nazivom u bazi. Skida se najvise
 * jedan nastavak i nikad ispod tri slova, da "sir" ne postane "si".
 */
export function stem(word: string): string {
  const w = plain(word)
  const endings = ['ovima', 'evima', 'ama', 'ima', 'oga', 'og', 'om', 'em', 'im', 'ih', 'ju', 'a', 'e', 'i', 'o', 'u']
  for (const end of endings) {
    if (w.length - end.length >= 3 && w.endsWith(end)) return w.slice(0, -end.length)
  }
  return w
}

/**
 * Rijeci koje se pojavljuju u gotovo svakom nazivu, pa ne razlikuju nista.
 * Bez ovoga je "1 vezica vlasca ZA ukras" pogadalo "Vrhnje ZA slag".
 */
const STOP = new Set(['za', 'od', 'sa', 'sm', 'ili', 'kom', 'pola', 'jedan', 'jedna'])

const tokens = (text: string): string[] =>
  plain(text)
    .replace(/[(),.;:/]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOP.has(t))
    .map(stem)
    .filter((t) => t.length >= 3)

export interface ParsedItem extends FoodRefItem {
  /** Redak iz kojeg je nastalo — sucelje ga pokazuje uz stavku. */
  source: string
  /** Naziv namirnice na koju je pogodeno. */
  foodName: string
  /** Kolicina nije bila navedena, uzeta je uobicajena porcija. */
  assumedAmount: boolean
}

export interface ParsedRecipe {
  name: string
  servings: number
  items: ParsedItem[]
  /** Redci koje nije bilo moguce razrijesiti. */
  unknown: string[]
}

/** Koliko se tokena naziva mora poklopiti da se namirnica smatra pogodenom. */
const MIN_SCORE = 1

/**
 * Bira namirnicu koja najbolje odgovara opisu sastojka.
 *
 * Boduje se koliko se korijena iz NAZIVA namirnice pojavljuje u retku, kao
 * udio naziva — "Kruh integralni" na "integralnog kruha" ima puni pogodak, a
 * "Kruh bijeli" samo pola.
 *
 * Kod izjednacenja pobjeduje PRVA po redu u bazi: za samo "rize" i bijela i
 * smeda imaju isti udio, a ugradena baza pocinje uobicajenijom bijelom.
 */
export function matchFood(line: string, foods: readonly Food[]): Food | undefined {
  const lineTokens = new Set(tokens(line))
  let best: { food: Food; score: number } | undefined

  for (const food of foods) {
    const nameTokens = tokens(food.name)
    if (!nameTokens.length) continue
    const hits = nameTokens.filter((t) => lineTokens.has(t)).length
    if (hits < MIN_SCORE) continue

    // Udio pogodenih tokena naziva; puni pogodak nosi vise od djelomicnog.
    const score = hits / nameTokens.length + hits * 0.01
    if (!best || score > best.score) best = { food, score }
  }
  return best?.food
}

/** Kolicina i mjera iz pocetka retka; null kad ih nema. */
function parseAmount(line: string): { grams: number; perPiece: boolean; count: number } | null {
  const cleaned = plain(line).replace(/,(\d)/g, '.$1')
  const m = cleaned.match(/^\s*(\d+(?:\.\d+)?|[a-z]+)\s*([a-z]+)?/)
  if (!m) return null

  const raw = m[1]!
  const count = /^\d/.test(raw) ? parseFloat(raw) : (WORD_NUMBERS[raw] ?? NaN)
  if (!Number.isFinite(count)) return null

  const unitWord = m[2] ?? ''
  const unit = UNITS.find((u) => u.match.test(unitWord))
  if (!unit) {
    // Broj bez mjere ("2 jaja") znaci komade.
    return { grams: 0, perPiece: true, count }
  }
  return { grams: count * unit.grams, perPiece: unit.perPiece === true, count }
}

/**
 * Razlaze zalijepljeni tekst na jelo.
 *
 * Prvi redak koji nije sastojak uzima se kao naziv jela; ako ga nema, korisnik
 * ga upisuje sam. Broj porcija se cita iz retka poput "za 4 osobe".
 *
 * Predaju se SAMO namirnice, nikad i jela iz kataloga — inace bi naslov
 * "Punjene paprike moje bake" pogodio postojece jelo "Punjena paprika" i jelo
 * bi sadrzavalo samo sebe, a "150 g rize" bi zavrsilo na "Leca s rizom".
 * Isto pravilo vec vrijedi u ostatku aplikacije: recept ne sadrzi drugi recept.
 */
export function parseRecipe(text: string, ingredients: readonly Food[]): ParsedRecipe {
  const lines = text
    .split(/\r?\n|;/)
    // Skidaju se samo oznake nabrajanja. Ranija, sira inacica gutala je i
    // kolicinu: "500 g krumpira" ostajalo je "g krumpira".
    .map((l) => l.replace(/^\s*(?:[-–—*•]+\s*|\d{1,2}[.)]\s+)/, '').trim())
    .filter(Boolean)

  let name = ''
  let servings = 4
  const items: ParsedItem[] = []
  const unknown: string[] = []

  for (const line of lines) {
    const servingsMatch = plain(line).match(/za\s+(\d+)\s+(osob|porcij)/)
    if (servingsMatch) {
      servings = Math.max(1, Math.min(20, Number(servingsMatch[1])))
      continue
    }

    const food = matchFood(line, ingredients)
    const amount = parseAmount(line)

    if (!food) {
      // Redak bez ijedne poznate namirnice na pocetku je vjerojatno naslov.
      if (!name && !items.length && line.length <= 60) name = line
      else unknown.push(line)
      continue
    }

    /*
     * Naslov cesto SADRZI namirnicu ("Punjene paprike moje bake"), pa sam
     * pogodak nije dovoljan da redak bude sastojak. Prvi redak bez kolicine
     * postaje naslov kad namirnica pokriva tek mali dio retka; "krumpir" sam
     * za sebe pokriva sve, pa ostaje sastojak.
     */
    if (!amount && !name && !items.length) {
      const lineTokens = tokens(line)
      const foodTokens = new Set(tokens(food.name))
      const covered = lineTokens.filter((t) => foodTokens.has(t)).length
      if (lineTokens.length && covered / lineTokens.length < 0.6) {
        name = line
        continue
      }
    }
    const grams = amount
      ? amount.perPiece
        ? Math.round(amount.count * food.serv)
        : Math.round(amount.grams)
      : food.serv

    items.push({
      foodId: food.id,
      g: Math.max(1, grams),
      source: line,
      foodName: food.name,
      assumedAmount: !amount,
    })
  }

  return { name, servings, items, unknown }
}

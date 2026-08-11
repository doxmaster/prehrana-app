import { WEEK_LENGTH } from './weeks'
import type { Menu, WeekPlan } from './types'

/** Koliko unatrag tjedan ne smije ponoviti jelovnik iz prethodnih tjedana. */
export const NO_REPEAT_WEEKS = 2

/** Najvise jednom tjedno smije se pojaviti jelo izvan domace i regionalne kuhinje. */
export const MAX_FOREIGN_PER_WEEK = 1

export interface GenerateOptions {
  /** Ranije slozeni tjedni, od najnovijeg prema starijem. */
  recentWeeks?: WeekPlan[]
  /** Izvor slucajnosti; predaje se radi ponovljivosti u testovima. */
  random?: () => number
  /**
   * Jelovnici koje treba ostaviti za kraj — npr. oni koji se kose sa
   * zdravstvenim stanjem ukucana. Ne izbacuju se: bolje ponuditi sporan dan
   * nego ostaviti prazno, a upozorenje se ionako vidi uz taj dan.
   */
  discouraged?: (menu: Menu) => boolean
}

export interface GenerateResult {
  days: (string | null)[]
  /** Dani koje nije bilo cime popuniti. */
  unfilled: number
  /** Zasto popuna nije potpuna, ako nije. */
  note?: string
}

/**
 * Ograniceni su SAMO jelovnici izricito oznaceni kao 'ostalo'.
 *
 * Jelovnik bez oznake nije stran — takvi su svi koje korisnik sam napravi, kao i
 * oni nastali prije nego sto su oznake uvedene. Kad bi se brojali kao strani,
 * granica od jednog stranog jela tjedno ostavila bi sest dana praznih.
 */
const isForeign = (menu: Menu) => menu.cuisine === 'ostalo'

/** Jelovnici koje treba izbjeci jer su vec bili u zadnjih NO_REPEAT_WEEKS tjedana. */
export function recentlyUsed(weeks: WeekPlan[], lookback = NO_REPEAT_WEEKS): Set<string> {
  const used = new Set<string>()
  for (const week of weeks.slice(0, lookback)) {
    for (const id of week.days) if (id) used.add(id)
  }
  return used
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/**
 * Slaze tjedan iz knjiznice jelovnika.
 *
 * Pravila, redom vaznosti:
 *  1. unutar tjedna nema ponavljanja
 *  2. ne ponavlja jelovnike iz zadnja dva tjedna
 *  3. domaca i regionalna kuhinja; najvise jedan strani izuzetak tjedno
 *
 * Kad domacih jelovnika nema dovoljno, pravilo o ponavljanju popusta prije
 * pravila o kuhinji — bolje je ponoviti domace jelo nego tjedan puniti stranim.
 * Dan koji se ne moze popuniti ostaje slobodan, uz obrazlozenje.
 */
export function generateWeek(menus: Menu[], options: GenerateOptions = {}): GenerateResult {
  const { recentWeeks = [], random = Math.random, discouraged } = options

  const usable = menus.filter((m) => m.meals.some((meal) => meal.length > 0))
  if (!usable.length) {
    return {
      days: Array.from({ length: WEEK_LENGTH }, () => null),
      unfilled: WEEK_LENGTH,
      note: 'Nema nijednog jelovnika s namirnicama.',
    }
  }

  const avoid = recentlyUsed(recentWeeks)
  /** Sporni jelovnici idu na kraj svakog spremnika, a ne van njega. */
  const order = (list: Menu[]) => {
    const mixed = shuffle(list, random)
    if (!discouraged) return mixed
    return [...mixed.filter((m) => !discouraged(m)), ...mixed.filter(discouraged)]
  }
  const domestic = order(usable.filter((m) => !isForeign(m)))
  const foreign = order(usable.filter(isForeign))

  const days: (string | null)[] = []
  const usedThisWeek = new Set<string>()
  let foreignUsed = 0
  let relaxedRepeat = false

  const take = (pool: Menu[], allowRepeatAcrossWeeks: boolean): Menu | undefined =>
    pool.find(
      (m) => !usedThisWeek.has(m.id) && (allowRepeatAcrossWeeks || !avoid.has(m.id)),
    )

  for (let day = 0; day < WEEK_LENGTH; day++) {
    // Prvi izbor: domace jelo koje nije bilo u zadnja dva tjedna.
    let pick = take(domestic, false)

    // Zatim strano jelo, ali najvise jedno tjedno.
    if (!pick && foreignUsed < MAX_FOREIGN_PER_WEEK) {
      pick = take(foreign, false)
      if (pick) foreignUsed++
    }

    // Tek ako ni to ne prolazi, popusta pravilo o ponavljanju kroz tjedne.
    if (!pick) {
      pick = take(domestic, true)
      if (pick) relaxedRepeat = true
    }
    if (!pick && foreignUsed < MAX_FOREIGN_PER_WEEK) {
      pick = take(foreign, true)
      if (pick) {
        foreignUsed++
        relaxedRepeat = true
      }
    }

    if (pick) {
      usedThisWeek.add(pick.id)
      days.push(pick.id)
    } else {
      days.push(null)
    }
  }

  const unfilled = days.filter((d) => d === null).length
  const notes: string[] = []
  if (relaxedRepeat) {
    notes.push(
      `Nema dovoljno jelovnika da se izbjegnu svi iz zadnja ${NO_REPEAT_WEEKS} tjedna, pa su neki ponovljeni.`,
    )
  }
  if (unfilled) {
    notes.push(
      `${unfilled} ${unfilled === 1 ? 'dan je ostao slobodan' : 'dana su ostala slobodna'} — dodaj još jelovnika u knjižnicu.`,
    )
  }

  const result: GenerateResult = { days, unfilled }
  if (notes.length) result.note = notes.join(' ')
  return result
}

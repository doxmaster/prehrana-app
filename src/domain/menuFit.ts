import { capBreaches, conditionPlan, personConditions, rateFood } from './conditions'
import { mealsTotals } from './nutrients'
import { portionFactor } from './household'
import { portionedMeals } from './plan'
import { targetsFor, weightOn } from './targets'
import type { FoodLookup } from './nutrients'
import type { Household, Menu, Person } from './types'

/** Koliko koji prekrsaj vrijedi. Redoslijed je ono sto ove brojke zapravo kazuju. */
const PENALTY = {
  /** Dan prelazi granicu koju je postavila bolest — najteze. */
  breach: 100,
  /** Namirnica koju stanje izricito ne trpi (gluten, laktoza, alkohol). */
  avoid: 60,
  /** Namirnica koju stanje trpi uz oprez. */
  careful: 12,
  /** Po svakih 100 kcal iznad dnevnog cilja osobe. */
  over100kcal: 8,
} as const

/** Nagrade za ono sto se aktivno zeli. */
const BONUS = {
  /** Po gramu vlakana iznad cilja — bitno i kod dijabetesa i kod mrsavljenja. */
  fiberPerGram: 1.2,
  /** Dan koji pogada cilj kalorija unutar 10 %. */
  onTarget: 25,
} as const

export interface MenuFit {
  menuId: string
  /** Vise je bolje. */
  score: number
  /** Jelovnik krsi necije tvrdo ogranicenje. */
  blocked: boolean
  /** Kratko objasnjenje za sucelje — sto je presudilo. */
  why: string[]
}

interface Member {
  person: Person
  factor: number
  targetKcal: number
  caps: ReturnType<typeof conditionPlan>['caps']
  conditions: ReturnType<typeof personConditions>
  fiberTarget: number
}

function membersOf(household: Household | undefined, people: Person[], date: string): Member[] {
  const chosen = household
    ? people.filter((p) => household.memberIds.includes(p.id))
    : people
  return chosen.map((person) => {
    const targets = targetsFor(person, date)
    const plan = conditionPlan(targets, person, weightOn(person, date))
    return {
      person,
      factor: portionFactor(person),
      targetKcal: plan.targets.kcal,
      caps: plan.caps,
      conditions: personConditions(person),
      fiberTarget: plan.targets.fib,
    }
  })
}

/**
 * Ocjenjuje koliko jelovnik odgovara UKUCANIMA.
 *
 * Gleda troje, tim redom: krsi li dan necije ogranicenje iz bolesti, sadrzi li
 * namirnice koje stanje ne trpi, i koliko pogada dnevni cilj svakog clana.
 * Cilj vec u sebi nosi zelju osobe — tko mrsavi ima nizi cilj, pa mu obilan dan
 * sam po sebi pada nize bez ikakvog posebnog pravila.
 *
 * Sve se racuna na PORCIJU te osobe, jer isti jelovnik za dijete i za odraslog
 * nije isti tanjur.
 */
export function fitMenu(
  menu: Menu,
  members: readonly Member[],
  foods: FoodLookup,
): MenuFit {
  let score = 0
  let blocked = false
  const why: string[] = []

  for (const member of members) {
    const scaled = portionedMeals(menu.meals, member.factor)
    const totals = mealsTotals(scaled, foods)

    for (const breach of capBreaches(totals, member.caps)) {
      blocked = true
      score -= PENALTY.breach
      why.push(`${member.person.name}: prelazi granicu (${breach.cap.conditionName})`)
    }

    if (member.conditions.length) {
      // Sastojci se gledaju jednom po jelovniku, ne po svakom clanu posebno —
      // ista namirnica ne smije biti kaznjena cetiri puta u obitelji od cetvero.
      const seen = new Set<string>()
      for (const meal of menu.meals) {
        for (const item of meal) {
          if (!('foodId' in item) || seen.has(item.foodId)) continue
          seen.add(item.foodId)
          const food = foods.byId(item.foodId)
          if (!food) continue
          const flag = rateFood(food, member.conditions)[0]
          if (!flag) continue
          if (flag.level === 'izbjegavaj') {
            score -= PENALTY.avoid
            why.push(`${member.person.name}: ${food.name} — ${flag.conditionName}`)
          } else {
            score -= PENALTY.careful
          }
        }
      }
    }

    const over = totals.kcal - member.targetKcal
    if (over > 0) score -= (over / 100) * PENALTY.over100kcal
    if (Math.abs(over) <= member.targetKcal * 0.1) score += BONUS.onTarget

    const extraFiber = totals.fib - member.fiberTarget
    if (extraFiber > 0) score += Math.min(10, extraFiber) * BONUS.fiberPerGram
  }

  // Prosjek po clanu, da obitelj od cetvero ne dobiva cetiri puta vece brojke.
  const perMember = members.length ? score / members.length : 0
  return { menuId: menu.id, score: perMember, blocked, why: [...new Set(why)].slice(0, 4) }
}

export interface FitIndex {
  byId: Map<string, MenuFit>
  /** Ima li uopce koga s ogranicenjem ili ciljem — inace nema sto ni rangirati. */
  active: boolean
}

/** Ocjena svih jelovnika za jedno kucanstvo na zadani dan. */
export function rankMenus(
  menus: readonly Menu[],
  household: Household | undefined,
  people: Person[],
  foods: FoodLookup,
  date: string,
): FitIndex {
  const members = membersOf(household, people, date)
  const byId = new Map<string, MenuFit>()
  for (const menu of menus) byId.set(menu.id, fitMenu(menu, members, foods))
  return { byId, active: members.length > 0 }
}

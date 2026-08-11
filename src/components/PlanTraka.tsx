import { MEALS } from '../domain/constants'
import { confirmDay, confirmMeal, dayStatus, mealMatches, planForDate, portionedMeals } from '../domain/plan'
import { mealsTotals, sumItems } from '../domain/nutrients'
import { portionFactor } from '../domain/household'
import { fmtDate } from '../domain/dates'
import { toast } from '../store/dialogs'
import { useActivePerson, useAppStore, useFoods } from '../store/useAppStore'
import { fmt } from '../lib/format'
import type { DayMeals } from '../domain/types'

interface Props {
  date: string
  meals: DayMeals
  onChange: (mutate: (meals: DayMeals) => void) => void
}

/**
 * Veza izmedu plana i dnevnika: dan koji je tjedan predvidio upisuje se klikom
 * umjesto prepisivanjem.
 *
 * Kolicine se prije upisa mnoze udjelom osobe — jelovnik je pisan za jednu
 * referentnu odraslu osobu, pa dijete ne biljezi isti tanjur. Upisuje se
 * snimka stavaka, ne veza na jelovnik, da kasnija izmjena recepta ne prepise
 * ono sto je vec pojedeno.
 */
export function PlanTraka({ date, meals, onChange }: Props) {
  const person = useActivePerson()
  const foods = useFoods()
  const menus = useAppStore((s) => s.data.menus)
  const weeks = useAppStore((s) => s.data.weeks)

  const planned = planForDate(weeks, menus, date)
  if (!planned) return null

  const factor = portionFactor(person)
  const plan = planned.menu ? portionedMeals(planned.menu.meals, factor) : undefined
  const status = dayStatus(meals, plan)

  if (!planned.menu || !plan) {
    return (
      <div className="card">
        <h2>Plan za {fmtDate(date)}</h2>
        <p className="muted small" style={{ margin: 0 }}>
          {planned.week.title ?? 'Tjedan'} ovaj dan ostavlja slobodnim — upiši što si jeo ispod.
        </p>
      </div>
    )
  }

  const total = mealsTotals(plan, foods)
  const title = planned.menu.title?.trim() || 'Jelovnik'

  return (
    <div className="card">
      <div className="flexsplit">
        <h2 style={{ margin: 0 }}>
          Plan za {fmtDate(date)}: {title}
        </h2>
        <StatusOznaka status={status} />
      </div>
      <p className="muted small" style={{ margin: '4px 0 10px' }}>
        {planned.week.title ?? 'Tjedan'} · {fmt(total.kcal)} kcal
        {factor !== 1 && <> · količine za {person.name} (udio {fmt(factor, 2)})</>}
      </p>

      {status !== 'potvrdeno' && (
        <div className="row" style={{ marginBottom: 10 }}>
          <button
            className="btn small"
            onClick={() => {
              onChange((draft) => {
                const next = confirmDay(plan)
                draft.length = 0
                draft.push(...next)
              })
              toast(`Upisano: ${title} (${fmt(total.kcal)} kcal). Ispod možeš popraviti što nije bilo tako.`)
            }}
          >
            ✓ Pojeo sam po planu
          </button>
          {status === 'izmijenjeno' && (
            <span className="small muted">Dnevnik se razlikuje od plana — potvrda ga prepisuje.</span>
          )}
        </div>
      )}

      {MEALS.map((name, index) => {
        const items = plan[index] ?? []
        if (!items.length) return null
        const done = mealMatches(meals[index], items)
        return (
          <div className="item" key={name} style={{ paddingLeft: 0 }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <b>{name}</b>{' '}
              <span className="kcal-c small">{fmt(sumItems(items, foods).kcal)} kcal</span>
              <br />
              <span className="muted small">
                {items
                  .map((item) => `${'foodId' in item ? foods.byId(item.foodId)?.name ?? '?' : item.name} ${fmt(item.g)} g`)
                  .join(', ')}
              </span>
            </span>
            <button
              className={done ? 'btn secondary small' : 'btn small'}
              disabled={done}
              onClick={() => {
                onChange((draft) => {
                  const next = confirmMeal(draft, index, items)
                  draft.length = 0
                  draft.push(...next)
                })
                toast(`Upisan ${name.toLowerCase()}.`)
              }}
            >
              {done ? '✓ upisano' : '✓ upiši'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function StatusOznaka({ status }: { status: ReturnType<typeof dayStatus> }) {
  if (status === 'potvrdeno') {
    return (
      <span className="tag" style={{ color: 'var(--good)' }}>
        ✓ potvrđeno
      </span>
    )
  }
  if (status === 'izmijenjeno') {
    return (
      <span className="tag" style={{ color: 'var(--warn)' }}>
        ✎ izmijenjeno
      </span>
    )
  }
  return <span className="tag muted">nije upisano</span>
}

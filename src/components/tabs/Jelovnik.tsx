import { MEALS } from '../../domain/constants'
import { emptyMeals, foodUnit, isEmptyMeals, itemName, mealsFluid, mealsTotals, sumItems } from '../../domain/nutrients'
import { conditionPlan } from '../../domain/conditions'
import { targetsFor, weightOn } from '../../domain/targets'
import { uid } from '../../domain/id'
import { confirmDialog, promptDialog, toast } from '../../store/dialogs'
import { useActivePerson, useAppStore, useFoods, useUpdate } from '../../store/useAppStore'
import { MealEditor } from '../MealEditor'
import { NutrientBars } from '../NutrientBars'
import { useConditionCheck } from '../../hooks/useConditionCheck'
import { fmt } from '../../lib/format'
import { todayISO } from '../../domain/dates'
import type { DayMeals, Menu } from '../../domain/types'

export function Jelovnik() {
  const foods = useFoods()
  const check = useConditionCheck()
  const update = useUpdate()
  const person = useActivePerson()
  const menus = useAppStore((s) => s.data.menus)
  const index = useAppStore((s) => s.activeMenuIndex)
  const setIndex = useAppStore((s) => s.setActiveMenuIndex)

  const safeIndex = Math.min(index, menus.length - 1)
  const menu = menus[safeIndex]

  const title = (m: Menu, i: number) => (m.title?.trim() ? m.title : `Jelovnik ${i + 1}`)

  const description = (m: Menu) => {
    if (m.desc?.trim()) return m.desc
    const names: string[] = []
    for (const meal of m.meals)
      for (const item of meal) {
        const n = itemName(item, foods)
        if (!names.includes(n)) names.push(n)
      }
    if (!names.length) return 'prazan jelovnik'
    return names.slice(0, 5).join(', ') + (names.length > 5 ? '…' : '')
  }

  const meals: DayMeals = menu?.meals ?? emptyMeals()
  const totals = mealsTotals(meals, foods)
  const targets = targetsFor(person, todayISO())
  const plan = conditionPlan(targets, person, weightOn(person, todayISO()))
  const dayCheck = check.day(meals)
  // Granica se javlja po zbroju dana, a stanja bez brojke po sastojku.
  const flags = dayCheck.breaches.length && dayCheck.worst
    ? [dayCheck.worst, ...dayCheck.flags]
    : dayCheck.flags

  const editMeals = (mutate: (draft: DayMeals) => void) => {
    update((draft) => {
      const target = draft.menus[safeIndex]
      if (target) mutate(target.meals)
    })
  }

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="row">
            <label htmlFor="menu-sel" style={{ margin: 0 }}>
              Jelovnik:
            </label>
            <select
              id="menu-sel"
              style={{ width: 'auto', maxWidth: 320 }}
              value={safeIndex}
              onChange={(e) => setIndex(Number(e.target.value))}
            >
              {menus.map((m, i) => (
                <option value={i} key={m.id}>
                  {title(m, i)} — {description(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <button
              className="btn small"
              onClick={() =>
                update((draft) => {
                  draft.menus.push({ id: uid('mn'), meals: emptyMeals() })
                  setIndex(draft.menus.length - 1)
                })
              }
            >
              + Novi
            </button>
            <button
              className="btn secondary small"
              onClick={async () => {
                if (!menu) return
                const t = await promptDialog('Naziv jelovnika (prazno = automatski):', menu.title ?? '')
                if (t === null) return
                const d = await promptDialog('Kratki opis (prazno = automatski):', menu.desc ?? '')
                update((draft) => {
                  const target = draft.menus[safeIndex]
                  if (!target) return
                  if (t.trim()) target.title = t.trim()
                  else delete target.title
                  if (d?.trim()) target.desc = d.trim()
                  else delete target.desc
                })
              }}
            >
              ✎ Naziv / opis
            </button>
            <button
              className="btn danger small"
              onClick={async () => {
                if (menus.length <= 1) return toast('Mora postojati barem jedan jelovnik.')
                if (!menu) return
                if (!(await confirmDialog(`Obrisati ${title(menu, safeIndex)}?`, 'Obriši'))) return
                update((draft) => {
                  draft.menus.splice(safeIndex, 1)
                })
                setIndex(Math.max(0, safeIndex - 1))
              }}
            >
              Obriši
            </button>
          </div>
        </div>

        {menu && (
          <>
            <h2 style={{ margin: 0 }}>{title(menu, safeIndex)}</h2>
            <div className="small muted">{description(menu)}</div>
            <div className="small" style={{ marginTop: 10, lineHeight: 1.7 }}>
              {isEmptyMeals(meals) ? (
                <span className="muted">Nema unesenih namirnica u ovom jelovniku.</span>
              ) : (
                MEALS.map((name, i) => {
                  const items = meals[i] ?? []
                  if (!items.length) return null
                  return (
                    <div key={name} style={{ marginBottom: 3 }}>
                      <b>{name}</b>{' '}
                      <span className="kcal-c">{fmt(sumItems(items, foods).kcal)} kcal</span>:{' '}
                      {items.map((item, j) => (
                        <span key={j}>
                          {j > 0 && ', '}
                          {itemName(item, foods)}{' '}
                          <span className="muted">
                            {fmt(item.g)} {foodUnit('', itemName(item, foods))}
                          </span>
                        </span>
                      ))}
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>Sastav jelovnika</h2>
        <MealEditor meals={meals} onChange={editMeals} />
      </div>

      <div className="card">
        <h2>Pregled — {menu ? title(menu, safeIndex) : ''}</h2>
        <div className="flexsplit">
          <div>
            <div className="kcalbig">
              <span className="kcal-c">{fmt(totals.kcal)}</span>{' '}
              <span className="muted" style={{ fontSize: 14 }}>
                / {fmt(targets.kcal)} kcal
              </span>
            </div>
            <div className="small muted">planirano za cijeli jelovnik</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>
              💧 {fmt(mealsFluid(meals, foods), 1)} / {fmt(targets.water, 1)} L
            </div>
            <div className="small muted">tekućina (pića)</div>
          </div>
        </div>
        {flags.length > 0 && (
          <div className="banner warn" style={{ marginTop: 12, marginBottom: 0 }}>
            {flags.map((f) => (
              <div key={f.condition}>
                <b>
                  {f.level === 'izbjegavaj' ? '⛔' : '⚠'} {f.conditionName}
                </b>{' '}
                — {f.why}
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <NutrientBars totals={totals} targets={plan.targets} caps={plan.caps} />
        </div>
      </div>

      <div className="card">
        <h2>🛒 Nabava</h2>
        <p className="muted small">
          Popis za kupovinu radi se na razini tjedna, u kartici <b>Tjedni i nabava</b> — ondje se
          količine množe sastavom kućanstva, a jela iz recepata razlažu na sastojke.
        </p>
      </div>
    </>
  )
}

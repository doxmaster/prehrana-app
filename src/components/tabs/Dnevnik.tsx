import { useMemo } from 'react'
import { MONTHS, addDays, dayName, fmtDate, firstOfMonth, iso, monthDates, parseISO, todayISO, weekDates } from '../../domain/dates'
import { NUTRIENT_KEYS } from '../../domain/types'
import { NUTRIENTS } from '../../domain/constants'
import { capBreaches, conditionPlan } from '../../domain/conditions'
import { emptyMeals, mealsFluid, mealsTotals, zeroNutrients } from '../../domain/nutrients'
import { targetsFor, weightOn } from '../../domain/targets'
import { ensureDay, useActivePerson, useAppStore, useFoods, useUpdate } from '../../store/useAppStore'
import { AiUnos } from '../AiUnos'
import { Calendar } from '../Calendar'
import { MealEditor } from '../MealEditor'
import { NutrientBars } from '../NutrientBars'
import { PersonPicker } from '../PersonPicker'
import { PlanTraka } from '../PlanTraka'
import { fmt } from '../../lib/format'
import type { DayMeals } from '../../domain/types'

export function Dnevnik() {
  const person = useActivePerson()
  const foods = useFoods()
  const update = useUpdate()
  const selectedDate = useAppStore((s) => s.selectedDate)
  const setSelectedDate = useAppStore((s) => s.setSelectedDate)

  const month = firstOfMonth(selectedDate)
  const meals: DayMeals = person.log[selectedDate] ?? emptyMeals()
  const targets = targetsFor(person, selectedDate)
  const totals = mealsTotals(meals, foods)
  const fluid = mealsFluid(meals, foods)

  const plan = conditionPlan(targets, person, weightOn(person, selectedDate))
  const breaches = capBreaches(totals, plan.caps)

  const kcalByDate = useMemo(() => {
    const out: Record<string, number> = {}
    for (const date of monthDates(month)) {
      const day = person.log[date]
      if (day) out[date] = mealsTotals(day, foods).kcal
    }
    return out
  }, [month, person.log, foods])

  const week = useMemo(() => {
    const dates = weekDates(selectedDate)
    const total = zeroNutrients()
    let days = 0
    for (const date of dates) {
      const day = person.log[date]
      if (!day) continue
      days++
      const dayTotals = mealsTotals(day, foods)
      for (const key of NUTRIENT_KEYS) total[key] += dayTotals[key]
    }
    const average = zeroNutrients()
    if (days) for (const key of NUTRIENT_KEYS) average[key] = total[key] / days
    return { days, total, average }
  }, [selectedDate, person.log, foods])

  const editMeals = (mutate: (draft: DayMeals) => void) => {
    update((state) => {
      mutate(ensureDay(state, selectedDate))
    })
  }

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="row">
            <PersonPicker />
            <label htmlFor="mjesec" style={{ margin: '0 0 0 6px' }}>
              Mjesec:
            </label>
            <select
              id="mjesec"
              style={{ width: 'auto' }}
              value={parseISO(month).getMonth()}
              onChange={(e) => {
                const year = parseISO(month).getFullYear()
                setSelectedDate(iso(new Date(year, Number(e.target.value), 1)))
              }}
            >
              {MONTHS.map((name, i) => (
                <option value={i} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <button
              className="btn secondary small"
              aria-label="Prethodni dan"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            >
              ◀
            </button>
            <b style={{ minWidth: 190, textAlign: 'center' }} aria-live="polite">
              {dayName(selectedDate)}, {fmtDate(selectedDate)}
            </b>
            <button
              className="btn secondary small"
              aria-label="Sljedeći dan"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              ▶
            </button>
            <button className="btn small" onClick={() => setSelectedDate(todayISO())}>
              Danas
            </button>
          </div>
        </div>

        <Calendar month={month} selected={selectedDate} kcalByDate={kcalByDate} onPick={setSelectedDate} />
        <p className="hint">Klikni dan za prikaz; brojka u ćeliji su pojedene kalorije tog dana.</p>
      </div>

      <PlanTraka date={selectedDate} meals={meals} onChange={editMeals} />

      <AiUnos onChange={editMeals} />

      <div className="card">
        <h2>Obroci (pojedeno)</h2>
        <MealEditor meals={meals} onChange={editMeals} />
      </div>

      <div className="card">
        <h2>
          Pregled dana <span className="muted small">({person.name})</span>
        </h2>
        <div className="flexsplit">
          <div>
            <div className="kcalbig">
              <span className="kcal-c">{fmt(totals.kcal)}</span>{' '}
              <span className="muted" style={{ fontSize: 14 }}>
                / {fmt(targets.kcal)} kcal
              </span>
            </div>
            <div className="small muted">Preostalo: {fmt(targets.kcal - totals.kcal)} kcal</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>
              💧 {fmt(fluid, 1)} / {fmt(targets.water, 1)} L
            </div>
            <div className="small muted">tekućina (pića)</div>
          </div>
        </div>
        {breaches.length > 0 && (
          <div className="banner warn" style={{ marginTop: 12, marginBottom: 0 }}>
            {breaches.map((b) => (
              <div key={b.cap.key}>
                <b>
                  {NUTRIENTS.find((n) => n.key === b.cap.key)?.label}: {fmt(b.value, 1)} / najviše{' '}
                  {fmt(b.cap.max)}
                </b>{' '}
                — {b.cap.why}
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <NutrientBars totals={totals} targets={plan.targets} caps={plan.caps} />
        </div>
      </div>

      <div className="card">
        <h2>Tjedni prosjek (tjedan odabranog dana)</h2>
        {week.days === 0 ? (
          <p className="muted small">Nema unosa u ovom tjednu.</p>
        ) : (
          <>
            <div className="small muted" style={{ marginBottom: 6 }}>
              {week.days} {week.days === 1 ? 'dan' : 'dana'} s unosom u ovom tjednu
            </div>
            <div className="kcalbig">
              <span className="kcal-c">{fmt(week.average.kcal)}</span>{' '}
              <span className="muted" style={{ fontSize: 14 }}>
                kcal/dan (prosjek) · cilj {fmt(targets.kcal)}
              </span>
            </div>
            <div className="small muted" style={{ margin: '2px 0 12px' }}>
              Ukupno: <span className="kcal-c">{fmt(week.total.kcal)}</span> /{' '}
              {fmt(targets.kcal * week.days)} kcal
            </div>
            <NutrientBars totals={week.average} targets={targets} />
          </>
        )}
      </div>
    </>
  )
}

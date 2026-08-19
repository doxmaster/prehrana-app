import { useMemo, useState } from 'react'
import {
  MONTHS,
  addDays,
  dayName,
  fmtDate,
  firstOfMonth,
  iso,
  monthDates,
  parseISO,
  todayISO,
  weekDates,
} from '../../domain/dates'
import { NUTRIENT_KEYS } from '../../domain/types'
import { NUTRIENTS } from '../../domain/constants'
import { capBreaches, conditionPlan } from '../../domain/conditions'
import { energyBreakdown } from '../../domain/energy'
import { emptyMeals, mealsFluid, mealsTotals, zeroNutrients } from '../../domain/nutrients'
import { targetsFor, weightOn } from '../../domain/targets'
import {
  ensureDay,
  useActivePerson,
  useAppStore,
  useFoods,
  useUpdate,
} from '../../store/useAppStore'
import { AiUnos } from '../AiUnos'
import { Calendar } from '../Calendar'
import { Hero } from '../Hero'
import { MealEditor } from '../MealEditor'
import { KcalRing } from '../KcalRing'
import { NutrientBars } from '../NutrientBars'
import { BezPlana, PlanZaglavlje } from '../Plan'
import { usePlanZaDan } from '../../hooks/usePlanZaDan'
import { Tekucina } from '../Tekucina'
import { fmt } from '../../lib/format'
import type { DayMeals } from '../../domain/types'

export function Dnevnik() {
  const person = useActivePerson()
  const foods = useFoods()
  const update = useUpdate()
  const selectedDate = useAppStore((s) => s.selectedDate)
  const setSelectedDate = useAppStore((s) => s.setSelectedDate)
  /* Kalendar je zatvoren dok ne zatreba: otvara se za skok na drugi dan, a
     pomak za jedan dan ide strelicama iznad. */
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const month = firstOfMonth(selectedDate)
  const meals: DayMeals = person.log[selectedDate] ?? emptyMeals()
  const targets = targetsFor(person, selectedDate)
  const totals = mealsTotals(meals, foods)
  const fluid = mealsFluid(meals, foods)

  const plan = conditionPlan(targets, person, weightOn(person, selectedDate))
  const planDana = usePlanZaDan(selectedDate)
  const sleepOn = person.measurements.find((m) => m.date === selectedDate)?.sleep
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
      <Hero
        date={selectedDate}
        name={person.name}
        kcal={Math.round(totals.kcal)}
        target={plan.targets.kcal}
        meals={meals.filter((m) => m.length > 0).length}
      />

      {/* Pomak po danima ostaje na vrhu — jucer i danas su najcesci slucaj.
          Preko cijelog retka jer je traka, ne kartica: na pola sirine bi do nje
          ostala prazna polovica. */}
      <div className="card span-all">
        <div className="row" style={{ justifyContent: 'space-between' }}>
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
          <button className="btn secondary small" onClick={() => setCalendarOpen((v) => !v)}>
            {calendarOpen ? 'Sakrij kalendar' : '📅 Odaberi drugi dan'}
          </button>
        </div>

        {calendarOpen && (
          <>
            <div className="row" style={{ margin: '12px 0 8px' }}>
              <label htmlFor="mjesec" style={{ margin: 0 }}>
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
            <Calendar
              month={month}
              selected={selectedDate}
              kcalByDate={kcalByDate}
              onPick={setSelectedDate}
            />
            <p className="hint">
              Klikni dan za prikaz; brojka u ćeliji su pojedene kalorije tog dana.
            </p>
          </>
        )}
      </div>

      {/* Bez tjedna vezanog uz datum nema sto ponuditi, pa se to kaze i nudi
          na jedan klik; inace plan zivi unutar samih obroka ispod. */}
      {!planDana && <BezPlana date={selectedDate} />}

      <div className="card">
        <div className="flexsplit">
          <h2 style={{ margin: 0 }}>Obroci</h2>
          {/* AI unos je povremen put (izvan Claudea trazi kopiraj/zalijepi), pa
              stoji kao gumb uz sam unos, a ne kao stalna kartica. */}
          <button className="btn secondary small" onClick={() => setAiOpen(true)}>
            🤖 Upiši rečenicom
          </button>
        </div>
        <p className="muted small" style={{ margin: '-4px 0 10px' }}>
          Ovdje je ono što je <b>stvarno pojedeno</b> — sve brojke u pregledu i napretku računaju se
          samo odavde. Sivi redak <span className="tag">plan</span> je prijedlog iz tjednog
          jelovnika; nestaje čim ga upišeš i tek se onda broji.
        </p>
        {planDana && (
          <PlanZaglavlje date={selectedDate} plan={planDana} meals={meals} onChange={editMeals} />
        )}
        <MealEditor meals={meals} onChange={editMeals} plan={planDana?.meals} />
      </div>

      <Tekucina date={selectedDate} meals={meals} onChange={editMeals} />

      {aiOpen && <AiUnos onChange={editMeals} onClose={() => setAiOpen(false)} />}

      <div className="card">
        <h2>
          Pregled dana <span className="muted small">({person.name})</span>
        </h2>
        <div className="flexsplit">
          <KcalRing
            value={Math.round(totals.kcal)}
            target={plan.targets.kcal}
            spent={energyBreakdown(person.profile, weightOn(person, selectedDate), sleepOn).total}
          />
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

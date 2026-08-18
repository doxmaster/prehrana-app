import { useMemo, useState } from 'react'
import { addDays, dayName, fmtDate, todayISO } from '../../domain/dates'
import {
  RANGES,
  kcalSeries,
  kcalTargetOn,
  movingAverage,
  rangeStart,
  summarize,
  weightSeries,
} from '../../domain/progress'
import { SLEEP_LIMITS } from '../../domain/energy'
import { PROFILE_LIMITS } from '../../domain/targets'
import { toast } from '../../store/dialogs'
import { useActivePerson, useAppStore, useFoods, useUpdate } from '../../store/useAppStore'
import { Bilanca } from '../Bilanca'
import { DailyBars } from '../charts/DailyBars'
import { TrendLine } from '../charts/TrendLine'
import { fmt } from '../../lib/format'
import type { SeriesPoint } from '../../domain/progress'

/**
 * Stranica je slozena u tri zaokruzene cjeline umjesto liste kartica poredanih
 * kako su nastajale: TEZINA (unos, graf i tablica na jednom mjestu), SAN I
 * ENERGIJA (unos sna zivi unutar Bilance jer se ondje odmah vidi sto mijenja)
 * i KALORIJE (graf unesenog naspram cilja). Svaka cjelina nosi SVOJ raspon
 * dana — dijeljen raspon bi znacio da promjena za jedno tiho pomakne i drugo,
 * sto zbunjuje kad su cjeline vizualno razdvojene.
 */
export function Napredak() {
  const person = useActivePerson()
  const foods = useFoods()
  const update = useUpdate()
  const selectedDate = useAppStore((s) => s.selectedDate)
  const setSelectedDate = useAppStore((s) => s.setSelectedDate)

  const [weightRange, setWeightRange] = useState<number>(90)
  const [kcalRange, setKcalRange] = useState<number>(90)
  const [showWeightTable, setShowWeightTable] = useState(false)
  const [showKcalTable, setShowKcalTable] = useState(false)

  const today = todayISO()

  const weight = useMemo(
    () => weightSeries(person, rangeStart(today, weightRange), today),
    [person, today, weightRange],
  )
  const weightTrend = useMemo(() => movingAverage(weight, 7), [weight])
  const weightStats = summarize(weight)

  const kcal = useMemo(
    () => kcalSeries(person, foods, rangeStart(today, kcalRange), today),
    [person, foods, today, kcalRange],
  )
  const kcalStats = summarize(kcal)
  const target = kcalTargetOn(person, today)

  const todaysWeight = person.measurements.find((m) => m.date === selectedDate)?.weight
  const todaysSleep = person.measurements.find((m) => m.date === selectedDate)?.sleep

  /** Zajednicki upis u mjerenje tog dana — tezina i san dijele isti zapis. */
  const editMeasurement = (mutate: (m: { date: string; weight?: number; sleep?: number }) => void) =>
    update((state) => {
      const target = state.profiles.find((p) => p.id === person.id)
      if (!target) return
      let entry = target.measurements.find((m) => m.date === selectedDate)
      if (!entry) {
        entry = { date: selectedDate }
        target.measurements.push(entry)
      }
      mutate(entry)
      // Zapis bez ijednog podatka nema smisla drzati.
      target.measurements = target.measurements.filter(
        (m) => m.weight !== undefined || m.sleep !== undefined || m.waist !== undefined || m.note,
      )
      target.measurements.sort((a, b) => a.date.localeCompare(b.date))
    })

  const saveSleep = (hours: number) => {
    if (hours < SLEEP_LIMITS.min || hours > SLEEP_LIMITS.max) {
      toast(`San mora biti između ${SLEEP_LIMITS.min} i ${SLEEP_LIMITS.max} sati.`)
      return
    }
    editMeasurement((m) => void (m.sleep = hours))
    toast(`Zabilježeno ${fmt(hours, 1)} h sna za ${fmtDate(selectedDate)}.`)
  }

  const clearSleep = () => {
    editMeasurement((m) => void delete m.sleep)
    toast('San obrisan.')
  }

  const [draft, setDraft] = useState('')
  const [draftDate, setDraftDate] = useState(selectedDate)

  // Promjena dana u Dnevniku povlaci i ovdje mjerenje tog dana.
  if (draftDate !== selectedDate) {
    setDraftDate(selectedDate)
    setDraft('')
  }

  const saveWeight = () => {
    const value = parseFloat(draft.replace(',', '.'))
    if (!Number.isFinite(value) || value < PROFILE_LIMITS.weight.min || value > PROFILE_LIMITS.weight.max) {
      toast(`Težina mora biti između ${PROFILE_LIMITS.weight.min} i ${PROFILE_LIMITS.weight.max} kg.`)
      return
    }
    update((state) => {
      const target = state.profiles.find((p) => p.id === person.id)
      if (!target) return
      const existing = target.measurements.find((m) => m.date === selectedDate)
      if (existing) existing.weight = value
      else target.measurements.push({ date: selectedDate, weight: value })
      target.measurements.sort((a, b) => a.date.localeCompare(b.date))
    })
    setDraft('')
    toast(`Zabilježeno ${fmt(value, 1)} kg za ${fmtDate(selectedDate)}.`)
  }

  const removeWeight = () => {
    update((state) => {
      const target = state.profiles.find((p) => p.id === person.id)
      if (!target) return
      target.measurements = target.measurements.filter((m) => m.date !== selectedDate)
    })
    toast('Mjerenje obrisano.')
  }

  return (
    <>
      <div className="card">
        {/* Dan za koji se biljezi mora biti vidljiv odmah — inace se lako upise
            mjerenje na krivi datum. Vrijedi za tezinu i san ispod. */}
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row">
            <button
              className="btn secondary small"
              aria-label="Prethodni dan"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            >
              ◀
            </button>
            <b style={{ minWidth: 210, textAlign: 'center' }} aria-live="polite">
              📅 {dayName(selectedDate)}, {fmtDate(selectedDate)}
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
          <span className="small muted">dan za koji se bilježe težina i san ispod</span>
        </div>
      </div>

      {/* ---------- Tezina: unos, graf i tablica na jednom mjestu ---------- */}
      <div className="card span-all">
        <div className="flexsplit">
          <h2 style={{ margin: 0 }}>Težina — {person.name}</h2>
          <div className="row">
            {RANGES.map((r) => (
              <button
                key={r.days}
                className={`btn small${weightRange === r.days ? '' : ' secondary'}`}
                aria-pressed={weightRange === r.days}
                onClick={() => setWeightRange(r.days)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="row" style={{ margin: '10px 0 6px' }}>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            style={{ width: 120 }}
            aria-label={`Težina za ${fmtDate(selectedDate)}`}
            placeholder={todaysWeight ? String(todaysWeight) : 'kg'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveWeight()
            }}
          />
          <button className="btn small" onClick={saveWeight}>
            Zabilježi
          </button>
          {todaysWeight !== undefined && (
            <>
              <span className="small muted">
                zabilježeno: <b>{fmt(todaysWeight, 1)} kg</b>
              </span>
              <button className="btn secondary small" onClick={removeWeight}>
                Obriši
              </button>
            </>
          )}
        </div>
        <p className="muted small" style={{ margin: '0 0 14px' }}>
          Bilježi se za dan odabran gore. Ciljevi se od tada računaju iz izmjerene težine, ne iz
          one upisane u profilu.
        </p>

        {weightStats.change !== null && (
          <p className="small muted" style={{ margin: '0 0 4px' }}>
            {weightStats.change > 0 ? '+' : '−'}
            {fmt(Math.abs(weightStats.change), 1)} kg u odabranom razdoblju
          </p>
        )}
        <TrendLine
          points={weight}
          smoothed={weightTrend}
          unit="kg"
          decimals={1}
          label={`Težina osobe ${person.name}`}
        />
        {weight.length > 1 && (
          <p className="hint">
            Blijeda crta je sedmodnevni prosjek — dnevna težina oscilira i po kilogram zbog vode, pa
            se trend vidi tek kroz prosjek.
          </p>
        )}

        <div className="flexsplit" style={{ marginTop: 14 }}>
          <span className="small muted">Podaci u tablici</span>
          <button className="btn secondary small" onClick={() => setShowWeightTable((v) => !v)}>
            {showWeightTable ? 'Sakrij' : 'Prikaži'}
          </button>
        </div>
        {showWeightTable && <SeriesTable points={weight} unit="kg" decimals={1} />}
      </div>

      {/* ---------- San i energija: unos sna zivi unutar Bilance ---------- */}
      <Bilanca date={selectedDate} sleepEntry={{ value: todaysSleep, onSave: saveSleep, onClear: clearSleep }} />

      {/* ---------- Kalorije: graf naspram cilja i tablica ---------- */}
      <div className="card span-all">
        <div className="flexsplit">
          <h2 style={{ margin: 0 }}>Kalorije — {person.name}</h2>
          <div className="row">
            {RANGES.map((r) => (
              <button
                key={r.days}
                className={`btn small${kcalRange === r.days ? '' : ' secondary'}`}
                aria-pressed={kcalRange === r.days}
                onClick={() => setKcalRange(r.days)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <p className="muted small" style={{ margin: '-4px 0 10px' }}>
          {kcal.length
            ? `Prosjek ${fmt(kcalStats.average)} kcal/dan u odabranom razdoblju.`
            : 'Nema unosa u odabranom razdoblju.'}
        </p>
        <DailyBars points={kcal} target={target} unit="kcal" label="Dnevne kalorije" />

        <div className="flexsplit" style={{ marginTop: 14 }}>
          <span className="small muted">Podaci u tablici</span>
          <button className="btn secondary small" onClick={() => setShowKcalTable((v) => !v)}>
            {showKcalTable ? 'Sakrij' : 'Prikaži'}
          </button>
        </div>
        {showKcalTable && <SeriesTable points={kcal} unit="kcal" target={target} />}
      </div>
    </>
  )
}

/** Zajednicka tablica za obje grupe — namirnica biranja i formata jednaka svugdje. */
function SeriesTable({
  points,
  unit,
  decimals = 0,
  target,
}: {
  points: SeriesPoint[]
  unit: string
  decimals?: number
  target?: number
}) {
  if (!points.length) return <p className="muted small">Nema podataka.</p>
  const rows = [...points].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Vrijednost</th>
            {target !== undefined && <th>Od cilja</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.date}>
              <td>{fmtDate(p.date)}</td>
              <td>
                {fmt(p.value, decimals)} {unit}
              </td>
              {target !== undefined && (
                <td>
                  {target > 0
                    ? `${p.value >= target ? '+' : '−'}${fmt(Math.abs(p.value - target))}`
                    : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

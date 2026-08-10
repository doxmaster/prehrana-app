import { useMemo, useState } from 'react'
import { fmtDate, todayISO } from '../../domain/dates'
import {
  RANGES,
  kcalSeries,
  kcalTargetOn,
  movingAverage,
  rangeStart,
  summarize,
  weightSeries,
} from '../../domain/progress'
import { PROFILE_LIMITS } from '../../domain/targets'
import { toast } from '../../store/dialogs'
import { useActivePerson, useAppStore, useFoods, useUpdate } from '../../store/useAppStore'
import { DailyBars } from '../charts/DailyBars'
import { TrendLine } from '../charts/TrendLine'
import { PersonPicker } from '../PersonPicker'
import { fmt } from '../../lib/format'
import type { SeriesPoint } from '../../domain/progress'

export function Napredak() {
  const person = useActivePerson()
  const foods = useFoods()
  const update = useUpdate()
  const selectedDate = useAppStore((s) => s.selectedDate)
  const [days, setDays] = useState<number>(90)
  const [showTable, setShowTable] = useState(false)

  const to = todayISO()
  const from = rangeStart(to, days)

  const weight = useMemo(() => weightSeries(person, from, to), [person, from, to])
  const weightTrend = useMemo(() => movingAverage(weight, 7), [weight])
  const kcal = useMemo(() => kcalSeries(person, foods, from, to), [person, foods, from, to])

  const weightStats = summarize(weight)
  const kcalStats = summarize(kcal)
  const target = kcalTargetOn(person, to)

  const todaysWeight = person.measurements.find((m) => m.date === selectedDate)?.weight
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
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row">
            <PersonPicker />
          </div>
          <div className="row">
            {RANGES.map((r) => (
              <button
                key={r.days}
                className={`btn small${days === r.days ? '' : ' secondary'}`}
                aria-pressed={days === r.days}
                onClick={() => setDays(r.days)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Mjerenje težine</h2>
        <p className="muted small" style={{ margin: '-6px 0 10px' }}>
          Bilježi se za dan odabran u Dnevniku ({fmtDate(selectedDate)}). Ciljevi se od tada računaju
          iz izmjerene težine, ne iz one upisane u profilu.
        </p>
        <div className="row">
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
      </div>

      <div className="card">
        <div className="flexsplit">
          <h2 style={{ margin: 0 }}>Težina — {person.name}</h2>
          {weightStats.change !== null && (
            <span className="small muted">
              {weightStats.change > 0 ? '+' : '−'}
              {fmt(Math.abs(weightStats.change), 1)} kg u razdoblju
            </span>
          )}
        </div>
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
      </div>

      <div className="card">
        <div className="flexsplit">
          <h2 style={{ margin: 0 }}>Unesene kalorije</h2>
          <span className="small muted">
            {kcal.length ? `prosjek ${fmt(kcalStats.average)} kcal/dan` : ''}
          </span>
        </div>
        <DailyBars points={kcal} target={target} unit="kcal" label="Dnevne kalorije" />
      </div>

      <div className="card">
        <div className="flexsplit">
          <h2 style={{ margin: 0 }}>Podaci u tablici</h2>
          <button className="btn secondary small" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'Sakrij' : 'Prikaži'}
          </button>
        </div>
        <p className="muted small" style={{ margin: '4px 0 0' }}>
          Iste brojke kao na grafovima, za čitanje bez oslanjanja na boju i oblik.
        </p>
        {showTable && <ProgressTable weight={weight} kcal={kcal} target={target} />}
      </div>
    </>
  )
}

function ProgressTable({
  weight,
  kcal,
  target,
}: {
  weight: SeriesPoint[]
  kcal: SeriesPoint[]
  target: number
}) {
  const byDate = new Map<string, { weight?: number; kcal?: number }>()
  for (const p of weight) byDate.set(p.date, { ...byDate.get(p.date), weight: p.value })
  for (const p of kcal) byDate.set(p.date, { ...byDate.get(p.date), kcal: p.value })

  const rows = [...byDate.entries()].sort(([a], [b]) => b.localeCompare(a))
  if (!rows.length) return <p className="muted small">Nema podataka.</p>

  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Težina</th>
            <th>Kalorije</th>
            <th>Od cilja</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([date, row]) => (
            <tr key={date}>
              <td>{fmtDate(date)}</td>
              <td>{row.weight !== undefined ? `${fmt(row.weight, 1)} kg` : '—'}</td>
              <td>{row.kcal !== undefined ? `${fmt(row.kcal)} kcal` : '—'}</td>
              <td>
                {row.kcal !== undefined && target > 0
                  ? `${row.kcal >= target ? '+' : '−'}${fmt(Math.abs(row.kcal - target))}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

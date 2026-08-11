import { useState } from 'react'
import { REFERENCE_SLEEP, SLEEP_LIMITS, energyBalance, energyBreakdown } from '../domain/energy'
import { emptyMeals, mealsTotals } from '../domain/nutrients'
import { weightOn } from '../domain/targets'
import { weekDates } from '../domain/dates'
import { useActivePerson, useFoods } from '../store/useAppStore'
import { fmt } from '../lib/format'

/**
 * Koliko energije dan trazi i koliko je uneseno.
 *
 * Ciljevi drugdje u aplikaciji odgovaraju na "koliko smijem pojesti", a ovo na
 * "gdje energija odlazi": koliko odnese samo rad tijela, koliko san, a koliko
 * kretanje. Bez tog rastava cilj od 2 700 kcal izgleda kao proizvoljan broj.
 */
export function Bilanca({ date }: { date: string }) {
  const person = useActivePerson()
  const foods = useFoods()

  const weight = weightOn(person, date)
  const sleep = person.measurements.find((m) => m.date === date)?.sleep
  const breakdown = energyBreakdown(person.profile, weight, sleep)

  const intake = mealsTotals(person.log[date] ?? emptyMeals(), foods).kcal
  const balance = energyBalance(intake, breakdown, person.profile, weight)

  // Tjedan daje pouzdaniju sliku od jednog dana: propušten unos ili jedan
  // obilan objed sami po sebi ne znače ništa.
  const week = weekDates(date)
  const withEntries = week.filter((d) => person.log[d])
  const weekIntake = withEntries.reduce((sum, d) => sum + mealsTotals(person.log[d]!, foods).kcal, 0)
  const weekSpend = week.reduce((sum, d) => {
    const s = person.measurements.find((m) => m.date === d)?.sleep
    return sum + energyBreakdown(person.profile, weightOn(person, d), s).total
  }, 0)
  const weekBalance = withEntries.length === week.length ? weekIntake - weekSpend : null

  const share = (value: number) => (breakdown.total > 0 ? (value / breakdown.total) * 100 : 0)

  return (
    <div className="card">
      <div className="flexsplit">
        <h2 style={{ margin: 0 }}>Energija — {person.name}</h2>
        <span className="small muted">
          {breakdown.sleepAssumed ? `san nije upisan, računa se ${REFERENCE_SLEEP} h` : `san ${fmt(breakdown.sleep, 1)} h`}
        </span>
      </div>

      <div className="grid g3" style={{ marginTop: 10 }}>
        <Stat label="Potrošeno (procjena)" value={`${fmt(breakdown.total)} kcal`} note="cijeli dan" />
        <Stat label="Uneseno hranom" value={`${fmt(balance.intake)} kcal`} note="iz dnevnika" />
        <Stat
          label={balance.balance >= 0 ? 'Višak' : 'Manjak'}
          value={`${balance.balance >= 0 ? '+' : '−'}${fmt(Math.abs(balance.balance))} kcal`}
          note={`≈ ${balance.weeklyKg >= 0 ? '+' : '−'}${fmt(Math.abs(balance.weeklyKg), 2)} kg/tjedan uz ovakav dan`}
          tone={Math.abs(balance.vsTarget) <= 200 ? 'good' : 'warn'}
        />
      </div>

      <h3 style={{ margin: '16px 0 6px', fontSize: 14 }}>Gdje energija odlazi</h3>
      <Bar label="San" value={breakdown.sleepKcal} pct={share(breakdown.sleepKcal)} hint={`${fmt(breakdown.sleep, 1)} h`} />
      <Bar
        label="Rad tijela dok si budan"
        value={breakdown.awakeRestKcal}
        pct={share(breakdown.awakeRestKcal)}
        hint="disanje, probava, mozak"
      />
      <Bar
        label="Kretanje i aktivnost"
        value={breakdown.activityKcal}
        pct={share(breakdown.activityKcal)}
        hint="sve iznad mirovanja"
      />

      <p className="hint" style={{ marginTop: 10 }}>
        Bazalni metabolizam je {fmt(breakdown.bmr)} kcal — toliko tijelo potroši i da cijeli dan
        miruje. Cilj iz profila je {fmt(balance.targetKcal)} kcal, a danas je uneseno{' '}
        {balance.vsTarget >= 0 ? `${fmt(balance.vsTarget)} kcal više` : `${fmt(-balance.vsTarget)} kcal manje`}.
      </p>

      {weekBalance !== null ? (
        <div className="banner" style={{ marginTop: 10, marginBottom: 0 }}>
          Cijeli tjedan: {weekBalance >= 0 ? 'višak' : 'manjak'} od{' '}
          <b>{fmt(Math.abs(weekBalance))} kcal</b> — oko{' '}
          <b>
            {weekBalance >= 0 ? '+' : '−'}
            {fmt(Math.abs(weekBalance / 7700), 2)} kg
          </b>
          . Tjedan je pouzdaniji od pojedinog dana.
        </div>
      ) : (
        <p className="muted small" style={{ marginBottom: 0 }}>
          Tjedna bilanca traži unos za svih sedam dana — sada ih ima {withEntries.length}.
        </p>
      )}

      <p className="muted small" style={{ marginTop: 10, marginBottom: 0 }}>
        ⓘ Potrošnja je <b>procjena iz formule</b> (Mifflin-St Jeor odnosno Schofield × razina
        aktivnosti), a ne mjerenje. Sat manje sna računa se kao sat sjedenja, pa je učinak sna na
        ovu brojku malen — njegov glavni učinak ide preko apetita i volje za kretanjem, što nijedna
        formula ne vidi. Stvarna potrošnja zna odstupati i ±15 %.
      </p>
    </div>
  )
}

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note?: string
  tone?: 'good' | 'warn'
}) {
  const color = tone === 'good' ? 'var(--good)' : tone === 'warn' ? 'var(--warn)' : undefined
  return (
    <div className="card" style={{ margin: 0, background: 'var(--panel2)' }}>
      <div className="muted small">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, margin: '2px 0', ...(color ? { color } : {}) }}>
        {value}
      </div>
      {note && <div className="muted small">{note}</div>}
    </div>
  )
}

function Bar({ label, value, pct, hint }: { label: string; value: number; pct: number; hint: string }) {
  return (
    <div className="nut">
      <div className="top">
        <span>
          {label} <span className="muted small">· {hint}</span>
        </span>
        <span className="muted">
          {fmt(value)} kcal ({Math.round(pct)} %)
        </span>
      </div>
      <div className="prog" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${Math.min(100, pct)}%`, background: 'var(--accent, #1fa08a)' }} />
      </div>
    </div>
  )
}

/**
 * Unos sna za dan.
 *
 * Radi isto kao unos tezine odmah iznad — kontrolirano polje i gumb — da se
 * dva zapisa istog dana ne ponasaju razlicito.
 */
export function SanUnos({
  value,
  onSave,
  onClear,
}: {
  value: number | undefined
  onSave: (hours: number) => void
  onClear: () => void
}) {
  const [draft, setDraft] = useState('')

  const save = () => {
    const parsed = parseFloat(draft.replace(',', '.'))
    if (!Number.isFinite(parsed)) return
    onSave(parsed)
    setDraft('')
  }

  return (
    <div className="row">
      <input
        type="number"
        step="0.5"
        min={SLEEP_LIMITS.min}
        max={SLEEP_LIMITS.max}
        inputMode="decimal"
        style={{ width: 120 }}
        aria-label="Sati sna"
        placeholder={value !== undefined ? String(value) : 'sati'}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
        }}
      />
      <button className="btn small" onClick={save}>
        Zabilježi san
      </button>
      {value !== undefined && (
        <>
          <span className="small muted">
            zabilježeno: <b>{fmt(value, 1)} h</b>
          </span>
          <button className="btn secondary small" onClick={onClear}>
            Obriši
          </button>
        </>
      )}
    </div>
  )
}

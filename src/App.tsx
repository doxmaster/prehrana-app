import { useState } from 'react'
import { useAppStore, useActivePerson, useFoods } from './store/useAppStore'
import { targetsFor } from './domain/targets'
import { mealsTotals } from './domain/nutrients'
import { fmtDate } from './domain/dates'

const TABS = [
  { id: 'dnevnik', label: '📊 Dnevnik' },
  { id: 'jelovnik', label: '🍽️ Jelovnik' },
  { id: 'osobe', label: '👤 Osobe i ciljevi' },
  { id: 'namirnice', label: '🍎 Namirnice' },
  { id: 'postavke', label: '⚙️ Postavke' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [tab, setTab] = useState<TabId>('dnevnik')
  const person = useActivePerson()
  const foods = useFoods()
  const selectedDate = useAppStore((s) => s.selectedDate)
  const saveError = useAppStore((s) => s.saveError)
  const migratedFrom = useAppStore((s) => s.migratedFrom)
  const dismiss = useAppStore((s) => s.dismissMigrationNotice)

  const targets = targetsFor(person, selectedDate)
  const totals = mealsTotals(person.log[selectedDate] ?? [[], [], [], []], foods)

  return (
    <>
      <header>
        <h1>🥗 Prehrana</h1>
        <p>Jelovnici, dnevnik i praćenje hranjivih tvari</p>
      </header>

      <div className="wrap">
        {migratedFrom && (
          <div className="banner">
            Podaci su preuzeti iz starije verzije ({migratedFrom}) i pretvoreni u novi format.
            Stara kopija nije obrisana.{' '}
            <button className="btn secondary small" onClick={dismiss}>
              U redu
            </button>
          </div>
        )}
        {saveError && <div className="banner warn">{saveError}</div>}

        <div className="tabs" role="tablist" aria-label="Glavna navigacija">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          <div className="card">
            <div className="flexsplit">
              <h2 style={{ margin: 0 }}>
                {TABS.find((t) => t.id === tab)?.label} — {person.name}
              </h2>
              <span className="muted small">{fmtDate(selectedDate)}</span>
            </div>
            <div className="kcalbig" style={{ marginTop: 12 }}>
              <span className="kcal-c">{Math.round(totals.kcal)}</span>{' '}
              <span className="muted" style={{ fontSize: 14 }}>
                / {targets.kcal} kcal
              </span>
            </div>
            <p className="hint">
              Sučelje se prepisuje u komponente (Faza 4). Podaci, izračuni i migracija su
              preneseni i pokriveni testovima — baza sadrži {foods.all().length} namirnica.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'
import { Dialogs } from './components/Dialogs'
import { Dnevnik } from './components/tabs/Dnevnik'
import { Jelovnik } from './components/tabs/Jelovnik'
import { Namirnice } from './components/tabs/Namirnice'
import { Osobe } from './components/tabs/Osobe'
import { Postavke } from './components/tabs/Postavke'
import { useAppStore } from './store/useAppStore'

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
  const saveError = useAppStore((s) => s.saveError)
  const migratedFrom = useAppStore((s) => s.migratedFrom)
  const dismiss = useAppStore((s) => s.dismissMigrationNotice)

  return (
    <>
      <header>
        <h1>🥗 Prehrana</h1>
        <p>Jelovnici, dnevnik i praćenje hranjivih tvari</p>
      </header>

      <div className="wrap">
        {migratedFrom && (
          <div className="banner">
            Podaci su preuzeti iz starije verzije ({migratedFrom}) i pretvoreni u novi format. Stara
            kopija nije obrisana.{' '}
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
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'dnevnik' && <Dnevnik />}
          {tab === 'jelovnik' && <Jelovnik />}
          {tab === 'osobe' && <Osobe />}
          {tab === 'namirnice' && <Namirnice />}
          {tab === 'postavke' && <Postavke />}
        </div>
      </div>

      <Dialogs />
    </>
  )
}

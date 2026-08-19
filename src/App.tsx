import { Fragment, useState } from 'react'
import { flushSync } from 'react-dom'
import { Dialogs } from './components/Dialogs'
import { HeaderBar } from './components/HeaderBar'
import { Dnevnik } from './components/tabs/Dnevnik'
import { Jelovnik } from './components/tabs/Jelovnik'
import { Namirnice } from './components/tabs/Namirnice'
import { Osobe } from './components/tabs/Osobe'
import { Napredak } from './components/tabs/Napredak'
import { Postavke } from './components/tabs/Postavke'
import { Tjedni } from './components/tabs/Tjedni'
import { useAppStore } from './store/useAppStore'

/**
 * Kartice u tri skupine, odvojene tankom crtom.
 *
 * Redoslijed prati ono sto se radi, ne abecedu:
 *   dan    — sto se danas jelo i kako to stoji kroz vrijeme
 *   plan   — jelovnici, pa tjedni slozeni OD njih (obrnuto je bilo zbunjujuce:
 *            tjedan je dolazio prije gradiva od kojeg se slaze)
 *   podaci — katalozi i postavke koji stoje iza svega
 */
const TABS = [
  { id: 'dnevnik', icon: '📊', label: 'Dnevnik', group: 'dan' },
  { id: 'napredak', icon: '📈', label: 'Napredak', group: 'dan' },
  { id: 'jelovnik', icon: '🍽️', label: 'Jelovnici', group: 'plan' },
  { id: 'tjedni', icon: '📅', label: 'Tjedni i nabava', short: 'Tjedni', group: 'plan' },
  { id: 'namirnice', icon: '🍎', label: 'Namirnice', short: 'Hrana', group: 'podaci' },
  { id: 'osobe', icon: '👨‍👩‍👧', label: 'Obitelj i ciljevi', short: 'Obitelj', group: 'podaci' },
  { id: 'postavke', icon: '⚙️', label: 'Postavke', short: 'Više', group: 'podaci' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [tab, setTab] = useState<TabId>('dnevnik')
  const saveError = useAppStore((s) => s.saveError)
  const migratedFrom = useAppStore((s) => s.migratedFrom)
  const dismiss = useAppStore((s) => s.dismissMigrationNotice)

  /**
   * Prijelaz izmedu kartica preko View Transitions API-ja gdje postoji.
   * Ondje gdje ga nema (Safari, stariji preglednici) mijenja se odmah — pa se
   * na tome nista ne lomi, samo izostane animacija.
   */
  const switchTab = (id: TabId) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (typeof doc.startViewTransition === 'function')
      doc.startViewTransition(() => flushSync(() => setTab(id)))
    else setTab(id)
  }

  return (
    <>
      <HeaderBar />

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
          {TABS.map((t, i) => (
            <Fragment key={t.id}>
              {/* Razdjelnik samo izmedu skupina; aria ga ne vidi da ne razbije tablist. */}
              {i > 0 && TABS[i - 1]!.group !== t.group && (
                <span className="tab-razdjelnik" role="presentation" aria-hidden="true" />
              )}
              <button
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => switchTab(t.id)}
              >
                <span className="tab-icon" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="tab-label">{t.label}</span>
                <span className="tab-short">{'short' in t ? t.short : t.label}</span>
              </button>
            </Fragment>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'dnevnik' && <Dnevnik />}
          {tab === 'tjedni' && <Tjedni />}
          {tab === 'jelovnik' && <Jelovnik />}
          {tab === 'napredak' && <Napredak />}
          {tab === 'osobe' && <Osobe />}
          {tab === 'namirnice' && <Namirnice />}
          {tab === 'postavke' && <Postavke />}
        </div>
      </div>

      <Dialogs />
    </>
  )
}

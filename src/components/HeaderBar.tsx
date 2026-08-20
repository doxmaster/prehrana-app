import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { confirmDialog, promptDialog, toast } from '../store/dialogs'
import { newPerson, useAppStore, usePeople } from '../store/useAppStore'
import { useGoogleObitelj } from '../store/googleObitelj'
import { uid } from '../domain/id'

/**
 * Zaglavlje s onim sto vrijedi na svim karticama: tko je odabran, za koje
 * kucanstvo se racuna i kakva je tema.
 *
 * Upravljanje osobama (nova, preimenuj, obrisi) stoji ovdje, a ne u kartici,
 * jer je odabir osobe globalan — mijenja ciljeve, ocjene namirnica i porcije
 * svugdje, pa mu je mjesto uz sam odabir.
 */
export function HeaderBar() {
  return (
    <header>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <Leaf />
        </span>
        <div>
          <h1>Prehrana</h1>
          <p>Jelovnici, dnevnik i praćenje hranjivih tvari</p>
        </div>
      </div>

      <div className="row header-tools">
        <HouseholdMenu />
        <PersonMenu />
        <ObiteljGoogle />
        <ThemeToggle />
      </div>
    </header>
  )
}

/** Znak aplikacije — nacrtan, da ne ovisi o vanjskoj datoteci. */
function Leaf() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" role="img" aria-label="Prehrana">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#c7f9dd" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M26 5C13 5 6 11 6 20c0 3 1 5 2 7 1-9 7-14 15-16-6 3-10 8-12 16 10 1 17-5 17-14 0-3-1-6-2-8Z"
        fill="url(#lg)"
      />
    </svg>
  )
}

/**
 * Prijava i uskladivanje uz sam odabir osobe.
 *
 * Stoji ovdje, a ne samo u Postavkama, jer je to svakodnevna radnja i tice se
 * upravo onoga sto je pokraj njega: TKO si. Dok nije podeseno, gumb ne nudi
 * prijavu koja bi svejedno pukla nego kaze gdje se podesava.
 */
function ObiteljGoogle() {
  const { tko, radi, postavke, prijava, sinkroniziraj, odjava } = useGoogleObitelj()
  const podesen = postavke.clientId.length > 0

  if (!podesen) {
    return (
      <Popover label={<>☁ Uređaji</>} title="Podaci na više uređaja">
        {() => (
          <>
            <div className="pop-title">Podaci na više uređaja</div>
            <p className="muted small" style={{ margin: '0 0 8px' }}>
              Još nije podešeno. Otvori <b>Postavke → Obitelj na više uređaja</b> i upiši dva Google
              ključa — nakon toga se prijava radi odavde.
            </p>
            <p className="muted small" style={{ margin: 0 }}>
              Dok toga nema, ovaj uređaj radi sam za sebe i podaci ostaju samo na njemu.
            </p>
          </>
        )}
      </Popover>
    )
  }

  if (!tko) {
    return (
      <button
        className="chip"
        disabled={radi}
        onClick={() => void prijava()}
        title="Prijava Google računom"
      >
        <GoogleZnak />
        <span>{radi ? 'Prijava…' : 'Prijavi se'}</span>
      </button>
    )
  }

  return (
    <Popover
      label={
        <>
          {tko.slika ? (
            <img src={tko.slika} alt="" width={18} height={18} style={{ borderRadius: '50%' }} />
          ) : (
            <GoogleZnak />
          )}
          <span>{tko.ime.split(' ')[0]}</span>
        </>
      }
      title="Google račun obitelji"
    >
      {(close) => (
        <>
          <div className="pop-title">{tko.ime}</div>
          <p className="muted small" style={{ margin: '0 0 8px' }}>
            {tko.email}
          </p>
          <button
            className="pop-item"
            disabled={radi}
            onClick={() => {
              close()
              void sinkroniziraj()
            }}
          >
            ⟳ Uskladi s obitelji
          </button>
          <button
            className="pop-item"
            onClick={() => {
              close()
              odjava()
            }}
          >
            ⎋ Odjava
          </button>
          <p className="muted small" style={{ margin: '8px 0 0' }}>
            Pozivanje ukućana i pridruživanje su u <b>Postavkama</b>.
          </p>
        </>
      )}
    </Popover>
  )
}

/** Googleov znak u boji — prepoznatljiv i bez teksta. */
function GoogleZnak() {
  return (
    <svg viewBox="0 0 48 48" width="16" height="16" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45 24c0-1.6-.1-2.7-.4-4H24v7.5h12c-.2 2-1.5 5-4.4 7l6.7 5.2C42.2 36 45 30.6 45 24Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.4C29.7 36.6 27.1 37.5 24 37.5c-5.8 0-10.7-3.9-12.5-9.1l-7.1 5.5C8 41 15.4 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.5 28.4c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4l-7.1-5.5C2.9 17 2 20.4 2 24s.9 7 2.4 9.9l7.1-5.5Z"
      />
      <path
        fill="#EA4335"
        d="M24 10.5c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4.3 29.9 2 24 2 15.4 2 8 7 4.4 14.1l7.1 5.5C13.3 14.4 18.2 10.5 24 10.5Z"
      />
    </svg>
  )
}

/** Skocni izbornik koji se zatvara klikom izvan i tipkom Esc. */
function Popover({
  label,
  title,
  children,
}: {
  label: React.ReactNode
  title: string
  children: (close: () => void) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  /**
   * Izbornik se poravnava po LIJEVOM rubu pilule — ondje gdje je klik i pao.
   * Prebacuje se na desni rub samo kad bi inace izasao iz zaslona, sto se
   * dogada pilulama uz sam desni rub zaglavlja.
   */
  const [alignRight, setAlignRight] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !panel.current || !box.current) return
    // Mjeri se dok je jos poravnat lijevo; prelijevanje se vidi odmah.
    const chip = box.current.getBoundingClientRect()
    const width = panel.current.offsetWidth
    setAlignRight(chip.left + width > window.innerWidth - 8)
  }, [open])

  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="pop" ref={box}>
      <button
        className="chip"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={title}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <span className={`caret${open ? ' up' : ''}`} aria-hidden="true">
          ⌄
        </span>
      </button>
      {open && (
        <div className={`pop-panel${alignRight ? ' right' : ''}`} role="menu" ref={panel}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

function PersonMenu() {
  const people = usePeople()
  const activeId = useAppStore((s) => s.data.activeProfileId)
  const update = useAppStore((s) => s.update)
  const active = people.find((p) => p.id === activeId)
  const initial = (active?.name ?? '?').trim().charAt(0).toUpperCase()

  return (
    <Popover
      title="Odabir osobe"
      label={
        <>
          <span className="avatar" aria-hidden="true">
            {initial}
          </span>
          <span className="chip-text">{active?.name ?? 'Osoba'}</span>
        </>
      }
    >
      {(close) => (
        <>
          <div className="pop-title">Osoba</div>
          {people.map((p) => (
            <button
              key={p.id}
              className={`pop-item${p.id === activeId ? ' on' : ''}`}
              role="menuitemradio"
              aria-checked={p.id === activeId}
              onClick={() => {
                update((draft) => void (draft.activeProfileId = p.id))
                close()
              }}
            >
              <span className="avatar sm" aria-hidden="true">
                {p.name.trim().charAt(0).toUpperCase()}
              </span>
              {p.name}
              {p.id === activeId && <span className="pop-check">✓</span>}
            </button>
          ))}

          <div className="pop-sep" />

          <button
            className="pop-item"
            role="menuitem"
            onClick={async () => {
              close()
              const name = await promptDialog('Ime nove osobe:', '')
              if (!name?.trim()) return
              const created = newPerson(name.trim())
              update((draft) => {
                draft.profiles.push(created)
                draft.activeProfileId = created.id
              })
              toast(`Dodana osoba: ${created.name}`)
            }}
          >
            ＋ Nova osoba
          </button>
          <button
            className="pop-item"
            role="menuitem"
            onClick={async () => {
              close()
              if (!active) return
              const name = await promptDialog('Novo ime:', active.name)
              if (!name?.trim()) return
              update((draft) => {
                const target = draft.profiles.find((p) => p.id === active.id)
                if (target) target.name = name.trim()
              })
            }}
          >
            ✎ Preimenuj
          </button>
          <button
            className="pop-item danger"
            role="menuitem"
            onClick={async () => {
              close()
              if (!active) return
              if (people.length <= 1) return toast('Mora postojati barem jedna osoba.')
              if (
                !(await confirmDialog(
                  `Obrisati osobu "${active.name}" i sve njene podatke?`,
                  'Obriši',
                ))
              )
                return
              update((draft) => {
                draft.profiles = draft.profiles.filter((p) => p.id !== active.id)
                draft.activeProfileId = draft.profiles[0]!.id
                // Bez ovoga id obrisane osobe ostaje u kucanstvu do sljedeceg
                // ucitavanja, pa se u podacima nose clanovi kojih nema.
                for (const household of draft.households) {
                  household.memberIds = household.memberIds.filter((id) => id !== active.id)
                }
              })
              toast('Osoba obrisana.')
            }}
          >
            🗑 Obriši osobu
          </button>
        </>
      )}
    </Popover>
  )
}

function HouseholdMenu() {
  const households = useAppStore((s) => s.data.households)
  const update = useAppStore((s) => s.update)
  const activeId = useAppStore((s) => s.activeHouseholdId)
  const setActiveId = useAppStore((s) => s.setActiveHouseholdId)
  const activeWeekId = useAppStore((s) => s.activeWeekId)

  const active = households.find((h) => h.id === activeId) ?? households[0]

  /**
   * Odabir vrijedi i za otvoreni tjedan — inace bi nabava i dalje racunala
   * po starom kucanstvu, a u zaglavlju bi pisalo drugo.
   */
  const choose = (id: string) => {
    setActiveId(id)
    update((draft) => {
      const week = draft.weeks.find((w) => w.id === activeWeekId)
      if (week) week.householdId = id
    })
  }

  return (
    <Popover
      title="Odabir kućanstva"
      label={
        <>
          <span aria-hidden="true">🏠</span>
          <span className="chip-text">{active?.name ?? 'Kućanstvo'}</span>
          <span className="chip-sub">{active ? `${active.memberIds.length}` : ''}</span>
        </>
      }
    >
      {(close) => (
        <>
          <div className="pop-title">Kućanstvo</div>
          {households.map((h) => (
            <button
              key={h.id}
              className={`pop-item${h.id === active?.id ? ' on' : ''}`}
              role="menuitemradio"
              aria-checked={h.id === active?.id}
              onClick={() => {
                choose(h.id)
                close()
              }}
            >
              🏠 {h.name}
              <span className="chip-sub">{h.memberIds.length} čl.</span>
              {h.id === active?.id && <span className="pop-check">✓</span>}
            </button>
          ))}

          <div className="pop-sep" />

          <button
            className="pop-item"
            role="menuitem"
            onClick={async () => {
              close()
              const name = await promptDialog('Naziv kućanstva:', 'Obitelj')
              if (!name?.trim()) return
              const id = uid('h')
              update((draft) => {
                draft.households.push({ id, name: name.trim(), memberIds: [] })
              })
              setActiveId(id)
              toast('Kućanstvo dodano — članove odaberi u kartici Obitelj i ciljevi.')
            }}
          >
            ＋ Novo kućanstvo
          </button>
          <button
            className="pop-item"
            role="menuitem"
            onClick={async () => {
              close()
              if (!active) return
              const name = await promptDialog('Novi naziv:', active.name)
              if (!name?.trim()) return
              update((draft) => {
                const target = draft.households.find((h) => h.id === active.id)
                if (target) target.name = name.trim()
              })
            }}
          >
            ✎ Preimenuj
          </button>
          <button
            className="pop-item danger"
            role="menuitem"
            onClick={async () => {
              close()
              if (!active) return
              if (households.length <= 1) return toast('Mora postojati barem jedno kućanstvo.')
              if (!(await confirmDialog(`Obrisati kućanstvo "${active.name}"?`, 'Obriši'))) return
              update((draft) => {
                draft.households = draft.households.filter((h) => h.id !== active.id)
                // Tjedni koji su ga koristili ostaju, ali bez dodjele.
                for (const week of draft.weeks) {
                  if (week.householdId === active.id) delete week.householdId
                }
              })
              setActiveId(households.find((h) => h.id !== active.id)?.id ?? null)
              toast('Kućanstvo obrisano.')
            }}
          >
            🗑 Obriši kućanstvo
          </button>
        </>
      )}
    </Popover>
  )
}

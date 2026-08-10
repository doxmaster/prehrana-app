import { useMemo } from 'react'
import { WEEKDAY_NAMES } from '../../domain/types'
import { WEEK_LENGTH, emptyWeekDays, weekDescription, weekShoppingList, weekSummary } from '../../domain/weeks'
import { NO_REPEAT_WEEKS, generateWeek } from '../../domain/generateWeek'
import { householdFactor, memberShares } from '../../domain/household'
import { mealsTotals } from '../../domain/nutrients'
import { computeTargets } from '../../domain/targets'
import { uid } from '../../domain/id'
import { confirmDialog, promptDialog, toast } from '../../store/dialogs'
import { downloadBlob } from '../../store/storage'
import { useAppStore, useFoods, useUpdate } from '../../store/useAppStore'
import { NutrientBars } from '../NutrientBars'
import { fmt } from '../../lib/format'
import type { Menu, WeekPlan } from '../../domain/types'

const menuTitle = (menu: Menu | undefined, index: number) =>
  menu?.title?.trim() ? menu.title : `Jelovnik ${index + 1}`

export function Tjedni() {
  const foods = useFoods()
  const update = useUpdate()
  const state = useAppStore((s) => s.data)
  const activeWeekId = useAppStore((s) => s.activeWeekId)
  const setActiveWeekId = useAppStore((s) => s.setActiveWeekId)

  const week = state.weeks.find((w) => w.id === activeWeekId) ?? state.weeks[0]
  const household =
    state.households.find((h) => h.id === week?.householdId) ?? state.households[0]

  const factor = household ? householdFactor(household, state.profiles) : 1
  const shares = useMemo(
    () => (household ? memberShares(household, state.profiles) : []),
    [household, state.profiles],
  )

  const summary = useMemo(
    () => (week ? weekSummary(week, state.menus, foods) : null),
    [week, state.menus, foods],
  )

  const shopping = useMemo(
    () => (week ? weekShoppingList(week, state.menus, foods, state.recipes, factor) : {}),
    [week, state.menus, foods, state.recipes, factor],
  )

  /** Cilj kucanstva je zbroj dnevnih ciljeva clanova. */
  const householdTargets = useMemo(() => {
    const base = computeTargets(state.profiles[0]?.profile ?? { sex: 'm', age: 30, act: 1.55, weight: 75, height: 178, goal: 0 })
    if (!shares.length) return base
    const scaled = { ...base }
    for (const key of Object.keys(base) as (keyof typeof base)[]) {
      scaled[key] = base[key] * factor
    }
    return scaled
  }, [shares, factor, state.profiles])

  const editWeek = (mutate: (draft: WeekPlan) => void) => {
    if (!week) return
    update((draft) => {
      const target = draft.weeks.find((w) => w.id === week.id)
      if (target) mutate(target)
    })
  }

  if (!week) {
    return (
      <div className="card">
        <h2>Tjedni jelovnici</h2>
        <p className="muted small">Još nema nijednog tjedna.</p>
        <button
          className="btn"
          onClick={() =>
            update((draft) => {
              const created: WeekPlan = { id: uid('wk'), title: 'Novi tjedan', days: emptyWeekDays() }
              draft.weeks.push(created)
              setActiveWeekId(created.id)
            })
          }
        >
          + Novi tjedan
        </button>
      </div>
    )
  }

  const totalShoppingLines = Object.values(shopping).flat().length

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="row">
            <label htmlFor="week-sel" style={{ margin: 0 }}>
              Tjedan:
            </label>
            <select
              id="week-sel"
              style={{ width: 'auto', maxWidth: 320 }}
              value={week.id}
              onChange={(e) => setActiveWeekId(e.target.value)}
            >
              {state.weeks.map((w) => (
                <option value={w.id} key={w.id}>
                  {w.title ?? 'Tjedan'}
                  {w.season ? ` (${w.season})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <button
              className="btn small"
              onClick={() =>
                update((draft) => {
                  const created: WeekPlan = {
                    id: uid('wk'),
                    title: `Tjedan ${draft.weeks.length + 1}`,
                    days: emptyWeekDays(),
                  }
                  draft.weeks.push(created)
                  setActiveWeekId(created.id)
                })
              }
            >
              + Novi
            </button>
            <button
              className="btn small"
              title="Automatski rasporedi jelovnike po danima"
              onClick={() => {
                // Ostali tjedni, od najnovijeg — iz njih se cita sto se ne smije ponoviti.
                const others = state.weeks.filter((w) => w.id !== week.id).reverse()
                const result = generateWeek(state.menus, { recentWeeks: others })
                update((draft) => {
                  const target = draft.weeks.find((w) => w.id === week.id)
                  if (target) target.days = result.days
                })
                toast(
                  result.note ??
                    `Tjedan složen — ${WEEK_LENGTH} dana bez ponavljanja iz zadnja ${NO_REPEAT_WEEKS} tjedna.`,
                )
              }}
            >
              🎲 Složi tjedan
            </button>
            <button
              className="btn secondary small"
              onClick={() =>
                update((draft) => {
                  const copy: WeekPlan = {
                    ...structuredClone(week),
                    id: uid('wk'),
                    title: `${week.title ?? 'Tjedan'} (kopija)`,
                  }
                  delete copy.season
                  draft.weeks.push(copy)
                  setActiveWeekId(copy.id)
                  toast('Tjedan kopiran — sad ga možeš mijenjati.')
                })
              }
            >
              ⧉ Kopiraj
            </button>
            <button
              className="btn secondary small"
              onClick={async () => {
                const title = await promptDialog('Naziv tjedna:', week.title ?? '')
                if (title === null) return
                editWeek((draft) => {
                  if (title.trim()) draft.title = title.trim()
                  else delete draft.title
                })
              }}
            >
              ✎ Naziv
            </button>
            <button
              className="btn danger small"
              onClick={async () => {
                if (!(await confirmDialog(`Obrisati ${week.title ?? 'tjedan'}?`, 'Obriši'))) return
                update((draft) => {
                  draft.weeks = draft.weeks.filter((w) => w.id !== week.id)
                  setActiveWeekId(draft.weeks[0]?.id ?? null)
                })
              }}
            >
              Obriši
            </button>
          </div>
        </div>

        <div className="small muted">{weekDescription(week, state.menus)}</div>

        <div className="row" style={{ marginTop: 12 }}>
          <label htmlFor="week-household" style={{ margin: 0 }}>
            Kućanstvo:
          </label>
          <select
            id="week-household"
            style={{ width: 'auto' }}
            value={household?.id ?? ''}
            onChange={(e) => editWeek((draft) => void (draft.householdId = e.target.value))}
          >
            {state.households.map((h) => (
              <option value={h.id} key={h.id}>
                {h.name} ({h.memberIds.length})
              </option>
            ))}
          </select>
          <span className="small muted">
            udio {fmt(factor, 2)} × porcija za jednu odraslu osobu
          </span>
        </div>

        {shares.length > 0 && (
          <div className="catlegend" style={{ marginTop: 6 }}>
            {shares.map((s) => (
              <span key={s.person.id}>
                {s.person.name}: <b>{fmt(s.factor, 2)}</b>
                {s.manual ? ' (ručno)' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Raspored po danima</h2>
        <p className="muted small" style={{ margin: '-6px 0 10px' }}>
          Svaki dan dobiva jedan jelovnik iz knjižnice. Izmjena jelovnika odražava se na sve tjedne
          koji ga koriste.
        </p>
        {WEEKDAY_NAMES.map((dayName, index) => {
          const assignedId = week.days[index] ?? ''
          const menuIndex = state.menus.findIndex((m) => m.id === assignedId)
          const menu = state.menus[menuIndex]
          const kcal = menu ? mealsTotals(menu.meals, foods).kcal : 0
          return (
            <div className="row" key={dayName} style={{ padding: '4px 0', gap: 8 }}>
              <label htmlFor={`day-${index}`} style={{ margin: 0, minWidth: 100, fontWeight: 600 }}>
                {dayName}
              </label>
              <select
                id={`day-${index}`}
                style={{ width: 'auto', minWidth: 220, flex: 1 }}
                value={assignedId}
                onChange={(e) =>
                  editWeek((draft) => {
                    draft.days[index] = e.target.value || null
                  })
                }
              >
                <option value="">— slobodan dan —</option>
                {state.menus.map((m, i) => (
                  <option value={m.id} key={m.id}>
                    {menuTitle(m, i)}
                  </option>
                ))}
              </select>
              <span className="small muted" style={{ minWidth: 90, textAlign: 'right' }}>
                {menu ? `${fmt(kcal)} kcal` : ''}
              </span>
            </div>
          )
        })}

        {summary && summary.brokenDays.length > 0 && (
          <div className="banner warn" style={{ marginTop: 10, marginBottom: 0 }}>
            ⚠ Dani {summary.brokenDays.map((i) => WEEKDAY_NAMES[i]).join(', ')} pokazuju na jelovnik
            kojeg više nema.
          </div>
        )}
      </div>

      {summary && (
        <div className="card">
          <h2>Tjedni pregled</h2>
          <div className="flexsplit">
            <div>
              <div className="kcalbig">
                <span className="kcal-c">{fmt(summary.average.kcal)}</span>{' '}
                <span className="muted" style={{ fontSize: 14 }}>
                  kcal/dan po osobi
                </span>
              </div>
              <div className="small muted">
                {summary.plannedDays} {summary.plannedDays === 1 ? 'planiran dan' : 'planiranih dana'}{' '}
                · ukupno {fmt(summary.total.kcal)} kcal
              </div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 650 }}>
                👨‍👩‍👧 {fmt(summary.total.kcal * factor)} kcal
              </div>
              <div className="small muted">za cijelo kućanstvo kroz tjedan</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <NutrientBars totals={summary.average} targets={householdTargets} />
          </div>
          <p className="hint">
            Trake uspoređuju dnevni prosjek po osobi s ciljem prve osobe u kućanstvu — za pojedinačne
            ciljeve pogledaj karticu Osobe.
          </p>
        </div>
      )}

      <div className="card">
        <div className="flexsplit">
          <h2 style={{ margin: 0 }}>🛒 Nabava za tjedan</h2>
          <button
            className="btn secondary small"
            disabled={totalShoppingLines === 0}
            onClick={() => {
              let csv = 'Kategorija;Namirnica;Količina\n'
              for (const [cat, lines] of Object.entries(shopping))
                for (const line of lines)
                  csv += `${cat};${line.name.replace(/;/g, ',')};${line.grams} ${line.unit}\n`
              downloadBlob(
                new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }),
                'nabava-tjedan.csv',
              )
              toast('CSV preuzet.')
            }}
          >
            ⬇ Excel (CSV)
          </button>
        </div>
        <p className="muted small" style={{ margin: '2px 0 8px' }}>
          Količine su za {household?.name ?? 'kućanstvo'} ({shares.length}{' '}
          {shares.length === 1 ? 'član' : 'članova'}, udio {fmt(factor, 2)}). Jela iz recepata
          razložena su na sastojke.
        </p>

        {totalShoppingLines === 0 ? (
          <p className="muted small">Dodijeli jelovnike danima da bi se popis popunio.</p>
        ) : (
          Object.entries(shopping)
            .sort(([a], [b]) => a.localeCompare(b, 'hr'))
            .map(([cat, lines]) => (
              <div key={cat}>
                <h3 style={{ margin: '12px 0 4px', color: 'var(--accent-d)', fontSize: 12 }}>{cat}</h3>
                <ul style={{ margin: '2px 0 8px', paddingLeft: 20 }}>
                  {lines.map((line) => (
                    <li key={line.name} style={{ fontSize: 13 }}>
                      {line.name} —{' '}
                      <b>
                        {line.grams >= 1000
                          ? `${fmt(line.grams / 1000, 2)} ${line.unit === 'ml' ? 'L' : 'kg'}`
                          : `${fmt(line.grams)} ${line.unit}`}
                      </b>
                    </li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </div>
    </>
  )
}

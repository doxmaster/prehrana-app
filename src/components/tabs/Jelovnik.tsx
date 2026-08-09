import { useMemo, useState } from 'react'
import { MEALS } from '../../domain/constants'
import { emptyMeals, foodUnit, isEmptyMeals, itemName, mealsFluid, mealsTotals, sumItems } from '../../domain/nutrients'
import { targetsFor } from '../../domain/targets'
import { isFoodRef } from '../../domain/types'
import { uid } from '../../domain/id'
import { confirmDialog, promptDialog, toast } from '../../store/dialogs'
import { useActivePerson, useAppStore, useFoods, useUpdate } from '../../store/useAppStore'
import { MealEditor } from '../MealEditor'
import { NutrientBars } from '../NutrientBars'
import { downloadBlob } from '../../store/storage'
import { fmt } from '../../lib/format'
import { todayISO } from '../../domain/dates'
import type { DayMeals, Menu } from '../../domain/types'

export function Jelovnik() {
  const foods = useFoods()
  const update = useUpdate()
  const person = useActivePerson()
  const menus = useAppStore((s) => s.data.menus)
  const index = useAppStore((s) => s.activeMenuIndex)
  const setIndex = useAppStore((s) => s.setActiveMenuIndex)

  const safeIndex = Math.min(index, menus.length - 1)
  const menu = menus[safeIndex]
  const [selection, setSelection] = useState<Record<string, number>>({})

  const title = (m: Menu, i: number) => (m.title?.trim() ? m.title : `Jelovnik ${i + 1}`)

  const description = (m: Menu) => {
    if (m.desc?.trim()) return m.desc
    const names: string[] = []
    for (const meal of m.meals)
      for (const item of meal) {
        const n = itemName(item, foods)
        if (!names.includes(n)) names.push(n)
      }
    if (!names.length) return 'prazan jelovnik'
    return names.slice(0, 5).join(', ') + (names.length > 5 ? '…' : '')
  }

  const meals: DayMeals = menu?.meals ?? emptyMeals()
  const totals = mealsTotals(meals, foods)
  const targets = targetsFor(person, todayISO())

  const editMeals = (mutate: (draft: DayMeals) => void) => {
    update((draft) => {
      const target = draft.menus[safeIndex]
      if (target) mutate(target.meals)
    })
  }

  /** Zbroj namirnica preko odabranih jelovnika i broja ponavljanja. */
  const shopping = useMemo(() => {
    const totalsByName: Record<string, { grams: number; cat: string }> = {}
    for (const m of menus) {
      const times = selection[m.id] ?? 0
      if (times <= 0) continue
      for (const meal of m.meals)
        for (const item of meal) {
          const name = itemName(item, foods)
          const cat = isFoodRef(item) ? (foods.byId(item.foodId)?.cat ?? 'Ostalo') : (item.cat ?? 'Ostalo')
          const entry = (totalsByName[name] ??= { grams: 0, cat })
          entry.grams += item.g * times
        }
    }
    const byCat: Record<string, Array<{ name: string; grams: number; unit: string }>> = {}
    for (const [name, { grams, cat }] of Object.entries(totalsByName)) {
      ;(byCat[cat] ??= []).push({ name, grams: Math.round(grams), unit: foodUnit(cat, name) })
    }
    for (const list of Object.values(byCat)) list.sort((a, b) => a.name.localeCompare(b.name, 'hr'))
    return byCat
  }, [menus, selection, foods])

  const hasShopping = Object.keys(shopping).length > 0

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="row">
            <label htmlFor="menu-sel" style={{ margin: 0 }}>
              Jelovnik:
            </label>
            <select
              id="menu-sel"
              style={{ width: 'auto', maxWidth: 320 }}
              value={safeIndex}
              onChange={(e) => setIndex(Number(e.target.value))}
            >
              {menus.map((m, i) => (
                <option value={i} key={m.id}>
                  {title(m, i)} — {description(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <button
              className="btn small"
              onClick={() =>
                update((draft) => {
                  draft.menus.push({ id: uid('mn'), meals: emptyMeals() })
                  setIndex(draft.menus.length - 1)
                })
              }
            >
              + Novi
            </button>
            <button
              className="btn secondary small"
              onClick={async () => {
                if (!menu) return
                const t = await promptDialog('Naziv jelovnika (prazno = automatski):', menu.title ?? '')
                if (t === null) return
                const d = await promptDialog('Kratki opis (prazno = automatski):', menu.desc ?? '')
                update((draft) => {
                  const target = draft.menus[safeIndex]
                  if (!target) return
                  if (t.trim()) target.title = t.trim()
                  else delete target.title
                  if (d?.trim()) target.desc = d.trim()
                  else delete target.desc
                })
              }}
            >
              ✎ Naziv / opis
            </button>
            <button
              className="btn danger small"
              onClick={async () => {
                if (menus.length <= 1) return toast('Mora postojati barem jedan jelovnik.')
                if (!menu) return
                if (!(await confirmDialog(`Obrisati ${title(menu, safeIndex)}?`, 'Obriši'))) return
                update((draft) => {
                  draft.menus.splice(safeIndex, 1)
                })
                setIndex(Math.max(0, safeIndex - 1))
              }}
            >
              Obriši
            </button>
          </div>
        </div>

        {menu && (
          <>
            <h2 style={{ margin: 0 }}>{title(menu, safeIndex)}</h2>
            <div className="small muted">{description(menu)}</div>
            <div className="small" style={{ marginTop: 10, lineHeight: 1.7 }}>
              {isEmptyMeals(meals) ? (
                <span className="muted">Nema unesenih namirnica u ovom jelovniku.</span>
              ) : (
                MEALS.map((name, i) => {
                  const items = meals[i] ?? []
                  if (!items.length) return null
                  return (
                    <div key={name} style={{ marginBottom: 3 }}>
                      <b>{name}</b>{' '}
                      <span className="kcal-c">{fmt(sumItems(items, foods).kcal)} kcal</span>:{' '}
                      {items.map((item, j) => (
                        <span key={j}>
                          {j > 0 && ', '}
                          {itemName(item, foods)}{' '}
                          <span className="muted">
                            {fmt(item.g)} {foodUnit('', itemName(item, foods))}
                          </span>
                        </span>
                      ))}
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>Sastav jelovnika</h2>
        <MealEditor meals={meals} onChange={editMeals} />
      </div>

      <div className="card">
        <h2>Pregled — {menu ? title(menu, safeIndex) : ''}</h2>
        <div className="flexsplit">
          <div>
            <div className="kcalbig">
              <span className="kcal-c">{fmt(totals.kcal)}</span>{' '}
              <span className="muted" style={{ fontSize: 14 }}>
                / {fmt(targets.kcal)} kcal
              </span>
            </div>
            <div className="small muted">planirano za cijeli jelovnik</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>
              💧 {fmt(mealsFluid(meals, foods), 1)} / {fmt(targets.water, 1)} L
            </div>
            <div className="small muted">tekućina (pića)</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <NutrientBars totals={totals} targets={targets} />
        </div>
      </div>

      <div className="card">
        <div className="flexsplit">
          <h2 style={{ margin: 0 }}>🛒 Popis za kupovinu</h2>
          <button
            className="btn secondary small"
            disabled={!hasShopping}
            onClick={() => {
              let csv = 'Kategorija;Namirnica;Količina\n'
              for (const [cat, items] of Object.entries(shopping))
                for (const it of items)
                  csv += `${cat};${it.name.replace(/;/g, ',')};${it.grams} ${it.unit}\n`
              downloadBlob(
                new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }),
                'popis-za-kupovinu.csv',
              )
              toast('CSV preuzet.')
            }}
          >
            ⬇ Excel (CSV)
          </button>
        </div>
        <p className="muted small" style={{ margin: '2px 0 8px' }}>
          Odaberi jelovnike i koliko puta ih planiraš (npr. za tjedan dana):
        </p>
        {menus.map((m, i) => (
          <div className="row" key={m.id} style={{ gap: 6, padding: '2px 0' }}>
            <label className="row" style={{ gap: 6, fontWeight: 600, margin: 0 }}>
              <input
                type="checkbox"
                style={{ width: 'auto' }}
                checked={(selection[m.id] ?? 0) > 0}
                onChange={(e) =>
                  setSelection((prev) => ({ ...prev, [m.id]: e.target.checked ? 1 : 0 }))
                }
              />
              {title(m, i)}
            </label>
            <input
              type="number"
              min="1"
              style={{ width: 60, padding: '4px 6px' }}
              aria-label={`Broj ponavljanja za ${title(m, i)}`}
              disabled={(selection[m.id] ?? 0) <= 0}
              value={selection[m.id] || 1}
              onChange={(e) =>
                setSelection((prev) => ({ ...prev, [m.id]: Math.max(1, Number(e.target.value) || 1) }))
              }
            />
          </div>
        ))}

        <div style={{ marginTop: 10 }}>
          {!hasShopping ? (
            <p className="muted small">Odaberi jelovnik s namirnicama iznad.</p>
          ) : (
            Object.entries(shopping)
              .sort(([a], [b]) => a.localeCompare(b, 'hr'))
              .map(([cat, items]) => (
                <div key={cat}>
                  <h3 style={{ margin: '12px 0 4px', color: 'var(--accent-d)', fontSize: 12 }}>{cat}</h3>
                  <ul style={{ margin: '2px 0 8px', paddingLeft: 20 }}>
                    {items.map((it) => (
                      <li key={it.name} style={{ fontSize: 13 }}>
                        {it.name} — <b>{fmt(it.grams)} {it.unit}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          )}
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'
import { confirmDay, confirmMeal, dayStatus, mealMatches, weekAppliedTo } from '../domain/plan'
import { mealsTotals, sumItems } from '../domain/nutrients'
import { fmtDate, mondayOf } from '../domain/dates'
import { uid } from '../domain/id'
import { confirmDialog, toast } from '../store/dialogs'
import { useActivePerson, useAppStore, useFoods } from '../store/useAppStore'
import { fmt } from '../lib/format'
import type { PlanZaDan } from '../hooks/usePlanZaDan'
import type { DayMeals, MealItem } from '../domain/types'

interface ZaglavljeProps {
  date: string
  plan: PlanZaDan
  meals: DayMeals
  onChange: (mutate: (meals: DayMeals) => void) => void
}

/**
 * Jedan redak nad popisom obroka: sto tjedan predvida za taj dan i gumb koji
 * cijeli dan upisuje odjednom. Namjerno nije kartica — kartica je i bila
 * razlog zbog kojeg je izgledalo kao drugi popis obroka.
 */
export function PlanZaglavlje({ date, plan, meals, onChange }: ZaglavljeProps) {
  const foods = useFoods()
  const undo = useAppStore((s) => s.undo)
  const person = useActivePerson()

  if (plan.slobodanDan || !plan.meals) {
    return (
      <p className="muted small" style={{ margin: '-4px 0 10px' }}>
        {plan.naslovTjedna} ovaj dan ostavlja slobodnim — upiši što si jeo.
      </p>
    )
  }

  const status = dayStatus(meals, plan.meals)
  const total = mealsTotals(plan.meals, foods)
  const naslov = plan.naslovJelovnika ?? 'Jelovnik'

  if (status === 'potvrdeno') {
    return (
      <p className="muted small" style={{ margin: '-4px 0 10px' }}>
        <span style={{ color: 'var(--good)' }}>✓ Upisano po planu</span> — {naslov} (
        {plan.naslovTjedna})
      </p>
    )
  }

  const upisiDan = async () => {
    /*
     * Potvrda plana PREPISUJE cijeli dan. Kad je u dnevniku vec nesto drugo,
     * to je gubitak podataka — pa se pita prije, a ne samo upozorava sitnim
     * tekstom pokraj gumba.
     */
    if (status === 'izmijenjeno') {
      const ok = await confirmDialog(
        `Dnevnik za ${fmtDate(date)} razlikuje se od plana.\n\n` +
          'Upis briše ono što je upisano i stavlja planirane obroke.',
        'Prepiši dan',
      )
      if (!ok) return
    }
    onChange((draft) => {
      const next = confirmDay(plan.meals!)
      draft.length = 0
      draft.push(...next)
    })
    toast(`Upisano: ${naslov} (${fmt(total.kcal)} kcal).`, { label: '↩ Poništi', run: undo })
  }

  return (
    <div className="plan-redak">
      <span className="muted small" style={{ flex: 1, minWidth: 0 }}>
        <b>Plan za ovaj dan:</b> {naslov} · {fmt(total.kcal)} kcal
        {plan.factor !== 1 && (
          <>
            {' '}
            · količine za {person.name} (udio {fmt(plan.factor, 2)})
          </>
        )}
      </span>
      <button className="btn small" onClick={() => void upisiDan()}>
        ✓ Pojeo sam sve po planu
      </button>
    </div>
  )
}

interface PrijedlogProps {
  name: string
  index: number
  /** Planirane stavke za taj obrok, vec preracunate na udio osobe. */
  items: MealItem[]
  postojeci: MealItem[]
  onChange: (mutate: (meals: DayMeals) => void) => void
}

/**
 * Prijedlog unutar jednog obroka. Nestaje cim se upise, pa se popis nikad ne
 * pojavljuje dvaput.
 */
export function PlanPrijedlog({ name, index, items, postojeci, onChange }: PrijedlogProps) {
  const foods = useFoods()
  const undo = useAppStore((s) => s.undo)

  if (!items.length || mealMatches(postojeci, items)) return null

  const upisi = async () => {
    // Obrok koji vec ima nesto drugo se prepisuje — pita se prije.
    if (postojeci.length) {
      const ok = await confirmDialog(
        `${name} već ima ${postojeci.length} upisanih stavki.\n\nUpis plana ih zamjenjuje.`,
        'Prepiši obrok',
      )
      if (!ok) return
    }
    onChange((draft) => {
      const next = confirmMeal(draft, index, items)
      draft.length = 0
      draft.push(...next)
    })
    toast(`Upisan ${name.toLowerCase()}.`, { label: '↩ Poništi', run: undo })
  }

  return (
    <div className="plan-prijedlog">
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="tag">plan</span>{' '}
        <span className="muted small">
          {items
            .map(
              (item) =>
                `${'foodId' in item ? (foods.byId(item.foodId)?.name ?? '?') : item.name} ${fmt(item.g)} g`,
            )
            .join(', ')}{' '}
          · <span className="kcal-c">{fmt(sumItems(items, foods).kcal)} kcal</span>
        </span>
      </span>
      <button className="btn secondary small" onClick={() => void upisi()}>
        ✓ upiši
      </button>
    </div>
  )
}

/**
 * Sto se vidi kad za taj datum uopce nema tjedna.
 *
 * Ranije se nije vidjelo NISTA, pa je izgledalo kao da tjedni jelovnici s
 * karticom Dnevnik nisu ni povezani. Uzrok je gotovo uvijek isti: tjedan
 * postoji, ali nije vezan uz datum — sezonski tjedni su predlosci. Zato se
 * ovdje nudi upravo to, na jedan klik, umjesto upute da se ode drugdje.
 */
export function BezPlana({ date }: { date: string }) {
  const weeks = useAppStore((s) => s.data.weeks)
  const update = useAppStore((s) => s.update)
  const setActiveWeekId = useAppStore((s) => s.setActiveWeekId)
  const [pick, setPick] = useState(weeks[0]?.id ?? '')

  const monday = mondayOf(date)
  const chosen = weeks.find((w) => w.id === pick) ?? weeks[0]

  if (!weeks.length) {
    return (
      <div className="card">
        <h2>Plan za {fmtDate(date)}</h2>
        <p className="muted small" style={{ margin: 0 }}>
          Još nema nijednog tjednog plana. Složi ga u kartici <b>Tjedni i nabava</b>, pa će se ovdje
          nuditi na upis — obrok po obrok, bez prepisivanja.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Plan za {fmtDate(date)}</h2>
      <p className="muted small" style={{ margin: '-6px 0 10px' }}>
        Za tjedan od <b>{fmtDate(monday)}</b> nije dodijeljen nijedan plan, pa nema što upisati.
        Sezonski tjedni su predlošci — vežu se uz datum tek kad ih primijeniš.
      </p>
      <div className="row">
        <select
          style={{ width: 'auto', maxWidth: 280 }}
          aria-label="Tjedni plan za primjenu"
          value={chosen?.id ?? ''}
          onChange={(e) => setPick(e.target.value)}
        >
          {weeks.map((w) => (
            <option value={w.id} key={w.id}>
              {w.title ?? 'Tjedan'}
              {w.season ? ` (${w.season})` : ''}
              {w.startDate ? ` — od ${fmtDate(w.startDate)}` : ''}
            </option>
          ))}
        </select>
        <button
          className="btn small"
          onClick={() => {
            if (!chosen) return
            const id = uid('wk')
            const title = `${chosen.title ?? 'Tjedan'} — od ${fmtDate(monday)}`
            update((draft) => {
              const source = draft.weeks.find((w) => w.id === chosen.id)
              if (source) draft.weeks.push(weekAppliedTo(source, date, { id, title }))
            })
            setActiveWeekId(id)
            toast(`Primijenjeno na tjedan od ${fmtDate(monday)}.`)
          }}
        >
          Primijeni na ovaj tjedan
        </button>
      </div>
      <p className="hint" style={{ marginBottom: 0 }}>
        Radi se kopija, pa predložak ostaje za sljedeći put. Raspored poslije mijenjaš u kartici
        <b> Tjedni i nabava</b>.
      </p>
    </div>
  )
}

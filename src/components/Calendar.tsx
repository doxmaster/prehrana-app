import { WEEKDAYS_SHORT, monthDates, parseISO, todayISO } from '../domain/dates'
import { fmt } from '../lib/format'

interface Props {
  month: string
  selected: string
  /** Kalorije po danu; dan bez unosa nema ključ. */
  kcalByDate: Record<string, number>
  onPick: (date: string) => void
}

export function Calendar({ month, selected, kcalByDate, onPick }: Props) {
  const dates = monthDates(month)
  const firstDate = dates[0]
  if (!firstDate) return null

  // Tjedan počinje ponedjeljkom, a getDay() vraća nedjelju kao 0.
  const leading = (parseISO(firstDate).getDay() + 6) % 7
  const today = todayISO()

  return (
    <div className="cal">
      {WEEKDAYS_SHORT.map((d) => (
        <div className="cah" key={d}>
          {d}
        </div>
      ))}

      {Array.from({ length: leading }, (_, i) => (
        <div className="cell empty" key={`pad${i}`} aria-hidden="true" />
      ))}

      {dates.map((date) => {
        const kcal = kcalByDate[date] ?? 0
        const day = parseISO(date).getDate()
        return (
          <button
            type="button"
            className={`cell${date === today ? ' today' : ''}`}
            key={date}
            aria-pressed={date === selected}
            aria-label={`${day}. ${kcal ? `${Math.round(kcal)} kcal` : 'bez unosa'}`}
            onClick={() => onPick(date)}
          >
            <div className="dn">{day}</div>
            <div className="kc">{kcal ? `${fmt(kcal)} kcal` : ''}</div>
          </button>
        )
      })}
    </div>
  )
}

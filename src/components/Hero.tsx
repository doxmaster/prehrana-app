import { HERO_ART } from '../data/art'
import { fmtDate, dayName } from '../domain/dates'
import { fmt } from '../lib/format'

interface Props {
  date: string
  name: string
  kcal: number
  target: number
  /** Koliko je obroka dana vec upisano. */
  meals: number
}

/**
 * Baner na vrhu Dnevnika.
 *
 * Slika je izracunata, ne preuzeta (vidi scripts/generate-art.mjs) — pa nema
 * ni mreznog poziva ni tudeg materijala. Preko nje ide samo ono sto se cita u
 * prolazu: koji je dan, tko, i koliko je od dana ispunjeno.
 */
export function Hero({ date, name, kcal, target, meals }: Props) {
  const pct = target > 0 ? Math.min(100, Math.round((kcal / target) * 100)) : 0

  return (
    <div className="hero" style={{ backgroundImage: `url("${HERO_ART}")` }}>
      <div className="hero-shade" />
      <div className="hero-body">
        <div className="hero-day">
          {dayName(date)}, {fmtDate(date)}
        </div>
        <div className="hero-title">
          Dobar dan, <b>{name}</b>
        </div>
        <div className="hero-stats">
          <span className="hero-pill">
            <b>{fmt(kcal)}</b> / {fmt(target)} kcal
          </span>
          <span className="hero-pill">
            <b>{pct}</b> % dnevnog cilja
          </span>
          <span className="hero-pill">
            {meals === 0 ? 'još ništa nije upisano' : `${meals} ${meals === 1 ? 'obrok' : 'obroka'} upisano`}
          </span>
        </div>
      </div>
    </div>
  )
}

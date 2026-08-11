import { useEffect, useRef, useState } from 'react'
import { fmt } from '../lib/format'

/**
 * Broj koji dotrci do vrijednosti umjesto da samo iskoci.
 *
 * Kratko traje i prati istu krivulju kao ostale animacije; smisao je da se
 * vidi DA se promijenilo, ne da se cita dok raste.
 */
function useCountUp(value: number, duration = 650): number {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const raf = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const startValue = from.current
    const delta = value - startValue
    if (delta === 0) return

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // Ista krivulja kao --ease u tokenima.
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(startValue + delta * eased)
      if (t < 1) raf.current = requestAnimationFrame(step)
      else from.current = value
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  return shown
}

interface Props {
  /** Pojedeno danas. */
  value: number
  /** Dnevni cilj. */
  target: number
  /** Procijenjena potrosnja, ako je poznata — crta se kao oznaka na prstenu. */
  spent?: number
}

/**
 * Prsten dnevnih kalorija.
 *
 * Prsten umjesto trake jer se ovdje ne prati napredak prema kraju nego odnos
 * prema cilju: kad se cilj prijede, luk se boji drukcije i nastavlja preko —
 * traka bi u tom trenutku samo stala na 100 % i sakrila prekoracenje.
 */
export function KcalRing({ value, target, spent }: Props) {
  const shown = useCountUp(value)
  const pct = target > 0 ? (value / target) * 100 : 0
  const over = pct > 100
  const arc = Math.min(100, pct)

  const color = over ? 'var(--bad)' : pct >= 80 ? 'var(--good)' : 'var(--kcal)'
  const left = Math.round(target - value)

  return (
    <div className="ring-wrap">
      <div
        className="ring"
        style={{ ['--arc' as string]: `${arc}`, ['--ring-color' as string]: color }}
        role="img"
        aria-label={`${fmt(value)} od ${fmt(target)} kcal`}
      >
        {over && <span className="ring-over" aria-hidden="true" />}
        <div className="ring-mid">
          <div className="ring-val">{fmt(Math.round(shown))}</div>
          <div className="ring-unit">/ {fmt(target)} kcal</div>
        </div>
      </div>

      <div className="ring-side">
        <div className={`ring-line${over ? ' bad' : ''}`}>
          {over ? `${fmt(-left)} kcal iznad cilja` : `Preostalo ${fmt(left)} kcal`}
        </div>
        {spent !== undefined && (
          <div className="muted small">
            Procijenjena potrošnja danas: <b>{fmt(spent)} kcal</b>
          </div>
        )}
      </div>
    </div>
  )
}

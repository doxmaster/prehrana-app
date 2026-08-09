import { NUTRIENTS } from '../domain/constants'
import { fmt } from '../lib/format'
import type { Nutrients, Targets } from '../domain/types'

function barColor(pct: number): string {
  if (pct >= 90) return 'var(--good)'
  if (pct >= 50) return 'var(--warn)'
  return 'var(--bad)'
}

interface Props {
  totals: Nutrients
  targets: Targets
}

/** Napredak po hranjivim tvarima; kalorije se prikazuju odvojeno, iznad. */
export function NutrientBars({ totals, targets }: Props) {
  return (
    <div>
      {NUTRIENTS.filter((n) => n.key !== 'kcal').map((n) => {
        const value = totals[n.key]
        const goal = targets[n.key]
        const pct = goal > 0 ? (value / goal) * 100 : 0
        return (
          <div className="nut" key={n.key}>
            <div className="top">
              <span>{n.label}</span>
              <span className="muted">
                {fmt(value, 1)} / {fmt(goal, 0)} {n.unit} ({Math.round(pct)} %)
              </span>
            </div>
            <div
              className="prog"
              role="progressbar"
              aria-label={n.label}
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div style={{ width: `${Math.min(pct, 100)}%`, background: barColor(pct) }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

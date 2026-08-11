import { NUTRIENTS } from '../domain/constants'
import { fmt } from '../lib/format'
import type { NutrientCap } from '../domain/conditions'
import type { Nutrients, Targets } from '../domain/types'

function barColor(pct: number): string {
  if (pct >= 90) return 'var(--good)'
  if (pct >= 50) return 'var(--warn)'
  return 'var(--bad)'
}

/**
 * Kod gornje granice boje idu obrnuto: prijeci granicu nije uspjeh nego
 * upozorenje. Bez ovoga bi dan s 18 mg zeljeza kod hemokromatoze bio zelen.
 */
function capColor(pct: number): string {
  if (pct > 100) return 'var(--bad)'
  if (pct > 85) return 'var(--warn)'
  return 'var(--good)'
}

interface Props {
  totals: Nutrients
  targets: Targets
  /** Vrijednosti koje su gornja granica, a ne cilj. */
  caps?: readonly NutrientCap[]
}

/** Napredak po hranjivim tvarima; kalorije se prikazuju odvojeno, iznad. */
export function NutrientBars({ totals, targets, caps = [] }: Props) {
  return (
    <div>
      {NUTRIENTS.filter((n) => n.key !== 'kcal').map((n) => {
        const value = totals[n.key]
        const cap = caps.find((c) => c.key === n.key)
        const goal = cap ? cap.max : targets[n.key]
        const pct = goal > 0 ? (value / goal) * 100 : 0
        return (
          <div className="nut" key={n.key}>
            <div className="top">
              <span>
                {n.label}
                {cap && (
                  <span className="muted small" title={cap.why}>
                    {' '}
                    ⛔ granica
                  </span>
                )}
              </span>
              <span className="muted">
                {fmt(value, 1)} / {fmt(goal, 0)} {n.unit} ({Math.round(pct)} %)
              </span>
            </div>
            <div
              className="prog"
              role="progressbar"
              aria-label={cap ? `${n.label} (gornja granica)` : n.label}
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: cap ? capColor(pct) : barColor(pct),
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

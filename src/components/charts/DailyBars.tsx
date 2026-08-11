import { useId, useState } from 'react'
import { fmtDate, parseISO } from '../../domain/dates'
import { DEFAULT_MARGINS, buildYAxis, makeScales } from './scale'
import { fmt } from '../../lib/format'
import type { SeriesPoint } from '../../domain/progress'

interface Props {
  points: SeriesPoint[]
  /** Vodoravna referentna crta — dnevni cilj. */
  target?: number
  targetLabel?: string
  unit: string
  label: string
  color?: string
  height?: number
}

const WIDTH = 640

/**
 * Dnevne vrijednosti kao stupci uz referentnu crtu cilja.
 *
 * Os uvijek krece od nule: odsjecena baza kod stupaca pretjeruje razlike medu
 * danima. Usporedba s ciljem citljiva je iz odnosa vrha stupca i crte, pa boja
 * ne nosi znacenje sama za sebe.
 */
export function DailyBars({
  points,
  target,
  targetLabel = 'cilj',
  unit,
  label,
  color = 'var(--kcal)',
  height = 200,
}: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const titleId = useId()

  if (points.length === 0) {
    return <p className="muted small">Nema unosa u odabranom razdoblju.</p>
  }

  const y = buildYAxis(
    points.map((p) => p.value),
    { zeroBased: true, include: target ? [target] : [] },
  )
  const s = makeScales(WIDTH, height, DEFAULT_MARGINS, points.length, y)
  const barWidth = Math.max(2, Math.min(28, s.bandWidth - 2))
  const active = hover !== null ? points[hover] : null

  return (
    <div>
      {/* Vidi napomenu u TrendLine: fiksna visina bi ostavila prazne rubove. */}
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-labelledby={titleId}
        onMouseLeave={() => setHover(null)}
        style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <title id={titleId}>
          {label} kroz {points.length} {points.length === 1 ? 'dan' : 'dana'}
          {target ? `, uz cilj ${fmt(target)} ${unit}` : ''}
        </title>

        {y.ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={DEFAULT_MARGINS.left}
              x2={WIDTH - DEFAULT_MARGINS.right}
              y1={s.yPos(tick)}
              y2={s.yPos(tick)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={DEFAULT_MARGINS.left - 8}
              y={s.yPos(tick) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--muted)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {fmt(tick)}
            </text>
          </g>
        ))}

        {points.map((p, i) => {
          const top = s.yPos(p.value)
          const base = s.yPos(y.min)
          return (
            <rect
              key={p.date}
              x={s.band(i) - barWidth / 2}
              y={top}
              width={barWidth}
              height={Math.max(1, base - top)}
              rx={2}
              fill={color}
              className="bar-grow"
              style={{ transformOrigin: `0 ${base}px`, animationDelay: `${Math.min(i * 12, 360)}ms` }}
              opacity={hover === null || hover === i ? 1 : 0.45}
            />
          )
        })}

        {target !== undefined && target > 0 && (
          <>
            <line
              x1={DEFAULT_MARGINS.left}
              x2={WIDTH - DEFAULT_MARGINS.right}
              y1={s.yPos(target)}
              y2={s.yPos(target)}
              stroke="var(--txt)"
              strokeWidth={2}
              strokeDasharray="5 4"
              opacity={0.55}
            />
            <text
              x={WIDTH - DEFAULT_MARGINS.right}
              y={s.yPos(target) - 6}
              textAnchor="end"
              fontSize={11}
              fontWeight={700}
              fill="var(--txt)"
            >
              {targetLabel} {fmt(target)}
            </text>
          </>
        )}

        {points.map((p, i) => (
          <rect
            key={`hit-${p.date}`}
            x={s.band(i) - s.bandWidth / 2}
            y={DEFAULT_MARGINS.top}
            width={s.bandWidth}
            height={height - DEFAULT_MARGINS.top - DEFAULT_MARGINS.bottom}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        <text x={DEFAULT_MARGINS.left} y={height - 6} fontSize={11} fill="var(--muted)">
          {parseISO(points[0]!.date).getDate()}.{parseISO(points[0]!.date).getMonth() + 1}.
        </text>
        {points.length > 1 && (
          <text
            x={WIDTH - DEFAULT_MARGINS.right}
            y={height - 6}
            fontSize={11}
            fill="var(--muted)"
            textAnchor="end"
          >
            {parseISO(points.at(-1)!.date).getDate()}.{parseISO(points.at(-1)!.date).getMonth() + 1}.
          </text>
        )}
      </svg>

      <div className="small muted" style={{ minHeight: 20, marginTop: 4 }} aria-live="polite">
        {active
          ? `${fmtDate(active.date)} — ${fmt(active.value)} ${unit}${
              target ? ` (${active.value >= target ? '+' : '−'}${fmt(Math.abs(active.value - target))} od cilja)` : ''
            }`
          : ''}
      </div>
    </div>
  )
}

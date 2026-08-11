import { useId, useState } from 'react'
import { fmtDate } from '../../domain/dates'
import { DEFAULT_MARGINS, buildYAxis, makeScales } from './scale'
import { fmt } from '../../lib/format'
import type { SeriesPoint } from '../../domain/progress'

interface Props {
  points: SeriesPoint[]
  /** Druga, izvedena crta (npr. klizni prosjek) — prikazuje se tanja i svjetlija. */
  smoothed?: SeriesPoint[]
  unit: string
  decimals?: number
  label: string
  color?: string
  height?: number
}

const WIDTH = 640

/**
 * Trend jedne serije kroz vrijeme. Jedna serija ne treba legendu — naslov je
 * imenuje; zadnja tocka je izravno oznacena, bez broja na svakoj tocki.
 */
export function TrendLine({
  points,
  smoothed,
  unit,
  decimals = 1,
  label,
  color = 'var(--accent2)',
  height = 200,
}: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const titleId = useId()

  if (points.length === 0) {
    return <p className="muted small">Nema podataka za odabrano razdoblje.</p>
  }

  const y = buildYAxis(points.map((p) => p.value))
  const s = makeScales(WIDTH, height, DEFAULT_MARGINS, points.length, y)

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${s.x(i)},${s.yPos(p.value)}`).join(' ')
  const smoothPath = smoothed?.length
    ? smoothed.map((p, i) => `${i === 0 ? 'M' : 'L'}${s.x(i)},${s.yPos(p.value)}`).join(' ')
    : null

  const last = points.at(-1)!
  const active = hover !== null ? points[hover] : null

  return (
    <div>
      {/*
        Visina se NE zadaje atributom: uz fiksnu visinu i preserveAspectRatio
        sadrzaj se skalira na min(sirina/640, visina/200), pa u siroj kartici
        ostaje 640 px sirok i centrira se s praznim rubovima. Sirina 100 % uz
        automatsku visinu pusta viewBox da odredi omjer.
      */}
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-labelledby={titleId}
        onMouseLeave={() => setHover(null)}
        style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <title id={titleId}>
          {label}: od {fmt(points[0]!.value, decimals)} do {fmt(last.value, decimals)} {unit}
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
              {fmt(tick, decimals === 0 ? 0 : 1)}
            </text>
          </g>
        ))}

        {smoothPath && (
          <path d={smoothPath} fill="none" stroke={color} strokeWidth={2} opacity={0.28} />
        )}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          className="line-draw"
        />

        {/* Tocke se crtaju samo kad ih je malo — inace se crta pretvara u niz kruzica. */}
        {points.length <= 40 &&
          points.map((p, i) => (
            <circle
              key={p.date}
              cx={s.x(i)}
              cy={s.yPos(p.value)}
              r={hover === i ? 5 : 3}
              fill={color}
              stroke="var(--panel)"
              strokeWidth={2}
            />
          ))}

        {/* Zadnja vrijednost je izravno oznacena. */}
        <text
          x={Math.min(s.x(points.length - 1) + 8, WIDTH - 4)}
          y={s.yPos(last.value) - 8}
          fontSize={12}
          fontWeight={700}
          fill="var(--txt)"
          textAnchor={points.length === 1 ? 'middle' : 'end'}
        >
          {fmt(last.value, decimals)} {unit}
        </text>

        {active && (
          <line
            x1={s.x(hover!)}
            x2={s.x(hover!)}
            y1={DEFAULT_MARGINS.top}
            y2={height - DEFAULT_MARGINS.bottom}
            stroke="var(--muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {/*
          Nevidljive plohe za pogodak misem — sire od same tocke, ali podrezane na
          plohu grafa. Bez podrezivanja krajnje plohe strse izvan viewBoxa i hvataju
          mis izvan grafa.
        */}
        {points.map((p, i) => {
          const half = Math.max(4, s.plotWidth / Math.max(2, points.length * 2))
          const left = Math.max(DEFAULT_MARGINS.left, s.x(i) - half)
          const right = Math.min(WIDTH - DEFAULT_MARGINS.right, s.x(i) + half)
          return (
            <rect
              key={`hit-${p.date}`}
              x={left}
              y={DEFAULT_MARGINS.top}
              width={Math.max(1, right - left)}
              height={height - DEFAULT_MARGINS.top - DEFAULT_MARGINS.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          )
        })}

        <text
          x={DEFAULT_MARGINS.left}
          y={height - 6}
          fontSize={11}
          fill="var(--muted)"
        >
          {fmtDate(points[0]!.date)}
        </text>
        {points.length > 1 && (
          <text
            x={WIDTH - DEFAULT_MARGINS.right}
            y={height - 6}
            fontSize={11}
            fill="var(--muted)"
            textAnchor="end"
          >
            {fmtDate(last.date)}
          </text>
        )}
      </svg>

      <div className="small muted" style={{ minHeight: 20, marginTop: 4 }} aria-live="polite">
        {active ? `${fmtDate(active.date)} — ${fmt(active.value, decimals)} ${unit}` : ''}
      </div>
    </div>
  )
}

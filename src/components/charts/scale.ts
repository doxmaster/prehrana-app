/** Zajednicka geometrija grafova — bez biblioteke, sve je inline SVG. */

export interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

export const DEFAULT_MARGINS: Margins = { top: 12, right: 14, bottom: 26, left: 44 }

/**
 * "Lijepi" korak osi: 1, 2, 2.5 ili 5 puta potencija desetice. Sirovi raspon
 * podijeljen brojem podjela dao bi oznake tipa 237,4.
 */
export function niceStep(range: number, targetTicks: number): number {
  if (range <= 0) return 1
  const raw = range / Math.max(1, targetTicks)
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

export interface YAxis {
  min: number
  max: number
  ticks: number[]
}

/**
 * Okomita os koja obuhvaca podatke i, ako je zadana, referentnu vrijednost.
 * `zeroBased` drzi dno na nuli — obavezno za stupce, jer bi odsjecena baza
 * pretjerala razlike medu njima.
 */
export function buildYAxis(
  values: number[],
  options: { zeroBased?: boolean; include?: number[]; targetTicks?: number } = {},
): YAxis {
  const { zeroBased = false, include = [], targetTicks = 4 } = options
  const all = [...values, ...include].filter((v) => Number.isFinite(v))
  if (!all.length) return { min: 0, max: 1, ticks: [0, 1] }

  let lo = zeroBased ? 0 : Math.min(...all)
  let hi = Math.max(...all)
  if (hi === lo) {
    // Jedna jedina vrijednost — otvori mali raspon da crta ne sjedne na rub.
    hi = lo + Math.max(1, Math.abs(lo) * 0.1)
    if (!zeroBased) lo -= Math.max(1, Math.abs(lo) * 0.1)
  }

  const step = niceStep(hi - lo, targetTicks)
  const min = zeroBased ? 0 : Math.floor(lo / step) * step
  const max = Math.ceil(hi / step) * step

  const ticks: number[] = []
  for (let t = min; t <= max + step / 2; t += step) ticks.push(Math.round(t * 1000) / 1000)
  return { min, max, ticks }
}

export function makeScales(
  width: number,
  height: number,
  margins: Margins,
  count: number,
  y: YAxis,
) {
  const plotWidth = Math.max(1, width - margins.left - margins.right)
  const plotHeight = Math.max(1, height - margins.top - margins.bottom)
  const span = y.max - y.min || 1

  return {
    plotWidth,
    plotHeight,
    /** Vodoravni polozaj po rednom broju tocke. */
    x: (index: number) =>
      margins.left + (count <= 1 ? plotWidth / 2 : (index / (count - 1)) * plotWidth),
    /** Sredina pojasa — za stupce. */
    band: (index: number) => margins.left + ((index + 0.5) / Math.max(1, count)) * plotWidth,
    bandWidth: plotWidth / Math.max(1, count),
    yPos: (value: number) => margins.top + plotHeight - ((value - y.min) / span) * plotHeight,
  }
}

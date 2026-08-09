/** Brojevi se prikazuju hrvatski: decimalni zarez, točka kao tisućica. */
export function fmt(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '—'
  const factor = 10 ** decimals
  return (Math.round(value * factor) / factor).toLocaleString('hr-HR')
}

export function kcal(value: number): string {
  return fmt(value, 0)
}

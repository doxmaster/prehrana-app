/** Brojevi se prikazuju hrvatski: decimalni zarez, točka kao tisućica. */
export function fmt(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '—'
  const factor = 10 ** decimals
  return (Math.round(value * factor) / factor).toLocaleString('hr-HR')
}

export function kcal(value: number): string {
  return fmt(value, 0)
}

/**
 * Hrvatska mnozina ima tri oblika: 1 tjedan, 2 tjedna, 5 tjedana.
 *
 * Pravilo ide po zadnjoj znamenki, uz iznimku za 11–14 koji uvijek uzimaju
 * treci oblik (11 tjedana, ne "11 tjedan"). Bez toga se lako dobije "21 tjedana"
 * ili "12 tjedna".
 */
export function mnozina(n: number, oblici: [string, string, string]): string {
  const zadnja = Math.abs(n) % 10
  const zadnjeDvije = Math.abs(n) % 100
  if (zadnjeDvije >= 11 && zadnjeDvije <= 14) return oblici[2]
  if (zadnja === 1) return oblici[0]
  if (zadnja >= 2 && zadnja <= 4) return oblici[1]
  return oblici[2]
}

/** Broj s ispravnim oblikom rijeci: `broj(5, ['tjedan','tjedna','tjedana'])`. */
export function broj(n: number, oblici: [string, string, string]): string {
  return `${fmt(n)} ${mnozina(n, oblici)}`
}

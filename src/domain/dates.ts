/**
 * Datumi se svugdje vode kao ISO string YYYY-MM-DD u lokalnoj vremenskoj zoni.
 * Namjerno se ne koristi Date.toISOString() jer bi pretvorba u UTC pomaknula dan.
 */

export const DAY_NAMES = [
  'Nedjelja',
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Petak',
  'Subota',
] as const

export const MONTHS = [
  'Siječanj',
  'Veljača',
  'Ožujak',
  'Travanj',
  'Svibanj',
  'Lipanj',
  'Srpanj',
  'Kolovoz',
  'Rujan',
  'Listopad',
  'Studeni',
  'Prosinac',
] as const

export const WEEKDAYS_SHORT = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'] as const

export function iso(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function todayISO(): string {
  return iso(new Date())
}

export function addDays(s: string, n: number): string {
  const d = parseISO(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}

export function addMonths(s: string, n: number): string {
  const d = parseISO(s)
  return iso(new Date(d.getFullYear(), d.getMonth() + n, 1))
}

export function firstOfMonth(s: string): string {
  const d = parseISO(s)
  return iso(new Date(d.getFullYear(), d.getMonth(), 1))
}

export function monthDates(s: string): string[] {
  const d = parseISO(s)
  const y = d.getFullYear()
  const m = d.getMonth()
  const n = new Date(y, m + 1, 0).getDate()
  const out: string[] = []
  for (let i = 1; i <= n; i++) out.push(iso(new Date(y, m, i)))
  return out
}

/** Ponedjeljak tjedna u kojem je zadani datum. */
export function mondayOf(s: string): string {
  const d = parseISO(s)
  const wd = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - wd)
  return iso(d)
}

export function weekDates(s: string): string[] {
  const mon = mondayOf(s)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

export function dayName(s: string): string {
  return DAY_NAMES[parseISO(s).getDay()] ?? ''
}

export function fmtDate(s: string): string {
  const d = parseISO(s)
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
}

export function monthLabel(s: string): string {
  const d = parseISO(s)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function isISODate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

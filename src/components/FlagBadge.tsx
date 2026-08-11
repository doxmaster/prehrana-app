import type { FoodFlag } from '../domain/conditions'

/**
 * Oznaka da namirnica ili jelo nije u skladu sa zdravstvenim stanjem osobe.
 *
 * Namjerno je mala i uz naziv, a ne poseban stupac: primjedba je korisna dok se
 * bira, ne kao popis za citanje. Razlog stoji u `title` da se ne mora pogadati
 * zasto je nesto oznaceno.
 */
export function FlagBadge({ flag }: { flag: FoodFlag | undefined }) {
  if (!flag) return null
  const strong = flag.level === 'izbjegavaj'
  return (
    <span
      className="tag"
      title={`${flag.conditionName}: ${flag.why}`}
      style={{ color: strong ? 'var(--bad)' : 'var(--warn)', whiteSpace: 'nowrap' }}
    >
      {strong ? '⛔' : '⚠'} {flag.level}
    </span>
  )
}

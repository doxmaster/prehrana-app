import { fmtDate, todayISO } from '../domain/dates'
import { weekIdForDate } from '../domain/plan'
import { useAppStore } from '../store/useAppStore'
import { broj } from '../lib/format'

/**
 * Sto je uopce spremno — na vrhu Dnevnika, prije nego se ista upisuje.
 *
 * Dnevnik je pokazivao plan za jedan dan, ali ne i ima li plana uopce. Kad
 * "Upisi po planu" ne bi bilo nigdje, nije se vidjelo je li razlog taj sto
 * jelovnika nema ili taj sto tjedan nije vezan uz datum. Ovdje se oboje vidi
 * odjednom: koliko je jelovnika i jela u katalogu, i koji tjedni postoje —
 * s jasno oznacenim onim koji je na snazi danas.
 */
export function StanjePlana() {
  const menus = useAppStore((s) => s.data.menus)
  const recipes = useAppStore((s) => s.data.recipes)
  const weeks = useAppStore((s) => s.data.weeks)

  const danas = todayISO()
  const naSnaziId = weekIdForDate(weeks, danas)

  /*
   * Tjedni s datumom su oni koji stvarno vrijede; sezonski su predlosci dok se
   * ne primijene. Vazniji su prvi, pa idu na pocetak.
   */
  const poredani = [...weeks].sort((a, b) => {
    if (a.id === naSnaziId) return -1
    if (b.id === naSnaziId) return 1
    return (b.startDate ?? '').localeCompare(a.startDate ?? '')
  })

  return (
    <div className="card span-all stanje-plana">
      <span className="stanje-brojke">
        <span title="Dnevni jelovnici — kartica Jelovnici">
          🍽️ {broj(menus.length, ['jelovnik', 'jelovnika', 'jelovnika'])}
        </span>
        <span title="Jela u katalogu — kartica Jelovnici">
          🍲 {broj(recipes.length, ['jelo', 'jela', 'jela'])}
        </span>
        <span title="Tjedni planovi — kartica Tjedni i nabava">
          📅 {broj(weeks.length, ['tjedan', 'tjedna', 'tjedana'])}
        </span>
      </span>

      {weeks.length === 0 ? (
        <span className="muted small">
          Nijedan tjedan još nije složen — dok ga nema, Dnevnik nema što nuditi na upis.
        </span>
      ) : (
        <span className="stanje-tjedni">
          {poredani.map((w) => {
            const naSnazi = w.id === naSnaziId
            const naslov = w.title ?? 'Tjedan'
            /*
             * Naslov primijenjenog tjedna vec nosi datum ("… — od 17.8.2026."),
             * pa bi ga dodavanje ponovilo dvaput u istom retku.
             */
            const datumVanNaslova = w.startDate && !naslov.includes(fmtDate(w.startDate))
            return (
              <span key={w.id} className={naSnazi ? 'tjedan-znak jest' : 'tjedan-znak'}>
                {naSnazi && '● '}
                {naslov}
                {datumVanNaslova && <span className="muted"> od {fmtDate(w.startDate!)}</span>}
                {!w.startDate && <span className="muted"> predložak</span>}
                {naSnazi && <b> · ovaj tjedan</b>}
              </span>
            )
          })}
        </span>
      )}
    </div>
  )
}

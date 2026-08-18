import type { ReactNode } from 'react'

/**
 * Dva NEOVISNA stupca.
 *
 * Mreza (grid) slaze kartice u retke, pa dvije kartice razlicite visine
 * ostavljaju rupu ispod nize — a na kartici poput Postavki ta je rupa bila
 * visoka koliko i sama kartica. Ovdje svaki stupac slaze svoje kartice za
 * sebe, pa rupe nema po definiciji.
 *
 * Sto ide lijevo, a sto desno odlucuje se u samoj kartici — ondje se zna koja
 * je kartica visoka, a koja kratka.
 */
export function Columns({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="cols">
      <div className="col">{left}</div>
      <div className="col">{right}</div>
    </div>
  )
}

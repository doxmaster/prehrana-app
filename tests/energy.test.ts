import { describe, expect, it } from 'vitest'
import {
  KCAL_PER_KG,
  REFERENCE_SLEEP,
  SLEEP_LIMITS,
  energyBalance,
  energyBreakdown,
} from '../src/domain/energy'
import { computeTargets } from '../src/domain/targets'
import type { Profile } from '../src/domain/types'

const odrasli: Profile = { sex: 'm', age: 45, act: 1.55, weight: 85, height: 180, goal: 0 }
const dijete: Profile = { sex: 'z', age: 10, act: 1.55, weight: 32, height: 138, goal: 0 }

describe('rastav dnevne potrošnje', () => {
  it('uz referentnih 8 h sna daje isto što i dosadašnji račun', () => {
    // Uvođenje sna ne smije pomaknuti brojke nikome tko ga nije upisao.
    const b = energyBreakdown(odrasli, 85, REFERENCE_SLEEP)
    expect(b.total).toBe(b.baseline)
    expect(b.baseline).toBe(computeTargets(odrasli, 85).tdee)
  })

  it('bez zapisanog sna uzima referencu i to kaže', () => {
    const b = energyBreakdown(odrasli, 85)
    expect(b.sleepAssumed).toBe(true)
    expect(b.sleep).toBe(REFERENCE_SLEEP)
    expect(b.total).toBe(b.baseline)
  })

  it('dijelovi se zbrajaju u ukupno', () => {
    const b = energyBreakdown(odrasli, 85, 6.5)
    expect(b.sleepKcal + b.awakeRestKcal + b.activityKcal).toBeCloseTo(b.total, 0)
  })

  it('manje sna znači nešto veću potrošnju, ali razlika je mala', () => {
    const kratko = energyBreakdown(odrasli, 85, 5)
    const dugo = energyBreakdown(odrasli, 85, 9)
    expect(kratko.total).toBeGreaterThan(dugo.total)
    // Tri sata razlike ne smiju dati stotine kalorija — model to ne može tvrditi.
    expect(kratko.total - dugo.total).toBeLessThan(250)
  })

  it('san izvan razumnog raspona se svodi na granicu', () => {
    expect(energyBreakdown(odrasli, 85, 40).sleep).toBe(REFERENCE_SLEEP)
    expect(energyBreakdown(odrasli, 85, SLEEP_LIMITS.min).sleep).toBe(SLEEP_LIMITS.min)
    expect(energyBreakdown(odrasli, 85, SLEEP_LIMITS.max).sleep).toBe(SLEEP_LIMITS.max)
  })

  it('potrošnja u snu je ispod bazalne po satu', () => {
    const b = energyBreakdown(odrasli, 85, 8)
    expect(b.sleepKcal).toBeLessThan((b.bmr / 24) * 8)
  })

  it('aktivnost je sve iznad mirovanja i raste s faktorom aktivnosti', () => {
    const mirno = energyBreakdown({ ...odrasli, act: 1.2 }, 85, 8)
    const aktivno = energyBreakdown({ ...odrasli, act: 1.9 }, 85, 8)
    expect(aktivno.activityKcal).toBeGreaterThan(mirno.activityKcal)
    expect(mirno.bmr).toBe(aktivno.bmr)
  })

  it('za dijete koristi Schofielda, kao i ciljevi', () => {
    const b = energyBreakdown(dijete, 32, 10)
    expect(b.bmr).toBe(computeTargets(dijete, 32).bmr)
  })

  it('teža osoba troši više', () => {
    expect(energyBreakdown(odrasli, 110, 8).total).toBeGreaterThan(
      energyBreakdown(odrasli, 70, 8).total,
    )
  })
})

describe('bilanca dana', () => {
  const b = energyBreakdown(odrasli, 85, 8)

  it('višak i manjak imaju predznak', () => {
    expect(energyBalance(b.total + 500, b, odrasli, 85).balance).toBe(500)
    expect(energyBalance(b.total - 500, b, odrasli, 85).balance).toBe(-500)
  })

  it('procjena promjene mase ide po tjednu, ne po danu', () => {
    const r = energyBalance(b.total + 550, b, odrasli, 85)
    expect(r.weeklyKg).toBeCloseTo((550 * 7) / KCAL_PER_KG, 3)
    expect(r.weeklyKg).toBeGreaterThan(0.4)
  })

  it('razlika od cilja gleda cilj iz profila, ne potrošnju', () => {
    const mrsavljenje: Profile = { ...odrasli, goal: -500 }
    const bb = energyBreakdown(mrsavljenje, 85, 8)
    const r = energyBalance(2000, bb, mrsavljenje, 85)
    expect(r.targetKcal).toBe(computeTargets(mrsavljenje, 85).kcal)
    expect(r.vsTarget).toBe(2000 - r.targetKcal)
    // Cilj mršavljenja je ispod potrošnje — inače deficit ne bi ni postojao.
    expect(r.targetKcal).toBeLessThan(r.expenditure)
  })

  it('dan bez unosa je čist manjak', () => {
    const r = energyBalance(0, b, odrasli, 85)
    expect(r.balance).toBe(-b.total)
    expect(r.weeklyKg).toBeLessThan(0)
  })
})

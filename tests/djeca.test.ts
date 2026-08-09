import { describe, expect, it } from 'vitest'
import { ADULT_AGE, MIN_SUPPORTED_AGE, PROFILE_LIMITS, computeTargets, isMinor } from '../src/domain/targets'
import { schofieldBMR, waterTarget } from '../src/domain/dri'
import { portionFactor } from '../src/domain/household'
import type { Person, Profile } from '../src/domain/types'

const dijete = (age: number, weight: number, sex: 'm' | 'z' = 'm'): Profile => ({
  sex,
  age,
  weight,
  height: 100 + age * 6,
  act: 1.4,
  goal: 0,
})

describe('granice profila', () => {
  it('podržava dob od 7 godina', () => {
    expect(PROFILE_LIMITS.age.min).toBe(7)
    expect(MIN_SUPPORTED_AGE).toBe(7)
  })

  it('masa i visina dopuštaju dijete', () => {
    expect(PROFILE_LIMITS.weight.min).toBeLessThanOrEqual(20)
    expect(PROFILE_LIMITS.height.min).toBeLessThanOrEqual(115)
  })

  it('sedmogodišnjak od 23 kg prolazi kroz izračun bez zamjene zadanim vrijednostima', () => {
    const t = computeTargets(dijete(7, 23))
    expect(t.bmr).toBe(Math.round(schofieldBMR(23, 7, 'm')))
    expect(t.kcal).toBeGreaterThan(1000)
    expect(t.kcal).toBeLessThan(2000)
  })
})

describe('koja se jednadžba koristi', () => {
  it('do 18. godine Schofield, od 18. Mifflin-St Jeor', () => {
    const sedamnaest = computeTargets({ ...dijete(17, 60), height: 170 })
    expect(sedamnaest.bmr).toBe(Math.round(schofieldBMR(60, 17, 'm')))

    const osamnaest = { sex: 'm' as const, age: 18, weight: 60, height: 170, act: 1.4, goal: 0 }
    const mifflin = Math.round(10 * 60 + 6.25 * 170 - 5 * 18 + 5)
    expect(computeTargets(osamnaest).bmr).toBe(mifflin)
  })

  it('isMinor prepoznaje granicu', () => {
    expect(isMinor(dijete(17, 60))).toBe(true)
    expect(isMinor({ ...dijete(18, 60) })).toBe(false)
    expect(ADULT_AGE).toBe(18)
  })
})

describe('mikronutrijenti prate dob, ne masu', () => {
  it('kalcij je djeci u rastu VIŠI nego odraslima', () => {
    expect(computeTargets(dijete(12, 40)).ca).toBe(1300)
    expect(computeTargets(dijete(16, 60)).ca).toBe(1300)
    expect(computeTargets({ sex: 'm', age: 30, weight: 80, height: 180, act: 1.4, goal: 0 }).ca).toBe(1000)
  })

  it('željezo raste djevojkama u pubertetu', () => {
    expect(computeTargets(dijete(8, 26, 'z')).fe).toBe(10)
    expect(computeTargets(dijete(12, 40, 'z')).fe).toBe(8)
    expect(computeTargets(dijete(15, 55, 'z')).fe).toBe(15)
    expect(computeTargets(dijete(15, 60, 'm')).fe).toBe(11)
  })

  it('vitamin C i magnezij su djeci niži nego odraslima', () => {
    const osmogodisnjak = computeTargets(dijete(8, 26))
    expect(osmogodisnjak.vc).toBe(25)
    expect(osmogodisnjak.mg).toBe(130)

    const odrasli = computeTargets({ sex: 'm', age: 30, weight: 80, height: 180, act: 1.4, goal: 0 })
    expect(odrasli.vc).toBe(90)
    expect(odrasli.mg).toBe(400)
  })

  it('bjelančevine po kg su djeci niže nego odraslima', () => {
    const dijeteT = computeTargets(dijete(9, 30))
    expect(dijeteT.p).toBe(Math.round(1.1 * 30))

    const odrasliT = computeTargets({ sex: 'm', age: 30, weight: 30, height: 180, act: 1.4, goal: 0 })
    expect(odrasliT.p).toBe(Math.round(1.6 * 30))
  })
})

describe('tekućina', () => {
  it('djetetu se računa po Holliday-Segaru, ne 35 ml/kg', () => {
    // 25 kg: 10×100 + 10×50 + 5×20 = 1600 ml
    expect(waterTarget(25, 9)).toBe(1.6)
    // pravilo za odrasle dalo bi samo 0,9 L
    expect(Math.round((35 * 25) / 100) / 10).toBe(0.9)
  })

  it('odraslima ostaje 35 ml/kg', () => {
    expect(waterTarget(80, 30)).toBe(2.8)
    expect(computeTargets({ sex: 'm', age: 30, weight: 80, height: 180, act: 1.4, goal: 0 }).water).toBe(2.8)
  })
})

describe('sigurnosna granica za djecu', () => {
  it('cilj mršavljenja se ne primjenjuje na dijete', () => {
    const bezCilja = computeTargets({ ...dijete(10, 32), goal: 0 })
    const sDeficitom = computeTargets({ ...dijete(10, 32), goal: -500 })
    expect(sDeficitom.kcal).toBe(bezCilja.kcal)
  })

  it('ekstremni deficit ne može dati besmisleno nizak cilj djetetu', () => {
    const t = computeTargets({ ...dijete(10, 30), goal: -1000 })
    expect(t.kcal).toBeGreaterThan(1200)
  })

  it('dobivanje mase je djetetu i dalje dopušteno', () => {
    const bezCilja = computeTargets({ ...dijete(14, 50), goal: 0 })
    const sViskom = computeTargets({ ...dijete(14, 50), goal: 300 })
    expect(sViskom.kcal).toBeGreaterThan(bezCilja.kcal)
  })

  it('odraslima deficit i dalje radi', () => {
    const odrasli: Profile = { sex: 'm', age: 30, weight: 80, height: 180, act: 1.4, goal: 0 }
    expect(computeTargets({ ...odrasli, goal: -500 }).kcal).toBeLessThan(computeTargets(odrasli).kcal)
  })
})

describe('udio u nabavi', () => {
  const person = (profile: Profile): Person => ({
    id: 'p',
    name: 'X',
    profile,
    log: {},
    measurements: [],
  })

  it('sedmogodišnjak troši osjetno manje od odraslog', () => {
    const malo = portionFactor(person(dijete(7, 23)))
    const odrasli = portionFactor(person({ sex: 'm', age: 40, weight: 85, height: 180, act: 1.55, goal: 0 }))
    expect(malo).toBeLessThan(odrasli * 0.65)
  })

  it('udio raste s dobi djeteta', () => {
    const sedam = portionFactor(person(dijete(7, 23)))
    const dvanaest = portionFactor(person(dijete(12, 40)))
    const sesnaest = portionFactor(person(dijete(16, 62)))
    expect(sedam).toBeLessThan(dvanaest)
    expect(dvanaest).toBeLessThan(sesnaest)
  })
})

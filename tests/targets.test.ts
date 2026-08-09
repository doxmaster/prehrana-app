import { describe, expect, it } from 'vitest'
import { computeTargets, weightOn } from '../src/domain/targets'
import type { Person, Profile, Targets } from '../src/domain/types'

/**
 * Zlatne vrijednosti izvučene pokretanjem targets() u legacy/index.html.
 * Ako neki od ovih testova padne, nova implementacija računa drukčije od stare
 * i podaci korisnika prestali bi se poklapati.
 *
 * Popis sadrži isključivo odrasle. Za djecu i mlade stara je aplikacija koristila
 * Mifflin-St Jeor, koji za tu dob nije validiran — te vrijednosti su namjerno
 * promijenjene i pokrivene su zasebnim testovima niže.
 */
const GOLDEN: Array<{ profile: Profile; expected: Targets }> = [
  {
    profile: { sex: 'm', age: 30, act: 1.55, weight: 75, height: 178, goal: 0 },
    expected: { kcal: 2660, p: 120, c: 379, f: 74, fib: 37, fe: 8, ca: 1000, mg: 400, vc: 90, vd: 15, bmr: 1718, tdee: 2662, water: 2.6 },
  },
  {
    profile: { sex: 'm', age: 30, act: 1.2, weight: 90, height: 185, goal: -500 },
    expected: { kcal: 1790, p: 144, c: 191, f: 50, fib: 25, fe: 8, ca: 1000, mg: 400, vc: 90, vd: 15, bmr: 1911, tdee: 2294, water: 3.2 },
  },
  {
    profile: { sex: 'm', age: 71, act: 1.9, weight: 80, height: 180, goal: 300 },
    expected: { kcal: 3290, p: 128, c: 490, f: 91, fib: 46, fe: 8, ca: 1200, mg: 420, vc: 90, vd: 20, bmr: 1575, tdee: 2993, water: 2.8 },
  },
  {
    profile: { sex: 'm', age: 70, act: 1.55, weight: 80, height: 180, goal: 0 },
    expected: { kcal: 2450, p: 128, c: 332, f: 68, fib: 34, fe: 8, ca: 1000, mg: 420, vc: 90, vd: 15, bmr: 1580, tdee: 2449, water: 2.8 },
  },
  {
    profile: { sex: 'z', age: 25, act: 1.375, weight: 60, height: 165, goal: -250 },
    expected: { kcal: 1600, p: 96, c: 205, f: 44, fib: 22, fe: 18, ca: 1000, mg: 310, vc: 75, vd: 15, bmr: 1345, tdee: 1850, water: 2.1 },
  },
  {
    profile: { sex: 'z', age: 50, act: 1.55, weight: 70, height: 170, goal: 0 },
    expected: { kcal: 2090, p: 112, c: 280, f: 58, fib: 29, fe: 18, ca: 1000, mg: 320, vc: 75, vd: 15, bmr: 1352, tdee: 2095, water: 2.5 },
  },
  {
    profile: { sex: 'z', age: 51, act: 1.55, weight: 70, height: 170, goal: 0 },
    expected: { kcal: 2090, p: 112, c: 280, f: 58, fib: 29, fe: 8, ca: 1200, mg: 320, vc: 75, vd: 15, bmr: 1347, tdee: 2087, water: 2.5 },
  },
  {
    profile: { sex: 'z', age: 31, act: 1.725, weight: 65, height: 168, goal: 300 },
    expected: { kcal: 2690, p: 104, c: 400, f: 75, fib: 38, fe: 18, ca: 1000, mg: 320, vc: 75, vd: 15, bmr: 1384, tdee: 2387, water: 2.3 },
  },
  {
    profile: { sex: 'z', age: 30, act: 1.725, weight: 65, height: 168, goal: 300 },
    expected: { kcal: 2700, p: 104, c: 402, f: 75, fib: 38, fe: 18, ca: 1000, mg: 310, vc: 75, vd: 15, bmr: 1389, tdee: 2396, water: 2.3 },
  },
  {
    profile: { sex: 'z', age: 100, act: 1.9, weight: 250, height: 220, goal: 1000 },
    expected: { kcal: 7110, p: 400, c: 932, f: 198, fib: 100, fe: 8, ca: 1200, mg: 320, vc: 75, vd: 20, bmr: 3214, tdee: 6107, water: 8.8 },
  },
]

describe('computeTargets — poklapanje sa starom aplikacijom', () => {
  for (const { profile, expected } of GOLDEN) {
    it(`${profile.sex} ${profile.age}g ${profile.weight}kg ${profile.height}cm act=${profile.act} cilj=${profile.goal}`, () => {
      expect(computeTargets(profile)).toEqual(expected)
    })
  }
})

describe('computeTargets — granice i otpornost', () => {
  const base: Profile = { sex: 'm', age: 30, act: 1.55, weight: 75, height: 178, goal: 0 }

  it('ugljikohidrati nikad ne padaju ispod nule', () => {
    // Odrasla osoba velike mase, niske aktivnosti i s najvecim dopustenim
    // deficitom: bjelancevine (1,6 g/kg) i masti pojedu cijeli energetski budzet.
    const t = computeTargets({ ...base, age: 60, weight: 100, height: 150, act: 1, goal: -1000 })
    expect(t.kcal).toBeGreaterThan(0)
    expect(t.p * 4 + t.f * 9).toBeGreaterThan(t.kcal)
    expect(t.c).toBe(0)
  })

  it('neispravne vrijednosti zamjenjuju se zadanima umjesto da daju NaN', () => {
    const broken = { sex: 'm', age: NaN, act: 0, weight: -5, height: null, goal: 'x' } as unknown as Profile
    const t = computeTargets(broken)
    expect(Object.values(t).every((v) => Number.isFinite(v))).toBe(true)
    expect(t).toEqual(computeTargets(base))
  })

  it('željezo pada s 18 na 8 mg u 51. godini kod žena', () => {
    expect(computeTargets({ ...base, sex: 'z', age: 50 }).fe).toBe(18)
    expect(computeTargets({ ...base, sex: 'z', age: 51 }).fe).toBe(8)
  })

  it('kalcij raste na 1200 mg za muškarce od 71. godine', () => {
    expect(computeTargets({ ...base, age: 70 }).ca).toBe(1000)
    expect(computeTargets({ ...base, age: 71 }).ca).toBe(1200)
  })

  it('weightOverride mijenja i bjelančevine i vodu', () => {
    const t = computeTargets(base, 90)
    expect(t.p).toBe(Math.round(1.6 * 90))
    expect(t.water).toBe(3.2)
  })
})

describe('weightOn — težina iz mjerenja', () => {
  const person: Person = {
    id: 'p1',
    name: 'Test',
    profile: { sex: 'm', age: 30, act: 1.55, weight: 75, height: 178, goal: 0 },
    log: {},
    measurements: [
      { date: '2026-01-10', weight: 82 },
      { date: '2026-02-01', weight: 80 },
      { date: '2026-03-01', weight: 78.5 },
      { date: '2026-02-15', note: 'bez vaganja' },
    ],
  }

  it('uzima zadnje mjerenje prije zadanog datuma', () => {
    expect(weightOn(person, '2026-02-20')).toBe(80)
    expect(weightOn(person, '2026-03-01')).toBe(78.5)
  })

  it('prije prvog mjerenja koristi težinu iz profila', () => {
    expect(weightOn(person, '2026-01-01')).toBe(75)
  })

  it('bez ijednog mjerenja koristi težinu iz profila', () => {
    expect(weightOn({ ...person, measurements: [] }, '2026-05-05')).toBe(75)
  })
})

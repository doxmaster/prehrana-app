import { describe, expect, it } from 'vitest'
import { AiParseError, buildEntryPrompt, parseAiResponse } from '../src/domain/aiEntry'
import { buildFoodIndex } from '../src/domain/foodIndex'
import { emptyState } from '../src/domain/migrate'

const foods = buildFoodIndex(emptyState())

const answer = (items: unknown) => JSON.stringify({ items })

describe('buildEntryPrompt', () => {
  it('sadrži korisnikov tekst i popis poznatih namirnica', () => {
    const prompt = buildEntryPrompt('dva jaja i kruh', ['Jaje (cijelo)', 'Kruh bijeli'])
    expect(prompt).toContain('dva jaja i kruh')
    expect(prompt).toContain('Jaje (cijelo); Kruh bijeli')
  })

  it('traži isključivo JSON', () => {
    const prompt = buildEntryPrompt('x', [])
    expect(prompt).toContain('ISKLJUCIVO JSON')
    expect(prompt).toContain('SAMO JSON')
  })

  it('nabraja sve dopuštene kategorije', () => {
    const prompt = buildEntryPrompt('x', [])
    for (const cat of ['Meso i riba', 'Pića', 'Suplementi', 'Ostalo']) {
      expect(prompt).toContain(cat)
    }
  })
})

describe('parseAiResponse — čitanje odgovora', () => {
  it('čita čist JSON', () => {
    const r = parseAiResponse(
      answer([{ meal: 'Ručak', name: 'Sarma', grams: 300, per100: { kcal: 120, p: 8, c: 6, f: 7 } }]),
      foods,
    )
    expect(r.items).toHaveLength(1)
    expect(r.items[0]).toMatchObject({ name: 'Sarma', g: 300 })
    expect(r.mealIndex).toEqual([1])
  })

  it('preživi markdown ogradu i objašnjenje oko JSON-a', () => {
    const raw = `Naravno! Evo procjene:\n\n\`\`\`json\n${answer([
      { meal: 'Doručak', name: 'Kajgana', grams: 200, per100: { kcal: 150, p: 12, c: 1, f: 11 } },
    ])}\n\`\`\`\n\nNadam se da pomaže.`
    const r = parseAiResponse(raw, foods)
    expect(r.items).toHaveLength(1)
    expect(r.mealIndex).toEqual([0])
  })

  it('nepoznat obrok pada u međuobrok', () => {
    const r = parseAiResponse(
      answer([{ meal: 'Brunch', name: 'Nešto', grams: 100, per100: { kcal: 100, p: 5, c: 10, f: 4 } }]),
      foods,
    )
    expect(r.mealIndex).toEqual([3])
  })

  it('prihvaća decimalni zarez u gramima', () => {
    const r = parseAiResponse(
      answer([{ meal: 'Ručak', name: 'Ulje', grams: '12,5', per100: { kcal: 884, f: 100 } }]),
      foods,
    )
    expect(r.items[0]!.g).toBe(12.5)
  })
})

describe('parseAiResponse — povezivanje s bazom', () => {
  it('koristi provjerenu namirnicu umjesto procjene modela', () => {
    const r = parseAiResponse(
      answer([
        { meal: 'Doručak', name: 'jaja', match: 'Jaje (cijelo)', grams: 100, per100: { kcal: 999 } },
      ]),
      foods,
    )
    expect(r.matched).toBe(1)
    expect(r.items[0]).toEqual({ foodId: foods.byName('Jaje (cijelo)')!.id, g: 100 })
  })

  it('povezuje i po nazivu kad match nije ispunjen', () => {
    const r = parseAiResponse(
      answer([{ meal: 'Ručak', name: 'Banana', grams: 120, per100: { kcal: 89 } }]),
      foods,
    )
    expect(r.matched).toBe(1)
    expect('foodId' in r.items[0]!).toBe(true)
  })

  it('nepoznato jelo ostaje sa svojim vrijednostima', () => {
    const r = parseAiResponse(
      answer([
        { meal: 'Večera', name: 'Bakina pita', grams: 250, cat: 'Žitarice i kruh', per100: { kcal: 260, p: 7, c: 35, f: 10 } },
      ]),
      foods,
    )
    expect(r.matched).toBe(0)
    const item = r.items[0]!
    expect('n' in item && item.n.kcal).toBe(260)
    expect('cat' in item && item.cat).toBe('Žitarice i kruh')
  })

  it('nepoznata kategorija postaje Ostalo, a piće Pića', () => {
    const r = parseAiResponse(
      answer([
        { meal: 'Ručak', name: 'Čudo', grams: 100, cat: 'Izmišljeno', per100: { kcal: 100, c: 25 } },
        { meal: 'Ručak', name: 'Neki sok', grams: 200, drink: true, per100: { kcal: 45, c: 11 } },
      ]),
      foods,
    )
    expect('cat' in r.items[0]! && r.items[0]!.cat).toBe('Ostalo')
    expect('cat' in r.items[1]! && r.items[1]!.cat).toBe('Pića')
    expect('drink' in r.items[1]! && r.items[1]!.drink).toBe(true)
  })
})

describe('parseAiResponse — provjera vjerodostojnosti', () => {
  it('upozorava kad kalorije ne odgovaraju makronutrijentima', () => {
    const r = parseAiResponse(
      answer([{ meal: 'Ručak', name: 'Sumnjivo', grams: 100, per100: { kcal: 50, p: 30, c: 40, f: 20 } }]),
      foods,
    )
    expect(r.warnings.join(' ')).toContain('Sumnjivo')
    expect(r.items).toHaveLength(1) // upozorava, ali ne odbacuje
  })

  it('ne upozorava na alkohol, gdje formula ne vrijedi', () => {
    const r = parseAiResponse(
      answer([
        { meal: 'Večera', name: 'Domaća rakija', grams: 50, cat: 'Pića', drink: true, per100: { kcal: 231, p: 0, c: 0, f: 0 } },
      ]),
      foods,
    )
    expect(r.warnings).toEqual([])
  })

  it('upozorava kad model ne da nikakve vrijednosti', () => {
    const r = parseAiResponse(
      answer([{ meal: 'Ručak', name: 'Prazno', grams: 100, per100: {} }]),
      foods,
    )
    expect(r.warnings.join(' ')).toContain('nikakve vrijednosti')
  })
})

describe('parseAiResponse — neispravan ulaz', () => {
  it.each([
    ['prazan odgovor', ''],
    ['bez JSON-a', 'Ne mogu ti pomoći s tim.'],
    ['neispravan JSON', '{ items: [ }'],
    ['bez stavki', '{"items":[]}'],
    ['stavke bez naziva', '{"items":[{"grams":100}]}'],
  ])('%s daje razumljivu grešku', (_opis, raw) => {
    expect(() => parseAiResponse(raw, foods)).toThrow(AiParseError)
  })

  it('poruka o grešci je na hrvatskom i kaže što napraviti', () => {
    try {
      parseAiResponse('bez ičega', foods)
      expect.unreachable()
    } catch (err) {
      expect((err as Error).message).toMatch(/zalijepi/i)
    }
  })

  it('preskače stavke bez količine, a ostale zadržava', () => {
    const r = parseAiResponse(
      answer([
        { meal: 'Ručak', name: 'Bez grama', grams: 0, per100: { kcal: 100 } },
        { meal: 'Ručak', name: 'Banana', grams: 120, per100: { kcal: 89 } },
      ]),
      foods,
    )
    expect(r.items).toHaveLength(1)
  })
})

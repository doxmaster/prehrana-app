import { describe, expect, it } from 'vitest'
import { broj, mnozina } from '../src/lib/format'

/**
 * Mnozina je jedina stvar u prikazu koja se lako pokvari neprimjetno: "21
 * tjedana" izgleda kao previd, a ne kao greska u kodu.
 */
describe('hrvatska množina', () => {
  const TJEDAN: [string, string, string] = ['tjedan', 'tjedna', 'tjedana']

  it('uzima prvi oblik za jedan', () => {
    expect(mnozina(1, TJEDAN)).toBe('tjedan')
    expect(mnozina(21, TJEDAN)).toBe('tjedan')
    expect(mnozina(101, TJEDAN)).toBe('tjedan')
  })

  it('uzima drugi oblik za dva do četiri', () => {
    expect(mnozina(2, TJEDAN)).toBe('tjedna')
    expect(mnozina(4, TJEDAN)).toBe('tjedna')
    expect(mnozina(23, TJEDAN)).toBe('tjedna')
  })

  it('uzima treći oblik za pet i više', () => {
    expect(mnozina(0, TJEDAN)).toBe('tjedana')
    expect(mnozina(5, TJEDAN)).toBe('tjedana')
    expect(mnozina(100, TJEDAN)).toBe('tjedana')
  })

  it('11 do 14 su iznimka i uvijek uzimaju treći oblik', () => {
    expect(mnozina(11, TJEDAN)).toBe('tjedana')
    expect(mnozina(12, TJEDAN)).toBe('tjedana')
    expect(mnozina(14, TJEDAN)).toBe('tjedana')
    expect(mnozina(111, TJEDAN)).toBe('tjedana')
  })

  it('broj lijepi znamenku i riječ', () => {
    expect(broj(1, TJEDAN)).toBe('1 tjedan')
    expect(broj(136, ['jelovnik', 'jelovnika', 'jelovnika'])).toBe('136 jelovnika')
    expect(broj(1000, TJEDAN)).toBe('1.000 tjedana')
  })
})

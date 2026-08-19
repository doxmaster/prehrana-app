import { describe, expect, it } from 'vitest'
import { porukaGreske } from '../src/services/google'

/**
 * Poruke o greskama pri usklađivanju.
 *
 * Sirovi Googleov JSON je tehnicki tocan i posve beskoristan; ovi testovi cuvaju
 * da korisnik dobije recenicu koja kaze STO UCINITI.
 */
describe('poruke Googleovih grešaka', () => {
  it('pun Drive objašnjava kako osloboditi mjesto', () => {
    const tijelo =
      '{"error":{"code":403,"message":"The user\'s Drive storage quota has been exceeded."}}'
    const p = porukaGreske(403, tijelo)
    expect(p).toContain('pun')
    expect(p).toContain('smeće')
    expect(p).not.toContain('quota')
  })

  it('istekla prijava traži ponovnu prijavu', () => {
    expect(porukaGreske(401, '{}')).toContain('Prijavi se ponovno')
  })

  it('nedovoljna prava upućuju na ponovni pristanak', () => {
    expect(porukaGreske(403, '{"error":{"message":"Insufficient Permission"}}')).toContain('prava')
  })

  it('nestala datoteka se imenuje kao takva', () => {
    expect(porukaGreske(404, '{}')).toContain('nije nađena')
  })

  it('nepoznata greška zadrži Googleovu poruku, ali s brojem', () => {
    const p = porukaGreske(500, '{"error":{"message":"Backend Error"}}')
    expect(p).toContain('500')
    expect(p).toContain('Backend Error')
  })

  it('prazan odgovor ne ostavlja praznu poruku', () => {
    expect(porukaGreske(502, '').length).toBeGreaterThan(10)
  })
})

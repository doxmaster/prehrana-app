import { describe, expect, it } from 'vitest'
import {
  dopustenEmail,
  izgledaKaoEmail,
  porukaPrijave,
  putanjaDijeljenja,
} from '../src/services/google'

describe('popis dopuštenih računa', () => {
  const popis = ['darijo@gmail.com', 'ana@gmail.com']

  it('prazan popis pušta svakoga', () => {
    expect(dopustenEmail('bilo.tko@gmail.com', [])).toBe(true)
  })

  it('propušta onoga tko je na popisu', () => {
    expect(dopustenEmail('ana@gmail.com', popis)).toBe(true)
  })

  it('ne mari za velika slova ni razmake', () => {
    expect(dopustenEmail('  Ana@Gmail.com ', popis)).toBe(true)
  })

  it('odbija onoga koga nema', () => {
    expect(dopustenEmail('netko@drugi.com', popis)).toBe(false)
  })

  it('ne prihvaća adresu koja samo sadrži dopuštenu', () => {
    expect(dopustenEmail('ana@gmail.com.zlo.hr', popis)).toBe(false)
  })
})

describe('poruke pri prijavi', () => {
  it('odbijen pristup objašnjava koga zamoliti', () => {
    const p = porukaPrijave('access_denied')
    expect(p).toContain('nema pristup')
    expect(p).not.toContain('access_denied')
  })

  it('zatvoren prozor nije greška nego opis', () => {
    expect(porukaPrijave('popup_closed')).toContain('zatvoren')
  })

  it('nepoznat kod zadrži kod u zagradi', () => {
    expect(porukaPrijave('nesto_novo')).toContain('nesto_novo')
  })

  it('bez koda daje opću poruku', () => {
    expect(porukaPrijave()).toBe('Prijava nije dovršena.')
  })
})

/**
 * Oblik putanje za dijeljenje.
 *
 * Ovdje je vec bila greska: fileId je bio poslan kao parametar umjesto u
 * putanji, pa je Google vracao 404 i "Pozovi ukucana" nije radilo.
 */
describe('dijeljenje datoteke', () => {
  it('fileId ide u putanju, ne kao parametar', () => {
    const p = putanjaDijeljenja('abc123')
    expect(p).toContain('files/abc123/permissions')
    expect(p).not.toContain('fileId=')
  })

  it('šalje obavijest e-poštom', () => {
    expect(putanjaDijeljenja('abc')).toContain('sendNotificationEmail=true')
  })

  it('id sa znakovima koji trebaju kodiranje ne razbija putanju', () => {
    expect(putanjaDijeljenja('a/b?c')).toContain('files/a%2Fb%3Fc/permissions')
  })
})

describe('provjera adrese', () => {
  it('prihvaća uobičajene adrese', () => {
    expect(izgledaKaoEmail('helena.cekovic.dolcic@gmail.com')).toBe(true)
    expect(izgledaKaoEmail('  darijo@gmail.com ')).toBe(true)
  })

  it('odbija ono što nije adresa', () => {
    expect(izgledaKaoEmail('helena')).toBe(false)
    expect(izgledaKaoEmail('helena@gmail')).toBe(false)
    expect(izgledaKaoEmail('helena @gmail.com')).toBe(false)
    expect(izgledaKaoEmail('')).toBe(false)
  })
})

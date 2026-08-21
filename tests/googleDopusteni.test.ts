import { describe, expect, it } from 'vitest'
import {
  brojProjekta,
  dopustenEmail,
  izgledaKaoEmail,
  otisakKljuca,
  porukaPrijave,
  porukaPoziva,
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

/**
 * Tekst poziva.
 *
 * Helena je prvi put dobila golu Googleovu obavijest da je s njom podijeljen
 * "prehrana-obitelj.json" — bez ijedne upute sto s tim. Ovi testovi cuvaju da
 * poziv odgovori tko zove, kamo se ide i sto se klikne.
 */
describe('poruka poziva', () => {
  const p = porukaPoziva('Darijo Dolčić', 'https://prehrana-app.pages.dev')

  it('kaže tko poziva i na koju adresu', () => {
    expect(p).toContain('Darijo Dolčić')
    expect(p).toContain('https://prehrana-app.pages.dev')
  })

  it('kaže što kliknuti', () => {
    expect(p).toContain('Prijavi se')
    expect(p).toContain('Pridruži se obitelji')
  })

  it('odvraća od ručnog otvaranja datoteke', () => {
    expect(p).toMatch(/ne treba otvarati/i)
  })

  it('poruka se šalje uz dijeljenje', () => {
    const put = putanjaDijeljenja('abc', 'zdravo')
    expect(put).toContain('emailMessage=zdravo')
    expect(put).toContain('files/abc/permissions')
  })

  it('bez poruke se ne šalje prazan parametar', () => {
    expect(putanjaDijeljenja('abc')).not.toContain('emailMessage')
  })
})

/**
 * Broj projekta za Googleov birac.
 *
 * Bez `appId` odabir datoteke ne dodjeljuje aplikaciji pravo na nju: birac se
 * zatvori kao da je sve u redu, a citanje poslije padne.
 */
describe('broj projekta iz client ID-a', () => {
  it('uzima dio prije crtice', () => {
    expect(brojProjekta('527960598577-pjvca0mtvku8.apps.googleusercontent.com')).toBe(
      '527960598577',
    )
  })

  it('prazan client ID ne ruši ništa', () => {
    expect(brojProjekta('')).toBe('')
  })
})

/**
 * Otisak kljuca.
 *
 * Kad Googleov birac javi "developer key is invalid", jedino pitanje koje
 * vrijedi jest koristi li aplikacija onaj kljuc koji mislis. Otisak to
 * odgovara bez pokazivanja cijele vrijednosti.
 */
describe('otisak ključa', () => {
  it('pokazuje početak, kraj i duljinu', () => {
    const o = otisakKljuca('AIzaSyAekZHbXXXXXXXXXXXXXXXXXXXXXI2CyBg')
    expect(o).toContain('AIzaSyAekZ')
    expect(o).toContain('CyBg')
    expect(o).toContain('39')
  })

  it('ne otkriva sredinu ključa', () => {
    expect(otisakKljuca('AIzaSyAekZHbTAJNASREDINAXXXXXXXXI2CyBg')).not.toContain('TAJNASREDINA')
  })

  it('prazno i prekratko imenuje kao takvo', () => {
    expect(otisakKljuca('')).toBe('nema ga')
    expect(otisakKljuca('AIza')).toContain('prekratak')
  })
})

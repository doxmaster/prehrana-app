# 🥗 Prehrana

Aplikacija za planiranje obiteljske prehrane i praćenje unosa hranjivih tvari.
Radi u pregledniku, bez servera i bez registracije — **podaci nikad ne napuštaju
tvoj uređaj**, čuvaju se u `localStorage`.

**Živa verzija: https://prehrana-app.pages.dev**

Zaključana je na popis dopuštenih Google računa; podaci obitelji putuju kroz
jednu datoteku na Google Driveu vlasnika, ne kroz nikakav poslužitelj.

## Kako je zamišljena

Redom kojim se stvari slažu, a tako su i kartice grupirane:

| Skupina    | Kartice                                | Čemu služi                                                      |
| ---------- | -------------------------------------- | --------------------------------------------------------------- |
| **dan**    | Dnevnik, Napredak                      | što je danas pojedeno i kako to stoji kroz vrijeme              |
| **plan**   | Jelovnici, Tjedni i nabava             | dnevni jelovnici, pa tjedni složeni od njih i popis za kupovinu |
| **podaci** | Namirnice, Obitelj i ciljevi, Postavke | katalozi i postavke iza svega                                   |

Tjedni plan je **prijedlog**, dnevnik je **činjenica**: u Dnevniku uz svaki obrok
stoji sivi redak `plan` s gumbom _Upiši_. Dok ga ne upišeš, ne broji se nigdje.

## Značajke

- **Dnevnik** — unos po danu, kalorije, makronutrijenti (bjelančevine, ugljikohidrati, masti, vlakna), mikronutrijenti (željezo, kalcij, magnezij, vitamin C, D) i tekućina, sve naspram osobnih ciljeva.
- **Bolesti i ograničenja** — 16 stanja (hemokromatoza, dijabetes tip 2, Hashimoto, bubrežna bolest…) s vidljivim granicama; jela koja ih prelaze označena su, a slaganje tjedna ih izbjegava.
- **Obitelj** — više osoba i kućanstava; ciljevi se računaju iz spola, dobi, težine, visine, aktivnosti i sna (Mifflin-St Jeor za odrasle, Schofield za djecu). Količine u planu množe se udjelom osobe, pa dijete ne bilježi isti tanjur.
- **Jelovnici i jela** — 136 dnevnih jelovnika i 272 jela; vlastita jela dodaju se i lijepljenjem recepta, koje aplikacija sama razloži na namirnice.
- **Tjedni i nabava** — sezonski predlošci koji se vežu uz datum, automatsko slaganje tjedna prema bolestima i ciljevima ukućana, popis za kupovinu s izvozom.
- **Zaštita podataka** — svaka izmjena ima _Poništi_, brisanja i prepisivanja traže potvrdu s brojkama, a prije velikih zahvata nastaje kopija koja preživi zatvaranje preglednika.

## Pokretanje

```bash
npm install
npm run dev              # razvojni poslužitelj
npm test                 # testovi domene
npm run build            # produkcijska verzija u dist/
npm run build:artefakt   # cijela aplikacija u JEDNOJ HTML datoteci
npm run ikone            # ponovno iscrtaj ikone aplikacije
```

Google prijava se u gradnju ugrađuje iz varijabli okoline —
`VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_API_KEY`, `VITE_GOOGLE_DOZVOLJENI`.
Bez njih aplikacija radi normalno, samo bez zajedničke obitelji. Ključevi su
javni po naravi (vide se u kodu svake web aplikacije); čuva ih popis dopuštenih
adresa u Google konzoli, ne tajnost.

Push na `master` objavljuje novu verziju. Cloudflare gradi i poslužuje stranicu;
GitHub Actions uz to vrti `eslint` i sve testove, pa se pokvarena verzija vidi
odmah.

## Instalacija na mobitel

Otvori živu adresu pa:

- **Android (Chrome):** izbornik `⋮` → _Instaliraj aplikaciju_
- **iPhone (Safari):** gumb za dijeljenje `⬆` → _Dodaj na početni zaslon_

Otvara se preko cijelog zaslona, bez adresne trake, i **radi bez interneta** —
dnevnik se upisuje i u dućanu gdje signala nema. Nova izdanja se povuku sama pri
sljedećem otvaranju.

## Obitelj na više uređaja

Podaci su po zadanom **samo na uređaju** na kojem su upisani. Za zajedničku
obitelj postoji usklađivanje kroz **jednu datoteku na Google Driveu vlasnika** —
bez poslužitelja u sredini i bez ičijeg posredovanja.

1. Vlasnik se prijavi (gumb uz odabir osobe) i klikne **⟳ Uskladi s obitelji** —
   nastane `prehrana-obitelj.json` na njegovu Driveu
2. **✉ Pozovi ukućana** njegovom Google adresom; aplikacija ispiše gotov tekst
   poziva za slanje porukom
3. Pozvani otvori istu adresu, prijavi se **svojim** računom i klikne
   **⇲ Pridruži se obitelji**

**Račun treba uređaj, ne osoba.** Dijete ili baka postoje kao osobe u obitelji, a
njihove obroke upisuje onaj tko obitelj vodi.

Spajanje je trostruko (osnova ↔ ovdje ↔ drugdje): tuđi unos se ne gubi, brisanje
se razlikuje od „drugi to još nema", a kad su isto mijenjala dva uređaja, to se
**kaže** umjesto da se tiho progura jedna verzija.

### Tko smije unutra

Dvije brave, neovisne jedna o drugoj:

- **Google konzola** — aplikacija stoji u načinu _Testing_; prijaviti se mogu
  samo računi s popisa _Test users_. Ovo je prava brava, radi na Googleovoj strani.
- **Popis u aplikaciji** (`VITE_GOOGLE_DOZVOLJENI`) — zaštita od zabune, npr.
  prijave krivim računom na zajedničkom uređaju. Kod je javan, pa se može
  zaobići; ne oslanjaj se na nju samu.

U tuđu obitelj se ne može ući samovoljno: pristup datoteci daje isključivo
vlasnik, pozivom na točnu adresu.

## Podaci žive uz podrijetlo stranice

Svaka adresa ima **svoj odvojeni skup podataka** — ono što upišeš na živoj
adresi nije isto što i na `localhost`. Prijenos ide preko **Postavke →
⬇ Izvezi sve**, pa **⬆ Uvezi** na drugoj adresi. Uvoz prihvaća i starije kopije,
uključujući one iz prve HTML verzije aplikacije.

Iz istog razloga je ugašena stara adresa na GitHub Pagesu: dvije žive adrese
znače dvije odvojene bilježnice, a to se primijeti tek kad nešto nedostaje.

## Odakle vrijednosti

Hranjive vrijednosti ugrađene baze provjerene su prema USDA FoodData Central;
namirnice označene kao _ručno_ su procjene (uglavnom suplementi s deklariranom
dozom i domaći proizvodi kojima USDA nema odgovarajući zapis). Svaki unos prolazi
Atwaterovu provjeru (`kcal ≈ 4p + 4c + 9f`).

Jela su građena iz sastojaka i provjerenih vrijednosti — ne prepisivanjem tuđih
recepata. Popis sastojaka s količinama je činjenica; način na koji je recept
napisan nije, pa tuđi tekstovi i fotografije ovdje ne ulaze.

Aplikacija je za osobno praćenje i ne zamjenjuje savjet liječnika ili
nutricionista.

## Licenca

MIT — vidi `LICENSE`.

# 🥗 Prehrana

Aplikacija za planiranje obiteljske prehrane i praćenje unosa hranjivih tvari.
Radi u pregledniku, bez servera i bez registracije — **podaci nikad ne napuštaju
tvoj uređaj**, čuvaju se u `localStorage`.

**Živa verzija: https://doxmaster.github.io/prehrana-app/**

## Kako je zamišljena

Redom kojim se stvari slažu, a tako su i kartice grupirane:

| Skupina | Kartice | Čemu služi |
|---|---|---|
| **dan** | Dnevnik, Napredak | što je danas pojedeno i kako to stoji kroz vrijeme |
| **plan** | Jelovnici, Tjedni i nabava | dnevni jelovnici, pa tjedni složeni od njih i popis za kupovinu |
| **podaci** | Namirnice, Obitelj i ciljevi, Postavke | katalozi i postavke iza svega |

Tjedni plan je **prijedlog**, dnevnik je **činjenica**: u Dnevniku uz svaki obrok
stoji sivi redak `plan` s gumbom *Upiši*. Dok ga ne upišeš, ne broji se nigdje.

## Značajke

- **Dnevnik** — unos po danu, kalorije, makronutrijenti (bjelančevine, ugljikohidrati, masti, vlakna), mikronutrijenti (željezo, kalcij, magnezij, vitamin C, D) i tekućina, sve naspram osobnih ciljeva.
- **Bolesti i ograničenja** — 16 stanja (hemokromatoza, dijabetes tip 2, Hashimoto, bubrežna bolest…) s vidljivim granicama; jela koja ih prelaze označena su, a slaganje tjedna ih izbjegava.
- **Obitelj** — više osoba i kućanstava; ciljevi se računaju iz spola, dobi, težine, visine, aktivnosti i sna (Mifflin-St Jeor za odrasle, Schofield za djecu). Količine u planu množe se udjelom osobe, pa dijete ne bilježi isti tanjur.
- **Jelovnici i jela** — 136 dnevnih jelovnika i 272 jela; vlastita jela dodaju se i lijepljenjem recepta, koje aplikacija sama razloži na namirnice.
- **Tjedni i nabava** — sezonski predlošci koji se vežu uz datum, automatsko slaganje tjedna prema bolestima i ciljevima ukućana, popis za kupovinu s izvozom.
- **Zaštita podataka** — svaka izmjena ima *Poništi*, brisanja i prepisivanja traže potvrdu s brojkama, a prije velikih zahvata nastaje kopija koja preživi zatvaranje preglednika.

## Pokretanje

```bash
npm install
npm run dev          # razvojni poslužitelj
npm test             # testovi domene
npm run build        # produkcijska verzija u dist/
npm run build:artefakt   # cijela aplikacija u JEDNOJ HTML datoteci
```

Push na `master` sam objavljuje novu verziju — ali tek ako `eslint` i svi testovi
prođu.

## Podaci žive uz podrijetlo stranice

Svaka adresa ima **svoj odvojeni skup podataka**: ono što upišeš na
`doxmaster.github.io` nije isto što i na `localhost`. Prijenos ide preko
**Postavke → ⬇ Izvezi sve**, pa **⬆ Uvezi** na drugoj adresi. Uvoz prihvaća i
starije kopije, uključujući one iz prve HTML verzije aplikacije.

## Odakle vrijednosti

Hranjive vrijednosti ugrađene baze provjerene su prema USDA FoodData Central;
namirnice označene kao *ručno* su procjene (uglavnom suplementi s deklariranom
dozom i domaći proizvodi kojima USDA nema odgovarajući zapis). Svaki unos prolazi
Atwaterovu provjeru (`kcal ≈ 4p + 4c + 9f`).

Jela su građena iz sastojaka i provjerenih vrijednosti — ne prepisivanjem tuđih
recepata. Popis sastojaka s količinama je činjenica; način na koji je recept
napisan nije, pa tuđi tekstovi i fotografije ovdje ne ulaze.

Aplikacija je za osobno praćenje i ne zamjenjuje savjet liječnika ili
nutricionista.

## Licenca

MIT — vidi `LICENSE`.

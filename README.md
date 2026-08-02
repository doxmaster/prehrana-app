# 🥗 Prehrana

Aplikacija za planiranje prehrane i praćenje unosa hranjivih tvari — sve u jednoj samostalnoj HTML datoteci (`index.html`), bez servera i bez instalacije.

## Značajke

- **Dnevnik (pojedeno)** — unos po danu s mjesečnim kalendarom, praćenje kalorija, makronutrijenata (bjelančevine, ugljikohidrati, masti, vlakna) i mikronutrijenata (željezo, kalcij, magnezij, vitamin C, vitamin D) te tekućine, sve naspram osobnih ciljeva.
- **Jelovnici** — numerirani jelovnici s automatskim (ili vlastitim) nazivom i opisom, pregledom po danu i kopiranjem/lijepljenjem obroka i namirnica.
- **Osobe i ciljevi** — više profila; dnevni ciljevi računaju se iz spola, dobi, težine, visine, aktivnosti i cilja (Mifflin-St Jeor → TDEE).
- **Baza namirnica** — ~90 uobičajenih namirnica, pića i suplemenata (vrijednosti na 100 g / 100 ml); dodavanje, uređivanje, brisanje, preimenovanje i sortiranje.
- **AI pomoć** (unutar Claude / Cowork okruženja): unos obroka prirodnim jezikom, procjena vrijednosti nove namirnice, ponovna provjera vrijednosti i provjera gramaže porcije.
- **Popis za kupovinu** — zbroj namirnica za odabrane jelovnike (uz broj ponavljanja), s izvozom u Excel (CSV) i ispisom.
- **Tjedni pregled** — prosjek i ukupno za dane s unosom naspram cilja.

## Pokretanje

Otvori `index.html` u pregledniku (Chrome, Edge, Firefox). Podaci se spremaju lokalno u pregledniku (`localStorage`). Sigurnosnu kopiju možeš napraviti gumbom za izvoz u JSON (kartica Postavke).

> Napomena: AI funkcije rade samo kad je aplikacija otvorena unutar Claude (Cowork) okruženja, jer koriste `window.cowork.askClaude`. U običnom pregledniku sve ostalo radi normalno, a AI gumbi javljaju da AI nije dostupan.

## Podaci i točnost

Hranjive vrijednosti su okvirni prosjeci i mogu varirati ovisno o marki, pripremi i sirovini. Aplikacija je za osobno praćenje i ne zamjenjuje savjet liječnika ili nutricionista.

## Licenca

MIT — vidi `LICENSE`.

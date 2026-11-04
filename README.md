# Extras pe Categorii (React)

Încarci extrasul de cont (CSV sau Excel) și vezi veniturile și cheltuielile grupate pe categorii și pe luni.
Totul rulează în browser; fișierul nu este trimis nicăieri.

## Pornire

```bash
npm install
npm run dev
```

Apoi deschide adresa afișată (de obicei http://localhost:5173).

## Build

- `npm run build` – aplicație statică în `dist/`
- `npm run build:single` – un singur `dist/index.html`, cu tot codul inclus
  (`node to-artifact.mjs` îl transformă în pagina publicată pe claude.ai)

## Structură

- `src/App.jsx` – starea aplicației și calculele (totaluri, pe categorii, pe luni)
- `src/components/` – Upload, ColumnMap, Summary (carduri, categorii, luni), Ledger (tranzacții), Rules
- `src/lib/parse.js` – citire CSV/Excel, detectare coloane, numere și date românești, încadrare
- `src/lib/categories.js` – categoriile și cuvintele-cheie; aici adaugi comercianți noi
- `src/lib/sample.js` – extrasul de exemplu

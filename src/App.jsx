import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CAT, fits, kindOf } from "./lib/categories.js";
import { buildTransactions, detectColumns, readFile } from "./lib/parse.js";
import { fmtDate, money } from "./lib/format.js";
import Upload from "./components/Upload.jsx";
import ColumnMap from "./components/ColumnMap.jsx";
import { CategoryList, MonthTable, Tiles } from "./components/Summary.jsx";
import Ledger from "./components/Ledger.jsx";
import Rules from "./components/Rules.jsx";

const RULES_KEY = "extras-rules";
const loadRules = () => {
  try { return JSON.parse(localStorage.getItem(RULES_KEY) || "[]") || []; } catch { return []; }
};

function prepare(rows, fileName) {
  rows = rows.map((r) => (r || []).map((c) => (c == null ? "" : c)));
  const { headerIdx, map, currency } = detectColumns(rows);
  return { source: { rows, headerIdx, fileName, currency }, map };
}

export default function App() {
  const [source, setSource] = useState(null);
  const [map, setMap] = useState({});
  const [rules, setRules] = useState(loadRules);
  const [overrides, setOverrides] = useState({});
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef();

  const notify = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  };

  useEffect(() => {
    try { localStorage.setItem(RULES_KEY, JSON.stringify(rules)); } catch { /* stocare indisponibilă */ }
  }, [rules]);

  const tx = useMemo(() => (source ? buildTransactions(source.rows, source.headerIdx, map, rules) : []), [source, map, rules]);
  const catOf = useCallback((t) => {
    const o = overrides[t.key];
    return o && fits(o, t.amount) ? o : t.auto;
  }, [overrides]);
  const cur = source?.currency;

  const stats = useMemo(() => {
    let inc = 0, out = 0, selfIn = 0, selfOut = 0, selfN = 0, incomeCount = 0;
    const byCat = {}, byIncome = {}, byMonth = {};
    for (const t of tx) {
      const c = catOf(t);
      if (kindOf(c) === "self") {
        selfN++;
        if (t.amount > 0) selfIn += t.amount; else selfOut -= t.amount;
        continue;
      }
      const k = t.date ? t.date.slice(0, 7) : "—";
      const m = (byMonth[k] ||= { inc: 0, out: 0, cats: {} });
      const v = Math.abs(t.amount);
      const b = t.amount > 0 ? (byIncome[c] ||= { sum: 0, n: 0 }) : (byCat[c] ||= { sum: 0, n: 0 });
      b.sum += v;
      b.n++;
      if (t.amount > 0) { inc += v; m.inc += v; incomeCount++; }
      else { out += v; m.out += v; m.cats[c] = (m.cats[c] || 0) + v; }
    }
    const dates = tx.map((t) => t.date).filter(Boolean).sort();
    return {
      totals: { inc, out },
      self: { in: selfIn, out: selfOut, n: selfN },
      byCat,
      byIncome,
      byMonth,
      months: Object.keys(byMonth).filter((k) => k !== "—").length || 1,
      incomeCount,
      period: dates.length ? `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])}` : "perioadă necunoscută",
    };
  }, [tx, catOf]);

  const load = (rows, fileName) => {
    const p = prepare(rows, fileName);
    setSource(p.source);
    setMap(p.map);
    setOverrides({});
    setFilter("all");
    setError("");
    const n = buildTransactions(p.source.rows, p.source.headerIdx, p.map, rules).length;
    if (!n) {
      setError("Nu am găsit tranzacții. Deschide „Coloanele recunoscute” și alege coloanele pentru dată și sumă.");
      setMapOpen(true);
    } else notify(`Am citit ${n} tranzacții`);
  };

  const onFile = useCallback(async (file) => {
    try {
      load(await readFile(file), file.name);
    } catch (e) {
      setError(`Nu am putut citi fișierul: ${e.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules]);

  const setCat = (t, cat) => {
    setOverrides((o) => {
      const next = { ...o };
      if (cat === t.auto) delete next[t.key]; else next[t.key] = cat;
      return next;
    });
    notify("Categorie schimbată");
  };

  const copySummary = () => {
    const { totals, byCat, byIncome, self } = stats;
    const lines = (o) => Object.entries(o).sort((a, b) => b[1].sum - a[1].sum).map(([c, v]) => `  ${(CAT[c] || CAT.altele).name}: ${money(v.sum, cur)}`);
    const text = [
      `Venituri: ${money(totals.inc, cur)}`,
      `Cheltuieli: ${money(totals.out, cur)}`,
      `Rămas: ${money(totals.inc - totals.out, cur)}`,
      ...(self.n ? [`Între conturile mele (exclus din totaluri): ${money(self.in, cur)} intrate, ${money(self.out, cur)} ieșite`] : []),
      "",
      "Venituri pe surse:",
      ...lines(byIncome),
      "",
      "Cheltuieli pe categorii:",
      ...lines(byCat),
    ].join("\n");
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); notify("Rezumat copiat"); } catch { notify("Selectează și copiază manual"); }
      ta.remove();
    };
    try { navigator.clipboard.writeText(text).then(() => notify("Rezumat copiat"), fallback); } catch { fallback(); }
  };

  return (
    <div className="wrap">
      <header>
        <h1>Extras pe Categorii</h1>
        <p className="lede">
          Încarcă extrasul de cont (CSV sau Excel) și vezi unde s-au dus banii: mâncare, utilități, transport, distracție și restul.
          Fișierul este citit doar în browserul tău și nu este trimis nicăieri.
        </p>
      </header>

      <Upload onFile={onFile} />

      <div className="status">
        {source ? <span className="pill">{source.fileName}</span> : <span>Niciun fișier încărcat. Încarcă extrasul tău ca să vezi analiza.</span>}
        {source && <span><b className="num">{tx.length}</b> tranzacții</span>}
        {source && tx.length > 0 && <span>{stats.period}</span>}
        {error && <span className="err">{error}</span>}
      </div>

      {source && (
        <>
          <ColumnMap header={source.rows[source.headerIdx] || []} map={map} onChange={setMap} open={mapOpen} onToggle={setMapOpen} />

          {tx.length > 0 && (
            <>
            <Tiles totals={stats.totals} self={stats.self} months={stats.months} incomeCount={stats.incomeCount} cur={cur} />

            <section className="two">
              <CategoryList byCat={stats.byCat} filter={filter} cur={cur} onCopy={copySummary}
                onPick={(id) => setFilter((f) => (f === id ? "all" : id))} />
              <CategoryList title="Venituri pe surse" empty="Nicio încasare găsită." byCat={stats.byIncome} filter={filter} cur={cur}
                onPick={(id) => setFilter((f) => (f === id ? "all" : id))} />
            </section>

            <MonthTable byMonth={stats.byMonth} />

            <Ledger tx={tx} catOf={catOf} filter={filter} setFilter={setFilter} overrides={overrides} onSetCat={setCat} />

            </>
          )}
        </>
      )}

      <Rules
        rules={rules}
        onAdd={(kw, cat) => { setRules((r) => [{ kw, cat }, ...r.filter((x) => x.kw.toLowerCase() !== kw.toLowerCase())]); notify("Regula a fost adăugată"); }}
        onRemove={(i) => setRules((r) => r.filter((_, j) => j !== i))}
      />

      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </div>
  );
}

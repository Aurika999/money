import { useState } from "react";
import { CATS, fits, kindOf } from "../lib/categories.js";
import { norm } from "../lib/parse.js";
import { fmtDate, num } from "../lib/format.js";

const PAGE = 200;

export default function Ledger({ tx, catOf, filter, setFilter, overrides, onSetCat }) {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const counts = {};
  tx.forEach((t) => { const c = catOf(t); counts[c] = (counts[c] || 0) + 1; });

  const nq = norm(q);
  const rows = tx
    .filter((t) => (filter === "all" || catOf(t) === filter) && (!nq || norm(t.desc).includes(nq)))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const shown = rows.slice(0, limit);
  const sum = rows.reduce((s, t) => s + t.amount, 0);

  return (
    <section className="panel">
      <div className="head">
        <h2>Tranzacții</h2>
        <span className="hint" style={{ margin: 0 }}>Schimbă categoria dacă a fost ghicită greșit. La intrări alegi sursa venitului; mutările între conturile tale alege „Între conturile mele”.</span>
      </div>
      <div className="tools">
        <input id="q" type="search" placeholder="Caută în descriere (ex. Kaufland)" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} />
        <select id="fcat" value={counts[filter] ? filter : "all"} onChange={(e) => { setFilter(e.target.value); setLimit(PAGE); }}>
          <option value="all">Toate categoriile ({tx.length})</option>
          {CATS.filter((c) => counts[c.id]).map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({counts[c.id]})</option>
          ))}
        </select>
      </div>
      <div className="tbl-wrap">
        <table className="ledger">
          <thead>
            <tr><th>Data</th><th>Descriere</th><th className="r">Sumă</th><th>Categorie</th></tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={4} className="hint">Nicio tranzacție pentru acest filtru.</td></tr>
            )}
            {shown.map((t) => (
              <tr key={t.key} className={`${overrides[t.key] ? "edited" : ""} ${kindOf(catOf(t)) === "self" ? "self" : ""}`}>
                <td className="d num">{fmtDate(t.date)}</td>
                <td className="desc">{t.desc || <span className="hint">fără descriere</span>}</td>
                <td className={`r num ${t.amount > 0 ? "pos" : "neg"}`}>{t.amount > 0 ? "+" : ""}{num(t.amount)}</td>
                <td>
                  <select aria-label="Categorie" value={catOf(t)} onChange={(e) => onSetCat(t, e.target.value)}>
                    {CATS.filter((c) => fits(c.id, t.amount)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td />
                <td className="label">Total afișat ({rows.length})</td>
                <td className={`r num ${sum >= 0 ? "pos" : "neg"}`}><b>{num(sum)}</b></td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length > limit && (
        <div className="more">
          <button className="btn ghost small" onClick={() => setLimit(limit + PAGE)}>
            Arată încă {Math.min(PAGE, rows.length - limit)} din {rows.length - limit} rămase
          </button>
        </div>
      )}
    </section>
  );
}

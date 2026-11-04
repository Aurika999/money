import { useState } from "react";
import { BUILTIN, CAT, CATS } from "../lib/categories.js";

export default function Rules({ rules, onAdd, onRemove }) {
  const [kw, setKw] = useState("");
  const [cat, setCat] = useState("mancare");

  return (
    <section className="panel">
      <h2>Regulile tale</h2>
      <p className="hint">Adaugă un cuvânt din descriere și categoria lui. Regulile tale au prioritate și se păstrează în acest browser.</p>
      <form
        className="ruleform"
        style={{ marginTop: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!kw.trim()) return;
          onAdd(kw.trim(), cat);
          setKw("");
        }}
      >
        <input id="ruleKw" type="text" placeholder="ex. Sala Fitness, Popescu Ion, World Class" value={kw} onChange={(e) => setKw(e.target.value)} />
        <select id="ruleCat" value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn" type="submit">Adaugă regula</button>
      </form>
      <div className="rules">
        {rules.length === 0 && <span className="hint" style={{ margin: 0 }}>Nu ai încă reguli proprii.</span>}
        {rules.map((r, i) => {
          const c = CAT[r.cat] || CAT.altele;
          return (
            <span key={r.kw} className="chip">
              <span className="dot" style={{ background: c.color }} />
              {r.kw} → {c.name}
              <button aria-label={`Șterge regula ${r.kw}`} onClick={() => onRemove(i)}>×</button>
            </span>
          );
        })}
      </div>
      <details style={{ marginTop: 14 }}>
        <summary className="label" style={{ cursor: "pointer" }}>Cuvinte recunoscute automat</summary>
        <div className="builtin">
          {BUILTIN.map(([c, k]) => (
            <p key={c}><b>{CAT[c].name}:</b> {k.join(", ")}</p>
          ))}
        </div>
      </details>
    </section>
  );
}

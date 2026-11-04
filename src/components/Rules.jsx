import { useState } from "react";
import { BUILTIN, CAT, CATS } from "../lib/categories.js";

const GROUPS = [
  ["self", "Neutru (nu intră în totaluri)"],
  ["in", "Surse de venit (doar intrări)"],
  ["out", "Cheltuieli (doar ieșiri)"],
];
const SIDE = { self: "intrări și ieșiri", in: "intrări", out: "ieșiri" };

export default function Rules({ rules, onAdd, onRemove }) {
  const [kw, setKw] = useState("");
  const [cat, setCat] = useState("intre_conturi");

  return (
    <section className="panel">
      <h2>Regulile tale</h2>
      <p className="hint">Adaugă un cuvânt din descriere și categoria lui. Regulile tale au prioritate și se păstrează în acest browser.</p>
      <p className="hint">
        Pentru transferurile între conturile tale scrie numele tău așa cum apare în extras, IBAN-ul celuilalt cont sau numele băncii
        (ex. „Revolut”) și alege „Între conturile mele”. Pentru venituri scrie numele angajatorului sau al clientului și alege sursa.
      </p>
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
        <input id="ruleKw" type="text" placeholder="ex. numele tău, RO49 AAAA..., Angajator SRL" value={kw} onChange={(e) => setKw(e.target.value)} />
        <select id="ruleCat" value={cat} onChange={(e) => setCat(e.target.value)}>
          {GROUPS.map(([k, label]) => (
            <optgroup key={k} label={label}>
              {CATS.filter((c) => c.kind === k).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
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
              {r.kw} → {c.name} <span className="side">({SIDE[c.kind]})</span>
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

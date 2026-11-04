import { CAT } from "../lib/categories.js";
import { money, num, monthLabel } from "../lib/format.js";

export function Tiles({ totals, months, incomeCount, cur }) {
  const net = totals.inc - totals.out;
  return (
    <section className="tiles">
      <div className="tile">
        <span className="label">Venituri</span>
        <span className="v in">{money(totals.inc, cur)}</span>
        <span className="sub">{incomeCount} încasări</span>
      </div>
      <div className="tile">
        <span className="label">Cheltuieli</span>
        <span className="v out">{money(totals.out, cur)}</span>
        <span className="sub">în medie {money(totals.out / (months || 1), cur)} pe lună</span>
      </div>
      <div className="tile">
        <span className="label">Rămas</span>
        <span className={`v ${net >= 0 ? "in" : "out"}`}>{net >= 0 ? "+" : ""}{money(net, cur)}</span>
        <span className="sub">
          {totals.inc ? `ai cheltuit ${Math.round((totals.out / totals.inc) * 100)}% din venituri` : "fără venituri în perioadă"}
        </span>
      </div>
    </section>
  );
}

export function CategoryList({ byCat, filter, onPick, cur, onCopy }) {
  const list = Object.entries(byCat).filter(([, v]) => Math.abs(v.sum) > 0.005).sort((a, b) => b[1].sum - a[1].sum);
  const max = Math.max(...list.map(([, v]) => v.sum), 1);
  const total = list.reduce((s, [, v]) => s + Math.max(v.sum, 0), 0) || 1;
  return (
    <div className="panel">
      <div className="head">
        <h2>Cheltuieli pe categorii</h2>
        <button className="btn ghost small" onClick={onCopy}>Copiază rezumatul</button>
      </div>
      <div className="cats">
        {list.length === 0 && <p className="hint">Nicio cheltuială găsită.</p>}
        {list.map(([id, v]) => {
          const c = CAT[id] || CAT.altele;
          return (
            <button key={id} className={`cat ${filter === id ? "on" : ""}`} aria-pressed={filter === id} onClick={() => onPick(id)}>
              <span className="n"><span className="dot" style={{ background: c.color }} /><span>{c.name}</span></span>
              <span className="amt">{money(v.sum, cur)}</span>
              <span className="bar"><i style={{ width: `${Math.max(0, (v.sum / max) * 100)}%`, background: c.color }} /></span>
              <span className="meta">
                <span>{v.n} {v.n === 1 ? "tranzacție" : "tranzacții"}</span>
                <span className="num">{((v.sum / total) * 100).toFixed(1)}%</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MonthTable({ byMonth }) {
  const keys = Object.keys(byMonth).sort().reverse();
  return (
    <div className="panel">
      <div className="head"><h2>Pe luni</h2></div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr><th>Luna</th><th className="r">Venituri</th><th className="r">Cheltuieli</th><th>Structură</th></tr>
          </thead>
          <tbody>
            {keys.map((k) => {
              const m = byMonth[k];
              return (
                <tr key={k}>
                  <td>{k === "—" ? "fără dată" : monthLabel(k)}</td>
                  <td className="r num pos">{num(m.inc)}</td>
                  <td className="r num neg">{num(m.out)}</td>
                  <td>
                    <div className="mstack">
                      {Object.entries(m.cats).sort((a, b) => b[1] - a[1]).map(([c, v]) => {
                        const cat = CAT[c] || CAT.altele;
                        return <i key={c} title={`${cat.name}: ${num(v)}`} style={{ width: `${(v / (m.out || 1)) * 100}%`, background: cat.color }} />;
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

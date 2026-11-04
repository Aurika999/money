const FIELDS = [
  ["date", "Data"],
  ["desc", "Descriere"],
  ["amount", "Sumă (cu semn)"],
  ["debit", "Debit (ieșiri)"],
  ["credit", "Credit (intrări)"],
];

export default function ColumnMap({ header, map, onChange, open, onToggle }) {
  return (
    <details className="panel map" open={open} onToggle={(e) => onToggle(e.currentTarget.open)}>
      <summary>Coloanele recunoscute în fișier</summary>
      <p className="hint">Dacă sumele sau descrierile nu arată corect, alege manual coloanele potrivite.</p>
      <div className="mapgrid">
        {FIELDS.map(([k, label]) => (
          <label key={k}>
            {label}
            <select id={`m-${k}`} value={map[k]} onChange={(e) => onChange({ ...map, [k]: +e.target.value })}>
              <option value={-1}>— nu există —</option>
              {header.map((h, i) => (
                <option key={i} value={i}>{String(h).trim() || `Coloana ${i + 1}`}</option>
              ))}
            </select>
          </label>
        ))}
        <label className="check">
          <input id="m-invert" type="checkbox" checked={map.invert} onChange={(e) => onChange({ ...map, invert: e.target.checked })} />
          Inversează semnul sumelor
        </label>
      </div>
    </details>
  );
}

import { useEffect, useRef, useState } from "react";

export default function Upload({ onFile }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);

  // fișierul poate fi lăsat oriunde în pagină
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    const drop = (e) => {
      e.preventDefault();
      setOver(false);
      if (e.dataTransfer?.files?.[0]) onFile(e.dataTransfer.files[0]);
    };
    document.addEventListener("dragover", prevent);
    document.addEventListener("drop", drop);
    return () => {
      document.removeEventListener("dragover", prevent);
      document.removeEventListener("drop", drop);
    };
  }, [onFile]);

  return (
    <section
      className={`drop ${over ? "over" : ""}`}
      onDragEnter={() => setOver(true)}
      onDragOver={() => setOver(true)}
      onDragLeave={() => setOver(false)}
    >
      <p>
        <b>Trage fișierul aici</b> sau alege-l din calculator.
        <br />
        <span className="hint">Formate: .csv, .xlsx, .xls. Merge cu extrase BT, BCR, ING, Raiffeisen, Revolut și altele.</span>
      </p>
      <input
        ref={input}
        id="file"
        type="file"
        accept=".csv,.txt,.xlsx,.xls"
        hidden
        onChange={(e) => {
          if (e.target.files[0]) onFile(e.target.files[0]);
          e.target.value = "";
        }}
      />
      <button className="btn" onClick={() => input.current.click()}>Alege fișierul</button>
    </section>
  );
}

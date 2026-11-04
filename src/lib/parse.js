// Citirea extrasului: CSV/Excel -> rânduri -> tranzacții încadrate pe categorii.
import { BUILTIN, KEYS, fits } from "./categories.js";

export const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const kwRe = (kw) => new RegExp("(^|[^a-z0-9])" + reEsc(norm(kw)) + "($|[^a-z0-9])");

const pad = (n) => String(n).padStart(2, "0");

/** "1.234,56", "1,234.56", "-45.00", "(12,50)", "12,50-" -> number */
export function parseNum(v) {
  if (typeof v === "number") return v;
  let s = String(v ?? "").trim();
  if (!s) return NaN;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (/-\s*$/.test(s)) { neg = true; s = s.replace(/-\s*$/, ""); }
  s = s.replace(/[^\d.,\-+]/g, "");
  if (s.startsWith("-")) { neg = !neg; s = s.slice(1); }
  s = s.replace(/^\+/, "");
  if (!/\d/.test(s)) return NaN;
  const lc = s.lastIndexOf(","), ld = s.lastIndexOf(".");
  if (lc > -1 && ld > -1) {
    s = lc > ld ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lc > -1) {
    s = /^\d{1,3}(,\d{3})+$/.test(s) && s.match(/,/g).length > 1 ? s.replace(/,/g, "") : s.replace(/,/g, ".");
  } else if (ld > -1 && s.match(/\./g).length > 1) {
    s = s.replace(/\./g, "");
  }
  const n = parseFloat(s);
  return isNaN(n) ? NaN : neg ? -n : n;
}

/** Date | număr serial Excel | "dd.mm.yyyy" | "yyyy-mm-dd" | "5 oct 2026" -> "yyyy-mm-dd" */
export function parseDate(v) {
  if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  if (typeof v === "number" && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(v ?? "").trim();
  let m = s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})/);
  if (m) {
    let y = +m[3];
    if (y < 100) y += 2000;
    return `${y}-${pad(m[2])}-${pad(m[1])}`;
  }
  const mon = { ian: 1, jan: 1, feb: 2, mar: 3, apr: 4, mai: 5, may: 5, iun: 6, jun: 6, iul: 7, jul: 7, aug: 8, sep: 9, oct: 10, noi: 11, nov: 11, dec: 12 };
  m = norm(s).match(/^(\d{1,2})\s+([a-z]{3})[a-z]*\.?\s+(\d{4})/);
  if (m && mon[m[2]]) return `${m[3]}-${pad(mon[m[2]])}-${pad(m[1])}`;
  return null;
}

/** CSV cu separator detectat automat (; , tab |) și ghilimele. */
export function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const first = text.split(/\r?\n/).slice(0, 15).join("\n");
  let delim = ",", best = -1;
  for (const d of [";", ",", "\t", "|"]) {
    const c = first.split(d).length;
    if (c > best) { best = c; delim = d; }
  }
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else q = false;
      } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/** Citește un File (CSV sau Excel) și întoarce rândurile ca matrice. */
export async function readFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const buf = await file.arrayBuffer();
  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    let rows = [];
    for (const name of wb.SheetNames) {
      const rr = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" });
      if (rr.length > rows.length) rows = rr;
    }
    return rows;
  }
  let text = new TextDecoder("utf-8").decode(buf);
  if (text.includes("�")) text = new TextDecoder("windows-1250").decode(buf);
  return parseCSV(text);
}

function headerScore(row) {
  let s = 0;
  for (const c of row) {
    const n = norm(c);
    if (!n || n.length > 40) continue;
    for (const k of Object.keys(KEYS)) if (KEYS[k].some((w) => n === w || n.includes(w))) { s++; break; }
  }
  return s;
}

/** Găsește rândul de antet și coloanele pentru dată, descriere, sume. */
export function detectColumns(rows) {
  let headerIdx = 0, bs = -1;
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    const s = headerScore(rows[i]);
    if (s > bs) { bs = s; headerIdx = i; }
  }
  const H = (rows[headerIdx] || []).map(norm);
  const used = new Set();
  H.forEach((h, i) => { if (KEYS.skip.some((k) => h === k || h.startsWith(k + " "))) used.add(i); });
  const find = (keys, exclude = []) => {
    for (const exact of [true, false])
      for (const k of keys) {
        const i = H.findIndex((h, ix) => !used.has(ix) && h && (exact ? h === k : h.includes(k)) && !exclude.some((x) => h.includes(x)));
        if (i > -1) { used.add(i); return i; }
      }
    return -1;
  };
  const map = { invert: false };
  map.debit = find(KEYS.debit, ["card", "data"]);
  map.credit = find(KEYS.credit, ["card", "data"]);
  map.date = find(KEYS.date);
  map.amount = find(KEYS.amount, ["debit", "credit", "sold"]);
  map.desc = find(KEYS.desc);
  if (map.debit > -1 && map.credit > -1) map.amount = -1;
  if (map.desc < 0) {
    let len = 0;
    H.forEach((_, i) => {
      if ([map.date, map.amount, map.debit, map.credit].includes(i)) return;
      let L = 0;
      for (let r = headerIdx + 1; r < Math.min(rows.length, headerIdx + 30); r++) L += String(rows[r][i] ?? "").length;
      if (L > len) { len = L; map.desc = i; }
    });
  }
  let currency = "lei";
  const cur = H.findIndex((h) => ["moneda", "currency", "valuta"].includes(h));
  const v = cur > -1 ? String(rows[headerIdx + 1]?.[cur] ?? "").trim() : "";
  if (v && v.toUpperCase() !== "RON") currency = v;
  return { headerIdx, map, currency };
}

export function categorize(desc, amount, rules) {
  const n = norm(desc);
  for (const r of rules) if (fits(r.cat, amount) && kwRe(r.kw).test(n)) return r.cat;
  for (const [cat, kws] of BUILTIN) if (fits(cat, amount)) for (const k of kws) if (kwRe(k).test(n)) return cat;
  return amount > 0 ? "venituri" : "altele";
}

/** Rânduri + coloane alese -> tranzacții { key, date, desc, amount, auto } */
export function buildTransactions(rows, headerIdx, map, rules) {
  const out = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row.some((c) => String(c ?? "").trim())) continue;
    const date = map.date > -1 ? parseDate(row[map.date]) : null;
    let amount;
    if (map.debit > -1 || map.credit > -1) {
      const d = Math.abs(parseNum(row[map.debit]) || 0);
      const c = Math.abs(parseNum(row[map.credit]) || 0);
      amount = !d && !c ? NaN : c - d;
    } else amount = map.amount > -1 ? parseNum(row[map.amount]) : NaN;
    if (isNaN(amount) || amount === 0) continue;
    if (map.invert) amount = -amount;
    const desc = map.desc > -1 ? String(row[map.desc] ?? "").replace(/\s+/g, " ").trim() : "";
    out.push({ key: `${r}|${desc}|${amount}`, date, desc, amount, auto: categorize(desc, amount, rules) });
  }
  return out;
}

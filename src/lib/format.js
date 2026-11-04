const fmtN = new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MONTHS = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];

export const num = (v) => fmtN.format(v);
export const money = (v, cur = "lei") => `${fmtN.format(v)} ${cur}`;
export const fmtDate = (d) => (d ? d.split("-").reverse().join(".") : "—");
export const monthLabel = (ym) => {
  const [y, m] = ym.split("-");
  return `${MONTHS[+m - 1]} ${y}`;
};

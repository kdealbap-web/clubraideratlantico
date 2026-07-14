// Descarga un CSV client-side (Blob + <a download>). Antepone un BOM (U+FEFF)
// para que Excel abra bien los acentos.
type Cell = string | number | null | undefined;

const BOM = String.fromCharCode(0xfeff);

export function downloadCSV(filename: string, rows: Cell[][]): void {
  const esc = (v: Cell) => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

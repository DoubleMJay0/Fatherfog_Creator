export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Gleichverteilte Zufallszahl 0 … n-1 (kryptografisch, ohne Modulo-Verzerrung). */
export function rand(n) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / n) * n;
  let x;
  do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
  return x % n;
}
/** Ein W10 für Summen: 1–10 (die 0 zählt als 10). */
export const d10 = () => rand(10) + 1;
export const d100 = () => rand(100);

export function rollExpr(expr) {
  const m = /^(\d+)d(\d+)$/.exec(expr);
  if (!m) return { total: 0, dice: [] };
  const dice = Array.from({ length: +m[1] }, () => rand(+m[2]) + 1);
  return { total: dice.reduce((a, b) => a + b, 0), dice };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const KEY = 'fatherfog-creator-v1';
export const store = {
  load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } },
  save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* privater Modus o. Ä. */ } },
  clear() { try { localStorage.removeItem(KEY); } catch { /* egal */ } },
};

export function toast(msg, ms = 2800) {
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.append(t);
  setTimeout(() => t.remove(), ms);
}

export const fmtMod = (n) => (n > 0 ? `+${n}` : `${n}`);
export const pad2 = (n) => String(n).padStart(2, '0');

export function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export const slug = (s) => (s || 'Figur').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'Figur';

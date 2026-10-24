// Erzeugt das ausgefüllte Charakterblatt (Seite 1), eine Chronik (Seite 2+)
// und – falls geheim – ein versiegeltes Beiblatt für das Erbstück.
import * as C from './character.js';
import { RUCKSACKS, STATS, SAVES } from './data/rules.js';
import { SKILLS } from './data/skills.js';
import { pad2 } from './util.js';

const H = 612;            // Seitenhöhe (Querformat Letter)
const W = 792;

const load = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.arrayBuffer(); });

export async function buildPdf(st) {
  const { PDFDocument, rgb } = window.PDFLib;
  const INK = rgb(0.11, 0.12, 0.13);
  const FOG = rgb(0.21, 0.37, 0.31);
  const MUTE = rgb(0.38, 0.38, 0.35);
  const PAPER = rgb(1, 1, 1);

  const [sheetBytes, fellB, fellIB, frakB, picaB] = await Promise.all([
    load('assets/sheet/charakterblatt-de.pdf'),
    load('assets/fonts/IMFellEnglish-Regular.ttf'),
    load('assets/fonts/IMFellEnglish-Italic.ttf'),
    load('assets/fonts/UnifrakturMaguntia.ttf'),
    load('assets/fonts/IMFellDWPica-Regular.ttf'),
  ]);
  const doc = await PDFDocument.load(sheetBytes);
  doc.registerFontkit(window.fontkit);
  const F = {
    fell: await doc.embedFont(fellB), italic: await doc.embedFont(fellIB),
    frak: await doc.embedFont(frakB), pica: await doc.embedFont(picaB),
  };
  doc.setTitle(`Fatherfog – ${st.name}`);
  doc.setAuthor(st.name);
  doc.setSubject('Fatherfog Charakterblatt');
  doc.setCreator('Fatherfog Charaktererschaffung');

  const page = doc.getPages()[0];

  /* ---------- Helfer ---------- */
  const fit = (str, font, size, maxW, min = 4.5) => {
    let s = size;
    while (maxW && font.widthOfTextAtSize(str, s) > maxW && s > min) s -= 0.25;
    return s;
  };
  /** Text; y = Grundlinie von oben gemessen */
  const text = (pg, str, x, y, { size = 9, font = F.fell, color = INK, align = 'left', maxW = 0 } = {}) => {
    str = String(str ?? ''); if (!str) return;
    const s = fit(str, font, size, maxW);
    const w = font.widthOfTextAtSize(str, s);
    const dx = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
    if (font === F.frak) {
      // Frakturligaturen (tt, ch, ck …) einzeln setzen, sonst entstehen Lücken
      let cx = x + dx;
      for (const ch of str) { pg.drawText(ch, { x: cx, y: H - y, size: s, font, color }); cx += font.widthOfTextAtSize(ch, s); }
      return;
    }
    pg.drawText(str, { x: x + dx, y: H - y, size: s, font, color });
  };
  const wrap = (str, font, size, width) => {
    const out = [];
    String(str ?? '').split(/\n/).forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean);
      let line = '';
      words.forEach((w) => {
        const t = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(t, size) <= width) line = t;
        else {
          if (line) out.push(line);
          // überlange Wörter hart umbrechen
          let rest = w;
          while (font.widthOfTextAtSize(rest, size) > width && rest.length > 1) {
            let k = rest.length; while (k > 1 && font.widthOfTextAtSize(rest.slice(0, k) + '-', size) > width) k--;
            out.push(rest.slice(0, k) + '-'); rest = rest.slice(k);
          }
          line = rest;
        }
      });
      out.push(line);
    });
    return out;
  };
  /** Absatz in ein festes Feld setzen: Schrift schrumpft, bis alles passt. */
  const box = (pg, str, { x, top, width, height, size = 8, min = 4.6, font = F.fell, color = INK, align = 'left', lh = 1.18, valign = 'top' }) => {
    let s = size, lines;
    for (;;) {
      lines = wrap(str, font, s, width);
      if (lines.length * s * lh <= height || s <= min) break;
      s -= 0.25;
    }
    const maxLines = Math.floor(height / (s * lh));
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, ' …'); }
    const total = lines.length * s * lh;
    let y = top + (valign === 'middle' ? (height - total) / 2 : 0) + s * 0.9;
    lines.forEach((ln) => {
      const w = font.widthOfTextAtSize(ln, s);
      const lx = align === 'center' ? x + (width - w) / 2 : x;
      pg.drawText(ln, { x: lx, y: H - y, size: s, font, color });
      y += s * lh;
    });
  };
  const diamond = (pg, cx, cy, r = 3.7, color = INK) => pg.drawSvgPath(`M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 Z`, { x: cx, y: H - cy, color });
  const cross = (pg, x0, y0, x1, y1) => {
    pg.drawLine({ start: { x: x0, y: H - y0 }, end: { x: x1, y: H - y1 }, thickness: 1.4, color: INK });
    pg.drawLine({ start: { x: x0, y: H - y1 }, end: { x: x1, y: H - y0 }, thickness: 1.4, color: INK });
  };

  /* ---------- Seite 1: Charakterblatt ---------- */
  const k = C.cls(st);

  // Name & Info
  text(page, st.name, 306, 33.6, { size: 12.5, maxW: 78 });
  const infoLines = [[301, 47.6, 82], [285, 60.7, 98], [285, 74.4, 98], [285, 87.5, 98], [285, 100.6, 98], [285, 114.7, 98], [285, 128.4, 98], [285, 141.5, 98]];
  const cl = C.cloak(st);
  const infoText = (st.info || '').trim() || [k?.name, cl ? `Umhang: ${cl.name}, ${cl.wear?.name.toLowerCase()}` : ''].filter(Boolean).join(' · ');
  {
    let size = 7.6, lines;
    const flow = (s) => {
      const words = infoText.split(/\s+/).filter(Boolean); const res = []; let li = 0; let line = '';
      for (const w of words) {
        const width = infoLines[li]?.[2] ?? 0;
        const t = line ? `${line} ${w}` : w;
        if (F.fell.widthOfTextAtSize(t, s) <= width) line = t;
        else { res.push(line); li++; line = w; if (li >= infoLines.length) return null; }
      }
      res.push(line); return res;
    };
    while (!(lines = flow(size)) && size > 5) size -= 0.25;
    (lines || flow(5) || []).forEach((ln, i) => { const [x, y] = infoLines[i]; text(page, ln, x, y, { size }); });
  }

  // Porträt
  if (st.portrait) {
    const round = await circlePng(st.portrait);
    const img = await doc.embedPng(round);
    page.drawImage(img, { x: 216.8, y: H - 83.5, width: 57.5, height: 57.5 });
  }

  // Gesundheit, Hoffnung, Münzen und Fertigkeitspunkte bleiben auf dem Bogen leer (Bleistift).
  // Die Startwerte stehen auf der Chronik-Seite unter „Zum Eintragen mit Bleistift“.
  const hp = C.health(st); const mh = C.maxHope(st);
  text(page, C.defense(st), 243, 129.5, { size: 18, font: F.pica, align: 'center' });

  // Werte & Rettungswürfe
  const pos = { str: 225.5, int: 286, wil: 345, body: 447.7, mind: 506.5, spirit: 564 };
  [...STATS, ...SAVES].forEach((s) => text(page, C.statValue(st, s.id), 50, pos[s.id] + 8, { size: 24, font: F.pica, align: 'center' }));

  // Klasse & Klassenfertigkeiten
  if (k) {
    const [bx, by] = k.pdf.box;
    cross(page, bx - 3, by - 3, bx + 3, by + 3);
    const g = C.granted(st);
    Object.entries(k.pdf.skills).forEach(([id, [x, y]]) => { if (g[id] === 'Klasse') diamond(page, x, y, 3.4); });
  }

  // Rucksack
  if (st.rucksack) {
    const r = RUCKSACKS[st.rucksack.id];
    page.drawRectangle({ x: 407, y: H - 125, width: 82, height: 88, color: PAPER, opacity: 0.62 });
    text(page, r.name, 448, 46, { size: 10, font: F.pica, align: 'center', maxW: 78 });
    box(page, C.rucksackItems(st).map((t) => `· ${t}`).join('\n'), { x: 410, top: 50, width: 77, height: 72, size: 7, lh: 1.12 });
  }

  // Umhang
  if (cl) {
    text(page, cl.name, 524, 76, { size: 10.5, font: F.pica, align: 'center', maxW: 50 });
    text(page, cl.wear?.name || '', 524, 85, { size: 6.2, font: F.italic, align: 'center', maxW: 52 });
  }

  // Brosche, Kleinod, Erbstück
  const b = C.brooch(st); const t = C.trinket(st); const a = C.artifactEntry(st);
  if (b) box(page, b, { x: 559, top: 37, width: 60, height: 41, size: 7.6, align: 'center', valign: 'middle' });
  if (t) box(page, t, { x: 624, top: 37, width: 60, height: 41, size: 7.6, align: 'center', valign: 'middle' });
  if (a) {
    if (st.artifactSecret) {
      text(page, 'versiegelt', 727, 58, { size: 10, font: F.italic, align: 'center' });
      text(page, 'siehe Beiblatt', 727, 67, { size: 6, font: F.fell, align: 'center', color: MUTE });
    } else box(page, a[0], { x: 689, top: 37, width: 76, height: 41, size: 8.5, align: 'center', valign: 'middle' });
  } else if (!st.first) {
    text(page, '(erbt es)', 727, 62, { size: 7, font: F.italic, align: 'center', color: MUTE });
  }

  // Münzen & Rationen
  text(page, C.rations(st), 750, 116, { size: 15, font: F.pica, align: 'center' });

  // Fertigkeiten
  const own = C.owned(st);
  SKILLS.forEach((s) => {
    if (!own.has(s.id)) return;
    diamond(page, s.sx, s.sy, 3.9);
    const spec = st.bought[s.id]?.spec || st.specs[s.id];
    if (s.spec && spec) {
      // grauen Platzhalter überdecken und Spezialgebiet eintragen
      const right = s.tier === 2 ? 613 : 736;
      page.drawRectangle({ x: s.lx - 0.5, y: H - (s.ltop + 9), width: right - s.lx, height: 9.2, color: PAPER });
      text(page, `${s.spec}: ${spec}`, s.lx, s.ltop + 7, { size: 7.6, font: F.italic, maxW: right - s.lx - 1 });
    }
  });

  /* ---------- Chronik ---------- */
  const M = 42; const COLW = (W - M * 2 - 30) / 2;
  let pg, col, y;
  const frame = (p) => {
    p.drawRectangle({ x: 18, y: 18, width: W - 36, height: H - 36, borderColor: INK, borderWidth: 1.6 });
    p.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, borderColor: INK, borderWidth: 0.5 });
  };
  const newPage = (title, sub) => {
    pg = doc.addPage([W, H]); frame(pg); col = 0;
    text(pg, title, M, 70, { size: 34, font: F.frak, maxW: 520 });
    if (sub) text(pg, sub, M, 88, { size: 11, font: F.italic, color: MUTE, maxW: 520 });
    pg.drawLine({ start: { x: M, y: H - 98 }, end: { x: W - M, y: H - 98 }, thickness: 0.8, color: INK });
    y = 116;
  };
  const colX = () => M + col * (COLW + 30);
  const BOTTOM = H - 46;
  const ensure = (h) => {
    if (y + h <= BOTTOM) return;
    if (col === 0) { col = 1; y = 116; return; }
    newPage(st.name, 'Chronik · Fortsetzung');
  };
  const heading = (str) => {
    ensure(34); y += 6;
    diamond(pg, colX() + 3, y - 3.5, 2.8, FOG);
    text(pg, str.toUpperCase(), colX() + 11, y, { size: 8.5, font: F.pica, color: FOG });
    y += 13;
  };
  const para = (str, { size = 9.5, font = F.fell, color = INK, indent = 0, gap = 5 } = {}) => {
    if (!str) return;
    wrap(str, font, size, COLW - indent).forEach((ln) => { ensure(size * 1.3); text(pg, ln, colX() + indent, y, { size, font, color }); y += size * 1.3; });
    y += gap;
  };
  const kv = (label, val) => {
    ensure(12);
    text(pg, label, colX(), y, { size: 9.5, font: F.italic, color: MUTE });
    para(val, { indent: 92, gap: 1 });
  };

  newPage(st.name, [k?.name, cl ? `Umhang in ${cl.name}` : '', st.first ? '' : 'Ersatzfigur'].filter(Boolean).join(' · '));
  if (st.portrait) {
    const round = await circlePng(st.portrait);
    const img = await doc.embedPng(round);
    pg.drawImage(img, { x: W - M - 72, y: H - 92, width: 66, height: 66 });
  }

  heading('Zum Eintragen mit Bleistift');
  kv('Gesundheit', `${hp} (Maximum = Stärke)`);
  kv('Hoffnung', `${mh} (Maximum ${mh})`);
  kv('Münzen', `${C.coins(st) ?? 0}`);
  kv('Fertigk.-Pkt.', `${C.pointsLeft(st)}`);
  y += 4;
  heading('Werte & Zustand');
  kv('Abwehr', `${C.defense(st)}`);
  kv('Werte', STATS.map((s) => `${s.name} ${C.statValue(st, s.id)}`).join('  ·  '));
  kv('Rettung', SAVES.map((s) => `${s.name} ${C.statValue(st, s.id)}`).join('  ·  '));
  y += 4;

  if (k) {
    heading(`Klasse: ${k.name}`);
    para(k.tagline + ' ' + k.text[1], { size: 9 });
    k.traits.forEach((tr) => para(`${tr.name}: ${tr.text}`, { size: 9, font: F.italic }));
  }
  if (cl) {
    heading('Umhang');
    para(`${cl.name} – ${cl.meaning}`, { size: 9 });
    if (cl.wear) para(`Getragen: ${cl.wear.name}. ${cl.wear.text}`, { size: 8.5, color: MUTE });
  }
  if (b) { heading(`Brosche · ${pad2(st.brooch)}`); para(b); }
  if (t) { heading(`Kleinod · ${pad2(st.trinket)}`); para(t); }
  const coin = C.coinEntry(st);
  if (coin) {
    heading(`Münzen · ${coin[0]}`);
    para(coin[1], { size: 9, font: F.italic });
  }
  if (a && !st.artifactSecret) { heading(`Erbstück · ${a[0]}`); para(a[1], { size: 9 }); }

  if (st.rucksack) {
    heading(`Rucksack: ${RUCKSACKS[st.rucksack.id].name}`);
    para(C.rucksackItems(st).join(' · ') + ' · Wasserschlauch (voll)', { size: 9 });
  }
  const list = C.skillList(st);
  if (list.length) {
    heading(`Fertigkeiten · ${C.pointsLeft(st)} Punkte übrig`);
    list.forEach((x) => para(`${C.skillLabel(x.id, x.spec)}  +${C.BONUS[x.s.tier]}  {${x.s.stats}}${x.source !== 'gekauft' ? `  – ${x.source}` : ''}`, { size: 9, gap: 1 }));
    y += 4;
  }
  const qs = Object.entries(st.answers || {}).filter(([, v]) => v && v.trim());
  if (qs.length) {
    heading('Aus der Chronik');
    const { QUESTIONS } = await import('./data/story.js');
    const all = [...QUESTIONS.common, QUESTIONS[st.classId]].filter(Boolean);
    qs.forEach(([id, v]) => {
      const q = all.find((x) => x.id === id)?.q.replace('{trinket}', t || 'dein Kleinod').replace('{brooch}', b || '') || '';
      para(q, { size: 8.5, font: F.italic, color: MUTE, gap: 1 });
      para(v.trim(), { size: 9.5 });
    });
  }

  /* ---------- Versiegeltes Beiblatt ---------- */
  if (a && st.artifactSecret) {
    const p = doc.addPage([W, H]); frame(p);
    const cx = W / 2;
    text(p, 'Versiegelt – nur für dich und die Spielleitung', cx, 92, { size: 11, font: F.italic, color: MUTE, align: 'center' });
    // Siegel
    try {
      const sealImg = await doc.embedPng(await load('assets/img/vignettes/siegel.png'));
      p.drawImage(sealImg, { x: cx - 42, y: H - 192, width: 84, height: 84 * sealImg.height / sealImg.width });
    } catch { p.drawCircle({ x: cx, y: H - 150, size: 30, color: rgb(0.3, 0.42, 0.33) }); }
    text(p, `Erbstück · ${pad2(st.artifact)}`, cx, 214, { size: 9, font: F.pica, color: FOG, align: 'center' });
    text(p, a[0], cx, 250, { size: 32, font: F.frak, align: 'center', maxW: W - 160 });
    box(p, a[1], { x: 170, top: 272, width: W - 340, height: 220, size: 12, min: 8, align: 'center', lh: 1.35 });
    text(p, `Besitz von ${st.name}. Stirbt diese Figur, erbt deine nächste Figur dieses Erbstück.`, cx, 520, { size: 9, font: F.italic, color: MUTE, align: 'center' });
  }

  return doc.save();
}

/** Porträt (JPEG-DataURL) → kreisrund freigestelltes PNG (Uint8Array) */
function circlePng(dataUrl) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = 360; const cv = document.createElement('canvas'); cv.width = cv.height = s;
      const g = cv.getContext('2d');
      g.beginPath(); g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); g.closePath(); g.clip();
      g.filter = 'grayscale(1) contrast(1.15)';
      g.drawImage(img, 0, 0, s, s);
      cv.toBlob(async (blob) => res(new Uint8Array(await blob.arrayBuffer())), 'image/png');
    };
    img.onerror = rej; img.src = dataUrl;
  });
}

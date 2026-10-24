import { CHAPTERS, QUESTIONS, ENDINGS } from './data/story.js';
import { CLASSES, RUCKSACKS, CLOAKS, CLOAK_WEAR, STATS, SAVES, STAT_CAP, SKILL_COST } from './data/rules.js';
import { SKILLS } from './data/skills.js';
import { BROOCHES, TRINKETS, COINS, ARTIFACTS } from './data/tables.js';
import * as C from './character.js';
import { esc, rand, rollExpr, sleep, store, toast, fmtMod, pad2, download, slug } from './util.js';
import { rollInto, showDice, rollD100, showD100 } from './dice.js';
import { plate, imgBox, hydrateImages } from './images.js';
import { sound, music } from './sound.js';

/* ------------------------------------------------------------------ */
/* Zustand                                                             */
/* ------------------------------------------------------------------ */
let st = Object.assign(C.blank(), store.load() || {});
let prefs = { manual: false };
try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem('ff-prefs') || '{}')); } catch { /* egal */ }
const savePrefs = () => { try { localStorage.setItem('ff-prefs', JSON.stringify(prefs)); } catch { /* egal */ } };

const save = () => store.save(st);
const stage = document.getElementById('stage');
const ledger = document.getElementById('ledger');
const pathNav = document.querySelector('.path');
let busy = false;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
function renderPath() {
  pathNav.innerHTML = CHAPTERS.map((ch, i) => {
    const done = i < st.chapter && C.chapterDone(st, ch.id);
    const cur = i === st.chapter;
    const label = ch.num || '✶';
    return `<button class="beacon${done ? ' is-done' : ''}${cur ? ' is-current' : ''}" data-goto="${i}" ${i > st.reached ? 'disabled' : ''}
      title="${esc(ch.title)}" aria-label="${esc((ch.num ? `Kapitel ${ch.num}: ` : '') + ch.title)}" ${cur ? 'aria-current="step"' : ''}><span>${label}</span></button>`;
  }).join('');
}

async function go(i, { instant = false } = {}) {
  if (busy) return;
  i = Math.max(0, Math.min(CHAPTERS.length - 1, i));
  const veil = document.querySelector('.veil');
  if (!instant) { veil.classList.add('is-on'); await sleep(420); }
  st.chapter = i; st.reached = Math.max(st.reached, i);
  save();
  closeSheet();
  render({ animate: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  stage.focus({ preventScroll: true });
  if (!instant) { await sleep(60); veil.classList.remove('is-on'); }
}

document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-goto]');
  if (g && !g.disabled) { e.preventDefault(); go(+g.dataset.goto); }
});

/* ------------------------------------------------------------------ */
/* Bausteine                                                           */
/* ------------------------------------------------------------------ */
const ch = () => CHAPTERS[st.chapter];

/* Kleine Vignetten (assets/img/vignettes/*.png, freigestellt) */
const VIG = {
  prolog: ['apfel', 'r'], stats: ['giftpilze', 'l'], saves: ['rabe', 'r'], class: ['kerze', 'l'],
  rucksack: ['flaeschchen', 'r'], cloak: ['spindel', 'l'], keepsakes: ['spiegel', 'r'], coin: ['apfel', 'l'],
  artifact: ['schluessel', 'r'], skills: ['flaeschchen', 'l'], finish: ['kerze', 'r'],
};
const vig = (name, side = 'r') => `<img class="vig vig--${side}" src="assets/img/vignettes/${name}.png" style="shape-outside:url(assets/img/vignettes/${name}.png)" alt="" aria-hidden="true" decoding="async">`;
const orn = (name) => `<div class="rule-orn rule-orn--vig"><img src="assets/img/vignettes/${name}.png" alt="" aria-hidden="true" loading="lazy"></div>`;
const chapterVig = (id) => (VIG[id] ? vig(...VIG[id]) : '');

function head(c, extra = '') {
  return `<header class="chapter-head">
    ${c.num ? `<p class="kicker">Kapitel ${c.num}</p>` : ''}
    <h1 class="title">${esc(c.title)}</h1>
    ${c.sheet ? `<span class="sheet-ref">Charakterblatt · ${esc(c.sheet)}</span>` : ''}
    </header>
    ${c.quote ? `<p class="quote quote--chapter">${esc(c.quote[0])}<cite>${esc(c.quote[1])}</cite></p>` : ''}
    <p class="lead">${esc(c.lead)}</p>
    <div class="prose">${chapterVig(c.id)}${c.text.map((p) => `<p>${esc(p)}</p>`).join('')}${extra}</div>`;
}

function nav(done, hint = '') {
  const last = st.chapter === CHAPTERS.length - 1;
  return `<div class="nav">
    ${st.chapter > 0 ? `<button class="btn btn--ghost" data-act="back">Zurück</button>` : '<span></span>'}
    ${!done && hint ? `<span class="nav__hint">${esc(hint)}</span>` : ''}
    ${last ? '' : `<button class="btn" data-act="next" ${done ? '' : 'disabled'}>Weiter</button>`}
  </div>`;
}

function layout(plateHtml, bodyHtml, { wide = false } = {}) {
  if (wide || !plateHtml) return `<article class="chapter chapter--wide">${bodyHtml}</article>`;
  return `<article class="chapter"><div class="chapter__plate">${plateHtml}</div><div class="chapter__body">${bodyHtml}</div></article>`;
}

/* ------------------------------------------------------------------ */
/* Kapitel                                                             */
/* ------------------------------------------------------------------ */
const R = {};

/* Prolog ------------------------------------------------------------ */
R.prolog = () => {
  const c = ch();
  const hasProgress = st.reached > 0;
  return layout(plate(c.img, { caption: c.caption, label: 'Das Nebelhaus' }), `
    <div class="prolog">
      <p class="kicker">Ein Märchen-Horror-Rollenspiel</p>
      <h1 class="title">Fatherfog</h1>
      <p class="lead">${esc(c.lead)}</p>
      <div class="prose">${chapterVig('prolog')}${c.text.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      ${orn('rabe')}
      <p class="quote">„Der Jäger brachte es nicht übers Herz, sie zu töten. Und als gerade ein junger Frischling dahergesprungen kam, stach er ihn ab, nahm Lunge und Leber heraus und brachte sie als Wahrzeichen der Königin mit.“<cite>Schneewittchen</cite></p>
      <div class="rule-orn"><span></span></div>
      <p class="prose" style="margin:0 0 10px">Welche Figur erschaffst du?</p>
      <div class="start choices choices--2">
        <button class="option${st.first ? ' is-selected' : ''}" data-first="1" aria-pressed="${st.first}">
          <span class="num">Mit Erbstück</span><h3>Erste Figur</h3>
          <span>Deine erste Figur erhält ein Erbstück aus den alten Geschichten.</span>
        </button>
        <button class="option${!st.first ? ' is-selected' : ''}" data-first="0" aria-pressed="${!st.first}">
          <span class="num">Die Nachfolge</span><h3>Ersatzfigur</h3>
          <span>Sie wartet, bis die erste stirbt – und erbt dann deren Erbstück.</span>
        </button>
      </div>
      <label class="check"><input type="checkbox" id="manual" ${prefs.manual ? 'checked' : ''}> <span>Ich würfle mit echten Würfeln und trage die Ergebnisse selbst ein.</span></label>
      <div class="actions">
        <button class="btn btn--big" data-act="begin">${hasProgress ? 'Weitergehen' : 'In den Nebel'}</button>
        ${hasProgress ? '<button class="btn btn--link" data-act="reset">Neue Figur beginnen</button>' : ''}
      </div>
    </div>`);
};
R.prolog.bind = (root) => {
  root.querySelectorAll('[data-first]').forEach((b) => b.addEventListener('click', () => {
    st.first = b.dataset.first === '1'; save(); render();
  }));
  root.querySelector('#manual').addEventListener('change', (e) => { prefs.manual = e.target.checked; savePrefs(); syncMenu(); });
  root.querySelector('[data-act=begin]').addEventListener('click', () => { sound.horn(); go(st.reached > 0 ? st.reached : 1); });
  root.querySelector('[data-act=reset]')?.addEventListener('click', resetAll);
};

/* Werte & Rettung ---------------------------------------------------- */
function rollChapter(kind) {
  const list = kind === 'stats' ? STATS : SAVES;
  const bag = st[kind];
  const c = ch();
  const avg = kind === 'stats' ? 30 : 25;
  const rows = list.map((s) => {
    const r = bag[s.id];
    return `<div class="roll" data-id="${s.id}">
      <div class="roll__name">${esc(s.name)}<small>${esc(s.blurb)}</small></div>
      <div class="tray" aria-live="polite"></div>
      <div>
        ${prefs.manual ? `<div class="roll__manual"><input type="number" inputmode="numeric" min="${s.dice}" max="${s.dice * 10}" value="${r?.total ?? ''}" aria-label="${esc(s.name)} (Summe aus ${s.dice}W10)" placeholder="${s.dice}W10"></div>`
          : r ? `<div class="roll__total">${r.total}</div>`
            : `<div class="roll__act"><button class="btn btn--fog btn--sm" data-rollrow="${s.id}">${s.dice}W10</button></div>`}
      </div>
    </div>`;
  }).join('');
  const all = list.every((s) => bag[s.id]);
  return layout(plate(c.img, { caption: c.caption }), `
    ${head(c)}
    <div class="rolls">${rows}</div>
    <div class="actions">
      ${all && !prefs.manual ? '<button class="btn btn--link" data-act="reroll">Die Spielleitung erlaubt einen Neuwurf</button>' : ''}
    </div>
    ${all ? `<p class="prose" style="margin-top:14px"><em>Summe ${list.reduce((a, s) => a + bag[s.id].total, 0)} – gewöhnlich wären ${avg * 3}.</em></p>` : ''}
    ${nav(C.chapterDone(st, kind), 'Erst würfeln.')}`);
}
function bindRoll(kind) {
  return (root) => {
    const list = kind === 'stats' ? STATS : SAVES;
    const bag = st[kind];
    list.forEach((s) => { const r = bag[s.id]; if (r?.dice?.length) showDice(root.querySelector(`[data-id=${s.id}] .tray`), r.dice); });
    root.querySelectorAll('.roll__manual input').forEach((inp) => inp.addEventListener('change', () => {
      const id = inp.closest('.roll').dataset.id; const s = list.find((x) => x.id === id);
      const v = parseInt(inp.value, 10);
      if (Number.isFinite(v) && v >= s.dice && v <= s.dice * 10) { bag[id] = { dice: [], total: v }; }
      else { bag[id] = null; if (inp.value) toast(`${s.name}: ${s.dice}W10 ergeben ${s.dice} bis ${s.dice * 10}.`); }
      save(); updateNav(root); renderLedger();
    }));
    // Nur der nächste Wurf in der Reihenfolge ist freigegeben
    const update = () => {
      const next = list.find((s) => !bag[s.id]);
      root.querySelectorAll('[data-rollrow]').forEach((b) => { b.disabled = b.dataset.rollrow !== next?.id; });
      return next;
    };
    update();
    root.querySelectorAll('[data-rollrow]').forEach((btn) => btn.addEventListener('click', async () => {
      const s = list.find((x) => x.id === btn.dataset.rollrow); if (!s || busy || bag[s.id]) return;
      busy = true; btn.disabled = true;
      const row = btn.closest('.roll');
      const dice = await rollInto(row.querySelector('.tray'), s.dice);
      const total = dice.reduce((a, b) => a + b, 0);
      bag[s.id] = { dice, total };
      btn.parentElement.outerHTML = `<div class="roll__total is-fresh">${total}</div>`;
      save(); renderLedger(); busy = false;
      if (list.every((x) => bag[x.id])) { await sleep(600); render(); return; }
      const next = update();
      const nrow = next && root.querySelector(`[data-id=${next.id}]`);
      if (nrow) { const r = nrow.getBoundingClientRect(); if (r.bottom > innerHeight - 70) nrow.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }));
    root.querySelector('[data-act=reroll]')?.addEventListener('click', () => {
      if (!confirm('Alle Würfe dieses Kapitels verwerfen und neu würfeln?')) return;
      list.forEach((s) => { bag[s.id] = null; }); save(); render();
    });
  };
}
R.stats = () => rollChapter('stats'); R.stats.bind = bindRoll('stats');
R.saves = () => rollChapter('saves'); R.saves.bind = bindRoll('saves');

/* Klasse -------------------------------------------------------------- */
const STAT_NAMES = { str: 'Stärke', int: 'Intellekt', wil: 'Wille', body: 'Körper', mind: 'Verstand', spirit: 'Seele' };
R.class = () => {
  const c = ch();
  const sel = C.cls(st);
  if (deckIdx == null) deckIdx = Math.max(0, CLASSES.findIndex((k) => k.id === st.classId));
  const ROMAN = ['I', 'II', 'III', 'IV'];
  const TILT = [-1.6, 1.2, -0.8, 1.8];
  const ARROW = (dir) => `<svg viewBox="0 0 96 40" aria-hidden="true" ${dir > 0 ? 'style="transform:scaleX(-1)"' : ''}>
      <path class="ah" d="M4 20 L28 7 Q22 20 28 33 Z"/>
      <path class="sh" d="M24 18 H78 M24 22 H78"/>
      <path class="fl" d="M64 18 L76 8 M70 18 L82 8 M64 22 L76 32 M70 22 L82 32"/>
      <path class="ah" d="M86 20 l4 -4 l4 4 l-4 4 z"/>
    </svg>`;
  const cards = CLASSES.map((k, i) => `
    <article class="pcard${st.classId === k.id ? ' is-chosen' : ''}" data-i="${i}" data-cls="${k.id}" style="--tilt:${TILT[i]}deg" aria-roledescription="Steckbrief" aria-label="${esc(k.name)}">
      <span class="pcard__nail" aria-hidden="true"></span>
      <div class="pcard__paper">
        <p class="pcard__head">Gesucht</p>
        <p class="pcard__sub">Aushang des Nebelhauses · No. ${ROMAN[i]}</p>
        <div class="pcard__frame">${imgBox('class-' + k.id, k.name)}</div>
        <h3>${esc(k.name)}</h3>
        <p class="pcard__tag">„${esc(k.tagline)}“</p>
        <p class="pcard__marks"><span>Kennzeichen</span>${Object.entries(k.mods).map(([id, v]) => `<b class="${v < 0 ? 'neg' : ''}">${STAT_NAMES[id].slice(0, 3).toUpperCase()} ${fmtMod(v)}</b>`).join('<i>·</i>')}</p>
        ${st.classId === k.id ? '<span class="pcard__stamp">Gewählt</span>' : ''}
      </div>
    </article>`).join('');
  const cur = CLASSES[deckIdx];
  const deck = `
    <section class="deck" aria-label="Klassen – Steckbriefe durchblättern" tabindex="0">
      <button class="deck__nav deck__nav--prev" type="button" aria-label="Vorherige Klasse">${ARROW(-1)}<span>zurück</span></button>
      <div class="deck__track">${cards}</div>
      <button class="deck__nav deck__nav--next" type="button" aria-label="Nächste Klasse">${ARROW(1)}<span>weiter</span></button>
    </section>
    <div class="deck__dots" role="tablist">${CLASSES.map((k, i) => `<button type="button" role="tab" class="deck__dot${i === deckIdx ? ' is-on' : ''}${st.classId === k.id ? ' is-chosen' : ''}" data-dot="${i}" aria-selected="${i === deckIdx}" aria-label="${esc(k.name)}"><i></i><span>${esc(k.short)}</span></button>`).join('')}</div>
    <div class="deck__pick">
      <span class="deck__count">Karte ${deckIdx + 1} von ${CLASSES.length}</span>
      <button class="btn btn--fog" type="button" data-pick ${st.classId === cur.id ? 'disabled' : ''}>${st.classId === cur.id ? `${esc(cur.name)} – gewählt` : `${esc(cur.name)} wählen`}</button>
    </div>`;

  let detail = '';
  if (sel) {
    const all = [...STATS, ...SAVES];
    const rows = all.map((s) => {
      const raw = C.statRaw(st, s.id); const v = C.statValue(st, s.id); const m = sel.mods[s.id] ?? 0;
      return `<dt>${esc(s.name)}</dt><dd>${(st.stats[s.id] ?? st.saves[s.id])?.total ?? '—'}${m ? ` <span class="${m < 0 ? 'mod--neg' : 'mod--pos'}">${fmtMod(m)}</span>` : ''} → <b>${v ?? '—'}</b>${raw > STAT_CAP ? ' <small title="Kein Grundwert darf 75 übersteigen.">(max. 75)</small>' : ''}</dd>`;
    }).join('');
    const choiceHtml = sel.choices.map((pair, i) => `
      <div class="or" role="radiogroup" aria-label="Wahl ${i + 1}">
        ${pair.map((id, j) => `${j ? '<span class="or__word">oder</span>' : ''}<label class="pill"><input type="radio" name="ch${i}" value="${id}" ${st.choices[i] === id ? 'checked' : ''}><span class="diamond"></span>${esc(C.SKILL[id].name)}</label>`).join('')}
      </div>`).join('');
    detail = `${orn('schluessel')}<div class="detail">
      <div>
        <h2 class="title" style="font-size:52px;margin-bottom:8px">${esc(sel.name)}</h2>
        <div class="prose">${sel.text.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      </div>
      <div>
        <p class="kicker">4. Klassenmerkmal</p>
        ${sel.traits.map((t) => `<div class="trait"><b>${esc(t.name)}</b>${esc(t.text)}</div>`).join('')}
        <p class="kicker" style="margin-top:22px">Werte & Rettungswürfe</p>
        <div class="ledger-like"><dl class="kv">${rows}</dl></div>
        <p class="kicker" style="margin-top:22px">Klassenfertigkeiten</p>
        ${sel.skills.length ? `<div class="or">${sel.skills.map((id) => `<span class="pill" style="cursor:default"><span class="diamond diamond--on"></span>${esc(C.SKILL[id].name)}</span>`).join('')}</div>` : ''}
        ${choiceHtml}
        <p class="prose"><em>${sel.points} Fertigkeitspunkte</em> zum Ausgeben in Kapitel IX.</p>
      </div>
    </div>`;
  }
  return layout(null, `
    <div style="max-width:880px;margin:0 auto">${head(c)}</div>
    ${deck}
    ${detail}
    ${nav(C.chapterDone(st, 'class'), sel ? 'Triff deine Wahl.' : 'Wähle eine Klasse.')}`, { wide: true });
};
let deckIdx = null;
let deckStep = null;
// Pfeiltasten blättern im Klassenkapitel, ohne dass das Deck fokussiert sein muss
document.addEventListener('keydown', (e) => {
  if (ch().id !== 'class' || !deckStep || e.defaultPrevented) return;
  if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); deckStep(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); deckStep(1); }
});
function pickClass(id) {
  if (st.classId === id) return;
  const hadSkills = Object.keys(st.bought).length;
  st.classId = id; st.choices = [];
  const k = C.cls(st);
  if (st.rucksack && !k.rucksacks.includes(st.rucksack.id)) st.rucksack = null;
  if (hadSkills) { st.bought = {}; toast('Klasse gewechselt – gekaufte Fertigkeiten wurden zurückgesetzt.'); }
  sound.swell(); save(); render();
  document.querySelector('.detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
R.class.bind = (root) => {
  const n = CLASSES.length;
  const cards = [...root.querySelectorAll('.pcard')];
  const layoutDeck = () => {
    cards.forEach((el, i) => {
      let o = (i - deckIdx + n) % n; if (o > n / 2) o -= n;   // −1, 0, 1, 2 …
      el.style.setProperty('--o', o);
      el.style.setProperty('--a', Math.abs(o));
      el.classList.toggle('is-front', o === 0);
      el.classList.toggle('is-far', Math.abs(o) > 1);
      el.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
    });
    root.querySelectorAll('.deck__dot').forEach((d, i) => { d.classList.toggle('is-on', i === deckIdx); d.setAttribute('aria-selected', String(i === deckIdx)); });
    const cur = CLASSES[deckIdx]; const pick = root.querySelector('[data-pick]');
    pick.disabled = st.classId === cur.id;
    pick.textContent = st.classId === cur.id ? `${cur.name} – gewählt` : `${cur.name} wählen`;
    root.querySelector('.deck__count').textContent = `Karte ${deckIdx + 1} von ${n}`;
  };
  const step = (d) => { deckIdx = (deckIdx + d + n) % n; sound.swish(); layoutDeck(); };
  layoutDeck();
  root.querySelectorAll('.deck__nav').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());   // nicht als Wischen werten
    btn.addEventListener('click', (e) => { e.stopPropagation(); step(btn.classList.contains('deck__nav--prev') ? -1 : 1); });
  });
  deckStep = step;
  root.querySelectorAll('[data-dot]').forEach((d) => d.addEventListener('click', () => { deckIdx = +d.dataset.dot; sound.swish(); layoutDeck(); }));
  cards.forEach((el) => el.addEventListener('click', () => {
    const i = +el.dataset.i;
    if (i === deckIdx) pickClass(el.dataset.cls); else { deckIdx = i; sound.swish(); layoutDeck(); }
  }));
  root.querySelector('[data-pick]').addEventListener('click', () => pickClass(CLASSES[deckIdx].id));
  const deck = root.querySelector('.deck');
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') pickClass(CLASSES[deckIdx].id);
  });
  // Wischen
  let x0 = null, y0 = null, swiped = false;
  deck.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; swiped = false; });
  deck.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; step(dx < 0 ? 1 : -1); }
  });
  // Klick direkt nach dem Wischen ignorieren
  deck.addEventListener('click', (e) => { if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);
  root.querySelectorAll('.or input[type=radio]').forEach((inp) => inp.addEventListener('change', () => {
    st.choices[+inp.name.slice(2)] = inp.value; C.normalizeSkills(st); save(); updateNav(root); renderLedger();
  }));
};

/* Rucksack ------------------------------------------------------------ */
R.rucksack = () => {
  const c = ch(); const k = C.cls(st);
  const opts = k.rucksacks.map((id) => {
    const r = RUCKSACKS[id];
    const chosen = st.rucksack?.id === id;
    const items = r.items.map((it, i) => {
      if (typeof it === 'string') return esc(it);
      if (!it.roll) return esc(it.t);
      const n = chosen ? st.rucksack.rolls?.[i] : null;
      return esc(it.t.replace('{n}', n ?? it.roll.replace('d', 'W')));
    });
    return `<button class="option${chosen ? ' is-selected' : ''}" data-ruck="${id}" aria-pressed="${chosen}">
      ${imgBox('rucksack-' + id, r.name)}
      <div style="padding-top:12px"><span class="num">${r.num}</span><h3>${esc(r.name)}</h3><ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul></div>
    </button>`;
  }).join('');
  return layout(null, `
    <div style="max-width:880px;margin:0 auto">${head(c)}</div>
    <div class="choices choices--3 ruck">${opts}</div>
    ${nav(C.chapterDone(st, 'rucksack'), 'Wähle einen Rucksack.')}`, { wide: true });
};
R.rucksack.bind = (root) => {
  root.querySelectorAll('.ruck .plate__img').forEach((b) => { b.style.aspectRatio = '3 / 2'; });
  root.querySelectorAll('[data-ruck]').forEach((b) => b.addEventListener('click', async () => {
    if (busy || st.rucksack?.id === b.dataset.ruck) return;
    const id = b.dataset.ruck; const r = RUCKSACKS[id];
    const rolls = {};
    root.querySelectorAll('.ruck-roll').forEach((x) => x.remove());
    const area = document.createElement('div'); area.className = 'ruck-roll'; area.setAttribute('aria-live', 'polite');
    b.append(area);
    busy = true;
    for (const [i, it] of r.items.entries()) {
      if (typeof it !== 'object' || !it.roll) continue;
      const [n, sides] = it.roll.split('d').map(Number);
      if (prefs.manual) {
        const v = parseInt(prompt(`${it.t.replace('{n} ', '')}: Wie viel zeigen deine ${n}W${sides}?`, '') || '', 10);
        rolls[i] = Number.isFinite(v) && v >= n && v <= n * sides ? v : rollExpr(it.roll).total;
      } else {
        const row = document.createElement('div'); row.className = 'd100';
        row.innerHTML = `<span class="kicker" style="margin:0">${esc(it.t.replace('{n} ', ''))}</span><span class="tray"></span><b class="d100__result" style="font-size:30px;font-weight:400"></b>`;
        area.append(row);
        const dice = await rollInto(row.querySelector('.tray'), n);
        rolls[i] = dice.reduce((a, x) => a + x, 0);
        row.querySelector('.d100__result').textContent = rolls[i];
      }
    }
    st.rucksack = { id, rolls };
    busy = false; save(); await sleep(prefs.manual ? 0 : 700); render();
  }));
};

/* Umhang --------------------------------------------------------------- */
R.cloak = () => {
  const c = ch(); const cl = C.cloak(st);
  const sw = CLOAKS.map((k, i) => `<button class="swatch${st.cloak?.idx === i ? ' is-selected' : ''}" data-cloak="${i}" aria-pressed="${st.cloak?.idx === i}" title="${i} · ${esc(k.name)}"><i style="background:${k.hex}"></i><span>${esc(k.name)}</span></button>`).join('');
  return layout(plate(c.img, { caption: c.caption }), `
    ${head(c)}
    <div class="d100"><span class="tray" id="cloak-tray"></span><button class="btn btn--fog" data-act="roll">1W10 würfeln</button></div>
    <p class="prose" style="margin:16px 0 8px"><em>… oder wähle selbst:</em></p>
    <div class="cloaks">${sw}</div>
    ${cl ? `<div class="reveal is-new"><div class="reveal__kicker">Dein Umhang</div><div class="reveal__title">${esc(cl.name)}</div><p class="reveal__text">${esc(cl.meaning)}</p></div>
    <p class="kicker" style="margin-top:24px">Wie trägst du ihn?</p>
    <div class="choices choices--3">${CLOAK_WEAR.map((w) => `<button class="option${st.cloak.wear === w.id ? ' is-selected' : ''}" data-wear="${w.id}" aria-pressed="${st.cloak.wear === w.id}"><h3 style="font-size:24px">${esc(w.name)}</h3><span style="font-size:16px;color:var(--ink-2)">${esc(w.text)}</span></button>`).join('')}</div>` : ''}
    ${nav(C.chapterDone(st, 'cloak'), 'Würfle oder wähle eine Farbe.')}`);
};
R.cloak.bind = (root) => {
  const tray = root.querySelector('#cloak-tray');
  if (st.cloak && st.cloak.rolled != null) showDice(tray, [st.cloak.rolled === 0 ? 10 : st.cloak.rolled]);
  const set = (idx, rolled = null) => { st.cloak = { idx, wear: st.cloak?.wear || 'over', rolled }; save(); sound.swell(); render(); };
  root.querySelectorAll('[data-cloak]').forEach((b) => b.addEventListener('click', () => set(+b.dataset.cloak)));
  root.querySelectorAll('[data-wear]').forEach((b) => b.addEventListener('click', () => { st.cloak.wear = b.dataset.wear; save(); render(); }));
  root.querySelector('[data-act=roll]').addEventListener('click', async () => {
    if (busy) return;
    if (prefs.manual) { const v = parseInt(prompt('Was zeigt dein W10? (0–9)', '') || '', 10); if (v >= 0 && v <= 9) set(v, v); return; }
    busy = true;
    const [v] = await rollInto(tray, 1);
    busy = false; await sleep(350); set(v % 10, v % 10);
  });
};

/* W100-Hilfe ----------------------------------------------------------- */
async function d100Into(tray) {
  if (prefs.manual) {
    const v = parseInt(prompt('Was zeigen deine beiden W10? (00–99)', '') || '', 10);
    if (Number.isFinite(v) && v >= 0 && v <= 99) { showD100(tray, v); return v; }
    return null;
  }
  return rollD100(tray);
}

/* Brosche & Kleinod ---------------------------------------------------- */
R.keepsakes = () => {
  const c = ch();
  const card = (key, title, list, kicker, text) => {
    const v = st[key];
    const icon = { brooch: 'brosche', trinket: 'kleinod' }[key];
    return `<section data-key="${key}">
      <div class="ks-head">
        <img class="ks-icon ks-icon--${key}" src="assets/img/vignettes/${icon}.png" alt="" aria-hidden="true">
        <div><h2>${title}</h2>
        <p class="prose" style="margin:0;color:var(--ink-2)">${esc(text)}</p></div>
      </div>
      <div class="d100"><span class="tray"></span><span class="d100__result">${v == null ? '' : pad2(v)}</span>
        ${v == null ? `<button class="btn btn--fog" data-roll="${key}">1W100 würfeln</button>` : ''}</div>
      ${v != null ? `<div class="reveal"><div class="reveal__kicker">${kicker} · ${pad2(v)}</div><div class="reveal__title">${esc(list[v])}</div></div>` : ''}
    </section>`;
  };
  return layout(plate(c.img, { caption: c.caption }), `
    ${head(c)}
    <div class="pair" style="margin-top:20px">
      ${card('brooch', 'Brosche', BROOCHES, 'Deine Brosche', 'Die Spange, die deinen Umhang hält – und verrät, wer du bist.')}
      ${card('trinket', 'Kleinod', TRINKETS, 'Dein Kleinod', 'Du trägst es immer bei dir. Der Grund gehört nur dir.')}
    </div>
    ${(st.brooch != null || st.trinket != null) ? '<div class="actions"><button class="btn btn--link" data-act="reroll">Die Spielleitung erlaubt einen Neuwurf</button></div>' : ''}
    ${nav(C.chapterDone(st, 'keepsakes'), 'Würfle beide.')}`);
};
R.keepsakes.bind = (root) => {
  ['brooch', 'trinket'].forEach((k) => { if (st[k] != null) showD100(root.querySelector(`[data-key=${k}] .tray`), st[k]); });
  root.querySelectorAll('[data-roll]').forEach((b) => b.addEventListener('click', async () => {
    if (busy) return; busy = true; b.disabled = true;
    const sec = b.closest('section');
    const v = await d100Into(sec.querySelector('.tray'));
    busy = false;
    if (v == null) { b.disabled = false; return; }
    st[b.dataset.roll] = v; save(); sound.swell(); await sleep(prefs.manual ? 0 : 450); render();
    root.ownerDocument.querySelector(`[data-key=${b.dataset.roll}] .reveal`)?.classList.add('is-new');
  }));
  root.querySelector('[data-act=reroll]')?.addEventListener('click', () => { if (confirm('Brosche und Kleinod neu würfeln?')) { st.brooch = st.trinket = null; save(); render(); } });
};

/* Münzen ----------------------------------------------------------------- */
function effectText(eff) {
  if (!eff) return '';
  if (eff.skill) return { t: `Du erhältst die Fertigkeit ${C.SKILL[eff.skill].name}.`, neg: false };
  if (eff.points) return { t: `Du erhältst ${eff.points} Fertigkeitspunkte.`, neg: false };
  if (eff.maxHope) return { t: `Deine maximale Hoffnung sinkt um ${-eff.maxHope}.`, neg: true };
  if (eff.debt) return { t: 'Du beginnst mit Schulden.', neg: true };
  return '';
}
R.coin = () => {
  const c = ch(); const e = C.coinEntry(st);
  const eff = e && effectText(e[2]);
  return layout(plate(c.img, { caption: c.caption }), `
    ${head(c)}
    <div class="d100"><span class="tray" id="coin-tray"></span><span class="d100__result">${st.coin == null ? '' : pad2(st.coin)}</span>
      ${st.coin == null ? '<button class="btn btn--fog" data-act="roll">1W100 würfeln</button>' : ''}</div>
    ${e ? `<div class="reveal${busy ? '' : ' is-new'}">
      <div class="reveal__kicker">Deine Börse</div>
      <div class="reveal__title">${e[0] < 0 ? `${e[0]} Münzen` : `${e[0]} ${e[0] === 1 ? 'Münze' : 'Münzen'}`}</div>
      <p class="reveal__text">${esc(e[1])}</p>
      ${eff ? `<div class="reveal__effect${eff.neg ? ' neg' : ''}">${esc(eff.t)}</div>` : ''}
    </div>
    <div class="actions"><button class="btn btn--link" data-act="reroll">Die Spielleitung erlaubt einen Neuwurf</button></div>` : ''}
    ${nav(C.chapterDone(st, 'coin'), 'Würfle um deine Münzen.')}`);
};
R.coin.bind = (root) => {
  const tray = root.querySelector('#coin-tray');
  if (st.coin != null) showD100(tray, st.coin);
  root.querySelector('[data-act=roll]')?.addEventListener('click', async (ev) => {
    if (busy) return; busy = true; ev.target.disabled = true;
    const v = await d100Into(tray); busy = false;
    if (v == null) { ev.target.disabled = false; return; }
    st.coin = v; C.normalizeSkills(st); save(); sound.swell(); await sleep(prefs.manual ? 0 : 450); render();
  });
  root.querySelector('[data-act=reroll]')?.addEventListener('click', () => { if (confirm('Münzen neu würfeln?')) { st.coin = null; C.normalizeSkills(st); save(); render(); } });
};

/* Erbstück ---------------------------------------------------------------- */
R.artifact = () => {
  const c = ch();
  if (!st.first) {
    return layout(plate(c.img, { caption: c.caption }), `
      ${head(c)}
      <div class="reveal"><div class="reveal__kicker">Ersatzfigur</div><div class="reveal__title">Noch nicht dein Erbe</div>
      <p class="reveal__text">Deine Ersatzfigur erhält kein eigenes Erbstück. Stirbt deine erste Figur, geht ihr Erbstück auf diese über.</p></div>
      ${nav(true)}`);
  }
  const a = C.artifactEntry(st);
  let body;
  if (st.artifact == null) {
    body = `<div class="d100" style="margin-top:6px"><span class="tray" id="art-tray"></span><span class="d100__result"></span></div>
      <button class="seal" data-act="roll" aria-label="Siegel brechen und Erbstück auswürfeln"><span><span class="seal__wax" aria-hidden="true"><img class="seal__half seal__half--l" src="assets/img/vignettes/siegel.png" alt=""><img class="seal__half seal__half--r" src="assets/img/vignettes/siegel.png" alt=""></span><p>Brich das Siegel.<br>1W100</p></span></button>`;
  } else {
    const eff = a[2]?.skill ? `Du erhältst die Fertigkeit ${C.SKILL[a[2].skill].name}.` : a[2]?.maxHope ? `Maximale Hoffnung ${a[2].maxHope}.` : '';
    body = `<div class="d100"><span class="tray" id="art-tray"></span><span class="d100__result">${pad2(st.artifact)}</span></div>
      <div class="reveal">
        <div class="reveal__kicker">Erbstück · ${pad2(st.artifact)}</div>
        <div class="reveal__title">${esc(a[0])}</div>
        <p class="reveal__text">${esc(a[1])}</p>
        ${eff ? `<div class="reveal__effect">${esc(eff)}</div>` : ''}
      </div>
      <label class="check"><input type="checkbox" id="secret" ${st.artifactSecret ? 'checked' : ''}> <span>Geheim halten – auf dem Charakterblatt steht nur „versiegelt“, die Beschreibung kommt auf ein eigenes Beiblatt für dich und die Spielleitung.</span></label>
      <div class="actions"><button class="btn btn--link" data-act="reroll">Die Spielleitung erlaubt einen Neuwurf</button></div>`;
  }
  return layout(plate(c.img, { caption: c.caption }), `${head(c)}${body}${nav(C.chapterDone(st, 'artifact'), 'Brich das Siegel.')}`);
};
R.artifact.bind = (root) => {
  const tray = root.querySelector('#art-tray');
  if (st.artifact != null && tray) showD100(tray, st.artifact);
  root.querySelector('[data-act=roll]')?.addEventListener('click', async (ev) => {
    if (busy) return; busy = true;
    const seal = ev.currentTarget; seal.classList.add('is-broken');
    const v = await d100Into(tray); busy = false;
    if (v == null) { seal.classList.remove('is-broken'); return; }
    st.artifact = v; C.normalizeSkills(st); save(); sound.swell(); await sleep(prefs.manual ? 0 : 600); render();
    root.ownerDocument.querySelector('.reveal')?.classList.add('is-new');
  });
  root.querySelector('#secret')?.addEventListener('change', (e) => { st.artifactSecret = e.target.checked; save(); renderLedger(); });
  root.querySelector('[data-act=reroll]')?.addEventListener('click', () => { if (confirm('Erbstück neu würfeln?')) { st.artifact = null; C.normalizeSkills(st); save(); render(); } });
};

/* Fertigkeiten ------------------------------------------------------------- */
let infoId = null;
const ROW = (s) => Math.round((s.sy - 217.5) / 14.85) + 2;   // Zeilen wie auf dem Bogen
R.skills = () => {
  const c = ch();
  const left = C.pointsLeft(st);
  const g = C.granted(st); const o = C.owned(st);
  const node = (s) => {
    const fixed = !!g[s.id]; const bought = !!st.bought[s.id]; const own = fixed || bought;
    const state = own ? 'is-owned' : C.canBuy(st, s.id) ? 'is-available' : 'is-locked';
    const spec = st.bought[s.id]?.spec;
    return `<button class="skill ${state}${fixed ? ' is-fixed' : ''}${s.spec ? ' is-italic' : ''}" data-skill="${s.id}" style="grid-column:${s.tier};grid-row:${ROW(s)}" aria-pressed="${own}"
      aria-label="${esc(s.name)}, ${own ? (fixed ? `von ${g[s.id]}` : 'gekauft') : C.prereqMet(st, s.id) ? 'verfügbar' : 'Voraussetzung fehlt'}">
      <span class="diamond"></span><span class="label">${esc(s.name)}${spec ? `<span class="spec">${esc(spec)}</span>` : ''}</span><span class="stats">{${s.stats}}</span></button>`;
  };
  void o;
  return layout(null, `
    <div class="skills-intro">
      <div class="skills-intro__plate">${plate(c.img, { caption: c.caption, ratio: 'wide' })}</div>
      <div class="skills-intro__text">${head(c)}</div>
    </div>
    <div class="skillhead">
      <div class="points"><b>${left}</b><span>Fertigkeitspunkte übrig · je Fertigkeit ${SKILL_COST}</span></div>
      <div class="legend">
        <span><i class="diamond" style="background:var(--fog-deep);border-color:var(--fog-deep)"></i>Klasse / Münzen / Erbstück</span>
        <span><i class="diamond diamond--on"></i>gekauft</span>
        <span><i class="diamond" style="box-shadow:0 0 0 3px var(--fog-glow)"></i>verfügbar</span>
        <span><i class="diamond" style="border-style:dotted;opacity:.6"></i>Voraussetzung fehlt</span>
      </div>
    </div>
    <div class="tree-wrap">
      <div class="tree">
        <div class="tree__head" style="grid-column:1;grid-row:1">Grundlagen <em>+10</em></div>
        <div class="tree__head" style="grid-column:2;grid-row:1">Experte <em>+15</em></div>
        <div class="tree__head" style="grid-column:3;grid-row:1">Meister <em>+20</em></div>
        ${SKILLS.map(node).join('')}
        <svg class="links" aria-hidden="true"></svg>
      </div>
    </div>
    ${orn('giftpilze')}
    <div class="skillinfo" aria-live="polite"></div>
    <p class="prose" style="margin-top:14px"><em>Übernatürliche Fähigkeiten</em> entstehen erst im Spiel – aus Fertigkeiten, die nicht weiter aufsteigen können, im Gespräch mit der Spielleitung.</p>
    ${nav(C.chapterDone(st, 'skills'), 'Benenne deine Spezialgebiete.')}`, { wide: true });
};
function drawLinks(root) {
  const tree = root.querySelector('.tree'); const svg = root.querySelector('svg.links');
  if (!tree || !svg) return;
  const tb = tree.getBoundingClientRect();
  const o = C.owned(st);
  const paths = [];
  SKILLS.forEach((s) => s.pre.forEach((p) => {
    const a = tree.querySelector(`[data-skill=${p}]`)?.getBoundingClientRect();
    const b = tree.querySelector(`[data-skill=${s.id}]`)?.getBoundingClientRect();
    if (!a || !b) return;
    const x1 = a.right - tb.left, y1 = a.top + a.height / 2 - tb.top;
    const x2 = b.left + 4 - tb.left, y2 = b.top + b.height / 2 - tb.top;
    const mx = x1 + (x2 - x1) * 0.55;
    const d = Math.abs(y2 - y1) < 2 ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} L${mx - 8},${y1} Q${mx},${y1} ${mx},${y1 + Math.sign(y2 - y1) * 8} L${mx},${y2 - Math.sign(y2 - y1) * 8} Q${mx},${y2} ${mx + 8},${y2} L${x2},${y2}`;
    paths.push(`<path d="${d}" class="${o.has(p) && o.has(s.id) ? 'is-live' : ''}"/>`);
  }));
  svg.setAttribute('viewBox', `0 0 ${tb.width} ${tb.height}`);
  svg.innerHTML = paths.join('');
}
const sheetMode = () => matchMedia('(hover: none), (max-width: 860px)').matches;

function skillStatus(id) {
  const s = C.SKILL[id]; const g = C.granted(st);
  if (g[id]) return { text: `Erhalten durch: ${g[id]}`, action: null };
  if (st.bought[id]) return C.canRefund(st, id)
    ? { text: 'Gelernt', action: 'refund', label: `Ablegen (+${SKILL_COST} Punkte zurück)` }
    : { text: 'Gelernt · darauf baut eine andere Fertigkeit auf', action: null };
  if (C.canBuy(st, id)) return { text: `Kostet ${SKILL_COST} Punkte`, action: 'buy', label: `Für ${SKILL_COST} Punkte lernen` };
  if (!C.prereqMet(st, id)) return { text: `Dafür brauchst du zuerst ${s.pre.map((p) => C.SKILL[p].name).join(' oder ')}.`, action: null, locked: 'Noch nicht erreichbar' };
  return { text: 'Nicht genug Fertigkeitspunkte.', action: null, locked: 'Nicht genug Punkte' };
}

function infoHtml(id, { withAction = false } = {}) {
  const s = C.SKILL[id]; const stt = skillStatus(id);
  const pre = s.pre.length ? `Voraussetzung: ${s.pre.map((p) => C.SKILL[p].name).join(' oder ')}` : 'Keine Voraussetzung';
  const hint = withAction ? '' : (stt.action === 'buy' ? ' · Klicken zum Lernen' : stt.action === 'refund' ? ' · Klicken zum Ablegen' : '');
  return `<h3>${esc(s.name)} <small class="skillinfo__meta">+${C.BONUS[s.tier]} · {${s.stats}} · ${['', 'Grundlagen', 'Experte', 'Meister'][s.tier]}</small></h3>
    <p>${esc(s.desc)}</p><p class="req">${esc(pre)} · ${esc(stt.text)}${hint}</p>
    ${s.spec && st.bought[id] ? `<div class="field" style="margin:10px 0 0"><label for="spec">Spezialgebiet (${esc(s.spec)})</label><input type="text" id="spec" maxlength="28" value="${esc(st.bought[id].spec || '')}" placeholder="z. B. ${esc(s.desc.split('z. B. ')[1]?.split(',')[0]?.replace('.', '') || '…')}"></div>` : ''}
    ${withAction ? `<div class="sheet__actions">
        ${stt.action ? `<button class="btn ${stt.action === 'buy' ? 'btn--fog' : 'btn--ghost'}" data-sheet-act="${stt.action}">${esc(stt.label)}</button>` : stt.locked ? `<button class="btn btn--ghost" disabled>${esc(stt.locked)}</button>` : ''}
        <span class="sheet__points">${C.pointsLeft(st)} Punkte übrig</span>
      </div>` : ''}`;
}

function bindSpec(container, root, id) {
  const s = C.SKILL[id];
  container.querySelector('#spec')?.addEventListener('input', (e) => {
    st.bought[id].spec = e.target.value; save();
    const lab = root.querySelector(`[data-skill=${id}] .label`);
    if (lab) lab.innerHTML = `${esc(s.name)}${e.target.value ? `<span class="spec">${esc(e.target.value)}</span>` : ''}`;
    updateNav(root); renderLedger();
  });
}

function showInfo(root, id) {
  const box = root.querySelector('.skillinfo'); if (!box) return;
  if (!id) { box.innerHTML = '<p>Fahre über eine Fertigkeit, um mehr zu erfahren. Ein Klick lernt sie – ein zweiter legt sie wieder ab.</p>'; return; }
  box.innerHTML = infoHtml(id);
  bindSpec(box, root, id);
}

/** Lernen / Ablegen. Gibt true zurück, wenn sich etwas geändert hat. */
function toggleSkill(id) {
  const s = C.SKILL[id];
  if (C.granted(st)[id]) return false;
  if (st.bought[id]) {
    if (!C.canRefund(st, id)) { toast('Darauf baut eine andere Fertigkeit auf.'); return false; }
    delete st.bought[id];
  } else if (C.canBuy(st, id)) {
    st.bought[id] = { spec: '' }; sound.chime();
  } else {
    toast(!C.prereqMet(st, id) ? `Dafür brauchst du ${s.pre.map((p) => C.SKILL[p].name).join(' oder ')}.` : 'Nicht genug Fertigkeitspunkte.');
    return false;
  }
  save();
  return true;
}

/* Mobile: Erklärkarte, die von unten hereinfährt */
function closeSheet() {
  const sh = document.querySelector('.sheet'); if (!sh) return;
  sh.classList.remove('is-open'); document.querySelector('.sheet-backdrop')?.classList.remove('is-open');
  document.querySelectorAll('.skill.is-focus').forEach((x) => x.classList.remove('is-focus'));
  setTimeout(() => { if (!sh.classList.contains('is-open')) { sh.remove(); document.querySelector('.sheet-backdrop')?.remove(); } }, 350);
}
function openSheet(id) {
  let sh = document.querySelector('.sheet');
  if (!sh) {
    const bd = document.createElement('div'); bd.className = 'sheet-backdrop'; bd.addEventListener('click', closeSheet);
    sh = document.createElement('section'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'false');
    document.body.append(bd, sh);
    // nach unten wischen schließt
    let y0 = null;
    sh.addEventListener('pointerdown', (e) => { if (!e.target.closest('input, button')) y0 = e.clientY; });
    sh.addEventListener('pointermove', (e) => { if (y0 != null) { const dy = Math.max(0, e.clientY - y0); sh.style.transform = `translateY(${dy}px)`; } });
    const end = (e) => { if (y0 == null) return; const dy = e.clientY - y0; y0 = null; sh.style.transform = ''; if (dy > 70) closeSheet(); };
    sh.addEventListener('pointerup', end); sh.addEventListener('pointercancel', end);
    requestAnimationFrame(() => { sh.classList.add('is-open'); bd.classList.add('is-open'); });
  }
  sh.dataset.id = id;
  sh.setAttribute('aria-label', C.SKILL[id].name);
  sh.innerHTML = `<button class="sheet__close" type="button" aria-label="Schließen">×</button><span class="sheet__grip" aria-hidden="true"></span>${infoHtml(id, { withAction: true })}`;
  sh.querySelector('.sheet__close').addEventListener('click', closeSheet);
  bindSpec(sh, stage, id);
  sh.querySelector('[data-sheet-act]')?.addEventListener('click', () => {
    if (!toggleSkill(id)) return;
    const sl = stage.querySelector('.tree-wrap')?.scrollLeft ?? 0;
    render();
    const tw = stage.querySelector('.tree-wrap'); if (tw) tw.scrollLeft = sl;
    const nb = stage.querySelector(`[data-skill=${id}]`); nb?.classList.add('is-pulse', 'is-focus');
    openSheet(id);
    if (C.SKILL[id].spec && st.bought[id]) sh.querySelector('#spec')?.focus();
  });
  document.querySelectorAll('.skill.is-focus').forEach((x) => x.classList.toggle('is-focus', x.dataset.skill === id));
  stage.querySelector(`[data-skill=${id}]`)?.classList.add('is-focus');
}

R.skills.bind = (root) => {
  requestAnimationFrame(() => drawLinks(root));
  showInfo(root, infoId);
  root.querySelectorAll('[data-skill]').forEach((b) => {
    b.addEventListener('mouseenter', () => { if (!sheetMode()) showInfo(root, b.dataset.skill); });
    b.addEventListener('focus', () => { if (!sheetMode()) showInfo(root, b.dataset.skill); });
    b.addEventListener('click', () => {
      const id = b.dataset.skill; const s = C.SKILL[id];
      infoId = id;
      if (sheetMode()) { openSheet(id); return; }       // Handy: erst erklären, Kauf über die Karte
      if (!toggleSkill(id)) { showInfo(root, id); return; }
      render();
      const nb = document.querySelector(`[data-skill=${id}]`); nb?.classList.add('is-pulse'); nb?.focus({ preventScroll: true });
      if (s.spec && st.bought[id]) document.getElementById('spec')?.focus();
    });
  });
};

/* Abschluss ------------------------------------------------------------------ */
function questions() {
  const fill = (q) => q.replace('{trinket}', C.trinket(st) ?? 'dein Kleinod').replace('{brooch}', C.brooch(st) ?? '');
  const list = [...QUESTIONS.common];
  if (st.classId) list.splice(1, 0, QUESTIONS[st.classId]);
  return list.map((x) => ({ ...x, q: fill(x.q) }));
}
R.finish = () => {
  const c = ch(); const k = C.cls(st);
  const missing = CHAPTERS.slice(1, -1).filter((x) => !C.chapterDone(st, x.id));
  const tally = [
    ['Gesundheit', C.health(st) ?? '—'], ['Hoffnung', C.maxHope(st)], ['Abwehr', C.defense(st)],
    ['Münzen', C.coins(st) ?? '—'], ['Rationen', C.rations(st) ?? '—'], ['Punkte übrig', C.pointsLeft(st)],
  ];
  return layout(plate(c.img, { caption: c.caption }), `
    ${head(c)}
    <div class="tally">${tally.map(([l, v]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="field"><label for="name">Name</label><input type="text" id="name" class="name-input" maxlength="40" autocomplete="off" value="${esc(st.name)}" placeholder="Wie ruft man dich?"></div>
    <div class="field"><label for="info">Info</label><textarea id="info" maxlength="320" placeholder="Aussehen, Alter, Herkunft, Eigenheiten …">${esc(st.info)}</textarea><small>Steht unter deinem Namen auf dem Bogen (max. ca. 320 Zeichen).</small></div>
    <div class="field"><span class="lbl">Porträt <small style="text-transform:none;letter-spacing:0">(optional – erscheint im Kreis auf dem Bogen)</small></span>
      <div class="portrait-row">
        <label class="portrait-drop">${st.portrait ? `<img src="${st.portrait}" alt="Porträt">` : 'Bild wählen'}<input type="file" id="portrait" accept="image/*" hidden></label>
        ${st.portrait ? '<button class="btn btn--link" data-act="noportrait">Porträt entfernen</button>' : ''}
      </div>
    </div>
    ${orn('spindel')}
    <p class="kicker">Für deine Chronik</p>
    <p class="prose">Fragen, die nur du beantworten kannst. Die Antworten erscheinen auf dem Chronik-Blatt deines PDFs.</p>
    ${questions().map((q) => `<div class="field"><label for="q-${q.id}" style="text-transform:none;letter-spacing:0;font-family:var(--serif);font-size:19px;font-style:italic;color:var(--ink)">${esc(q.q)}</label><textarea id="q-${q.id}" data-q="${q.id}" maxlength="400" style="min-height:70px">${esc(st.answers[q.id] || '')}</textarea></div>`).join('')}
    <div class="finale">
      ${orn('rabe')}
      <h2 class="title" style="font-size:clamp(40px,5vw,64px)">${esc(st.name || 'Namenlos')}</h2>
      <p>${k ? esc(k.name) : ''}${C.cloak(st) ? ` · Umhang in ${esc(C.cloak(st).name)}` : ''}</p>
      ${missing.length ? `<p class="nav__hint">Noch offen: ${missing.map((m) => `<a href="#" data-goto="${CHAPTERS.indexOf(m)}">${esc(m.title)}</a>`).join(', ')}</p>` : ''}
      <div class="dl-row">
        <button class="btn btn--big" data-act="pdf" ${missing.length ? 'disabled' : ''}>Charakterblatt herunterladen (PDF)</button>
        <button class="btn btn--ghost" data-act="json">Figur speichern (.json)</button>
      </div>
      <p style="margin-top:22px">${esc(ENDINGS[0])}</p>
      <div class="actions" style="justify-content:center"><button class="btn btn--link" data-act="another">Zweite Figur erschaffen</button></div>
    </div>
    ${nav(true)}`);
};
R.finish.bind = (root) => {
  const nm = root.querySelector('#name');
  nm.addEventListener('input', () => { st.name = nm.value; save(); root.querySelector('.finale .title').textContent = nm.value || 'Namenlos'; renderLedger(); });
  root.querySelector('#info').addEventListener('input', (e) => { st.info = e.target.value; save(); });
  root.querySelectorAll('[data-q]').forEach((t) => t.addEventListener('input', () => { st.answers[t.dataset.q] = t.value; save(); }));
  root.querySelector('#portrait').addEventListener('change', async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    st.portrait = await squarePortrait(f); save(); render();
  });
  root.querySelector('[data-act=noportrait]')?.addEventListener('click', () => { st.portrait = null; save(); render(); });
  root.querySelector('[data-act=pdf]').addEventListener('click', async (e) => {
    if (!st.name.trim()) { toast('Gib deiner Figur zuerst einen Namen.'); nm.focus(); return; }
    const b = e.currentTarget; b.disabled = true; const t = b.textContent; b.textContent = 'Die Feder kratzt …';
    try {
      const { buildPdf } = await import('./pdf.js');
      const bytes = await buildPdf(st);
      download(new Blob([bytes], { type: 'application/pdf' }), `Fatherfog-${slug(st.name)}.pdf`);
      sound.horn();
    } catch (err) { console.error(err); toast('Das PDF konnte nicht erstellt werden. Läuft die Seite über einen Webserver (nicht file://)?', 5000); }
    b.disabled = false; b.textContent = t;
  });
  root.querySelector('[data-act=json]').addEventListener('click', exportJson);
  root.querySelector('[data-act=another]').addEventListener('click', () => {
    if (!confirm('Diese Figur als .json sichern und eine neue beginnen? (Speichere vorher dein PDF.)')) return;
    exportJson(); const first = false; st = C.blank(); st.first = first; save(); go(0);
  });
};

/** Porträt auf 512×512 zuschneiden (JPEG), damit PDF & Speicher klein bleiben. */
function squarePortrait(file) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height); const cv = document.createElement('canvas'); cv.width = cv.height = 512;
      cv.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 512, 512);
      URL.revokeObjectURL(url); res(cv.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = rej; img.src = url;
  });
}

/* ------------------------------------------------------------------ */
/* Ledger                                                              */
/* ------------------------------------------------------------------ */
let ledgerOpen = false;
let lastLedger = {};
function renderLedger() {
  if (st.chapter === 0) { ledger.hidden = true; return; }
  ledger.hidden = false;
  const k = C.cls(st);
  const val = (id) => C.statValue(st, id);
  const dd = (key, v) => { const fresh = lastLedger[key] !== undefined && lastLedger[key] !== v; lastLedger[key] = v; return `<dd class="${fresh ? 'is-fresh' : ''}">${v ?? '<span class="empty">—</span>'}</dd>`; };
  const skills = C.skillList(st);
  const a = C.artifactEntry(st);
  ledger.classList.toggle('is-open', ledgerOpen);
  ledger.innerHTML = `
    <button class="ledger__toggle" type="button" aria-expanded="${ledgerOpen}"><span>Dein Blatt</span>
      <span class="mini"><span>GES ${C.health(st) ?? '–'}</span><span>HOF ${C.maxHope(st)}</span><span>${k ? esc(k.short) : '–'}</span><span>${ledgerOpen ? '▾' : '▴'}</span></span></button>
    <h2>${esc(st.name || 'Namenlos')}</h2>
    <div style="font-style:italic;color:var(--ink-2)">${k ? esc(k.name) : 'Noch ohne Klasse'}${st.first ? '' : ' · Ersatzfigur'}</div>
    <h4>Zustand</h4>
    <div class="vitals"><div><b>${C.health(st) ?? '–'}</b><span>Gesundh.</span></div><div><b>${C.maxHope(st)}</b><span>Hoffnung</span></div><div><b>${C.defense(st)}</b><span>Abwehr</span></div></div>
    <h4>Werte</h4><dl>${STATS.map((s) => `<dt>${s.name}</dt>${dd(s.id, val(s.id))}`).join('')}</dl>
    <h4>Rettung</h4><dl>${SAVES.map((s) => `<dt>${s.name}</dt>${dd(s.id, val(s.id))}`).join('')}</dl>
    <h4>Habe</h4>
    <dl>
      <dt>Rucksack</dt>${dd('ruck', st.rucksack ? esc(RUCKSACKS[st.rucksack.id].name) : null)}
      <dt>Umhang</dt>${dd('cloak', C.cloak(st) ? esc(C.cloak(st).name) : null)}
      <dt>Münzen</dt>${dd('coin', C.coins(st))}
      <dt>Rationen</dt>${dd('rat', C.rations(st))}
    </dl>
    ${C.brooch(st) ? `<p style="margin:6px 0 0"><span class="empty">Brosche:</span> ${esc(C.brooch(st))}</p>` : ''}
    ${C.trinket(st) ? `<p style="margin:4px 0 0"><span class="empty">Kleinod:</span> ${esc(C.trinket(st))}</p>` : ''}
    ${a ? `<p style="margin:4px 0 0"><span class="empty">Erbstück:</span> ${st.artifactSecret ? '<em>versiegelt</em>' : esc(a[0])}</p>` : ''}
    <h4>Fertigkeiten · ${C.pointsLeft(st)} Pkt. übrig</h4>
    ${skills.length ? `<ul>${skills.map((x) => `<li>${esc(C.skillLabel(x.id, x.spec))} <span class="empty">+${C.BONUS[x.s.tier]}</span></li>`).join('')}</ul>` : '<p class="empty">Noch keine</p>'}
  `;
  ledger.querySelector('.ledger__toggle').addEventListener('click', () => { ledgerOpen = !ledgerOpen; renderLedger(); });
}

/* ------------------------------------------------------------------ */
/* Rendern                                                             */
/* ------------------------------------------------------------------ */
function updateNav(root) {
  const next = root.querySelector('[data-act=next]');
  const done = C.chapterDone(st, ch().id);
  if (next) next.disabled = !done;
  const hint = root.querySelector('.nav__hint'); if (hint && root.querySelector('.nav')?.contains(hint)) hint.hidden = done;
}
/* Texte & Elemente tauchen beim Scrollen aus dem Nebel auf */
const FX_SEL = [
  '.chapter-head', '.kicker', '.title', '.sheet-ref', '.lead', '.prose > p', '.prose > em', '.quote', '.rule-orn', '.vig', '.plate',
  '.roll', '.option', '.deck', '.deck__dots', '.deck__pick', '.reveal', '.seal', '.d100', '.pair > section', '.detail > div > *', '.tally',
  '.field', '.skillhead', '.tree-wrap', '.skillinfo', '.cloaks', '.finale > *', '.actions', '.check', '.nav',
].join(',');
let fxObserver = null;
function reveal(root) {
  fxObserver?.disconnect();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const els = [];
  root.querySelectorAll(FX_SEL).forEach((el) => { if (!el.parentElement.closest('.fx')) { el.classList.add('fx'); els.push(el); } });
  fxObserver = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e, i) => {
      const el = e.target;
      el.style.transitionDelay = `${Math.min(i, 8) * 110}ms`;
      requestAnimationFrame(() => el.classList.add('is-in'));
      fxObserver.unobserve(el);
      // danach aufräumen, damit Hover-Effekte & Messungen normal funktionieren
      setTimeout(() => { el.classList.remove('fx', 'is-in'); el.style.transitionDelay = ''; if (el.classList.contains('tree-wrap')) drawLinks(stage); }, 1800 + Math.min(i, 8) * 110);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => fxObserver.observe(el));
}

function render({ animate = false } = {}) {
  // Kapitel, die eine Klasse brauchen, ohne Klasse nicht betreten
  if (st.chapter >= 4 && !st.classId) st.chapter = 3;
  const c = ch();
  stage.innerHTML = R[c.id]();
  stage.dataset.chapter = c.id;
  R[c.id].bind?.(stage);
  stage.querySelector('[data-act=back]')?.addEventListener('click', () => go(st.chapter - 1));
  stage.querySelector('[data-act=next]')?.addEventListener('click', () => go(st.chapter + 1));
  hydrateImages(stage);
  if (animate) reveal(stage); else fxObserver?.disconnect();
  renderPath(); renderLedger();
  document.title = `${c.title} · Fatherfog`;
}
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (ch().id === 'skills') drawLinks(stage); }, 120); });

/* ------------------------------------------------------------------ */
/* Menü, Export, Import                                                */
/* ------------------------------------------------------------------ */
const menu = document.getElementById('menu');
function syncMenu() { document.getElementById('opt-manual').checked = prefs.manual; }
document.getElementById('btn-menu').addEventListener('click', () => { syncMenu(); menu.showModal(); });
document.getElementById('opt-manual').addEventListener('change', (e) => { prefs.manual = e.target.checked; savePrefs(); render(); });
function exportJson() {
  download(new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' }), `Fatherfog-${slug(st.name)}.json`);
}
document.getElementById('btn-export').addEventListener('click', exportJson);
document.getElementById('file-import').addEventListener('change', async (e) => {
  const f = e.target.files?.[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data || data.v !== 1) throw new Error('Format');
    st = Object.assign(C.blank(), data); save(); menu.close(); render(); toast(`${st.name || 'Figur'} geladen.`);
  } catch { toast('Diese Datei ist keine Fatherfog-Figur.'); }
  e.target.value = '';
});
function resetAll() {
  if (!confirm('Alles verwerfen und eine neue Figur beginnen?')) return;
  st = C.blank(); save(); menu.open && menu.close(); go(0);
}
document.getElementById('btn-reset').addEventListener('click', resetAll);

const sbtn = document.getElementById('btn-sound');
sbtn.setAttribute('aria-pressed', String(sound.on));
sbtn.addEventListener('click', (e) => { e.stopPropagation(); sbtn.setAttribute('aria-pressed', String(sound.toggle())); });
const vol = document.getElementById('opt-vol');
vol.value = Math.round(music.volume * 100);
vol.addEventListener('input', () => music.setVolume(vol.value / 100));

/* Start */
C.normalizeSkills(st);
render({ animate: true });
void rand; void ARTIFACTS; void COINS;

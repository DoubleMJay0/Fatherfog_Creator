// Animierte Zehnseiter. Ergebnisse werden vorab ausgewürfelt, die Animation ist nur Theater.
import { rand, sleep, reducedMotion } from './util.js';
import { sound } from './sound.js';

const D10_SVG = `<svg viewBox="0 0 42 46" aria-hidden="true">
  <path class="face" d="M21 2 L40 18 L36 36 L21 44 L6 36 L2 18 Z"/>
  <path class="facet" d="M21 2 L13 22 L21 30 L29 22 Z M2 18 L13 22 M40 18 L29 22 M21 30 L21 44"/>
</svg>`;

export function dieEl(value = '', { ten = false, ghost = false } = {}) {
  const el = document.createElement('span');
  el.className = 'die' + (ten ? ' die--ten' : '') + (ghost ? ' die--ghost' : '');
  el.innerHTML = D10_SVG + `<b>${value}</b>`;
  return el;
}

const shown = (v, ten) => (ten ? String(v * 10).padStart(2, '0') : String(v));

/**
 * Würfelt n W10 (1–10) in eine Ablage.
 * @returns {Promise<number[]>}
 */
export async function rollInto(tray, n, { values } = {}) {
  const result = values ?? Array.from({ length: n }, () => rand(10) + 1);
  tray.innerHTML = '';
  const dice = result.map(() => { const d = dieEl('?'); tray.append(d); return d; });
  if (reducedMotion()) { dice.forEach((d, i) => { d.querySelector('b').textContent = result[i]; }); return result; }
  dice.forEach((d) => d.classList.add('is-rolling'));
  const flick = setInterval(() => {
    dice.forEach((d) => { if (d.classList.contains('is-rolling')) d.querySelector('b').textContent = rand(10) + 1; });
    sound.clack(0.12);
  }, 70);
  await sleep(380);
  for (let i = 0; i < dice.length; i++) {
    await sleep(110 + rand(90));
    const d = dice[i];
    d.classList.remove('is-rolling'); d.classList.add('is-landed');
    d.querySelector('b').textContent = result[i];
    if (result[i] === 10) d.classList.add('die--hi');
    sound.clack(0.4);
  }
  clearInterval(flick);
  return result;
}

/** Zeigt bereits gewürfelte Werte ohne Animation. */
export function showDice(tray, values) {
  tray.innerHTML = '';
  values.forEach((v) => { const d = dieEl(v); if (v === 10) d.classList.add('die--hi'); tray.append(d); });
}

/**
 * W100 mit zwei W10 (Zehner + Einer). Ergebnis 0–99.
 */
export async function rollD100(tray, { value } = {}) {
  const v = value ?? rand(100);
  const tens = Math.floor(v / 10), ones = v % 10;
  tray.innerHTML = '';
  const a = dieEl('?', { ten: true }); const b = dieEl('?');
  tray.append(a, b);
  if (reducedMotion()) { a.querySelector('b').textContent = shown(tens, true); b.querySelector('b').textContent = ones; return v; }
  a.classList.add('is-rolling'); b.classList.add('is-rolling');
  const flick = setInterval(() => {
    if (a.classList.contains('is-rolling')) a.querySelector('b').textContent = shown(rand(10), true);
    if (b.classList.contains('is-rolling')) b.querySelector('b').textContent = rand(10);
    sound.clack(0.12);
  }, 70);
  await sleep(650);
  a.classList.replace('is-rolling', 'is-landed'); a.querySelector('b').textContent = shown(tens, true); sound.clack(0.45);
  await sleep(260);
  b.classList.replace('is-rolling', 'is-landed'); b.querySelector('b').textContent = ones; sound.clack(0.45);
  clearInterval(flick);
  return v;
}

export function showD100(tray, v) {
  tray.innerHTML = '';
  tray.append(dieEl(shown(Math.floor(v / 10), true), { ten: true }), dieEl(v % 10));
}

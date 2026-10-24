// Bildtafeln mit Rückfall-Kette: .webp → .png → .jpg → Platzhalter.
import { esc } from './util.js';

const EXT = ['webp', 'png', 'jpg'];
// Bei neuen Motiven hochzählen – zwingt Browser, die Bilder neu zu laden.
export const ASSET_VER = '2';
const missing = new Set();

const FOG_SVG = `<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".7">
    <path d="M-10 220c30-18 52 10 78-6s30-30 58-18 40 22 84 4"/>
    <path d="M-10 248c26-10 46 14 74 2s44-26 70-12 46 20 76 6"/>
    <path d="M20 196c14-10 30 2 38-8s4-22 18-24 20 14 32 8"/>
    <path d="M100 150v-70m-8 70v-60l8-14 8 14v60m-24 0h32"/>
    <path d="M100 66l-6 10h12z"/>
  </g>
</svg>`;

/**
 * @param {string} name   Dateiname ohne Endung (assets/img/)
 * @param {object} o      { caption, ratio: 'tall'|'square'|'wide', label }
 */
export function plate(name, { caption = '', ratio = 'tall', label = '' } = {}) {
  const cls = ratio === 'square' ? ' plate--square' : ratio === 'wide' ? ' plate--wide' : '';
  return `<figure class="plate${cls}">
    <div class="plate__img" data-img="${esc(name)}" data-label="${esc(label || caption)}"></div>
    ${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}
  </figure>`;
}

/** Nur die Bildfläche (z. B. in Klassenkarten). */
export function imgBox(name, label = '') {
  return `<div class="plate__img" data-img="${esc(name)}" data-label="${esc(label)}"></div>`;
}

function placeholder(box) {
  const name = box.dataset.img; const label = box.dataset.label || name;
  box.innerHTML = `<div class="ph">${FOG_SVG}<div class="ph__label"><b>${esc(label)}</b>Motiv folgt · ${esc(name)}</div></div>`;
}

export function hydrateImages(root = document) {
  root.querySelectorAll('[data-img]').forEach((box) => {
    if (box.dataset.ready) return;
    box.dataset.ready = '1';
    const name = box.dataset.img;
    if (!name || missing.has(name)) { placeholder(box); return; }
    let i = 0;
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.onerror = () => { i++; if (i < EXT.length) img.src = `assets/img/${name}.${EXT[i]}?v=${ASSET_VER}`; else { missing.add(name); placeholder(box); } };
    img.onload = () => { box.innerHTML = ''; box.append(img); };
    img.src = `assets/img/${name}.${EXT[0]}?v=${ASSET_VER}`;
  });
}

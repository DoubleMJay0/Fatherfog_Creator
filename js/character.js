// Datenmodell der Figur und alle abgeleiteten Werte.
import { CLASSES, RUCKSACKS, CLOAKS, CLOAK_WEAR, STATS, SAVES, STAT_CAP, START_HOPE, SKILL_COST } from './data/rules.js';
import { SKILLS } from './data/skills.js';
import { BROOCHES, TRINKETS, COINS, ARTIFACTS } from './data/tables.js';

export const SKILL = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const BONUS = { 1: 10, 2: 15, 3: 20 };

export function blank() {
  return {
    v: 1,
    chapter: 0,
    reached: 0,
    first: true,
    stats: { str: null, int: null, wil: null },   // { dice: [..], total }
    saves: { body: null, mind: null, spirit: null },
    classId: null,
    choices: [],                                     // gewählte Option je ODER-Paar
    rucksack: null,                                  // { id, rolls: { idx: n } }
    cloak: null,                                     // { idx, wear, picked }
    brooch: null, trinket: null, coin: null, artifact: null,
    artifactSecret: true,
    bought: {},                                      // id -> { spec }
    specs: {},                                       // Spezialgebiet für gewährte Fertigkeiten
    name: '', info: '', portrait: null, answers: {},
  };
}

export const cls = (st) => CLASSES.find((c) => c.id === st.classId) || null;

export function statValue(st, id) {
  const base = (st.stats[id] ?? st.saves[id])?.total;
  if (base == null) return null;
  const mod = cls(st)?.mods[id] ?? 0;
  return Math.max(0, Math.min(STAT_CAP, base + mod));
}
export function statRaw(st, id) {
  const base = (st.stats[id] ?? st.saves[id])?.total;
  if (base == null) return null;
  return base + (cls(st)?.mods[id] ?? 0);
}

export const coinEntry = (st) => (st.coin == null ? null : COINS[st.coin]);
export const artifactEntry = (st) => (st.first && st.artifact != null ? ARTIFACTS[st.artifact] : null);

/** Fertigkeiten, die nicht gekauft werden müssen: Klasse, Münzgeschichte, Erbstück. */
export function granted(st) {
  const g = {};
  const c = cls(st);
  if (c) {
    c.skills.forEach((id) => { g[id] = 'Klasse'; });
    c.choices.forEach((pair, i) => { const pick = st.choices[i]; if (pick && pair.includes(pick)) g[pick] = 'Klasse'; });
  }
  const coin = coinEntry(st);
  if (coin?.[2]?.skill && !g[coin[2].skill]) g[coin[2].skill] = 'Münzen';
  const art = artifactEntry(st);
  if (art?.[2]?.skill && !g[art[2].skill]) g[art[2].skill] = 'Erbstück';
  return g;
}

export function owned(st) {
  const g = granted(st);
  const o = new Set(Object.keys(g));
  Object.keys(st.bought).forEach((id) => o.add(id));
  return o;
}

/** Entfernt gekaufte Fertigkeiten, die inzwischen gewährt werden oder ihre Voraussetzung verloren haben. */
export function normalizeSkills(st) {
  const g = granted(st);
  let changed = false;
  for (const id of Object.keys(st.bought)) if (g[id]) { delete st.bought[id]; changed = true; }
  // Voraussetzungen prüfen, bis stabil
  let again = true;
  while (again) {
    again = false;
    const o = owned(st);
    for (const id of Object.keys(st.bought)) {
      const s = SKILL[id];
      if (s.pre.length && !s.pre.some((p) => o.has(p) && p !== id)) { delete st.bought[id]; changed = again = true; }
    }
  }
  return changed;
}

export function pointsTotal(st) {
  const c = cls(st);
  const coin = coinEntry(st);
  return (c?.points ?? 0) + (coin?.[2]?.points ?? 0);
}
export const pointsLeft = (st) => pointsTotal(st) - Object.keys(st.bought).length * SKILL_COST;

export function canBuy(st, id) {
  const s = SKILL[id];
  const o = owned(st);
  if (o.has(id)) return false;
  if (pointsLeft(st) < SKILL_COST) return false;
  return !s.pre.length || s.pre.some((p) => o.has(p));
}
export function prereqMet(st, id) {
  const s = SKILL[id]; const o = owned(st);
  return !s.pre.length || s.pre.some((p) => o.has(p));
}
/** Darf eine gekaufte Fertigkeit wieder abgelegt werden? */
export function canRefund(st, id) {
  if (!st.bought[id]) return false;
  const o = owned(st); o.delete(id);
  return Object.keys(st.bought).every((b) => {
    if (b === id) return true;
    const s = SKILL[b];
    return !s.pre.length || s.pre.some((p) => o.has(p));
  });
}

export function rucksackItems(st) {
  if (!st.rucksack) return [];
  const r = RUCKSACKS[st.rucksack.id];
  return r.items.map((it, i) => {
    if (typeof it === 'string') return it;
    if (!it.roll) return it.t;
    const n = it.roll ? st.rucksack.rolls?.[i] : null;
    return it.t.replace('{n}', n ?? it.roll.replace('d', 'W'));
  });
}

export function rations(st) {
  if (!st.rucksack) return null;
  const r = RUCKSACKS[st.rucksack.id];
  let n = 0;
  r.items.forEach((it, i) => {
    if (typeof it === 'object' && it.rations != null) n += it.rations === 'n' ? (st.rucksack.rolls?.[i] ?? 0) : it.rations;
  });
  return n;
}

export function defense(st) {
  return st.rucksack ? (RUCKSACKS[st.rucksack.id].defense ?? 0) : 0;
}

export function maxHope(st) {
  let h = START_HOPE;
  const c = coinEntry(st); if (c?.[2]?.maxHope) h += c[2].maxHope;
  const a = artifactEntry(st); if (a?.[2]?.maxHope) h += a[2].maxHope;
  return h;
}

export const health = (st) => statValue(st, 'str');
export const coins = (st) => coinEntry(st)?.[0] ?? null;
export const cloak = (st) => (st.cloak ? { ...CLOAKS[st.cloak.idx], wear: CLOAK_WEAR.find((w) => w.id === st.cloak.wear) } : null);
export const brooch = (st) => (st.brooch == null ? null : BROOCHES[st.brooch]);
export const trinket = (st) => (st.trinket == null ? null : TRINKETS[st.trinket]);

/** Kapitel abgeschlossen? (für „Weiter“) */
export function chapterDone(st, id) {
  switch (id) {
    case 'prolog': return true;
    case 'stats': return STATS.every((s) => st.stats[s.id]);
    case 'saves': return SAVES.every((s) => st.saves[s.id]);
    case 'class': { const c = cls(st); return !!c && c.choices.every((_, i) => !!st.choices[i]); }
    case 'rucksack': return !!st.rucksack;
    case 'cloak': return !!st.cloak;
    case 'keepsakes': return st.brooch != null && st.trinket != null;
    case 'coin': return st.coin != null;
    case 'artifact': return !st.first || st.artifact != null;
    case 'skills': return Object.entries(st.bought).every(([id, b]) => !SKILL[id].spec || (b.spec || '').trim());
    case 'finish': return !!st.name.trim();
    default: return false;
  }
}

export function skillLabel(id, spec) {
  const s = SKILL[id];
  if (!s.spec) return s.name;
  return spec ? `${s.spec} (${spec})` : s.name;
}

/** Alle Fertigkeiten der Figur, sortiert nach Rang. */
export function skillList(st) {
  const g = granted(st);
  return [...owned(st)].map((id) => ({
    id, s: SKILL[id], source: g[id] || 'gekauft',
    spec: st.bought[id]?.spec || st.specs[id] || '',
  })).sort((a, b) => a.s.tier - b.s.tier || a.s.name.localeCompare(b.s.name, 'de'));
}

// Klänge: synthetische Effekte + Hintergrundmusik (assets/audio/ambience.mp3).
let ctx = null;
let enabled = true;   // Standard: an (Musik startet mit der ersten Interaktion)
try { enabled = localStorage.getItem('ff-sound') !== '0'; } catch { /* egal */ }
let musicVol = 0.5;
try { const v = parseFloat(localStorage.getItem('ff-music-vol')); if (Number.isFinite(v)) musicVol = v; } catch { /* egal */ }

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const sound = {
  get on() { return enabled; },
  toggle() {
    enabled = !enabled;
    try { localStorage.setItem('ff-sound', enabled ? '1' : '0'); } catch { /* egal */ }
    if (enabled) { this.chime(); music.start(); } else music.stop();
    return enabled;
  },
  /** Würfelklacken: kurzes, gefiltertes Rauschen */
  clack(gain = 0.35) {
    if (!enabled) return;
    const a = ac(); const t = a.currentTime;
    const len = 0.05 + Math.random() * 0.04;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = a.createBufferSource(); src.buffer = buf;
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800 + Math.random() * 2400; bp.Q.value = 3;
    const g = a.createGain(); g.gain.value = gain;
    src.connect(bp).connect(g).connect(a.destination); src.start(t);
  },
  /** Kartenwischen: kurzes, abfallendes Rauschen */
  swish() {
    if (!enabled) return;
    const a = ac(); const t = a.currentTime; const len = 0.22;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) { const x = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * x) * (1 - x); }
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(900, t + len);
    const g = a.createGain(); g.gain.value = 0.22;
    src.connect(f).connect(g).connect(a.destination); src.start(t);
  },
  /** Tiefes Anschwellen für Enthüllungen */
  swell() {
    if (!enabled) return;
    const a = ac(); const t = a.currentTime;
    [110, 164.8, 220].forEach((f, i) => {
      const o = a.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = a.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06 / (i + 1), t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + 2.7);
    });
  },
  /** Heller Ton (Kauf, Bestätigung) */
  chime() {
    if (!enabled) return;
    const a = ac(); const t = a.currentTime;
    const o = a.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(990, t + 0.08);
    const g = a.createGain(); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.55);
  },
  /** Ferner Nebelhorn-Ruf */
  horn() {
    if (!enabled) return;
    const a = ac(); const t = a.currentTime;
    const o = a.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(73, t); o.frequency.linearRampToValueAtTime(70, t + 2.4);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    const g = a.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.5); g.gain.linearRampToValueAtTime(0.07, t + 1.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    o.connect(lp).connect(g).connect(a.destination); o.start(t); o.stop(t + 3.3);
  },
};

/* ------------------------------------------------------------------ */
/* Hintergrundmusik: nahtlose Schleife mit Überblendung (Web Audio)    */
/* ------------------------------------------------------------------ */
const MUSIC_URL = 'assets/audio/ambience.mp3';
const XFADE = 6;            // Sekunden Überblendung am Schleifenpunkt
const FADE_IN = 4;
const MUSIC_GAIN = 0.35;   // Grundpegel der MP3 (≈ −9 dB); der Regler skaliert darauf
let buffer = null, loading = null, bus = null, playing = false, timer = null;
const voices = new Set();

async function loadBuffer() {
  if (buffer) return buffer;
  if (!loading) loading = fetch(MUSIC_URL).then((r) => r.arrayBuffer()).then((b) => ac().decodeAudioData(b)).then((b) => (buffer = b));
  return loading;
}

function voice(at) {
  const a = ac();
  const src = a.createBufferSource(); src.buffer = buffer;
  const g = a.createGain();
  const d = buffer.duration;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(1, at + XFADE);
  g.gain.setValueAtTime(1, at + d - XFADE);
  g.gain.linearRampToValueAtTime(0, at + d);
  src.connect(g).connect(bus);
  src.start(at); src.stop(at + d + 0.05);
  const v = { src, g }; voices.add(v);
  src.onended = () => voices.delete(v);
  // nächste Stimme vor dem Ende einplanen
  const next = at + d - XFADE;
  clearTimeout(timer);
  timer = setTimeout(() => { if (playing) voice(next); }, Math.max(0, (next - a.currentTime - 2) * 1000));
}

export const music = {
  get playing() { return playing && voices.size > 0; },
  get volume() { return musicVol; },
  setVolume(v) {
    musicVol = Math.max(0, Math.min(1, v));
    try { localStorage.setItem('ff-music-vol', String(musicVol)); } catch { /* egal */ }
    if (bus) bus.gain.setTargetAtTime(musicVol * MUSIC_GAIN, ac().currentTime, 0.2);
  },
  async start() {
    if (!enabled || playing) return;
    playing = true;
    ac(); // AudioContext noch innerhalb der Nutzeraktion erzeugen/fortsetzen
    try { await loadBuffer(); } catch (e) { playing = false; console.warn('Musik nicht geladen', e); return; }
    if (!playing) return;
    const a = ac();
    if (!bus) { bus = a.createGain(); bus.connect(a.destination); }
    bus.gain.cancelScheduledValues(a.currentTime);
    bus.gain.setValueAtTime(0, a.currentTime);
    bus.gain.linearRampToValueAtTime(musicVol * MUSIC_GAIN, a.currentTime + FADE_IN);
    voice(a.currentTime + 0.05);
  },
  stop() {
    if (!playing) return;
    playing = false; clearTimeout(timer);
    const a = ac(); const t = a.currentTime;
    bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t); bus.gain.linearRampToValueAtTime(0, t + 1.5);
    voices.forEach((v) => { try { v.src.stop(t + 1.6); } catch { /* schon gestoppt */ } });
  },
};

// Browser erlauben Ton erst nach einer Nutzeraktion
const kick = () => { if (enabled) music.start(); window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); };
window.addEventListener('pointerdown', kick);
window.addEventListener('keydown', kick);
// Im Hintergrund-Tab pausieren
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend(); else if (enabled) ctx.resume();
});

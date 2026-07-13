// Lightweight Web Audio sound manager — no external files needed.
let ctx = null;
let muted = false;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('tb_muted', m ? '1' : '0'); } catch {}
}

export function isMuted() {
  try { return muted; } catch { return false; }
}

export function initMuteState() {
  try { muted = localStorage.getItem('tb_muted') === '1'; } catch { muted = false; }
  return muted;
}

function tone(freq, duration, type = 'sine', volume = 0.08, delay = 0) {
  const c = getCtx();
  if (!c || muted) return;
  const now = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + duration);
}

export function playSound(name) {
  if (muted) return;
  try { getCtx()?.resume(); } catch {}
  switch (name) {
    case 'click':
      tone(520, 0.08, 'sine', 0.05);
      break;
    case 'success':
      tone(523, 0.12, 'sine', 0.07);
      tone(659, 0.12, 'sine', 0.07, 0.1);
      tone(784, 0.2, 'sine', 0.08, 0.2);
      break;
    case 'coin':
      tone(988, 0.06, 'square', 0.04);
      tone(1319, 0.1, 'square', 0.04, 0.05);
      break;
    case 'reward':
      tone(659, 0.1, 'triangle', 0.06);
      tone(880, 0.1, 'triangle', 0.06, 0.08);
      tone(1047, 0.25, 'triangle', 0.07, 0.16);
      break;
    case 'whoosh':
      tone(200, 0.2, 'sawtooth', 0.03);
      break;
    default:
      break;
  }
}

initMuteState();
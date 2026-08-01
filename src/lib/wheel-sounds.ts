/** Tiny WebAudio helper: tick/win/lose sounds generated on the fly, no assets. */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  audio();
}

function blip(
  freq: number,
  duration: number,
  type: OscillatorType,
  gainPeak = 0.18,
  startOffset = 0,
  endFreq?: number,
) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + startOffset;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Peg click as the wheel passes a segment boundary. */
export function playTick(speed = 1) {
  blip(760 + speed * 320, 0.05, "square", 0.07, 0, 340);
}

export function playSpinStart() {
  blip(180, 0.35, "sawtooth", 0.06, 0, 620);
}

export function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    blip(f, 0.42, "triangle", 0.16, i * 0.09),
  );
}

export function playLose() {
  blip(420, 0.3, "sine", 0.12, 0, 180);
  blip(300, 0.4, "sine", 0.1, 0.16, 120);
}

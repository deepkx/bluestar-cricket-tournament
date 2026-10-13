let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  return sharedCtx;
}

export async function unlockDrawAudio(): Promise<boolean> {
  const ctx = getCtx();
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  return ctx.state === 'running';
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noiseBurst(ctx: AudioContext, start: number, duration: number, gainPeak: number) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 820;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainPeak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(start);
  src.stop(start + duration + 0.02);
}

export function playDrawShuffleTick(): void {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  tone(ctx, 520 + Math.random() * 80, t, 0.04, 0.035, 'triangle');
}

/** Wheel rotation tick — pitch drops as spin slows (progress 0..1). */
export function playWheelSpinTick(progress = 0): void {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  const freq = 680 - progress * 320 + Math.random() * 40;
  tone(ctx, freq, t, 0.035, 0.04 + (1 - progress) * 0.02, 'triangle');
}

export function playDrawPick(): void {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  noiseBurst(ctx, t, 0.07, 0.22);
  tone(ctx, 180, t, 0.09, 0.12, 'square');
  tone(ctx, 90, t + 0.02, 0.14, 0.08, 'sine');
}

export function playDrawRoundWhoosh(): void {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  tone(ctx, 240, t, 0.12, 0.06, 'sawtooth');
  tone(ctx, 360, t + 0.04, 0.1, 0.04, 'sine');
}

export function playDrawComplete(): void {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((f, i) => {
    tone(ctx, f, t + i * 0.11, 0.35, 0.07, 'sine');
  });
  noiseBurst(ctx, t + 0.05, 0.25, 0.08);
}

/**
 * A very small original ambient bed, synthesised in the browser.
 * No audio files, nothing licensed, nothing that plays without being asked.
 */

type Nodes = {
  ctx: AudioContext;
  master: GainNode;
  pad: GainNode;
  oscs: OscillatorNode[];
  hiss: AudioBufferSourceNode;
};

let nodes: Nodes | null = null;
let on = false;

const CHORD = [110, 164.81, 220, 329.63]; // A2 E3 A3 E4 -- open and warm

function build(): Nodes {
  const Ctor = window.AudioContext || (window as any).webkitAudioContext;
  const ctx: AudioContext = new Ctor();

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const pad = ctx.createGain();
  pad.gain.value = 0.11;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  lp.Q.value = 0.4;
  pad.connect(lp).connect(master);

  const oscs = CHORD.map((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 0 ? 'triangle' : 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = i === 0 ? 0.5 : 0.22 / (i + 1);
    // a slow drift so it never sits perfectly still
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.03 + i * 0.017;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 0.7 + i * 0.5;
    lfo.connect(lfoAmt).connect(o.detune);
    lfo.start();
    o.connect(g).connect(pad);
    o.start();
    return o;
  });

  // soft room tone
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.02) * 0.985;
    d[i] = last;
  }
  const hiss = ctx.createBufferSource();
  hiss.buffer = buf;
  hiss.loop = true;
  const hg = ctx.createGain();
  hg.gain.value = 0.5;
  hiss.connect(hg).connect(master);
  hiss.start();

  return { ctx, master, pad, oscs, hiss };
}

export function setSound(enabled: boolean) {
  on = enabled;
  if (enabled && !nodes) nodes = build();
  if (!nodes) return;
  if (nodes.ctx.state === 'suspended') void nodes.ctx.resume();
  const t = nodes.ctx.currentTime;
  nodes.master.gain.cancelScheduledValues(t);
  nodes.master.gain.setTargetAtTime(enabled ? 0.5 : 0, t, 0.6);
}

/** Slide the pad down a fifth for the night scene. */
export function setNight(night: boolean) {
  if (!nodes) return;
  const t = nodes.ctx.currentTime;
  nodes.oscs.forEach((o, i) => {
    o.frequency.setTargetAtTime(CHORD[i] * (night ? 0.667 : 1), t, 2.5);
  });
}

function ping(freq: number, dur: number, vol: number, type: OscillatorType = 'sine') {
  if (!on || !nodes) return;
  const { ctx, master } = nodes;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  tap: () => ping(660, 0.16, 0.06, 'triangle'),
  found: () => {
    ping(587.33, 0.5, 0.07);
    setTimeout(() => ping(880, 0.7, 0.055), 130);
  },
  soft: () => ping(392, 0.9, 0.05),
  locked: () => ping(196, 0.22, 0.045, 'triangle'),
};

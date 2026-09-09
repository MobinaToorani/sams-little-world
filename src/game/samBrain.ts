import { WALK, SPOTS } from './layout';
import type { SpriteName } from './sprites';

/* -------------------------------------------------------------------------
   Sam does his own thing. He is not controlled by the player -- he wanders,
   loafs, blinks, naps, sometimes leaves the room entirely and comes back.
   Touching an object in the room can invite him over, but he decides when.
   ------------------------------------------------------------------------- */

export type SamState =
  | 'sit'
  | 'loaf'
  | 'sleep'
  | 'walk'
  | 'stretch'
  | 'inBox'
  | 'peek'
  | 'withYou'
  | 'away';

export type Sam = {
  x: number;
  y: number;
  face: 1 | -1;
  state: SamState;
  /** Seconds left in the current state. */
  timer: number;
  goto: { x: number; y: number; then: SamState; face?: 1 | -1 } | null;
  clock: number;
  blink: number;
  blinking: boolean;
  tail: number;
  /** Set while the quiet moment is playing; overrides normal wandering. */
  held: boolean;
};

export function createSam(): Sam {
  return {
    x: 150,
    y: 140,
    face: -1,
    state: 'sit',
    timer: 2.5,
    goto: null,
    clock: 0,
    blink: 3,
    blinking: false,
    tail: 0,
    held: false,
  };
}

const pick = <T,>(xs: T[]) => xs[(Math.random() * xs.length) | 0];
const range = (a: number, b: number) => a + Math.random() * (b - a);

/** Where he goes when an object invites him over. */
export function inviteSam(sam: Sam, reaction: string) {
  if (sam.held) return;
  switch (reaction) {
    case 'box':
      sam.goto = { x: SPOTS.box.x, y: SPOTS.box.y, then: 'inBox' };
      break;
    case 'bowl':
      sam.goto = { x: SPOTS.bowl.x, y: SPOTS.bowl.y, then: 'sit', face: 1 };
      break;
    case 'stella':
      sam.goto = { x: SPOTS.stella.x, y: SPOTS.stella.y, then: 'loaf', face: -1 };
      break;
    case 'blanket':
      sam.goto = { x: SPOTS.blanket.x, y: SPOTS.blanket.y, then: 'loaf' };
      break;
    case 'lookUp':
      sam.goto = { x: SPOTS.drawer.x, y: SPOTS.drawer.y, then: 'sit', face: 1 };
      break;
    case 'cupboard':
      sam.goto = { x: SPOTS.cupboard.x, y: SPOTS.cupboard.y, then: 'sit', face: 1 };
      break;
    case 'come':
      sam.goto = { x: range(110, 150), y: 150, then: 'sit' };
      break;
  }
  if (sam.goto) {
    sam.state = 'walk';
    sam.timer = 12;
    if (sam.x > 250) sam.x = 250;
  }
}

/** The quiet moment: he comes and sits with you, and stays put. */
export function holdSam(sam: Sam) {
  sam.held = true;
  sam.goto = { x: 128, y: 150, then: 'withYou' };
  sam.state = 'walk';
  sam.timer = 12;
}

export function releaseSam(sam: Sam) {
  sam.held = false;
  sam.state = 'sit';
  sam.timer = 3;
}

function nextIdleState(sam: Sam) {
  const roll = Math.random();
  if (roll < 0.34) {
    // a little wander
    sam.goto = {
      x: range(WALK.minX + 14, WALK.maxX - 14),
      y: range(WALK.minY, WALK.maxY),
      then: pick<SamState>(['sit', 'sit', 'loaf', 'stretch']),
    };
    sam.state = 'walk';
    sam.timer = 12;
  } else if (roll < 0.5) {
    sam.state = 'loaf';
    sam.timer = range(6, 12);
  } else if (roll < 0.6) {
    sam.state = 'sleep';
    sam.timer = range(10, 18);
  } else if (roll < 0.68) {
    sam.state = 'stretch';
    sam.timer = 1.6;
  } else if (roll < 0.76) {
    // off to do cat things
    sam.goto = { x: Math.random() < 0.5 ? -24 : 278, y: range(126, 148), then: 'away' };
    sam.state = 'walk';
    sam.timer = 14;
  } else {
    sam.state = 'sit';
    sam.timer = range(4, 9);
  }
}

export function tickSam(sam: Sam, dt: number) {
  sam.clock += dt;
  sam.tail += dt;

  // blinking, independent of everything else
  sam.blink -= dt;
  if (sam.blink <= 0) {
    if (sam.blinking) {
      sam.blinking = false;
      sam.blink = range(2.4, 6.5);
    } else {
      sam.blinking = true;
      sam.blink = 0.14;
    }
  }

  sam.timer -= dt;

  if (sam.state === 'walk' && sam.goto) {
    const speed = 22;
    const dx = sam.goto.x - sam.x;
    const dy = sam.goto.y - sam.y;
    const d = Math.hypot(dx, dy);
    if (d < 1.5 || sam.timer <= 0) {
      sam.x = sam.goto.x;
      sam.y = sam.goto.y;
      sam.state = sam.goto.then;
      if (sam.goto.face) sam.face = sam.goto.face;
      sam.timer = sam.state === 'away' ? range(3, 7) : range(5, 11);
      sam.goto = null;
    } else {
      sam.face = dx < -0.4 ? -1 : dx > 0.4 ? 1 : sam.face;
      sam.x += (dx / d) * speed * dt;
      sam.y += (dy / d) * speed * dt * 0.55;
    }
    return;
  }

  if (sam.state === 'inBox') {
    // pops his head up now and then
    if (sam.timer <= 0) {
      sam.state = 'peek';
      sam.timer = range(2.5, 5);
    }
    return;
  }
  if (sam.state === 'peek') {
    if (sam.timer <= 0) {
      sam.state = 'inBox';
      sam.timer = range(4, 9);
    }
    return;
  }

  if (sam.held) return;

  if (sam.state === 'away' && sam.timer <= 0) {
    sam.x = sam.x < 0 ? -20 : 274;
    sam.goto = { x: range(60, 190), y: range(WALK.minY, WALK.maxY), then: 'sit' };
    sam.state = 'walk';
    sam.timer = 14;
    return;
  }

  if (sam.timer <= 0) nextIdleState(sam);
}

/** Which frame to draw right now. */
export function samSprite(sam: Sam): { name: SpriteName; flip: boolean; closed: boolean } {
  const flip = sam.face === 1;
  switch (sam.state) {
    case 'walk': {
      const f = (Math.floor(sam.clock * 7) % 4) + 1;
      return { name: `walk${f}` as SpriteName, flip, closed: false };
    }
    case 'loaf':
      return { name: 'loaf', flip, closed: sam.blinking || sam.timer < 2 };
    case 'sleep':
      return { name: 'sleep', flip, closed: true };
    case 'stretch':
      return { name: 'stretch', flip, closed: false };
    case 'inBox':
      return { name: 'boxIn', flip: false, closed: sam.blinking };
    case 'peek':
      return { name: 'boxPeek', flip: false, closed: sam.blinking };
    case 'withYou':
      return { name: 'sit', flip: false, closed: sam.blinking };
    case 'sit':
    default: {
      // facing the player unless he walked here facing sideways
      const side = sam.goto === null && Math.floor(sam.tail / 3.1) % 3 === 2;
      if (side) return { name: 'sitSide', flip, closed: sam.blinking };
      const flick = Math.floor(sam.tail * 1.6) % 5 === 0;
      return { name: flick ? 'sitTail' : 'sit', flip: false, closed: sam.blinking };
    }
  }
}

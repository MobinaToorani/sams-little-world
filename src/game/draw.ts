import { SPRITES, SPRITE_PALETTE, SPRITE_W, type SpriteName } from './sprites';
import { C } from '../data/palette';
import { ROOM_W, ROOM_H, type Rect } from './layout';
import { Ctx, rect, px, hline, frame, dither, blit, disc, rng } from './pixel';
import type { Sam } from './samBrain';

/** Row of the sprite that rests on the ground, so poses don't bob. */
const BASE: Record<string, number> = {
  sit: 19,
  sitTail: 19,
  sitSide: 19,
  walk1: 16,
  walk2: 16,
  walk3: 16,
  walk4: 16,
  loaf: 16,
  sleep: 15,
  stretch: 16,
  boxPeek: 12,
  boxIn: 10,
  stellaLoaf: 16,
  stellaSleep: 15,
};

/** Shut the eyes: top row becomes fur, bottom row becomes a dark lash line. */
const closedCache = new Map<string, string[]>();
function closed(name: SpriteName): string[] {
  const hit = closedCache.get(name);
  if (hit) return hit;
  const map = SPRITES[name] as readonly string[];
  let seen = 0;
  const out = map.map((row) => {
    if (!row.includes('E')) return row;
    seen++;
    const to = seen === 1 ? 'K' : 'k';
    return row.replace(/[Ep]/g, to);
  });
  closedCache.set(name, out);
  return out;
}

function shadow(c: Ctx, x: number, y: number, w: number) {
  dither(c, x - (w >> 1), y - 1, w, 2, C.seam, (x | 0) % 2);
}

export function drawSam(c: Ctx, sam: Sam, sprite: { name: SpriteName; flip: boolean; closed: boolean }) {
  if (sam.state === 'away') return;
  const map = sprite.closed ? closed(sprite.name) : (SPRITES[sprite.name] as readonly string[]);

  if (sam.state === 'inBox' || sam.state === 'peek') {
    blit(c, map, SPRITE_PALETTE, 98, sam.state === 'peek' ? 110 : 104, false);
    return;
  }
  const x = Math.round(sam.x) - (SPRITE_W >> 1);
  const y = Math.round(sam.y) - BASE[sprite.name];
  if (sam.state !== 'sleep') shadow(c, Math.round(sam.x), Math.round(sam.y), 16);
  blit(c, map, SPRITE_PALETTE, x, y, sprite.flip);

  // whiskers -- drawn as lines so they stay hair-thin
  if (sam.state === 'sit' || sam.state === 'withYou') {
    const cy = y + 9;
    for (const d of [0, 2]) {
      hline(c, x - 3, cy + d, 4, C.mat);
      hline(c, x + SPRITE_W - 1, cy + d, 4, C.mat);
    }
  }
}

export function drawStella(c: Ctx, t: number, awake: boolean) {
  const name: SpriteName = awake ? 'stellaLoaf' : 'stellaSleep';
  const map = awake && Math.sin(t * 0.9) > 0.93 ? closed(name) : (SPRITES[name] as readonly string[]);
  // she breathes, very slightly
  const lift = Math.sin(t * 1.1) > 0.6 ? 1 : 0;
  blit(c, map, SPRITE_PALETTE, 28, 108 - BASE[name] + 16 - lift, false);
}

/** Dust turning over in the window light. */
export function drawDust(c: Ctx, t: number, count = 14) {
  const r = rng(77);
  for (let i = 0; i < count; i++) {
    const bx = 22 + r() * 66;
    const by = 20 + r() * 110;
    const sp = 0.25 + r() * 0.5;
    const amp = 4 + r() * 8;
    const y = ((by + ((t * sp * 9) % 130)) % 130) + 18;
    const x = bx + Math.sin(t * sp + i) * amp;
    px(c, x | 0, y | 0, r() > 0.5 ? C.bulbGlow : C.mat);
  }
}

export function drawHighlight(c: Ctx, r: Rect, t: number, found: boolean) {
  const pulse = (Math.sin(t * 4) + 1) / 2;
  const col = found ? C.creamLo : C.bulbGlow;
  const inset = 1 + (pulse > 0.5 ? 1 : 0);
  const x = r.x - inset;
  const y = r.y - inset;
  const w = r.w + inset * 2;
  const h = r.h + inset * 2;
  // dashed, hand-drawn-looking outline
  for (let i = 0; i < w; i++) {
    if (i % 4 < 2) {
      px(c, x + i, y, col);
      px(c, x + i, y + h - 1, col);
    }
  }
  for (let j = 0; j < h; j++) {
    if (j % 4 < 2) {
      px(c, x, y + j, col);
      px(c, x + w - 1, y + j, col);
    }
  }
  if (!found) {
    const by = y - 5 - (pulse > 0.5 ? 1 : 0);
    const bx = x + (w >> 1);
    rect(c, bx - 1, by, 3, 1, C.bulb);
    rect(c, bx, by - 1, 1, 3, C.bulb);
  }
}

/** A quiet twinkle on things the player has not found yet. */
export function drawTwinkle(c: Ctx, r: Rect, t: number, seed: number) {
  const phase = (t * 0.55 + seed * 0.37) % 4;
  if (phase > 0.5) return;
  const a = Math.sin((phase / 0.5) * Math.PI);
  if (a < 0.35) return;
  const rr = rng(seed * 91 + 3);
  const x = (r.x + 3 + rr() * (r.w - 6)) | 0;
  const y = (r.y + 3 + rr() * (r.h - 6)) | 0;
  px(c, x, y, C.bulbGlow);
  if (a > 0.7) {
    px(c, x - 1, y, C.bulb);
    px(c, x + 1, y, C.bulb);
    px(c, x, y - 1, C.bulb);
    px(c, x, y + 1, C.bulb);
  }
}

/** Notes the player leaves, pinned up on the wall. */
export function drawNotes(c: Ctx, count: number) {
  const r = rng(31);
  const n = Math.min(count, 9);
  for (let i = 0; i < n; i++) {
    const x = 88 + (i % 5) * 21 + ((r() * 3) | 0);
    const y = 58 + Math.floor(i / 5) * 20 + ((r() * 3) | 0);
    rect(c, x + 1, y + 1, 16, 15, C.wallShadow);
    rect(c, x, y, 16, 15, C.note);
    frame(c, x, y, 16, 15, C.noteLo);
    for (let j = 0; j < 4; j++) hline(c, x + 3, y + 4 + j * 3, 8 + ((r() * 4) | 0), C.noteLo);
    px(c, x + 8, y - 1, C.chaletRed);
    px(c, x + 8, y, C.chaletLo);
  }
}

/* ------------------------------- the ending ------------------------------ */

export function drawNight(c: Ctx, t: number, samSprite: readonly string[]) {
  const HORIZON = 100;
  const LEDGE = 124;

  // sky, deepest at the top
  rect(c, 0, 0, ROOM_W, ROOM_H, C.nSky);
  rect(c, 0, 0, ROOM_W, 48, C.nSkyLo);
  dither(c, 0, 40, ROOM_W, 16, C.nSkyLo, 1);
  dither(c, 0, HORIZON - 26, ROOM_W, 10, C.nGlow, 1);
  dither(c, 0, HORIZON - 16, ROOM_W, 16, C.nGlow);

  // stars, twinkling at their own speeds
  const r = rng(5150);
  for (let i = 0; i < 110; i++) {
    const x = (r() * ROOM_W) | 0;
    const y = (r() * (HORIZON - 6)) | 0;
    const bright = r();
    const tw = Math.sin(t * (0.5 + bright * 1.8) + i * 1.7);
    if (tw > 0.1) {
      px(c, x, y, bright > 0.8 ? C.nStar : C.nGlow);
      if (bright > 0.94 && tw > 0.85) {
        px(c, x - 1, y, C.nGlow);
        px(c, x + 1, y, C.nGlow);
        px(c, x, y - 1, C.nGlow);
        px(c, x, y + 1, C.nGlow);
      }
    }
  }

  // moon, with a soft halo
  const mx = 202;
  const my = 30;
  disc(c, mx, my, 14, '#2b3352');
  disc(c, mx, my, 11, '#333b5e');
  disc(c, mx, my, 9, C.nMoon);
  disc(c, mx - 1, my - 1, 7, '#fdf6dd');
  disc(c, mx + 3, my + 2, 2, C.nMoon);
  disc(c, mx - 4, my + 3, 1, C.nMoon);
  px(c, mx + 1, my - 4, C.nMoon);

  // a skyline of houses behind, each with a chimney or two
  const sr = rng(2024);
  let x = -6;
  while (x < ROOM_W + 6) {
    const w = 16 + ((sr() * 22) | 0);
    const h = 8 + ((sr() * 20) | 0);
    const top = HORIZON - h;
    rect(c, x, top, w, LEDGE - top, C.nHouse);
    hline(c, x, top, w, C.nHouseTop);
    if (sr() > 0.35) {
      const cw = 3 + ((sr() * 2) | 0);
      const cx2 = x + 3 + ((sr() * (w - cw - 5)) | 0);
      rect(c, cx2, top - 5, cw, 5, C.nHouse);
      hline(c, cx2, top - 5, cw, C.nHouseTop);
    }
    // a couple of windows still lit at this hour
    for (let wy = top + 4; wy < LEDGE - 5; wy += 8) {
      for (let wx = x + 4; wx < x + w - 5; wx += 8) {
        if (sr() > 0.84) {
          rect(c, wx, wy, 2, 3, C.nLit);
          px(c, wx, wy + 1, '#e8c477');
        }
      }
    }
    x += w;
  }

  // the parapet Sam is sitting on, nearest and darkest
  rect(c, 0, LEDGE, ROOM_W, ROOM_H - LEDGE, C.nLedge);
  // a thin line of moonlight along the top edge
  hline(c, 0, LEDGE, ROOM_W, C.nLedgeTop);
  dither(c, 0, LEDGE + 1, ROOM_W, 3, C.nLedgeTop, 1);
  // brick courses, kept very quiet
  for (let y = LEDGE + 8; y < ROOM_H; y += 8) {
    dither(c, 0, y, ROOM_W, 1, C.nLedgeLine);
    const br = rng(y * 13);
    for (let bx = ((br() * 22) | 0); bx < ROOM_W; bx += 19 + ((br() * 10) | 0)) {
      rect(c, bx, y, 1, 8, C.nLedgeLine);
    }
  }

  // Sam, twice size, in silhouette with the moon catching his white
  const pal: Record<string, string | null> = {
    ...SPRITE_PALETTE,
    K: '#16151f',
    k: '#0f0e16',
    H: '#201e2c',
    W: '#e6e0d2',
    w: '#b0aaa4',
    r: '#2b2438',
    N: '#8e7b84',
    E: '#cbd68a',
  };
  const sx = 100;
  const sy = LEDGE - 19 * 2;
  // a faint moonlit rim down the side facing the moon
  blit(c, samSprite, { ...pal, K: '#33304a', k: '#33304a', H: '#33304a' }, sx + 2, sy, false, 2);
  blit(c, samSprite, pal, sx, sy, false, 2);
}

/** Tiny integer-pixel drawing helpers. Everything here works in room pixels. */

export type Ctx = CanvasRenderingContext2D;

/** Deterministic PRNG so the room's texture is identical on every load. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function px(c: Ctx, x: number, y: number, col: string) {
  c.fillStyle = col;
  c.fillRect(x | 0, y | 0, 1, 1);
}

export function rect(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  c.fillStyle = col;
  c.fillRect(x | 0, y | 0, w | 0, h | 0);
}

export function frame(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  rect(c, x, y, w, 1, col);
  rect(c, x, y + h - 1, w, 1, col);
  rect(c, x, y, 1, h, col);
  rect(c, x + w - 1, y, 1, h, col);
}

export function hline(c: Ctx, x: number, y: number, w: number, col: string) {
  rect(c, x, y, w, 1, col);
}

export function vline(c: Ctx, x: number, y: number, h: number, col: string) {
  rect(c, x, y, 1, h, col);
}

/** Checkerboard dither -- the classic way to fake a third shade. */
export function dither(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
  phase = 0,
) {
  c.fillStyle = col;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if ((i + j + phase) % 2 === 0) c.fillRect((x + i) | 0, (y + j) | 0, 1, 1);
    }
  }
}

/** Deterministic speckle, for wood grain and fabric fuzz. */
export function speckle(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  cols: string[],
  seed: number,
  density = 0.08,
) {
  const r = rng(seed);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (r() < density) px(c, x + i, y + j, cols[(r() * cols.length) | 0]);
    }
  }
}

/** A soft-cornered filled box -- corners knocked off so nothing looks CSS-y. */
export function softRect(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
  r = 1,
) {
  rect(c, x + r, y, w - r * 2, h, col);
  rect(c, x, y + r, r, h - r * 2, col);
  rect(c, x + w - r, y + r, r, h - r * 2, col);
}

/** A filled pixel circle -- proper round, not a plus sign. */
export function disc(c: Ctx, cx: number, cy: number, r: number, col: string) {
  c.fillStyle = col;
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y));
    c.fillRect((cx - w) | 0, (cy + y) | 0, w * 2 + 1, 1);
  }
}

/** Draws a string-array sprite. */
export function blit(
  c: Ctx,
  map: readonly string[],
  palette: Record<string, string | null>,
  x: number,
  y: number,
  flip = false,
  scale = 1,
) {
  const w = map[0].length;
  for (let j = 0; j < map.length; j++) {
    const row = map[j];
    for (let i = 0; i < w; i++) {
      const col = palette[row[i]];
      if (!col) continue;
      const sx = flip ? w - 1 - i : i;
      c.fillStyle = col;
      c.fillRect((x + sx * scale) | 0, (y + j * scale) | 0, scale, scale);
    }
  }
}

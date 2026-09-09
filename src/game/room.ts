import { C } from '../data/palette';
import { ROOM_W, ROOM_H, FLOOR_Y, HOTSPOTS } from './layout';
import { Ctx, rect, hline, vline, frame, dither, speckle, px, softRect, rng } from './pixel';

/* -------------------------------------------------------------------------
   The room is drawn once into an offscreen canvas. Only Sam, Stella, dust
   and the highlights are redrawn each frame.
   ------------------------------------------------------------------------- */

function wall(c: Ctx) {
  rect(c, 0, 0, ROOM_W, FLOOR_Y, C.wall);

  // faint vertical wallpaper stripes
  for (let x = 3; x < ROOM_W; x += 9) {
    for (let y = 0; y < FLOOR_Y - 8; y++) if (y % 3 !== 2) px(c, x, y, C.wallHi);
  }

  // light falling in from the window, warmest at the top left
  dither(c, 0, 0, 104, 44, C.wallHi);
  dither(c, 0, 0, 64, 66, C.wallHi, 1);

  // a soft shadow gathering just above the skirting
  dither(c, 0, 87, ROOM_W, 3, C.wallLo, 1);
  rect(c, 0, 90, ROOM_W, 3, C.wallLo);
  rect(c, 0, 93, ROOM_W, 2, C.wallShadow);

  // painted skirting board -- lighter than the wall, like real trim
  rect(c, 0, 95, ROOM_W, 9, C.mat);
  hline(c, 0, 95, ROOM_W, C.creamLo);
  hline(c, 0, 96, ROOM_W, '#fbf5e6');
  hline(c, 0, 99, ROOM_W, C.creamLo);
  hline(c, 0, 102, ROOM_W, C.creamLo);
  hline(c, 0, 103, ROOM_W, C.baseLo);
}

function floor(c: Ctx) {
  // Boards get taller towards the viewer -- a cheap, readable perspective.
  const seams = [104, 112, 122, 134, 148, 161];
  for (let b = 0; b < seams.length - 1; b++) {
    const y = seams[b];
    const h = seams[b + 1] - y;
    rect(c, 0, y, ROOM_W, h, b % 2 ? C.floorAlt : C.floor);
    // low-contrast grain, so it reads as wood and not as brick
    speckle(c, 0, y, ROOM_W, h, [C.seamSoft, C.floorLit], 1000 + b * 37, 0.045);
    hline(c, 0, y, ROOM_W, C.seamSoft);
    // one or two staggered board ends per row, kept soft
    const r = rng(70 + b);
    for (let x = ((r() * 90) | 0) + 24; x < ROOM_W; x += 96 + ((r() * 50) | 0)) {
      for (let j = 1; j < h; j++) if (j % 3 !== 2) px(c, x, y + j, C.seamSoft);
    }
  }
  hline(c, 0, FLOOR_Y, ROOM_W, C.seam);

  // sunlight pooling on the floor under the window
  const beam = HOTSPOTS.window;
  for (let y = FLOOR_Y + 1; y < 154; y++) {
    const t = (y - FLOOR_Y) / 50;
    const x0 = (beam.x + 6 - t * 16) | 0;
    const x1 = (beam.x + beam.w + 4 + t * 30) | 0;
    dither(c, x0, y, x1 - x0, 1, C.floorLit, y % 2);
    rect(c, x0 + 7, y, x1 - x0 - 14, 1, C.floorLit);
  }
  // the window bar shadow falling across the pool
  for (let y = FLOOR_Y + 1; y < 150; y += 1) {
    const t = (y - FLOOR_Y) / 50;
    const bx = (beam.x + 26 + t * 12) | 0;
    dither(c, bx, y, 3, 1, C.floorAlt, y % 2);
  }
}

function windowFrame(c: Ctx) {
  const { x, y, w, h } = HOTSPOTS.window;
  const gx = x + 8;
  const gy = y + 3;
  const gw = w - 16;
  const gh = h - 14;

  // sky, banded lighter towards the horizon
  rect(c, gx, gy, gw, gh, C.skyLo);
  rect(c, gx, gy + 10, gw, gh - 10, C.sky);
  dither(c, gx, gy + 6, gw, 8, C.sky);
  dither(c, gx, gy + gh - 12, gw, 12, C.cloud, 1);

  // a couple of soft clouds
  const cloud = (cx: number, cy: number, s: number) => {
    softRect(c, cx, cy, 12 * s, 3, C.cloud);
    softRect(c, cx + 3, cy - 2, 7 * s, 3, C.cloud);
  };
  cloud(gx + 3, gy + 12, 1);
  cloud(gx + 20, gy + 22, 1);

  // rooftops on the horizon, so it reads as a real outside
  rect(c, gx, gy + gh - 5, gw, 5, C.wallLo);
  rect(c, gx + 4, gy + gh - 9, 9, 4, C.woodLo);
  rect(c, gx + 18, gy + gh - 11, 12, 6, C.wallShadow);
  rect(c, gx + 32, gy + gh - 8, 8, 3, C.woodLo);

  // muntins
  vline(c, gx + ((gw / 2) | 0), gy, gh, C.winFrame);
  hline(c, gx, gy + ((gh / 2) | 0), gw, C.winFrame);

  // frame
  frame(c, gx - 2, gy - 2, gw + 4, gh + 4, C.winFrame);
  frame(c, gx - 1, gy - 1, gw + 2, gh + 2, C.winFrameLo);
  frame(c, gx - 3, gy - 3, gw + 6, gh + 6, C.winFrame);

  // sill
  rect(c, x + 3, gy + gh + 3, w - 6, 3, C.sill);
  hline(c, x + 3, gy + gh + 5, w - 6, C.winFrameLo);
  rect(c, x + 5, gy + gh + 6, w - 10, 1, C.wallShadow);

  // curtains
  for (const [cx, dir] of [
    [x - 1, 1],
    [x + w - 9, -1],
  ] as const) {
    rect(c, cx, y - 1, 10, h - 8, C.curtain);
    for (let i = 0; i < 3; i++) vline(c, cx + 2 + i * 3, y - 1, h - 8, C.curtainLo);
    // wavy hem
    for (let i = 0; i < 10; i++) {
      const d = i % 4 < 2 ? 0 : 1;
      rect(c, cx + i, y + h - 9, 1, 2 + d, C.curtain);
      px(c, cx + i, y + h - 8 + d, C.curtainLo);
    }
    rect(c, cx + (dir > 0 ? 8 : 0), y - 1, 2, h - 8, C.curtainLo);
  }
  // rail
  rect(c, x - 3, y - 4, w + 6, 2, C.wood);
  hline(c, x - 3, y - 3, w + 6, C.woodLo);
}

function figure(
  c: Ctx,
  x: number,
  base: number,
  h: number,
  col: string,
  hair: string,
) {
  const top = base - h;
  // head
  rect(c, x + 2, top + 1, 4, 4, col);
  rect(c, x + 2, top, 4, 2, hair);
  px(c, x + 1, top + 2, hair);
  px(c, x + 6, top + 2, hair);
  // neck
  rect(c, x + 3, top + 5, 2, 1, col);
  // shoulders, widening
  rect(c, x + 1, top + 6, 6, 2, col);
  rect(c, x, top + 8, 8, base - top - 8, col);
}

function pictureFrame(
  c: Ctx,
  r: { x: number; y: number; w: number; h: number },
  kind: 'family' | 'clara',
) {
  const { x, y, w, h } = r;
  rect(c, x + 1, y + 1, w, h, C.wallShadow); // drop shadow
  rect(c, x, y, w, h, C.wood);
  frame(c, x, y, w, h, C.woodLo);
  hline(c, x + 1, y + 1, w - 2, '#c39a6c');
  rect(c, x + 3, y + 3, w - 6, h - 6, C.mat);
  frame(c, x + 3, y + 3, w - 6, h - 6, C.creamLo);

  const ix = x + 5;
  const iy = y + 5;
  const iw = w - 10;
  const ih = h - 10;
  // a warm indoor ground, so a frame never reads as another window
  rect(c, ix, iy, iw, ih, C.paperWarm);
  dither(c, ix, iy, iw, Math.max(2, (ih / 2) | 0), C.mat, 1);
  rect(c, ix, iy + ih - 3, iw, 3, C.curtainLo);

  const base = iy + ih - 1;
  if (kind === 'family') {
    figure(c, ix, base, 13, C.blueSoft, C.woodLo);
    figure(c, ix + 8, base, 15, C.chaletRed, '#6b4038');
    figure(c, ix + 16, base, 12, C.rugLo, C.leafDk);
  } else {
    figure(c, ix + 1, base, 14, C.blueSoft, C.wood);
    // a small black cat tucked in beside her
    rect(c, ix + 10, base - 6, 7, 6, C.ink);
    px(c, ix + 10, base - 7, C.ink);
    px(c, ix + 12, base - 7, C.ink);
    rect(c, ix + 11, base - 4, 4, 2, C.mat);
    rect(c, ix + 17, base - 5, 1, 4, C.ink);
  }
}

/** The snack cupboard, door left open. Sam's favourite crime scene. */
function cupboard(c: Ctx) {
  const { x, y, w, h } = HOTSPOTS.cupboard;
  rect(c, x + 2, y + 3, w, h, C.wallShadow);
  rect(c, x, y, w, h, C.cream);
  frame(c, x, y, w, h, C.creamLo);
  rect(c, x + 3, y + 3, w - 6, h - 6, C.paperWarm);
  frame(c, x + 3, y + 3, w - 6, h - 6, C.creamLo);
  dither(c, x + 4, y + 4, w - 8, 4, C.creamLo, 1);

  const shelfY = y + 17;
  rect(c, x + 3, shelfY, w - 6, 2, C.cream);
  hline(c, x + 3, shelfY, w - 6, C.creamLo);

  // groceries: [dx, width, height, colour, lid colour]
  const goods: [number, number, number, string, string][] = [
    [1, 5, 10, C.chaletRed, C.label],
    [7, 4, 7, C.blueSoft, C.mat],
    [12, 4, 9, C.leafDk, C.chicken],
    [17, 6, 11, C.label, C.chaletLo],
    [24, 5, 8, C.bowl, C.mat],
    [30, 4, 10, C.chicken, C.woodLo],
    [35, 4, 7, C.cushion, C.label],
    [40, 5, 9, C.rug, C.mat],
  ];
  for (const [dx, gw, gh, col, top] of goods) {
    const gx = x + 5 + dx;
    rect(c, gx, shelfY - gh, gw, gh, col);
    hline(c, gx, shelfY - gh, gw, top);
    px(c, gx, shelfY - 1, C.creamLo);
  }
  const lower: [number, number, number, string, string][] = [
    [2, 5, 9, C.bowlLo, C.mat],
    [8, 6, 8, C.chicken, C.label],
    [15, 4, 10, C.chaletLo, C.mat],
    [20, 6, 7, C.leaf, C.label],
    [27, 4, 9, C.label, C.blueSoft],
    [32, 5, 8, C.woodLo, C.chicken],
    [38, 6, 10, C.blueSoft, C.mat],
  ];
  for (const [dx, gw, gh, col, top] of lower) {
    const gx = x + 5 + dx;
    const base = y + h - 4;
    rect(c, gx, base - gh, gw, gh, col);
    hline(c, gx, base - gh, gw, top);
  }
}

function dresser(c: Ctx) {
  const { x, y, w, h } = HOTSPOTS.drawer;
  rect(c, x + 2, y + 4, w, h, C.wallShadow); // shadow on the wall

  rect(c, x, y, w, h, C.cream);
  frame(c, x, y, w, h, C.creamLo);
  rect(c, x, y, w, 4, C.mat); // top surface
  hline(c, x, y + 4, w, C.creamLo);

  // three drawers; the middle one is very much open
  const dy = [y + 8, y + 24, y + 44];
  for (let i = 0; i < 3; i++) {
    if (i === 1) continue;
    rect(c, x + 3, dy[i], w - 6, 13, C.cream);
    frame(c, x + 3, dy[i], w - 6, 13, C.creamLo);
    rect(c, x + ((w / 2) | 0) - 5, dy[i] + 6, 10, 2, C.metal);
  }

  // the open drawer: dark interior + a red plaid blanket
  const ox = x - 3;
  const oy = dy[1];
  const ow = w + 4;
  rect(c, ox, oy, ow, 16, C.woodLo);
  rect(c, ox + 2, oy + 2, ow - 4, 8, C.plaidLo);
  for (let i = 0; i < ow - 6; i += 4) vline(c, ox + 3 + i, oy + 2, 8, C.plaid);
  for (let j = 0; j < 8; j += 3) hline(c, ox + 2, oy + 2 + j, ow - 4, C.plaid);
  dither(c, ox + 2, oy + 2, ow - 4, 3, C.plaidLo, 1);
  // drawer front panel
  rect(c, ox, oy + 10, ow, 7, C.mat);
  frame(c, ox, oy + 10, ow, 7, C.creamLo);
  rect(c, ox + ((ow / 2) | 0) - 6, oy + 13, 12, 2, C.metal);

  // plant on top
  const plx = x + 6;
  const ply = y - 12;
  rect(c, plx, ply + 7, 9, 5, C.pot);
  hline(c, plx, ply + 7, 9, C.potLo);
  rect(c, plx + 1, ply + 11, 7, 1, C.potLo);
  for (const [dx, dy2, len] of [
    [1, 2, 5],
    [4, 0, 7],
    [7, 3, 4],
  ] as const) {
    rect(c, plx + dx, ply + 7 - len + dy2, 2, len, C.leaf);
    px(c, plx + dx, ply + 7 - len + dy2, C.leafDk);
  }

  // little radio on top
  const rx = x + 30;
  const ry = y - 9;
  rect(c, rx, ry, 18, 9, C.cream);
  frame(c, rx, ry, 18, 9, C.creamLo);
  rect(c, rx + 2, ry + 2, 8, 5, C.woodLo);
  dither(c, rx + 2, ry + 2, 8, 5, C.metal);
  px(c, rx + 13, ry + 4, C.chicken);
  vline(c, rx + 15, ry - 5, 6, C.metal);
}

function garland(c: Ctx) {
  const x0 = 84;
  const x1 = 190;
  for (let x = x0; x <= x1; x++) {
    const t = (x - x0) / (x1 - x0);
    const y = (8 + Math.sin(t * Math.PI) * 7) | 0;
    px(c, x, y, C.wire);
    if ((x - x0) % 18 === 9) {
      rect(c, x, y + 1, 1, 2, C.wire);
      rect(c, x - 1, y + 3, 3, 3, C.bulb);
      px(c, x, y + 2, C.bulbGlow);
      px(c, x - 1, y + 3, C.bulbGlow);
    }
  }
}

function foodCorner(c: Ctx) {
  const { x, y } = HOTSPOTS.chicken;
  // placemat
  rect(c, x + 2, y + 14, 44, 10, C.rugLo);
  rect(c, x + 3, y + 15, 42, 8, C.rug);
  dither(c, x + 3, y + 15, 42, 8, C.rugTrim, 1);

  // Swiss Chalet takeout box
  const bx = x + 3;
  const by = y + 2;
  rect(c, bx, by, 20, 15, C.chaletRed);
  rect(c, bx, by, 20, 3, C.chaletLo);
  frame(c, bx, by, 20, 15, C.chaletLo);
  rect(c, bx + 3, by + 6, 14, 6, C.label);
  hline(c, bx + 4, by + 8, 12, C.chaletLo);
  hline(c, bx + 5, by + 10, 9, C.chaletLo);
  // a folded-open flap
  rect(c, bx + 1, by - 3, 18, 4, C.chaletLo);
  rect(c, bx + 2, by - 2, 16, 2, C.label);

  // bowl with a piece of chicken in it
  const wx = x + 27;
  const wy = y + 11;
  softRect(c, wx + 1, wy + 4, 16, 6, C.bowlLo, 2); // the body of the bowl
  softRect(c, wx, wy, 18, 5, C.bowl, 2); // the rim, seen from above
  hline(c, wx + 2, wy, 14, '#c4d5e0');
  softRect(c, wx + 3, wy + 1, 12, 3, C.bowlLo, 1); // the well
  rect(c, wx + 5, wy + 1, 8, 3, C.chicken);
  hline(c, wx + 6, wy + 1, 6, C.chickenLo);
  px(c, wx + 7, wy + 2, C.label);
}

/** The fluted edge of corrugated card -- the cue that says "box", not "crate". */
function corrugate(c: Ctx, x: number, y: number, w: number, light: string, dark: string) {
  for (let i = 0; i < w; i++) px(c, x + i, y, i % 2 ? light : dark);
}

function boxBack(c: Ctx) {
  const { x, y, w } = HOTSPOTS.box;
  const backTop = y + 4;
  const frontTop = y + 20;
  const depth = frontTop - backTop;
  const inset = 6;

  // one flap standing up at the back left, leaning out
  for (let j = 0; j < 15; j++) {
    const lean = Math.round((15 - j) * 0.3);
    const fx = x + 2 - lean;
    rect(c, fx, backTop - 15 + j, 17, 1, j < 2 ? C.cardRim : j > 12 ? C.cardLo : C.card);
    px(c, fx, backTop - 15 + j, C.cardLo);
    px(c, fx + 16, backTop - 15 + j, C.cardDeep);
  }
  // and one folded open to the right
  rect(c, x + w - 6, backTop - 4, 13, 6, C.card);
  frame(c, x + w - 6, backTop - 4, 13, 6, C.cardLo);
  corrugate(c, x + w - 5, backTop - 4, 11, C.cardRim, C.cardLo);

  // the opening, seen from slightly above: a trapezoid, wider at the front
  for (let j = 0; j <= depth; j++) {
    const t = j / depth;
    const x0 = Math.round(x + inset - inset * t);
    const x1 = Math.round(x + w - inset + inset * t);
    const yy = backTop + j;
    if (j === 0) {
      corrugate(c, x0, yy, x1 - x0, C.cardRim, C.cardLo);
    } else if (j === 1) {
      rect(c, x0, yy, x1 - x0, 1, C.cardRim);
    } else {
      rect(c, x0, yy, x1 - x0, 1, C.cardDeep);
      px(c, x0, yy, C.cardLo);
      px(c, x1 - 1, yy, C.cardLo);
      if (j < 5) dither(c, x0 + 1, yy, x1 - x0 - 2, 1, C.cardLo, j);
    }
  }
}

function boxFront(c: Ctx) {
  const { x, y, w } = HOTSPOTS.box;
  const rimY = y + 20;

  // the near rim, corrugated so you can see it is card and not timber
  corrugate(c, x, rimY, w, '#f9ecd2', C.cardRim);
  rect(c, x, rimY + 1, w, 2, C.cardRim);
  hline(c, x, rimY + 2, w, C.cardLo);

  // front face
  const fy = rimY + 3;
  const fh = 17;
  rect(c, x, fy, w, fh, C.card);
  frame(c, x, fy, w, fh, C.cardLo);
  vline(c, x + 3, fy, fh, C.cardLo);
  vline(c, x + w - 4, fy, fh, C.cardLo);
  // a strip of tape across the seam, slightly crooked
  rect(c, x + 4, fy + 4, w - 8, 3, C.tape);
  px(c, x + 4, fy + 3, C.tape);
  px(c, x + w - 5, fy + 7, C.tape);
  // a shipping label nobody ever peeled off
  rect(c, x + 22, fy + 9, 12, 6, C.label);
  frame(c, x + 22, fy + 9, 12, 6, C.cardLo);
  hline(c, x + 24, fy + 11, 8, C.cardLo);
  hline(c, x + 24, fy + 13, 5, C.cardLo);
  speckle(c, x + 6, fy + 8, 14, 8, [C.cardLo], 909, 0.06);

  // contact shadow
  dither(c, x - 4, fy + fh, w + 8, 2, C.seam);
  dither(c, x - 2, fy + fh + 1, w + 4, 1, C.seam, 1);
}

function stellaCushion(c: Ctx) {
  const { x, y, w } = HOTSPOTS.stella;
  const cy = y + 11;
  dither(c, x + 4, cy + 12, w - 8, 2, C.seam);
  softRect(c, x + 1, cy + 3, w - 2, 10, C.cushionLo, 4);
  softRect(c, x + 3, cy, w - 6, 9, C.cushion, 4);
  // the dip a cat has worn into the middle
  softRect(c, x + 12, cy + 2, w - 24, 5, C.cushionLo, 2);
  hline(c, x + 8, cy + 1, w - 16, C.note);
  // stitching round the edge
  for (let i = x + 6; i < x + w - 6; i += 4) px(c, i, cy + 8, C.cushionLo);
}

function blanket(c: Ctx) {
  const { x, y, w, h } = HOTSPOTS.blanket;
  softRect(c, x, y, w, h, C.rugTrim, 2);
  softRect(c, x + 2, y + 2, w - 4, h - 4, C.rug, 2);
  dither(c, x + 2, y + 2, w - 4, h - 4, C.rugLo, 1);
  // the little floral print from the duvet in the photos
  const r = rng(4242);
  for (let i = 0; i < 26; i++) {
    const fx = x + 4 + ((r() * (w - 9)) | 0);
    const fy = y + 4 + ((r() * (h - 9)) | 0);
    px(c, fx, fy, C.rugTrim);
    px(c, fx + 1, fy + 1, C.rugTrim);
    px(c, fx - 1, fy + 1, C.rugTrim);
    px(c, fx, fy + 2, r() > 0.5 ? C.cushion : C.rugTrim);
  }
  // rumpled edge
  for (let i = 0; i < w; i += 3) px(c, x + i, y + h - 1, C.rugLo);
}

function toyMouse(c: Ctx) {
  const x = 188;
  const y = 150;
  softRect(c, x, y, 8, 4, C.creamLo);
  softRect(c, x + 1, y, 6, 3, C.mat);
  px(c, x + 7, y + 1, C.cushion);
  rect(c, x - 4, y + 2, 4, 1, C.creamLo);
  px(c, x + 2, y + 1, C.ink);
}

/** Everything behind Sam. */
export function drawRoomBack(c: Ctx) {
  c.clearRect(0, 0, ROOM_W, ROOM_H);
  wall(c);
  floor(c);
  garland(c);
  windowFrame(c);
  pictureFrame(c, HOTSPOTS.family, 'family');
  pictureFrame(c, HOTSPOTS.clara, 'clara');
  cupboard(c);
  dresser(c);
  foodCorner(c);
  stellaCushion(c);
  blanket(c);
  boxBack(c);
  toyMouse(c);
}

/** The one thing Sam can hide behind. */
export function drawRoomFront(c: Ctx) {
  c.clearRect(0, 0, ROOM_W, ROOM_H);
  boxFront(c);
}

/** Room geometry. Hotspot rects and drawing code both read from here. */

export const ROOM_W = 256;
export const ROOM_H = 160;
/** Where the wall meets the floor. */
export const FLOOR_Y = 104;

export type Rect = { x: number; y: number; w: number; h: number };

/** Interactive areas, keyed by memory id (plus `window`, the way out). */
export const HOTSPOTS: Record<string, Rect> = {
  window: { x: 18, y: 14, w: 60, h: 54 },
  family: { x: 96, y: 20, w: 34, h: 30 },
  clara: { x: 138, y: 26, w: 28, h: 26 },
  cupboard: { x: 196, y: 8, w: 52, h: 32 },
  drawer: { x: 194, y: 54, w: 56, h: 64 },
  stella: { x: 12, y: 110, w: 50, h: 28 },
  chicken: { x: 130, y: 96, w: 50, h: 28 },
  box: { x: 86, y: 104, w: 42, h: 40 },
  blanket: { x: 26, y: 138, w: 60, h: 20 },
};

/** Sam walks along this band; `y` is his feet. */
export const WALK = { minX: 6, maxX: 246, minY: 122, maxY: 152 };

/** Where Sam goes when an object calls him over (feet position). */
export const SPOTS: Record<string, { x: number; y: number }> = {
  box: { x: 100, y: 138 },
  bowl: { x: 150, y: 128 },
  stella: { x: 66, y: 130 },
  blanket: { x: 56, y: 154 },
  drawer: { x: 196, y: 132 },
  cupboard: { x: 214, y: 130 },
  centre: { x: 128, y: 146 },
};

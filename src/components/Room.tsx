import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ROOM_W, ROOM_H, HOTSPOTS } from '../game/layout';
import { drawRoomBack, drawRoomFront } from '../game/room';
import { drawSam, drawStella, drawDust, drawHighlight, drawTwinkle, drawNotes } from '../game/draw';
import { createSam, tickSam, samSprite, inviteSam, holdSam, releaseSam } from '../game/samBrain';
import { MEMORIES } from '../data/memories';

export type RoomHandle = {
  invite: (reaction: string) => void;
  hold: () => void;
  release: () => void;
};

/** Short names shown in the little hover label. */
const TIPS: Record<string, string> = {
  window: 'the window',
  family: 'the family',
  clara: 'Clara & Sam',
  cupboard: 'the cupboard',
  drawer: 'the drawer',
  stella: 'Stella',
  chicken: 'dinner',
  box: 'the box',
  blanket: 'the blanket',
};

/** Full descriptions, for screen readers. */
const LABELS: Record<string, string> = {
  window: 'The window',
  family: 'A framed photo of the family',
  clara: 'A framed photo of Clara and Sam',
  cupboard: 'A kitchen cupboard full of snacks',
  drawer: 'The dresser, with one drawer left open',
  stella: "Stella's cushion",
  chicken: 'A food bowl and a Swiss Chalet box',
  box: 'A cardboard box',
  blanket: "Sam's blanket",
};

type Props = {
  found: string[];
  unlocked: boolean;
  notesCount: number;
  reduceMotion: boolean;
  paused: boolean;
  onInteract: (id: string) => void;
};

function offscreen(draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement('canvas');
  cv.width = ROOM_W;
  cv.height = ROOM_H;
  const c = cv.getContext('2d');
  if (c) {
    c.imageSmoothingEnabled = false;
    draw(c);
  }
  return cv;
}

export const Room = forwardRef<RoomHandle, Props>(function Room(
  { found, unlocked, notesCount, reduceMotion, paused, onInteract },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const samRef = useRef(createSam());
  const layers = useRef<{ bg: HTMLCanvasElement; fg: HTMLCanvasElement } | null>(null);
  const stateRef = useRef({ found, unlocked, notesCount, reduceMotion, paused, active: '' });
  const [active, setActive] = useState('');

  stateRef.current = { found, unlocked, notesCount, reduceMotion, paused, active };

  useImperativeHandle(ref, () => ({
    invite: (reaction: string) => inviteSam(samRef.current, reaction),
    hold: () => holdSam(samRef.current),
    release: () => releaseSam(samRef.current),
  }));

  useEffect(() => {
    layers.current = { bg: offscreen(drawRoomBack), fg: offscreen(drawRoomFront) };
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const c = cv.getContext('2d');
    if (!c) return;
    c.imageSmoothingEnabled = false;

    let raf = 0;
    let last = performance.now();
    let t = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const st = stateRef.current;
      const slow = st.reduceMotion ? 0.35 : 1;
      t += dt * slow;

      const sam = samRef.current;
      if (!st.paused) tickSam(sam, dt * slow);

      const L = layers.current;
      if (!L) return;
      c.clearRect(0, 0, ROOM_W, ROOM_H);
      c.drawImage(L.bg, 0, 0);
      if (st.notesCount) drawNotes(c, st.notesCount);
      if (!st.reduceMotion) drawDust(c, t);
      drawStella(c, t, sam.state !== 'sleep' && Math.sin(t * 0.11) > -0.3);

      const sprite = samSprite(sam);
      const inFront = sam.y > 141 && sam.state !== 'inBox' && sam.state !== 'peek';
      if (!inFront) drawSam(c, sam, sprite);
      c.drawImage(L.fg, 0, 0);
      if (inFront) drawSam(c, sam, sprite);

      // gentle twinkle on anything still undiscovered
      if (!st.reduceMotion) {
        MEMORIES.forEach((m, i) => {
          if (!st.found.includes(m.id)) drawTwinkle(c, HOTSPOTS[m.id], t, i + 1);
        });
        if (st.unlocked) drawTwinkle(c, HOTSPOTS.window, t, 9);
      }
      if (st.active && HOTSPOTS[st.active]) {
        drawHighlight(c, HOTSPOTS[st.active], t, st.found.includes(st.active));
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Arrow keys walk the focus around the room, nearest-in-that-direction.
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const dirs: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      a: [-1, 0],
      d: [1, 0],
      w: [0, -1],
      s: [0, 1],
    };
    const dir = dirs[e.key] ?? dirs[e.key.toLowerCase()];
    if (!dir) return;
    e.preventDefault();
    const el = document.activeElement as HTMLElement | null;
    const fromId = el?.dataset?.spot ?? '';
    const from = HOTSPOTS[fromId];
    const cx = from ? from.x + from.w / 2 : ROOM_W / 2;
    const cy = from ? from.y + from.h / 2 : ROOM_H / 2;

    let best: string | null = null;
    let bestScore = Infinity;
    for (const [id, r] of Object.entries(HOTSPOTS)) {
      if (id === fromId) continue;
      const dx = r.x + r.w / 2 - cx;
      const dy = r.y + r.h / 2 - cy;
      const along = dx * dir[0] + dy * dir[1];
      if (along <= 2) continue;
      const off = Math.abs(dx * dir[1] + dy * dir[0]);
      const score = along + off * 1.8;
      if (score < bestScore) {
        bestScore = score;
        best = id;
      }
    }
    if (best) document.querySelector<HTMLElement>(`[data-spot="${best}"]`)?.focus();
  }, []);

  return (
    <div className="room" onKeyDown={onKeyDown}>
      <canvas
        ref={canvasRef}
        width={ROOM_W}
        height={ROOM_H}
        className="room-canvas"
        role="img"
        aria-label="A small cosy bedroom: a sunny window, framed photos, a dresser with an open drawer, a cardboard box, a food bowl, a cushion where Stella is sleeping, and Sam the tuxedo cat pottering about."
      />
      <div className="room-spots">
        {Object.entries(HOTSPOTS).map(([id, r]) => {
          const isWindow = id === 'window';
          const locked = isWindow && !unlocked;
          const isFound = found.includes(id);
          return (
            <button
              key={id}
              type="button"
              data-spot={id}
              className={`spot${isFound ? ' is-found' : ''}${locked ? ' is-locked' : ''}`}
              style={{
                left: `${(r.x / ROOM_W) * 100}%`,
                top: `${(r.y / ROOM_H) * 100}%`,
                width: `${(r.w / ROOM_W) * 100}%`,
                height: `${(r.h / ROOM_H) * 100}%`,
              }}
              onMouseEnter={() => setActive(id)}
              onMouseLeave={() => setActive((a) => (a === id ? '' : a))}
              onFocus={() => setActive(id)}
              onBlur={() => setActive((a) => (a === id ? '' : a))}
              onClick={() => onInteract(id)}
              aria-label={
                LABELS[id] + (isFound ? ' (memory found)' : locked ? ' (not yet)' : '')
              }
            >
              <span className="spot-tip" aria-hidden="true">
                {TIPS[id] ?? LABELS[id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

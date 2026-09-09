import { useEffect, useRef } from 'react';
import { SPRITES, SPRITE_PALETTE, SPRITE_W, SPRITE_H } from '../game/sprites';
import { blit } from '../game/pixel';

/** The little Sam who sits next to the title and blinks at you. */
export function SamPortrait({ scale = 5, reduceMotion = false }: { scale?: number; reduceMotion?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const c = cv?.getContext('2d');
    if (!cv || !c) return;
    c.imageSmoothingEnabled = false;
    let raf = 0;
    let blinkAt = performance.now() + 2600;
    let blinking = false;

    const closed = SPRITES.sit.map((r, i) =>
      r.includes('E') ? r.replace(/[Ep]/g, i % 2 ? 'k' : 'K') : r,
    );

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now > blinkAt) {
        blinking = !blinking;
        blinkAt = now + (blinking ? 140 : 2200 + Math.random() * 3500);
      }
      const flick = !reduceMotion && Math.floor(now / 620) % 6 === 0;
      const map = blinking && !reduceMotion ? closed : flick ? SPRITES.sitTail : SPRITES.sit;
      c.clearRect(0, 0, SPRITE_W, SPRITE_H);
      blit(c, map, SPRITE_PALETTE, 0, 0);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return (
    <canvas
      ref={ref}
      width={SPRITE_W}
      height={SPRITE_H}
      className="sam-portrait"
      style={{ width: SPRITE_W * scale, height: SPRITE_H * scale }}
      aria-hidden="true"
    />
  );
}

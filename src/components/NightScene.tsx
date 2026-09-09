import { useEffect, useRef, useState } from 'react';
import { ROOM_W, ROOM_H } from '../game/layout';
import { drawNight } from '../game/draw';
import { SPRITES } from '../game/sprites';
import { ENDING } from '../data/memories';
import { Lines } from './Lines';
import { NoteBoard, type Note } from './Notes';
import { Polaroid } from './Polaroid';
import { Letter } from './Letter';

export function NightScene({
  reduceMotion,
  notes,
  onAddNote,
  onBack,
}: {
  reduceMotion: boolean;
  notes: Note[];
  onAddNote: (t: string) => void;
  onBack: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const cv = ref.current;
    const c = cv?.getContext('2d');
    if (!cv || !c) return;
    c.imageSmoothingEnabled = false;
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = ((now - start) / 1000) * (reduceMotion ? 0.25 : 1);
      drawNight(c, t, SPRITES.sit);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return (
    <div className="night">
      <canvas
        ref={ref}
        width={ROOM_W}
        height={ROOM_H}
        className="room-canvas night-canvas"
        role="img"
        aria-label="Sam sitting on a rooftop ledge at night, under a sky full of stars, with a bright moon overhead."
      />

      <div className="night-text">
        {step === 0 && (
          <Lines lines={ENDING.lines} instant={reduceMotion} gap={2200} onDone={() => setStep(1)} />
        )}
        {step === 1 && (
          <Lines
            lines={ENDING.beat}
            instant={reduceMotion}
            gap={3000}
            onDone={() => setStep(2)}
            className="big"
          />
        )}
        {step >= 2 && (
          <div className="night-final">
            <blockquote className="wish">
              <p>{ENDING.wish.text}</p>
              <cite>-- {ENDING.wish.by}</cite>
            </blockquote>
            <Polaroid photo={ENDING.photo} solo />
            <p className="ded">{ENDING.dedication[0]}</p>
            <p className="ded ded-2">{ENDING.dedication[1]}</p>
          </div>
        )}
      </div>

      {step >= 2 && (
        <>
          <Letter />
          <NoteBoard notes={notes} onAdd={onAddNote} />
          <button type="button" className="btn btn-back" onClick={onBack}>
            back to his room
          </button>
        </>
      )}
      {step < 2 && (
        <button type="button" className="btn btn-skip" onClick={() => setStep(2)}>
          skip
        </button>
      )}
    </div>
  );
}

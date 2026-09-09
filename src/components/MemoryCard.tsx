import { useEffect, useRef, useState } from 'react';
import type { Memory } from '../data/memories';
import { Lines } from './Lines';
import { PixelIcon } from './PixelIcon';
import { Polaroid } from './Polaroid';

export function MemoryCard({
  memory,
  lines,
  reduceMotion,
  onClose,
}: {
  memory: Memory;
  lines: string[];
  reduceMotion: boolean;
  onClose: () => void;
}) {
  const [showPhotos, setShowPhotos] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setShowPhotos(false);
    const t = setTimeout(() => closeRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [memory.id, lines]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const photos = memory.photos ?? [];

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="memcard"
        role="dialog"
        aria-modal="true"
        aria-label={`Memory: ${memory.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="tape tape-a" aria-hidden="true" />
        <span className="tape tape-b" aria-hidden="true" />

        <p className="memcard-kicker">
          <PixelIcon name={memory.icon} size={14} />
          <span>{memory.title}</span>
        </p>

        <Lines
          lines={lines}
          instant={reduceMotion}
          gap={1550}
          onDone={() => setShowPhotos(true)}
          className="memcard-lines"
        />

        {photos.length > 0 && (
          <div className={`polas${showPhotos ? ' is-in' : ''}`} aria-hidden={!showPhotos}>
            {photos.map((p, i) => (
              <Polaroid photo={p} index={i} key={p.src} />
            ))}
          </div>
        )}

        <button type="button" className="btn btn-close" onClick={onClose} ref={closeRef}>
          close
        </button>
      </div>
    </div>
  );
}

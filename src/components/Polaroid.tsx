import { useState } from 'react';
import type { Photo } from '../data/memories';

/**
 * A photo taped into the world. If the file is not there yet, the whole
 * polaroid quietly removes itself rather than leaving a broken image.
 */
export function Polaroid({ photo, index = 0, solo = false }: { photo: Photo; index?: number; solo?: boolean }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <figure className={`pola${solo ? ' pola-solo' : ''}`} style={{ ['--i' as string]: index }}>
      <img
        src={`photos/${photo.src}`}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
      />
      {photo.caption && <figcaption>{photo.caption}</figcaption>}
    </figure>
  );
}

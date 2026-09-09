import { useState } from 'react';
import { LETTER } from '../data/memories';
import { PixelIcon } from './PixelIcon';

/**
 * Clara wrote 💛 all through this. System emoji fonts are not guaranteed
 * anywhere, so we draw her heart ourselves and it looks the same everywhere.
 */
function withHearts(text: string) {
  return text.split('\u{1F49B}').flatMap((chunk, i) =>
    i === 0
      ? [chunk]
      : [
          <PixelIcon key={`h${i}`} name="heart" size={13} className="yh" />,
          chunk,
        ],
  );
}

/** Clara's own words, tucked behind a button so nobody has them thrust at them. */
export function Letter() {
  const [open, setOpen] = useState(false);

  return (
    <section className="letter">
      <p className="letter-invite">{LETTER.invite}</p>

      <button
        type="button"
        className="btn btn-letter"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="clara-letter"
      >
        {open ? LETTER.close : LETTER.open}
      </button>

      <div id="clara-letter" className="letter-page" hidden={!open}>
        <span className="tape tape-a" aria-hidden="true" />
        <blockquote>
          {LETTER.paragraphs.map((p, i) => (
            <p key={i}>{withHearts(p)}</p>
          ))}
        </blockquote>
        <cite>{LETTER.signature}</cite>
      </div>
    </section>
  );
}

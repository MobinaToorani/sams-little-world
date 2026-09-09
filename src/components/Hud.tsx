import { MEMORIES } from '../data/memories';
import { PixelIcon } from './PixelIcon';

export function Hud({
  found,
  hint,
  sound,
  onToggleSound,
}: {
  found: string[];
  hint: string;
  sound: boolean;
  onToggleSound: () => void;
}) {
  return (
    <div className="hud">
      <div className="hud-count">
        <PixelIcon name="heart" size={14} />
        <span>
          {found.length} / {MEMORIES.length} memories found
        </span>
      </div>

      <ul className="hud-strip" aria-label="Memories found so far">
        {MEMORIES.map((m) => {
          const got = found.includes(m.id);
          return (
            <li key={m.id} className={got ? 'got' : ''} title={got ? m.title : 'not found yet'}>
              <PixelIcon name={got ? m.icon : 'paw'} size={16} />
              <span className="sr-only">{got ? m.title : 'not found yet'}</span>
            </li>
          );
        })}
      </ul>

      <p className="hud-hint">{hint}</p>

      <button
        type="button"
        className="btn btn-sound"
        onClick={onToggleSound}
        aria-pressed={sound}
      >
        {sound ? 'sound on' : 'sound off'}
      </button>
    </div>
  );
}

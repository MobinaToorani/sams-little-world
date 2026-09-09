import { TITLE } from '../data/memories';
import { SamPortrait } from './SamPortrait';

export function TitleScreen({
  onEnter,
  reduceMotion,
  returning,
}: {
  onEnter: () => void;
  reduceMotion: boolean;
  returning: boolean;
}) {
  return (
    <div className="title">
      <div className="title-row">
        <SamPortrait scale={5} reduceMotion={reduceMotion} />
        <div>
          <h1 className="title-name">{TITLE.name}</h1>
          <p className="title-tag">{TITLE.tagline}</p>
        </div>
      </div>

      <button type="button" className="btn btn-enter" onClick={onEnter} autoFocus>
        [ {returning ? 'go back in' : TITLE.enter} ]
      </button>

      <p className="title-ded">{TITLE.dedication}</p>
    </div>
  );
}

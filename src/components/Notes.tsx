import { useState } from 'react';
import { NOTES } from '../data/memories';

export type Note = { text: string; at: number };

export function NoteBoard({
  notes,
  onAdd,
}: {
  notes: Note[];
  onAdd: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const [justSent, setJustSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd(t.slice(0, 280));
    setText('');
    setJustSent(true);
    setTimeout(() => setJustSent(false), 2600);
  };

  return (
    <section className="notes">
      <h2 className="notes-title">{NOTES.prompt}</h2>

      <form className="notes-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="note-input">
          {NOTES.placeholder}
        </label>
        <textarea
          id="note-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={NOTES.placeholder}
          rows={3}
          maxLength={280}
        />
        <button type="submit" className="btn btn-pin" disabled={!text.trim()}>
          {NOTES.submit}
        </button>
      </form>

      <p className="notes-status" aria-live="polite">
        {justSent ? 'pinned up in his room.' : ' '}
      </p>

      {notes.length === 0 ? (
        <p className="notes-empty">{NOTES.empty}</p>
      ) : (
        <ul className="notes-list">
          {notes.map((n, i) => (
            <li key={n.at} className="note" style={{ ['--i' as string]: i % 5 }}>
              <span className="note-pin" aria-hidden="true" />
              <p>{n.text}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="notes-fine">
        These are kept in this browser only, on this device. Nothing is sent anywhere.
      </p>
    </section>
  );
}

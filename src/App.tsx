import { useCallback, useEffect, useRef, useState } from 'react';
import { MEMORIES, QUIET_MOMENT, ALL_FOUND, type Memory } from './data/memories';
import { Room, type RoomHandle } from './components/Room';
import { MemoryCard } from './components/MemoryCard';
import { Hud } from './components/Hud';
import { TitleScreen } from './components/TitleScreen';
import { NightScene } from './components/NightScene';
import { Lines } from './components/Lines';
import type { Note } from './components/Notes';
import { setSound, setNight, sfx } from './audio/ambient';

type Screen = 'title' | 'room' | 'night';
type Save = { found: string[]; notes: Note[]; sound: boolean; sawEnding: boolean };

const KEY = 'sam.little.world.v1';

function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Save>;
      return {
        found: Array.isArray(s.found) ? s.found : [],
        notes: Array.isArray(s.notes) ? s.notes : [],
        sound: !!s.sound,
        sawEnding: !!s.sawEnding,
      };
    }
  } catch {
    /* a fresh visit, then */
  }
  return { found: [], notes: [], sound: false, sawEnding: false };
}

export default function App() {
  const [save, setSave] = useState<Save>(load);
  const [screen, setScreen] = useState<Screen>('title');
  const [card, setCard] = useState<{ memory: Memory; lines: string[] } | null>(null);
  const [quiet, setQuiet] = useState(false);
  const [quietDone, setQuietDone] = useState(() => load().found.length >= QUIET_MOMENT.triggerAfter);
  const [cheer, setCheer] = useState(false);
  const [nudge, setNudge] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const roomRef = useRef<RoomHandle>(null);

  const { found, notes, sound } = save;
  const unlocked = found.length >= MEMORIES.length;
  const patch = (p: Partial<Save>) => setSave((s) => ({ ...s, ...p }));

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(save));
    } catch {
      /* private browsing; the visit still works, it just will not be remembered */
    }
  }, [save]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setSound(sound);
  }, [sound]);

  useEffect(() => {
    setNight(screen === 'night');
  }, [screen]);

  useEffect(() => {
    if (!nudge) return;
    const t = setTimeout(() => setNudge(''), 4200);
    return () => clearTimeout(t);
  }, [nudge]);

  const onInteract = useCallback(
    (id: string) => {
      if (id === 'window') {
        if (!unlocked) {
          sfx.locked();
          setNudge('Not yet. There is still a bit of him to find.');
          return;
        }
        sfx.soft();
        setScreen('night');
        patch({ sawEnding: true });
        return;
      }
      const memory = MEMORIES.find((m) => m.id === id);
      if (!memory) return;

      if (memory.samReaction) roomRef.current?.invite(memory.samReaction);

      const isNew = !found.includes(id);
      if (isNew) {
        sfx.found();
        patch({ found: [...found, id] });
      } else {
        sfx.tap();
      }
      setCard({ memory, lines: isNew ? memory.lines : memory.encore ?? memory.lines });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [found, unlocked],
  );

  const closeCard = useCallback(() => {
    setCard(null);
    if (!quietDone && found.length >= QUIET_MOMENT.triggerAfter) {
      setQuiet(true);
      roomRef.current?.hold();
      sfx.soft();
      return;
    }
    if (found.length >= MEMORIES.length && !save.sawEnding) {
      setTimeout(() => setCheer(true), 500);
    }
  }, [quietDone, found.length, save.sawEnding]);

  const endQuiet = useCallback(() => {
    setQuiet(false);
    setQuietDone(true);
    roomRef.current?.release();
    if (found.length >= MEMORIES.length && !save.sawEnding) {
      setTimeout(() => setCheer(true), 600);
    }
  }, [found.length, save.sawEnding]);

  const hint = save.sawEnding
    ? 'Come back whenever you like.'
    : unlocked
      ? 'Try the window.'
      : found.length === 0
        ? "Find Sam's little memories."
        : 'Have a poke around. He does not mind.';

  return (
    <main className="shell">
      <div className={`cabinet${screen === 'night' ? ' is-night' : ''}`}>
        {screen === 'title' && (
          <TitleScreen
            onEnter={() => {
              setScreen('room');
              if (sound) setSound(true);
            }}
            reduceMotion={reduceMotion}
            returning={found.length > 0}
          />
        )}

        {screen === 'room' && (
          <>
            <div className={`stage${quiet ? ' is-quiet' : ''}`}>
              <Room
                ref={roomRef}
                found={found}
                unlocked={unlocked}
                notesCount={notes.length}
                reduceMotion={reduceMotion}
                paused={!!card}
                onInteract={onInteract}
              />
              {quiet && (
                <div className="quiet-veil">
                  <Lines
                    lines={QUIET_MOMENT.lines}
                    gap={2600}
                    instant={reduceMotion}
                    onDone={endQuiet}
                    className="big"
                  />
                </div>
              )}
              {cheer && (
                <div className="quiet-veil cheer">
                  <Lines
                    lines={ALL_FOUND.lines}
                    gap={2000}
                    instant={reduceMotion}
                    onDone={() => setCheer(false)}
                    className="big"
                  />
                </div>
              )}
            </div>

            <Hud
              found={found}
              hint={nudge || hint}
              sound={sound}
              onToggleSound={() => patch({ sound: !sound })}
            />
          </>
        )}

        {screen === 'night' && (
          <NightScene
            reduceMotion={reduceMotion}
            notes={notes}
            onAddNote={(text) => patch({ notes: [...notes, { text, at: Date.now() }] })}
            onBack={() => setScreen('room')}
          />
        )}
      </div>

      {card && (
        <MemoryCard
          memory={card.memory}
          lines={card.lines}
          reduceMotion={reduceMotion}
          onClose={closeCard}
        />
      )}

      <footer className="foot">
        <span>a little world for Sam</span>
        {found.length > 0 && screen !== 'title' && (
          <button
            type="button"
            className="linkish"
            onClick={() => {
              if (confirm('Forget everything you have found and start over?')) {
                setSave({ found: [], notes, sound, sawEnding: false });
                setQuietDone(false);
                setScreen('title');
              }
            }}
          >
            start over
          </button>
        )}
      </footer>
    </main>
  );
}

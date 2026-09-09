import { useEffect, useState } from 'react';

/** Reveals lines one at a time, with a beat in between. */
export function Lines({
  lines,
  gap = 1500,
  instant = false,
  onDone,
  className = '',
}: {
  lines: string[];
  gap?: number;
  instant?: boolean;
  onDone?: () => void;
  className?: string;
}) {
  const [shown, setShown] = useState(instant ? lines.length : 1);

  useEffect(() => {
    setShown(instant ? lines.length : 1);
  }, [lines, instant]);

  useEffect(() => {
    if (shown >= lines.length) {
      const t = setTimeout(() => onDone?.(), instant ? 400 : 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((s) => s + 1), gap);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, lines, gap, instant]);

  return (
    <div className={`lines ${className}`} aria-live="polite">
      {lines.slice(0, shown).map((l, i) => (
        <p key={i} className="line" style={{ animationDelay: instant ? `${i * 90}ms` : '0ms' }}>
          {l}
        </p>
      ))}
    </div>
  );
}

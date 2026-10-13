import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  active: boolean;
  teamNames: string[];
  finalLabels: string[];
  onComplete: () => void;
  durationMs?: number;
};

function pickRandom(names: string[]): string {
  if (names.length === 0) return '—';
  return names[Math.floor(Math.random() * names.length)] ?? '—';
}

export function DrawShuffleReveal({
  active,
  teamNames,
  finalLabels,
  onComplete,
  durationMs = 5200,
}: Props) {
  const [display, setDisplay] = useState<string[]>(() => finalLabels.map(() => '—'));
  const slotCount = finalLabels.length;

  const decoyPool = useMemo(() => (teamNames.length > 0 ? teamNames : finalLabels), [teamNames, finalLabels]);

  useEffect(() => {
    if (!active) {
      setDisplay(finalLabels);
      return;
    }

    setDisplay(Array.from({ length: slotCount }, () => pickRandom(decoyPool)));
    const tick = window.setInterval(() => {
      setDisplay(Array.from({ length: slotCount }, () => pickRandom(decoyPool)));
    }, 90);

    const done = window.setTimeout(() => {
      window.clearInterval(tick);
      setDisplay(finalLabels);
      window.setTimeout(onComplete, 650);
    }, durationMs);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [active, decoyPool, durationMs, finalLabels, onComplete, slotCount]);

  return (
    <ul className="mt-5 space-y-3 text-sm">
      {display.map((label, i) => (
        <motion.li
          key={`${i}-${label}`}
          className="flex gap-3 border-b border-paper/10 pb-2 last:border-0"
          animate={active ? { opacity: [0.55, 1, 0.55] } : { opacity: 1 }}
          transition={{ duration: 0.12 }}
        >
          <span className="text-paper/30 tabular-nums">{i + 1}.</span>
          <span className={active ? 'text-floodlight-bright' : 'text-paper'}>{label || '—'}</span>
        </motion.li>
      ))}
    </ul>
  );
}

type PoolProps = {
  phase: 'animating' | 'revealed';
  poolCode: string;
  teamNames: string[];
  finalTeamNames: string[];
  onPoolAnimationDone?: () => void;
};

export function PoolColumnReveal({ phase, poolCode, teamNames, finalTeamNames, onPoolAnimationDone }: PoolProps) {
  const animating = phase === 'animating';
  return (
    <div className="border border-paper/15 bg-turf/20 px-6 py-6">
      <p className="font-display text-2xl tracking-wide text-floodlight-dim">Pool {poolCode}</p>
      {phase === 'revealed' && !animating ? (
        <ul className="mt-5 space-y-3 text-sm text-paper">
          {finalTeamNames.map((name, i) => (
            <li key={i} className="flex gap-3 border-b border-paper/10 pb-2 last:border-0">
              <span className="text-paper/30 tabular-nums">{i + 1}.</span>
              <span>{name || '—'}</span>
            </li>
          ))}
        </ul>
      ) : (
        <DrawShuffleReveal
          active={animating}
          teamNames={teamNames}
          finalLabels={finalTeamNames.map((n) => n || '—')}
          onComplete={() => onPoolAnimationDone?.()}
          durationMs={4800}
        />
      )}
    </div>
  );
}

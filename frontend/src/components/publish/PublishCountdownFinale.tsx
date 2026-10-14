import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { countdownTotalSeconds } from '../../utils/fixtureResults';

export type PublishFinaleMode = 'pools' | 'fixtures';

type Props = {
  targetIso: string | null | undefined;
  timezone: string;
  mode: PublishFinaleMode;
  children: ReactNode;
  finaleSeconds?: number;
};

/** Last N seconds — broadcast-style build-up (pools & fixtures). */
export function PublishCountdownFinale({
  targetIso,
  timezone,
  mode,
  children,
  finaleSeconds = 10,
}: Props) {
  const reduceMotion = useReducedMotion();
  const cd = useCountdown(targetIso ?? undefined, timezone);
  const [pulseKey, setPulseKey] = useState(0);

  const totalSec = cd ? countdownTotalSeconds(cd) : 0;
  const finale = Boolean(cd && targetIso && !cd.expired && totalSec > 0 && totalSec <= finaleSeconds);
  const progress = finale ? (finaleSeconds - totalSec + 1) / finaleSeconds : 0;

  useEffect(() => {
    if (finale && !reduceMotion) setPulseKey((k) => k + 1);
  }, [cd?.seconds, finale, reduceMotion]);

  if (!cd || cd.expired || !targetIso) {
    return <>{children}</>;
  }

  const headline =
    mode === 'pools' ? 'Pool draw goes live' : 'Fixtures & brackets drop';

  if (!finale || reduceMotion) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-3 rounded-lg sm:-inset-5"
        aria-hidden
      >
        <motion.div
          key={pulseKey}
          className="absolute inset-0 rounded-lg border border-floodlight/40"
          initial={{ opacity: 0.55, scale: 1 }}
          animate={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-lg bg-floodlight/[0.07]"
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="pointer-events-none absolute -top-1 left-0 right-0 h-1 overflow-hidden rounded-full bg-paper/10">
        <motion.div
          className="h-full bg-gradient-to-r from-floodlight-dim to-floodlight-bright"
          initial={false}
          animate={{ width: `${Math.min(100, progress * 100)}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-sm"
        aria-hidden
      >
        <span className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-floodlight/70" />
        <span className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-floodlight/70" />
        <span className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-floodlight/70" />
        <span className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-floodlight/70" />
      </div>

      <motion.div
        className="relative overflow-hidden rounded-sm border border-floodlight/50 bg-turf/50 px-6 py-8 shadow-[0_0_40px_rgba(229,160,23,0.12)] sm:px-10 sm:py-10"
        animate={{ scale: [1, 1.008, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-floodlight/20 to-transparent"
          animate={{ x: ['-100%', '500%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          aria-hidden
        />

        <div className="relative mb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-floodlight-dim">{headline}</p>
          <motion.p
            className="mt-2 font-display text-[clamp(3.5rem,18vw,5.5rem)] leading-none tabular-nums text-floodlight-bright"
            key={totalSec}
            initial={{ scale: 1.25, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          >
            {totalSec}
          </motion.p>
          <p className="mt-1 text-xs uppercase tracking-widest text-paper/45">seconds</p>
        </div>

        {children}
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { countdownTotalSeconds } from '../../utils/fixtureResults';

type Props = {
  targetIso: string | null | undefined;
  timezone: string;
  children: ReactNode;
  /** Last N seconds get intense styling. */
  finaleSeconds?: number;
};

/** Wraps countdown UI — pulses and scales in the final seconds before fixtures drop. */
export function FixturesCountdownFinale({
  targetIso,
  timezone,
  children,
  finaleSeconds = 10,
}: Props) {
  const cd = useCountdown(targetIso ?? undefined, timezone);
  if (!cd || cd.expired || !targetIso) {
    return <>{children}</>;
  }

  const totalSec = countdownTotalSeconds(cd);
  const finale = totalSec > 0 && totalSec <= finaleSeconds;

  return (
    <div className="relative">
      {finale ? (
        <>
          <motion.div
            className="pointer-events-none absolute -inset-4 rounded-lg bg-floodlight/10 sm:-inset-8"
            animate={{ opacity: [0.35, 0.85, 0.35] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm"
            aria-hidden
          >
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-floodlight/25 to-transparent"
              animate={{ x: ['-120%', '320%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </>
      ) : null}
      <motion.div
        animate={
          finale
            ? {
                scale: [1, 1.02, 1],
                boxShadow: [
                  '0 0 0 rgba(229,160,23,0)',
                  '0 0 48px rgba(229,160,23,0.35)',
                  '0 0 0 rgba(229,160,23,0)',
                ],
              }
            : { scale: 1 }
        }
        transition={finale ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
        className={`relative rounded-sm border bg-turf/40 px-6 py-10 sm:px-10 sm:py-12 ${
          finale ? 'border-floodlight/70' : 'border-paper/15'
        }`}
      >
        {finale ? (
          <motion.p
            className="mb-4 text-center font-display text-xl tracking-wide text-floodlight-bright sm:text-2xl"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            Fixtures dropping in {totalSec}s
          </motion.p>
        ) : null}
        {children}
      </motion.div>
    </div>
  );
}

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { HOME_EVENT } from '../../content/homeEvent';

type Props = { onComplete: () => void };

const easeOut = [0.22, 1, 0.36, 1] as const;
const LETTERS = 'BLUESTAR'.split('');

function StumpsSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 48" fill="none" aria-hidden>
      {[12, 40, 68].map((x) => (
        <g key={x}>
          <rect x={x - 2} y={8} width={4} height={32} fill="white" />
          <rect x={x - 6} y={6} width={12} height={2} fill="white" opacity={0.9} />
        </g>
      ))}
    </svg>
  );
}

export function BluestarIntro({ onComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  const beginExit = useCallback(() => {
    if (exiting) return;
    setExiting(true);
  }, [exiting]);

  const finish = useCallback(() => onComplete(), [onComplete]);

  useEffect(() => {
    if (reduceMotion) {
      const t = setTimeout(beginExit, 900);
      return () => clearTimeout(t);
    }
    const steps = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 2200),
      setTimeout(() => setPhase(5), 2800),
      setTimeout(() => beginExit(), 3600),
    ];
    return () => steps.forEach(clearTimeout);
  }, [reduceMotion, beginExit]);

  useEffect(() => {
    if (exiting && reduceMotion) {
      const t = setTimeout(finish, 400);
      return () => clearTimeout(t);
    }
  }, [exiting, reduceMotion, finish]);

  if (reduceMotion && !exiting) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-deep pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        style={{ height: '100dvh' }}
      >
        <img src="/bluestar-star.svg" alt="" className="h-20 w-20" />
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-ink-deep pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      style={{ height: '100dvh', minHeight: '100vh' }}
      initial={false}
      animate={
        exiting
          ? { clipPath: 'circle(0% at 50% 42%)', opacity: 1 }
          : { clipPath: 'circle(150% at 50% 42%)', opacity: 1 }
      }
      transition={exiting ? { duration: 0.9, ease: easeOut } : { duration: 0 }}
      onAnimationComplete={() => {
        if (exiting) finish();
      }}
    >
      <div className="noise-overlay absolute inset-0" />

      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 0.35 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-y-0 w-[40%]"
        initial={{ x: '-100%', opacity: 0 }}
        animate={phase >= 1 ? { x: '220%', opacity: [0, 1, 0] } : {}}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.15), rgba(255,255,255,0.08), transparent)',
        }}
      />

      <button
        type="button"
        onClick={beginExit}
        className="absolute z-30 min-h-[44px] min-w-[44px] px-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-floodlight-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-floodlight"
        style={{
          top: 'max(0.75rem, env(safe-area-inset-top))',
          right: 'max(0.75rem, env(safe-area-inset-right))',
        }}
      >
        Skip
      </button>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <motion.ellipse
          cx="200"
          cy="280"
          rx="160"
          ry="55"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeOpacity={0.25}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={phase >= 2 ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1, ease: easeOut }}
        />
        <motion.line
          x1="80"
          y1="280"
          x2="320"
          y2="280"
          stroke="white"
          strokeOpacity={0.2}
          initial={{ pathLength: 0 }}
          animate={phase >= 2 ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      </svg>

      {phase >= 3 && (
        <>
          {[0, 0.12, 0.24].map((delay) => (
            <motion.div
              key={delay}
              className="intro-ball intro-ball-ghost absolute"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0.35, 0] }}
              transition={{ duration: 1.5, delay, ease: easeOut }}
            />
          ))}
          <motion.div
            className="intro-ball absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.05 }}
          />
        </>
      )}

      <motion.div
        className="absolute bottom-[30%] left-1/2 -translate-x-1/2 sm:bottom-[28%]"
        animate={
          phase >= 4
            ? { x: [0, -4, 4, -2, 2, 0], scale: [1, 1.05, 1] }
            : { opacity: phase >= 2 ? 1 : 0 }
        }
        transition={{ duration: 0.35 }}
      >
        <StumpsSvg className="h-10 w-20 opacity-90 sm:h-14 sm:w-24" />
      </motion.div>

      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.06, 0] }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex h-full max-h-full flex-col items-center justify-center px-4 pb-24 text-center sm:px-6 sm:pb-0">
        <motion.img
          src="/bluestar-star.svg"
          alt=""
          className="h-16 w-16 md:h-24 md:w-24"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, ease: easeOut }}
        />
        <motion.p
          className="hud-label mt-4 sm:mt-5"
          initial={{ opacity: 0 }}
          animate={phase >= 5 ? { opacity: 1 } : {}}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {HOME_EVENT.introHudKicker}
        </motion.p>
        <div className="mt-3 flex max-w-full flex-wrap justify-center gap-0.5 sm:mt-4 sm:gap-1 md:gap-1.5" aria-label="BLUESTAR">
          {LETTERS.map((char, i) => (
            <motion.span
              key={i}
              className="font-display text-[clamp(1.65rem,7.2vw,4.5rem)] leading-none text-white"
              initial={{ opacity: 0, y: 24 }}
              animate={phase >= 5 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05, duration: 0.45, ease: easeOut }}
            >
              {char}
            </motion.span>
          ))}
        </div>
        <motion.p
          className="mt-3 max-w-[16rem] font-mono text-xs tracking-wide text-white/55 sm:mt-4 sm:max-w-none"
          initial={{ opacity: 0 }}
          animate={phase >= 5 ? { opacity: 1 } : {}}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          2nd Year Cricket Tournament
        </motion.p>
      </div>
    </motion.div>
  );
}

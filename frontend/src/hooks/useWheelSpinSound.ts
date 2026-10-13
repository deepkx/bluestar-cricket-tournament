import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { playDrawPick, playWheelSpinTick, unlockDrawAudio } from '../utils/poolDrawSounds';

export function useWheelSpinSound(
  active: boolean,
  spinDurationMs: number,
  soundOn: boolean,
  spinNonce: number,
) {
  const reduceMotion = useReducedMotion();
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (!active || !soundOn || reduceMotion) return;

    void unlockDrawAudio();
    const start = performance.now();
    lastTickRef.current = 0;

    const loop = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= spinDurationMs) {
        void unlockDrawAudio().then((ok) => {
          if (ok) playDrawPick();
        });
        return;
      }
      const t = elapsed / spinDurationMs;
      const interval = 35 + t * t * 420;
      if (now - lastTickRef.current >= interval) {
        void unlockDrawAudio().then((ok) => {
          if (ok) playWheelSpinTick(t);
        });
        lastTickRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, reduceMotion, soundOn, spinDurationMs, spinNonce]);
}

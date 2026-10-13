import { useCallback, useEffect, useState } from 'react';
import { useCountdown } from './useCountdown';

export type DrawRevealPhase = 'waiting' | 'animating' | 'revealed';

export function useDrawReveal(
  revealIso: string | null | undefined,
  timezone: string,
  sessionKey: string,
): {
  countdown: ReturnType<typeof useCountdown>;
  revealed: boolean;
  phase: DrawRevealPhase;
  completeAnimation: () => void;
  replayAnimation: () => void;
} {
  const countdown = useCountdown(revealIso, timezone);
  const revealed = countdown?.expired ?? false;
  const [phase, setPhase] = useState<DrawRevealPhase>('waiting');

  useEffect(() => {
    if (!revealed) {
      setPhase('waiting');
      return;
    }
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey) === '1') {
      setPhase('revealed');
      return;
    }
    setPhase('animating');
  }, [revealed, sessionKey]);

  const completeAnimation = useCallback(() => {
    if (revealed) {
      try {
        sessionStorage.setItem(sessionKey, '1');
      } catch {
        /* ignore */
      }
    }
    setPhase('revealed');
  }, [sessionKey, revealed]);

  const replayAnimation = useCallback(() => {
    try {
      sessionStorage.removeItem(sessionKey);
    } catch {
      /* ignore */
    }
    setPhase('animating');
  }, [sessionKey]);

  return { countdown, revealed, phase, completeAnimation, replayAnimation };
}

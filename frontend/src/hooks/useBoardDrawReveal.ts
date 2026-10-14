import { useCallback, useEffect, useState } from 'react';
import type { PoolsFixturesBoardPhase } from '../types/publish';
import { useCountdown } from './useCountdown';

export type DrawRevealPhase = 'waiting' | 'animating' | 'revealed';

type Args = {
  revealIso: string | null | undefined;
  timezone: string;
  sessionKey: string;
  boardPhase: PoolsFixturesBoardPhase;
};

export function useBoardDrawReveal({ revealIso, timezone, sessionKey, boardPhase }: Args) {
  const countdown = useCountdown(revealIso ?? undefined, timezone);
  const countdownExpired = Boolean(revealIso && (countdown?.expired ?? false));
  const countdownLive =
    boardPhase === 'countdown' && Boolean(revealIso) && !countdownExpired;

  const contentUnlocked =
    boardPhase === 'visible' ||
    boardPhase === 'animating' ||
    (boardPhase === 'countdown' && countdownExpired);

  const [phase, setPhase] = useState<DrawRevealPhase>('waiting');

  useEffect(() => {
    if (!contentUnlocked) {
      setPhase('waiting');
      return;
    }
    if (boardPhase === 'visible') {
      setPhase('revealed');
      return;
    }
    // Client finished this draw run — stay revealed even while server phase is still `animating`.
    if (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(sessionKey) === '1'
    ) {
      setPhase('revealed');
      return;
    }
    const forcedAnim = boardPhase === 'animating';
    const countdownHandoff =
      boardPhase === 'countdown' && countdownExpired && revealIso;
    if (forcedAnim || countdownHandoff) {
      setPhase('animating');
      return;
    }
    setPhase('waiting');
  }, [contentUnlocked, boardPhase, sessionKey, countdownExpired, revealIso]);

  const completeAnimation = useCallback(() => {
    if (contentUnlocked && boardPhase !== 'visible') {
      try {
        sessionStorage.setItem(sessionKey, '1');
      } catch {
        /* ignore */
      }
    }
    setPhase('revealed');
  }, [sessionKey, contentUnlocked, boardPhase]);

  const replayAnimation = useCallback(() => {
    try {
      sessionStorage.removeItem(sessionKey);
    } catch {
      /* ignore */
    }
    if (contentUnlocked) setPhase('animating');
  }, [sessionKey, contentUnlocked]);

  return {
    countdown,
    countdownExpired,
    countdownLive,
    contentUnlocked,
    phase,
    completeAnimation,
    replayAnimation,
  };
}

import { useEffect, useState } from 'react';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function partsToTarget(targetMs: number): CountdownParts {
  const diff = Math.max(0, targetMs - Date.now());
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: targetMs > 0 && Date.now() >= targetMs,
  };
}

function parseTargetMs(isoTarget: string): number | null {
  const ms = new Date(isoTarget).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function useCountdown(isoTarget: string | null | undefined, timezone: string): CountdownParts | null {
  const targetMs = isoTarget ? parseTargetMs(isoTarget) : null;

  const [parts, setParts] = useState<CountdownParts | null>(() =>
    targetMs != null ? partsToTarget(targetMs) : null,
  );

  useEffect(() => {
    if (targetMs == null) {
      setParts(null);
      return;
    }

    const tick = () => setParts(partsToTarget(targetMs));
    tick();

    const id = window.setInterval(tick, 1000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isoTarget, timezone, targetMs]);

  return parts;
}

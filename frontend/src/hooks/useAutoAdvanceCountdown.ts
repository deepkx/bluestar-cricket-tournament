import { useEffect, useRef } from 'react';
import { advancePublishCountdowns } from '../data/sitePublish';

/** Fire server countdown → animating as soon as local clock hits zero (before next poll). */
export function useAutoAdvanceCountdown(
  countdownExpired: boolean,
  boardPhase: string,
  onAdvanced: () => void,
) {
  const fired = useRef(false);

  useEffect(() => {
    if (!countdownExpired || boardPhase !== 'countdown') {
      if (boardPhase !== 'countdown') fired.current = false;
      return;
    }
    if (fired.current) return;
    fired.current = true;
    void advancePublishCountdowns()
      .then(() => onAdvanced())
      .catch(() => {
        fired.current = false;
      });
  }, [countdownExpired, boardPhase, onAdvanced]);
}

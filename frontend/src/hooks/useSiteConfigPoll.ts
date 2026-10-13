import { useCallback, useEffect, useState } from 'react';
import { getCurrentTournament } from '../data/tournament';
import type { TournamentPublic } from '../types/api';

const POLL_MS = 4000;

/** Keeps tournament + publish phases in sync for all visitors (light polling). */
export function useSiteConfigPoll(initial: TournamentPublic | null = null) {
  const [tournament, setTournament] = useState<TournamentPublic | null>(initial);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const refresh = useCallback(() => setRefreshNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void getCurrentTournament()
        .then((t) => {
          if (!cancelled) setTournament(t);
        })
        .catch(() => {
          /* keep last good value */
        });
    };
    load();
    const id = window.setInterval(load, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refreshNonce]);

  return { tournament, refresh };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePoolLeverDraw } from '../../hooks/usePoolLeverDraw';
import { playDrawComplete, unlockDrawAudio } from '../../utils/poolDrawSounds';
import { CricketLeverDrawView } from './CricketLeverDrawView';
import type { DrawTeamInfo } from './DrawTeamChip';

type DrawProps = {
  finalNamesByPool: string[][];
  allTeamNames: string[];
  drawTeams: DrawTeamInfo[];
  onComplete: () => void;
};

export function SequentialPoolDraw({ finalNamesByPool, allTeamNames, drawTeams, onComplete }: DrawProps) {
  const [soundOn, setSoundOn] = useState(true);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const teamMap = useMemo(() => {
    const m = new Map<string, DrawTeamInfo>();
    for (const t of drawTeams) m.set(t.teamName, t);
    for (const n of allTeamNames) {
      if (!m.has(n)) m.set(n, { teamName: n, logoUrl: null });
    }
    for (const row of finalNamesByPool) {
      for (const n of row) {
        if (n && !m.has(n)) m.set(n, { teamName: n, logoUrl: null });
      }
    }
    return m;
  }, [drawTeams, allTeamNames, finalNamesByPool]);

  const draw = usePoolLeverDraw({
    finalNamesByPool,
    allTeamNames,
    onComplete,
  });

  const enableSound = useCallback(async () => {
    const ok = await unlockDrawAudio();
    setAudioBlocked(!ok);
  }, []);

  useEffect(() => {
    if (draw.phase !== 'done' || !soundOn) return;
    void unlockDrawAudio().then((ok) => {
      if (ok) playDrawComplete();
    });
  }, [draw.phase, soundOn]);

  return (
    <CricketLeverDrawView
      phase={draw.phase}
      activePoolIdx={draw.activePoolIdx}
      pickIndex={draw.pickIndex}
      totalPicks={draw.totalPicks}
      progress={draw.progress}
      remainingTeams={draw.remainingTeams}
      slotGrid={draw.slotGrid}
      winnerName={draw.winnerName}
      targetTeamName={draw.currentPick?.teamName ?? '—'}
      targetSlotIdx={draw.currentPick?.slotIdx ?? 0}
      rollDurationSec={draw.rollDurationSec}
      teamMap={teamMap}
      soundOn={soundOn}
      onToggleSound={() => {
        if (!soundOn) void enableSound();
        setSoundOn((v) => !v);
      }}
      onEnableSound={() => void enableSound()}
      audioBlocked={audioBlocked}
    />
  );
}

export { PoolDrawFinalScoreboard as PoolDrawStaticGrid } from './PoolDrawBoards';

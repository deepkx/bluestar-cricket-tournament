import { useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { POOL_CODES, POOL_SLOT_COUNT } from '../data/pools';

export type LeverDrawPhase = 'poolIntro' | 'pull' | 'rolling' | 'winner' | 'fly' | 'vanish' | 'pause' | 'done';

export type LeverPick = {
  poolIdx: number;
  slotIdx: number;
  teamName: string;
};

export type LeverTiming = {
  poolIntroMs: number;
  pullMs: number;
  rollMs: number;
  winnerMs: number;
  flyMs: number;
  vanishMs: number;
  pauseMs: number;
  poolGapMs: number;
  completeDelayMs: number;
};

const DEFAULT: LeverTiming = {
  poolIntroMs: 1100,
  pullMs: 380,
  rollMs: 2600,
  winnerMs: 950,
  flyMs: 720,
  vanishMs: 400,
  pauseMs: 380,
  poolGapMs: 900,
  completeDelayMs: 700,
};

export function buildPoolOrderSequence(finalNamesByPool: string[][]): LeverPick[] {
  const picks: LeverPick[] = [];
  for (let poolIdx = 0; poolIdx < POOL_CODES.length; poolIdx++) {
    for (let slotIdx = 0; slotIdx < POOL_SLOT_COUNT; slotIdx++) {
      picks.push({
        poolIdx,
        slotIdx,
        teamName: finalNamesByPool[poolIdx]?.[slotIdx] ?? '—',
      });
    }
  }
  return picks;
}

function emptyGrid(): (string | null)[][] {
  return POOL_CODES.map(() => Array.from({ length: POOL_SLOT_COUNT }, () => null));
}

type Args = {
  finalNamesByPool: string[][];
  allTeamNames: string[];
  onComplete: () => void;
  timing?: Partial<LeverTiming>;
};

export function usePoolLeverDraw({ finalNamesByPool, allTeamNames, onComplete, timing }: Args) {
  const reduceMotion = useReducedMotion();
  const merged = useMemo(
    (): LeverTiming => ({
      poolIntroMs: reduceMotion ? 200 : (timing?.poolIntroMs ?? DEFAULT.poolIntroMs),
      pullMs: reduceMotion ? 80 : (timing?.pullMs ?? DEFAULT.pullMs),
      rollMs: reduceMotion ? 350 : (timing?.rollMs ?? DEFAULT.rollMs),
      winnerMs: reduceMotion ? 120 : (timing?.winnerMs ?? DEFAULT.winnerMs),
      flyMs: reduceMotion ? 80 : (timing?.flyMs ?? DEFAULT.flyMs),
      vanishMs: reduceMotion ? 80 : (timing?.vanishMs ?? DEFAULT.vanishMs),
      pauseMs: reduceMotion ? 80 : (timing?.pauseMs ?? DEFAULT.pauseMs),
      poolGapMs: reduceMotion ? 120 : (timing?.poolGapMs ?? DEFAULT.poolGapMs),
      completeDelayMs: timing?.completeDelayMs ?? DEFAULT.completeDelayMs,
    }),
    [reduceMotion, timing],
  );

  const sequence = useMemo(() => buildPoolOrderSequence(finalNamesByPool), [finalNamesByPool]);

  const initialRemaining = useMemo(() => {
    const fromList = allTeamNames.filter(Boolean);
    if (fromList.length > 0) return [...fromList];
    return [...new Set(sequence.map((p) => p.teamName).filter(Boolean))];
  }, [allTeamNames, sequence]);

  const [pickIndex, setPickIndex] = useState(0);
  const [phase, setPhase] = useState<LeverDrawPhase>('poolIntro');
  const [activePoolIdx, setActivePoolIdx] = useState(0);
  const [remainingTeams, setRemainingTeams] = useState<string[]>(() => initialRemaining);
  const [slotGrid, setSlotGrid] = useState<(string | null)[][]>(() => emptyGrid());
  const [winnerName, setWinnerName] = useState<string | null>(null);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const currentPick = sequence[pickIndex] ?? null;

  useEffect(() => {
    let cancelled = false;
    const timeouts: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };

    const startPick = (index: number, remaining: string[], grid: (string | null)[][]) => {
      const pick = sequence[index];
      if (!pick) {
        setPhase('done');
        schedule(() => onCompleteRef.current(), merged.completeDelayMs);
        return;
      }

      const beginPull = () => {
        setPickIndex(index);
        setActivePoolIdx(pick.poolIdx);
        setWinnerName(null);
        setPhase('pull');

        schedule(() => {
          setPhase('rolling');

          schedule(() => {
            setWinnerName(pick.teamName);
            setPhase('winner');

            schedule(() => {
              setPhase('fly');

              schedule(() => {
                setPhase('vanish');

                schedule(() => {
                  const nextRemaining = remaining.filter((n) => n !== pick.teamName);
                  const nextGrid = grid.map((col) => [...col]);
                  nextGrid[pick.poolIdx][pick.slotIdx] = pick.teamName;
                  setRemainingTeams(nextRemaining);
                  setSlotGrid(nextGrid);
                  setWinnerName(null);

                  const nextIndex = index + 1;
                  if (nextIndex >= sequence.length) {
                    setPhase('done');
                    schedule(() => onCompleteRef.current(), merged.completeDelayMs);
                    return;
                  }

                  const nextPick = sequence[nextIndex];
                  const poolChanged = nextPick.poolIdx !== pick.poolIdx;

                  setPhase('pause');
                  schedule(() => {
                    const delay = poolChanged ? merged.poolGapMs : 0;
                    schedule(() => startPick(nextIndex, nextRemaining, nextGrid), delay);
                  }, merged.pauseMs);
                }, merged.vanishMs);
              }, merged.flyMs);
            }, merged.winnerMs);
          }, merged.rollMs);
        }, merged.pullMs);
      };

      if (pick.slotIdx === 0) {
        setActivePoolIdx(pick.poolIdx);
        setPhase('poolIntro');
        schedule(beginPull, merged.poolIntroMs);
      } else {
        beginPull();
      }
    };

    setPickIndex(0);
    setRemainingTeams(initialRemaining);
    setSlotGrid(emptyGrid());
    setWinnerName(null);
    startPick(0, initialRemaining, emptyGrid());

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [initialRemaining, merged, sequence]);

  const progress = sequence.length > 0 ? (pickIndex + (phase === 'done' ? 1 : 0)) / sequence.length : 0;

  return {
    phase,
    pickIndex,
    totalPicks: sequence.length,
    activePoolIdx,
    currentPick,
    remainingTeams,
    slotGrid,
    winnerName,
    rollDurationSec: merged.rollMs / 1000,
    progress,
  };
}

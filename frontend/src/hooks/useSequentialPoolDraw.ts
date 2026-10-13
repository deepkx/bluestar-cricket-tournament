import { useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DrawPickHistoryItem, PendingSlotPick } from '../components/draw/drawTypes';
import { POOL_CODES, POOL_SLOT_COUNT } from '../data/pools';

export type PoolDrawSubPhase = 'shuffle' | 'lock' | 'fly' | 'pause' | 'done';

export type DrawPickTarget = {
  poolIdx: number;
  slotIdx: number;
  teamName: string;
};

export type SequentialPoolDrawTiming = {
  shuffleMs: number;
  tickMs: number;
  lockMs: number;
  flyMs: number;
  pauseMs: number;
  completeDelayMs: number;
};

const DEFAULT_TIMING: SequentialPoolDrawTiming = {
  shuffleMs: 1200,
  tickMs: 78,
  lockMs: 900,
  flyMs: 450,
  pauseMs: 280,
  completeDelayMs: 550,
};

const TOTAL_PICKS = POOL_CODES.length * POOL_SLOT_COUNT;

function pickRandom(names: string[]): string {
  if (names.length === 0) return '—';
  return names[Math.floor(Math.random() * names.length)] ?? '—';
}

function shufflePickOrder<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function buildShuffledDrawSequence(finalNamesByPool: string[][]): DrawPickTarget[] {
  const picks: DrawPickTarget[] = [];
  for (let poolIdx = 0; poolIdx < POOL_CODES.length; poolIdx++) {
    for (let slotIdx = 0; slotIdx < POOL_SLOT_COUNT; slotIdx++) {
      picks.push({
        poolIdx,
        slotIdx,
        teamName: finalNamesByPool[poolIdx]?.[slotIdx] ?? '—',
      });
    }
  }
  return shufflePickOrder(picks);
}

export function lockedNamesFromGrid(grid: (string | null)[][]): Set<string> {
  const locked = new Set<string>();
  for (const col of grid) {
    for (const name of col) {
      if (name) locked.add(name);
    }
  }
  return locked;
}

export function decoyPoolForLocked(
  allTeamNames: string[],
  finalNamesByPool: string[][],
  locked: Set<string>,
): string[] {
  const fromTeams = allTeamNames.filter((n) => n && !locked.has(n));
  if (fromTeams.length > 0) return fromTeams;
  const fallback = finalNamesByPool.flat().filter((n) => n && !locked.has(n));
  return fallback.length > 0 ? fallback : ['—'];
}

function emptyGrid(): (string | null)[][] {
  return POOL_CODES.map(() => Array.from({ length: POOL_SLOT_COUNT }, () => null));
}

type Args = {
  finalNamesByPool: string[][];
  allTeamNames: string[];
  onComplete: () => void;
  timing?: Partial<SequentialPoolDrawTiming>;
};

export function useSequentialPoolDraw({ finalNamesByPool, allTeamNames, onComplete, timing }: Args) {
  const reduceMotion = useReducedMotion();
  const mergedTiming = useMemo(
    (): SequentialPoolDrawTiming => ({
      shuffleMs: reduceMotion ? 180 : (timing?.shuffleMs ?? DEFAULT_TIMING.shuffleMs),
      tickMs: reduceMotion ? 999 : (timing?.tickMs ?? DEFAULT_TIMING.tickMs),
      lockMs: reduceMotion ? 80 : (timing?.lockMs ?? DEFAULT_TIMING.lockMs),
      flyMs: reduceMotion ? 60 : (timing?.flyMs ?? DEFAULT_TIMING.flyMs),
      pauseMs: reduceMotion ? 100 : (timing?.pauseMs ?? DEFAULT_TIMING.pauseMs),
      completeDelayMs: timing?.completeDelayMs ?? DEFAULT_TIMING.completeDelayMs,
    }),
    [reduceMotion, timing],
  );

  const drawSequence = useMemo(() => buildShuffledDrawSequence(finalNamesByPool), [finalNamesByPool]);

  const [pickIndex, setPickIndex] = useState(0);
  const [subPhase, setSubPhase] = useState<PoolDrawSubPhase>('shuffle');
  const [slotGrid, setSlotGrid] = useState<(string | null)[][]>(() => emptyGrid());
  const [shuffleLabel, setShuffleLabel] = useState('—');
  const [lockedLabel, setLockedLabel] = useState<string | null>(null);
  const [pendingSlot, setPendingSlot] = useState<PendingSlotPick | null>(null);
  const [landedCount, setLandedCount] = useState(0);
  const [pickHistory, setPickHistory] = useState<DrawPickHistoryItem[]>([]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const currentTarget = drawSequence[pickIndex] ?? null;

  useEffect(() => {
    let cancelled = false;
    const timeouts: number[] = [];
    let tickId: number | undefined;

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeouts.push(id);
    };

    const runPick = (index: number, gridSnapshot: (string | null)[][]) => {
      if (cancelled) return;
      const target = drawSequence[index];
      if (!target) {
        setSubPhase('done');
        schedule(() => onCompleteRef.current(), mergedTiming.completeDelayMs);
        return;
      }

      const locked = lockedNamesFromGrid(gridSnapshot);
      const decoys = decoyPoolForLocked(allTeamNames, finalNamesByPool, locked);
      const finalName = target.teamName || '—';

      setPickIndex(index);
      setSubPhase('shuffle');
      setLockedLabel(null);
      setPendingSlot(null);
      setShuffleLabel(pickRandom(decoys));

      if (mergedTiming.tickMs < 500) {
        tickId = window.setInterval(() => {
          if (cancelled) return;
          setShuffleLabel(pickRandom(decoys));
        }, mergedTiming.tickMs);
      }

      schedule(() => {
        if (tickId !== undefined) {
          window.clearInterval(tickId);
          tickId = undefined;
        }
        setLockedLabel(finalName);
        setPendingSlot({
          poolIdx: target.poolIdx,
          slotIdx: target.slotIdx,
          teamName: finalName,
        });
        setSubPhase('lock');

        schedule(() => {
          setSubPhase('fly');

          schedule(() => {
            const nextGrid = gridSnapshot.map((col) => [...col]);
            nextGrid[target.poolIdx][target.slotIdx] = finalName;
            setSlotGrid(nextGrid);
            setLandedCount((n) => n + 1);
            setPickHistory((prev) =>
              [{ teamName: finalName, poolIdx: target.poolIdx, slotIdx: target.slotIdx }, ...prev].slice(0, 14),
            );
            setLockedLabel(null);
            setPendingSlot(null);

            schedule(() => {
              if (index + 1 >= drawSequence.length) {
                setSubPhase('done');
                schedule(() => onCompleteRef.current(), mergedTiming.completeDelayMs);
                return;
              }
              setSubPhase('pause');
              schedule(() => runPick(index + 1, nextGrid), mergedTiming.pauseMs);
            }, 80);
          }, mergedTiming.flyMs);
        }, mergedTiming.lockMs);
      }, mergedTiming.shuffleMs);
    };

    setPickIndex(0);
    setSubPhase('shuffle');
    setSlotGrid(emptyGrid());
    setLandedCount(0);
    setPickHistory([]);
    setLockedLabel(null);
    setPendingSlot(null);
    runPick(0, emptyGrid());

    return () => {
      cancelled = true;
      if (tickId !== undefined) window.clearInterval(tickId);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [allTeamNames, drawSequence, finalNamesByPool, mergedTiming]);

  const progress =
    subPhase === 'done' ? 1 : (pickIndex + (subPhase === 'shuffle' ? 0.15 : subPhase === 'lock' ? 0.5 : 0.85)) / TOTAL_PICKS;

  const spotlightPhase: 'shuffle' | 'lock' | 'fly' | null =
    subPhase === 'shuffle'
      ? 'shuffle'
      : subPhase === 'lock'
        ? 'lock'
        : subPhase === 'fly'
          ? 'fly'
          : null;

  return {
    pickIndex,
    totalPicks: TOTAL_PICKS,
    subPhase,
    slotGrid,
    shuffleLabel,
    lockedLabel,
    pendingSlot,
    pickHistory,
    currentTarget,
    landedCount,
    progress,
    spotlightPhase,
    reduceMotion: !!reduceMotion,
  };
}

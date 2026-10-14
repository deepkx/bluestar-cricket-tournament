import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { POOL_REVEAL_MS } from '../components/fixtures/fixturesRevealTiming';

const POOL_ORDER = ['A', 'B', 'C', 'D', 'showdown'] as const;
export type FixturesRevealSection = (typeof POOL_ORDER)[number];

export function useFixturesPoolReveal(animating: boolean) {
  const reduceMotion = useReducedMotion();
  const [poolIndex, setPoolIndex] = useState(0);
  const [revealTick, setRevealTick] = useState(0);

  useEffect(() => {
    if (!animating || reduceMotion) {
      setPoolIndex(0);
      return;
    }
    setPoolIndex(0);
  }, [animating, reduceMotion]);

  useEffect(() => {
    if (!animating || reduceMotion) return;
    setRevealTick((t) => t + 1);
  }, [animating, reduceMotion, poolIndex]);

  useEffect(() => {
    if (!animating || reduceMotion) return;
    if (poolIndex >= POOL_ORDER.length - 1) return;
    const id = window.setTimeout(() => setPoolIndex((i) => i + 1), POOL_REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [animating, reduceMotion, poolIndex]);

  const activePool: FixturesRevealSection = POOL_ORDER[poolIndex] ?? 'A';
  const isLastPool = poolIndex >= POOL_ORDER.length - 1;

  return {
    activePool,
    poolIndex,
    revealTick,
    isLastPool,
    poolCount: POOL_ORDER.length,
    poolRevealMs: POOL_REVEAL_MS,
    reduceMotion: Boolean(reduceMotion),
  };
}

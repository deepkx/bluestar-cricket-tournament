import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  FIXTURE_PICK_GAP_MS,
  FIXTURE_PICK_LAND_MS,
  FIXTURE_PICK_ROLL_MS,
  FIXTURE_PICK_ROLL_TICK_MS,
} from '../components/fixtures/fixturesRevealTiming';
import {
  buildBracketTeamPlacements,
  placementKey,
  shuffleBracketPickOrder,
  type BracketTeamPlacement,
} from '../utils/fixtureBracketPick';

type SeedRow = { slotOrder: number; teamName: string | null };

export function useFixtureBracketTeamPick({
  active,
  seeds,
  seedKey,
}: {
  active: boolean;
  seeds: SeedRow[];
  seedKey: string;
}) {
  const reduceMotion = useReducedMotion();
  const pickOrder = useMemo(() => {
    const placements = buildBracketTeamPlacements(seeds);
    return shuffleBracketPickOrder(placements, seedKey);
  }, [seeds, seedKey]);

  const [highlightSlotOrder, setHighlightSlotOrder] = useState<number | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(() => new Set());
  const [pickedSlotOrders, setPickedSlotOrders] = useState<Set<number>>(() => new Set());
  const [rolling, setRolling] = useState(false);
  const [done, setDone] = useState(false);

  const pickOrderRef = useRef(pickOrder);
  pickOrderRef.current = pickOrder;

  useEffect(() => {
    if (!active || reduceMotion) {
      setDone(!active ? false : true);
      if (active && reduceMotion) {
        setRevealedKeys(new Set(pickOrder.map(placementKey)));
        setPickedSlotOrders(new Set(pickOrder.map((p) => p.slotOrder)));
      }
      return;
    }

    setHighlightSlotOrder(null);
    setRevealedKeys(new Set());
    setPickedSlotOrders(new Set());
    setRolling(false);
    setDone(false);

    let pickIdx = 0;
    let rollTimer: ReturnType<typeof setInterval> | undefined;
    let landTimer: ReturnType<typeof setTimeout> | undefined;
    let gapTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const unpickedSlots = () => {
      const picked = new Set<number>();
      for (let i = 0; i < pickIdx; i++) {
        picked.add(pickOrderRef.current[i]?.slotOrder ?? -1);
      }
      return seeds.filter((s) => s.teamName && !picked.has(s.slotOrder)).map((s) => s.slotOrder);
    };

    const runPick = () => {
      if (cancelled) return;
      const order = pickOrderRef.current;
      if (pickIdx >= order.length) {
        setRolling(false);
        setHighlightSlotOrder(null);
        setDone(true);
        return;
      }

      const target = order[pickIdx];
      if (!target) {
        pickIdx += 1;
        runPick();
        return;
      }

      setRolling(true);
      const started = performance.now();

      rollTimer = setInterval(() => {
        if (cancelled) return;
        const pool = unpickedSlots();
        if (pool.length === 0) return;
        const slot = pool[Math.floor(Math.random() * pool.length)] ?? target.slotOrder;
        setHighlightSlotOrder(slot);

        if (performance.now() - started >= FIXTURE_PICK_ROLL_MS) {
          if (rollTimer) clearInterval(rollTimer);
          rollTimer = undefined;
          setHighlightSlotOrder(target.slotOrder);

          landTimer = setTimeout(() => {
            if (cancelled) return;
            setRevealedKeys((prev) => {
              const next = new Set(prev);
              next.add(placementKey(target));
              return next;
            });
            setPickedSlotOrders((prev) => {
              const next = new Set(prev);
              next.add(target.slotOrder);
              return next;
            });
            setRolling(false);
            pickIdx += 1;
            gapTimer = setTimeout(runPick, FIXTURE_PICK_GAP_MS);
          }, FIXTURE_PICK_LAND_MS);
        }
      }, FIXTURE_PICK_ROLL_TICK_MS);
    };

    const startTimer = setTimeout(runPick, 280);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (rollTimer) clearInterval(rollTimer);
      if (landTimer) clearTimeout(landTimer);
      if (gapTimer) clearTimeout(gapTimer);
    };
  }, [active, reduceMotion, seeds, seedKey, pickOrder]);

  const isTeamSlotVisible = (posKey: string, side: 'top' | 'bottom') =>
    !active || reduceMotion || done || revealedKeys.has(`${posKey}-${side}`);

  return {
    pickOrder,
    highlightSlotOrder,
    pickedSlotOrders,
    rolling,
    done,
    isTeamSlotVisible,
    placements: pickOrder as BracketTeamPlacement[],
  };
}

import type { BracketPosKey } from '../components/fixtures/bracketLayout';

const R1_SLOT_PAIRS: Record<number, [number, number]> = {
  1: [2, 3],
  2: [4, 5],
  3: [6, 7],
  4: [8, 9],
};

export type BracketTeamPlacement = {
  teamName: string;
  slotOrder: number;
  posKey: BracketPosKey;
  side: 'top' | 'bottom';
};

export function placementKey(p: Pick<BracketTeamPlacement, 'posKey' | 'side'>): string {
  return `${p.posKey}-${p.side}`;
}

export function buildBracketTeamPlacements(
  seeds: { slotOrder: number; teamName: string | null }[],
): BracketTeamPlacement[] {
  const bySlot = new Map(seeds.map((s) => [s.slotOrder, s.teamName]));
  const out: BracketTeamPlacement[] = [];

  for (let m = 1; m <= 4; m++) {
    const pair = R1_SLOT_PAIRS[m];
    if (!pair) continue;
    const posKey = `r1m${m}` as BracketPosKey;
    const topName = bySlot.get(pair[0]);
    const bottomName = bySlot.get(pair[1]);
    if (topName) out.push({ teamName: topName, slotOrder: pair[0], posKey, side: 'top' });
    if (bottomName) out.push({ teamName: bottomName, slotOrder: pair[1], posKey, side: 'bottom' });
  }

  const seed1 = bySlot.get(1);
  const seed10 = bySlot.get(10);
  if (seed1) out.push({ teamName: seed1, slotOrder: 1, posKey: 'r2m1', side: 'top' });
  if (seed10) out.push({ teamName: seed10, slotOrder: 10, posKey: 'r2m2', side: 'top' });

  return out;
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleBracketPickOrder(
  placements: BracketTeamPlacement[],
  seed: string,
): BracketTeamPlacement[] {
  const rand = mulberry32(hashSeed(seed));
  const copy = [...placements];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

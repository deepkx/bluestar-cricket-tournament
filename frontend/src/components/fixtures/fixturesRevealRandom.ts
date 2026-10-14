import type { BracketPosKey } from './bracketLayout';

const POS_KEYS: BracketPosKey[] = [
  'r1m1',
  'r1m2',
  'r1m3',
  'r1m4',
  'r2m1',
  'r2m2',
  'r3m1',
  'r3m2',
  'final',
];

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

export type MatchRevealMotion = {
  delayJitter: number;
  rotate: number;
  x: number;
  y: number;
  scale: number;
  duration: number;
};

/** Per team row inside a match box or schedule row. */
export type TeamSlotRevealMotion = {
  delay: number;
  x: number;
  y: number;
  rotate: number;
  duration: number;
};

export type MatchTeamSlots = {
  top: TeamSlotRevealMotion;
  bottom: TeamSlotRevealMotion;
};

export type RevealSparkle = {
  leftPct: number;
  topPct: number;
  delay: number;
  scale: number;
};

function teamSlot(rand: () => number): TeamSlotRevealMotion {
  return {
    delay: rand() * 0.42,
    x: (rand() - 0.5) * 48,
    y: (rand() - 0.5) * 20,
    rotate: (rand() - 0.5) * 8,
    duration: 0.32 + rand() * 0.28,
  };
}

export type FixtureRevealFlavor = {
  matchMotion: Record<BracketPosKey, MatchRevealMotion>;
  teamSlots: Record<BracketPosKey, MatchTeamSlots>;
  seedRows: TeamSlotRevealMotion[];
  scheduleTeamSlots: TeamSlotRevealMotion[];
  arrowJitter: number[];
  rowDelayJitter: number[];
  sweep: {
    duration: number;
    fromX: string;
    toX: string;
    skewDeg: number;
  };
  sparkles: RevealSparkle[];
  ease: [number, number, number, number];
};

const EASE_PRESETS: [number, number, number, number][] = [
  [0.22, 1, 0.36, 1],
  [0.34, 1.25, 0.64, 1],
  [0.16, 1.08, 0.38, 1],
  [0.45, 0.05, 0.15, 1],
];

/** Stable per pool + reveal cycle — different each tab pass, same while one bracket builds. */
export function fixtureRevealFlavor(seed: string): FixtureRevealFlavor {
  const rand = mulberry32(hashSeed(seed));
  const matchMotion = {} as Record<BracketPosKey, MatchRevealMotion>;
  const teamSlots = {} as Record<BracketPosKey, MatchTeamSlots>;
  for (const key of POS_KEYS) {
    matchMotion[key] = {
      delayJitter: rand() * 0.16 - 0.05,
      rotate: (rand() - 0.5) * 10,
      x: (rand() - 0.5) * 26,
      y: (rand() - 0.5) * 22,
      scale: 0.8 + rand() * 0.14,
      duration: 0.36 + rand() * 0.28,
    };
    teamSlots[key] = { top: teamSlot(rand), bottom: teamSlot(rand) };
  }
  const seedRows = Array.from({ length: 10 }, () => teamSlot(rand));
  const scheduleTeamSlots = Array.from({ length: 24 }, () => teamSlot(rand));
  const arrowJitter = Array.from({ length: 8 }, () => rand() * 0.14 - 0.04);
  const rowDelayJitter = Array.from({ length: 16 }, () => rand() * 0.1 - 0.02);
  const flip = rand() > 0.5;
  const sparkCount = 5 + Math.floor(rand() * 6);
  const sparkles: RevealSparkle[] = Array.from({ length: sparkCount }, () => ({
    leftPct: 8 + rand() * 84,
    topPct: 6 + rand() * 88,
    delay: rand() * 0.9,
    scale: 0.6 + rand() * 1.1,
  }));

  return {
    matchMotion,
    teamSlots,
    seedRows,
    scheduleTeamSlots,
    arrowJitter,
    rowDelayJitter,
    sweep: {
      duration: 0.85 + rand() * 0.55,
      fromX: flip ? '110%' : '-110%',
      toX: flip ? '-110%' : '110%',
      skewDeg: (rand() - 0.5) * 12,
    },
    sparkles,
    ease: EASE_PRESETS[Math.floor(rand() * EASE_PRESETS.length)] ?? EASE_PRESETS[0],
  };
}

import type { BracketPosKey } from './bracketLayout';

/** Seconds — bracket match pop-in order (poster build). */
export const BRACKET_MATCH_DELAY_S: Record<BracketPosKey, number> = {
  r1m1: 0.12,
  r1m2: 0.36,
  r1m3: 0.6,
  r1m4: 0.84,
  r2m2: 1.08,
  r2m1: 1.22,
  r3m1: 1.42,
  r3m2: 1.56,
  final: 1.72,
};

export const BRACKET_ARROW_BASE_S = 1.05;
export const BRACKET_ARROW_STAGGER_S = 0.1;
export const BRACKET_ARROW_COUNT = 8;

/** Time on each pool tab during live reveal. */
export const POOL_REVEAL_MS = 6200;

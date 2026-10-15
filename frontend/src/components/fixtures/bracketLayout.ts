/** Shared match card dimensions — keep in sync with PoolKnockoutBracket MatchBox. */
export const BRACKET_MATCH_W = 252;
const HDR_H = 38;
const TEAM_H = 48;
const TEAM_GAP = 8;
const PAD = 10;
const KICKOFF_FOOT = 30;
const DAY_NOTE_FOOT = 38;

export function bracketMatchBoxHeight(kind: 'kickoff' | 'dayNote' | 'plain'): number {
  const foot = kind === 'kickoff' ? KICKOFF_FOOT : kind === 'dayNote' ? DAY_NOTE_FOOT : 0;
  return HDR_H + PAD * 2 + TEAM_H * 2 + TEAM_GAP + foot;
}

export type BracketPosKey =
  | 'r1m1'
  | 'r1m2'
  | 'r1m3'
  | 'r1m4'
  | 'r2m1'
  | 'r2m2'
  | 'r3m1'
  | 'r3m2'
  | 'final';

/** Hand-tuned stagger; Y gaps derived from real box heights so cards never overlap. */
export function buildBracketLayout(shortKnockout = false): {
  layout: Record<BracketPosKey, { x: number; y: number }>;
  canvasW: number;
  canvasH: number;
  boxHeights: { r1: number; r2: number; r3: number; final: number };
} {
  const hR1 = bracketMatchBoxHeight('kickoff');
  const hR2 = hR1;
  const hR3 = bracketMatchBoxHeight('dayNote');
  const hFinal = hR3;
  const r1Gap = 22;

  const xR1 = 8;
  const xR2 = 400;
  const xR3 = 792;
  const xFinal = 1144;

  let y = 40;
  const r1m1 = y;
  y += hR1 + r1Gap;
  const r1m2 = y;
  y += hR1 + r1Gap;
  const r1m3 = y;
  y += hR1 + r1Gap;
  const r1m4 = y;

  /** Upper path: R2-M1 (slot 1 vs W R1-M1, earlier time) · R3-M1 (W R1-M2 vs W R2-M1). */
  const r2m1 = r1m1 + Math.round((hR1 + r1Gap) * 0.35);
  const r3Gap = 36;
  const r3m1 = r2m1 + hR2 + r3Gap;

  /** Lower path: R2-M2 · optional R3-M2 (10-team) or R2-M2 → Final (9-team short). */
  const r2m2 = r1m3 + Math.round((hR1 + r1Gap) * 0.55);
  const r3m2 = Math.max(r3m1 + hR3 + r3Gap, r2m2 - hR3 - r3Gap);

  const finalY = shortKnockout
    ? Math.round((r3m1 + r2m2 + hR3) / 2 - hFinal / 2)
    : Math.round((r3m1 + r3m2 + hR3) / 2 - hFinal / 2);

  const layout: Record<BracketPosKey, { x: number; y: number }> = {
    r1m1: { x: xR1, y: r1m1 },
    r1m2: { x: xR1, y: r1m2 },
    r1m3: { x: xR1, y: r1m3 },
    r1m4: { x: xR1, y: r1m4 },
    r2m1: { x: xR2, y: r2m1 },
    r2m2: { x: xR2, y: r2m2 },
    r3m1: { x: xR3, y: r3m1 },
    r3m2: { x: xR3, y: r3m2 },
    final: { x: xFinal, y: finalY },
  };

  const canvasW = xFinal + BRACKET_MATCH_W + 48;
  const bottom = shortKnockout
    ? Math.max(r1m4 + hR1, r2m1 + hR2, r2m2 + hR2, r3m1 + hR3, finalY + hFinal)
    : Math.max(r1m4 + hR1, r2m1 + hR2, r3m2 + hR3, finalY + hFinal);
  const canvasH = bottom + 48;

  return {
    layout,
    canvasW,
    canvasH,
    boxHeights: { r1: hR1, r2: hR2, r3: hR3, final: hFinal },
  };
}

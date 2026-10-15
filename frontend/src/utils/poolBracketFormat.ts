/** 9-team pools: R2-M2 = W(R1-M3) vs W(R1-M4), single R3, final = W(R3-M1) vs W(R2-M2). */
export const SHORT_KNOCKOUT_POOLS = new Set(['A', 'B', 'C']);

export function isShortKnockoutPool(poolCode: string | null | undefined): boolean {
  return Boolean(poolCode && SHORT_KNOCKOUT_POOLS.has(poolCode));
}

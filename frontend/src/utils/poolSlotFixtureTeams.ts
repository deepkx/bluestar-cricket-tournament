import type { FixtureRow, PoolBoard } from '../data/pools';
import { fixtureDisplayOpponentB, fixtureOpponentA } from './fixtureDisplay';
import { isShortKnockoutPool } from './poolBracketFormat';

function slotTeamName(board: PoolBoard | undefined, slotOrder: number): string | null {
  if (!board) return null;
  return board.slots.find((s) => s.slotOrder === slotOrder)?.teamName ?? null;
}

const R1_SLOT_PAIRS: Record<number, [number, number]> = {
  1: [2, 3],
  2: [4, 5],
  3: [6, 7],
  4: [8, 9],
};

/** R1 from slots; R2 M1 = slot 1 vs W-M1, R2 M2 = slot 10 vs W-M4. */
export function fixtureTeamsFromPoolSlots(
  row: FixtureRow,
  board: PoolBoard | undefined,
  poolFixtures: FixtureRow[],
): { teamAName: string; teamBName: string } {
  const fallbackA = fixtureOpponentA(row);
  const fallbackB = fixtureDisplayOpponentB(row, poolFixtures);

  if (!board) {
    return { teamAName: fallbackA, teamBName: fallbackB };
  }

  const r1 = row.label?.match(/^R1 · M(\d+)/);
  if (r1) {
    const m = Number(r1[1]);
    const pair = R1_SLOT_PAIRS[m];
    if (pair) {
      return {
        teamAName: slotTeamName(board, pair[0]) ?? fallbackA,
        teamBName: slotTeamName(board, pair[1]) ?? fallbackB,
      };
    }
  }

  const r2 = row.label?.match(/^R2 · M(\d+)/);
  if (r2) {
    const m = Number(r2[1]);
    if (m === 1) {
      return {
        teamAName: slotTeamName(board, 1) ?? fallbackA,
        teamBName: fallbackB,
      };
    }
    if (m === 2) {
      if (row.poolCode && isShortKnockoutPool(row.poolCode)) {
        return { teamAName: fallbackA, teamBName: fallbackB };
      }
      return {
        teamAName: slotTeamName(board, 10) ?? fallbackA,
        teamBName: fallbackB,
      };
    }
  }

  return { teamAName: fallbackA, teamBName: fallbackB };
}

export function hydratePoolFixturesFromSlots(
  fixtures: FixtureRow[],
  boards: PoolBoard[],
): FixtureRow[] {
  const boardByCode = new Map(boards.map((b) => [b.poolCode, b]));
  const byPool = new Map<string, FixtureRow[]>();
  for (const row of fixtures) {
    if (!row.poolCode) continue;
    const list = byPool.get(row.poolCode) ?? [];
    list.push(row);
    byPool.set(row.poolCode, list);
  }

  const hydrated = fixtures.map((row) => {
    if (!row.poolCode) return row;
    const board = boardByCode.get(row.poolCode);
    const poolFixtures = byPool.get(row.poolCode) ?? [];
    const { teamAName, teamBName } = fixtureTeamsFromPoolSlots(row, board, poolFixtures);
    return { ...row, teamAName, teamBName };
  });

  const byPoolHydrated = new Map<string, FixtureRow[]>();
  for (const row of hydrated) {
    if (!row.poolCode) continue;
    const list = byPoolHydrated.get(row.poolCode) ?? [];
    list.push(row);
    byPoolHydrated.set(row.poolCode, list);
  }

  return hydrated.map((row) => {
    if (!row.poolCode || !row.label?.startsWith('R2')) return row;
    const poolFixtures = byPoolHydrated.get(row.poolCode) ?? [];
    return {
      ...row,
      teamBName: fixtureDisplayOpponentB(row, poolFixtures),
    };
  });
}

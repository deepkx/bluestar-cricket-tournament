import type { FixtureRow } from '../data/pools';
import { fixtureOpponentA, fixtureOpponentB } from './fixtureDisplay';

export function parseBracketRef(ref: string): { round: number; matchNum: number } | null {
  const m = ref.match(/^R(\d+)-M(\d+)$/i);
  if (!m) return null;
  return { round: Number(m[1]), matchNum: Number(m[2]) };
}

export function findFixtureByRoundMatch(
  fixtures: FixtureRow[],
  round: number,
  matchNum: number,
): FixtureRow | undefined {
  const prefix = `R${round} · M${matchNum}`;
  return fixtures.find((f) => f.label?.startsWith(prefix));
}

/** Winner team name for a fixture row, if recorded. */
export function fixtureWinnerName(row: FixtureRow): string | null {
  if (row.winnerTeamName) return row.winnerTeamName;
  if (!row.winnerTeamId) return null;
  if (row.winnerTeamId === row.teamAId) return row.teamAName;
  if (row.winnerTeamId === row.teamBId) return row.teamBName;
  return null;
}

export function resolveBracketRefName(fixtures: FixtureRow[], ref: string): string | null {
  const parsed = parseBracketRef(ref);
  if (!parsed) return null;
  const row = findFixtureByRoundMatch(fixtures, parsed.round, parsed.matchNum);
  if (!row) return null;
  return fixtureWinnerName(row);
}

export function fixtureSideEliminated(
  row: FixtureRow,
  side: 'A' | 'B',
  poolFixtures?: FixtureRow[],
): boolean {
  if (!row.winnerTeamId && !row.winnerTeamName) return false;
  const sideId = side === 'A' ? row.teamAId : row.teamBId;
  if (row.winnerTeamId && sideId) return row.winnerTeamId !== sideId;
  const winner = fixtureWinnerName(row);
  if (!winner) return false;
  let name = side === 'A' ? fixtureOpponentA(row) : fixtureOpponentB(row);
  if (side === 'B' && poolFixtures) {
    const ref = name.match(/Winner (R\d+-M\d+)/i)?.[1];
    if (ref) {
      const resolved = resolveBracketRefName(poolFixtures, ref);
      if (resolved) name = resolved;
    }
  }
  if (!name || name.startsWith('Winner') || name === 'TBD') return false;
  return name.trim() !== winner.trim();
}

export function countdownTotalSeconds(parts: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}): number {
  return parts.days * 86400 + parts.hours * 3600 + parts.minutes * 60 + parts.seconds;
}

import type { FixtureRow } from '../data/pools';
import {
  fixtureDisplayOpponentA,
  fixtureDisplayOpponentB,
  parseFixtureLabelSides,
} from './fixtureDisplay';
import { resolveWinnerTeamId } from './fixtureResults';

export type ResolvedPoolFixtureSides = {
  teamAId: string | null;
  teamBId: string | null;
  teamAName: string;
  teamBName: string;
  playable: boolean;
  blockReason: string | null;
};

function teamIdFromSideText(text: string, poolFixtures: FixtureRow[]): string | null {
  const ref = text.match(/Winner (R\d+-M\d+)/i)?.[1];
  if (!ref) return null;
  return resolveWinnerTeamId(poolFixtures, ref);
}

function teamNameForId(teamId: string, poolFixtures: FixtureRow[]): string | null {
  for (const f of poolFixtures) {
    if (f.teamAId === teamId && f.teamAName) return f.teamAName;
    if (f.teamBId === teamId && f.teamBName) return f.teamBName;
    if (f.winnerTeamId === teamId && f.winnerTeamName) return f.winnerTeamName;
  }
  return null;
}

function missingRefReason(sideText: string): string | null {
  const ref = sideText.match(/Winner (R\d+-M\d+)/i)?.[1];
  if (!ref) return null;
  return ref;
}

/** Resolve team ids/names for knockout rows (R2+) from seeds + prior match winners. */
export function resolvePoolFixtureSidesForAdmin(
  row: FixtureRow,
  poolFixtures: FixtureRow[],
): ResolvedPoolFixtureSides {
  let teamAId = row.teamAId;
  let teamBId = row.teamBId;

  const pair = parseFixtureLabelSides(row.label);
  if (pair) {
    if (!teamAId) teamAId = teamIdFromSideText(pair.sideA, poolFixtures);
    if (!teamBId) teamBId = teamIdFromSideText(pair.sideB, poolFixtures);
  } else {
    const winnerFromLabel = row.label?.match(/Winner (R\d+-M\d+)/i)?.[1];
    if (winnerFromLabel && !teamBId) {
      teamBId = resolveWinnerTeamId(poolFixtures, winnerFromLabel);
    }
  }

  const teamAName =
    (teamAId ? teamNameForId(teamAId, poolFixtures) : null) ??
    fixtureDisplayOpponentA(row, poolFixtures);
  const teamBName =
    (teamBId ? teamNameForId(teamBId, poolFixtures) : null) ??
    fixtureDisplayOpponentB(row, poolFixtures);

  const playable = Boolean(teamAId && teamBId);

  let blockReason: string | null = null;
  if (!playable && pair) {
    const missing: string[] = [];
    if (!teamAId) {
      const ref = missingRefReason(pair.sideA);
      if (ref) missing.push(ref);
    }
    if (!teamBId) {
      const ref = missingRefReason(pair.sideB);
      if (ref) missing.push(ref);
    }
    if (missing.length > 0) {
      blockReason = `Record the winner of ${missing.join(' and ')} first.`;
    }
  } else if (!playable) {
    const ref = row.label?.match(/Winner (R\d+-M\d+)/i)?.[1];
    if (ref && !teamBId) {
      blockReason = `Record the winner of ${ref} first.`;
    } else if (!teamAId || !teamBId) {
      blockReason = 'Both teams must be known before recording a result.';
    }
  }

  return {
    teamAId,
    teamBId,
    teamAName,
    teamBName,
    playable,
    blockReason,
  };
}

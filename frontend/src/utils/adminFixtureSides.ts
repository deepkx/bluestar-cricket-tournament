import type { FixtureRow } from '../data/pools';
import {
  fixtureDisplayOpponentA,
  fixtureDisplayOpponentB,
  parseFixtureLabelSides,
} from './fixtureDisplay';
import { resolveWinnerTeamId } from './fixtureResults';

export function roundFromFixtureLabel(label: string | null | undefined): number {
  const m = label?.match(/^R(\d+)/);
  return m ? Number(m[1]) : 0;
}

export function poolFixturesInRound(poolFixtures: FixtureRow[], round: number): FixtureRow[] {
  return poolFixtures.filter((f) => roundFromFixtureLabel(f.label) === round);
}

/** Every match in that round has a recorded winner. */
export function isPoolRoundComplete(poolFixtures: FixtureRow[], round: number): boolean {
  if (round < 1) return true;
  const rows = poolFixturesInRound(poolFixtures, round);
  if (rows.length === 0) return true;
  return rows.every((f) => Boolean(f.winnerTeamId));
}

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

  const round = roundFromFixtureLabel(row.label);
  const priorRound = round > 1 ? round - 1 : 0;
  const priorRoundDone = priorRound === 0 || isPoolRoundComplete(poolFixtures, priorRound);

  let playable = Boolean(teamAId && teamBId);
  let blockReason: string | null = null;

  if (round >= 2 && !priorRoundDone) {
    playable = false;
    blockReason = `Record all Round ${priorRound} results in this pool first.`;
  }

  if (!playable && pair && priorRoundDone) {
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
  } else if (!playable && priorRoundDone) {
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

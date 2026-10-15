import type { FixtureRow } from '../data/pools';
import { fixtureOpponentA, fixtureOpponentB, formatFixtureTimeWindow } from './fixtureDisplay';
import {
  findFixtureByRoundMatch,
  fixtureSideEliminated,
  resolveBracketRefName,
} from './fixtureResults';
import { isShortKnockoutPool } from './poolBracketFormat';

export type BracketSide = {
  text: string;
  kind: 'team' | 'winner' | 'tbd';
  eliminated?: boolean;
};

export type BracketMatchNode = {
  id: string;
  round: 1 | 2 | 3 | 4;
  matchNum: number;
  title: string;
  top: BracketSide;
  bottom: BracketSide;
  kickoff: string | null;
  dayNote: string | null;
};

function side(text: string, kind: BracketSide['kind'] = 'team', eliminated = false): BracketSide {
  return { text, kind, eliminated: eliminated || undefined };
}

function winnerSide(ref: string): BracketSide {
  return { text: `Winner ${ref}`, kind: 'winner' };
}

function resolvedOrWinnerSide(fixtures: FixtureRow[], ref: string): BracketSide {
  const name = resolveBracketRefName(fixtures, ref);
  if (name) return side(name, 'team');
  return winnerSide(ref);
}

/** e.g. "R3 · M1 · Winner R1-M2 vs Winner R2-M1" → { top: R1-M2, bottom: R2-M1 } */
function parseWinnerPairLabel(label: string | null | undefined): { top: string; bottom: string } | null {
  if (!label) return null;
  const body = label.replace(/^R\d+ · M\d+ ·\s*/i, '');
  const parts = body.split(/\s+vs\s+/i);
  if (parts.length !== 2) return null;
  const pick = (s: string) => s.match(/Winner (R\d+-M\d+)/i)?.[1];
  const top = pick(parts[0] ?? '');
  const bottom = pick(parts[1] ?? '');
  if (!top || !bottom) return null;
  return { top, bottom };
}

function sidesFromFixture(
  fixtures: FixtureRow[],
  row: FixtureRow | undefined,
  round: number,
  matchNum: number,
): BracketMatchNode | null {
  if (!row) return null;
  const a = fixtureOpponentA(row);
  const b = fixtureOpponentB(row);

  if (round === 1) {
    return {
      id: row.id,
      round: 1,
      matchNum,
      title: `R1 · M${matchNum}`,
      top: side(a, 'team', fixtureSideEliminated(row, 'A', fixtures)),
      bottom: side(b, 'team', fixtureSideEliminated(row, 'B', fixtures)),
      kickoff: row.scheduledAt ? formatFixtureTimeWindow(row.scheduledAt) : null,
      dayNote: null,
    };
  }

  if (round === 2) {
    const winnerPair = parseWinnerPairLabel(row.label);
    if (matchNum === 2 && winnerPair?.top.startsWith('R1') && winnerPair.bottom.startsWith('R1')) {
      return {
        id: row.id,
        round: 2,
        matchNum,
        title: `R2 · M${matchNum}`,
        top: resolvedOrWinnerSide(fixtures, winnerPair.top),
        bottom: resolvedOrWinnerSide(fixtures, winnerPair.bottom),
        kickoff: row.scheduledAt ? formatFixtureTimeWindow(row.scheduledAt) : null,
        dayNote: null,
      };
    }
    const bottomRef = matchNum === 1 ? 'R1-M1' : 'R1-M4';
    const winnerFromLabel = row.label?.match(/Winner (R\d+-M\d+)/i)?.[1];
    const ref = winnerFromLabel ?? bottomRef;
    const topName = row.teamAName ?? a;
    return {
      id: row.id,
      round: 2,
      matchNum,
      title: `R2 · M${matchNum}`,
      top: side(topName, row.teamAName ? 'team' : 'tbd', fixtureSideEliminated(row, 'A', fixtures)),
      bottom: row.teamBName
        ? side(row.teamBName, 'team', fixtureSideEliminated(row, 'B', fixtures))
        : resolvedOrWinnerSide(fixtures, ref),
      kickoff: row.scheduledAt ? formatFixtureTimeWindow(row.scheduledAt) : null,
      dayNote: null,
    };
  }

  if (round === 3) {
    const parsed = parseWinnerPairLabel(row.label);
    const refs =
      parsed ??
      (matchNum === 1
        ? { top: 'R1-M2', bottom: 'R2-M1' }
        : { top: 'R1-M3', bottom: 'R2-M2' });
    return {
      id: row.id,
      round: 3,
      matchNum,
      title: `R3 · M${matchNum}`,
      top: resolvedOrWinnerSide(fixtures, refs.top),
      bottom: resolvedOrWinnerSide(fixtures, refs.bottom),
      kickoff: row.scheduledAt ? formatFixtureTimeWindow(row.scheduledAt) : null,
      dayNote: row.scheduledAt ? null : 'Another day',
    };
  }

  const finalPair = parseWinnerPairLabel(row.label);
  const bottomRef =
    finalPair?.bottom ??
    (isShortKnockoutPool(row.poolCode ?? undefined) ? 'R2-M2' : 'R3-M2');
  const topRef = finalPair?.top ?? 'R3-M1';

  return {
    id: row.id,
    round: 4,
    matchNum: 1,
    title: 'R4 · Final',
    top: resolvedOrWinnerSide(fixtures, topRef),
    bottom: resolvedOrWinnerSide(fixtures, bottomRef),
    kickoff: row.scheduledAt ? formatFixtureTimeWindow(row.scheduledAt) : null,
    dayNote: row.scheduledAt ? null : 'Another day',
  };
}

export type PoolBracketModel = {
  r1: BracketMatchNode[];
  r2: BracketMatchNode[];
  r3: BracketMatchNode[];
  final: BracketMatchNode | null;
};

export function buildPoolBracket(fixtures: FixtureRow[]): PoolBracketModel {
  const poolCode = fixtures[0]?.poolCode ?? '';
  const short = isShortKnockoutPool(poolCode);
  const r1 = [1, 2, 3, 4]
    .map((m) => sidesFromFixture(fixtures, findFixtureByRoundMatch(fixtures, 1, m), 1, m))
    .filter(Boolean) as BracketMatchNode[];
  const r2 = [1, 2]
    .map((m) => sidesFromFixture(fixtures, findFixtureByRoundMatch(fixtures, 2, m), 2, m))
    .filter(Boolean) as BracketMatchNode[];
  const r3Matches = short ? [1] : [1, 2];
  const r3 = r3Matches
    .map((m) => sidesFromFixture(fixtures, findFixtureByRoundMatch(fixtures, 3, m), 3, m))
    .filter(Boolean) as BracketMatchNode[];
  const finalRow = fixtures.find((f) => f.label?.includes('Final'));
  const final = finalRow ? sidesFromFixture(fixtures, finalRow, 4, 1) : null;

  return { r1, r2, r3, final };
}

import type { FixtureRow, PoolCode } from '../data/pools';
import { fixtureOpponentB, formatFixtureTimeWindow } from './fixtureDisplay';
import { fixtureSideEliminated, fixtureWinnerName } from './fixtureResults';
import type { BracketSide } from './poolBracketModel';

export const SHOWDOWN_TAB = 'showdown' as const;

export type ShowdownMatchKind = 'semi1' | 'semi2' | 'final';

export type ShowdownMatchView = {
  id: string;
  kind: ShowdownMatchKind;
  title: string;
  top: BracketSide;
  bottom: BracketSide;
  kickoff: string | null;
  row: FixtureRow;
};

function side(text: string, kind: BracketSide['kind'] = 'team', eliminated = false): BracketSide {
  return { text, kind, eliminated: eliminated || undefined };
}

function poolWinnerRef(pool: PoolCode): string {
  return `Pool ${pool}`;
}

export function findPoolChampion(poolFixtures: FixtureRow[]): { id: string; name: string } | null {
  const fin = poolFixtures.find((f) => f.label?.includes('R4') && f.label?.includes('Final'));
  if (!fin) return null;
  const name = fixtureWinnerName(fin);
  const id = fin.winnerTeamId;
  if (!name || !id) return null;
  return { id, name };
}

/** Cross-pool knockout rows use `pool_code` NULL in Supabase (migrations 019 / 021). */
export function isShowdownFixture(row: FixtureRow): boolean {
  return row.poolCode == null || row.matchOrder >= 101;
}

export function filterShowdownFixtures(rows: FixtureRow[]): FixtureRow[] {
  return rows.filter(isShowdownFixture).sort((a, b) => a.matchOrder - b.matchOrder);
}

export function findShowdownRow(rows: FixtureRow[], kind: ShowdownMatchKind): FixtureRow | undefined {
  const prefix =
    kind === 'semi1' ? 'Semi 1' : kind === 'semi2' ? 'Semi 2' : 'Final · Winner Semi';
  return filterShowdownFixtures(rows).find((f) => f.label?.startsWith(prefix));
}

function semiWinnerName(all: FixtureRow[], kind: 'semi1' | 'semi2'): string | null {
  const row = findShowdownRow(all, kind);
  if (!row) return null;
  return fixtureWinnerName(row);
}

function resolvePoolSide(
  ref: string,
  poolFixturesByCode: Map<string, FixtureRow[]>,
  all: FixtureRow[],
  row: FixtureRow,
  sideKey: 'A' | 'B',
): BracketSide {
  const m = ref.match(/^Pool ([ABCD])$/i);
  if (m) {
    const code = m[1]!.toUpperCase() as PoolCode;
    const champ = findPoolChampion(poolFixturesByCode.get(code) ?? []);
    if (champ) {
      return side(champ.name, 'team', fixtureSideEliminated(row, sideKey, all));
    }
    return side(`Winner ${poolWinnerRef(code)}`, 'winner');
  }
  const semi = ref.match(/^Semi (\d)$/i);
  if (semi) {
    const kind = semi[1] === '1' ? 'semi1' : 'semi2';
    const name = semiWinnerName(all, kind);
    if (name) return side(name, 'team', fixtureSideEliminated(row, sideKey, all));
    return side(`Winner Semi ${semi[1]}`, 'winner');
  }
  return side(ref, 'tbd');
}

function parseShowdownLabel(label: string | null): { topRef: string; bottomRef: string } | null {
  if (!label) return null;
  const body = label.replace(/^(Semi \d|Final) ·\s*/i, '');
  const parts = body.split(/\s+vs\s+/i);
  if (parts.length !== 2) return null;
  const strip = (s: string) => s.replace(/^Winner\s+/i, '').trim();
  return { topRef: strip(parts[0] ?? ''), bottomRef: strip(parts[1] ?? '') };
}

function sidesForShowdownRow(
  row: FixtureRow,
  kind: ShowdownMatchKind,
  allFixtures: FixtureRow[],
): { top: BracketSide; bottom: BracketSide } {
  const byPool = new Map<string, FixtureRow[]>();
  for (const code of ['A', 'B', 'C', 'D']) {
    byPool.set(
      code,
      allFixtures.filter((f) => f.poolCode === code).sort((a, b) => a.matchOrder - b.matchOrder),
    );
  }

  const parsed = parseShowdownLabel(row.label);
  if (parsed) {
    return {
      top: resolvePoolSide(parsed.topRef, byPool, allFixtures, row, 'A'),
      bottom: resolvePoolSide(parsed.bottomRef, byPool, allFixtures, row, 'B'),
    };
  }

  if (kind === 'semi1') {
    return {
      top: resolvePoolSide('Pool A', byPool, allFixtures, row, 'A'),
      bottom: resolvePoolSide('Pool C', byPool, allFixtures, row, 'B'),
    };
  }
  if (kind === 'semi2') {
    return {
      top: resolvePoolSide('Pool B', byPool, allFixtures, row, 'A'),
      bottom: resolvePoolSide('Pool D', byPool, allFixtures, row, 'B'),
    };
  }
  return {
    top: resolvePoolSide('Semi 1', byPool, allFixtures, row, 'A'),
    bottom: resolvePoolSide('Semi 2', byPool, allFixtures, row, 'B'),
  };
}

export function buildShowdownModel(allFixtures: FixtureRow[]): ShowdownMatchView[] {
  const kinds: ShowdownMatchKind[] = ['semi1', 'semi2', 'final'];
  const out: ShowdownMatchView[] = [];
  for (const kind of kinds) {
    const row = findShowdownRow(allFixtures, kind);
    if (!row) continue;
    const title = kind === 'final' ? 'Final' : kind === 'semi1' ? 'Semi 1' : 'Semi 2';
    const { top, bottom } = sidesForShowdownRow(row, kind, allFixtures);
    out.push({
      id: row.id,
      kind,
      title,
      top,
      bottom,
      kickoff: row.scheduledAt ? formatFixtureTimeWindow(row.scheduledAt) : null,
      row,
    });
  }
  return out;
}

/** Fill team A/B ids from pool/semi winners so admin can record results. */
export function hydrateShowdownRow(row: FixtureRow, allFixtures: FixtureRow[]): FixtureRow {
  if (row.poolCode != null) return row;
  const kind: ShowdownMatchKind = row.label?.startsWith('Semi 1')
    ? 'semi1'
    : row.label?.startsWith('Semi 2')
      ? 'semi2'
      : 'final';
  const { top, bottom } = sidesForShowdownRow(row, kind, allFixtures);
  const byPool = new Map<string, FixtureRow[]>();
  for (const code of ['A', 'B', 'C', 'D']) {
    byPool.set(code, allFixtures.filter((f) => f.poolCode === code));
  }

  const idForSide = (ref: string): string | null => {
    const pm = ref.match(/^Pool ([ABCD])$/i);
    if (pm) {
      return findPoolChampion(byPool.get(pm[1]!.toUpperCase()) ?? [])?.id ?? null;
    }
    const sm = ref.match(/^Semi (\d)$/i);
    if (sm) {
      const semiRow = findShowdownRow(allFixtures, sm[1] === '1' ? 'semi1' : 'semi2');
      return semiRow?.winnerTeamId ?? null;
    }
    return null;
  };

  const parsed = parseShowdownLabel(row.label);
  const topRef = parsed?.topRef ?? (kind === 'semi1' ? 'Pool A' : kind === 'semi2' ? 'Pool B' : 'Semi 1');
  const bottomRef =
    parsed?.bottomRef ?? (kind === 'semi1' ? 'Pool C' : kind === 'semi2' ? 'Pool D' : 'Semi 2');

  const teamAId = row.teamAId ?? idForSide(topRef);
  const teamBId = row.teamBId ?? idForSide(bottomRef);

  return {
    ...row,
    teamAId,
    teamBId,
    teamAName: row.teamAName ?? (top.kind === 'team' ? top.text : null),
    teamBName: row.teamBName ?? (bottom.kind === 'team' ? bottom.text : null),
  };
}

export function fixtureDisplayOpponentShowdown(match: FixtureRow, allFixtures: FixtureRow[]): string {
  const hydrated = hydrateShowdownRow(match, allFixtures);
  if (hydrated.teamBName) return hydrated.teamBName;
  return fixtureOpponentB(match);
}

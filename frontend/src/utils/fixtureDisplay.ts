import type { FixtureRow } from '../data/pools';
import { resolveBracketRefName } from './fixtureResults';

const MATCH_DURATION_MS = 45 * 60 * 1000;
const TZ = 'Asia/Kolkata';

export const POOL_FIXTURE_META: Record<
  string,
  { dayLabel: string; startNote: string; matchMinutes: number }
> = {
  A: { dayLabel: 'Sunday', startNote: 'Starts 8:00 AM · Round 1 & 2', matchMinutes: 45 },
  B: { dayLabel: 'Saturday', startNote: 'Starts 8:00 AM · Round 1 & 2', matchMinutes: 45 },
  C: { dayLabel: 'Saturday', startNote: 'Starts 12:30 PM · Round 1 & 2', matchMinutes: 45 },
  D: { dayLabel: 'Sunday', startNote: 'Starts 12:30 PM · Round 1 & 2', matchMinutes: 45 },
};

/** Canonical IST match-day anchor per pool (Sat 18 / Sun 19 Oct 2026). Used for labels, not kickoff times. */
export const POOL_MATCH_DAY_START_ISO: Record<string, string> = {
  B: '2026-10-18T02:30:00+00:00',
  C: '2026-10-18T07:00:00+00:00',
  A: '2026-10-19T02:30:00+00:00',
  D: '2026-10-19T07:00:00+00:00',
};

function parseFixtureInstant(startIso: string | null | undefined): Date | null {
  if (!startIso) return null;
  const normalized = startIso.replace(/([+-]\d{2})$/, '$1:00');
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function fixturePoolMatchDayLabel(poolCode: string): string {
  const iso = POOL_MATCH_DAY_START_ISO[poolCode];
  return iso ? formatFixtureDate(iso) : 'TBC';
}

export function isPoolRound12Row(row: FixtureRow): boolean {
  const label = row.label ?? '';
  return label.startsWith('R1 ·') || label.startsWith('R2 ·');
}

export function formatFixtureDate(startIso: string | null): string {
  const start = parseFixtureInstant(startIso);
  if (!start) return 'TBC';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(start);
}

export function formatFixtureKickoff(startIso: string | null): string {
  const start = parseFixtureInstant(startIso);
  if (!start) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(start);
}

export function formatFixtureTimeWindow(startIso: string | null, durationMs = MATCH_DURATION_MS): string {
  const start = parseFixtureInstant(startIso);
  if (!start) return 'TBC';
  const end = new Date(start.getTime() + durationMs);
  const fmt = new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

/** Both sides from e.g. "R2 · M2 · Winner R1-M3 vs Winner R1-M4". Null for seed-vs-winner labels. */
export function parseFixtureLabelSides(
  label: string | null | undefined,
): { sideA: string; sideB: string } | null {
  if (!label) return null;
  const m = label.match(/^R\d+ · M\d+ ·\s*(.+)\s+vs\s+(.+)$/i);
  if (!m) return null;
  const sideA = m[1].trim().replace(/^vs\s+/i, '').trim();
  const sideB = m[2].trim();
  if (!sideA || !sideB || sideA.toLowerCase() === 'vs') return null;
  return { sideA, sideB };
}

function resolveWinnerPlaceholder(text: string, poolFixtures: FixtureRow[]): string {
  const ref = text.match(/Winner (R\d+-M\d+)/i)?.[1];
  if (ref) {
    const resolved = resolveBracketRefName(poolFixtures, ref);
    if (resolved) return resolved;
  }
  return text;
}

/** Opponent line when team B is TBD (from label suffix or generic). */
export function fixtureOpponentB(match: FixtureRow): string {
  if (match.teamBName) return match.teamBName;
  const pair = parseFixtureLabelSides(match.label);
  if (pair) return pair.sideB;
  const label = match.label ?? '';
  const vsIdx = label.toLowerCase().indexOf('vs ');
  if (vsIdx >= 0) {
    const rest = label.slice(vsIdx + 3).trim();
    if (rest.startsWith('Winner')) return rest;
    return rest || 'TBD';
  }
  return 'TBD';
}

/** Team B label with Winner R1-Mx resolved when that match has a result. */
export function fixtureDisplayOpponentB(match: FixtureRow, poolFixtures: FixtureRow[]): string {
  return resolveWinnerPlaceholder(fixtureOpponentB(match), poolFixtures);
}

export function fixtureOpponentA(match: FixtureRow): string {
  if (match.teamAName) return match.teamAName;
  const pair = parseFixtureLabelSides(match.label);
  if (pair) return pair.sideA;
  return 'TBD';
}

/** Team A label with Winner R1-Mx resolved when that match has a result. */
export function fixtureDisplayOpponentA(match: FixtureRow, poolFixtures: FixtureRow[]): string {
  return resolveWinnerPlaceholder(fixtureOpponentA(match), poolFixtures);
}

export function fixtureRoundTag(label: string | null): string {
  if (!label) return 'Match';
  if (label.includes('Final')) return 'Final';
  const code = label.match(/^(R\d+ · M\d+)/);
  if (code) return code[1];
  const m = label.match(/^R(\d+)/);
  if (!m) return label.split(' · ')[0] ?? 'Match';
  return `R${m[1]}`;
}

/** Bracket match id for schedule rows, e.g. "R1 · M1". */
export function fixtureMatchCode(label: string | null, rowIndex: number): string {
  const code = label?.match(/^(R\d+ · M\d+)/);
  if (code) return code[1];
  const semi = label?.match(/^(Semi \d+)/);
  if (semi) return semi[1];
  if (label?.startsWith('Final · Winner Semi')) return 'Final';
  if (label?.includes('Final')) return 'R4 · Final';
  return `Match ${rowIndex}`;
}

export function groupFixturesByPool(rows: FixtureRow[]): Map<string, FixtureRow[]> {
  const map = new Map<string, FixtureRow[]>();
  for (const code of ['A', 'B', 'C', 'D']) {
    map.set(code, []);
  }
  for (const row of rows) {
    if (row.poolCode == null) continue;
    const code = row.poolCode;
    const list = map.get(code) ?? [];
    list.push(row);
    map.set(code, list);
  }
  for (const [code, list] of map) {
    list.sort((a, b) => a.matchOrder - b.matchOrder);
    map.set(code, list);
  }
  return map;
}

export function isScheduledPoolMatch(row: FixtureRow): boolean {
  return Boolean(row.scheduledAt && row.teamAName && row.teamBName);
}

import type { FixtureRow } from '../data/pools';
import { resolveBracketRefName } from './fixtureResults';

const MATCH_DURATION_MS = 45 * 60 * 1000;
const TZ = 'Asia/Kolkata';

export const POOL_FIXTURE_META: Record<
  string,
  { dayLabel: string; startNote: string; matchMinutes: number }
> = {
  A: { dayLabel: 'Saturday', startNote: 'Starts 8:00 AM · Round 1 & 2', matchMinutes: 45 },
  B: { dayLabel: 'Sunday', startNote: 'Starts 8:00 AM · Round 1 & 2', matchMinutes: 45 },
  C: { dayLabel: 'Saturday', startNote: 'Starts 12:30 PM · Round 1 & 2', matchMinutes: 45 },
  D: { dayLabel: 'Sunday', startNote: 'Starts 12:30 PM · Round 1 & 2', matchMinutes: 45 },
};

export function formatFixtureDate(startIso: string | null): string {
  if (!startIso) return 'TBC';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(startIso));
}

export function formatFixtureKickoff(startIso: string | null): string {
  if (!startIso) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(startIso));
}

export function formatFixtureTimeWindow(startIso: string | null, durationMs = MATCH_DURATION_MS): string {
  if (!startIso) return 'TBC';
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMs);
  const fmt = new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

/** Opponent line when team B is TBD (from label suffix or generic). */
export function fixtureOpponentB(match: FixtureRow): string {
  if (match.teamBName) return match.teamBName;
  const label = match.label ?? '';
  const vsIdx = label.toLowerCase().indexOf('vs ');
  if (vsIdx >= 0) {
    const rest = label.slice(vsIdx + 3).trim();
    if (rest.startsWith('Winner')) return rest;
    return rest || 'TBD';
  }
  if (label.includes('Winner')) return label.replace(/^R\d+ · M\d+ · /, '').trim() || 'TBD';
  return 'TBD';
}

/** Team B label with Winner R1-Mx resolved when that match has a result. */
export function fixtureDisplayOpponentB(match: FixtureRow, poolFixtures: FixtureRow[]): string {
  const raw = fixtureOpponentB(match);
  const ref = raw.match(/Winner (R\d+-M\d+)/i)?.[1];
  if (ref) {
    const resolved = resolveBracketRefName(poolFixtures, ref);
    if (resolved) return resolved;
  }
  return raw;
}

export function fixtureOpponentA(match: FixtureRow): string {
  if (match.teamAName) return match.teamAName;
  if (match.label?.includes('Winner')) return match.label;
  return 'TBD';
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
  if (label?.includes('Final')) return 'R4 · Final';
  return `Match ${rowIndex}`;
}

export function groupFixturesByPool(rows: FixtureRow[]): Map<string, FixtureRow[]> {
  const map = new Map<string, FixtureRow[]>();
  for (const code of ['A', 'B', 'C', 'D']) {
    map.set(code, []);
  }
  for (const row of rows) {
    const code = row.poolCode ?? '?';
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

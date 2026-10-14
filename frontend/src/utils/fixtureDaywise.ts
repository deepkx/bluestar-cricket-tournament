import type { FixtureRow } from '../data/pools';

export const DAY_HALF_ORDER = ['sat-am', 'sat-pm', 'sun-am', 'sun-pm'] as const;
export type DayHalfKey = (typeof DAY_HALF_ORDER)[number];

/** Fixed committee schedule: which session each pool plays (R1 & R2). */
export const POOL_DAY_HALF: Record<string, DayHalfKey> = {
  B: 'sat-am',
  C: 'sat-pm',
  A: 'sun-am',
  D: 'sun-pm',
};

export type DayHalfSection = {
  key: DayHalfKey;
  title: string;
  subtitle: string;
  poolCodes: string[];
  matches: FixtureRow[];
};

const SECTION_META: Record<DayHalfKey, { title: string; subtitle: string; poolCode: string }> = {
  'sat-am': {
    title: 'Saturday · 1st half',
    subtitle: '8:00 AM start · Pool B · Round 1 & 2',
    poolCode: 'B',
  },
  'sat-pm': {
    title: 'Saturday · 2nd half',
    subtitle: '12:30 PM start · Pool C · Round 1 & 2',
    poolCode: 'C',
  },
  'sun-am': {
    title: 'Sunday · 1st half',
    subtitle: '8:00 AM start · Pool A · Round 1 & 2',
    poolCode: 'A',
  },
  'sun-pm': {
    title: 'Sunday · 2nd half',
    subtitle: '12:30 PM start · Pool D · Round 1 & 2',
    poolCode: 'D',
  },
};

function isPoolMatchDayRow(row: FixtureRow): boolean {
  const label = row.label ?? '';
  return label.startsWith('R1 ·') || label.startsWith('R2 ·');
}

export function buildDayHalfSections(fixtures: FixtureRow[]): DayHalfSection[] {
  const buckets = new Map<DayHalfKey, FixtureRow[]>(DAY_HALF_ORDER.map((k) => [k, []]));

  for (const row of fixtures) {
    if (!row.poolCode || !isPoolMatchDayRow(row)) continue;
    const key = POOL_DAY_HALF[row.poolCode];
    if (!key) continue;
    buckets.get(key)!.push(row);
  }

  for (const list of buckets.values()) {
    list.sort((a, b) => {
      const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return a.matchOrder - b.matchOrder;
    });
  }

  return DAY_HALF_ORDER.map((key) => {
    const meta = SECTION_META[key];
    const matches = buckets.get(key) ?? [];
    return {
      key,
      title: meta.title,
      subtitle: meta.subtitle,
      poolCodes: [meta.poolCode],
      matches,
    };
  });
}

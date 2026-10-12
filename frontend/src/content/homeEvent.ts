/** Public homepage marketing copy (static source of truth for home sections). */
export const HOME_EVENT = {
  displayTitle: 'Bluestar Cricket',
  heroHeadline: 'Eight overs. Every angle.',
  eventChip: '17–20 Oct 2026 · 9:00 AM IST · Hollywood Ground',
  introHudKicker: '8.0 OVERS · MATCH DAY',
  heroKicker: '360° · 8.0 OVERS',
  oversDisplay: '8.0',
  dateRange: '17 – 20 October 2026',
  dateTiles: ['17', '18', '19', '20'] as const,
  monthLabel: 'Oct 2026',
  dailyTime: '9:00 AM IST',
  venueName: 'Hollywood Ground',
  mapsUrl: 'https://maps.app.goo.gl/dPpe8E9wVqKLrPeu5',
  mapsEmbedUrl:
    'https://www.google.com/maps?q=11.6099422,79.4944736&z=16&output=embed&hl=en',
  formatLine: '360° tournament',
  oversLine: '8 overs per side',
  entryFeeRupee: 250,
  /** First ball (9:00 AM IST on opening day). Used for homepage countdown when admin has not set `tournamentStartsAt`. */
  tournamentStartIso: '2026-10-17T03:30:00.000Z',
  /** Pool draw & fixtures publish — Thu 15 Oct 2026, 6:00 PM IST. */
  poolsFixturesRevealIso: '2026-10-15T12:30:00.000Z',
  poolsFixturesRevealLabel: 'Thursday 15 October · 6:00 PM IST',
  hostTeamName: 'Bluestar',
  /** Fixed host slots on the team board (not from registration). */
  hostTeamNames: ['Bluestar', 'Bluestar B'] as const,
  registerMotivationQuote: 'Every over counts. Leave nothing in the dressing room.',
} as const;

export function resolveTournamentStartIso(apiValue: string | null | undefined): string {
  return apiValue ?? HOME_EVENT.tournamentStartIso;
}

export function resolvePoolsFixturesRevealIso(apiValue: string | null | undefined): string {
  return apiValue ?? HOME_EVENT.poolsFixturesRevealIso;
}

function normalizeTeamName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** True for fixed host board slots (e.g. Bluestar, Bluestar B). */
export function isFixedHostTeamName(name: string): boolean {
  const n = normalizeTeamName(name);
  return HOME_EVENT.hostTeamNames.some((host) => normalizeTeamName(host) === n);
}

/** @deprecated use isFixedHostTeamName — true only for primary host "Bluestar". */
export function isHostTeamName(name: string): boolean {
  return normalizeTeamName(name) === normalizeTeamName(HOME_EVENT.hostTeamName);
}

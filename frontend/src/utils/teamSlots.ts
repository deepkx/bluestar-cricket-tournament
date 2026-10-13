import { HOME_EVENT, isFixedHostTeamName } from '../content/homeEvent';
import { TOURNAMENT_ROSTER_TEAMS } from '../content/tournamentTeams';
import type { TeamPublic } from '../types/api';

function normalizeTeamName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export type TeamSlotRow = {
  slot: number;
  teamName: string | null;
  registrationId: string | null;
  kind: 'host' | 'filled' | 'open';
  registeredAt: string | null;
  /** True when name comes from fixed roster but team row is not in Supabase yet. */
  rosterOnly: boolean;
};

export const HOST_SLOT_COUNT = HOME_EVENT.hostTeamNames.length;

export function buildTeamSlotRows(maxTeams: number, confirmed: TeamPublic[]): TeamSlotRow[] {
  const cap = Math.max(maxTeams, HOST_SLOT_COUNT);
  const external = confirmed
    .filter((t) => !isFixedHostTeamName(t.teamName))
    .sort((a, b) => {
      const sa = a.sortOrder ?? 9999;
      const sb = b.sortOrder ?? 9999;
      if (sa !== sb) return sa - sb;
      const ta = a.confirmedAt ? new Date(a.confirmedAt).getTime() : 0;
      const tb = b.confirmedAt ? new Date(b.confirmedAt).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return a.teamName.localeCompare(b.teamName);
    });

  const rows: TeamSlotRow[] = [];
  for (let h = 0; h < HOST_SLOT_COUNT; h++) {
    rows.push({
      slot: h + 1,
      teamName: HOME_EVENT.hostTeamNames[h] ?? HOME_EVENT.hostTeamName,
      registrationId: null,
      kind: 'host',
      registeredAt: null,
      rosterOnly: false,
    });
  }

  const externalSlots = Math.max(0, cap - HOST_SLOT_COUNT);
  for (let i = 0; i < externalSlots; i++) {
    const slot = i + 1 + HOST_SLOT_COUNT;
    const rosterEntry = TOURNAMENT_ROSTER_TEAMS.find((r) => r.sortOrder === slot);
    const team = rosterEntry
      ? external.find((t) => normalizeTeamName(t.teamName) === normalizeTeamName(rosterEntry.teamName))
      : external[i];
    const teamName = rosterEntry?.teamName ?? team?.teamName ?? null;
    const hasDb = Boolean(team);
    rows.push({
      slot,
      teamName,
      registrationId: team?.registrationId ?? null,
      kind: teamName ? 'filled' : 'open',
      registeredAt: team?.confirmedAt ?? null,
      rosterOnly: Boolean(teamName && !hasDb),
    });
  }

  return rows;
}

export function teamSlotStats(maxTeams: number, confirmed: TeamPublic[]) {
  const cap = Math.max(maxTeams, HOST_SLOT_COUNT);
  const rosterCount = TOURNAMENT_ROSTER_TEAMS.length;
  const externalCount = confirmed.filter((t) => !isFixedHostTeamName(t.teamName)).length;
  const filled = HOST_SLOT_COUNT + Math.max(rosterCount, externalCount);
  return {
    filled,
    available: Math.max(0, cap - filled),
    maxTeams: cap,
  };
}

import { HOME_EVENT, isFixedHostTeamName } from '../content/homeEvent';
import type { TeamPublic } from '../types/api';

export type TeamSlotRow = {
  slot: number;
  teamName: string | null;
  registrationId: string | null;
  kind: 'host' | 'filled' | 'open';
  registeredAt: string | null;
};

export const HOST_SLOT_COUNT = HOME_EVENT.hostTeamNames.length;

export function buildTeamSlotRows(maxTeams: number, confirmed: TeamPublic[]): TeamSlotRow[] {
  const cap = Math.max(maxTeams, HOST_SLOT_COUNT);
  const external = confirmed
    .filter((t) => !isFixedHostTeamName(t.teamName))
    .sort((a, b) => {
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
    });
  }

  const externalSlots = Math.max(0, cap - HOST_SLOT_COUNT);
  for (let i = 0; i < externalSlots; i++) {
    const team = external[i];
    rows.push({
      slot: i + 1 + HOST_SLOT_COUNT,
      teamName: team?.teamName ?? null,
      registrationId: team?.registrationId ?? null,
      kind: team ? 'filled' : 'open',
      registeredAt: team?.confirmedAt ?? null,
    });
  }

  return rows;
}

export function teamSlotStats(maxTeams: number, confirmed: TeamPublic[]) {
  const cap = Math.max(maxTeams, HOST_SLOT_COUNT);
  const externalCount = confirmed.filter((t) => !isFixedHostTeamName(t.teamName)).length;
  const filled = HOST_SLOT_COUNT + externalCount;
  return {
    filled,
    available: Math.max(0, cap - filled),
    maxTeams: cap,
  };
}

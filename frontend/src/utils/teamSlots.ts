import { HOME_EVENT, isHostTeamName } from '../content/homeEvent';
import type { TeamPublic } from '../types/api';

export type TeamSlotRow = {
  slot: number;
  teamName: string | null;
  registrationId: string | null;
  kind: 'host' | 'filled' | 'open';
  registeredAt: string | null;
};

export function buildTeamSlotRows(maxTeams: number, confirmed: TeamPublic[]): TeamSlotRow[] {
  const external = confirmed
    .filter((t) => !isHostTeamName(t.teamName))
    .sort((a, b) => {
      const ta = a.confirmedAt ? new Date(a.confirmedAt).getTime() : 0;
      const tb = b.confirmedAt ? new Date(b.confirmedAt).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return a.teamName.localeCompare(b.teamName);
    });

  const rows: TeamSlotRow[] = [];
  rows.push({
    slot: 1,
    teamName: HOME_EVENT.hostTeamName,
    registrationId: null,
    kind: 'host',
    registeredAt: null,
  });

  for (let i = 0; i < maxTeams - 1; i++) {
    const team = external[i];
    rows.push({
      slot: i + 2,
      teamName: team?.teamName ?? null,
      registrationId: team?.registrationId ?? null,
      kind: team ? 'filled' : 'open',
      registeredAt: team?.confirmedAt ?? null,
    });
  }

  return rows;
}

export function teamSlotStats(maxTeams: number, confirmed: TeamPublic[]) {
  const externalCount = confirmed.filter((t) => !isHostTeamName(t.teamName)).length;
  const filled = 1 + externalCount;
  return {
    filled,
    available: Math.max(0, maxTeams - filled),
    maxTeams,
  };
}

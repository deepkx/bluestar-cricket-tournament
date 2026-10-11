export type RegistrationMode = 'SCHEDULE' | 'FORCE_OPEN' | 'FORCE_CLOSED';

export type TournamentSettings = {
  id: number;
  name: string;
  description: string | null;
  entryFeePaise: number;
  maxTeams: number;
  minSquadSize: number;
  maxSquadSize: number;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  registrationOpenOverride: boolean;
  registrationClosedOverride: boolean;
  fixtureAnnouncementAt: string | null;
  tournamentStartsAt: string | null;
  fixturesPublished: boolean;
  timezone: string;
  venue: string | null;
  rules: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
};

export function registrationModeFromSettings(s: TournamentSettings): RegistrationMode {
  if (s.registrationClosedOverride) return 'FORCE_CLOSED';
  if (s.registrationOpenOverride) return 'FORCE_OPEN';
  return 'SCHEDULE';
}

import { HOME_EVENT } from '../content/homeEvent';
import fixturesData from '../content/fixtures.json';
import type { TournamentPublic } from '../types/api';
import type { SiteConfigRow } from './dbTypes';
import { requireSupabase } from '../lib/supabase';

const DEFAULT_SITE: SiteConfigRow = {
  id: 1,
  max_teams: 32,
  min_squad_size: 11,
  max_squad_size: 15,
  registration_open: true,
  tournament_starts_at: null,
  fixture_announcement_at: null,
};

export async function fetchSiteConfig(): Promise<SiteConfigRow> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('site_config').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return (data as SiteConfigRow | null) ?? DEFAULT_SITE;
}

const PRODUCTION_MIN_SQUAD = 11;

function resolveMinSquadSize(cfg: SiteConfigRow): { minSquadSize: number; registrationTestMode: boolean } {
  const envTest = import.meta.env.VITE_REGISTRATION_TEST_MIN_SQUAD === 'true';
  if (envTest) {
    return { minSquadSize: 2, registrationTestMode: true };
  }
  const minSquadSize = cfg.min_squad_size;
  return {
    minSquadSize,
    registrationTestMode: minSquadSize < PRODUCTION_MIN_SQUAD,
  };
}

export function mapSiteConfigToTournament(cfg: SiteConfigRow): TournamentPublic {
  const fixturesPublished = Array.isArray(fixturesData) && fixturesData.length > 0;
  const { minSquadSize, registrationTestMode } = resolveMinSquadSize(cfg);
  return {
    id: 1,
    name: HOME_EVENT.displayTitle,
    description: HOME_EVENT.formatLine,
    format: 'KNOCKOUT',
    entryFeePaise: HOME_EVENT.entryFeeRupee * 100,
    maxTeams: Math.max(cfg.max_teams, HOME_EVENT.hostTeamNames.length),
    minSquadSize,
    maxSquadSize: cfg.max_squad_size,
    registrationTestMode,
    registrationOpen: cfg.registration_open,
    registrationOpensAt: null,
    registrationClosesAt: null,
    fixtureAnnouncementAt: cfg.fixture_announcement_at,
    tournamentStartsAt: cfg.tournament_starts_at,
    fixturesPublished,
    timezone: 'Asia/Kolkata',
    venue: HOME_EVENT.venueName,
    rules: null,
    contact: { email: null, phone: null, address: null },
  };
}

export async function getCurrentTournament(): Promise<TournamentPublic> {
  const cfg = await fetchSiteConfig();
  return mapSiteConfigToTournament(cfg);
}

export async function updateSiteConfig(
  patch: Partial<
    Pick<
      SiteConfigRow,
      | 'registration_open'
      | 'max_teams'
      | 'min_squad_size'
      | 'tournament_starts_at'
      | 'fixture_announcement_at'
    >
  >,
) {
  const sb = requireSupabase();
  const { error } = await sb.from('site_config').update(patch).eq('id', 1);
  if (error) throw error;
}

import { HOME_EVENT } from '../content/homeEvent';
import fixturesData from '../content/fixtures.json';
import type { TournamentPublic } from '../types/api';
import type { PoolsFixturesBoardPhase, TeamsBoardPhase } from '../types/publish';
import type { SiteConfigRow } from './dbTypes';
import { requireSupabase } from '../lib/supabase';

const DEFAULT_SITE: SiteConfigRow = {
  id: 1,
  max_teams: 32,
  min_squad_size: 11,
  max_squad_size: 15,
  registration_open: true,
  captain_roster_open: true,
  tournament_starts_at: null,
  fixture_announcement_at: null,
  pools_reveal_at: null,
  fixtures_reveal_at: null,
  teams_board_phase: 'visible',
  pools_board_phase: 'idle',
  fixtures_board_phase: 'idle',
  pools_draw_run: 0,
  fixtures_draw_run: 0,
  teams_board_run: 0,
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
    captainRosterOpen: cfg.captain_roster_open ?? true,
    registrationOpensAt: null,
    registrationClosesAt: null,
    fixtureAnnouncementAt: cfg.fixture_announcement_at,
    poolsRevealAt: cfg.pools_reveal_at ?? cfg.fixture_announcement_at ?? null,
    fixturesRevealAt: cfg.fixtures_reveal_at ?? cfg.fixture_announcement_at ?? null,
    teamsBoardPhase: (cfg.teams_board_phase ?? 'visible') as TeamsBoardPhase,
    poolsBoardPhase: (cfg.pools_board_phase ?? 'idle') as PoolsFixturesBoardPhase,
    fixturesBoardPhase: (cfg.fixtures_board_phase ?? 'idle') as PoolsFixturesBoardPhase,
    poolsDrawRun: cfg.pools_draw_run ?? 0,
    fixturesDrawRun: cfg.fixtures_draw_run ?? 0,
    teamsBoardRun: cfg.teams_board_run ?? 0,
    tournamentStartsAt: cfg.tournament_starts_at,
    fixturesPublished,
    timezone: 'Asia/Kolkata',
    venue: HOME_EVENT.venueName,
    rules: null,
    contact: { email: null, phone: null, address: null },
  };
}

export async function getCurrentTournament(): Promise<TournamentPublic> {
  const sb = requireSupabase();
  await sb.rpc('advance_publish_countdowns').then(({ error }) => {
    if (error) {
      /* migration 022 may not be applied yet */
    }
  });
  const cfg = await fetchSiteConfig();
  return mapSiteConfigToTournament(cfg);
}

export async function updateSiteConfig(
  patch: Partial<
    Pick<
      SiteConfigRow,
      | 'registration_open'
      | 'captain_roster_open'
      | 'max_teams'
      | 'min_squad_size'
      | 'tournament_starts_at'
      | 'fixture_announcement_at'
      | 'pools_reveal_at'
      | 'fixtures_reveal_at'
      | 'teams_board_phase'
      | 'pools_board_phase'
      | 'fixtures_board_phase'
      | 'pools_draw_run'
      | 'fixtures_draw_run'
      | 'teams_board_run'
    >
  >,
) {
  const sb = requireSupabase();
  const { error } = await sb.from('site_config').update(patch).eq('id', 1);
  if (error) throw error;
}

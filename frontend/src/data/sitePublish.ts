import { fetchSiteConfig, updateSiteConfig } from './tournament';
import type { PoolsFixturesBoardPhase, TeamsBoardPhase } from '../types/publish';

const COUNTDOWN_MINUTES = 5;

function countdownIso(minutes = COUNTDOWN_MINUTES) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export async function adminSetTeamsBoardPhase(phase: TeamsBoardPhase) {
  const cfg = await fetchSiteConfig();
  const patch: Parameters<typeof updateSiteConfig>[0] = { teams_board_phase: phase };
  if (phase === 'animating') {
    patch.teams_board_run = (cfg.teams_board_run ?? 0) + 1;
  }
  await updateSiteConfig(patch);
}

export async function adminSetPoolsBoardPhase(phase: PoolsFixturesBoardPhase) {
  const cfg = await fetchSiteConfig();
  const patch: Parameters<typeof updateSiteConfig>[0] = { pools_board_phase: phase };
  if (phase === 'animating') {
    patch.pools_draw_run = (cfg.pools_draw_run ?? 0) + 1;
  }
  await updateSiteConfig(patch);
}

export async function adminSetFixturesBoardPhase(phase: PoolsFixturesBoardPhase) {
  const cfg = await fetchSiteConfig();
  const patch: Parameters<typeof updateSiteConfig>[0] = { fixtures_board_phase: phase };
  if (phase === 'animating') {
    patch.fixtures_draw_run = (cfg.fixtures_draw_run ?? 0) + 1;
  }
  await updateSiteConfig(patch);
}

export async function adminStartPoolsCountdown(minutes = COUNTDOWN_MINUTES) {
  await updateSiteConfig({
    pools_reveal_at: countdownIso(minutes),
    pools_board_phase: 'countdown',
  });
}

export async function adminStopPoolsCountdown() {
  await updateSiteConfig({
    pools_reveal_at: null,
    pools_board_phase: 'idle',
  });
}

export async function adminStartFixturesCountdown(minutes = COUNTDOWN_MINUTES) {
  await updateSiteConfig({
    fixtures_reveal_at: countdownIso(minutes),
    fixtures_board_phase: 'countdown',
  });
}

export async function adminStopFixturesCountdown() {
  await updateSiteConfig({
    fixtures_reveal_at: null,
    fixtures_board_phase: 'idle',
  });
}

export async function adminDisplayPoolsPublic() {
  await updateSiteConfig({ pools_board_phase: 'visible' });
}

export async function adminDisplayFixturesPublic() {
  await updateSiteConfig({ fixtures_board_phase: 'visible' });
}

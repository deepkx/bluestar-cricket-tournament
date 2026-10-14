import { requireSupabase } from '../lib/supabase';
import type { PoolsFixturesBoardPhase, TeamsBoardPhase } from '../types/publish';
import { fetchSiteConfig, updateSiteConfig } from './tournament';

/** Idempotent — flips countdown → animating when reveal time has passed (safe for all clients to call). */
export async function advancePublishCountdowns(): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.rpc('advance_publish_countdowns');
  if (error) throw error;
}

export const MIN_PUBLISH_COUNTDOWN_MINUTES = 1;
export const DEFAULT_PUBLISH_COUNTDOWN_MINUTES = 5;
export const MAX_PUBLISH_COUNTDOWN_MINUTES = 120;

export function clampPublishCountdownMinutes(minutes: number): number {
  const n = Math.round(Number(minutes));
  if (!Number.isFinite(n)) return DEFAULT_PUBLISH_COUNTDOWN_MINUTES;
  return Math.min(MAX_PUBLISH_COUNTDOWN_MINUTES, Math.max(MIN_PUBLISH_COUNTDOWN_MINUTES, n));
}

function countdownIso(minutes = DEFAULT_PUBLISH_COUNTDOWN_MINUTES) {
  const m = clampPublishCountdownMinutes(minutes);
  return new Date(Date.now() + m * 60_000).toISOString();
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

export async function adminStartPoolsCountdown(minutes = DEFAULT_PUBLISH_COUNTDOWN_MINUTES) {
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

export async function adminStartFixturesCountdown(minutes = DEFAULT_PUBLISH_COUNTDOWN_MINUTES) {
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

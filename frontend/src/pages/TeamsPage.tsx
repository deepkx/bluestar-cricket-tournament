import { useCallback, useEffect, useMemo, useState } from 'react';
import { PublicAdminPublishDock } from '../components/admin/PublicAdminPublishDock';
import { TeamsBoardReveal } from '../components/teams/TeamsBoardReveal';
import { TeamsBoardList } from '../components/teams/TeamsBoardList';
import {
  fetchSquadProgressByTeamId,
  listConfirmedTeams,
  listPendingTeamsPublic,
  type PendingTeamPublic,
} from '../data/teams';
import { squadCompletionStatus, type SquadProgress } from '../utils/squadProgress';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { useSiteConfigPoll } from '../hooks/useSiteConfigPoll';
import { TOURNAMENT_MAX_TEAMS } from '../content/tournamentTeams';
import type { TeamPublic } from '../types/api';
import { buildTeamSlotRows, teamSlotStats } from '../utils/teamSlots';

type TeamsFilter = 'all' | 'complete' | 'incomplete' | 'pending';

export function TeamsPage() {
  const { tournament, refresh } = useSiteConfigPoll();
  const [teams, setTeams] = useState<TeamPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');
  const [squadProgress, setSquadProgress] = useState<Map<string, SquadProgress>>(new Map());
  const [pendingTeams, setPendingTeams] = useState<PendingTeamPublic[]>([]);
  const [filter, setFilter] = useState<TeamsFilter>('all');

  const boardPhase = tournament?.teamsBoardPhase ?? 'visible';
  const minSquad = tournament?.minSquadSize ?? 11;

  const loadTeams = useCallback(() => {
    setLoading(true);
    setErr('');
    Promise.all([
      listConfirmedTeams(),
      fetchSquadProgressByTeamId().catch(() => new Map()),
      listPendingTeamsPublic().catch(() => []),
    ])
      .then(([teamList, progress, pending]) => {
        setTeams(teamList);
        setSquadProgress(progress);
        setPendingTeams(pending);
      })
      .catch(() => {
        setErr('Could not load live data from Supabase. Teams below are from the fixed tournament list.');
        setTeams([]);
        setSquadProgress(new Map());
        setPendingTeams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const maxTeams = tournament?.maxTeams ?? TOURNAMENT_MAX_TEAMS;
  const rows = useMemo(() => buildTeamSlotRows(maxTeams, teams), [maxTeams, teams]);
  const stats = useMemo(() => teamSlotStats(maxTeams, teams), [maxTeams, teams]);
  const allNames = useMemo(() => teams.map((t) => t.teamName), [teams]);
  const squadCounts = useMemo(() => {
    let complete = 0;
    let incomplete = 0;
    for (const row of rows) {
      if (row.kind === 'open' || !row.teamName) continue;
      const progress = row.registrationId ? squadProgress.get(row.registrationId) : undefined;
      const status = squadCompletionStatus(progress, minSquad, Boolean(row.registrationId) && !row.rosterOnly);
      if (status === 'complete') complete += 1;
      else incomplete += 1;
    }
    return { complete, incomplete, pending: pendingTeams.length };
  }, [rows, squadProgress, minSquad, pendingTeams.length]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (filter === 'complete') {
      list = rows.filter((row) => {
        if (row.kind === 'open' || !row.teamName) return false;
        const progress = row.registrationId ? squadProgress.get(row.registrationId) : undefined;
        return squadCompletionStatus(progress, minSquad, Boolean(row.registrationId) && !row.rosterOnly) === 'complete';
      });
    } else if (filter === 'incomplete') {
      list = rows.filter((row) => {
        if (row.kind === 'open' || !row.teamName) return false;
        const progress = row.registrationId ? squadProgress.get(row.registrationId) : undefined;
        const status = squadCompletionStatus(progress, minSquad, Boolean(row.registrationId) && !row.rosterOnly);
        return status !== 'complete';
      });
    } else if (filter === 'pending') {
      list = [];
    }
    if (!q) return list;
    return list.filter((row) => row.teamName?.toLowerCase().includes(q));
  }, [rows, query, filter, squadProgress, minSquad]);

  const filteredPending = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pendingTeams;
    return pendingTeams.filter((p) => p.teamName.toLowerCase().includes(q));
  }, [pendingTeams, query]);

  const showBoard = boardPhase === 'visible';
  const showAnimating = boardPhase === 'animating';
  const showIdle = boardPhase === 'idle';

  const adminBar = <PublicAdminPublishDock preset="teams" onUpdated={refresh} />;

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero kicker="Squads" title="Teams" sideScenery />

      <PublicPageContent width="lg" sideScenery>
        {adminBar ? <div className="mb-8">{adminBar}</div> : null}

        <div className="grid grid-cols-2 gap-px border border-paper/15 bg-paper/15 sm:grid-cols-5">
          <div className="bg-turf/25 px-4 py-5 text-center">
            <p className="hud-label text-[10px] sm:text-xs">Squad complete</p>
            <p className="font-display mt-2 text-3xl tabular-nums text-floodlight-bright sm:text-4xl">
              {squadCounts.complete}
            </p>
          </div>
          <div className="bg-turf/25 px-4 py-5 text-center">
            <p className="hud-label text-[10px] sm:text-xs">Yet to complete</p>
            <p className="font-display mt-2 text-3xl tabular-nums text-paper sm:text-4xl">{squadCounts.incomplete}</p>
          </div>
          <div className="bg-turf/25 px-4 py-5 text-center">
            <p className="hud-label text-[10px] sm:text-xs">Pending approval</p>
            <p className="font-display mt-2 text-3xl tabular-nums text-amber-200/90 sm:text-4xl">
              {squadCounts.pending}
            </p>
          </div>
          <div className="bg-turf/25 px-4 py-5 text-center">
            <p className="hud-label text-[10px] sm:text-xs">Filled slots</p>
            <p className="font-display mt-2 text-3xl tabular-nums text-paper/90 sm:text-4xl">{stats.filled}</p>
          </div>
          <div className="col-span-2 bg-turf/25 px-4 py-5 text-center sm:col-span-1">
            <p className="hud-label text-[10px] sm:text-xs">Open slots</p>
            <p className="font-display mt-2 text-3xl tabular-nums text-paper/55 sm:text-4xl">{stats.available}</p>
          </div>
        </div>

        {loading && <p className="mt-14 text-center text-paper/50">Loading…</p>}
        {err && (
          <p className="mt-6 border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100/90">
            {err}
          </p>
        )}

        {!loading && showIdle ? (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50">
            The full team board unlocks when the draw opens. Slot counts above stay live.
          </p>
        ) : null}

        {!loading && showAnimating ? (
          <div className="mt-12">
            <p className="hud-label mb-4 text-center text-floodlight-bright">Live reveal — filling the board…</p>
            <TeamsBoardReveal
              key={tournament?.teamsBoardRun ?? 0}
              rows={rows}
              allNames={allNames}
              animating
            />
          </div>
        ) : null}

        {!loading && showBoard ? (
          <>
            <div className="mt-12">
              <p className="mb-4 text-center text-sm text-paper/55">
                Captains: tap <span className="font-semibold text-floodlight-bright">Add squad</span>, then enter the
                last 4 digits of your mobile number on file.
              </p>
              <label className="block">
                <span className="sr-only">Search teams</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by team name…"
                  className="form-field w-full border border-paper/15 bg-turf/20"
                />
              </label>
            </div>

            <div
              className="mt-6 flex flex-wrap gap-1 border border-paper/15 bg-ink-deep/40 p-1"
              role="tablist"
              aria-label="Filter teams"
            >
              {(
                [
                  ['all', 'All teams'],
                  ['complete', 'Squad complete'],
                  ['incomplete', 'Yet to complete'],
                  ['pending', 'Pending approval'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filter === id}
                  onClick={() => setFilter(id)}
                  className={`flex-1 px-3 py-2.5 text-xs font-semibold sm:flex-none sm:px-5 sm:text-sm ${
                    filter === id ? 'bg-floodlight text-black' : 'text-paper/60 hover:bg-paper/5'
                  }`}
                >
                  {label}
                  {id === 'complete' ? ` (${squadCounts.complete})` : null}
                  {id === 'incomplete' ? ` (${squadCounts.incomplete})` : null}
                  {id === 'pending' ? ` (${squadCounts.pending})` : null}
                </button>
              ))}
            </div>

            {filter === 'pending' ? (
              <div className="mt-6 border border-paper/15">
                {filteredPending.length === 0 ? (
                  <p className="py-10 text-center text-sm text-paper/50">
                    {query.trim() ? 'No pending teams match your search.' : 'No teams awaiting approval.'}
                  </p>
                ) : (
                  <ul className="divide-y divide-paper/12">
                    {filteredPending.map((p) => (
                      <li
                        key={p.publicReference}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6"
                      >
                        <div>
                          <p className="font-display text-lg text-paper">{p.teamName}</p>
                          <p className="mt-1 text-xs text-paper/45">
                            Ref {p.publicReference} · Captain {p.captainName}
                          </p>
                        </div>
                        <span className="rounded-sm border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-100/90">
                          Pending
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <>
                {query.trim() && filteredRows.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-paper/50">No teams match your search.</p>
                ) : null}
                <div className="mt-6">
                  <TeamsBoardList
                    rows={filteredRows}
                    squadProgress={squadProgress}
                    minSquad={minSquad}
                    emptyMessage={
                      filter === 'complete'
                        ? 'No teams with a complete squad yet.'
                        : filter === 'incomplete'
                          ? 'All confirmed teams have complete squads.'
                          : undefined
                    }
                  />
                </div>
              </>
            )}
          </>
        ) : null}
      </PublicPageContent>
    </div>
  );
}

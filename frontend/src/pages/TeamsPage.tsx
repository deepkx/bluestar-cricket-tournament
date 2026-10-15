import { useCallback, useEffect, useMemo, useState } from 'react';
import { PublicAdminPublishDock } from '../components/admin/PublicAdminPublishDock';
import { TeamsBoardReveal } from '../components/teams/TeamsBoardReveal';
import { TeamsBoardList } from '../components/teams/TeamsBoardList';
import { fetchSquadProgressByTeamId, listConfirmedTeams } from '../data/teams';
import type { SquadProgress } from '../utils/squadProgress';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { useSiteConfigPoll } from '../hooks/useSiteConfigPoll';
import { TOURNAMENT_MAX_TEAMS } from '../content/tournamentTeams';
import type { TeamPublic } from '../types/api';
import { buildTeamSlotRows, teamSlotStats } from '../utils/teamSlots';

export function TeamsPage() {
  const { tournament, refresh } = useSiteConfigPoll();
  const [teams, setTeams] = useState<TeamPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');
  const [squadProgress, setSquadProgress] = useState<Map<string, SquadProgress>>(new Map());

  const boardPhase = tournament?.teamsBoardPhase ?? 'visible';
  const minSquad = tournament?.minSquadSize ?? 11;

  const loadTeams = useCallback(() => {
    setLoading(true);
    setErr('');
    Promise.all([listConfirmedTeams(), fetchSquadProgressByTeamId().catch(() => new Map())])
      .then(([teamList, progress]) => {
        setTeams(teamList);
        setSquadProgress(progress);
      })
      .catch(() => {
        setErr('Could not load live data from Supabase. Teams below are from the fixed tournament list.');
        setTeams([]);
        setSquadProgress(new Map());
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

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.teamName?.toLowerCase().includes(q));
  }, [rows, query]);

  const showBoard = boardPhase === 'visible';
  const showAnimating = boardPhase === 'animating';
  const showIdle = boardPhase === 'idle';

  const adminBar = <PublicAdminPublishDock preset="teams" onUpdated={refresh} />;

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero kicker="Squads" title="Teams" sideScenery />

      <PublicPageContent width="lg" sideScenery>
        {adminBar ? <div className="mb-8">{adminBar}</div> : null}

        <div className="grid grid-cols-2 gap-px border border-paper/15 bg-paper/15">
          <div className="bg-turf/25 px-4 py-5 text-center">
            <p className="hud-label text-[10px] sm:text-xs">Filled slots</p>
            <p className="font-display mt-2 text-3xl tabular-nums text-paper/90 sm:text-4xl">{stats.filled}</p>
          </div>
          <div className="bg-turf/25 px-4 py-5 text-center">
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
            The full team board unlocks when the draw opens.
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

            {query.trim() && filteredRows.length === 0 ? (
              <p className="mt-6 text-center text-sm text-paper/50">No teams match your search.</p>
            ) : null}
            <div className="mt-6">
              <TeamsBoardList rows={filteredRows} squadProgress={squadProgress} minSquad={minSquad} />
            </div>
          </>
        ) : null}
      </PublicPageContent>
    </div>
  );
}

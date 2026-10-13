import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listConfirmedTeams } from '../data/teams';
import { getCurrentTournament } from '../data/tournament';
import { TOURNAMENT_MAX_TEAMS } from '../content/tournamentTeams';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import type { TeamPublic, TournamentPublic } from '../types/api';
import { buildTeamSlotRows, teamSlotStats } from '../utils/teamSlots';

function showSquadAdd(row: { kind: string; teamName: string | null }): row is { kind: 'filled'; teamName: string } {
  return row.kind === 'filled' && Boolean(row.teamName);
}

export function TeamsPage() {
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [teams, setTeams] = useState<TeamPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');

  const loadTeams = useCallback(() => {
    setLoading(true);
    setErr('');
    Promise.all([getCurrentTournament(), listConfirmedTeams()])
      .then(([t, teamList]) => {
        setTournament(t);
        setTeams(teamList);
      })
      .catch(() => {
        setErr('Could not load live data from Supabase. Teams below are from the fixed tournament list.');
        setTeams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const maxTeams = tournament?.maxTeams ?? TOURNAMENT_MAX_TEAMS;
  const rows = useMemo(() => buildTeamSlotRows(maxTeams, teams), [maxTeams, teams]);
  const stats = useMemo(() => teamSlotStats(maxTeams, teams), [maxTeams, teams]);
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.teamName?.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero kicker="Squads" title="Teams" sideScenery />

      <PublicPageContent width="lg" sideScenery>
        <div className="flex flex-wrap items-center justify-center gap-10 border border-paper/15 bg-turf/25 px-8 py-6 sm:gap-16">
          <div className="text-center">
            <p className="hud-label">Filled slots</p>
            <p className="font-display mt-2 text-4xl tabular-nums text-floodlight-bright">{stats.filled}</p>
          </div>
          <div className="h-12 w-px bg-paper/20" aria-hidden />
          <div className="text-center">
            <p className="hud-label">Available slots</p>
            <p className="font-display mt-2 text-4xl tabular-nums text-paper">{stats.available}</p>
          </div>
        </div>

        {loading && <p className="mt-14 text-center text-paper/50">Loading…</p>}
        {err && (
          <p className="mt-6 border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100/90">
            {err}
          </p>
        )}

        {!loading && (
          <div className="mt-12">
            <p className="mb-4 text-center text-sm text-paper/55">
              Captains: tap <span className="font-semibold text-floodlight-bright">Add squad</span>, then enter the last
              4 digits of your mobile number on file.
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
            {query.trim() && filteredRows.length === 0 ? (
              <p className="mt-6 text-center text-sm text-paper/50">No teams match your search.</p>
            ) : null}
          </div>
        )}

        {!loading && (
          <div className="mt-6 border border-paper/15">
            <div className="grid grid-cols-[2.5rem_1fr_minmax(6.5rem,auto)] gap-3 border-b border-paper/12 bg-turf/30 px-4 py-3 text-xs font-medium uppercase tracking-widest text-paper/50 sm:grid-cols-[3rem_1fr_8.5rem] sm:gap-4 sm:px-6">
              <span>#</span>
              <span>Team</span>
              <span className="text-right sm:text-center">Squad</span>
            </div>
            <ul className="divide-y divide-paper/12">
              {filteredRows.map((row) => {
                const rowStripe =
                  row.slot % 2 === 1 ? 'bg-floodlight/[0.04]' : row.kind === 'open' ? 'bg-transparent' : 'bg-turf/15';
                const nameGold = row.slot % 2 === 1;
                const addSquad = showSquadAdd(row);

                return (
                  <li
                    key={row.slot}
                    className={`grid grid-cols-[2.5rem_1fr_minmax(6.5rem,auto)] items-center gap-3 px-4 py-3 sm:grid-cols-[3rem_1fr_8.5rem] sm:gap-4 sm:px-6 sm:py-4 ${
                      row.kind === 'host' ? 'bg-floodlight/[0.08]' : rowStripe
                    }`}
                  >
                    <span
                      className={`hud-stat text-lg tabular-nums ${
                        nameGold ? 'text-floodlight-dim' : 'text-paper/45'
                      }`}
                    >
                      {row.slot}
                    </span>

                    <div className="min-w-0">
                      {row.kind === 'open' ? (
                        <span className="text-sm text-paper/35">Open slot</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/teams/${encodeURIComponent(row.teamName!)}`}
                            className={`font-display text-base tracking-wide hover:underline sm:text-lg ${
                              nameGold ? 'text-floodlight-bright' : 'text-paper'
                            }`}
                          >
                            {row.teamName}
                          </Link>
                          {row.kind === 'host' ? (
                            <span className="funk-skew-chip border border-floodlight/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-floodlight-bright">
                              Host
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end sm:justify-center">
                      {addSquad ? (
                        <Link
                          to={`/teams/${encodeURIComponent(row.teamName)}?captain=1`}
                          className="squad-add-link"
                        >
                          <span>+ Add</span>
                        </Link>
                      ) : (
                        <span className="px-2 text-xs text-paper/25">—</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </PublicPageContent>
    </div>
  );
}

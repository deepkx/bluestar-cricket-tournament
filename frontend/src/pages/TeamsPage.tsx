import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import type { TeamPublic, TournamentPublic } from '../types/api';
import { formatRegisteredAt } from '../utils/formatDateTime';
import { buildTeamSlotRows, teamSlotStats } from '../utils/teamSlots';

export function TeamsPage() {
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [teams, setTeams] = useState<TeamPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const loadTeams = useCallback(() => {
    setLoading(true);
    setErr('');
    Promise.all([
      api.get<TournamentPublic>('/api/v1/tournaments/current'),
      api.get<TeamPublic[]>('/api/v1/teams'),
    ])
      .then(([tRes, teamsRes]) => {
        setTournament(tRes.data);
        setTeams(teamsRes.data);
      })
      .catch(() => setErr('Failed to load teams'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const maxTeams = tournament?.maxTeams ?? 32;
  const timeZone = tournament?.timezone ?? 'Asia/Kolkata';
  const rows = useMemo(() => buildTeamSlotRows(maxTeams, teams), [maxTeams, teams]);
  const stats = useMemo(() => teamSlotStats(maxTeams, teams), [maxTeams, teams]);

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero kicker="Squads" title="Registered teams" sideScenery />

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
        {err && <p className="mt-14 text-center text-paper/70">{err}</p>}

        {!loading && !err && (
          <div className="mt-12 border border-paper/15">
            <div className="hidden border-b border-paper/12 bg-turf/30 px-4 py-3 text-xs font-medium uppercase tracking-widest text-paper/50 sm:grid sm:grid-cols-[3rem_1fr_11rem] sm:gap-4 sm:px-6">
              <span>#</span>
              <span>Team</span>
              <span className="text-right">Registered</span>
            </div>
            <ul className="divide-y divide-paper/12">
              {rows.map((row) => {
                const rowStripe =
                  row.slot % 2 === 1 ? 'bg-floodlight/[0.04]' : row.kind === 'open' ? 'bg-transparent' : 'bg-turf/15';
                const nameGold = row.slot % 2 === 1;
                const registeredLabel =
                  row.kind === 'host' ? '—' : formatRegisteredAt(row.registeredAt, timeZone);
                return (
                  <li
                    key={row.slot}
                    className={`grid grid-cols-1 gap-1 px-4 py-4 sm:grid-cols-[3rem_1fr_11rem] sm:items-center sm:gap-4 sm:px-6 sm:py-4 ${
                      row.kind === 'host' ? 'bg-floodlight/[0.08]' : rowStripe
                    }`}
                  >
                    <span
                      className={`hud-stat text-lg tabular-nums sm:w-10 ${
                        nameGold ? 'text-floodlight-dim' : 'text-paper/45'
                      }`}
                    >
                      {row.slot}
                    </span>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {row.kind === 'open' ? (
                        <span className="text-sm text-paper/35">Open slot</span>
                      ) : (
                        <Link
                          to={`/teams/${encodeURIComponent(row.teamName!)}`}
                          className={`font-display text-lg tracking-wide hover:underline sm:text-xl ${
                            nameGold ? 'text-floodlight-bright' : 'text-paper'
                          }`}
                        >
                          {row.teamName}
                        </Link>
                      )}
                      {row.kind === 'host' ? (
                        <span className="funk-skew-chip border border-floodlight/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-floodlight-bright">
                          Host
                        </span>
                      ) : null}
                      <span className="text-xs text-paper/45 sm:hidden">
                        Registered: {registeredLabel}
                      </span>
                    </div>
                    <span className="hidden text-right text-sm tabular-nums text-paper/55 sm:block">
                      {registeredLabel}
                    </span>
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

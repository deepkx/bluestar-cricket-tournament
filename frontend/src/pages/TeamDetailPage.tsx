import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CaptainRosterPanel, CaptainVerifyDialog } from '../components/teams/CaptainRosterPanel';
import { SquadProgressBadge } from '../components/teams/SquadProgressBadge';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { isFixedHostTeamName } from '../content/homeEvent';
import { findRosterTeam } from '../content/tournamentTeams';
import { getCurrentTournament } from '../data/tournament';
import { getTeamByName, type TeamDetail } from '../data/teams';
import type { SquadProgress } from '../utils/squadProgress';
import { mediaUrl } from '../utils/mediaUrl';

export function TeamDetailPage() {
  const { teamName: encoded } = useParams<{ teamName: string }>();
  const teamName = encoded ? decodeURIComponent(encoded) : '';
  const [searchParams, setSearchParams] = useSearchParams();
  const [detail, setDetail] = useState<TeamDetail | null>(null);
  const [error, setError] = useState('');
  const [setupWarning, setSetupWarning] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rosterEdit, setRosterEdit] = useState(false);
  const [minSquad, setMinSquad] = useState(11);

  const squadProgress: SquadProgress | undefined = detail
    ? {
        playerCount: detail.players.length,
        photoCount: detail.players.filter((p) => p.photoUrl).length,
      }
    : undefined;

  const load = useCallback(() => {
    if (!teamName) return;
    setLoading(true);
    setError('');
    setSetupWarning('');
    getTeamByName(teamName)
      .then((data) => {
        if (data) {
          setDetail(data);
          return;
        }
        if (isFixedHostTeamName(teamName)) {
          setDetail({
            teamId: '',
            teamName,
            logoUrl: '/bluestar-star.svg',
            captainName: '—',
            confirmedAt: null,
            players: [],
          });
          return;
        }
        const roster = findRosterTeam(teamName);
        if (roster) {
          setDetail({
            teamId: '',
            teamName: roster.teamName,
            logoUrl: null,
            captainName: 'Captain',
            confirmedAt: null,
            players: [],
          });
          setSetupWarning(
            'This team is listed for the tournament but is not synced in the database yet. Run supabase/migrations/006_captain_roster.sql in Supabase SQL, then refresh this page before adding a squad.',
          );
        } else {
          setError('Team not found.');
        }
      })
      .catch(() => setError('Could not load team. Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, [teamName]);

  useEffect(() => {
    load();
    setVerifyOpen(false);
    setRosterEdit(false);
  }, [load]);

  useEffect(() => {
    getCurrentTournament()
      .then((t) => setMinSquad(t.minSquadSize))
      .catch(() => {});
  }, []);

  const isHost = detail ? isFixedHostTeamName(detail.teamName) : false;
  const canCaptainAdd = detail && !isHost;
  const hasTeamId = Boolean(detail?.teamId);

  useEffect(() => {
    if (searchParams.get('captain') !== '1' || !canCaptainAdd || loading) return;
    if (hasTeamId) setVerifyOpen(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, canCaptainAdd, hasTeamId, loading]);

  const logo = mediaUrl(detail?.logoUrl);

  const openCaptainFlow = () => {
    if (!hasTeamId) {
      setSetupWarning(
        'Squad upload needs the team in Supabase first. Run supabase/migrations/006_captain_roster.sql in the Supabase SQL editor, then refresh.',
      );
      return;
    }
    setVerifyOpen(true);
  };

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero kicker="Squad" title={teamName || 'Team'} sideScenery />

      <PublicPageContent width="md" sideScenery>
        <Link to="/teams" className="text-sm text-floodlight-bright underline">
          ← All teams
        </Link>

        {loading && <p className="mt-10 text-center text-paper/50">Loading…</p>}
        {error && <p className="mt-10 text-center text-paper/70">{error}</p>}

        {detail && !error && (
          <div className="register-panel mt-8 px-6 py-8 sm:px-10">
            {setupWarning ? (
              <p className="mb-6 border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
                {setupWarning}
              </p>
            ) : null}

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden border border-paper/20 bg-ink-deep/60">
                {logo ? (
                  <img src={logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-paper/40">Logo</span>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="font-display text-2xl tracking-wide text-floodlight-bright">{detail.teamName}</h2>
                {!isHost ? (
                  <p className="mt-2 text-sm text-paper/65">
                    Captain: <span className="text-paper">{detail.captainName}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-paper/65">Host team</p>
                )}
              </div>
            </div>

            {canCaptainAdd && squadProgress && squadProgress.playerCount > 0 && !rosterEdit ? (
              <SquadProgressBadge progress={squadProgress} minSquad={minSquad} variant="panel" />
            ) : null}

            {canCaptainAdd && !rosterEdit ? (
              <button
                type="button"
                className="squad-add-link squad-add-link--hero mt-8 w-full sm:w-auto"
                onClick={openCaptainFlow}
              >
                {detail.players.length > 0 ? 'Edit squad' : 'Add squad'}
              </button>
            ) : null}

            {!isHost && !rosterEdit ? (
              <p className="mt-3 text-center text-xs text-paper/45">
                Captains: verify with the last 4 digits of your registered mobile number.
              </p>
            ) : null}

            {detail.players.length > 0 && !rosterEdit ? (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {detail.players.map((p) => {
                  const photo = mediaUrl(p.photoUrl);
                  return (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 border border-paper/12 bg-ink-deep/40 px-3 py-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden border border-paper/15 bg-turf/20">
                        {photo ? (
                          <img src={photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-paper/35">
                            Photo
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-paper">{p.fullName}</p>
                        {p.captain ? (
                          <p className="text-xs uppercase tracking-widest text-floodlight-dim">Captain</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {rosterEdit && detail.teamId ? (
              <CaptainRosterPanel
                teamId={detail.teamId}
                detail={detail}
                onSaved={() => {
                  setRosterEdit(false);
                  load();
                }}
                onCancel={() => setRosterEdit(false)}
              />
            ) : null}
          </div>
        )}
      </PublicPageContent>

      {verifyOpen && detail?.teamId ? (
        <CaptainVerifyDialog
          teamId={detail.teamId}
          onVerified={() => {
            setVerifyOpen(false);
            setRosterEdit(true);
          }}
          onCancel={() => setVerifyOpen(false)}
        />
      ) : null}
    </div>
  );
}

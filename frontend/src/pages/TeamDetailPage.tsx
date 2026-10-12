import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTeamByName } from '../data/teams';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { isFixedHostTeamName } from '../content/homeEvent';
import { mediaUrl } from '../utils/mediaUrl';

type TeamDetail = {
  teamName: string;
  logoUrl: string | null;
  captainName: string;
  confirmedAt: string | null;
  players: { fullName: string; captain: boolean; photoUrl: string | null }[];
};

export function TeamDetailPage() {
  const { teamName: encoded } = useParams<{ teamName: string }>();
  const teamName = encoded ? decodeURIComponent(encoded) : '';
  const [detail, setDetail] = useState<TeamDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamName) return;
    if (isFixedHostTeamName(teamName)) {
      setDetail({
        teamName,
        logoUrl: '/bluestar-star.svg',
        captainName: '—',
        confirmedAt: null,
        players: [],
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    getTeamByName(teamName)
      .then((data) => {
        if (!data) setError('Team not found or not yet confirmed.');
        else setDetail(data);
      })
      .catch(() => setError('Team not found or not yet confirmed.'))
      .finally(() => setLoading(false));
  }, [teamName]);

  const logo = mediaUrl(detail?.logoUrl);

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
                {!isFixedHostTeamName(detail.teamName) ? (
                  <p className="mt-2 text-sm text-paper/65">
                    Captain: <span className="text-paper">{detail.captainName}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-paper/65">Host team</p>
                )}
              </div>
            </div>

            {detail.players.length > 0 ? (
              <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {detail.players.map((p) => {
                  const photo = mediaUrl(p.photoUrl);
                  return (
                    <li
                      key={p.fullName}
                      className="flex items-center gap-3 border border-paper/12 bg-ink-deep/40 px-3 py-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden border border-paper/15 bg-turf/20">
                        {photo ? (
                          <img src={photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-paper/35">Photo</span>
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
          </div>
        )}
      </PublicPageContent>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../api/client';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { RevealCountdownBlock } from '../components/ui/RevealCountdownBlock';
import { resolvePoolsFixturesRevealIso } from '../content/homeEvent';
import { useCountdown } from '../hooks/useCountdown';
import type { TournamentPublic } from '../types/api';

const POOL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

export function PoolsPage() {
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);

  useEffect(() => {
    api.get<TournamentPublic>('/api/v1/tournaments/current').then((r) => setTournament(r.data));
  }, []);

  const revealIso = tournament ? resolvePoolsFixturesRevealIso(tournament.fixtureAnnouncementAt) : null;
  const cd = useCountdown(revealIso, tournament?.timezone ?? 'Asia/Kolkata');
  const revealed = cd?.expired ?? false;

  if (!tournament) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-ink-deep text-paper/40">Loading…</div>
    );
  }

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Draw"
        title="Pools"
        lead="Eight pools of four teams. Assignments go live Thursday evening."
      />

      <PublicPageContent width="lg">
        <RevealCountdownBlock
          targetIso={tournament.fixtureAnnouncementAt}
          timezone={tournament.timezone}
          headline="Pool draw countdown"
        />

        {revealed ? (
          <div className="mt-14 sm:mt-16">
            <p className="hud-label text-center">Pool assignments</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {POOL_LABELS.map((pool) => (
                <div key={pool} className="border border-paper/15 bg-turf/20 px-6 py-6">
                  <p className="font-display text-2xl tracking-wide text-floodlight-dim">Pool {pool}</p>
                  <ul className="mt-5 space-y-3 text-sm text-paper/60">
                    {[1, 2, 3, 4].map((n) => (
                      <li key={n} className="flex gap-3 border-b border-paper/10 pb-2 last:border-0">
                        <span className="text-paper/30 tabular-nums">{n}.</span>
                        <span>TBD</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-sm text-paper/45">
              Final pool lists will appear here once published by the committee.
            </p>
          </div>
        ) : (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            Pool tables unlock when the countdown above reaches zero.
          </p>
        )}
      </PublicPageContent>
    </div>
  );
}

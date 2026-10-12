import { useEffect, useState } from 'react';
import { listPublishedMatches } from '../data/matches';
import { getCurrentTournament } from '../data/tournament';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { RevealCountdownBlock } from '../components/ui/RevealCountdownBlock';
import { resolvePoolsFixturesRevealIso } from '../content/homeEvent';
import { useCountdown } from '../hooks/useCountdown';
import type { MatchPublic, TournamentPublic } from '../types/api';

export function FixturesPage() {
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [matches, setMatches] = useState<MatchPublic[]>([]);

  useEffect(() => {
    Promise.all([getCurrentTournament(), listPublishedMatches()]).then(([t, m]) => {
      setTournament(t);
      setMatches(m);
    });
  }, []);

  const revealIso = tournament ? resolvePoolsFixturesRevealIso(tournament.fixtureAnnouncementAt) : null;
  const cd = useCountdown(revealIso, tournament?.timezone ?? 'Asia/Kolkata');
  const revealed = cd?.expired ?? false;

  if (!tournament) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-ink-deep text-paper/40">Loading…</div>
    );
  }

  const showFixtures = revealed && matches.length > 0;

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Schedule"
        title="Fixtures"
        lead="Match-ups and timings publish with the draw on Thursday evening."
      />

      <PublicPageContent width="md">
        <RevealCountdownBlock
          targetIso={tournament.fixtureAnnouncementAt}
          timezone={tournament.timezone}
          headline="Fixtures countdown"
        />

        {showFixtures ? (
          <ul className="mt-14 space-y-6 sm:mt-16">
            {matches.map((m) => (
              <li key={m.id} className="border border-paper/15 bg-turf/20 px-6 py-7 sm:px-8">
                <p className="hud-label">
                  Round {m.roundNumber} · Match {m.matchNumber}
                </p>
                <p className="font-display mt-4 text-xl tracking-wide sm:text-2xl">
                  {m.teamAName ?? 'TBD'}
                  <span className="mx-2 text-sm text-paper/40">vs</span>
                  {m.teamBName ?? 'TBD'}
                </p>
                {m.scheduledAt && (
                  <p className="mt-4 text-sm text-paper/60">
                    {new Date(m.scheduledAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
                {m.venue && <p className="mt-1 text-sm text-paper/55">{m.venue}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            {revealed
              ? 'Fixtures are not published yet. Check back soon.'
              : 'The full schedule appears when the countdown above reaches zero.'}
          </p>
        )}
      </PublicPageContent>
    </div>
  );
}

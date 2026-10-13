import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { listPublishedMatches } from '../data/matches';
import { fetchPublicFixtures, type FixtureRow } from '../data/pools';
import { getCurrentTournament } from '../data/tournament';
import { listConfirmedTeams } from '../data/teams';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { RevealCountdownBlock } from '../components/ui/RevealCountdownBlock';
import { resolvePoolsFixturesRevealIso } from '../content/homeEvent';
import { useDrawReveal } from '../hooks/useDrawReveal';
import type { MatchPublic, TournamentPublic } from '../types/api';

function pickRandom(names: string[]): string {
  if (names.length === 0) return 'TBD';
  return names[Math.floor(Math.random() * names.length)] ?? 'TBD';
}

function FixtureCard({
  animating,
  decoyNames,
  match,
}: {
  animating: boolean;
  decoyNames: string[];
  match: MatchPublic | FixtureRow;
}) {
  const teamA = 'teamAName' in match ? match.teamAName : null;
  const teamB = 'teamBName' in match ? match.teamBName : null;
  const [a, setA] = useState(teamA ?? 'TBD');
  const [b, setB] = useState(teamB ?? 'TBD');

  useEffect(() => {
    if (!animating) {
      setA(teamA ?? 'TBD');
      setB(teamB ?? 'TBD');
      return;
    }
    const tick = window.setInterval(() => {
      setA(pickRandom(decoyNames));
      setB(pickRandom(decoyNames));
    }, 85);
    const done = window.setTimeout(() => {
      window.clearInterval(tick);
      setA(teamA ?? 'TBD');
      setB(teamB ?? 'TBD');
    }, 4200);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [animating, decoyNames, teamA, teamB]);

  const label =
    'label' in match && match.label
      ? match.label
      : 'roundNumber' in match
        ? `Round ${match.roundNumber} · Match ${match.matchNumber}`
        : 'Pool match';

  const scheduledAt = match.scheduledAt;
  const venue = match.venue;

  return (
    <motion.li
      className="border border-paper/15 bg-turf/20 px-6 py-7 sm:px-8"
      animate={animating ? { boxShadow: ['0 0 0 rgba(229,160,23,0)', '0 0 24px rgba(229,160,23,0.15)', '0 0 0 rgba(229,160,23,0)'] } : {}}
      transition={{ duration: 0.8, repeat: animating ? Infinity : 0 }}
    >
      <p className="hud-label">{label}</p>
      <p className="font-display mt-4 text-xl tracking-wide sm:text-2xl">
        <span className={animating ? 'text-floodlight-bright' : 'text-paper'}>{a}</span>
        <span className="mx-2 text-sm text-paper/40">vs</span>
        <span className={animating ? 'text-floodlight-bright' : 'text-paper'}>{b}</span>
      </p>
      {scheduledAt && (
        <p className="mt-4 text-sm text-paper/60">
          {new Date(scheduledAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      )}
      {venue && <p className="mt-1 text-sm text-paper/55">{venue}</p>}
    </motion.li>
  );
}

export function FixturesPage() {
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [matches, setMatches] = useState<(MatchPublic | FixtureRow)[]>([]);
  const [decoyNames, setDecoyNames] = useState<string[]>([]);

  const revealIso = tournament ? resolvePoolsFixturesRevealIso(tournament.fixtureAnnouncementAt) : null;
  const { phase, completeAnimation, revealed } = useDrawReveal(
    revealIso,
    tournament?.timezone ?? 'Asia/Kolkata',
    'bluestar-fixtures-reveal-v1',
  );

  useEffect(() => {
    Promise.all([getCurrentTournament(), listConfirmedTeams()]).then(([t, teams]) => {
      setTournament(t);
      setDecoyNames(teams.map((x) => x.teamName));
    });
  }, []);

  useEffect(() => {
    if (!revealed) return;
    fetchPublicFixtures()
      .then((rows) => {
        if (rows.length > 0) setMatches(rows);
        else return listPublishedMatches().then(setMatches);
      })
      .catch(() => listPublishedMatches().then(setMatches));
  }, [revealed]);

  useEffect(() => {
    if (phase !== 'animating' || matches.length === 0) return;
    const t = window.setTimeout(() => completeAnimation(), 4800);
    return () => window.clearTimeout(t);
  }, [phase, matches.length, completeAnimation]);

  if (!tournament) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-ink-deep text-paper/40">Loading…</div>
    );
  }

  const showSection = phase !== 'waiting';
  const animating = phase === 'animating' && matches.length > 0;

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Schedule"
        title="Fixtures"
        lead="Pool stage match-ups publish with the draw — live shuffle, then the final schedule."
      />

      <PublicPageContent width="md">
        <RevealCountdownBlock
          targetIso={tournament.fixtureAnnouncementAt}
          timezone={tournament.timezone}
          headline="Fixtures countdown"
        />

        {!showSection ? (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            The schedule appears when the countdown reaches zero, with a short live reveal animation.
          </p>
        ) : null}

        {showSection && matches.length > 0 ? (
          <div className="mt-14 sm:mt-16">
            {animating ? (
              <p className="hud-label mb-8 text-center text-floodlight-bright">Live reveal — pairing fixtures…</p>
            ) : null}
            <ul className="space-y-6">
              {matches.map((m, idx) => (
                <FixtureCard
                  key={'id' in m && m.id != null ? String(m.id) : `fx-${idx}`}
                  animating={animating}
                  decoyNames={decoyNames}
                  match={m}
                />
              ))}
            </ul>
          </div>
        ) : null}

        {showSection && matches.length === 0 ? (
          <p className="mt-14 text-center text-sm text-paper/50">
            Fixtures are not set yet. The committee will publish the pool schedule after the draw.
          </p>
        ) : null}
      </PublicPageContent>
    </div>
  );
}

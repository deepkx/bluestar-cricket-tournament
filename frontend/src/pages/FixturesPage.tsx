import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PublicAdminPublishDock } from '../components/admin/PublicAdminPublishDock';
import { PublishCountdownScreen } from '../components/publish/PublishCountdownScreen';
import { listPublishedMatches } from '../data/matches';
import { fetchPublicFixtures, type FixtureRow } from '../data/pools';
import { listConfirmedTeams } from '../data/teams';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { useBoardDrawReveal } from '../hooks/useBoardDrawReveal';
import { useSiteConfigPoll } from '../hooks/useSiteConfigPoll';
import type { MatchPublic } from '../types/api';

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
  const { tournament, refresh } = useSiteConfigPoll();
  const [matches, setMatches] = useState<(MatchPublic | FixtureRow)[]>([]);
  const [decoyNames, setDecoyNames] = useState<string[]>([]);

  const boardPhase = tournament?.fixturesBoardPhase ?? 'idle';
  const timezone = tournament?.timezone ?? 'Asia/Kolkata';
  const revealIso = tournament?.fixturesRevealAt ?? null;

  const drawSessionKey = `bluestar-fixtures-reveal-r${tournament?.fixturesDrawRun ?? 0}`;

  const { phase, completeAnimation, countdownLive, contentUnlocked } = useBoardDrawReveal({
    revealIso,
    timezone,
    sessionKey: drawSessionKey,
    boardPhase,
  });

  useEffect(() => {
    void listConfirmedTeams().then((teams) => setDecoyNames(teams.map((x) => x.teamName)));
  }, []);

  useEffect(() => {
    if (!contentUnlocked) {
      setMatches([]);
      return;
    }
    fetchPublicFixtures()
      .then((rows) => {
        if (rows.length > 0) setMatches(rows);
        else return listPublishedMatches().then(setMatches);
      })
      .catch(() => listPublishedMatches().then(setMatches));
  }, [contentUnlocked]);

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

  const adminBar = <PublicAdminPublishDock preset="fixtures" onUpdated={refresh} />;
  const showIdle = boardPhase === 'idle' && !contentUnlocked;
  const animating = phase === 'animating' && matches.length > 0;

  if (countdownLive) {
    return (
      <PublishCountdownScreen
        pageTitle="Fixtures"
        headline="Fixtures countdown"
        targetIso={revealIso}
        timezone={timezone}
        adminBar={adminBar}
      />
    );
  }

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Schedule"
        title="Fixtures"
        lead="Pool stage match-ups publish with the draw — live shuffle, then the final schedule."
      />

      <PublicPageContent width="md">
        {adminBar ? <div className="mb-8">{adminBar}</div> : null}

        {showIdle ? (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            The fixture list has not opened yet. Check back when the committee starts the countdown.
          </p>
        ) : null}

        {!showIdle && matches.length > 0 ? (
          <div className="mt-10 sm:mt-12">
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

        {!showIdle && matches.length === 0 ? (
          <p className="mt-14 text-center text-sm text-paper/50">
            Fixtures are not set yet. The committee will publish the pool schedule after the draw.
          </p>
        ) : null}
      </PublicPageContent>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { PublicAdminPublishDock } from '../components/admin/PublicAdminPublishDock';
import { PoolFixturesSection } from '../components/fixtures/PoolFixturesSection';
import { PublishCountdownScreen } from '../components/publish/PublishCountdownScreen';
import { fetchPublicFixtures, type FixtureRow } from '../data/pools';
import { listConfirmedTeams } from '../data/teams';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { useBoardDrawReveal } from '../hooks/useBoardDrawReveal';
import { useSiteConfigPoll } from '../hooks/useSiteConfigPoll';
import { groupFixturesByPool } from '../utils/fixtureDisplay';

const POOL_ORDER = ['A', 'B', 'C', 'D'] as const;

/** Staggered pool reveal: ~2s per pool after countdown. */
const REVEAL_DURATION_MS = POOL_ORDER.length * 2000 + 1200;

export function FixturesPage() {
  const { tournament, refresh } = useSiteConfigPoll();
  const [matches, setMatches] = useState<FixtureRow[]>([]);
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
      .then((rows) => setMatches(rows))
      .catch(() => setMatches([]));
  }, [contentUnlocked]);

  useEffect(() => {
    if (phase !== 'animating' || matches.length === 0) return;
    const t = window.setTimeout(() => completeAnimation(), REVEAL_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phase, matches.length, completeAnimation]);

  const byPool = useMemo(() => groupFixturesByPool(matches), [matches]);

  if (!tournament) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-ink-deep text-paper/40">Loading…</div>
    );
  }

  const adminBar = <PublicAdminPublishDock preset="fixtures" onUpdated={refresh} />;
  const showIdle = boardPhase === 'idle' && !contentUnlocked;
  const animating = phase === 'animating' && matches.length > 0;
  const revealed = phase === 'revealed';

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
        lead="Pool knockout brackets — Saturday pools A & C, Sunday pools B & D. 45 minutes per match."
      />

      <PublicPageContent width="2xl">
        {adminBar ? <div className="mb-8">{adminBar}</div> : null}

        {showIdle ? (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            The fixture list has not opened yet. Check back when the committee starts the countdown.
          </p>
        ) : null}

        {!showIdle && matches.length > 0 ? (
          <div className="mt-10 space-y-10 sm:mt-12">
            {animating ? (
              <p className="hud-label text-center text-floodlight-bright">Live reveal — pool schedules…</p>
            ) : null}
            {POOL_ORDER.map((code, sectionIndex) => {
              const poolFixtures = byPool.get(code) ?? [];
              if (poolFixtures.length === 0) return null;
              return (
                <PoolFixturesSection
                  key={code}
                  poolCode={code}
                  fixtures={poolFixtures}
                  animating={animating}
                  decoyNames={decoyNames}
                  sectionIndex={sectionIndex}
                  revealed={revealed}
                />
              );
            })}
          </div>
        ) : null}

        {!showIdle && matches.length === 0 ? (
          <p className="mt-14 text-center text-sm text-paper/50">
            Fixtures are not set yet. Run migration 015 in Supabase or add fixtures in Admin → Pools & fixtures.
          </p>
        ) : null}
      </PublicPageContent>
    </div>
  );
}

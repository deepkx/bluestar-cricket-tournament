import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicAdminPublishDock } from '../components/admin/PublicAdminPublishDock';
import { DaywiseFixturesSections } from '../components/fixtures/DaywiseFixturesSections';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { PublishCountdownScreen } from '../components/publish/PublishCountdownScreen';
import { fetchPublicFixtures, fetchPublicPools, type FixtureRow, type PoolBoard } from '../data/pools';
import { hydratePoolFixturesFromSlots } from '../utils/poolSlotFixtureTeams';
import { useAutoAdvanceCountdown } from '../hooks/useAutoAdvanceCountdown';
import { useBoardDrawReveal } from '../hooks/useBoardDrawReveal';
import { useFixturesPoolReveal } from '../hooks/useFixturesPoolReveal';
import { useSiteConfigPoll } from '../hooks/useSiteConfigPoll';
import { buildDayHalfSections } from '../utils/fixtureDaywise';
import { groupFixturesByPool } from '../utils/fixtureDisplay';
import { SHOWDOWN_TAB } from '../utils/showdownModel';

export function DaywiseFixturesPage() {
  const { tournament, refresh } = useSiteConfigPoll();
  const [matches, setMatches] = useState<FixtureRow[]>([]);
  const [boards, setBoards] = useState<PoolBoard[]>([]);

  const boardPhase = tournament?.fixturesBoardPhase ?? 'idle';
  const timezone = tournament?.timezone ?? 'Asia/Kolkata';
  const revealIso = tournament?.fixturesRevealAt ?? null;
  const drawSessionKey = `bluestar-fixtures-reveal-r${tournament?.fixturesDrawRun ?? 0}`;

  const { phase, completeAnimation, countdownLive, countdownExpired, contentUnlocked } =
    useBoardDrawReveal({
      revealIso,
      timezone,
      sessionKey: drawSessionKey,
      boardPhase,
    });

  useAutoAdvanceCountdown(countdownExpired, boardPhase, refresh);

  const animating = phase === 'animating' && matches.length > 0;
  const scheduleVisible = phase === 'revealed';
  const poolReveal = useFixturesPoolReveal(animating);

  useEffect(() => {
    if (!animating || matches.length === 0) return;
    if (poolReveal.reduceMotion) {
      completeAnimation();
      return;
    }
    if (!poolReveal.isLastPool) return;
    const t = window.setTimeout(() => completeAnimation(), poolReveal.poolRevealMs);
    return () => window.clearTimeout(t);
  }, [
    animating,
    matches.length,
    completeAnimation,
    poolReveal.isLastPool,
    poolReveal.poolRevealMs,
    poolReveal.reduceMotion,
  ]);

  useEffect(() => {
    if (!contentUnlocked) {
      setMatches([]);
      setBoards([]);
      return;
    }
    Promise.all([fetchPublicFixtures(), fetchPublicPools()])
      .then(([rows, poolBoards]) => {
        setMatches(rows);
        setBoards(poolBoards);
      })
      .catch(() => {
        setMatches([]);
        setBoards([]);
      });
  }, [contentUnlocked]);

  const displayFixtures = useMemo(
    () => (boards.length > 0 ? hydratePoolFixturesFromSlots(matches, boards) : matches),
    [matches, boards],
  );

  const sections = useMemo(() => buildDayHalfSections(displayFixtures), [displayFixtures]);
  const poolFixturesByCode = useMemo(() => groupFixturesByPool(displayFixtures), [displayFixtures]);

  if (!tournament) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-ink-deep text-paper/40">Loading…</div>
    );
  }

  const adminBar = <PublicAdminPublishDock preset="fixtures" onUpdated={refresh} />;
  const showIdle = boardPhase === 'idle' && !contentUnlocked;
  const revealLive = animating && !poolReveal.reduceMotion;
  const revealLabel =
    poolReveal.activePool === SHOWDOWN_TAB
      ? `Live reveal — Showdown (${poolReveal.poolIndex + 1}/${poolReveal.poolCount})`
      : `Live reveal — Pool ${poolReveal.activePool} (${poolReveal.poolIndex + 1}/${poolReveal.poolCount})`;

  if (countdownLive) {
    return (
      <PublishCountdownScreen
        pageTitle="Day schedule"
        headline="Fixtures countdown"
        targetIso={revealIso}
        timezone={timezone}
        adminBar={adminBar}
        finaleMode="fixtures"
      />
    );
  }

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Schedule"
        title="Day-wise fixtures"
        lead="Saturday and Sunday split into morning and afternoon sessions — every pool R1 & R2 match in IST."
      />

      <PublicPageContent width="2xl">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/fixtures" className="text-sm text-floodlight-bright underline">
            ← Brackets & Showdown
          </Link>
        </div>

        {adminBar ? <div className="mb-8 mt-6">{adminBar}</div> : null}

        {showIdle ? (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            The schedule has not opened yet. Check back when the committee starts the fixtures countdown.
          </p>
        ) : null}

        {!showIdle && contentUnlocked && !scheduleVisible ? (
          <div className="mt-14 text-center sm:mt-16">
            {revealLive ? (
              <motion.p
                className="hud-label mb-4 text-floodlight-bright"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                key={poolReveal.activePool}
              >
                {revealLabel}
              </motion.p>
            ) : null}
            <p className="text-sm leading-relaxed text-paper/50">
              The day schedule unlocks when the fixture reveal finishes.
            </p>
            <Link to="/fixtures" className="mt-4 inline-block text-sm text-floodlight-bright underline">
              Watch brackets & Showdown reveal →
            </Link>
          </div>
        ) : null}

        {!showIdle && scheduleVisible && matches.length > 0 ? (
          <div className="mt-8 sm:mt-10">
            <DaywiseFixturesSections sections={sections} poolFixturesByCode={poolFixturesByCode} />
          </div>
        ) : null}

        {!showIdle && scheduleVisible && matches.length === 0 ? (
          <p className="mt-14 text-center text-sm text-paper/50">No fixtures loaded yet.</p>
        ) : null}
      </PublicPageContent>
    </div>
  );
}

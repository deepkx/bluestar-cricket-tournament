import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PublicAdminPublishDock } from '../components/admin/PublicAdminPublishDock';
import { FixturesGroupTable } from '../components/fixtures/FixturesGroupTable';
import { FixturesGroupTabs } from '../components/fixtures/FixturesGroupTabs';
import { PoolKnockoutBracket } from '../components/fixtures/PoolKnockoutBracket';
import { buildPoolBracket } from '../utils/poolBracketModel';
import { PublishCountdownScreen } from '../components/publish/PublishCountdownScreen';
import { fetchPublicFixtures, fetchPublicPools, type FixtureRow, type PoolBoard } from '../data/pools';
import { listConfirmedTeams } from '../data/teams';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { useBoardDrawReveal } from '../hooks/useBoardDrawReveal';
import { useFixturesPoolReveal } from '../hooks/useFixturesPoolReveal';
import { useSiteConfigPoll } from '../hooks/useSiteConfigPoll';
import { groupFixturesByPool } from '../utils/fixtureDisplay';

const POOL_ORDER = ['A', 'B', 'C', 'D'] as const;

export function FixturesPage() {
  const { tournament, refresh } = useSiteConfigPoll();
  const [matches, setMatches] = useState<FixtureRow[]>([]);
  const [decoyNames, setDecoyNames] = useState<string[]>([]);
  const [activePool, setActivePool] = useState<string>('A');
  const [poolBoards, setPoolBoards] = useState<PoolBoard[]>([]);

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

  const animating = phase === 'animating' && matches.length > 0;
  const revealed = phase === 'revealed';

  const poolReveal = useFixturesPoolReveal(animating);

  useEffect(() => {
    void listConfirmedTeams().then((teams) => setDecoyNames(teams.map((x) => x.teamName)));
  }, []);

  useEffect(() => {
    if (!contentUnlocked) {
      setMatches([]);
      setPoolBoards([]);
      return;
    }
    Promise.all([fetchPublicFixtures(), fetchPublicPools()])
      .then(([rows, boards]) => {
        setMatches(rows);
        setPoolBoards(boards);
      })
      .catch(() => {
        setMatches([]);
        setPoolBoards([]);
      });
  }, [contentUnlocked]);

  useEffect(() => {
    if (!animating || poolReveal.reduceMotion) return;
    setActivePool(poolReveal.activePool);
  }, [animating, poolReveal.activePool, poolReveal.reduceMotion]);

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

  const byPool = useMemo(() => groupFixturesByPool(matches), [matches]);

  const poolCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const code of POOL_ORDER) {
      m.set(code, (byPool.get(code) ?? []).length);
    }
    return m;
  }, [byPool]);

  const activeIndex = POOL_ORDER.indexOf(activePool as (typeof POOL_ORDER)[number]);
  const sectionIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeFixtures = byPool.get(activePool) ?? [];
  const activeBracket = useMemo(() => buildPoolBracket(activeFixtures), [activeFixtures]);
  const activeSeeds = useMemo(() => {
    const board = poolBoards.find((b) => b.poolCode === activePool);
    return board?.slots ?? [];
  }, [poolBoards, activePool]);

  const revealLive = animating && !poolReveal.reduceMotion;

  if (!tournament) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-ink-deep text-paper/40">Loading…</div>
    );
  }

  const adminBar = <PublicAdminPublishDock preset="fixtures" onUpdated={refresh} />;
  const showIdle = boardPhase === 'idle' && !contentUnlocked;

  if (countdownLive) {
    return (
      <PublishCountdownScreen
        pageTitle="Fixtures"
        headline="Fixtures countdown"
        targetIso={revealIso}
        timezone={timezone}
        adminBar={adminBar}
        fixturesFinale
      />
    );
  }

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Schedule"
        title="Fixtures"
        lead="Pool knockout brackets with advancing arrows — plus match-time sheet below each pool."
      />

      <PublicPageContent width="2xl">
        {adminBar ? <div className="mb-8">{adminBar}</div> : null}

        {showIdle ? (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            The fixture list has not opened yet. Check back when the committee starts the countdown.
          </p>
        ) : null}

        {!showIdle && matches.length > 0 ? (
          <div className="mt-10 sm:mt-12">
            {revealLive ? (
              <motion.p
                className="hud-label mb-6 text-center text-floodlight-bright"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                key={poolReveal.activePool}
              >
                Live reveal — Pool {poolReveal.activePool} ({poolReveal.poolIndex + 1}/{poolReveal.poolCount})
              </motion.p>
            ) : null}
            <FixturesGroupTabs
              active={activePool}
              onChange={setActivePool}
              counts={poolCounts}
              revealLocked={revealLive}
              revealPoolIndex={poolReveal.poolIndex}
            />
            <div
              className="mt-0"
              role="tabpanel"
              id={`fixtures-panel-${activePool}`}
              aria-labelledby={`fixtures-tab-${activePool}`}
            >
              <PoolKnockoutBracket
                poolCode={activePool}
                model={activeBracket}
                seeds={activeSeeds}
                revealActive={revealLive}
                revealTick={poolReveal.revealTick}
                revealed={revealed || poolReveal.reduceMotion}
              />
              <div className="mt-8">
                <p className="mb-3 px-1 text-xs uppercase tracking-widest text-paper/45">Match times</p>
                <FixturesGroupTable
                  poolCode={activePool}
                  fixtures={activeFixtures}
                  poolFixtures={activeFixtures}
                  animating={animating}
                  decoyNames={decoyNames}
                  sectionIndex={sectionIndex}
                  revealed={revealed}
                  revealTick={poolReveal.revealTick}
                />
              </div>
            </div>
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

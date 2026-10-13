import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PublicAdminPublishDock } from '../components/admin/PublicAdminPublishDock';
import type { DrawTeamInfo } from '../components/draw/DrawTeamChip';
import { PoolDrawStaticGrid, SequentialPoolDraw } from '../components/draw/SequentialPoolDraw';
import { PublishCountdownScreen } from '../components/publish/PublishCountdownScreen';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { listConfirmedTeams } from '../data/teams';
import { adminLoadPoolBoard, fetchPublicPools, POOL_CODES, type PoolBoard } from '../data/pools';
import { adminSetPoolsBoardPhase } from '../data/sitePublish';
import { useAdminSession } from '../hooks/useAdminSession';
import { useBoardDrawReveal } from '../hooks/useBoardDrawReveal';
import { useSiteConfigPoll } from '../hooks/useSiteConfigPoll';
import type { TeamPublic } from '../types/api';

function emptyBoards(): PoolBoard[] {
  return POOL_CODES.map((poolCode) => ({
    poolCode,
    slots: Array.from({ length: 10 }, (_, i) => ({
      slotOrder: i + 1,
      teamId: null,
      teamName: null,
    })),
  }));
}

export function PoolsPage() {
  const isAdmin = useAdminSession();
  const location = useLocation();
  const navigate = useNavigate();
  const { tournament, refresh } = useSiteConfigPoll();
  const [pools, setPools] = useState<PoolBoard[]>([]);
  const [drawTeams, setDrawTeams] = useState<DrawTeamInfo[]>([]);
  const [allTeamNames, setAllTeamNames] = useState<string[]>([]);
  const [loadErr, setLoadErr] = useState('');
  const [poolsLoaded, setPoolsLoaded] = useState(false);
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [drawRunKey, setDrawRunKey] = useState(0);

  const boardPhase = tournament?.poolsBoardPhase ?? 'idle';
  const timezone = tournament?.timezone ?? 'Asia/Kolkata';
  const revealIso = tournament?.poolsRevealAt ?? null;

  const drawSessionKey = `bluestar-pools-reveal-r${tournament?.poolsDrawRun ?? 0}`;

  const { phase, completeAnimation, replayAnimation, countdownLive, contentUnlocked } = useBoardDrawReveal({
    revealIso,
    timezone,
    sessionKey: drawSessionKey,
    boardPhase,
  });

  const triggerServerAnimation = useCallback(() => {
    void adminSetPoolsBoardPhase('animating').then(() => {
      refresh();
      replayAnimation();
      setDrawRunKey((k) => k + 1);
    });
  }, [refresh, replayAnimation]);

  useEffect(() => {
    if (!contentUnlocked) {
      setPoolsLoaded(false);
      setTeamsLoaded(false);
      return;
    }
    setLoadErr('');
    listConfirmedTeams()
      .then((teams: TeamPublic[]) => {
        setDrawTeams(teams.map((t) => ({ teamName: t.teamName, logoUrl: t.logoUrl })));
        setAllTeamNames(teams.map((t) => t.teamName));
      })
      .catch(() => {
        setDrawTeams([]);
        setAllTeamNames([]);
      })
      .finally(() => setTeamsLoaded(true));

    const loadPools = async () => {
      if (isAdmin && boardPhase === 'animating') {
        return adminLoadPoolBoard();
      }
      const data = await fetchPublicPools();
      return data.length > 0 ? data : emptyBoards();
    };

    void loadPools()
      .then((data) => setPools(data.length > 0 ? data : emptyBoards()))
      .catch(() => {
        setLoadErr('Could not load pool draw.');
        setPools(emptyBoards());
      })
      .finally(() => setPoolsLoaded(true));
  }, [contentUnlocked, isAdmin, boardPhase]);

  useEffect(() => {
    setDrawRunKey((k) => k + 1);
  }, [tournament?.poolsDrawRun]);

  useEffect(() => {
    const play = (location.state as { playPoolDraw?: boolean } | null)?.playPoolDraw;
    if (!play || !isAdmin) return;
    triggerServerAnimation();
    navigate(location.pathname, { replace: true, state: null });
  }, [isAdmin, location.pathname, location.state, navigate, triggerServerAnimation]);

  const boards = pools.length > 0 ? pools : emptyBoards();

  const finalNamesByPool = useMemo(
    () =>
      boards.map((b) =>
        Array.from({ length: 10 }, (_, i) => b.slots.find((s) => s.slotOrder === i + 1)?.teamName ?? ''),
      ),
    [boards],
  );

  const drawReady = poolsLoaded && teamsLoaded && !loadErr;
  const drawPlaying = phase === 'animating';
  const adminBar = <PublicAdminPublishDock preset="pools" onUpdated={refresh} />;

  if (!tournament) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-ink-deep text-paper/40">Loading…</div>
    );
  }

  if (countdownLive) {
    return (
      <PublishCountdownScreen
        pageTitle="Pools"
        headline="Pool draw countdown"
        targetIso={revealIso}
        timezone={timezone}
        adminBar={adminBar}
      />
    );
  }

  const showIdle = boardPhase === 'idle' && !contentUnlocked;

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Draw"
        title="Pools"
        lead="When the countdown hits zero, our cricket hero pulls the draw lever — pool by pool from A to D — until every slot is filled."
      />

      <PublicPageContent width="2xl">
        {adminBar ? <div className="mb-8">{adminBar}</div> : null}

        {showIdle ? (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            The pool draw has not started yet. Check back when the committee opens the countdown.
          </p>
        ) : null}

        {!showIdle && phase === 'animating' && !drawReady ? (
          <p className="mt-14 text-center text-sm text-paper/50">Preparing draw…</p>
        ) : null}

        {!showIdle && phase === 'animating' && drawReady ? (
          <div className="mt-10 sm:mt-12">
            <SequentialPoolDraw
              key={drawRunKey}
              finalNamesByPool={finalNamesByPool}
              allTeamNames={allTeamNames}
              drawTeams={drawTeams}
              onComplete={completeAnimation}
            />
          </div>
        ) : null}

        {!showIdle && phase === 'revealed' ? (
          <div className="mt-8 sm:mt-10">
            {loadErr ? <p className="mb-6 text-center text-sm text-red-300">{loadErr}</p> : null}
            <PoolDrawStaticGrid finalNamesByPool={finalNamesByPool} drawTeams={drawTeams} />
            {isAdmin && !drawPlaying ? (
              <p className="mt-8 text-center">
                <button type="button" className="btn-outline text-sm" onClick={() => triggerServerAnimation()}>
                  Replay draw animation
                </button>
                <span className="mx-2 text-paper/30">·</span>
                <Link to="/admin/pools" className="text-sm text-floodlight-dim underline hover:text-floodlight-bright">
                  Edit pools
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
      </PublicPageContent>
    </div>
  );
}

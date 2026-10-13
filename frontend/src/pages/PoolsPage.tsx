import { useEffect, useMemo, useState } from 'react';
import { PoolColumnReveal } from '../components/draw/DrawShuffleReveal';
import { getCurrentTournament } from '../data/tournament';
import { listConfirmedTeams } from '../data/teams';
import { fetchPublicPools, POOL_CODES, type PoolBoard } from '../data/pools';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { RevealCountdownBlock } from '../components/ui/RevealCountdownBlock';
import { resolvePoolsFixturesRevealIso } from '../content/homeEvent';
import { useDrawReveal } from '../hooks/useDrawReveal';
import type { TournamentPublic } from '../types/api';

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
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [pools, setPools] = useState<PoolBoard[]>([]);
  const [allTeamNames, setAllTeamNames] = useState<string[]>([]);
  const [loadErr, setLoadErr] = useState('');

  const revealIso = tournament ? resolvePoolsFixturesRevealIso(tournament.fixtureAnnouncementAt) : null;
  const { phase, completeAnimation, revealed } = useDrawReveal(
    revealIso,
    tournament?.timezone ?? 'Asia/Kolkata',
    'bluestar-pools-reveal-v1',
  );

  useEffect(() => {
    getCurrentTournament().then(setTournament);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    listConfirmedTeams()
      .then((teams) => setAllTeamNames(teams.map((t) => t.teamName)))
      .catch(() => {});
    fetchPublicPools()
      .then((data) => setPools(data.length > 0 ? data : emptyBoards()))
      .catch(() => setLoadErr('Could not load pool draw.'));
  }, [revealed]);

  const boards = pools.length > 0 ? pools : emptyBoards();
  const [poolsAnimated, setPoolsAnimated] = useState(0);

  useEffect(() => {
    if (phase !== 'animating') setPoolsAnimated(0);
  }, [phase]);

  useEffect(() => {
    if (phase === 'animating' && poolsAnimated >= POOL_CODES.length) {
      completeAnimation();
    }
  }, [phase, poolsAnimated, completeAnimation]);

  const showSection = phase !== 'waiting';

  const finalNamesByPool = useMemo(
    () =>
      boards.map((b) =>
        Array.from({ length: 10 }, (_, i) => b.slots.find((s) => s.slotOrder === i + 1)?.teamName ?? ''),
      ),
    [boards],
  );

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
        lead="Four pools of ten teams. Assignments shuffle live when the countdown hits zero."
      />

      <PublicPageContent width="lg">
        <RevealCountdownBlock
          targetIso={tournament.fixtureAnnouncementAt}
          timezone={tournament.timezone}
          headline="Pool draw countdown"
        />

        {!showSection ? (
          <p className="mt-14 text-center text-sm leading-relaxed text-paper/50 sm:mt-16">
            Pool tables unlock when the countdown above reaches zero — then the live draw animation runs.
          </p>
        ) : null}

        {showSection ? (
          <div className="mt-14 sm:mt-16">
            {phase === 'animating' ? (
              <p className="hud-label mb-6 text-center text-floodlight-bright">Live draw — shuffling teams…</p>
            ) : (
              <p className="hud-label text-center">Pool assignments</p>
            )}
            {loadErr ? <p className="mt-6 text-center text-sm text-red-300">{loadErr}</p> : null}
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {POOL_CODES.map((code, idx) => (
                <PoolColumnReveal
                  key={code}
                  phase={phase === 'animating' ? 'animating' : 'revealed'}
                  poolCode={code}
                  teamNames={allTeamNames}
                  finalTeamNames={finalNamesByPool[idx] ?? []}
                  onPoolAnimationDone={() => setPoolsAnimated((n) => n + 1)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </PublicPageContent>
    </div>
  );
}

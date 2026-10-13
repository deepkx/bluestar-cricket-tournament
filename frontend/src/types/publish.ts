export type TeamsBoardPhase = 'idle' | 'animating' | 'visible';

export type PoolsFixturesBoardPhase = 'idle' | 'countdown' | 'animating' | 'visible';

export type SitePublishState = {
  teamsBoardPhase: TeamsBoardPhase;
  poolsBoardPhase: PoolsFixturesBoardPhase;
  fixturesBoardPhase: PoolsFixturesBoardPhase;
  poolsRevealAt: string | null;
  fixturesRevealAt: string | null;
};

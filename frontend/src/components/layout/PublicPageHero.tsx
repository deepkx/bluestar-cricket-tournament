import type { ReactNode } from 'react';
import { PitchOvalCrease } from '../ui/PitchOvalCrease';
import { PublicPageSideScenery } from './PublicPageSideScenery';

type Props = {
  kicker?: string;
  title: string;
  lead?: ReactNode;
  sideScenery?: boolean;
  sideSceneryVariant?: 'photos' | 'heroes';
};

export function PublicPageHero({
  kicker,
  title,
  lead,
  sideScenery = false,
  sideSceneryVariant = 'photos',
}: Props) {
  return (
    <header className="relative overflow-hidden border-b border-paper/10 bg-ink-deep px-4 py-16 sm:py-20 md:py-24">
      {sideScenery ? (
        <PublicPageSideScenery fadeToCenter={false} variant={sideSceneryVariant} />
      ) : (
        <>
          <div className="pitch-floor pointer-events-none absolute inset-0" />
          <PitchOvalCrease tone="dark" variant="section" className="opacity-35" />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-60" />
          <div className="floodlight-sweep pointer-events-none absolute inset-0 opacity-20" />
        </>
      )}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {kicker ? <p className="hud-label">{kicker}</p> : null}
        <h1 className={`font-display text-3xl tracking-wide sm:text-4xl md:text-5xl ${kicker ? 'mt-2' : ''}`}>
          {title}
        </h1>
        {lead ? <div className="mt-5 text-sm leading-relaxed text-paper/65 sm:text-base">{lead}</div> : null}
      </div>
    </header>
  );
}

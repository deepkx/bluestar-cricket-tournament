import type { ReactNode } from 'react';
import { RevealCountdownBlock } from '../ui/RevealCountdownBlock';
import { FixturesCountdownFinale } from './FixturesCountdownFinale';

type Props = {
  pageTitle: string;
  headline: string;
  targetIso: string | null | undefined;
  timezone: string;
  subline?: string;
  adminBar?: ReactNode;
  /** Fixtures page: pulse + sweep in the last 10 seconds. */
  fixturesFinale?: boolean;
};

/** Full-viewport countdown — no hero or other page chrome. */
export function PublishCountdownScreen({
  pageTitle,
  headline,
  targetIso,
  timezone,
  subline,
  adminBar,
  fixturesFinale = false,
}: Props) {
  const block = (
    <RevealCountdownBlock
      targetIso={targetIso}
      timezone={timezone}
      headline={headline}
      subline={subline}
      secondsEmphasis={fixturesFinale}
    />
  );

  return (
    <div className="flex min-h-[min(100dvh,100vh)] flex-col items-center justify-center bg-ink-deep px-4 py-10">
      <p className="hud-label mb-6 text-floodlight-dim">{pageTitle}</p>
      <div className="w-full max-w-xl">
        {fixturesFinale ? (
          <FixturesCountdownFinale targetIso={targetIso} timezone={timezone}>
            {block}
          </FixturesCountdownFinale>
        ) : (
          block
        )}
      </div>
      {adminBar ? <div className="mt-10 w-full max-w-xl">{adminBar}</div> : null}
    </div>
  );
}

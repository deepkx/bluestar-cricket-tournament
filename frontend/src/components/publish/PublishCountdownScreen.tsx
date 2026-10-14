import type { ReactNode } from 'react';
import { RevealCountdownBlock } from '../ui/RevealCountdownBlock';
import { PublishCountdownFinale, type PublishFinaleMode } from './PublishCountdownFinale';

type Props = {
  pageTitle: string;
  headline: string;
  targetIso: string | null | undefined;
  timezone: string;
  subline?: string;
  adminBar?: ReactNode;
  /** Last-10s broadcast finale for pools or fixtures. */
  finaleMode?: PublishFinaleMode;
};

/** Full-viewport countdown — no hero or other page chrome. */
export function PublishCountdownScreen({
  pageTitle,
  headline,
  targetIso,
  timezone,
  subline,
  adminBar,
  finaleMode,
}: Props) {
  const block = (
    <RevealCountdownBlock
      targetIso={targetIso}
      timezone={timezone}
      headline={headline}
      subline={subline}
      secondsEmphasis={Boolean(finaleMode)}
      finaleMode={finaleMode}
    />
  );

  return (
    <div className="flex min-h-[min(100dvh,100vh)] flex-col items-center justify-center bg-ink-deep px-4 py-10">
      <p className="hud-label mb-6 text-floodlight-dim">{pageTitle}</p>
      <div className="w-full max-w-xl">
        {finaleMode ? (
          <PublishCountdownFinale targetIso={targetIso} timezone={timezone} mode={finaleMode}>
            {block}
          </PublishCountdownFinale>
        ) : (
          block
        )}
      </div>
      {adminBar ? <div className="mt-10 w-full max-w-xl">{adminBar}</div> : null}
    </div>
  );
}

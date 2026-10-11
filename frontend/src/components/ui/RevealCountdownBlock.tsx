import { HOME_EVENT, resolvePoolsFixturesRevealIso } from '../../content/homeEvent';
import { useCountdown } from '../../hooks/useCountdown';
import { CountdownDisplay } from './CountdownDisplay';

type Props = {
  targetIso: string | null | undefined;
  timezone: string;
  headline: string;
  subline?: string;
};

export function RevealCountdownBlock({ targetIso, timezone, headline, subline }: Props) {
  const resolved = resolvePoolsFixturesRevealIso(targetIso);
  const cd = useCountdown(resolved, timezone);
  if (cd?.expired) return null;

  return (
    <div className="rounded-sm border border-paper/15 bg-turf/40 px-6 py-10 sm:px-10 sm:py-12">
      <p className="hud-label text-center">{headline}</p>
      <p className="mt-2 text-center text-sm text-paper/60">
        {subline ?? HOME_EVENT.poolsFixturesRevealLabel}
      </p>
      <div className="mt-8 flex justify-center">
        <CountdownDisplay
          targetIso={resolved}
          timezone={timezone}
          large
          variant="hud"
          align="center"
          hudLabel={`Reveals in · ${timezone.replace(/_/g, ' ')}`}
          showFixturesLinkWhenExpired={false}
          expiredMessage="Published"
          className="max-w-full items-center"
        />
      </div>
    </div>
  );
}

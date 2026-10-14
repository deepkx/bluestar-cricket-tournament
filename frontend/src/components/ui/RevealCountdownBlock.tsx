import { HOME_EVENT } from '../../content/homeEvent';
import type { PublishFinaleMode } from '../publish/PublishCountdownFinale';
import { useCountdown } from '../../hooks/useCountdown';
import { countdownTotalSeconds } from '../../utils/fixtureResults';
import { CountdownDisplay } from './CountdownDisplay';

type Props = {
  targetIso: string | null | undefined;
  timezone: string;
  headline: string;
  subline?: string;
  /** When false, do not fall back to marketing default date (admin must start countdown). */
  useDefaultWhenUnset?: boolean;
  /** Enlarge + gold seconds in final stretch (used with PublishCountdownFinale). */
  secondsEmphasis?: boolean;
  finaleMode?: PublishFinaleMode;
};

export function RevealCountdownBlock({
  targetIso,
  timezone,
  headline,
  subline,
  useDefaultWhenUnset = false,
  secondsEmphasis = false,
  finaleMode,
}: Props) {
  const resolved =
    targetIso ?? (useDefaultWhenUnset ? HOME_EVENT.poolsFixturesRevealIso : null);
  const cd = useCountdown(resolved ?? undefined, timezone);
  if (!resolved || cd?.expired) return null;

  const totalSec = cd ? countdownTotalSeconds(cd) : 0;
  const finale = secondsEmphasis && cd && totalSec <= 10 && totalSec > 0;

  const finaleSubline =
    finaleMode === 'pools'
      ? 'Ten teams per pool — the draw animation starts next.'
      : finaleMode === 'fixtures'
        ? 'Knockout brackets and match times are almost live.'
        : 'Almost live.';

  return (
    <>
      {!finale ? <p className="hud-label text-center">{headline}</p> : null}
      <p className={`text-center text-sm text-paper/60 ${finale ? 'mt-0' : 'mt-2'}`}>
        {finale ? finaleSubline : (subline ?? HOME_EVENT.poolsFixturesRevealLabel)}
      </p>
      <div className={`flex justify-center ${finale ? 'mt-4 opacity-90' : 'mt-8'}`}>
        <CountdownDisplay
          targetIso={resolved}
          timezone={timezone}
          large
          variant="hud"
          align="center"
          hudLabel={finale ? 'Full clock' : `Reveals in · ${timezone.replace(/_/g, ' ')}`}
          showFixturesLinkWhenExpired={false}
          expiredMessage="Published"
          className={`max-w-full items-center ${finale ? 'scale-[0.92] [&_.font-display]:text-floodlight-bright' : ''}`}
          finalePulse={Boolean(finale)}
          finaleCompact={Boolean(finale)}
        />
      </div>
    </>
  );
}

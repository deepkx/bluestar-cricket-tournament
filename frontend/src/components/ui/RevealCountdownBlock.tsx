import { HOME_EVENT } from '../../content/homeEvent';
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
  /** Enlarge + gold seconds in final stretch (used with FixturesCountdownFinale). */
  secondsEmphasis?: boolean;
};

export function RevealCountdownBlock({
  targetIso,
  timezone,
  headline,
  subline,
  useDefaultWhenUnset = false,
  secondsEmphasis = false,
}: Props) {
  const resolved =
    targetIso ?? (useDefaultWhenUnset ? HOME_EVENT.poolsFixturesRevealIso : null);
  const cd = useCountdown(resolved ?? undefined, timezone);
  if (!resolved || cd?.expired) return null;

  const finale = secondsEmphasis && cd && countdownTotalSeconds(cd) <= 10 && countdownTotalSeconds(cd) > 0;

  return (
    <>
      <p className="hud-label text-center">{headline}</p>
      <p className="mt-2 text-center text-sm text-paper/60">
        {finale ? 'Knockout brackets and match times are almost live.' : (subline ?? HOME_EVENT.poolsFixturesRevealLabel)}
      </p>
      <div className="mt-8 flex justify-center">
        <CountdownDisplay
          targetIso={resolved}
          timezone={timezone}
          large
          variant="hud"
          align="center"
          hudLabel={finale ? 'Going live' : `Reveals in · ${timezone.replace(/_/g, ' ')}`}
          showFixturesLinkWhenExpired={false}
          expiredMessage="Published"
          className={`max-w-full items-center ${finale ? '[&_.font-display]:text-floodlight-bright' : ''}`}
          finalePulse={Boolean(finale)}
        />
      </div>
    </>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCountdown } from '../../hooks/useCountdown';

type Props = {
  targetIso: string | null | undefined;
  timezone: string;
  large?: boolean;
  dark?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
  variant?: 'default' | 'hud';
  size?: 'default' | 'section';
  hudLabel?: string;
  expiredMessage?: string;
  showFixturesLinkWhenExpired?: boolean;
  finalePulse?: boolean;
  /** In finale: hide days/hours/minutes so seconds hero sits above. */
  finaleCompact?: boolean;
};

export function CountdownDisplay({
  targetIso,
  timezone,
  large = false,
  dark = false,
  align = 'start',
  className = '',
  variant = 'default',
  size = 'default',
  hudLabel,
  expiredMessage = 'Underway',
  showFixturesLinkWhenExpired = true,
  finalePulse = false,
  finaleCompact = false,
}: Props) {
  const cd = useCountdown(targetIso, timezone);
  const fg = dark ? 'text-ink' : 'text-paper';
  const muted = dark ? 'text-ink/45' : 'text-paper/45';

  if (!targetIso) {
    return (
      <p className={`text-sm font-medium ${dark ? 'text-ink/55' : 'text-paper/55'}`}>
        Tournament start time will be announced soon.
      </p>
    );
  }

  if (cd?.expired) {
    return (
      <div className={align === 'center' ? 'text-center' : ''}>
        <p className={`font-display text-3xl tracking-wide ${fg}`}>{expiredMessage}</p>
        {showFixturesLinkWhenExpired ? (
          <Link to="/fixtures" className={`mt-3 inline-block text-sm font-medium underline ${muted}`}>
            View fixtures
          </Link>
        ) : null}
      </div>
    );
  }

  if (!cd) return null;

  const parts = finaleCompact
    ? [{ v: cd.seconds, l: 's', key: 's', animate: true }]
    : [
        { v: cd.days, l: 'd', key: 'd' },
        { v: cd.hours, l: 'h', key: 'h' },
        { v: cd.minutes, l: 'm', key: 'm' },
        { v: cd.seconds, l: 's', key: 's', animate: true },
      ];

  const digitSize = large
    ? size === 'section'
      ? 'text-[clamp(2.5rem,14vw,7.5rem)] leading-none'
      : 'text-[clamp(2rem,11vw,6rem)] leading-none'
    : 'text-3xl sm:text-4xl md:text-5xl leading-none';

  const alignClass =
    align === 'center' ? 'items-center text-center' : align === 'end' ? 'items-end text-right' : 'items-start text-left';

  const colonLarge = 'text-xl opacity-30 sm:text-2xl md:text-4xl';

  const labelClass = variant === 'hud' ? 'hud-label mb-2 sm:mb-3' : `mb-2 max-w-full text-[11px] font-medium sm:mb-3 sm:text-xs ${muted}`;
  const tzLabel = timezone.replace(/_/g, ' ');
  const labelText =
    hudLabel ??
    (size === 'section'
      ? `Tournament starts in · ${tzLabel}`
      : variant === 'hud'
        ? `First ball · ${tzLabel}`
        : `First ball · ${tzLabel}`);

  const inner = (
    <>
      <p className={labelClass}>{labelText}</p>
      <div
        className={`flex max-w-full flex-wrap items-baseline gap-x-1 gap-y-1 font-display tabular-nums sm:gap-x-2 ${fg} ${
          align === 'center' ? 'justify-center' : align === 'end' ? 'justify-end lg:justify-end' : 'justify-start'
        }`}
      >
        {parts.map((p, i) => (
          <span key={p.key} className="inline-flex shrink-0 items-baseline">
            {i > 0 && (
              <span className={`mx-0.5 sm:mx-1 ${large ? colonLarge : 'text-xl opacity-30 sm:text-2xl'}`}>:</span>
            )}
            <span
              className={`inline-flex items-baseline overflow-hidden ${digitSize} ${
                finalePulse && p.key === 's' ? 'text-floodlight-bright' : ''
              }`}
            >
              {p.animate ? (
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={p.v}
                    initial={{ y: 12, opacity: 0, scale: finalePulse ? 1.15 : 1 }}
                    animate={{ y: 0, opacity: 1, scale: finalePulse && p.key === 's' ? [1.08, 1.2, 1.08] : 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{
                      duration: finalePulse && p.key === 's' ? 0.28 : 0.2,
                      repeat: 0,
                    }}
                  >
                    {String(p.v).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              ) : (
                String(p.v).padStart(2, '0')
              )}
            </span>
            <span className={`ml-0.5 text-base opacity-40 sm:text-lg ${large ? 'sm:text-xl md:text-2xl' : ''}`}>
              {p.l}
            </span>
          </span>
        ))}
      </div>
    </>
  );

  if (variant === 'hud') {
    return (
      <div className={`scoreboard-frame scoreboard-frame-funk flex max-w-full flex-col ${alignClass} ${className}`}>
        {inner}
      </div>
    );
  }

  return <div className={`flex max-w-full flex-col ${alignClass} ${className}`}>{inner}</div>;
}

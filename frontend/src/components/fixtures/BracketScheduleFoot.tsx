import type { FixtureRow } from '../../data/pools';
import {
  fixtureDisplayOpponentA,
  fixtureDisplayOpponentB,
  fixtureMatchCode,
  formatFixtureDate,
  formatFixtureTimeWindow,
} from '../../utils/fixtureDisplay';

type Props = {
  poolCode: string;
  fixtures: FixtureRow[];
};

/** Compact schedule block — included under bracket for copy-to-image. */
export function BracketScheduleFoot({ poolCode, fixtures }: Props) {
  if (fixtures.length === 0) return null;

  const sorted = [...fixtures].sort((a, b) => a.matchOrder - b.matchOrder);
  const withTime = sorted.filter((f) => f.scheduledAt);
  const later = sorted.filter((f) => !f.scheduledAt);

  return (
    <div className="border-t border-paper/12 bg-ink-deep/90 px-5 py-4 sm:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-floodlight-bright">
        Pool {poolCode} — match day &amp; times
      </p>
      {withTime.length > 0 ? (
        <ul className="mt-3 divide-y divide-paper/10 text-sm">
          {withTime.map((row, i) => {
            const prevDate = i > 0 ? formatFixtureDate(withTime[i - 1]?.scheduledAt ?? null) : null;
            const dateKey = formatFixtureDate(row.scheduledAt);
            const showDate = dateKey !== prevDate;
            return (
              <li key={row.id} className="py-2.5">
                {showDate ? (
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-paper/45">{dateKey}</p>
                ) : null}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-semibold text-paper">{fixtureMatchCode(row.label, i + 1)}</span>
                  <span className="font-semibold tabular-nums text-floodlight-bright">
                    {formatFixtureTimeWindow(row.scheduledAt)}
                  </span>
                  <span className="text-paper/70">
                    {fixtureDisplayOpponentA(row, fixtures)} vs {fixtureDisplayOpponentB(row, fixtures)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {later.length > 0 ? (
        <ul className="mt-3 space-y-1.5 border-t border-paper/10 pt-3 text-sm text-paper/55">
          {later.map((row, i) => (
            <li key={row.id}>
              <span className="font-semibold text-paper/70">{fixtureMatchCode(row.label, i + 1)}</span>
              <span className="mx-2 text-paper/35">·</span>
              <span>Day &amp; time TBC</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

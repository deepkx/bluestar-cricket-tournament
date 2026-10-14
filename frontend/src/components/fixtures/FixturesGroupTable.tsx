import { Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fixtureRevealFlavor } from './fixturesRevealRandom';
import type { FixtureRow } from '../../data/pools';
import {
  fixtureDisplayOpponentB,
  fixtureMatchCode,
  fixtureOpponentA,
  fixtureRoundTag,
  formatFixtureDate,
  formatFixtureTimeWindow,
  POOL_FIXTURE_META,
} from '../../utils/fixtureDisplay';
import { fixtureSideEliminated } from '../../utils/fixtureResults';

function TeamName({
  name,
  animating,
  eliminated,
}: {
  name: string;
  animating: boolean;
  eliminated?: boolean;
}) {
  const placeholder = name === 'TBD' || name.startsWith('Winner') || !name.trim();
  if (placeholder) {
    return (
      <span
        className={`text-base font-medium ${eliminated ? 'text-paper/35 line-through' : 'text-paper/55'}`}
      >
        {name || 'TBD'}
      </span>
    );
  }
  return (
    <Link
      to={`/teams/${encodeURIComponent(name)}`}
      className={`font-medium hover:text-floodlight-bright hover:underline ${
        eliminated
          ? 'text-paper/35 line-through decoration-paper/50'
          : animating
            ? 'text-floodlight-bright'
            : 'text-paper'
      }`}
    >
      {name}
    </Link>
  );
}

type Props = {
  poolCode: string;
  fixtures: FixtureRow[];
  animating: boolean;
  revealed: boolean;
  revealTick?: number;
  poolFixtures?: FixtureRow[];
};

function RoundBadge({ label }: { label: string | null }) {
  const tag = fixtureRoundTag(label);
  const r2OrFinal = tag.startsWith('R2') || tag === 'Final';
  return (
    <span
      className={`inline-block rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
        r2OrFinal ? 'bg-floodlight text-black' : 'bg-electric text-ink-deep'
      }`}
    >
      {tag}
    </span>
  );
}

function ScheduleTable({
  rows,
  poolFixtures,
  animating,
  showContent,
  rowDelayJitter,
  rowEase,
}: {
  rows: FixtureRow[];
  poolFixtures: FixtureRow[];
  animating: boolean;
  showContent: boolean;
  rowDelayJitter: number[];
  rowEase: [number, number, number, number];
}) {
  return (
    <table className="w-full min-w-[720px] border-collapse text-base">
      <thead>
        <tr className="border-b-2 border-paper/15 bg-ink-deep/60 text-xs uppercase tracking-wider text-paper/60">
          <th className="px-5 py-4 text-left font-bold">Match</th>
          <th className="px-5 py-4 text-left font-bold">Start · 45 min slot</th>
          <th className="px-5 py-4 text-left font-bold">Teams</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const teamA = fixtureOpponentA(row);
          const teamB = fixtureDisplayOpponentB(row, poolFixtures);
          const eliminatedA = fixtureSideEliminated(row, 'A', poolFixtures);
          const eliminatedB = fixtureSideEliminated(row, 'B', poolFixtures);
          const dateKey = formatFixtureDate(row.scheduledAt);
          const prevDate = i > 0 ? formatFixtureDate(rows[i - 1]?.scheduledAt ?? null) : null;
          const showDateHeader = dateKey !== prevDate;
          const code = fixtureMatchCode(row.label, i + 1);

          return (
            <Fragment key={row.id}>
              {showDateHeader ? (
                <tr className="border-b border-paper/10 bg-floodlight/10">
                  <td colSpan={3} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-floodlight-bright">
                    {dateKey}
                  </td>
                </tr>
              ) : null}
              <motion.tr
                className="border-b border-paper/8 odd:bg-ink-deep/20"
                initial={animating ? { opacity: 0, x: (rowDelayJitter[i % rowDelayJitter.length] ?? 0) * 40 } : false}
                animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0.35, x: 0 }}
                transition={{
                  delay: animating ? i * 0.07 + (rowDelayJitter[i % rowDelayJitter.length] ?? 0) : 0,
                  duration: 0.4,
                  ease: rowEase,
                }}
              >
                <td className="whitespace-nowrap px-5 py-5">
                  <RoundBadge label={row.label} />
                  <span className="mt-2 block text-base font-bold text-paper">{code}</span>
                </td>
                <td className="whitespace-nowrap px-5 py-5 text-lg font-semibold tabular-nums text-floodlight-bright">
                  {formatFixtureTimeWindow(row.scheduledAt)}
                </td>
                <td className="px-5 py-5 text-lg leading-snug">
                  <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                    <TeamName name={teamA} animating={false} eliminated={eliminatedA} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-paper/40">vs</span>
                    <TeamName name={teamB} animating={false} eliminated={eliminatedB} />
                  </span>
                  {row.venue ? <p className="mt-1 text-xs text-paper/45">{row.venue}</p> : null}
                </td>
              </motion.tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

export function FixturesGroupTable({
  poolCode,
  fixtures,
  animating,
  revealed,
  revealTick = 0,
  poolFixtures = fixtures,
}: Props) {
  const meta = POOL_FIXTURE_META[poolCode] ?? { dayLabel: '', startNote: '', matchMinutes: 45 };
  const showContent = revealed || !animating;
  const flavor = useMemo(
    () => fixtureRevealFlavor(`${poolCode}-schedule-r${revealTick}`),
    [poolCode, revealTick],
  );

  if (fixtures.length === 0) {
    return <p className="py-12 text-center text-sm text-paper/50">No fixtures for this pool yet.</p>;
  }

  const onMatchDay = fixtures.filter((f) => f.scheduledAt);
  const laterRounds = fixtures.filter((f) => !f.scheduledAt);

  return (
    <motion.div
      data-capture-export
      className="w-max min-w-full overflow-visible border border-paper/15 bg-turf/10"
      initial={animating && !revealed ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: showContent ? 1 : 0.35, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="border-b border-paper/12 bg-ink-deep/60 px-4 py-3 sm:px-6">
        <p className="font-display text-lg text-floodlight-bright">Pool {poolCode} — match schedule</p>
        <p className="mt-0.5 text-xs uppercase tracking-widest text-paper/45">
          {meta.dayLabel} · {meta.startNote}
        </p>
      </div>

      <div className="overflow-visible p-1">
        <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-electric">
          Match day — Round 1 & 2
        </p>
        <ScheduleTable
          rows={onMatchDay}
          poolFixtures={poolFixtures}
          animating={animating}
          showContent={showContent}
          rowDelayJitter={flavor.rowDelayJitter}
          rowEase={flavor.ease}
        />
      </div>

      {laterRounds.length > 0 ? (
        <div className="overflow-visible border-t border-paper/12 bg-ink-deep/30 p-1">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-paper/55">
            Later — Round 3 & final
          </p>
          <ScheduleTable
            rows={laterRounds}
            poolFixtures={poolFixtures}
            animating={animating}
            showContent={showContent}
            rowDelayJitter={flavor.rowDelayJitter}
            rowEase={flavor.ease}
          />
        </div>
      ) : null}
    </motion.div>
  );
}

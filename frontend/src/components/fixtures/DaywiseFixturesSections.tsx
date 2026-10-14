import { Link } from 'react-router-dom';
import type { FixtureRow } from '../../data/pools';
import {
  fixtureDisplayOpponentB,
  fixtureMatchCode,
  fixtureOpponentA,
  fixtureRoundTag,
  formatFixtureTimeWindow,
} from '../../utils/fixtureDisplay';
import { fixtureSideEliminated } from '../../utils/fixtureResults';
import type { DayHalfSection } from '../../utils/fixtureDaywise';

function TeamLine({
  name,
  eliminated,
}: {
  name: string;
  eliminated?: boolean;
}) {
  const placeholder = name === 'TBD' || name.startsWith('Winner') || !name.trim();
  if (placeholder) {
    return (
      <span className={eliminated ? 'text-paper/35 line-through' : 'text-paper/55'}>{name || 'TBD'}</span>
    );
  }
  return (
    <Link
      to={`/teams/${encodeURIComponent(name)}`}
      className={`hover:text-floodlight-bright hover:underline ${
        eliminated ? 'text-paper/35 line-through' : 'text-paper'
      }`}
    >
      {name}
    </Link>
  );
}

function MatchRows({
  rows,
  poolFixturesByCode,
}: {
  rows: FixtureRow[];
  poolFixturesByCode: Map<string, FixtureRow[]>;
}) {
  if (rows.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-paper/45">No timed matches in this block yet.</p>;
  }

  return (
    <table className="w-full min-w-[640px] border-collapse text-base">
      <thead>
        <tr className="border-b border-paper/12 bg-ink-deep/50 text-xs uppercase tracking-wider text-paper/55">
          <th className="px-4 py-3 text-left font-bold sm:px-5">Pool</th>
          <th className="px-4 py-3 text-left font-bold sm:px-5">Match</th>
          <th className="px-4 py-3 text-left font-bold sm:px-5">Time (IST)</th>
          <th className="px-4 py-3 text-left font-bold sm:px-5">Teams</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const poolCode = row.poolCode ?? '';
          const poolFixtures = poolFixturesByCode.get(poolCode) ?? [];
          const teamA = row.teamAName ?? fixtureOpponentA(row);
          const teamB = row.teamBName ?? fixtureDisplayOpponentB(row, poolFixtures);
          const code = fixtureMatchCode(row.label, i + 1);
          const tag = fixtureRoundTag(row.label);

          return (
            <tr key={row.id} className="border-b border-paper/8 odd:bg-ink-deep/15">
              <td className="whitespace-nowrap px-4 py-4 font-display text-floodlight-bright sm:px-5">
                {poolCode}
              </td>
              <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                <span className="text-xs font-bold uppercase tracking-wider text-electric">{tag}</span>
                <span className="mt-1 block font-semibold text-paper">{code}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 tabular-nums text-floodlight-bright sm:px-5">
                {formatFixtureTimeWindow(row.scheduledAt)}
              </td>
              <td className="px-4 py-4 sm:px-5">
                <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                  <TeamLine name={teamA} eliminated={fixtureSideEliminated(row, 'A', poolFixtures)} />
                  <span className="text-xs uppercase text-paper/40">vs</span>
                  <TeamLine name={teamB} eliminated={fixtureSideEliminated(row, 'B', poolFixtures)} />
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

type Props = {
  sections: DayHalfSection[];
  poolFixturesByCode: Map<string, FixtureRow[]>;
};

export function DaywiseFixturesSections({ sections, poolFixturesByCode }: Props) {
  return (
    <div className="space-y-10 sm:space-y-12">
      {sections.map((section, idx) => (
        <section
          key={section.key}
          className="overflow-hidden border border-paper/15 bg-turf/10"
          aria-labelledby={`day-half-${section.key}`}
        >
          <div
            className={`border-b border-paper/12 px-4 py-4 sm:px-6 sm:py-5 ${
              idx % 2 === 0 ? 'bg-floodlight/[0.06]' : 'bg-ink-deep/60'
            }`}
          >
            <h2 id={`day-half-${section.key}`} className="font-display text-xl text-floodlight-bright sm:text-2xl">
              {section.title}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-paper/50">{section.subtitle}</p>
          </div>
          <div className="overflow-x-auto">
            <MatchRows rows={section.matches} poolFixturesByCode={poolFixturesByCode} />
          </div>
        </section>
      ))}
      <p className="text-center text-sm text-paper/45">
        Round 3, pool finals, and Showdown semis play on separate days — see{' '}
        <Link to="/fixtures" className="text-floodlight-bright underline">
          Fixtures
        </Link>{' '}
        for the full bracket.
      </p>
    </div>
  );
}

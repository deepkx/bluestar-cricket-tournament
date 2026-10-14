import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { FixtureRow } from '../../data/pools';
import {
  fixtureOpponentA,
  fixtureOpponentB,
  fixtureRoundTag,
  formatFixtureTimeWindow,
  POOL_FIXTURE_META,
} from '../../utils/fixtureDisplay';

function pickRandom(names: string[]): string {
  if (names.length === 0) return 'TBD';
  return names[Math.floor(Math.random() * names.length)] ?? 'TBD';
}

function MatchupCell({
  animating,
  decoyNames,
  revealDelayMs,
  teamA,
  teamB,
}: {
  animating: boolean;
  decoyNames: string[];
  revealDelayMs: number;
  teamA: string;
  teamB: string;
}) {
  const [a, setA] = useState(teamA);
  const [b, setB] = useState(teamB);

  useEffect(() => {
    if (!animating) {
      setA(teamA);
      setB(teamB);
      return;
    }
    setA(pickRandom(decoyNames));
    setB(pickRandom(decoyNames));
    let tick: number | undefined;
    const start = window.setTimeout(() => {
      tick = window.setInterval(() => {
        setA(pickRandom(decoyNames));
        setB(pickRandom(decoyNames));
      }, 85);
    }, revealDelayMs);
    const done = window.setTimeout(() => {
      if (tick) window.clearInterval(tick);
      setA(teamA);
      setB(teamB);
    }, revealDelayMs + 3400);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(done);
      if (tick) window.clearInterval(tick);
    };
  }, [animating, decoyNames, teamA, teamB, revealDelayMs]);

  return (
    <span className="text-paper">
      <span className={animating ? 'text-floodlight-bright' : ''}>{a}</span>
      <span className="mx-1.5 text-paper/40">vs</span>
      <span className={animating ? 'text-floodlight-bright' : ''}>{b}</span>
    </span>
  );
}

type Props = {
  poolCode: string;
  fixtures: FixtureRow[];
  animating: boolean;
  decoyNames: string[];
  sectionIndex: number;
  revealed: boolean;
};

export function PoolFixturesSection({
  poolCode,
  fixtures,
  animating,
  decoyNames,
  sectionIndex,
  revealed,
}: Props) {
  const meta = POOL_FIXTURE_META[poolCode] ?? { dayLabel: '', startNote: '', matchMinutes: 45 };
  const scheduled = fixtures.filter((f) => f.scheduledAt);
  const later = fixtures.filter((f) => !f.scheduledAt);

  const showContent = revealed || !animating;

  return (
    <motion.section
      className="border border-paper/15 bg-turf/15"
      initial={animating ? { opacity: 0, y: 16 } : false}
      animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 8 }}
      transition={{ duration: 0.55, delay: animating ? sectionIndex * 0.45 : 0 }}
    >
      <header className="border-b border-paper/12 bg-ink-deep/50 px-5 py-4 sm:px-6">
        <p className="hud-label text-floodlight-dim">Pool {poolCode}</p>
        <p className="font-display mt-1 text-xl text-floodlight-bright">Pool {poolCode} fixtures</p>
        <p className="mt-1 text-xs text-paper/55">
          {meta.dayLabel} · {meta.startNote} · {meta.matchMinutes} min per match
        </p>
      </header>

      {scheduled.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-paper/10 text-xs uppercase tracking-widest text-paper/45">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Round</th>
                <th className="px-4 py-3 font-medium">Fixture</th>
              </tr>
            </thead>
            <tbody>
              {scheduled.map((row, i) => {
                const teamA = fixtureOpponentA(row);
                const teamB = fixtureOpponentB(row);
                return (
                  <motion.tr
                    key={row.id}
                    className="border-b border-paper/8 odd:bg-ink-deep/20"
                    initial={animating ? { opacity: 0 } : false}
                    animate={showContent ? { opacity: 1 } : { opacity: 0.4 }}
                    transition={{ delay: animating ? sectionIndex * 0.45 + i * 0.08 : 0 }}
                  >
                    <td className="px-4 py-3 tabular-nums text-paper/50">{i + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-paper/70">
                      {formatFixtureTimeWindow(row.scheduledAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          fixtureRoundTag(row.label).startsWith('R2')
                            ? 'bg-floodlight/20 text-floodlight-bright'
                            : 'bg-electric/15 text-electric'
                        }`}
                      >
                        {fixtureRoundTag(row.label)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <MatchupCell
                        animating={animating && !revealed}
                        decoyNames={decoyNames}
                        revealDelayMs={(sectionIndex * 450 + i * 100)}
                        teamA={teamA}
                        teamB={teamB}
                      />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {later.length > 0 ? (
        <div className="border-t border-paper/10 px-5 py-4 sm:px-6">
          <p className="hud-label text-paper/45">Later rounds</p>
          <ul className="mt-3 space-y-2">
            {later.map((row) => (
              <li key={row.id} className="text-sm text-paper/65">
                {row.label ?? 'TBD'}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </motion.section>
  );
}

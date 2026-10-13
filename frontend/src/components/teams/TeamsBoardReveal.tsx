import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TeamSlotRow } from '../../utils/teamSlots';

function pickRandom(names: string[]): string {
  if (names.length === 0) return '…';
  return names[Math.floor(Math.random() * names.length)] ?? '…';
}

type Props = {
  rows: TeamSlotRow[];
  allNames: string[];
  animating: boolean;
};

export function TeamsBoardReveal({ rows, allNames, animating }: Props) {
  const finalLabels = useMemo(
    () =>
      rows.map((row) =>
        row.kind === 'open' ? null : row.teamName,
      ),
    [rows],
  );

  const [labels, setLabels] = useState<(string | null)[]>(finalLabels);

  useEffect(() => {
    if (!animating) {
      setLabels(finalLabels);
      return;
    }
    const tick = window.setInterval(() => {
      setLabels(
        rows.map((row) => {
          if (row.kind === 'open') return null;
          return pickRandom(allNames);
        }),
      );
    }, 90);
    const done = window.setTimeout(() => {
      window.clearInterval(tick);
      setLabels(finalLabels);
    }, 4200);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [animating, allNames, finalLabels, rows]);

  return (
    <div className="mt-6 border border-paper/15">
      <div className="grid grid-cols-[2.5rem_1fr_minmax(6.5rem,auto)] gap-3 border-b border-paper/12 bg-turf/30 px-4 py-3 text-xs font-medium uppercase tracking-widest text-paper/50 sm:grid-cols-[3rem_1fr_8.5rem] sm:gap-4 sm:px-6">
        <span>#</span>
        <span>Team</span>
        <span className="text-right sm:text-center">Squad</span>
      </div>
      <ul className="divide-y divide-paper/12">
        {rows.map((row, idx) => {
          const displayName = labels[idx];
          const rowStripe =
            row.slot % 2 === 1 ? 'bg-floodlight/[0.04]' : row.kind === 'open' ? 'bg-transparent' : 'bg-turf/15';
          const nameGold = row.slot % 2 === 1;
          const shimmer = animating && row.kind !== 'open';

          return (
            <li
              key={row.slot}
              className={`grid grid-cols-[2.5rem_1fr_minmax(6.5rem,auto)] items-center gap-3 px-4 py-3 sm:grid-cols-[3rem_1fr_8.5rem] sm:gap-4 sm:px-6 sm:py-4 ${
                row.kind === 'host' ? 'bg-floodlight/[0.08]' : rowStripe
              }`}
            >
              <span
                className={`hud-stat text-lg tabular-nums ${nameGold ? 'text-floodlight-dim' : 'text-paper/45'}`}
              >
                {row.slot}
              </span>
              <div className="min-w-0">
                {row.kind === 'open' ? (
                  <span className="text-sm text-paper/35">Open slot</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {animating ? (
                      <span
                        className={`font-display text-base tracking-wide sm:text-lg ${
                          shimmer ? 'text-floodlight-bright' : nameGold ? 'text-floodlight-bright' : 'text-paper'
                        }`}
                      >
                        {displayName ?? row.teamName}
                      </span>
                    ) : (
                      <Link
                        to={`/teams/${encodeURIComponent(row.teamName!)}`}
                        className={`font-display text-base tracking-wide hover:underline sm:text-lg ${
                          nameGold ? 'text-floodlight-bright' : 'text-paper'
                        }`}
                      >
                        {displayName ?? row.teamName}
                      </Link>
                    )}
                    {row.kind === 'host' ? (
                      <span className="funk-skew-chip border border-floodlight/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-floodlight-bright">
                        Host
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="flex justify-end sm:justify-center">
                <span className="px-2 text-xs text-paper/25">—</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

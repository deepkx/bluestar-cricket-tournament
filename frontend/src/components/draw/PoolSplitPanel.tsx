import { POOL_CODES, POOL_SLOT_COUNT } from '../../data/pools';
import type { LeverDrawPhase } from '../../hooks/usePoolLeverDraw';
import { teamInfoFromMap, type DrawTeamInfo } from './DrawTeamChip';
import { PoolBoardRow } from './PoolAssignmentBoard';
import { TeamPickCelebration } from './TeamPickCelebration';

type Props = {
  activePoolIdx: number;
  slotGrid: (string | null)[][];
  teamMap: Map<string, DrawTeamInfo>;
  phase: LeverDrawPhase;
  winnerName: string | null;
  pickIndex: number;
  targetSlotIdx: number;
};

export function PoolSplitPanel({
  activePoolIdx,
  slotGrid,
  teamMap,
  phase,
  winnerName,
  pickIndex,
  targetSlotIdx,
}: Props) {
  const flyLayoutId = winnerName ? `team-pick-${pickIndex}-${winnerName}` : '';
  const poolCode = POOL_CODES[activePoolIdx];

  return (
    <div className="flex h-full flex-col border-t border-paper/10 bg-ink-deep/50 lg:border-t-0 lg:border-l lg:border-paper/10">
      <div className="border-b border-paper/10 bg-turf/30 px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/45">Draw progress</p>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
          {POOL_CODES.map((code, idx) => {
            const filled = slotGrid[idx]?.filter(Boolean).length ?? 0;
            const active = idx === activePoolIdx;
            const done = idx < activePoolIdx;
            return (
              <span
                key={code}
                className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold tabular-nums uppercase tracking-wider sm:text-xs ${
                  active
                    ? 'border-floodlight/50 bg-floodlight/12 text-floodlight-bright'
                    : done
                      ? 'border-paper/15 text-paper/55'
                      : 'border-paper/8 text-paper/30'
                }`}
              >
                {code} · {filled}/{POOL_SLOT_COUNT}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-2 py-4 sm:px-4 sm:py-5">
        <p className="px-2 font-display text-2xl text-floodlight-bright sm:px-0 sm:text-3xl">Pool {poolCode}</p>
        <p className="mt-1 px-2 text-xs text-paper/50 sm:px-0">Teams appear in slot order as they are drawn.</p>

        <table className="pool-board-table mt-4 w-full min-w-[16rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-paper/10">
              <th scope="col" className="w-11 py-2 pl-2 pr-2 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/40">#</span>
              </th>
              <th scope="col" className="py-2 pr-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/40">Team</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: POOL_SLOT_COUNT }, (_, i) => {
              const name = slotGrid[activePoolIdx]?.[i] ?? null;
              const isTarget = i === targetSlotIdx;
              const showFly = phase === 'fly' && isTarget && winnerName;
              const slotNumber = i + 1;

              return (
                <PoolBoardRow
                  key={i}
                  slotNumber={slotNumber}
                  teamName={name}
                  teamMap={teamMap}
                  highlight={isTarget && (phase === 'winner' || phase === 'fly')}
                  trailing={
                    name
                      ? undefined
                      : showFly && winnerName
                        ? (
                            <TeamPickCelebration
                              team={teamInfoFromMap(winnerName, teamMap)}
                              poolIdx={activePoolIdx}
                              slotNumber={slotNumber}
                              layoutId={flyLayoutId}
                              mode="inline"
                            />
                          )
                        : isTarget && phase === 'winner'
                          ? (
                              <span className="text-xs font-medium text-floodlight-bright/90">Confirming pick…</span>
                            )
                          : undefined
                  }
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

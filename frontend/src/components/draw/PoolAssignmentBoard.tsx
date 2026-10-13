import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { POOL_CODES, POOL_SLOT_COUNT, type PoolCode } from '../../data/pools';
import { mediaUrl } from '../../utils/mediaUrl';
import { teamInfoFromMap, type DrawTeamInfo } from './DrawTeamChip';

export function parsePoolSlotName(raw: string | undefined): string | null {
  const n = raw?.trim();
  if (!n || n === '—' || n === '-') return null;
  return n;
}

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function PoolTeamMark({ team, className = '' }: { team: DrawTeamInfo; className?: string }) {
  const logo = mediaUrl(team.logoUrl);
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-paper/15 bg-ink-deep/80 shadow-sm ${className}`}
    >
      {logo ? (
        <img src={logo} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="font-display text-sm text-floodlight-dim">{teamInitials(team.teamName)}</span>
      )}
    </span>
  );
}

type RowProps = {
  slotNumber: number;
  teamName: string | null;
  teamMap: Map<string, DrawTeamInfo>;
  highlight?: boolean;
  trailing?: ReactNode;
};

export function PoolBoardRow({ slotNumber, teamName, teamMap, highlight, trailing }: RowProps) {
  const team = teamName ? teamInfoFromMap(teamName, teamMap) : null;

  return (
    <tr
      className={`pool-board-row border-b border-paper/[0.07] last:border-b-0 ${
        highlight ? 'bg-floodlight/[0.08]' : slotNumber % 2 === 0 ? 'bg-paper/[0.02]' : 'bg-transparent'
      }`}
    >
      <td className="w-11 py-0 pl-3 pr-2 align-middle sm:pl-4">
        <span className="block text-right font-mono text-xs font-medium tabular-nums text-paper/45">{slotNumber}</span>
      </td>
      <td className="py-2.5 pr-3 align-middle sm:py-3 sm:pr-4">
        {trailing ? (
          trailing
        ) : team ? (
          <div className="flex min-w-0 items-center gap-3">
            <PoolTeamMark team={team} />
            <span className="min-w-0 text-[15px] font-semibold leading-snug tracking-normal text-paper sm:text-base sm:leading-normal">
              {team.teamName}
            </span>
          </div>
        ) : (
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-paper/28">Open slot</span>
        )}
      </td>
    </tr>
  );
}

const POOL_BAR: Record<PoolCode, string> = {
  A: 'bg-floodlight',
  B: 'bg-floodlight/85',
  C: 'bg-floodlight/70',
  D: 'bg-floodlight/55',
};

export function PoolBoardCard({
  poolCode,
  names,
  teamMap,
  index,
}: {
  poolCode: PoolCode;
  names: string[];
  teamMap: Map<string, DrawTeamInfo>;
  index: number;
}) {
  const filled = names.filter((n) => parsePoolSlotName(n)).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="pool-board-card overflow-hidden rounded-md border border-paper/12 bg-turf/30 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
    >
      <div className={`h-1 ${POOL_BAR[poolCode]}`} aria-hidden />
      <header className="flex items-center justify-between gap-3 border-b border-paper/10 bg-ink-deep/50 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none tracking-wide text-floodlight-bright">Pool {poolCode}</span>
        </div>
        <span className="rounded-md border border-paper/12 bg-turf/40 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-paper/60">
          {filled}/{POOL_SLOT_COUNT}
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="pool-board-table w-full min-w-[16rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-paper/10 bg-ink-deep/30">
              <th scope="col" className="w-11 py-2 pl-3 pr-2 text-right sm:pl-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/40">#</span>
              </th>
              <th scope="col" className="py-2 pr-3 sm:pr-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/40">Team</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: POOL_SLOT_COUNT }, (_, i) => {
              const slotNumber = i + 1;
              const name = parsePoolSlotName(names[i]);
              return (
                <PoolBoardRow key={slotNumber} slotNumber={slotNumber} teamName={name} teamMap={teamMap} />
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

type FinalProps = {
  finalNamesByPool: string[][];
  drawTeams: DrawTeamInfo[];
};

export function PoolDrawFinalScoreboard({ finalNamesByPool, drawTeams }: FinalProps) {
  const teamMap = new Map(drawTeams.map((t) => [t.teamName, t]));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-md border border-paper/12 bg-ink-deep/80"
    >
      <header className="border-b border-paper/10 px-5 py-5 sm:px-8 sm:py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-floodlight-dim">Tournament draw</p>
        <h2 className="mt-1 font-display text-3xl tracking-wide text-paper sm:text-[2rem]">Pool assignments</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-paper/55">
          Four groups of ten — scroll each pool on mobile. Names match the official squad list.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-2">
        {POOL_CODES.map((poolCode, poolIdx) => (
          <PoolBoardCard
            key={poolCode}
            poolCode={poolCode}
            names={finalNamesByPool[poolIdx] ?? []}
            teamMap={teamMap}
            index={poolIdx}
          />
        ))}
      </div>
    </motion.div>
  );
}

import { Link } from 'react-router-dom';
import type { TeamSlotRow } from '../../utils/teamSlots';
import { formatSquadPhotoProgress, isSquadPhotoComplete, type SquadProgress } from '../../utils/squadProgress';
import { SquadProgressBadge } from './SquadProgressBadge';

function showSquadAdd(row: TeamSlotRow): row is TeamSlotRow & { teamName: string } {
  return row.kind !== 'open' && Boolean(row.teamName);
}

type Props = {
  rows: TeamSlotRow[];
  squadProgress: Map<string, SquadProgress>;
  minSquad: number;
  emptyMessage?: string;
};

export function TeamsBoardList({ rows, squadProgress, minSquad, emptyMessage }: Props) {
  if (rows.length === 0) {
    return emptyMessage ? <p className="py-8 text-center text-sm text-paper/50">{emptyMessage}</p> : null;
  }

  return (
    <div className="border border-paper/15">
      <div className="grid grid-cols-[2.5rem_1fr_minmax(6.5rem,auto)] gap-3 border-b border-paper/12 bg-turf/30 px-4 py-3 text-xs font-medium uppercase tracking-widest text-paper/50 sm:grid-cols-[3rem_1fr_8.5rem] sm:gap-4 sm:px-6">
        <span>#</span>
        <span>Team</span>
        <span className="text-right sm:text-center">Squad</span>
      </div>
      <ul className="divide-y divide-paper/12">
        {rows.map((row) => {
          const rowStripe =
            row.slot % 2 === 1 ? 'bg-floodlight/[0.04]' : row.kind === 'open' ? 'bg-transparent' : 'bg-turf/15';
          const nameGold = row.slot % 2 === 1;
          const addSquad = showSquadAdd(row);
          const progress = row.registrationId ? squadProgress.get(row.registrationId) : undefined;
          const complete = isSquadPhotoComplete(progress, minSquad);

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
                    <Link
                      to={`/teams/${encodeURIComponent(row.teamName!)}`}
                      className={`font-display text-base tracking-wide hover:underline sm:text-lg ${
                        nameGold ? 'text-floodlight-bright' : 'text-paper'
                      }`}
                    >
                      {row.teamName}
                    </Link>
                    {row.kind === 'host' ? (
                      <span className="funk-skew-chip border border-floodlight/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-floodlight-bright">
                        Host
                      </span>
                    ) : null}
                    {complete ? (
                      <span className="rounded-sm bg-floodlight/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-floodlight-bright">
                        Complete
                      </span>
                    ) : addSquad ? (
                      <span className="rounded-sm bg-paper/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-paper/55">
                        In progress
                      </span>
                    ) : null}
                    {row.rosterOnly ? (
                      <span className="text-[10px] uppercase tracking-wider text-amber-200/70">Sync pending</span>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1 sm:items-center">
                {addSquad ? (
                  <>
                    {row.registrationId && formatSquadPhotoProgress(progress, minSquad) ? (
                      <SquadProgressBadge progress={progress} minSquad={minSquad} />
                    ) : null}
                    <Link
                      to={`/teams/${encodeURIComponent(row.teamName)}?captain=1`}
                      className="squad-add-link"
                    >
                      {row.registrationId && (progress?.playerCount ?? 0) > 0 ? 'Edit squad' : 'Add squad'}
                    </Link>
                  </>
                ) : (
                  <span className="px-2 text-xs text-paper/25">—</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

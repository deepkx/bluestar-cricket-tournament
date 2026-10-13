import { motion } from 'framer-motion';
import { POOL_CODES } from '../../data/pools';
import { mediaUrl } from '../../utils/mediaUrl';
import type { DrawTeamInfo } from './DrawTeamChip';

type Props = {
  team: DrawTeamInfo;
  poolIdx: number;
  slotNumber: number;
  layoutId: string;
  mode: 'popup' | 'inline';
};

export function TeamPickCelebration({ team, poolIdx, slotNumber, layoutId, mode }: Props) {
  const logo = mediaUrl(team.logoUrl);
  const poolCode = POOL_CODES[poolIdx] ?? '?';

  if (mode === 'inline') {
    return (
      <motion.div layoutId={layoutId} className="w-full">
        <div className="flex items-center gap-3 rounded-sm border border-floodlight/40 bg-floodlight/10 px-3 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-floodlight/40 bg-ink-deep">
            {logo ? (
              <img src={logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-sm text-floodlight-dim">{team.teamName.slice(0, 2)}</span>
            )}
          </div>
          <p className="min-w-0 flex-1 font-display text-lg leading-tight text-floodlight-bright">{team.teamName}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        layoutId={layoutId}
        className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,340px)] -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0.72, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      >
        <div className="border-2 border-floodlight bg-gradient-to-b from-turf/90 to-ink-deep px-6 py-8 text-center shadow-[0_0_60px_rgba(229,160,23,0.35)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-floodlight-dim">Selected</p>
          <div className="mx-auto mt-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-floodlight bg-ink-deep">
            {logo ? (
              <img src={logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-2xl text-floodlight-bright">{team.teamName.slice(0, 2)}</span>
            )}
          </div>
          <p className="mt-5 font-display text-2xl leading-tight tracking-wide text-floodlight-bright sm:text-3xl">
            {team.teamName}
          </p>
          <p className="mt-4 text-sm text-paper/60">
            → Pool {poolCode} · Slot {slotNumber}
          </p>
        </div>
      </motion.div>
    </>
  );
}

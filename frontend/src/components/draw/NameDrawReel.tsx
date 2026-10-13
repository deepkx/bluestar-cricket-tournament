import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { mediaUrl } from '../../utils/mediaUrl';
import { buildNameReelStrip } from './buildNameReelStrip';
import type { DrawTeamInfo } from './DrawTeamChip';

const ROW_H = 60;
const VIEW_H = 180;

type Props = {
  remaining: string[];
  winner: string;
  rolling: boolean;
  locked: boolean;
  teamMap: Map<string, DrawTeamInfo>;
  rollDurationSec: number;
  spinKey: number;
};

export function NameDrawReel({
  remaining,
  winner,
  rolling,
  locked,
  teamMap,
  rollDurationSec,
  spinKey,
}: Props) {
  const reduceMotion = useReducedMotion();

  const { strip, targetIndex } = useMemo(() => {
    const s = buildNameReelStrip(remaining, winner, 8);
    const idx = s.lastIndexOf(winner);
    return { strip: s, targetIndex: idx >= 0 ? idx : s.length - 1 };
  }, [spinKey, winner]);

  const endY = -(targetIndex * ROW_H) + (VIEW_H / 2 - ROW_H / 2);

  return (
    <div className="relative flex-1">
      <div className="overflow-hidden rounded-sm border border-paper/20 bg-[#070a09] shadow-[inset_0_8px_32px_rgba(0,0,0,0.9)]">
        <div className="border-b border-floodlight/30 bg-turf/40 px-4 py-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-floodlight-bright">Team reel</p>
        </div>

        <div className="relative overflow-hidden" style={{ height: VIEW_H }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-[#070a09] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-b from-transparent to-[#070a09]" />
          <div className="pointer-events-none absolute inset-x-2 top-1/2 z-10 h-[60px] -translate-y-1/2 border-y-2 border-floodlight/80 bg-floodlight/[0.06] sm:inset-x-3" />

          <motion.div
            key={spinKey}
            initial={{ y: 0 }}
            animate={{ y: rolling || locked ? endY : 0 }}
            transition={
              rolling && !reduceMotion
                ? { duration: rollDurationSec, ease: [0.04, 0.94, 0.1, 1] }
                : { duration: 0.15 }
            }
          >
            {strip.map((name, i) => {
              const info = teamMap.get(name) ?? { teamName: name, logoUrl: null };
              const logo = mediaUrl(info.logoUrl);
              const isWin = locked && i === targetIndex;
              return (
                <div
                  key={`${name}-${i}`}
                  className={`flex h-[60px] items-center gap-3 px-3 sm:gap-4 sm:px-5 ${isWin ? 'bg-floodlight/10' : ''}`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-paper/20 bg-ink-deep">
                    {logo ? (
                      <img src={logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-display text-xs text-floodlight-dim">{name.slice(0, 2)}</span>
                    )}
                  </div>
                  <p
                    className={`min-w-0 flex-1 truncate font-display text-lg tracking-wide sm:text-2xl ${
                      isWin ? 'text-floodlight-bright' : 'text-paper/70'
                    }`}
                  >
                    {name}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

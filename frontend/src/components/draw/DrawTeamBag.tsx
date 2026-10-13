import { AnimatePresence, motion } from 'framer-motion';
import type { DrawTeamInfo } from './DrawTeamChip';
import { DrawTeamChip } from './DrawTeamChip';

type Props = {
  teams: DrawTeamInfo[];
  drawnNames: Set<string>;
  highlightNames: Set<string>;
};

export function DrawTeamBag({ teams, drawnNames, highlightNames }: Props) {
  const remaining = teams.filter((t) => t.teamName && !drawnNames.has(t.teamName));
  const drawnCount = teams.length - remaining.length;

  return (
    <div className="relative overflow-hidden border border-paper/15 bg-gradient-to-b from-turf/35 to-ink-deep/40">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.5) 28px, rgba(255,255,255,0.5) 29px)',
        }}
        aria-hidden
      />
      <div className="relative border-b border-floodlight/20 bg-ink-deep/50 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="hud-label text-floodlight-dim">Teams in the draw</p>
            <p className="mt-1 text-sm text-paper/60">
              <span className="tabular-nums text-floodlight-bright">{remaining.length}</span> waiting ·{' '}
              <span className="tabular-nums">{drawnCount}</span> picked
            </p>
          </div>
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-floodlight/30 bg-turf/40 text-lg"
            title="Cricket ball"
            animate={{ rotate: highlightNames.size > 0 ? 360 : 0 }}
            transition={{ duration: 0.9, repeat: highlightNames.size > 0 ? Infinity : 0, ease: 'linear' }}
          >
            <span aria-hidden>🏏</span>
          </motion.div>
        </div>
      </div>

      <div className="relative max-h-52 overflow-y-auto px-3 py-4 sm:max-h-56 sm:px-4">
        <div className="flex flex-wrap justify-center gap-2">
          <AnimatePresence mode="popLayout">
            {remaining.map((team) => {
              const highlight = highlightNames.has(team.teamName);
              return (
                <motion.div
                  key={team.teamName}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.55, y: -16 }}
                  transition={{ duration: 0.38 }}
                >
                  <DrawTeamChip
                    team={team}
                    size="xs"
                    highlight={highlight}
                    layoutId={`draw-team-${team.teamName}`}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {remaining.length === 0 ? (
          <p className="py-6 text-center text-sm text-paper/50">All teams have been drawn.</p>
        ) : null}
      </div>
    </div>
  );
}

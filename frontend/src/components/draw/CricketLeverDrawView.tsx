import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { LeverDrawPhase } from '../../hooks/usePoolLeverDraw';
import { useWheelSpinSound } from '../../hooks/useWheelSpinSound';
import { CricketHeroLever } from './CricketHeroLever';
import { NameDrawReel } from './NameDrawReel';
import { PoolSplitPanel } from './PoolSplitPanel';
import { TeamPickCelebration } from './TeamPickCelebration';
import { teamInfoFromMap, type DrawTeamInfo } from './DrawTeamChip';

type Props = {
  phase: LeverDrawPhase;
  activePoolIdx: number;
  pickIndex: number;
  totalPicks: number;
  progress: number;
  remainingTeams: string[];
  slotGrid: (string | null)[][];
  winnerName: string | null;
  targetTeamName: string;
  targetSlotIdx: number;
  rollDurationSec: number;
  teamMap: Map<string, DrawTeamInfo>;
  soundOn: boolean;
  onToggleSound: () => void;
  onEnableSound: () => void;
  audioBlocked: boolean;
};

export function CricketLeverDrawView({
  phase,
  activePoolIdx,
  pickIndex,
  totalPicks,
  progress,
  remainingTeams,
  slotGrid,
  winnerName,
  targetTeamName,
  targetSlotIdx,
  rollDurationSec,
  teamMap,
  soundOn,
  onToggleSound,
  onEnableSound,
  audioBlocked,
}: Props) {
  const pulling = phase === 'pull';
  const rolling = phase === 'rolling';
  const locked = phase === 'winner' || phase === 'fly' || phase === 'vanish';
  const reelWinner = winnerName ?? targetTeamName;
  const showPopup = phase === 'winner' && winnerName;
  const flyLayoutId = winnerName ? `team-pick-${pickIndex}-${winnerName}` : '';

  useWheelSpinSound(rolling, rollDurationSec * 1000, soundOn, pickIndex);

  const statusLine =
    pulling ? 'Hero pulls the lever…' : rolling ? 'Names flying…' : phase === 'winner' ? 'Selected!' : phase === 'fly' ? 'Into the pool…' : locked ? 'Locked in' : 'Ready';

  return (
    <LayoutGroup id="pool-draw">
      <div className="scoreboard-frame overflow-hidden border border-paper/20 bg-ink-deep">
        <div className="flex flex-col gap-3 border-b border-floodlight/25 bg-turf/25 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="hud-label text-floodlight-bright">Live pool draw</p>
            <p className="mt-1 text-xs text-paper/55 sm:text-sm">
              Pool {['A', 'B', 'C', 'D'][activePoolIdx]} · Pick {pickIndex + 1}/{totalPicks}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              className="flex-1 border border-paper/20 px-2 py-1.5 text-[10px] uppercase text-paper/75 sm:flex-none sm:px-3 sm:text-xs"
            >
              {soundOn ? 'Sound on' : 'Sound off'}
            </button>
            {audioBlocked && soundOn ? (
              <button
                type="button"
                onClick={onEnableSound}
                className="border border-floodlight/40 px-2 py-1.5 text-[10px] text-floodlight-bright sm:text-xs"
              >
                Enable sound
              </button>
            ) : null}
          </div>
        </div>

        <div className="h-1 bg-paper/10 sm:h-1.5">
          <motion.div className="h-full bg-floodlight" animate={{ width: `${progress * 100}%` }} />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2">
          <section className="order-1 border-b border-paper/10 px-3 py-4 sm:px-6 sm:py-6 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-center font-display text-base text-paper sm:text-left sm:text-lg">{statusLine}</p>
            <div className="flex flex-row items-end justify-center gap-2 sm:gap-4">
              <div className="w-[88px] shrink-0 sm:w-[110px]">
                <CricketHeroLever pulling={pulling || rolling} />
              </div>
              <NameDrawReel
                remaining={remainingTeams}
                winner={reelWinner}
                rolling={rolling}
                locked={locked}
                teamMap={teamMap}
                rollDurationSec={rollDurationSec}
                spinKey={pickIndex}
              />
            </div>
          </section>

          <section className="order-2 min-h-0 lg:order-2">
            <PoolSplitPanel
              activePoolIdx={activePoolIdx}
              slotGrid={slotGrid}
              teamMap={teamMap}
              phase={phase}
              winnerName={winnerName}
              pickIndex={pickIndex}
              targetSlotIdx={targetSlotIdx}
            />
          </section>
        </div>

        <AnimatePresence>
          {showPopup && winnerName ? (
            <TeamPickCelebration
              key={flyLayoutId}
              team={teamInfoFromMap(winnerName, teamMap)}
              poolIdx={activePoolIdx}
              slotNumber={targetSlotIdx + 1}
              layoutId={flyLayoutId}
              mode="popup"
            />
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

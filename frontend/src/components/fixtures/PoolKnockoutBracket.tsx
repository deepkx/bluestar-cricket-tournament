import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { BracketMatchNode, BracketSide, PoolBracketModel } from '../../utils/poolBracketModel';
import { POOL_FIXTURE_META } from '../../utils/fixtureDisplay';
import { BRACKET_MATCH_W, buildBracketLayout, type BracketPosKey } from './bracketLayout';
import {
  BRACKET_ARROW_BASE_S,
  BRACKET_ARROW_STAGGER_S,
  BRACKET_MATCH_DELAY_S,
} from './fixturesRevealTiming';

const { layout: LAYOUT, canvasW: CANVAS_W, canvasH: CANVAS_H } = buildBracketLayout();

type PosKey = BracketPosKey;

const HDR_H = 38;
const TEAM_H = 48;
const TEAM_GAP = 8;
const PAD = 10;
const FOOT_H = 30;

const TOP_BYPASS_Y = 28;
const BOT_BYPASS_Y = CANVAS_H - 28;

type Pt = { x: number; y: number };

function matchAnchors(key: PosKey, hasKickoff: boolean) {
  const { x, y } = LAYOUT[key];
  const innerTop = y + HDR_H + PAD;
  const topY = innerTop + TEAM_H / 2;
  const bottomY = innerTop + TEAM_H + TEAM_GAP + TEAM_H / 2;
  const right = x + BRACKET_MATCH_W;
  const dayFoot = key.startsWith('r3') || key === 'final' ? 38 : 0;
  const foot = hasKickoff ? FOOT_H : dayFoot;
  const boxBottom = y + HDR_H + PAD * 2 + TEAM_H * 2 + TEAM_GAP + foot;
  return {
    /** Winner exit — right edge, lower team row (R1 → R2). */
    outWinner: { x: right, y: bottomY } satisfies Pt,
    outTop: { x: right, y: topY } satisfies Pt,
    inTop: { x, y: topY } satisfies Pt,
    inBottom: { x, y: bottomY } satisfies Pt,
    outMid: { x: right, y: (topY + bottomY) / 2 } satisfies Pt,
    boxBottom,
    boxTop: y,
  };
}

type WirePart = { d: string; arrow?: boolean };

/** Trunk + tip so only one arrowhead per connector (avoids duplicate markers on H-V-H). */
function elbowWire(from: Pt, gutterX: number, to: Pt): WirePart[] {
  return [
    { d: `M ${from.x} ${from.y} H ${gutterX} V ${to.y}` },
    { d: `M ${gutterX} ${to.y} H ${to.x}`, arrow: true },
  ];
}

function bypassWire(from: Pt, g1: number, bypassY: number, g2: number, to: Pt): WirePart[] {
  return [
    { d: `M ${from.x} ${from.y} H ${g1} V ${bypassY} H ${g2} V ${to.y}` },
    { d: `M ${g2} ${to.y} H ${to.x}`, arrow: true },
  ];
}

function SideLine({ side }: { side: BracketSide }) {
  const struck = side.eliminated;
  const inner =
    side.kind === 'team' && side.text && side.text !== 'TBD' && !side.text.startsWith('Winner') ? (
      <Link
        to={`/teams/${encodeURIComponent(side.text)}`}
        className={`block truncate px-3 text-base font-semibold hover:text-floodlight-bright hover:underline ${
          struck ? 'text-paper/35 line-through decoration-paper/50' : 'text-paper'
        }`}
      >
        {side.text}
      </Link>
    ) : (
      <span
        className={`block truncate px-3 ${
          struck
            ? 'text-sm text-paper/35 line-through decoration-paper/50'
            : side.kind === 'winner'
              ? 'text-sm font-medium text-floodlight-bright/90'
              : 'text-sm text-paper/45'
        }`}
      >
        {side.text}
      </span>
    );
  return (
    <div
      className={`flex min-h-[3rem] items-center rounded-sm border bg-ink-deep shadow-inner ${
        struck ? 'border-paper/10 opacity-75' : 'border-paper/25'
      }`}
    >
      {inner}
    </div>
  );
}

function bracketSlotTitle(posKey: PosKey): string {
  const m = posKey.match(/^r(\d)m(\d)$/);
  if (m) return `R${m[1]} · M${m[2]}`;
  if (posKey === 'final') return 'R4 · Final';
  return '';
}

function MatchBox({
  node,
  accent,
  posKey,
}: {
  node: BracketMatchNode;
  accent: 'blue' | 'gold' | 'dim';
  posKey: PosKey;
}) {
  const hdr =
    accent === 'gold'
      ? 'bg-floodlight text-black'
      : accent === 'blue'
        ? 'bg-electric text-ink-deep'
        : 'bg-paper/25 text-paper/85';
  const title = bracketSlotTitle(posKey) || node.title?.trim() || 'Match';
  return (
    <div
      className="relative z-20 overflow-hidden rounded-md border-2 border-paper/30 bg-ink-deep shadow-xl"
      style={{ width: BRACKET_MATCH_W }}
    >
      <div className={`px-3 py-3 text-center text-base font-bold uppercase tracking-widest ${hdr}`}>{title}</div>
      <div className="space-y-2 bg-ink-deep p-2.5">
        <SideLine side={node.top} />
        <SideLine side={node.bottom} />
      </div>
      {node.kickoff ? (
        <p className="border-t border-paper/15 bg-ink-deep px-3 py-2.5 text-center text-sm font-semibold tabular-nums text-paper/85">
          {node.kickoff} IST
        </p>
      ) : node.dayNote ? (
        <p className="border-t border-paper/15 bg-ink-deep px-3 py-2.5 text-center text-sm font-medium text-paper/70">
          {node.dayNote}
        </p>
      ) : null}
    </div>
  );
}

function BracketArrows({
  markerId,
  revealActive,
  instant,
}: {
  markerId: string;
  revealActive: boolean;
  instant: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const stroke = 'rgba(229,160,23,0.75)';
  const drawPaths = revealActive && !instant && !reduceMotion;

  const r1m1 = matchAnchors('r1m1', true);
  const r1m2 = matchAnchors('r1m2', true);
  const r1m3 = matchAnchors('r1m3', true);
  const r1m4 = matchAnchors('r1m4', true);
  const r2m1 = matchAnchors('r2m1', true);
  const r2m2 = matchAnchors('r2m2', true);
  const r3m1 = matchAnchors('r3m1', false);
  const r3m2 = matchAnchors('r3m2', false);
  const fin = matchAnchors('final', false);

  /** One dedicated gutter X (or pair) per connector — no shared vertical lanes. */
  const wires: WirePart[] = [
    ...elbowWire(r1m1.outWinner, 314, r2m2.inBottom),
    ...elbowWire(r1m4.outWinner, 330, r2m1.inBottom),
    ...bypassWire(r1m2.outTop, 302, TOP_BYPASS_Y, 702, r3m1.inTop),
    ...bypassWire(r1m3.outWinner, 346, BOT_BYPASS_Y, 734, r3m2.inTop),
    ...elbowWire({ x: r2m2.outWinner.x, y: r2m2.inBottom.y }, 758, r3m1.inBottom),
    ...elbowWire({ x: r2m1.outWinner.x, y: r2m1.inBottom.y }, 686, r3m2.inBottom),
    ...elbowWire(r3m1.outMid, 1056, fin.inTop),
    ...elbowWire(r3m2.outMid, 1080, fin.inBottom),
  ];

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-[5]"
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      aria-hidden
    >
      <defs>
        <marker id={markerId} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={stroke} />
        </marker>
      </defs>
      <g stroke={stroke} strokeWidth="2.5" fill="none" strokeLinejoin="round">
        {wires.map((w, i) => (
          <motion.path
            key={i}
            d={w.d}
            initial={drawPaths ? { pathLength: 0, opacity: 0.2 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: {
                duration: 0.55,
                delay: BRACKET_ARROW_BASE_S + i * BRACKET_ARROW_STAGGER_S,
                ease: 'easeOut',
              },
              opacity: { duration: 0.25, delay: BRACKET_ARROW_BASE_S + i * BRACKET_ARROW_STAGGER_S },
            }}
            markerEnd={w.arrow ? `url(#${markerId})` : undefined}
          />
        ))}
      </g>
    </svg>
  );
}

function PlacedMatch({
  node,
  posKey,
  accent,
  revealActive,
  instant,
}: {
  node: BracketMatchNode | undefined;
  posKey: PosKey;
  accent: 'blue' | 'gold' | 'dim';
  revealActive: boolean;
  instant: boolean;
}) {
  const reduceMotion = useReducedMotion();
  if (!node) return null;
  const p = LAYOUT[posKey];
  const skipMotion = instant || !revealActive || reduceMotion;
  const delay = BRACKET_MATCH_DELAY_S[posKey];

  return (
    <motion.div
      className="absolute z-20"
      style={{ left: p.x, top: p.y }}
      initial={skipMotion ? false : { opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay: skipMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <MatchBox node={node} accent={accent} posKey={posKey} />
    </motion.div>
  );
}

type SeedRow = { slotOrder: number; teamName: string | null };

type Props = {
  poolCode: string;
  model: PoolBracketModel;
  seeds?: SeedRow[];
  /** Live bracket build for this pool (fixtures reveal). */
  revealActive?: boolean;
  /** Restart animation when pool cycles. */
  revealTick?: number;
  revealed?: boolean;
};

export function PoolKnockoutBracket({
  poolCode,
  model,
  seeds = [],
  revealActive = false,
  revealTick = 0,
  revealed = true,
}: Props) {
  const arrowMarkerId = useId().replace(/:/g, '');
  const meta = POOL_FIXTURE_META[poolCode];
  if (model.r1.length === 0) return null;

  const instant = revealed || !revealActive;

  return (
    <div
      key={revealActive ? `${poolCode}-${revealTick}` : poolCode}
      className="overflow-hidden rounded-md border border-paper/15 border-t-0 bg-gradient-to-b from-turf/30 to-ink-deep"
    >
      <div className="relative overflow-hidden border-b border-paper/12 bg-ink-deep px-5 py-5 sm:px-8">
        {revealActive && !instant ? (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-floodlight/15 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />
        ) : null}
        <p className="relative font-display text-2xl tracking-wide text-floodlight-bright sm:text-3xl">
          Pool {poolCode} knockout
        </p>
        <p className="mt-2 text-sm text-paper/55">
          {meta?.dayLabel} · {meta?.startNote} · one arrow per advancing path
        </p>
      </div>

      <div className="overflow-x-auto p-5 sm:p-8">
        <div className="mx-auto flex min-w-max gap-8">
          {seeds.length > 0 ? (
            <motion.aside
              className="w-48 shrink-0 rounded-md border border-paper/15 bg-ink-deep sm:w-56"
              initial={instant ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: instant ? 0 : 0.25 }}
            >
              <p className="border-b border-paper/12 bg-floodlight/20 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-floodlight-bright">
                Teams · Pool {poolCode}
              </p>
              <ol className="divide-y divide-paper/10 text-base">
                {seeds.map((s) => (
                  <li key={s.slotOrder} className="flex gap-2 px-4 py-2.5">
                    <span className="tabular-nums text-paper/40">{s.slotOrder}.</span>
                    {s.teamName ? (
                      <Link
                        to={`/teams/${encodeURIComponent(s.teamName)}`}
                        className="truncate font-medium text-paper hover:text-floodlight-bright hover:underline"
                      >
                        {s.teamName}
                      </Link>
                    ) : (
                      <span className="text-paper/35">—</span>
                    )}
                  </li>
                ))}
              </ol>
            </motion.aside>
          ) : null}

          <div
            className="relative shrink-0 rounded-lg border border-paper/10 bg-ink-deep p-3"
            style={{ width: CANVAS_W + 24, height: CANVAS_H + 24 }}
          >
            <motion.div
              className="pointer-events-none absolute inset-x-8 top-3 flex justify-between text-[11px] font-bold uppercase tracking-widest text-paper/35"
              initial={instant ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <span>Round 1</span>
              <span className="ml-[22%]">Round 2</span>
              <span className="ml-[18%]">Round 3</span>
              <span>Final</span>
            </motion.div>
            <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H, marginTop: 20 }}>
              <BracketArrows
                markerId={`bracket-arr-${arrowMarkerId}`}
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.r1.find((m) => m.matchNum === 1)}
                posKey="r1m1"
                accent="blue"
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.r1.find((m) => m.matchNum === 2)}
                posKey="r1m2"
                accent="blue"
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.r1.find((m) => m.matchNum === 3)}
                posKey="r1m3"
                accent="blue"
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.r1.find((m) => m.matchNum === 4)}
                posKey="r1m4"
                accent="blue"
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.r2.find((m) => m.matchNum === 1)}
                posKey="r2m1"
                accent="gold"
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.r2.find((m) => m.matchNum === 2)}
                posKey="r2m2"
                accent="gold"
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.r3.find((m) => m.matchNum === 1)}
                posKey="r3m1"
                accent="gold"
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.r3.find((m) => m.matchNum === 2)}
                posKey="r3m2"
                accent="gold"
                revealActive={revealActive}
                instant={instant}
              />
              <PlacedMatch
                node={model.final ?? undefined}
                posKey="final"
                accent="gold"
                revealActive={revealActive}
                instant={instant}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

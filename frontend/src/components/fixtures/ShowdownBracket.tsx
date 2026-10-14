import { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { FixtureRow } from '../../data/pools';
import type { ShowdownMatchView } from '../../utils/showdownModel';
import { BracketScheduleFoot } from './BracketScheduleFoot';
import type { BracketSide } from '../../utils/poolBracketModel';
import { BRACKET_MATCH_W, bracketMatchBoxHeight } from './bracketLayout';
import { BRACKET_ARROW_BASE_S, BRACKET_ARROW_STAGGER_S } from './fixturesRevealTiming';
import {
  fixtureRevealFlavor,
  type FixtureRevealFlavor,
  type TeamSlotRevealMotion,
} from './fixturesRevealRandom';
import { TeamRevealMotion } from './TeamRevealMotion';

const HDR_H = 38;
const TEAM_H = 48;
const TEAM_GAP = 8;
const PAD = 10;

const hBox = bracketMatchBoxHeight('plain');
const SEMI_GAP = 56;
const X_SEMI = 8;
const X_FINAL = 400;
const Y_TOP = 44;

const semi1Y = Y_TOP;
const semi2Y = semi1Y + hBox + SEMI_GAP;
const finalY = Math.round((semi1Y + semi2Y + hBox) / 2 - hBox / 2);

const CANVAS_W = X_FINAL + BRACKET_MATCH_W + 40;
const CANVAS_H = semi2Y + hBox + 44;

type Pt = { x: number; y: number };

function matchAnchors(x: number, y: number) {
  const innerTop = y + HDR_H + PAD;
  const topY = innerTop + TEAM_H / 2;
  const bottomY = innerTop + TEAM_H + TEAM_GAP + TEAM_H / 2;
  const right = x + BRACKET_MATCH_W;
  const midY = (topY + bottomY) / 2;
  return {
    outMid: { x: right, y: midY } satisfies Pt,
    inTop: { x, y: topY } satisfies Pt,
    inBottom: { x, y: bottomY } satisfies Pt,
    inMid: { x, y: midY } satisfies Pt,
  };
}

const semi1Anchors = matchAnchors(X_SEMI, semi1Y);
const semi2Anchors = matchAnchors(X_SEMI, semi2Y);
const finalAnchors = matchAnchors(X_FINAL, finalY);

type WirePart = { d: string; arrow?: boolean };

function elbowWire(from: Pt, gutterX: number, to: Pt): WirePart[] {
  return [
    { d: `M ${from.x} ${from.y} H ${gutterX} V ${to.y}` },
    { d: `M ${gutterX} ${to.y} H ${to.x}`, arrow: true },
  ];
}

function SideLine({
  side,
  teamReveal,
  slotMotion,
  baseDelay,
  ease,
}: {
  side: BracketSide;
  teamReveal: boolean;
  slotMotion: TeamSlotRevealMotion;
  baseDelay: number;
  ease: [number, number, number, number];
}) {
  const struck = side.eliminated;
  const inner =
    side.kind === 'team' && side.text && !side.text.startsWith('Winner') ? (
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
  const shell = (
    <div
      className={`flex min-h-[3rem] items-center rounded-sm border bg-ink-deep shadow-inner ${
        struck ? 'border-paper/10 opacity-75' : 'border-paper/25'
      }`}
    >
      {inner}
    </div>
  );

  return (
    <TeamRevealMotion
      active={teamReveal}
      motionSpec={slotMotion}
      baseDelay={baseDelay}
      ease={ease}
      className="w-full"
    >
      {shell}
    </TeamRevealMotion>
  );
}

function MatchCard({
  match,
  accent,
  teamReveal,
  flavor,
  motionKey,
  matchBaseDelay,
}: {
  match: ShowdownMatchView;
  accent: 'blue' | 'gold';
  teamReveal: boolean;
  flavor: FixtureRevealFlavor;
  motionKey: ShowdownMotionKey;
  matchBaseDelay: number;
}) {
  const slots = flavor.teamSlots[motionKey];
  const hdr = accent === 'gold' ? 'bg-floodlight text-black' : 'bg-electric text-ink-deep';
  return (
    <div
      className="relative z-20 overflow-hidden rounded-md border-2 border-paper/30 bg-ink-deep shadow-xl"
      style={{ width: BRACKET_MATCH_W }}
    >
      <div className={`px-3 py-3 text-center text-base font-bold uppercase tracking-widest ${hdr}`}>
        {match.title}
      </div>
      <div className="space-y-2 bg-ink-deep p-2.5">
        <SideLine
          side={match.top}
          teamReveal={teamReveal}
          slotMotion={slots.top}
          baseDelay={matchBaseDelay + 0.12}
          ease={flavor.ease}
        />
        <SideLine
          side={match.bottom}
          teamReveal={teamReveal}
          slotMotion={slots.bottom}
          baseDelay={matchBaseDelay + 0.22}
          ease={flavor.ease}
        />
      </div>
      {match.kickoff ? (
        <p className="border-t border-paper/15 bg-ink-deep px-3 py-2.5 text-center text-xs font-semibold leading-snug tabular-nums text-paper/85 sm:text-sm">
          {match.kickoff}
        </p>
      ) : null}
    </div>
  );
}

function ShowdownArrows({
  markerId,
  revealActive,
  instant,
  flavor,
}: {
  markerId: string;
  revealActive: boolean;
  instant: boolean;
  flavor: FixtureRevealFlavor;
}) {
  const reduceMotion = useReducedMotion();
  const stroke = 'rgba(229,160,23,0.75)';
  const drawPaths = revealActive && !instant && !reduceMotion;
  const gutter = Math.round((X_SEMI + BRACKET_MATCH_W + X_FINAL) / 2);

  const wires: WirePart[] = [
    ...elbowWire(semi1Anchors.outMid, gutter, finalAnchors.inTop),
    ...elbowWire(semi2Anchors.outMid, gutter + 24, finalAnchors.inBottom),
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
                duration: 0.45 + (flavor.arrowJitter[i] ?? 0) + 0.12,
                delay:
                  BRACKET_ARROW_BASE_S + i * BRACKET_ARROW_STAGGER_S + (flavor.arrowJitter[i] ?? 0),
                ease: 'easeOut',
              },
              opacity: {
                duration: 0.25,
                delay:
                  BRACKET_ARROW_BASE_S + i * BRACKET_ARROW_STAGGER_S + (flavor.arrowJitter[i] ?? 0),
              },
            }}
            markerEnd={w.arrow ? `url(#${markerId})` : undefined}
          />
        ))}
      </g>
    </svg>
  );
}

type Props = {
  matches: ShowdownMatchView[];
  fixtures?: FixtureRow[];
  revealActive?: boolean;
  revealTick?: number;
  revealed?: boolean;
};

const DELAY = { semi1: 0.12, semi2: 0.36, final: 0.72 };

const SHOWDOWN_KEYS = ['r1m1', 'r1m2', 'final'] as const;
type ShowdownMotionKey = (typeof SHOWDOWN_KEYS)[number];

export function ShowdownBracket({
  matches,
  fixtures = [],
  revealActive = false,
  revealTick = 0,
  revealed = true,
}: Props) {
  const arrowMarkerId = useId().replace(/:/g, '');
  const reduceMotion = useReducedMotion();
  const instant = revealed || !revealActive;
  const buildPhase = revealActive && !instant;
  const flavor = useMemo(
    () => fixtureRevealFlavor(`showdown-r${revealTick}`),
    [revealTick],
  );
  const semi1 = matches.find((m) => m.kind === 'semi1');
  const semi2 = matches.find((m) => m.kind === 'semi2');
  const fin = matches.find((m) => m.kind === 'final');

  if (matches.length === 0) {
    return (
      <div className="rounded-md border border-paper/15 bg-ink-deep/50 px-6 py-8 text-center text-sm leading-relaxed text-paper/50">
        <p className="font-medium text-paper/70">Showdown is not in the database yet.</p>
        <p className="mt-2">
          In Supabase SQL Editor, run{' '}
          <code className="rounded bg-ink-deep px-1.5 py-0.5 text-floodlight-dim">021_showdown_fixtures_repair.sql</code>{' '}
          (or <code className="rounded bg-ink-deep px-1.5 py-0.5 text-floodlight-dim">019_showdown_fixtures.sql</code>
          ). That adds three rows with <span className="text-paper/60">pool_code</span> null — Semi 1 (A vs C), Semi 2
          (B vs D), and Final.
        </p>
        <p className="mt-2 text-xs text-paper/40">
          Re-running migration 015 wipes all fixtures; run 021 again afterward. Record winners under Admin → Match
          results → Showdown.
        </p>
      </div>
    );
  }

  const placed: {
    match: ShowdownMatchView;
    x: number;
    y: number;
    accent: 'blue' | 'gold';
    delay: number;
    motionKey: ShowdownMotionKey;
  }[] = [];
  if (semi1) {
    placed.push({
      match: semi1,
      x: X_SEMI,
      y: semi1Y,
      accent: 'blue',
      delay: DELAY.semi1,
      motionKey: 'r1m1',
    });
  }
  if (semi2) {
    placed.push({
      match: semi2,
      x: X_SEMI,
      y: semi2Y,
      accent: 'blue',
      delay: DELAY.semi2,
      motionKey: 'r1m2',
    });
  }
  if (fin) {
    placed.push({
      match: fin,
      x: X_FINAL,
      y: finalY,
      accent: 'gold',
      delay: DELAY.final,
      motionKey: 'final',
    });
  }

  return (
    <div
      key={revealActive ? `showdown-${revealTick}` : 'showdown'}
      data-capture-export
      className="w-max min-w-full overflow-visible rounded-md border border-paper/15 bg-gradient-to-b from-turf/30 to-ink-deep"
    >
      <div className="relative overflow-hidden border-b border-paper/12 bg-ink-deep px-5 py-5 sm:px-8">
        {revealActive && !instant ? (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-floodlight/15 to-transparent"
            style={{ skewX: `${flavor.sweep.skewDeg}deg` }}
            initial={{ x: flavor.sweep.fromX }}
            animate={{ x: flavor.sweep.toX }}
            transition={{ duration: flavor.sweep.duration, ease: 'easeInOut' }}
          />
        ) : null}
        <p className="relative font-display text-2xl tracking-wide text-floodlight-bright sm:text-3xl">Showdown</p>
        <p className="mt-2 text-sm text-paper/55">
          Pool A vs Pool C · Pool B vs Pool D — winners meet in the final
        </p>
      </div>

      <div className="overflow-visible p-5 sm:p-8">
        <div
          className="relative mx-auto shrink-0 rounded-lg border border-paper/10 bg-ink-deep p-3"
          style={{ width: CANVAS_W + 24, minHeight: CANVAS_H + 24 }}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-8 top-3 flex justify-between text-[11px] font-bold uppercase tracking-widest text-paper/35"
            initial={instant ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <span>Semifinals</span>
            <span className="ml-auto pr-[18%]">Final</span>
          </motion.div>
          <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H, marginTop: 20 }}>
            {buildPhase
              ? flavor.sparkles.map((s, i) => (
                  <motion.span
                    key={i}
                    className="pointer-events-none absolute z-[4] block h-2 w-2 rounded-full bg-floodlight-bright/70 blur-[1px]"
                    style={{ left: `${s.leftPct}%`, top: `${s.topPct}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, s.scale, 0] }}
                    transition={{ duration: 0.65, delay: s.delay, ease: 'easeOut' }}
                    aria-hidden
                  />
                ))
              : null}
            <ShowdownArrows
              markerId={`sd-arr-${arrowMarkerId}`}
              revealActive={buildPhase || (revealActive && instant)}
              instant={instant || !buildPhase}
              flavor={flavor}
            />
            {placed.map(({ match, x, y, accent, delay, motionKey }) => {
              const m = flavor.matchMotion[motionKey];
              const matchBaseDelay = instant || reduceMotion ? 0 : delay + m.delayJitter;
              return (
                <motion.div
                  key={match.id}
                  className="absolute z-20"
                  style={{ left: x, top: y }}
                  initial={
                    instant || reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          scale: m.scale,
                          rotate: m.rotate,
                          x: m.x,
                          y: m.y,
                        }
                  }
                  animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
                  transition={{
                    duration: m.duration,
                    delay: matchBaseDelay,
                    ease: flavor.ease,
                  }}
                >
                  <MatchCard
                    match={match}
                    accent={accent}
                    teamReveal={buildPhase && !reduceMotion}
                    flavor={flavor}
                    motionKey={motionKey}
                    matchBaseDelay={matchBaseDelay}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <BracketScheduleFoot poolCode="Showdown" fixtures={fixtures} />
    </div>
  );
}

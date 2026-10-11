import { motion, useReducedMotion } from 'framer-motion';

type Pose = 'batter' | 'bowler' | 'keeper';

type Props = {
  pose: Pose;
  className?: string;
  /** 0–1 visual strength */
  strength?: number;
};

function BatterSvg() {
  return (
    <svg viewBox="0 0 240 320" fill="currentColor" className="h-full w-full" aria-hidden>
      <ellipse cx="120" cy="300" rx="95" ry="12" opacity="0.35" />
      <rect x="108" y="118" width="24" height="100" rx="3" />
      <circle cx="120" cy="92" r="26" />
      <path d="M132 140 L220 55 L232 72 L145 158 Z" />
      <rect x="205" y="38" width="28" height="100" rx="4" transform="rotate(-42 205 38)" />
      <rect x="95" y="218" width="18" height="82" rx="2" />
      <rect x="127" y="218" width="18" height="82" rx="2" />
    </svg>
  );
}

function BowlerSvg() {
  return (
    <svg viewBox="0 0 240 320" fill="currentColor" className="h-full w-full" aria-hidden>
      <ellipse cx="120" cy="300" rx="95" ry="12" opacity="0.35" />
      <circle cx="120" cy="88" r="26" />
      <path d="M108 115 Q90 200 115 280 L135 280 Q155 200 132 115 Z" />
      <path d="M75 130 L45 95 L58 82 L95 118 Z" />
      <path d="M165 125 L195 88 L208 102 L172 140 Z" />
      <circle cx="195" cy="75" r="14" />
      <rect x="108" y="268" width="24" height="32" rx="2" />
    </svg>
  );
}

function KeeperSvg() {
  return (
    <svg viewBox="0 0 240 320" fill="currentColor" className="h-full w-full" aria-hidden>
      <ellipse cx="120" cy="300" rx="95" ry="12" opacity="0.35" />
      <circle cx="120" cy="92" r="26" />
      <rect x="108" y="118" width="24" height="95" rx="3" />
      <path d="M60 160 L30 120 L45 108 L78 145 Z" />
      <path d="M180 160 L210 115 L225 128 L192 168 Z" />
      <rect x="95" y="213" width="22" height="75" rx="2" />
      <rect x="123" y="213" width="22" height="75" rx="2" />
    </svg>
  );
}

const POSE_MAP = { batter: BatterSvg, bowler: BowlerSvg, keeper: KeeperSvg };

export function CricketerSilhouette({ pose, className = '', strength = 0.28 }: Props) {
  const Figure = POSE_MAP[pose];
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      style={{ opacity: strength }}
      aria-hidden
      animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Figure />
    </motion.div>
  );
}

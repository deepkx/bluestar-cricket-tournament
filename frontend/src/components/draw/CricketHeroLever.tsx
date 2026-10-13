import { motion } from 'framer-motion';

type Props = {
  pulling: boolean;
};

export function CricketHeroLever({ pulling }: Props) {
  return (
    <div className="relative flex h-[200px] w-full items-end justify-center sm:h-[240px]">
      <svg viewBox="0 0 200 280" className="h-full w-full text-paper" aria-hidden>
        <ellipse cx="100" cy="268" rx="70" ry="8" fill="currentColor" opacity="0.15" />
        {/* Stickman */}
        <circle cx="72" cy="88" r="18" fill="currentColor" />
        <rect x="64" y="106" width="16" height="72" rx="3" fill="currentColor" />
        <rect x="52" y="178" width="14" height="72" rx="2" fill="currentColor" />
        <rect x="78" y="178" width="14" height="68" rx="2" fill="currentColor" />
        {/* Arm to lever */}
        <path d="M80 120 L118 100" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </svg>

      <motion.div
        className="absolute right-2 top-[28%] origin-bottom-left"
        style={{ width: 14, height: 120 }}
        animate={{ rotate: pulling ? 52 : -8 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      >
        <div className="h-full w-full rounded-full bg-gradient-to-b from-floodlight-bright to-floodlight-dim shadow-[0_0_12px_rgba(229,160,23,0.5)]" />
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-floodlight bg-ink-deep" />
      </motion.div>
    </div>
  );
}

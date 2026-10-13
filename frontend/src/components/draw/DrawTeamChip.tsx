import { motion } from 'framer-motion';
import { mediaUrl } from '../../utils/mediaUrl';

export type DrawTeamInfo = {
  teamName: string;
  logoUrl: string | null;
};

type Props = {
  team: DrawTeamInfo;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'pool';
  highlight?: boolean;
  dimmed?: boolean;
  layoutId?: string;
  className?: string;
  /** Odd-row gold styling (teams list parity) */
  nameGold?: boolean;
};

const sizeClasses = {
  xs: { box: 'h-7 w-7 text-[10px]', pad: 'gap-1.5 px-1.5 py-1 text-[11px]', name: 'truncate max-w-[5.5rem] font-medium' },
  sm: { box: 'h-8 w-8 text-xs', pad: 'gap-2 px-2 py-1.5 text-xs', name: 'truncate max-w-[6.5rem] font-medium' },
  md: { box: 'h-11 w-11 text-sm', pad: 'gap-3 px-3 py-2.5 text-sm', name: 'truncate min-w-0 flex-1 font-medium' },
  lg: {
    box: 'h-14 w-14 text-base',
    pad: 'gap-3 px-3 py-2.5 text-base',
    name: 'font-display text-lg leading-snug break-words whitespace-normal flex-1 min-w-0',
  },
  pool: {
    box: 'h-9 w-9 sm:h-10 sm:w-10 text-sm',
    pad: 'gap-2.5 px-0 py-0 sm:gap-3',
    name: 'font-display text-[15px] leading-tight break-words whitespace-normal flex-1 min-w-0 sm:text-base sm:leading-snug',
  },
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function DrawTeamChip({
  team,
  size = 'sm',
  highlight,
  dimmed,
  layoutId,
  className = '',
  nameGold,
}: Props) {
  const s = sizeClasses[size];
  const logo = mediaUrl(team.logoUrl);
  const isPool = size === 'pool';
  const Wrapper = layoutId ? motion.div : 'div';
  const wrapperProps = layoutId
    ? {
        layoutId,
        layout: 'position' as const,
        transition: { type: 'spring' as const, stiffness: 380, damping: 32 },
      }
    : {};

  const nameColor = nameGold
    ? 'text-floodlight-bright'
    : highlight
      ? 'text-floodlight-bright'
      : isPool
        ? 'text-paper'
        : 'text-paper';

  return (
    <Wrapper
      {...wrapperProps}
      className={`flex min-w-0 items-start rounded-sm ${s.pad} ${
        isPool
          ? 'w-full border-0 bg-transparent'
          : `items-center border ${
              highlight
                ? 'border-floodlight/70 bg-floodlight/15 shadow-[0_0_18px_rgba(229,160,23,0.25)]'
                : dimmed
                  ? 'border-paper/8 bg-ink-deep/40 opacity-35'
                  : 'border-paper/15 bg-turf/30'
            }`
      } ${className}`}
    >
      <span
        className={`relative mt-0.5 flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-paper/20 bg-ink-deep/60 ${s.box}`}
      >
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="font-display text-floodlight-dim">{initials(team.teamName)}</span>
        )}
        {highlight ? (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-floodlight/80"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.45, repeat: Infinity }}
          />
        ) : null}
      </span>
      <span className={`tracking-wide ${s.name} ${nameColor}`}>{team.teamName}</span>
    </Wrapper>
  );
}

export function teamInfoFromMap(name: string, map: Map<string, DrawTeamInfo>): DrawTeamInfo {
  return map.get(name) ?? { teamName: name || '—', logoUrl: null };
}

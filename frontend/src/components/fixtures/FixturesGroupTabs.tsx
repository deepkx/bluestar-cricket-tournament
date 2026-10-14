const POOLS = ['A', 'B', 'C', 'D'] as const;

type Props = {
  active: string;
  onChange: (pool: string) => void;
  counts: Map<string, number>;
  /** Lock tabs while auto-cycling pools during reveal. */
  revealLocked?: boolean;
  revealPoolIndex?: number;
};

export function FixturesGroupTabs({ active, onChange, counts, revealLocked = false, revealPoolIndex }: Props) {
  return (
    <div
      className="flex flex-wrap gap-0 border border-paper/15 bg-ink-deep/50"
      role="tablist"
      aria-label="Fixture pools"
    >
      {POOLS.map((code) => {
        const selected = active === code;
        const n = counts.get(code) ?? 0;
        return (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`fixtures-tab-${code}`}
            aria-controls={`fixtures-panel-${code}`}
            onClick={() => {
              if (revealLocked) return;
              onChange(code);
            }}
            disabled={revealLocked && !selected}
            className={`min-w-[4.5rem] flex-1 px-4 py-3 text-sm font-semibold transition-colors sm:min-w-0 sm:flex-none sm:px-8 ${
              selected
                ? 'bg-floodlight text-black'
                : revealLocked
                  ? 'cursor-default text-paper/35'
                  : 'text-paper/60 hover:bg-paper/5 hover:text-paper'
            } ${revealPoolIndex !== undefined && POOLS.indexOf(code) === revealPoolIndex && !selected ? 'animate-pulse' : ''}`}
          >
            Pool {code}
            {n > 0 ? (
              <span className={`ml-1.5 tabular-nums ${selected ? 'text-black/60' : 'text-paper/35'}`}>
                ({n})
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

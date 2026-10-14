import {
  formatSquadPhotoProgress,
  isSquadPhotoComplete,
  squadPhotoTarget,
  type SquadProgress,
} from '../../utils/squadProgress';

type Props = {
  progress: SquadProgress | undefined;
  minSquad: number;
  /** compact for team list row */
  variant?: 'inline' | 'panel';
};

export function SquadProgressBadge({ progress, minSquad, variant = 'inline' }: Props) {
  const label = formatSquadPhotoProgress(progress, minSquad);
  if (!label) return null;

  const complete = isSquadPhotoComplete(progress, minSquad);
  const target = squadPhotoTarget(progress, minSquad);
  const missing = (progress?.photoCount ?? 0) < target;

  if (variant === 'panel') {
    return (
      <div
        className={`mt-4 rounded-md border px-4 py-3 text-sm ${
          complete
            ? 'border-floodlight/35 bg-floodlight/10 text-floodlight-bright'
            : 'border-paper/15 bg-turf/25 text-paper/75'
        }`}
      >
        <p className="font-semibold tabular-nums">Squad photos: {label}</p>
        {!complete ? (
          <p className="mt-1 text-xs text-paper/50">
            Upload a photo for every player listed. Tap <strong className="text-paper/70">Edit squad</strong> to
            finish.
          </p>
        ) : (
          <p className="mt-1 text-xs text-paper/50">All required photos are on file.</p>
        )}
      </div>
    );
  }

  return (
    <span
      className={`tabular-nums text-[11px] font-semibold sm:text-xs ${
        complete ? 'text-floodlight-bright' : missing ? 'text-amber-200/90' : 'text-paper/55'
      }`}
      title="Photos uploaded / squad size"
    >
      {label}
    </span>
  );
}

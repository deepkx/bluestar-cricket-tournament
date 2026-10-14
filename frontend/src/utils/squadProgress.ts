import type { CaptainPlayerDraft } from '../data/captainRoster';

export type SquadProgress = {
  playerCount: number;
  photoCount: number;
};

export function squadPhotoTarget(progress: SquadProgress | undefined, minSquad: number): number {
  if (!progress || progress.playerCount === 0) return minSquad;
  return Math.max(progress.playerCount, minSquad);
}

/** e.g. "10/11" for photos uploaded vs squad size */
export function formatSquadPhotoProgress(progress: SquadProgress | undefined, minSquad: number): string | null {
  if (!progress || progress.playerCount === 0) return null;
  const target = squadPhotoTarget(progress, minSquad);
  return `${progress.photoCount}/${target}`;
}

export function isSquadPhotoComplete(progress: SquadProgress | undefined, minSquad: number): boolean {
  if (!progress || progress.playerCount === 0) return false;
  const target = squadPhotoTarget(progress, minSquad);
  return progress.photoCount >= target && progress.playerCount >= minSquad;
}

export type SquadCompletionStatus = 'complete' | 'in_progress' | 'not_started';

/** Confirmed team squad state for public team board grouping. */
export function squadCompletionStatus(
  progress: SquadProgress | undefined,
  minSquad: number,
  hasTeamInDb: boolean,
): SquadCompletionStatus {
  if (isSquadPhotoComplete(progress, minSquad)) return 'complete';
  if (!hasTeamInDb || !progress || progress.playerCount === 0) return 'not_started';
  return 'in_progress';
}

export function countDraftNamed(players: CaptainPlayerDraft[]): number {
  return players.filter((p) => p.fullName.trim()).length;
}

export function countDraftPhotos(players: CaptainPlayerDraft[]): number {
  return players.filter((p) => p.fullName.trim() && (p.photo || p.existingPhotoPath)).length;
}

export function playerHasPhoto(p: CaptainPlayerDraft): boolean {
  return Boolean(p.photo || p.existingPhotoPath);
}

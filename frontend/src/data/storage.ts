import { requireSupabase } from '../lib/supabase';

export const TEAM_MEDIA_BUCKET = 'team-media';

export function storagePublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/')) return path;
  const sb = requireSupabase();
  const { data } = sb.storage.from(TEAM_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function extFromFile(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

export async function uploadTeamLogo(teamId: string, file: File): Promise<string> {
  const sb = requireSupabase();
  const path = `${teamId}/logo.${extFromFile(file)}`;
  const { error } = await sb.storage.from(TEAM_MEDIA_BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function uploadPlayerPhoto(teamId: string, playerId: string, file: File): Promise<string> {
  const sb = requireSupabase();
  const path = `${teamId}/players/${playerId}.${extFromFile(file)}`;
  const { error } = await sb.storage.from(TEAM_MEDIA_BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function removeStoragePaths(paths: string[]) {
  const sb = requireSupabase();
  const toRemove = paths.filter(Boolean);
  if (toRemove.length === 0) return;
  await sb.storage.from(TEAM_MEDIA_BUCKET).remove(toRemove);
}

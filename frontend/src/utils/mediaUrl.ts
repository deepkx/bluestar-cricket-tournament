import { storagePublicUrl } from '../data/storage';

/** Resolve stored media paths to a browser URL (Supabase public storage or site assets). */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/')) return path;
  try {
    return storagePublicUrl(path);
  } catch {
    return null;
  }
}

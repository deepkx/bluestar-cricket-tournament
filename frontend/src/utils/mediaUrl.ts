/** Resolve API upload paths when frontend and API are on different origins in production. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

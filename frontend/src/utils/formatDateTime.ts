export function formatRegisteredAt(iso: string | null | undefined, timeZone = 'Asia/Kolkata'): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const msg = (err as { message?: string })?.message;
  if (msg) return msg;
  const details = (err as { details?: string })?.details;
  if (details) return details;
  return fallback;
}

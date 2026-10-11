/** Format API instant for `<input type="datetime-local" />` in a given IANA timezone. */
export function instantToDatetimeLocalInput(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return '';
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(iso));
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const hour = get('hour') === '24' ? '00' : get('hour');
    return `${get('year')}-${get('month')}-${get('day')}T${hour.padStart(2, '0')}:${get('minute').padStart(2, '0')}`;
  } catch {
    return '';
  }
}

/** Parse datetime-local value as wall time in `timeZone`, return UTC ISO instant. */
export function datetimeLocalInputToInstant(localValue: string, timeZone: string): string | null {
  const trimmed = localValue.trim();
  if (!trimmed) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const hh = Number(match[4]);
  const mm = Number(match[5]);

  let guess = Date.UTC(y, mo - 1, d, hh, mm);
  for (let i = 0; i < 5; i++) {
    const back = instantToDatetimeLocalInput(new Date(guess).toISOString(), timeZone);
    if (back === trimmed) return new Date(guess).toISOString();
    const backMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(back);
    if (!backMatch) break;
    const diffMin =
      (y - Number(backMatch[1])) * 525600 +
      (mo - Number(backMatch[2])) * 43200 +
      (d - Number(backMatch[3])) * 1440 +
      (hh - Number(backMatch[4])) * 60 +
      (mm - Number(backMatch[5]));
    guess -= diffMin * 60_000;
  }
  return new Date(guess).toISOString();
}

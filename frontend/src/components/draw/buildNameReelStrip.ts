export function buildNameReelStrip(remaining: string[], winner: string, laps = 7): string[] {
  const strip: string[] = [];
  const pool = remaining.filter(Boolean);
  if (pool.length === 0) return [winner];

  for (let lap = 0; lap < laps; lap++) {
    strip.push(...[...pool].sort(() => Math.random() - 0.5));
  }
  strip.push(...[...pool.filter((n) => n !== winner)].sort(() => Math.random() - 0.5), winner);
  return strip;
}

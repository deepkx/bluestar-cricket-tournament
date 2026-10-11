/** Grayscale background cricket photos — replace JPGs in `frontend/public/` (same filenames). */
export type CricketBgKey = 'batter' | 'bowler' | 'celebrate';

export const CRICKET_BACKGROUNDS: Record<
  CricketBgKey,
  { src: string; position: string; opacity: number; silhouette: 'batter' | 'bowler' | 'keeper' }
> = {
  batter: {
    src: '/bg-cricketer-batter.jpg',
    position: '75% 15%',
    opacity: 0.52,
    silhouette: 'batter',
  },
  bowler: {
    src: '/bg-cricketer-bowler.jpg',
    position: '20% 25%',
    opacity: 0.48,
    silhouette: 'bowler',
  },
  celebrate: {
    src: '/bg-cricketer-celebrate.jpg',
    position: '85% 30%',
    opacity: 0.4,
    silhouette: 'keeper',
  },
};

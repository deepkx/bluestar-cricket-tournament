import type { CricketBgKey } from '../../content/cricketBackgrounds';
import { CRICKET_BACKGROUNDS } from '../../content/cricketBackgrounds';
import { PitchOvalCrease } from './PitchOvalCrease';

type Props = {
  photo: CricketBgKey;
  tone?: 'dark' | 'light';
  /** Hero needs a stronger, edge-bleed treatment */
  emphasis?: 'section' | 'hero';
  className?: string;
};

export function CricketPhotoBackdrop({ photo, tone = 'dark', emphasis = 'section', className = '' }: Props) {
  const cfg = CRICKET_BACKGROUNDS[photo];
  const isHero = emphasis === 'hero';

  const photoOpacity = isHero ? cfg.opacity * 1.35 : cfg.opacity;
  const photoBrightness = isHero ? 0.55 : 0.5;

  const scrimDark = isHero
    ? 'bg-gradient-to-r from-ink-deep/95 from-35% via-ink-deep/60 via-55% to-ink-deep/20'
    : 'bg-gradient-to-r from-ink-deep/92 via-ink-deep/75 to-ink/40';

  const scrimLight =
    'bg-gradient-to-l from-chalk/97 from-45% via-chalk/92 via-70% to-chalk/75';

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div
        className={`absolute bg-cover bg-no-repeat grayscale contrast-[1.15] saturate-0 ${isHero ? '-right-[8%] top-0 h-full w-[min(85vw,720px)]' : 'inset-0 scale-110'}`}
        style={{
          backgroundImage: `url('${cfg.src}'), url('/bg-cricketer-batter.svg')`,
          backgroundPosition: cfg.position,
          opacity: Math.min(photoOpacity, tone === 'light' ? 0.38 : 0.85),
          filter: `brightness(${photoBrightness})`,
        }}
      />
      <div className={`absolute inset-0 ${tone === 'dark' ? scrimDark : scrimLight}`} />
      <PitchOvalCrease
        tone={tone === 'dark' ? 'dark' : 'light'}
        variant={isHero ? 'hero' : 'section'}
        className="z-[1]"
      />
    </div>
  );
}

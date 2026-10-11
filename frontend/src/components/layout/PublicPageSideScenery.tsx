import { CricketerSilhouette } from '../ui/CricketerSilhouette';
import { PitchOvalCrease } from '../ui/PitchOvalCrease';

type Variant = 'photos' | 'heroes';

type Props = {
  fadeToCenter?: boolean;
  variant?: Variant;
};

function SidePanel({
  side,
  image,
  fadeToCenter,
  showHero,
  heroPose,
}: {
  side: 'left' | 'right';
  image: string;
  fadeToCenter: boolean;
  showHero: boolean;
  heroPose: 'batter' | 'bowler';
}) {
  const isLeft = side === 'left';
  const panelWidth = showHero ? 'w-[min(26vw,280px)]' : 'w-[min(32vw,360px)]';

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 hidden overflow-hidden md:block ${panelWidth} ${
        isLeft ? 'left-0' : 'right-0'
      }`}
      aria-hidden
    >
      <div
        className={`absolute inset-0 bg-cover bg-center grayscale contrast-[1.05] ${
          showHero ? 'scale-105 opacity-[0.22] brightness-[0.3]' : 'scale-110 brightness-[0.45]'
        }`}
        style={{ backgroundImage: `url('${image}')` }}
      />
      {!showHero ? (
        <PitchOvalCrease
          tone="dark"
          variant="section"
          className={`opacity-45 ${isLeft ? '-translate-x-[18%]' : 'translate-x-[18%]'}`}
        />
      ) : null}
      {showHero ? (
        <CricketerSilhouette
          pose={heroPose}
          strength={0.28}
          className={`absolute bottom-0 z-[1] h-[min(42vh,320px)] w-[min(22vw,160px)] opacity-70 ${
            isLeft ? '-left-4' : '-right-4'
          }`}
        />
      ) : null}
      <div className={`noise-overlay absolute inset-0 ${showHero ? 'opacity-10' : 'opacity-25'}`} />
      <div
        className={`absolute inset-0 ${
          showHero
            ? isLeft
              ? 'bg-gradient-to-r from-ink-deep/40 via-ink-deep/92 to-ink-deep'
              : 'bg-gradient-to-l from-ink-deep/40 via-ink-deep/92 to-ink-deep'
            : fadeToCenter
              ? isLeft
                ? 'bg-gradient-to-r from-ink-deep/15 via-ink-deep/75 to-ink-deep'
                : 'bg-gradient-to-l from-ink-deep/15 via-ink-deep/75 to-ink-deep'
              : isLeft
                ? 'bg-gradient-to-r from-transparent via-ink-deep/55 to-ink-deep'
                : 'bg-gradient-to-l from-transparent via-ink-deep/55 to-ink-deep'
        }`}
      />
    </div>
  );
}

export function PublicPageSideScenery({ fadeToCenter = true, variant = 'photos' }: Props) {
  const heroes = variant === 'heroes';

  return (
    <>
      <SidePanel
        side="left"
        image="/bg-cricketer-bowler.jpg"
        fadeToCenter={fadeToCenter}
        showHero={heroes}
        heroPose="bowler"
      />
      <SidePanel
        side="right"
        image={heroes ? '/bg-cricketer-celebrate.jpg' : '/bg-cricketer-batter.jpg'}
        fadeToCenter={fadeToCenter}
        showHero={heroes}
        heroPose="batter"
      />
    </>
  );
}

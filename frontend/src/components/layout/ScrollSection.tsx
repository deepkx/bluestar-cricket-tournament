import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { CRICKET_BACKGROUNDS, type CricketBgKey } from '../../content/cricketBackgrounds';
import { CricketPhotoBackdrop } from '../ui/CricketPhotoBackdrop';
import { PitchOvalCrease } from '../ui/PitchOvalCrease';
import { CricketerSilhouette } from '../ui/CricketerSilhouette';

type Props = {
  index: string;
  title: string;
  children: ReactNode;
  invert?: boolean;
  wide?: boolean;
  kicker?: string;
  cricketPhoto?: CricketBgKey;
};

export function ScrollSection({
  index,
  title,
  children,
  invert = false,
  wide = false,
  kicker,
  cricketPhoto,
}: Props) {
  return (
    <motion.section
      className={`section-zig relative overflow-hidden px-4 py-16 sm:py-20 md:py-28 ${invert ? 'bg-chalk text-ink' : 'bg-ink-deep text-paper'}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.5 }}
    >
      {!cricketPhoto ? (
        <PitchOvalCrease tone={invert ? 'light' : 'dark'} variant="section" className="opacity-40" />
      ) : null}
      {cricketPhoto ? (
        <>
          <CricketPhotoBackdrop photo={cricketPhoto} tone={invert ? 'light' : 'dark'} emphasis="section" />
          <CricketerSilhouette
            pose={CRICKET_BACKGROUNDS[cricketPhoto].silhouette}
            strength={invert ? 0.22 : 0.38}
            className={`absolute bottom-0 z-[1] h-48 w-36 sm:h-56 sm:w-44 md:h-64 md:w-52 ${
              cricketPhoto === 'bowler' ? '-left-4 md:-left-6' : '-right-2 md:-right-4'
            } ${invert ? 'text-ink' : 'text-paper'}`}
          />
        </>
      ) : null}
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: invert ? 24 : -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className={`font-display text-5xl opacity-[0.06] sm:text-6xl md:text-8xl ${invert ? 'text-ink' : 'text-paper'}`}
          >
            {index}
          </p>
          {kicker ? (
            <p className={`-mt-6 sm:-mt-8 md:-mt-12 ${invert ? 'hud-label-dark' : 'hud-label'}`}>{kicker}</p>
          ) : null}
          <h2
            className={`font-display text-3xl tracking-wide sm:text-4xl md:text-5xl ${kicker ? 'mt-1' : '-mt-6 sm:-mt-8 md:-mt-12'}`}
          >
            {title}
          </h2>
          <div
            className={`mt-8 text-sm leading-relaxed opacity-80 sm:mt-10 sm:text-base ${wide ? '' : 'max-w-3xl'}`}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

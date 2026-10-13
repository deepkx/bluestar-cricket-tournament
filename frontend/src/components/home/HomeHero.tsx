import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOME_EVENT } from '../../content/homeEvent';
import { CricketPhotoBackdrop } from '../ui/CricketPhotoBackdrop';
import { CricketerSilhouette } from '../ui/CricketerSilhouette';
import type { TournamentPublic } from '../../types/api';

type Props = {
  tournament: TournamentPublic;
  introActive: boolean;
};

export function HomeHero({ tournament, introActive }: Props) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 60]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.35]);
  const scrollCueOpacity = useTransform(scrollY, [0, 40], [1, 0]);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center grayscale contrast-[1.1] brightness-[0.35]"
        style={{ backgroundImage: "url('/hero-stadium.jpg'), url('/hero-stadium.svg')" }}
        role="img"
        aria-label="Cricket stadium"
      />
      <CricketPhotoBackdrop photo="batter" emphasis="hero" />
      <CricketerSilhouette
        pose="batter"
        strength={0.42}
        className="absolute -bottom-4 -right-4 z-[1] h-[min(72vh,520px)] w-[min(55vw,340px)] sm:-right-8 md:h-[min(78vh,580px)] md:w-[380px]"
      />
      <CricketerSilhouette
        pose="bowler"
        strength={0.12}
        className="absolute bottom-8 left-[-5%] z-[1] hidden h-64 w-44 md:block lg:h-80 lg:w-52"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/80 to-ink/40" />
      <div className="noise-overlay absolute inset-0" />
      <div className="floodlight-sweep absolute inset-0 opacity-30" />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className={`relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col items-center justify-center px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] text-center sm:px-6 ${
          introActive ? 'pointer-events-none' : ''
        }`}
      >
        <motion.div
          className="flex w-full max-w-3xl flex-col items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: introActive ? 0 : 1, y: introActive ? 40 : 0 }}
          transition={{ duration: 0.8, delay: introActive ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hud-label">{HOME_EVENT.displayTitle}</p>
          <h1 className="font-display mt-2 max-w-5xl text-[clamp(2.25rem,8.5vw,4.5rem)] leading-[1.02] tracking-wide text-paper sm:mt-3">
            {tournament.name}
          </h1>
          <p className="font-display mt-5 text-[clamp(1.5rem,5vw,2.75rem)] leading-snug tracking-wide text-floodlight-dim sm:mt-6">
            {HOME_EVENT.heroHeadline}
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Link to="/teams" className="btn-primary w-full text-center text-sm sm:min-w-[9rem] sm:w-auto">
              View teams
            </Link>
            <Link to="/about" className="btn-outline w-full text-center text-sm sm:min-w-[9rem] sm:w-auto">
              Rules
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-paper/40"
          style={{
            bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
            opacity: scrollCueOpacity,
          }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

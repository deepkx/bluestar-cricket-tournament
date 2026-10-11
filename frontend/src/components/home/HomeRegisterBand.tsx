import { Link } from 'react-router-dom';
import { HOME_EVENT } from '../../content/homeEvent';
import type { TournamentPublic } from '../../types/api';
import { CricketPhotoBackdrop } from '../ui/CricketPhotoBackdrop';
import { CricketerSilhouette } from '../ui/CricketerSilhouette';

type Props = { tournament: TournamentPublic };

export function HomeRegisterBand({ tournament }: Props) {
  return (
    <div className="relative overflow-hidden border-t border-floodlight/25">
      <CricketPhotoBackdrop photo="bowler" emphasis="section" />
      <CricketerSilhouette
        pose="bowler"
        strength={0.35}
        className="absolute -bottom-6 right-0 z-[1] h-52 w-40 md:h-64 md:w-48"
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
      <div className="max-w-xl">
        <p className="font-display text-[clamp(1.5rem,4vw,2.25rem)] leading-snug tracking-wide text-floodlight-dim">
          {HOME_EVENT.registerMotivationQuote}
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[12rem]">
        {tournament.registrationOpen ? (
          <Link to="/register" className="btn-primary w-full text-center text-sm">
            Register your team
          </Link>
        ) : (
          <>
            <span className="block text-center text-sm text-paper/50">Registration is not open right now.</span>
            <Link to="/about" className="btn-outline w-full text-center text-sm">
              About & rules
            </Link>
          </>
        )}
      </div>
    </div>
    </div>
  );
}

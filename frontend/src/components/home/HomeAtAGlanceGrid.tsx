import { MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { HOME_EVENT } from '../../content/homeEvent';
import type { TournamentPublic } from '../../types/api';

type Props = { tournament: TournamentPublic };

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col py-4 md:py-0 md:px-6 md:first:pl-0 md:last:pr-0">
      <p className="hud-label">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function HomeAtAGlanceGrid({ tournament }: Props) {
  const fee = tournament.entryFeePaise / 100;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-stretch">
        <Stat label="Dates">
          <p className="hud-stat text-xl tracking-wide sm:text-2xl">{HOME_EVENT.dateRange}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {HOME_EVENT.dateTiles.map((d) => (
              <span key={d} className="funk-skew-chip border border-floodlight/35 bg-floodlight/5 px-2 py-1">
                <span className="hud-stat inline-flex min-w-[1.75rem] items-center justify-center text-base">{d}</span>
              </span>
            ))}
          </div>
        </Stat>
        <div className="pitch-crease-h md:hidden" aria-hidden />
        <div className="pitch-crease-v hidden md:block" aria-hidden />
        <Stat label="Entry">
          <p className="hud-stat text-2xl tracking-wide sm:text-3xl">₹{fee}</p>
          <p className="mt-1 text-sm text-paper/55">Per team</p>
        </Stat>
        <div className="pitch-crease-h md:hidden" aria-hidden />
        <div className="pitch-crease-v hidden md:block" aria-hidden />
        <Stat label="Format">
          <p className="hud-stat text-xl tracking-wide">{HOME_EVENT.formatLine}</p>
          <p className="mt-1 text-sm text-paper/65">{HOME_EVENT.oversLine}</p>
        </Stat>
        <div className="pitch-crease-h md:hidden" aria-hidden />
        <div className="pitch-crease-v hidden md:block" aria-hidden />
        <Stat label="Venue">
          <p className="text-base font-medium text-paper">{HOME_EVENT.venueName}</p>
          <a
            href={HOME_EVENT.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
          >
            <MapPin className="h-3.5 w-3.5 opacity-70" />
            Directions
          </a>
        </Stat>
      </div>
    </div>
  );
}

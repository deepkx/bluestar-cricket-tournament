import { useEffect, useState } from 'react';
import { getCurrentTournament } from '../data/tournament';
import { HomeAtAGlanceGrid } from '../components/home/HomeAtAGlanceGrid';
import { HomeTournamentStartTimer } from '../components/home/HomeTournamentStartTimer';
import { HomeHero } from '../components/home/HomeHero';
import { HomeRegisterBand } from '../components/home/HomeRegisterBand';
import { HomePrizesSection } from '../components/home/HomePrizesSection';
import { HomeVenueMap } from '../components/home/HomeVenueMap';
import { ScrollSection } from '../components/layout/ScrollSection';
import type { AnnouncementPublic, TournamentPublic } from '../types/api';

type Props = { introActive: boolean };

export function HomePage({ introActive }: Props) {
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementPublic[]>([]);

  useEffect(() => {
    getCurrentTournament().then(setTournament);
    setAnnouncements([]);
  }, []);

  if (!tournament) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white/40">Loading…</div>
    );
  }

  return (
    <div className="bg-ink-deep">
      <HomeHero tournament={tournament} introActive={introActive} />

      <ScrollSection index="01" title="At a glance" kicker="Match info" cricketPhoto="bowler">
        <HomeAtAGlanceGrid tournament={tournament} />
      </ScrollSection>

      <ScrollSection index="02" title="Tournament starts" kicker="First ball" invert cricketPhoto="celebrate" wide>
        <HomeTournamentStartTimer tournament={tournament} />
      </ScrollSection>

      <ScrollSection index="03" title="Prizes & awards" kicker="On the line" invert wide>
        <HomePrizesSection />
      </ScrollSection>

      <ScrollSection index="04" title="Venue" kicker="Pitch map" cricketPhoto="batter">
        <HomeVenueMap />
      </ScrollSection>

      <HomeRegisterBand />

      {announcements.length > 0 && (
        <ScrollSection index="05" title="News" kicker="Latest" invert>
          <ul className="space-y-8">
            {announcements.map((a, i) => (
              <li key={i}>
                <h3 className="font-display text-xl tracking-wide">{a.title}</h3>
                <p className="mt-2 text-ink/65">{a.message}</p>
              </li>
            ))}
          </ul>
        </ScrollSection>
      )}
    </div>
  );
}

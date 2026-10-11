import { HOME_EVENT, resolveTournamentStartIso } from '../../content/homeEvent';
import type { TournamentPublic } from '../../types/api';
import { CountdownDisplay } from '../ui/CountdownDisplay';

type Props = { tournament: TournamentPublic };

export function HomeTournamentStartTimer({ tournament }: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="max-w-lg text-sm text-ink/70">
        {HOME_EVENT.dateRange} · {HOME_EVENT.dailyTime} · {HOME_EVENT.venueName}
      </p>
      <div className="mt-8 w-full max-w-3xl">
        <CountdownDisplay
          targetIso={resolveTournamentStartIso(tournament.tournamentStartsAt)}
          timezone={tournament.timezone}
          large
          size="section"
          variant="hud"
          dark
          align="center"
          className="mx-auto items-center"
        />
      </div>
      <p className="mt-8 text-xs text-ink/50">
        {HOME_EVENT.formatLine} · {HOME_EVENT.oversLine}
      </p>
    </div>
  );
}

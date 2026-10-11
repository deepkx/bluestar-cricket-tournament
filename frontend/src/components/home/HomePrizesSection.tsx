import { PLACE_PRIZES, SPECIAL_AWARDS } from '../../content/tournamentPrizes';

export function HomePrizesSection() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {PLACE_PRIZES.map((prize) => (
          <div
            key={prize.place}
            className="border border-ink/12 bg-paper/40 px-4 py-6 text-center sm:px-5 sm:py-7"
          >
            <p className="hud-label-dark">{prize.place} prize</p>
            <p className="font-display mt-3 text-[clamp(1.75rem,4vw,2.5rem)] leading-none tracking-wide text-floodlight-dim">
              {prize.amount}
            </p>
            <p className="mt-2 text-sm font-medium text-ink/75">+ {prize.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 border border-floodlight/35 bg-paper/50 px-5 py-8 sm:mt-14 sm:px-8 sm:py-10">
        <p className="font-display text-center text-2xl tracking-wide text-floodlight-dim sm:text-3xl">Special awards</p>
        <ul className="mt-7 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {SPECIAL_AWARDS.map((award) => (
            <li
              key={award}
              className="border border-floodlight/50 bg-floodlight/15 px-4 py-5 text-center sm:px-5 sm:py-6"
            >
              <span className="font-display text-lg leading-snug tracking-wide text-ink sm:text-xl">{award}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

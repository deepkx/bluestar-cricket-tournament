import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { TOURNAMENT_RULES, TOURNAMENT_RULES_TITLE } from '../content/tournamentRules';

export function AboutPage() {
  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Rules"
        title={TOURNAMENT_RULES_TITLE}
        lead="Official playing conditions for the 360° · 8-over format."
        sideScenery
        sideSceneryVariant="heroes"
      />
      <PublicPageContent width="lg" sideScenery sideSceneryVariant="heroes">
        <div className="scoreboard-frame border-t-2 border-t-floodlight bg-turf/50 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <div className="border-b border-floodlight/25 bg-ink-deep/40 px-6 py-5 sm:px-8">
            <p className="hud-label text-floodlight-bright">Tournament regulations</p>
            <p className="mt-1 text-sm text-paper/55">All teams are bound by the following conditions.</p>
          </div>
          <ol className="divide-y divide-paper/10">
            {TOURNAMENT_RULES.map((rule, index) => (
              <li key={rule.title} className="px-6 py-6 sm:px-8 sm:py-7">
                <p className="font-display text-lg tracking-wide text-floodlight-bright sm:text-xl">
                  <span className="text-floodlight-dim">{String(index + 1).padStart(2, '0')}.</span>{' '}
                  {rule.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-paper/88 sm:text-base">{rule.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </PublicPageContent>
    </div>
  );
}

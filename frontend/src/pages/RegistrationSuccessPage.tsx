import { useSearchParams, Link } from 'react-router-dom';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';

export function RegistrationSuccessPage() {
  const [params] = useSearchParams();
  const ref = params.get('ref') ?? '';

  return (
    <div className="bg-ink-deep pb-20">
      <PublicPageHero kicker="Confirmed" title="Registration complete" sideScenery />
      <PublicPageContent width="md" sideScenery>
        <div className="register-panel px-6 py-10 text-center sm:px-10">
          <p className="text-paper/75">Your team details were submitted and appear on the team board for everyone.</p>
          {ref ? (
            <p className="mt-4 font-mono text-sm text-paper/55">
              Reference <span className="text-floodlight-bright">{ref}</span>
            </p>
          ) : null}
          <Link to="/teams" className="btn-primary mt-8 inline-block text-center text-sm">
            View teams
          </Link>
        </div>
      </PublicPageContent>
    </div>
  );
}

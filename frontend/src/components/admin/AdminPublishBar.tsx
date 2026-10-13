import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  adminDisplayFixturesPublic,
  adminDisplayPoolsPublic,
  adminSetFixturesBoardPhase,
  adminSetPoolsBoardPhase,
  adminSetTeamsBoardPhase,
  adminStartFixturesCountdown,
  adminStartPoolsCountdown,
  adminStopFixturesCountdown,
  adminStopPoolsCountdown,
} from '../../data/sitePublish';
import { apiErrorMessage } from '../../utils/errors';

export type AdminPublishPreset = 'teams' | 'pools' | 'fixtures' | 'pools-and-fixtures';

type Props = {
  preset: AdminPublishPreset;
  onUpdated?: () => void;
  className?: string;
  /** Short title above buttons (e.g. "Pools page") */
  title?: string;
};

export function AdminPublishBar({ preset, onUpdated, className = '', title }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr('');
    try {
      await fn();
      onUpdated?.();
    } catch (e) {
      const msg = apiErrorMessage(e, 'Could not update publish state.');
      const missingPublishColumns =
        msg.includes('fixtures_board_phase') ||
        msg.includes('pools_board_phase') ||
        msg.includes('teams_board_phase') ||
        msg.includes('schema cache');
      setErr(
        missingPublishColumns
          ? `${msg} — Run supabase/migrations/009_site_publish_phases.sql in Supabase SQL editor, then retry (Settings → API → Reload schema if needed).`
          : msg,
      );
    } finally {
      setBusy(false);
    }
  };

  const btn = (label: string, action: () => Promise<void>) => (
    <button
      key={label}
      type="button"
      className="btn-outline text-xs sm:text-sm"
      disabled={busy}
      onClick={() => void run(action)}
    >
      {label}
    </button>
  );

  const poolsControls = [
    btn('Start countdown', adminStartPoolsCountdown),
    btn('Stop countdown', adminStopPoolsCountdown),
    btn('Start animation', () => adminSetPoolsBoardPhase('animating')),
    btn('Stop animation', () => adminSetPoolsBoardPhase('visible')),
    btn('Display pools', adminDisplayPoolsPublic),
  ];

  const fixturesControls = [
    btn('Start countdown', adminStartFixturesCountdown),
    btn('Stop countdown', adminStopFixturesCountdown),
    btn('Start animation', () => adminSetFixturesBoardPhase('animating')),
    btn('Stop animation', () => adminSetFixturesBoardPhase('visible')),
    btn('Display fixtures', adminDisplayFixturesPublic),
  ];

  const teamBtns = [
    btn('Start animation', () => adminSetTeamsBoardPhase('animating')),
    btn('Stop animation', () => adminSetTeamsBoardPhase('visible')),
    btn('Display pools', adminDisplayPoolsPublic),
  ];

  const buttons =
    preset === 'teams' ? teamBtns : preset === 'pools' ? poolsControls : fixturesControls;

  const viewPath = preset === 'pools' ? '/pools' : preset === 'fixtures' ? '/fixtures' : '/teams';

  if (preset === 'pools-and-fixtures') {
    return (
      <div className={`space-y-4 ${className}`}>
        <AdminPublishBarInner title="Public Pools page (/pools)" viewPath="/pools" buttons={poolsControls} err={err} />
        <AdminPublishBarInner
          title="Public Fixtures page (/fixtures)"
          viewPath="/fixtures"
          buttons={fixturesControls}
          err={err}
        />
      </div>
    );
  }

  return (
    <div
      className={`border border-floodlight/30 bg-turf/30 px-4 py-4 ${className}`}
      role="region"
      aria-label="Admin publish controls"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="hud-label text-floodlight-dim">{title ?? 'Admin — live site controls'}</p>
          <p className="mt-1 text-xs text-paper/50">
            Updates what all visitors see on the public page (syncs within a few seconds).
          </p>
        </div>
        {preset !== 'teams' ? (
          <Link to={viewPath} className="btn-primary shrink-0 text-xs sm:text-sm">
            Open {preset} page
          </Link>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{buttons}</div>
      {err ? <p className="mt-2 text-xs text-red-300">{err}</p> : null}
    </div>
  );
}

function AdminPublishBarInner({
  title,
  viewPath,
  buttons,
  err,
  className = '',
}: {
  title: string;
  viewPath: string;
  buttons: ReactNode[];
  err: string;
  className?: string;
}) {
  return (
    <div className={`border border-floodlight/30 bg-turf/30 px-4 py-4 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="hud-label text-floodlight-dim">{title}</p>
          <p className="mt-1 text-xs text-paper/50">Updates what all visitors see (syncs within a few seconds).</p>
        </div>
        <Link to={viewPath} className="btn-primary shrink-0 text-xs sm:text-sm">
          Open page
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{buttons}</div>
      {err ? <p className="mt-2 text-xs text-red-300">{err}</p> : null}
    </div>
  );
}

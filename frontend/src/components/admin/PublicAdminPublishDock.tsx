import { useState } from 'react';
import { AdminGateModal } from './AdminGateModal';
import { AdminPublishBar, type AdminPublishPreset } from './AdminPublishBar';
import { useAdminSession } from '../../hooks/useAdminSession';

type Props = {
  preset: Exclude<AdminPublishPreset, 'pools-and-fixtures'>;
  onUpdated?: () => void;
};

/** Always visible on public pages — sign-in gate or full publish bar. */
export function PublicAdminPublishDock({ preset, onUpdated }: Props) {
  const isAdmin = useAdminSession();
  const [gateOpen, setGateOpen] = useState(false);

  if (isAdmin) {
    const pageTitle =
      preset === 'pools'
        ? 'Public Pools page (/pools)'
        : preset === 'fixtures'
          ? 'Public Fixtures page (/fixtures)'
          : 'Public Teams page (/teams)';
    return <AdminPublishBar preset={preset} onUpdated={onUpdated} title={pageTitle} className="shadow-lg" />;
  }

  return (
    <>
      <div className="border border-floodlight/25 bg-ink-deep/95 px-4 py-4 shadow-lg backdrop-blur-sm">
        <p className="hud-label text-floodlight-dim">Committee draw controls</p>
        <p className="mt-1 text-xs text-paper/55">
          Sign in as admin to start the countdown, run the animation, and publish pools or fixtures for everyone.
        </p>
        <button type="button" className="btn-primary mt-3 text-sm" onClick={() => setGateOpen(true)}>
          Sign in for live controls
        </button>
      </div>
      <AdminGateModal open={gateOpen} onClose={() => setGateOpen(false)} onSuccess={() => setGateOpen(false)} />
    </>
  );
}

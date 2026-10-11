import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { AdminShell } from '../../components/admin/AdminShell';

export function AdminDashboardPage() {
  const [data, setData] = useState<{
    maxTeams: number;
    confirmedRegistrations: number;
    availableSlots: number;
    fixturesPublished: boolean;
  } | null>(null);

  useEffect(() => {
    api.get('/api/v1/admin/dashboard').then((r) => setData(r.data)).catch(() => {});
  }, []);

  return (
    <AdminShell title="Dashboard">
      {!data ? (
        <p className="text-paper/50">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="register-panel px-5 py-5">
              <p className="hud-label text-paper/45">Confirmed teams</p>
              <p className="font-display mt-2 text-3xl tabular-nums text-floodlight-bright">
                {data.confirmedRegistrations}/{data.maxTeams}
              </p>
            </div>
            <div className="register-panel px-5 py-5">
              <p className="hud-label text-paper/45">Available slots</p>
              <p className="font-display mt-2 text-3xl tabular-nums text-paper">{data.availableSlots}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-paper/55">
            Fixtures published:{' '}
            <span className="text-paper">{data.fixturesPublished ? 'Yes' : 'No'}</span>
            {' · '}
            <Link to="/admin/settings" className="text-floodlight-bright underline">
              Change in settings
            </Link>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/admin/teams" className="btn-primary text-center text-sm">
              Team board
            </Link>
            <Link to="/admin/registrations" className="btn-outline text-center text-sm">
              All registrations
            </Link>
          </div>
        </>
      )}
    </AdminShell>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearAdminSession, setAdminToken } from '../../api/client';
import { AdminGateModal } from './AdminGateModal';

const nav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/teams', label: 'Team board' },
  { to: '/admin/registrations', label: 'Registrations' },
  { to: '/admin/settings', label: 'Settings' },
];

type Props = { title: string; children: ReactNode };

export function AdminShell({ title, children }: Props) {
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setGateOpen(true);
      return;
    }
    setAdminToken(token);
    setReady(true);
  }, []);

  const onAuthed = (token: string) => {
    localStorage.setItem('admin_token', token);
    setAdminToken(token);
    setGateOpen(false);
    setReady(true);
  };

  const signOut = () => {
    clearAdminSession();
    navigate('/');
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-ink-deep">
        <AdminGateModal open={gateOpen} onClose={() => navigate('/')} onSuccess={onAuthed} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-deep text-paper">
      <header className="border-b border-paper/12 bg-turf/20">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="hud-label text-floodlight-dim">Admin</p>
            <h1 className="font-display text-xl tracking-wide text-floodlight-bright">{title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="text-sm text-paper/55 hover:text-floodlight-bright">
              View site
            </Link>
            <button type="button" className="text-sm text-paper/55 hover:text-red-300" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 pb-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 text-sm ${
                  isActive
                    ? 'bg-floodlight/15 text-floodlight-bright'
                    : 'text-paper/55 hover:bg-paper/5 hover:text-paper'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
      <AdminGateModal open={gateOpen} onClose={() => navigate('/')} onSuccess={onAuthed} />
    </div>
  );
}

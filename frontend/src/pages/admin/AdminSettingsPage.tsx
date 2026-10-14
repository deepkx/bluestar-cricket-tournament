import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell } from '../../components/admin/AdminShell';
import { HOME_EVENT } from '../../content/homeEvent';
import { fetchSiteConfig, updateSiteConfig } from '../../data/tournament';
import { datetimeLocalToIso, isoToDatetimeLocal } from '../../utils/datetimeLocal';
import { apiErrorMessage } from '../../utils/errors';

export function AdminSettingsPage() {
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [captainRosterOpen, setCaptainRosterOpen] = useState(true);
  const [testMinSquad, setTestMinSquad] = useState(false);
  const [maxTeams, setMaxTeams] = useState(32);
  const [tournamentStartLocal, setTournamentStartLocal] = useState('');
  const [poolsRevealLocal, setPoolsRevealLocal] = useState('');
  const [fixturesRevealLocal, setFixturesRevealLocal] = useState('');
  const [siteSaving, setSiteSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    try {
      const cfg = await fetchSiteConfig();
      setRegistrationOpen(cfg.registration_open);
      setCaptainRosterOpen(cfg.captain_roster_open ?? true);
      setTestMinSquad(cfg.min_squad_size <= 2);
      setMaxTeams(cfg.max_teams);
      setTournamentStartLocal(isoToDatetimeLocal(cfg.tournament_starts_at));
      setPoolsRevealLocal(isoToDatetimeLocal(cfg.pools_reveal_at ?? cfg.fixture_announcement_at));
      setFixturesRevealLocal(isoToDatetimeLocal(cfg.fixtures_reveal_at ?? cfg.fixture_announcement_at));
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load site settings'));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const persist = async (patch: Parameters<typeof updateSiteConfig>[0], message: string) => {
    setSiteSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateSiteConfig(patch);
      setSuccessMsg(message);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save settings'));
    } finally {
      setSiteSaving(false);
    }
  };

  const saveAll = () =>
    void persist(
      {
        registration_open: registrationOpen,
        captain_roster_open: captainRosterOpen,
        max_teams: maxTeams,
        min_squad_size: testMinSquad ? 2 : 11,
        tournament_starts_at: datetimeLocalToIso(tournamentStartLocal),
        pools_reveal_at: datetimeLocalToIso(poolsRevealLocal),
        fixtures_reveal_at: datetimeLocalToIso(fixturesRevealLocal),
      },
      'Site settings saved.',
    );

  return (
    <AdminShell title="Site settings">
      <p className="mb-6 text-sm text-paper/60">
        Countdowns, registration, and captain squad uploads. Publish pools/fixtures from{' '}
        <Link to="/admin/pools" className="text-floodlight-bright underline">
          Pools & fixtures
        </Link>
        .
      </p>

      <section className="register-panel mb-8 space-y-4 px-5 py-5">
        <p className="hud-label text-floodlight-dim">Squad uploads</p>
        <p className="text-sm text-paper/55">
          <strong className="text-paper/75">Captain uploads</strong> — phone login on each team page.{' '}
          <strong className="text-paper/75">New team registration</strong> — public register form (if enabled).
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary text-sm"
            disabled={siteSaving || !captainRosterOpen}
            onClick={() =>
              void persist({ captain_roster_open: true }, 'Captain squad uploads are open.')
            }
          >
            Open captain squad uploads
          </button>
          <button
            type="button"
            className="rounded-sm border border-red-400/50 bg-red-950/40 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-950/70 disabled:opacity-50"
            disabled={siteSaving || !captainRosterOpen}
            onClick={() =>
              void persist({ captain_roster_open: false }, 'Captain squad uploads stopped.')
            }
          >
            Stop captain squad uploads
          </button>
        </div>
        <p className="text-xs text-paper/45">
          Status: captain uploads{' '}
          <span className={captainRosterOpen ? 'text-floodlight-bright' : 'text-red-300'}>
            {captainRosterOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </p>

        <div className="border-t border-paper/10 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-outline text-sm"
              disabled={siteSaving || registrationOpen}
              onClick={() => void persist({ registration_open: true }, 'New team registration open.')}
            >
              Open new team registration
            </button>
            <button
              type="button"
              className="btn-outline text-sm"
              disabled={siteSaving || !registrationOpen}
              onClick={() => void persist({ registration_open: false }, 'New team registration closed.')}
            >
              Stop new team registration
            </button>
          </div>
        </div>

        <label className="mt-2 flex items-center gap-2 text-sm text-paper/75">
          <input type="checkbox" checked={testMinSquad} onChange={(e) => setTestMinSquad(e.target.checked)} />
          2-player squads (testing)
        </label>
        <label className="block max-w-xs">
          <span className="form-label">Max teams on board</span>
          <input
            type="number"
            className="form-field"
            min={2}
            max={64}
            value={maxTeams}
            onChange={(e) => setMaxTeams(Number(e.target.value))}
          />
        </label>
      </section>

      <section className="register-panel mb-8 space-y-4 px-5 py-5">
        <p className="hud-label text-floodlight-dim">Countdowns</p>
        <p className="text-xs text-paper/50">
          Device local timezone. Defaults: {HOME_EVENT.dateRange}.
        </p>
        <label className="block max-w-md">
          <span className="form-label">Home — tournament starts</span>
          <input
            type="datetime-local"
            className="form-field"
            value={tournamentStartLocal}
            onChange={(e) => setTournamentStartLocal(e.target.value)}
          />
        </label>
        <label className="block max-w-md">
          <span className="form-label">Pools page — countdown ends</span>
          <input
            type="datetime-local"
            className="form-field"
            value={poolsRevealLocal}
            onChange={(e) => setPoolsRevealLocal(e.target.value)}
          />
        </label>
        <label className="block max-w-md">
          <span className="form-label">Fixtures page — countdown ends</span>
          <input
            type="datetime-local"
            className="form-field"
            value={fixturesRevealLocal}
            onChange={(e) => setFixturesRevealLocal(e.target.value)}
          />
        </label>
        <button type="button" className="btn-primary text-sm" disabled={siteSaving} onClick={() => void saveAll()}>
          {siteSaving ? 'Saving…' : 'Save all settings'}
        </button>
      </section>

      {successMsg ? (
        <p className="mb-4 border border-floodlight/30 bg-floodlight/10 px-4 py-3 text-sm text-floodlight-bright">
          {successMsg}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </AdminShell>
  );
}

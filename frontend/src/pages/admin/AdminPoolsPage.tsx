import { useEffect, useState } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import {
  adminListTeamsForPools,
  adminLoadFixtures,
  adminLoadPoolBoard,
  adminSaveFixtures,
  adminSavePoolBoard,
  buildDefaultPoolFixtures,
  POOL_CODES,
  type FixtureRow,
  type PoolBoard,
  type TeamPick,
} from '../../data/pools';
import { isoToDatetimeLocal, datetimeLocalToIso } from '../../utils/datetimeLocal';
import { apiErrorMessage } from '../../utils/errors';

function newFixtureId() {
  return `new-${crypto.randomUUID()}`;
}

export function AdminPoolsPage() {
  const [teams, setTeams] = useState<TeamPick[]>([]);
  const [boards, setBoards] = useState<PoolBoard[]>([]);
  const [fixtures, setFixtures] = useState<FixtureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPools, setSavingPools] = useState(false);
  const [savingFixtures, setSavingFixtures] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [board, fix, teamList] = await Promise.all([
        adminLoadPoolBoard(),
        adminLoadFixtures(),
        adminListTeamsForPools(),
      ]);
      setBoards(board);
      setFixtures(fix);
      setTeams(teamList);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load pools. Run migration 007 in Supabase SQL.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setSlotTeam = (poolCode: string, slotOrder: number, teamId: string | null) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b.poolCode !== poolCode) return b;
        return {
          ...b,
          slots: b.slots.map((s) =>
            s.slotOrder === slotOrder
              ? {
                  ...s,
                  teamId: teamId || null,
                  teamName: teamId ? (teams.find((t) => t.id === teamId)?.name ?? null) : null,
                }
              : s,
          ),
        };
      }),
    );
  };

  const savePools = async () => {
    setSavingPools(true);
    setError('');
    setSuccess('');
    try {
      await adminSavePoolBoard(boards);
      setSuccess('Pool assignments saved (hidden until countdown).');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save pools'));
    } finally {
      setSavingPools(false);
    }
  };

  const generateFixtures = () => {
    const draft = buildDefaultPoolFixtures(boards).map((f) => ({
      ...f,
      id: newFixtureId(),
    }));
    setFixtures(draft);
    setSuccess('Generated pool pairings (1v2, 3v4, … per pool). Review and save fixtures.');
  };

  const saveFixtures = async () => {
    setSavingFixtures(true);
    setError('');
    setSuccess('');
    try {
      await adminSaveFixtures(fixtures);
      setSuccess('Fixtures saved (hidden until countdown).');
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save fixtures'));
    } finally {
      setSavingFixtures(false);
    }
  };

  const addFixtureRow = () => {
    setFixtures((prev) => [
      ...prev,
      {
        id: newFixtureId(),
        poolCode: 'A',
        matchOrder: prev.length + 1,
        label: 'Pool A',
        teamAId: null,
        teamBId: null,
        teamAName: null,
        teamBName: null,
        scheduledAt: null,
        venue: null,
      },
    ]);
  };

  const updateFixture = (id: string, patch: Partial<FixtureRow>) => {
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const next = { ...f, ...patch };
        if (patch.teamAId !== undefined) {
          next.teamAName = patch.teamAId ? (teams.find((t) => t.id === patch.teamAId)?.name ?? null) : null;
        }
        if (patch.teamBId !== undefined) {
          next.teamBName = patch.teamBId ? (teams.find((t) => t.id === patch.teamBId)?.name ?? null) : null;
        }
        return next;
      }),
    );
  };

  const removeFixture = (id: string) => {
    setFixtures((prev) => prev.filter((f) => f.id !== id));
  };

  const usedTeamIds = new Set(boards.flatMap((b) => b.slots.map((s) => s.teamId).filter(Boolean) as string[]));

  return (
    <AdminShell title="Pools & fixtures">
      <p className="mb-6 text-sm text-paper/60">
        Set the four pools manually (10 teams each). Nothing is public until the{' '}
        <strong className="text-paper/75">Pools &amp; fixtures countdown</strong> on the team board reaches zero — then
        the site runs a live shuffle animation and shows these assignments.
      </p>

      {loading ? <p className="text-paper/50">Loading…</p> : null}
      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}
      {success ? (
        <p className="mb-4 border border-floodlight/30 bg-floodlight/10 px-4 py-3 text-sm text-floodlight-bright">
          {success}
        </p>
      ) : null}

      {!loading ? (
        <>
          <div className="register-panel mb-8 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="hud-label text-floodlight-dim">Pool draw (4 × 10 teams)</p>
              <button type="button" className="btn-primary text-sm" disabled={savingPools} onClick={() => void savePools()}>
                {savingPools ? 'Saving…' : 'Save pools'}
              </button>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {POOL_CODES.map((code) => {
                const board = boards.find((b) => b.poolCode === code);
                if (!board) return null;
                return (
                  <div key={code} className="border border-paper/12 bg-ink-deep/40 p-4">
                    <p className="font-display text-xl text-floodlight-dim">Pool {code}</p>
                    <ul className="mt-4 space-y-2">
                      {board.slots.map((slot) => (
                        <li key={slot.slotOrder} className="flex items-center gap-2">
                          <span className="w-6 text-xs tabular-nums text-paper/40">{slot.slotOrder}.</span>
                          <select
                            className="form-field flex-1 py-2 text-sm"
                            value={slot.teamId ?? ''}
                            onChange={(e) => setSlotTeam(code, slot.slotOrder, e.target.value || null)}
                          >
                            <option value="">— Select team —</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id} disabled={usedTeamIds.has(t.id) && slot.teamId !== t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="register-panel px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="hud-label text-floodlight-dim">Fixtures</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline text-sm" onClick={generateFixtures}>
                  Generate from pools
                </button>
                <button type="button" className="btn-outline text-sm" onClick={addFixtureRow}>
                  + Add match
                </button>
                <button
                  type="button"
                  className="btn-primary text-sm"
                  disabled={savingFixtures}
                  onClick={() => void saveFixtures()}
                >
                  {savingFixtures ? 'Saving…' : 'Save fixtures'}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-paper/45">
              “Generate from pools” creates 1v2, 3v4, … within each pool. Edit times and teams, then save.
            </p>
            {fixtures.length === 0 ? (
              <p className="mt-6 text-sm text-paper/45">No fixtures yet.</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {fixtures.map((f) => (
                  <li key={f.id} className="border border-paper/10 bg-turf/15 p-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="block">
                        <span className="form-label">Pool</span>
                        <select
                          className="form-field py-2 text-sm"
                          value={f.poolCode ?? ''}
                          onChange={(e) =>
                            updateFixture(f.id, { poolCode: (e.target.value || null) as FixtureRow['poolCode'] })
                          }
                        >
                          {POOL_CODES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="form-label">Label</span>
                        <input
                          className="form-field py-2 text-sm"
                          value={f.label ?? ''}
                          onChange={(e) => updateFixture(f.id, { label: e.target.value || null })}
                        />
                      </label>
                      <label className="block">
                        <span className="form-label">Order</span>
                        <input
                          type="number"
                          className="form-field py-2 text-sm"
                          value={f.matchOrder}
                          onChange={(e) => updateFixture(f.id, { matchOrder: Number(e.target.value) })}
                        />
                      </label>
                      <label className="block">
                        <span className="form-label">Team A</span>
                        <select
                          className="form-field py-2 text-sm"
                          value={f.teamAId ?? ''}
                          onChange={(e) => updateFixture(f.id, { teamAId: e.target.value || null })}
                        >
                          <option value="">TBD</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="form-label">Team B</span>
                        <select
                          className="form-field py-2 text-sm"
                          value={f.teamBId ?? ''}
                          onChange={(e) => updateFixture(f.id, { teamBId: e.target.value || null })}
                        >
                          <option value="">TBD</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="form-label">Kick-off</span>
                        <input
                          type="datetime-local"
                          className="form-field py-2 text-sm"
                          value={isoToDatetimeLocal(f.scheduledAt)}
                          onChange={(e) => updateFixture(f.id, { scheduledAt: datetimeLocalToIso(e.target.value) })}
                        />
                      </label>
                      <label className="block">
                        <span className="form-label">Venue</span>
                        <input
                          className="form-field py-2 text-sm"
                          value={f.venue ?? ''}
                          onChange={(e) => updateFixture(f.id, { venue: e.target.value || null })}
                        />
                      </label>
                    </div>
                    <button type="button" className="mt-3 text-xs text-red-300 underline" onClick={() => removeFixture(f.id)}>
                      Remove match
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}

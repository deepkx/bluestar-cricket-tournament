import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import {
  adminLoadFixtures,
  adminPatchFixtureTeams,
  adminPatchShowdownTeams,
  adminSetFixtureWinner,
  POOL_CODES,
  type FixtureRow,
} from '../../data/pools';
import { resolvePoolFixtureSidesForAdmin } from '../../utils/adminFixtureSides';
import { fixtureMatchCode } from '../../utils/fixtureDisplay';
import { fixtureWinnerName } from '../../utils/fixtureResults';
import {
  SHOWDOWN_TAB,
  filterShowdownFixtures,
  hydrateShowdownRow,
  fixtureDisplayOpponentShowdown,
} from '../../utils/showdownModel';
import { apiErrorMessage } from '../../utils/errors';

function canRecordShowdown(row: FixtureRow, all: FixtureRow[]): boolean {
  const h = hydrateShowdownRow(row, all);
  return Boolean(h.teamAId && h.teamBId);
}

export function AdminMatchResultsPage() {
  const [fixtures, setFixtures] = useState<FixtureRow[]>([]);
  const [pool, setPool] = useState<string>('A');
  const [loading, setLoading] = useState(true);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setFixtures(await adminLoadFixtures());
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load fixtures'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const poolFixtures = useMemo(() => {
    if (pool === SHOWDOWN_TAB) {
      return filterShowdownFixtures(fixtures);
    }
    return fixtures.filter((f) => f.poolCode === pool).sort((a, b) => a.matchOrder - b.matchOrder);
  }, [fixtures, pool]);

  const record = async (
    fixtureId: string,
    winnerTeamId: string | null,
    sides: { teamAId: string; teamBId: string; teamAName: string | null; teamBName: string | null },
  ) => {
    if (fixtureId.startsWith('new-')) {
      setError('Save fixtures on Pools & fixtures before recording results.');
      return;
    }
    setRecordingId(fixtureId);
    setError('');
    setSuccess('');
    try {
      const raw = fixtures.find((f) => f.id === fixtureId);
      if (raw && raw.poolCode == null) {
        const h = hydrateShowdownRow(raw, fixtures);
        if (h.teamAId && h.teamBId && (!raw.teamAId || !raw.teamBId)) {
          await adminPatchShowdownTeams(fixtureId, h.teamAId, h.teamBId);
        }
      } else if (raw?.poolCode) {
        if (!raw.teamAId || !raw.teamBId || raw.teamAId !== sides.teamAId || raw.teamBId !== sides.teamBId) {
          await adminPatchFixtureTeams(fixtureId, sides.teamAId, sides.teamBId);
        }
      }
      await adminSetFixtureWinner(fixtureId, winnerTeamId);
      setFixtures((prev) =>
        prev.map((f) => {
          if (f.id !== fixtureId) return f;
          const name = winnerTeamId
            ? winnerTeamId === sides.teamAId
              ? sides.teamAName
              : sides.teamBName
            : null;
          return {
            ...f,
            teamAId: sides.teamAId,
            teamBId: sides.teamBId,
            teamAName: sides.teamAName ?? f.teamAName,
            teamBName: sides.teamBName ?? f.teamBName,
            winnerTeamId,
            winnerTeamName: name ?? null,
          };
        }),
      );
      setSuccess(winnerTeamId ? 'Winner saved — public bracket updated.' : 'Result cleared.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save winner'));
    } finally {
      setRecordingId(null);
    }
  };

  return (
    <AdminShell title="Match results">
      <p className="mb-4 text-sm text-paper/60">
        Pick the winning team for each finished match (R1–R4). Later rounds fill in automatically once earlier
        winners are recorded. Requires migrations <code className="text-paper/50">017</code> +{' '}
        <code className="text-paper/50">018</code> on Supabase.
      </p>

      <div className="mb-6 flex flex-wrap gap-1 border border-paper/15 bg-ink-deep/50">
        {[...POOL_CODES, SHOWDOWN_TAB].map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setPool(code)}
            className={`min-w-[3rem] px-4 py-2.5 text-sm font-semibold ${
              pool === code ? 'bg-floodlight text-black' : 'text-paper/60 hover:bg-paper/5'
            }`}
          >
            {code === SHOWDOWN_TAB ? 'Showdown' : `Pool ${code}`}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-paper/50">Loading…</p> : null}
      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}
      {success ? (
        <p className="mb-4 border border-floodlight/30 bg-floodlight/10 px-4 py-3 text-sm text-floodlight-bright">
          {success}
        </p>
      ) : null}

      {!loading && poolFixtures.length === 0 ? (
        <p className="text-sm text-paper/50">No fixtures for pool {pool}.</p>
      ) : null}

      <ul className="space-y-4">
        {poolFixtures.map((f) => {
          const isShowdown = f.poolCode == null;
          const poolSides = isShowdown
            ? null
            : resolvePoolFixtureSidesForAdmin(f, poolFixtures);
          const showdownHydrated = isShowdown ? hydrateShowdownRow(f, fixtures) : null;

          const teamAId = isShowdown ? showdownHydrated?.teamAId : poolSides?.teamAId;
          const teamBId = isShowdown ? showdownHydrated?.teamBId : poolSides?.teamBId;
          const teamA = isShowdown
            ? (showdownHydrated?.teamAName ?? 'TBD')
            : (poolSides?.teamAName ?? 'TBD');
          const teamB = isShowdown
            ? fixtureDisplayOpponentShowdown(f, fixtures)
            : (poolSides?.teamBName ?? 'TBD');

          const code = fixtureMatchCode(f.label, f.matchOrder);
          const winner = fixtureWinnerName(f);
          const playable = isShowdown ? canRecordShowdown(f, fixtures) : Boolean(poolSides?.playable);
          const blockReason = poolSides?.blockReason;

          const sidesForRecord =
            teamAId && teamBId
              ? {
                  teamAId,
                  teamBId,
                  teamAName: teamA,
                  teamBName: teamB,
                }
              : null;

          return (
            <li key={f.id} className="register-panel px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl text-floodlight-bright">{code}</p>
                  <p className="mt-1 text-xs text-paper/45">{f.label}</p>
                  <p className="mt-3 text-lg text-paper">
                    <span className={f.winnerTeamId === teamAId ? 'font-bold text-floodlight-bright' : ''}>
                      {teamA}
                    </span>
                    <span className="mx-2 text-paper/40">vs</span>
                    <span className={f.winnerTeamId === teamBId ? 'font-bold text-floodlight-bright' : ''}>
                      {teamB}
                    </span>
                  </p>
                  {winner ? (
                    <p className="mt-2 text-sm text-floodlight-dim">Recorded winner: {winner}</p>
                  ) : null}
                </div>
              </div>

              {playable && sidesForRecord ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-paper/10 pt-4">
                  <button
                    type="button"
                    disabled={recordingId === f.id}
                    className={`btn-primary text-sm ${f.winnerTeamId === teamAId ? 'ring-2 ring-floodlight-bright' : ''}`}
                    onClick={() => void record(f.id, sidesForRecord.teamAId, sidesForRecord)}
                  >
                    {teamA} won
                  </button>
                  <button
                    type="button"
                    disabled={recordingId === f.id}
                    className={`btn-primary text-sm ${f.winnerTeamId === teamBId ? 'ring-2 ring-floodlight-bright' : ''}`}
                    onClick={() => void record(f.id, sidesForRecord.teamBId, sidesForRecord)}
                  >
                    {teamB} won
                  </button>
                  {f.winnerTeamId ? (
                    <button
                      type="button"
                      disabled={recordingId === f.id}
                      className="btn-outline text-sm"
                      onClick={() => void record(f.id, null, sidesForRecord)}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-xs text-paper/45">
                  {blockReason ??
                    (isShowdown
                      ? 'Set both Showdown teams on Pools & fixtures before recording a result.'
                      : 'Set both teams on Pools & fixtures before recording a result.')}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </AdminShell>
  );
}

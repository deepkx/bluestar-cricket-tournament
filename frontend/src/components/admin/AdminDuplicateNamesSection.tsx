import { useCallback, useEffect, useState } from 'react';
import { listDuplicatePlayerNamesAdmin, type DuplicatePlayerNameGroup } from '../../data/teams';
import { mediaUrl } from '../../utils/mediaUrl';
import { apiErrorMessage } from '../../utils/errors';

type Props = {
  refreshKey?: number;
};

export function AdminDuplicateNamesSection({ refreshKey = 0 }: Props) {
  const [groups, setGroups] = useState<DuplicatePlayerNameGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      setGroups(await listDuplicatePlayerNamesAdmin());
    } catch (e) {
      setErr(apiErrorMessage(e, 'Could not load duplicate names'));
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <section className="register-panel mb-8 px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="hud-label text-floodlight-dim">Duplicate player names</p>
          <p className="mt-1 text-xs text-paper/50">
            Same full name on more than one squad (confirmed teams). Use this to spot reused photos or typos.
          </p>
        </div>
        <button type="button" className="btn-outline text-sm" disabled={loading} onClick={() => void load()}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {err ? <p className="mt-4 text-sm text-red-300">{err}</p> : null}

      {!loading && !err && groups.length === 0 ? (
        <p className="mt-4 text-sm text-paper/55">No duplicate names across squads right now.</p>
      ) : null}

      {groups.length > 0 ? (
        <ul className="mt-6 space-y-8">
          {groups.map((g) => (
            <li key={g.normalizedName}>
              <p className="font-display text-lg text-floodlight-bright">
                {g.label}
                <span className="ml-2 font-sans text-sm font-normal tabular-nums text-paper/45">
                  × {g.entries.length}
                </span>
              </p>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {g.entries.map((e) => {
                  const photo = mediaUrl(e.photoUrl);
                  return (
                    <li
                      key={e.playerId}
                      className="flex gap-4 border border-paper/12 bg-ink-deep/40 p-3"
                    >
                      <div className="h-28 w-28 shrink-0 overflow-hidden border border-paper/15 bg-turf/20 sm:h-32 sm:w-32">
                        {photo ? (
                          <img src={photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-xs text-paper/35">No photo</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-paper">{e.fullName}</p>
                        <p className="mt-1 text-sm text-floodlight-dim">{e.teamName}</p>
                        {e.captain ? (
                          <p className="mt-1 text-[10px] uppercase tracking-widest text-paper/45">Captain</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

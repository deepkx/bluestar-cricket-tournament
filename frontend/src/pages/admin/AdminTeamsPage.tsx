import { useEffect, useMemo, useState } from 'react';
import api, { apiErrorMessage, clearAdminSession } from '../../api/client';
import { AdminShell } from '../../components/admin/AdminShell';
import { PlayerPhotoField } from '../../components/register/PlayerPhotoField';
import { HOME_EVENT } from '../../content/homeEvent';
import type { TeamPublic, TournamentPublic } from '../../types/api';
import { formatRegisteredAt } from '../../utils/formatDateTime';
import { mediaUrl } from '../../utils/mediaUrl';
import { buildTeamSlotRows } from '../../utils/teamSlots';

type EditPlayer = {
  id: number | null;
  fullName: string;
  captain: boolean;
  jerseyNumber: string;
  playingRole: string;
  photoUrl: string | null;
  newPhoto: File | null;
};

type EditState = {
  id: number;
  teamName: string;
  city: string;
  captainName: string;
  teamLogoUrl: string | null;
  newTeamLogo: File | null;
  players: EditPlayer[];
  removedPlayerIds: number[];
};

type AdminRegSummary = { id: number; teamName: string; status: string };

async function fetchConfirmedIdByTeamName(teamName: string): Promise<number | null> {
  const { data } = await api.get<{ content?: AdminRegSummary[] }>('/api/v1/admin/registrations', {
    params: { q: teamName, size: 50 },
  });
  const rows = data.content ?? [];
  const match = rows.find((r) => r.teamName === teamName && r.status === 'CONFIRMED');
  return match?.id ?? null;
}

async function enrichTeamsWithRegistrationIds(teams: TeamPublic[]): Promise<TeamPublic[]> {
  if (teams.every((t) => t.registrationId != null && t.registrationId > 0)) {
    return teams;
  }
  try {
    const { data } = await api.get<{ content?: AdminRegSummary[] }>('/api/v1/admin/registrations', {
      params: { size: 200 },
    });
    const confirmedByName = new Map(
      (data.content ?? [])
        .filter((r) => r.status === 'CONFIRMED')
        .map((r) => [r.teamName, r.id] as const),
    );
    return teams.map((t) => ({
      ...t,
      registrationId: t.registrationId ?? confirmedByName.get(t.teamName) ?? t.registrationId,
    }));
  } catch {
    return teams;
  }
}

export function AdminTeamsPage() {
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [teams, setTeams] = useState<TeamPublic[]>([]);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newCaptain, setNewCaptain] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState<File | null>(null);
  const [newCaptainPhoto, setNewCaptainPhoto] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ registrationId: number; teamName: string } | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [resolvingDelete, setResolvingDelete] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    try {
      const [t, teamList] = await Promise.all([
        api.get<TournamentPublic>('/api/v1/tournaments/current'),
        api.get<TeamPublic[]>('/api/v1/teams'),
      ]);
      setTournament(t.data);
      setTeams(await enrichTeamsWithRegistrationIds(teamList.data));
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load team board'));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const maxTeams = tournament?.maxTeams ?? 32;
  const rows = useMemo(() => buildTeamSlotRows(maxTeams, teams), [maxTeams, teams]);

  const openEdit = async (registrationId: number) => {
    const id = registrationId;
    if (!id) {
      setError('Could not load this team. Refresh the page and try again.');
      return;
    }
    setError('');
    try {
      const { data } = await api.get<{
        id: number;
        teamName: string;
        city: string | null;
        captainName: string;
        teamLogoUrl: string | null;
        players: {
          id: number;
          fullName: string;
          captain: boolean;
          jerseyNumber: number | null;
          role: string | null;
          photoUrl: string | null;
        }[];
      }>(`/api/v1/admin/registrations/${id}`);
      setEdit({
        id: data.id,
        teamName: data.teamName,
        city: data.city ?? '',
        captainName: data.captainName,
        teamLogoUrl: data.teamLogoUrl,
        newTeamLogo: null,
        removedPlayerIds: [],
        players: data.players.map((p) => ({
          id: p.id,
          fullName: p.fullName,
          captain: p.captain,
          jerseyNumber: p.jerseyNumber != null ? String(p.jerseyNumber) : '',
          playingRole: p.role ?? '',
          photoUrl: p.photoUrl,
          newPhoto: null,
        })),
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not open team for editing'));
    }
  };

  const addTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newCaptain.trim()) return;
    setAdding(true);
    setError('');
    try {
      const payload = { teamName: newTeamName.trim(), captainName: newCaptain.trim() };
      if (newTeamLogo || newCaptainPhoto) {
        const form = new FormData();
        form.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (newTeamLogo) form.append('teamLogo', newTeamLogo);
        if (newCaptainPhoto) form.append('captainPhoto', newCaptainPhoto);
        await api.post('/api/v1/admin/registrations/teams/with-media', form);
      } else {
        await api.post('/api/v1/admin/registrations/teams', payload);
      }
      setNewTeamName('');
      setNewCaptain('');
      setNewTeamLogo(null);
      setNewCaptainPhoto(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add team'));
    } finally {
      setAdding(false);
    }
  };

  const requestDelete = async (registrationId: number | null, teamName: string) => {
    setError('');
    setSuccessMsg('');
    setResolvingDelete(true);
    let id = registrationId;
    try {
      if (!id) {
        id = await fetchConfirmedIdByTeamName(teamName);
      }
      if (!id) {
        setError(
          'Could not resolve this team’s id. Hard refresh (Cmd+Shift+R), sign in again under Admin, and restart the backend if the problem continues.',
        );
        return;
      }
      setPendingDelete({ registrationId: id, teamName });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not prepare delete'));
    } finally {
      setResolvingDelete(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setError('');
    const { registrationId, teamName } = pendingDelete;
    try {
      await api.delete<{ deleted: boolean }>(`/api/v1/admin/registrations/${registrationId}/board`);
      setPendingDelete(null);
      setSuccessMsg(`"${teamName}" was removed from the board.`);
      await load();
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        clearAdminSession();
        window.location.assign('/admin/teams');
        return;
      }
      setPendingDelete(null);
      setError(apiErrorMessage(err, 'Could not delete team'));
    } finally {
      setDeleting(false);
    }
  };

  const saveEdit = async () => {
    if (!edit) return;
    setSaving(true);
    setError('');
    try {
      const photoFiles: File[] = [];
      const attachPhotoIndex = (file: File | null): number | null => {
        if (!file) return null;
        const idx = photoFiles.length;
        photoFiles.push(file);
        return idx;
      };

      const existingUpdates = edit.players
        .filter((p) => p.id != null)
        .map((p) => ({
          id: p.id!,
          fullName: p.fullName.trim(),
          captain: p.captain,
          jerseyNumber: p.jerseyNumber.trim() ? Number(p.jerseyNumber) : null,
          playingRole: p.playingRole.trim() || null,
          photoUploadIndex: attachPhotoIndex(p.newPhoto),
        }));

      const newPlayers = edit.players
        .filter((p) => p.id == null)
        .map((p) => ({
          fullName: p.fullName.trim(),
          captain: p.captain,
          jerseyNumber: p.jerseyNumber.trim() ? Number(p.jerseyNumber) : null,
          playingRole: p.playingRole.trim() || null,
          photoUploadIndex: attachPhotoIndex(p.newPhoto),
        }));

      const payload = {
        teamName: edit.teamName.trim(),
        city: edit.city.trim() || null,
        captainName: edit.captainName.trim(),
        players: existingUpdates,
        newPlayers,
        removePlayerIds: edit.removedPlayerIds,
      };

      const form = new FormData();
      form.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      if (edit.newTeamLogo) form.append('teamLogo', edit.newTeamLogo);
      for (const f of photoFiles) {
        form.append('playerPhotos', f);
      }

      await api.put(`/api/v1/admin/registrations/${edit.id}/with-media`, form);
      setEdit(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save team'));
    } finally {
      setSaving(false);
    }
  };

  const updatePlayer = (index: number, patch: Partial<EditPlayer>) => {
    if (!edit) return;
    const players = edit.players.map((p, i) => (i === index ? { ...p, ...patch } : p));
    setEdit({ ...edit, players });
  };

  const setCaptain = (index: number) => {
    if (!edit) return;
    const players = edit.players.map((p, i) => ({ ...p, captain: i === index }));
    const cap = players[index];
    setEdit({ ...edit, players, captainName: cap.fullName });
  };

  const removePlayerRow = (index: number) => {
    if (!edit) return;
    const player = edit.players[index];
    const removedPlayerIds =
      player.id != null ? [...edit.removedPlayerIds, player.id] : edit.removedPlayerIds;
    const players = edit.players.filter((_, i) => i !== index);
    setEdit({ ...edit, players, removedPlayerIds });
  };

  const addPlayerRow = () => {
    if (!edit) return;
    setEdit({
      ...edit,
      players: [
        ...edit.players,
        {
          id: null,
          fullName: '',
          captain: false,
          jerseyNumber: '',
          playingRole: '',
          photoUrl: null,
          newPhoto: null,
        },
      ],
    });
  };

  return (
    <AdminShell title="Team board">
      <p className="mb-6 text-sm text-paper/60">
        Add teams, edit squads and photos, or delete teams from the public board.
      </p>

      <form onSubmit={addTeam} className="register-panel space-y-5 px-5 py-5">
        <p className="hud-label text-floodlight-dim">Add team</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="form-label">Team name</span>
            <input className="form-field" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
          </label>
          <label className="block">
            <span className="form-label">Captain name</span>
            <input className="form-field" value={newCaptain} onChange={(e) => setNewCaptain(e.target.value)} />
          </label>
        </div>
        <PlayerPhotoField label="Team logo (optional)" file={newTeamLogo} onChange={setNewTeamLogo} />
        <PlayerPhotoField label="Captain photo (optional)" file={newCaptainPhoto} onChange={setNewCaptainPhoto} />
        <button type="submit" className="btn-primary text-sm" disabled={adding}>
          {adding ? 'Adding…' : 'Add team to board'}
        </button>
      </form>

      {successMsg ? (
        <p className="mt-4 border border-floodlight/30 bg-floodlight/10 px-4 py-3 text-sm text-floodlight-bright">
          {successMsg}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <ul className="mt-8 divide-y divide-paper/12 border border-paper/15">
        {rows.map((row) => (
          <li
            key={row.slot}
            className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[2rem_1fr_10rem_auto] sm:items-center sm:gap-3 sm:px-5"
          >
            <span className="hud-stat text-paper/45">{row.slot}</span>
            {row.kind === 'open' ? (
              <span className="text-sm text-paper/35">Open slot</span>
            ) : (
              <>
                <span className="font-display text-lg text-floodlight-bright">{row.teamName}</span>
                <span className="text-sm tabular-nums text-paper/50">
                  {formatRegisteredAt(row.registeredAt, tournament?.timezone ?? 'Asia/Kolkata')}
                </span>
                {row.kind === 'host' ? (
                  <span className="text-xs text-paper/45">{HOME_EVENT.hostTeamName} (host)</span>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="text-sm text-electric underline"
                      onClick={() => openEdit(row.registrationId!)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-sm text-red-300 underline disabled:opacity-40"
                      disabled={resolvingDelete || deleting}
                      onClick={() => void requestDelete(row.registrationId, row.teamName!)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="register-panel w-full max-w-md px-6 py-6">
            <h2 className="font-display text-xl text-floodlight-bright">Delete team?</h2>
            <p className="mt-3 text-sm text-paper/75">
              Remove <strong className="text-paper">{pendingDelete.teamName}</strong> from the public team board.
              Registration data stays in admin history but the team will no longer appear on the site.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="btn-outline flex-1 text-sm"
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button type="button" className="btn-primary flex-1 text-sm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting…' : 'Delete team'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {edit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6">
          <div className="register-panel flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden">
            <div className="border-b border-paper/10 px-5 py-4">
              <h2 className="font-display text-xl text-floodlight-bright">Edit team</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="form-label">Team name</span>
                  <input
                    className="form-field"
                    value={edit.teamName}
                    onChange={(e) => setEdit({ ...edit, teamName: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="form-label">City (optional)</span>
                  <input className="form-field" value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })} />
                </label>
                <label className="block">
                  <span className="form-label">Captain name (contact)</span>
                  <input
                    className="form-field"
                    value={edit.captainName}
                    onChange={(e) => setEdit({ ...edit, captainName: e.target.value })}
                  />
                </label>
              </div>
              <div className="mt-6">
                <PlayerPhotoField
                  label="Team logo"
                  file={edit.newTeamLogo}
                  existingUrl={mediaUrl(edit.teamLogoUrl)}
                  onChange={(f) => setEdit({ ...edit, newTeamLogo: f })}
                />
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <p className="hud-label text-floodlight-dim">Squad</p>
                <button type="button" className="text-sm text-electric underline" onClick={addPlayerRow}>
                  + Add player
                </button>
              </div>
              <ul className="mt-4 space-y-6">
                {edit.players.map((p, i) => (
                  <li key={p.id ?? `new-${i}`} className="border border-paper/12 bg-ink-deep/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="hud-stat text-paper/45">Player {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-xs text-paper/70">
                          <input type="radio" name="captain" checked={p.captain} onChange={() => setCaptain(i)} />
                          Captain
                        </label>
                        {edit.players.length > 1 ? (
                          <button type="button" className="text-xs text-red-300 underline" onClick={() => removePlayerRow(i)}>
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <label className="mt-3 block">
                      <span className="form-label">Full name</span>
                      <input
                        className="form-field"
                        value={p.fullName}
                        onChange={(e) => updatePlayer(i, { fullName: e.target.value })}
                      />
                    </label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="form-label">Jersey #</span>
                        <input
                          className="form-field"
                          inputMode="numeric"
                          value={p.jerseyNumber}
                          onChange={(e) => updatePlayer(i, { jerseyNumber: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="form-label">Role</span>
                        <input
                          className="form-field"
                          placeholder="Batter, Bowler…"
                          value={p.playingRole}
                          onChange={(e) => updatePlayer(i, { playingRole: e.target.value })}
                        />
                      </label>
                    </div>
                    <div className="mt-4">
                      <PlayerPhotoField
                        label="Player photo"
                        file={p.newPhoto}
                        existingUrl={mediaUrl(p.photoUrl)}
                        onChange={(f) => updatePlayer(i, { newPhoto: f })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 border-t border-paper/10 px-5 py-4">
              <button type="button" className="btn-outline flex-1 text-sm" onClick={() => setEdit(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn-primary flex-1 text-sm" disabled={saving} onClick={saveEdit}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell } from '../../components/admin/AdminShell';
import { PlayerPhotoField } from '../../components/register/PlayerPhotoField';
import {
  adminAddConfirmedTeam,
  adminDeleteTeamFromBoard,
  adminEnsureTeamOnBoard,
  adminFetchTeamWithPhotosForDownload,
  adminSaveTeamEdit,
  approveTeam,
  getTeamForAdminEdit,
  listAllTeamsAdmin,
  listPendingTeamsAdmin,
  rejectTeam,
  exportRegistrationsCsv,
  type AdminTeamSummary,
} from '../../data/teams';
import { fetchSiteConfig } from '../../data/tournament';
import { signOutAdmin } from '../../data/auth';
import type { TeamPublic } from '../../types/api';
import { downloadAllTeamsPhotosZip, downloadTeamPhotosZip } from '../../utils/downloadTeamPhotos';
import { mediaUrl } from '../../utils/mediaUrl';
import { buildTeamSlotRows, type TeamSlotRow } from '../../utils/teamSlots';
import { apiErrorMessage } from '../../utils/errors';

type EditPlayer = {
  id: string | null;
  fullName: string;
  captain: boolean;
  jerseyNumber: string;
  playingRole: string;
  photoUrl: string | null;
  newPhoto: File | null;
  photoRemoved: boolean;
};

type EditState = {
  id: string;
  teamName: string;
  city: string;
  captainName: string;
  teamLogoUrl: string | null;
  newTeamLogo: File | null;
  logoRemoved: boolean;
  players: EditPlayer[];
  removedPlayerIds: string[];
};

export function AdminTeamsPage() {
  const [maxTeams, setMaxTeams] = useState(32);
  const [teams, setTeams] = useState<TeamPublic[]>([]);
  const [pending, setPending] = useState<AdminTeamSummary[]>([]);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newCaptain, setNewCaptain] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState<File | null>(null);
  const [newCaptainPhoto, setNewCaptainPhoto] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ registrationId: string; teamName: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const load = async () => {
    try {
      const [cfg, teamList, pendingList] = await Promise.all([
        fetchSiteConfig(),
        listAllTeamsAdmin(),
        listPendingTeamsAdmin(),
      ]);
      setMaxTeams(cfg.max_teams);
      setTeams(teamList);
      setPending(pendingList);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load team board'));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => buildTeamSlotRows(maxTeams, teams), [maxTeams, teams]);

  const openEdit = async (registrationId: string) => {
    if (!registrationId) {
      setError('Could not load this team. Refresh the page and try again.');
      return;
    }
    setError('');
    try {
      const data = await getTeamForAdminEdit(registrationId);
      const mappedPlayers = data.players.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        captain: p.captain,
        jerseyNumber: p.jerseyNumber,
        playingRole: p.playingRole,
        photoUrl: p.photoUrl,
        newPhoto: null,
        photoRemoved: false,
      }));
      setEdit({
        id: data.id,
        teamName: data.teamName,
        city: data.city,
        captainName: data.captainName,
        teamLogoUrl: data.teamLogoUrl,
        newTeamLogo: null,
        logoRemoved: false,
        removedPlayerIds: [],
        players:
          mappedPlayers.length > 0
            ? mappedPlayers
            : [
                {
                  id: null,
                  fullName: '',
                  captain: true,
                  jerseyNumber: '',
                  playingRole: '',
                  photoUrl: null,
                  newPhoto: null,
                  photoRemoved: false,
                },
              ],
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not open team for editing'));
    }
  };

  const openManageTeam = async (row: TeamSlotRow) => {
    if (!row.teamName || row.kind === 'open') return;
    setError('');
    try {
      let teamId = row.registrationId;
      if (!teamId) {
        teamId = await adminEnsureTeamOnBoard(row.teamName);
        await load();
      }
      await openEdit(teamId);
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
      await adminAddConfirmedTeam({
        teamName: newTeamName.trim(),
        captainName: newCaptain.trim(),
        teamLogo: newTeamLogo,
        captainPhoto: newCaptainPhoto,
      });
      setNewTeamName('');
      setNewCaptain('');
      setNewTeamLogo(null);
      setNewCaptainPhoto(null);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add team'));
    } finally {
      setAdding(false);
    }
  };

  const requestDelete = (registrationId: string | null, teamName: string) => {
    if (!registrationId) {
      setError('Could not resolve this team’s id.');
      return;
    }
    setPendingDelete({ registrationId, teamName });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setError('');
    const { registrationId, teamName } = pendingDelete;
    try {
      await adminDeleteTeamFromBoard(registrationId);
      setPendingDelete(null);
      setSuccessMsg(`"${teamName}" was removed from the board.`);
      await load();
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? '';
      if (msg.toLowerCase().includes('jwt') || msg.includes('401')) {
        await signOutAdmin();
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
      const newPhotos = new Map<number, File>();
      const removePhotos = new Set<number>();
      edit.players.forEach((p, i) => {
        if (p.newPhoto) newPhotos.set(i, p.newPhoto);
        else if (p.photoRemoved) removePhotos.add(i);
      });
      await adminSaveTeamEdit(edit, {
        newTeamLogo: edit.newTeamLogo,
        removeTeamLogo: edit.logoRemoved,
        newPhotos,
        removePhotos,
        removedPlayerIds: edit.removedPlayerIds,
      });
      setEdit(null);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save team'));
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    setError('');
    try {
      await approveTeam(id);
      setSuccessMsg('Team approved and visible on the public board.');
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not approve team'));
    }
  };

  const handleReject = async (id: string) => {
    setError('');
    try {
      await rejectTeam(id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not reject team'));
    }
  };

  const downloadOne = async (teamId: string) => {
    setDownloadingId(teamId);
    setError('');
    try {
      const pack = await adminFetchTeamWithPhotosForDownload(teamId);
      await downloadTeamPhotosZip(pack.teamName, pack.logoUrl, pack.players);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not download photos'));
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadAll = async () => {
    setBulkDownloading(true);
    setError('');
    try {
      const packs = await Promise.all(teams.map((t) => adminFetchTeamWithPhotosForDownload(t.registrationId)));
      await downloadAllTeamsPhotosZip(
        packs.map((p) => ({
          teamName: p.teamName,
          logoUrl: p.logoUrl,
          players: p.players,
        })),
      );
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not download all photos'));
    } finally {
      setBulkDownloading(false);
    }
  };

  const exportCsv = async () => {
    try {
      const csv = await exportRegistrationsCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'registrations.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(apiErrorMessage(err, 'Export failed'));
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
          photoRemoved: false,
        },
      ],
    });
  };

  return (
    <AdminShell title="Team board">
      <p className="mb-4 text-sm text-paper/60">
        Edit squads via <strong className="text-paper/80">Manage</strong>. Site timings and upload locks:{' '}
        <Link to="/admin/settings" className="text-floodlight-bright underline">
          Settings
        </Link>
        . Duplicate names:{' '}
        <Link to="/admin/duplicates" className="text-floodlight-bright underline">
          Duplicates
        </Link>
        .
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        <button type="button" className="btn-outline text-sm" onClick={() => void exportCsv()}>
          Download CSV
        </button>
        <button
          type="button"
          className="btn-outline text-sm"
          disabled={bulkDownloading || teams.length === 0}
          onClick={() => void downloadAll()}
        >
          {bulkDownloading ? 'Zipping…' : 'All team photos zip'}
        </button>
      </div>

      {pending.length > 0 ? (
        <section className="register-panel mb-8 px-5 py-5">
          <p className="hud-label text-floodlight-dim">Pending approvals</p>
          <ul className="mt-4 divide-y divide-paper/12">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-display text-lg text-floodlight-bright">{p.teamName}</p>
                  <p className="text-xs text-paper/50">
                    Ref {p.publicReference} · Captain {p.captainName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-primary text-sm" onClick={() => void handleApprove(p.id)}>
                    Approve
                  </button>
                  <button type="button" className="btn-outline text-sm" onClick={() => void handleReject(p.id)}>
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <form onSubmit={addTeam} className="register-panel space-y-5 px-5 py-5">
        <p className="hud-label text-floodlight-dim">Add team (confirmed)</p>
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
        <PlayerPhotoField previewSize="large" label="Team logo (optional)" file={newTeamLogo} onChange={setNewTeamLogo} />
        <PlayerPhotoField previewSize="large" label="Captain photo (optional)" file={newCaptainPhoto} onChange={setNewCaptainPhoto} />
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
            className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[2rem_1fr_auto] sm:items-center sm:gap-3 sm:px-5"
          >
            <span className="hud-stat text-paper/45">{row.slot}</span>
            {row.kind === 'open' ? (
              <span className="text-sm text-paper/35">Open slot</span>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg text-floodlight-bright">{row.teamName}</span>
                  {row.kind === 'host' ? (
                    <span className="funk-skew-chip border border-floodlight/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-floodlight-bright">
                      Host
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3 sm:justify-end">
                  <button
                    type="button"
                    className="text-sm font-medium text-floodlight-bright underline"
                    onClick={() => void openManageTeam(row)}
                  >
                    Manage
                  </button>
                  {row.registrationId ? (
                    <>
                      <button
                        type="button"
                        className="text-sm text-paper/70 underline disabled:opacity-40"
                        disabled={downloadingId === row.registrationId}
                        onClick={() => void downloadOne(row.registrationId!)}
                      >
                        {downloadingId === row.registrationId ? '…' : 'Photos zip'}
                      </button>
                      {row.kind !== 'host' ? (
                        <button
                          type="button"
                          className="text-sm text-red-300 underline disabled:opacity-40"
                          disabled={deleting}
                          onClick={() => requestDelete(row.registrationId, row.teamName!)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
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
              <button type="button" className="btn-primary flex-1 text-sm" disabled={deleting} onClick={() => void confirmDelete()}>
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
                  previewSize="large"
                  label="Team logo"
                  file={edit.newTeamLogo}
                  existingUrl={edit.logoRemoved ? null : mediaUrl(edit.teamLogoUrl)}
                  onChange={(f) => setEdit({ ...edit, newTeamLogo: f, logoRemoved: false })}
                  onClearExisting={
                    edit.teamLogoUrl && !edit.logoRemoved
                      ? () => setEdit({ ...edit, logoRemoved: true, newTeamLogo: null })
                      : undefined
                  }
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
                        <button type="button" className="text-xs text-red-300 underline" onClick={() => removePlayerRow(i)}>
                          Remove player
                        </button>
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
                        previewSize="large"
                        label="Player photo"
                        file={p.newPhoto}
                        existingUrl={p.photoRemoved ? null : mediaUrl(p.photoUrl)}
                        onChange={(f) => updatePlayer(i, { newPhoto: f, photoRemoved: false })}
                        onClearExisting={
                          p.photoUrl && !p.photoRemoved
                            ? () => updatePlayer(i, { photoRemoved: true, newPhoto: null })
                            : undefined
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 border-t border-paper/10 px-5 py-4">
              <button
                type="button"
                className="btn-outline text-sm"
                disabled={saving}
                onClick={() => void downloadOne(edit.id)}
              >
                Download photos
              </button>
              <button type="button" className="btn-outline flex-1 text-sm" onClick={() => setEdit(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn-primary flex-1 text-sm" disabled={saving} onClick={() => void saveEdit()}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

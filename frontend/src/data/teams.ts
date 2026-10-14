import { HOME_EVENT } from '../content/homeEvent';
import type { SquadProgress } from '../utils/squadProgress';
import { requireSupabase, supabaseErrorMessage } from '../lib/supabase';
import type { TeamPublic, RegistrationStatus } from '../types/api';
import type { PlayerRow, TeamRow, TeamStatus } from './dbTypes';
import { removeStoragePaths, storagePublicUrl, uploadPlayerPhoto, uploadTeamLogo } from './storage';

function normalizeTeamName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function mapStatus(status: TeamStatus): RegistrationStatus {
  if (status === 'confirmed') return 'CONFIRMED';
  if (status === 'cancelled') return 'CANCELLED';
  return 'PENDING_PAYMENT';
}

export function teamRowToPublic(row: TeamRow): TeamPublic {
  return {
    registrationId: row.id,
    teamName: row.team_name,
    logoUrl: row.logo_path,
    status: mapStatus(row.status),
    confirmedAt: row.confirmed_at,
    sortOrder: row.sort_order ?? null,
  };
}

export type PendingTeamPublic = {
  teamName: string;
  publicReference: string;
  captainName: string;
  createdAt: string;
};

/** Registrations awaiting admin approval (public read per pending RLS). */
export async function listPendingTeamsPublic(): Promise<PendingTeamPublic[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('teams')
    .select('team_name, public_reference, captain_name, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    teamName: r.team_name as string,
    publicReference: r.public_reference as string,
    captainName: r.captain_name as string,
    createdAt: r.created_at as string,
  }));
}

export async function listConfirmedTeams(): Promise<TeamPublic[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('teams')
    .select('*')
    .eq('status', 'confirmed')
    .order('confirmed_at', { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as TeamRow[];
  rows.sort((a, b) => {
    const sa = a.sort_order ?? 9999;
    const sb = b.sort_order ?? 9999;
    if (sa !== sb) return sa - sb;
    return a.team_name.localeCompare(b.team_name);
  });
  return rows.map(teamRowToPublic);
}

export type TeamDetail = {
  teamId: string;
  teamName: string;
  logoUrl: string | null;
  captainName: string;
  confirmedAt: string | null;
  players: { id: string; fullName: string; captain: boolean; photoUrl: string | null }[];
};

/** Player + photo counts per confirmed team (public read). */
export async function fetchSquadProgressByTeamId(): Promise<Map<string, SquadProgress>> {
  const sb = requireSupabase();
  const { data: teams, error: tErr } = await sb.from('teams').select('id').eq('status', 'confirmed');
  if (tErr) throw tErr;
  const teamIds = (teams ?? []).map((t) => t.id as string);
  const map = new Map<string, SquadProgress>();
  if (teamIds.length === 0) return map;

  const { data: players, error: pErr } = await sb
    .from('players')
    .select('team_id, photo_path')
    .in('team_id', teamIds);
  if (pErr) throw pErr;

  for (const id of teamIds) {
    map.set(id, { playerCount: 0, photoCount: 0 });
  }
  for (const row of players ?? []) {
    const tid = row.team_id as string;
    const entry = map.get(tid) ?? { playerCount: 0, photoCount: 0 };
    entry.playerCount += 1;
    if (row.photo_path) entry.photoCount += 1;
    map.set(tid, entry);
  }
  return map;
}

function normalizePlayerName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export type DuplicatePlayerEntry = {
  playerId: string;
  fullName: string;
  teamId: string;
  teamName: string;
  photoUrl: string | null;
  captain: boolean;
};

export type DuplicatePlayerNameGroup = {
  normalizedName: string;
  label: string;
  entries: DuplicatePlayerEntry[];
};

/** Confirmed squads only — groups where the same player name appears more than once (any team). */
export async function listDuplicatePlayerNamesAdmin(): Promise<DuplicatePlayerNameGroup[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('players')
    .select('id, full_name, photo_path, is_captain, team_id, teams!inner(team_name, status)')
    .eq('teams.status', 'confirmed');
  if (error) throw error;

  const byKey = new Map<string, DuplicatePlayerEntry[]>();
  for (const raw of data ?? []) {
    const row = raw as {
      id: string;
      full_name: string;
      photo_path: string | null;
      is_captain: boolean;
      team_id: string;
      teams: { team_name: string; status: TeamStatus } | { team_name: string; status: TeamStatus }[];
    };
    const teamRel = row.teams;
    const teamMeta = Array.isArray(teamRel) ? teamRel[0] : teamRel;
    if (!teamMeta || teamMeta.status !== 'confirmed') continue;

    const fullName = (row.full_name ?? '').trim();
    if (!fullName) continue;
    const key = normalizePlayerName(fullName);
    const list = byKey.get(key) ?? [];
    list.push({
      playerId: row.id,
      fullName,
      teamId: row.team_id,
      teamName: teamMeta.team_name,
      photoUrl: row.photo_path,
      captain: row.is_captain,
    });
    byKey.set(key, list);
  }

  const groups: DuplicatePlayerNameGroup[] = [];
  for (const [normalizedName, entries] of byKey) {
    if (entries.length < 2) continue;
    entries.sort((a, b) => a.teamName.localeCompare(b.teamName) || a.fullName.localeCompare(b.fullName));
    groups.push({
      normalizedName,
      label: entries[0]?.fullName ?? normalizedName,
      entries,
    });
  }
  groups.sort((a, b) => a.label.localeCompare(b.label));
  return groups;
}

export async function getTeamByName(teamName: string): Promise<TeamDetail | null> {
  const sb = requireSupabase();
  const normalized = teamName.trim().toLowerCase().replace(/\s+/g, ' ');
  const { data: team, error } = await sb
    .from('teams')
    .select('*')
    .eq('normalized_name', normalized)
    .eq('status', 'confirmed')
    .maybeSingle();
  if (error) throw error;
  if (!team) return null;
  const row = team as TeamRow;
  const { data: players, error: pErr } = await sb
    .from('players')
    .select('*')
    .eq('team_id', row.id)
    .order('sort_order', { ascending: true });
  if (pErr) throw pErr;
  return {
    teamId: row.id,
    teamName: row.team_name,
    logoUrl: row.logo_path,
    captainName: row.captain_name,
    confirmedAt: row.confirmed_at,
    players: ((players ?? []) as PlayerRow[]).map((p) => ({
      id: p.id,
      fullName: p.full_name,
      captain: p.is_captain,
      photoUrl: p.photo_path,
    })),
  };
}

export type AdminTeamSummary = {
  id: string;
  publicReference: string;
  teamName: string;
  status: TeamStatus;
  captainName: string;
  createdAt: string;
};

export async function listAllTeamsAdmin(): Promise<TeamPublic[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('teams').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as TeamRow[])
    .filter((t) => t.status === 'confirmed')
    .map(teamRowToPublic);
}

export async function listPendingTeamsAdmin(): Promise<AdminTeamSummary[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('teams')
    .select('id, public_reference, team_name, status, captain_name, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    publicReference: r.public_reference as string,
    teamName: r.team_name as string,
    status: r.status as TeamStatus,
    captainName: r.captain_name as string,
    createdAt: r.created_at as string,
  }));
}

export async function approveTeam(teamId: string) {
  const sb = requireSupabase();
  const { error } = await sb
    .from('teams')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', teamId)
    .eq('status', 'pending');
  if (error) throw error;
}

export async function rejectTeam(teamId: string) {
  const sb = requireSupabase();
  const { error } = await sb.from('teams').update({ status: 'cancelled' }).eq('id', teamId);
  if (error) throw error;
}

export type AdminTeamEdit = {
  id: string;
  teamName: string;
  city: string;
  captainName: string;
  teamLogoUrl: string | null;
  players: {
    id: string | null;
    fullName: string;
    captain: boolean;
    jerseyNumber: string;
    playingRole: string;
    photoUrl: string | null;
  }[];
};

/** Create or return confirmed team row (used for host slots and roster-only board rows). */
export async function adminEnsureTeamOnBoard(teamName: string): Promise<string> {
  const sb = requireSupabase();
  const normalized = normalizeTeamName(teamName);
  const { data: existing, error: findErr } = await sb
    .from('teams')
    .select('id, status')
    .eq('normalized_name', normalized)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing?.id) {
    if ((existing as { status: TeamStatus }).status !== 'confirmed') {
      const { error } = await sb
        .from('teams')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    }
    return existing.id as string;
  }

  const hostIdx = HOME_EVENT.hostTeamNames.findIndex((h) => normalizeTeamName(h) === normalized);
  const sortOrder = hostIdx >= 0 ? hostIdx + 1 : null;

  const { data: team, error } = await sb
    .from('teams')
    .insert({
      team_name: teamName.trim(),
      captain_name: hostIdx >= 0 ? 'Host' : 'Captain',
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      sort_order: sortOrder,
    })
    .select('id')
    .single();
  if (error) throw error;
  return (team as { id: string }).id;
}

export async function getTeamForAdminEdit(teamId: string): Promise<AdminTeamEdit> {
  const sb = requireSupabase();
  const { data: team, error } = await sb.from('teams').select('*').eq('id', teamId).single();
  if (error) throw error;
  const row = team as TeamRow;
  const { data: players, error: pErr } = await sb
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('sort_order', { ascending: true });
  if (pErr) throw pErr;
  return {
    id: row.id,
    teamName: row.team_name,
    city: row.city ?? '',
    captainName: row.captain_name,
    teamLogoUrl: row.logo_path,
    players: ((players ?? []) as PlayerRow[]).map((p) => ({
      id: p.id,
      fullName: p.full_name,
      captain: p.is_captain,
      jerseyNumber: p.jersey_number != null ? String(p.jersey_number) : '',
      playingRole: p.playing_role ?? '',
      photoUrl: p.photo_path,
    })),
  };
}

export async function adminAddConfirmedTeam(input: {
  teamName: string;
  captainName: string;
  teamLogo?: File | null;
  captainPhoto?: File | null;
}) {
  const sb = requireSupabase();
  const { data: team, error } = await sb
    .from('teams')
    .insert({
      team_name: input.teamName.trim(),
      captain_name: input.captainName.trim(),
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  const row = team as TeamRow;
  let logoPath = row.logo_path;
  if (input.teamLogo) {
    logoPath = await uploadTeamLogo(row.id, input.teamLogo);
    await sb.from('teams').update({ logo_path: logoPath }).eq('id', row.id);
  }
  const { data: captain, error: cErr } = await sb
    .from('players')
    .insert({
      team_id: row.id,
      full_name: input.captainName.trim(),
      is_captain: true,
      sort_order: 0,
    })
    .select('*')
    .single();
  if (cErr) throw cErr;
  const cap = captain as PlayerRow;
  if (input.captainPhoto) {
    const photoPath = await uploadPlayerPhoto(row.id, cap.id, input.captainPhoto);
    await sb.from('players').update({ photo_path: photoPath }).eq('id', cap.id);
  }
}

export async function adminDeleteTeamFromBoard(teamId: string) {
  const sb = requireSupabase();
  const { data: players } = await sb.from('players').select('photo_path').eq('team_id', teamId);
  const { data: team } = await sb.from('teams').select('logo_path').eq('id', teamId).single();
  const paths = [
    ...(players ?? []).map((p) => p.photo_path as string | null),
    (team as TeamRow | null)?.logo_path ?? null,
  ].filter((p): p is string => Boolean(p));
  const { error } = await sb.from('teams').delete().eq('id', teamId);
  if (error) throw error;
  await removeStoragePaths(paths);
}

export async function adminSaveTeamEdit(
  edit: AdminTeamEdit,
  opts: {
    newTeamLogo: File | null;
    removeTeamLogo: boolean;
    newPhotos: Map<number, File>;
    removePhotos: Set<number>;
    removedPlayerIds: string[];
  },
) {
  const sb = requireSupabase();
  const teamId = edit.id;

  let logoPath = edit.teamLogoUrl;
  if (opts.removeTeamLogo && edit.teamLogoUrl) {
    await removeStoragePaths([edit.teamLogoUrl]);
    logoPath = null;
  }
  if (opts.newTeamLogo) {
    logoPath = await uploadTeamLogo(teamId, opts.newTeamLogo);
  }

  const { error: teamErr } = await sb
    .from('teams')
    .update({
      team_name: edit.teamName.trim(),
      city: edit.city.trim() || null,
      captain_name: edit.captainName.trim(),
      logo_path: logoPath,
    })
    .eq('id', teamId);
  if (teamErr) throw teamErr;

  if (opts.removedPlayerIds.length > 0) {
    const { data: removed } = await sb
      .from('players')
      .select('photo_path')
      .in('id', opts.removedPlayerIds);
    const { error: delErr } = await sb.from('players').delete().in('id', opts.removedPlayerIds);
    if (delErr) throw delErr;
    await removeStoragePaths((removed ?? []).map((p) => p.photo_path as string).filter(Boolean));
  }

  for (let i = 0; i < edit.players.length; i++) {
    const p = edit.players[i];
    const newFile = opts.newPhotos.get(i) ?? null;
    if (p.id) {
      let photoPath = p.photoUrl;
      if (opts.removePhotos.has(i) && p.photoUrl) {
        await removeStoragePaths([p.photoUrl]);
        photoPath = null;
      }
      if (newFile) {
        photoPath = await uploadPlayerPhoto(teamId, p.id, newFile);
      }
      const { error } = await sb
        .from('players')
        .update({
          full_name: p.fullName.trim(),
          is_captain: p.captain,
          jersey_number: p.jerseyNumber.trim() ? Number(p.jerseyNumber) : null,
          playing_role: p.playingRole.trim() || null,
          photo_path: photoPath,
          sort_order: i,
        })
        .eq('id', p.id);
      if (error) throw error;
    } else {
      const { data: inserted, error: insErr } = await sb
        .from('players')
        .insert({
          team_id: teamId,
          full_name: p.fullName.trim(),
          is_captain: p.captain,
          jersey_number: p.jerseyNumber.trim() ? Number(p.jerseyNumber) : null,
          playing_role: p.playingRole.trim() || null,
          sort_order: i,
        })
        .select('*')
        .single();
      if (insErr) throw insErr;
      const row = inserted as PlayerRow;
      if (newFile) {
        const photoPath = await uploadPlayerPhoto(teamId, row.id, newFile);
        await sb.from('players').update({ photo_path: photoPath }).eq('id', row.id);
      }
    }
  }
}

export async function adminFetchTeamWithPhotosForDownload(teamId: string) {
  const detail = await getTeamForAdminEdit(teamId);
  const sb = requireSupabase();
  const { data: team } = await sb.from('teams').select('team_name, logo_path').eq('id', teamId).single();
  const teamName = (team as { team_name: string }).team_name;
  const logoPath = (team as { logo_path: string | null }).logo_path;
  return {
    teamName,
    logoUrl: storagePublicUrl(logoPath),
    players: detail.players.map((p) => ({
      fullName: p.fullName,
      photoUrl: storagePublicUrl(p.photoUrl),
    })),
  };
}

export async function exportRegistrationsCsv(): Promise<string> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('teams')
    .select('public_reference, team_name, status, captain_name, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const header = 'reference,team,status,captain,created_at';
  const lines = (data ?? []).map((r) =>
    [
      r.public_reference,
      `"${String(r.team_name).replace(/"/g, '""')}"`,
      r.status,
      `"${String(r.captain_name).replace(/"/g, '""')}"`,
      r.created_at,
    ].join(','),
  );
  return [header, ...lines].join('\n');
}

export { supabaseErrorMessage };

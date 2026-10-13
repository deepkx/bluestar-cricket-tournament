import { requireSupabase } from '../lib/supabase';
import type { PlayerRow } from './dbTypes';
import { uploadPlayerPhoto, uploadTeamLogo } from './storage';

export async function grantCaptainUpload(teamId: string, last4: string): Promise<boolean> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc('grant_captain_upload', {
    p_team_id: teamId,
    p_last4: last4.trim(),
  });
  if (error) throw error;
  return Boolean(data);
}

export async function getTeamIdByName(teamName: string): Promise<string | null> {
  const sb = requireSupabase();
  const normalized = teamName.trim().toLowerCase().replace(/\s+/g, ' ');
  const { data, error } = await sb
    .from('teams')
    .select('id')
    .eq('normalized_name', normalized)
    .eq('status', 'confirmed')
    .maybeSingle();
  if (error) throw error;
  return (data?.id as string | undefined) ?? null;
}

export type CaptainPlayerDraft = {
  id: string | null;
  fullName: string;
  photo: File | null;
  existingPhotoPath: string | null;
};

export async function saveCaptainRoster(
  teamId: string,
  teamLogo: File | null,
  players: CaptainPlayerDraft[],
  removedPlayerIds: string[],
) {
  const sb = requireSupabase();

  const captainName = players[0]?.fullName.trim();
  if (teamLogo || captainName) {
    const patch: { logo_path?: string; captain_name?: string } = {};
    if (teamLogo) {
      patch.logo_path = await uploadTeamLogo(teamId, teamLogo);
    }
    if (captainName) patch.captain_name = captainName;
    const { error } = await sb.from('teams').update(patch).eq('id', teamId);
    if (error) throw error;
  }

  if (removedPlayerIds.length > 0) {
    const { error } = await sb.from('players').delete().in('id', removedPlayerIds);
    if (error) throw error;
  }

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (p.id) {
      let photoPath = p.existingPhotoPath;
      if (p.photo) {
        photoPath = await uploadPlayerPhoto(teamId, p.id, p.photo);
      }
      const { error } = await sb
        .from('players')
        .update({
          full_name: p.fullName.trim(),
          photo_path: photoPath,
          sort_order: i,
          is_captain: i === 0,
        })
        .eq('id', p.id);
      if (error) throw error;
    } else if (p.fullName.trim()) {
      const { data: inserted, error: insErr } = await sb
        .from('players')
        .insert({
          team_id: teamId,
          full_name: p.fullName.trim(),
          is_captain: i === 0,
          sort_order: i,
        })
        .select('*')
        .single();
      if (insErr) throw insErr;
      const row = inserted as PlayerRow;
      if (p.photo) {
        const photoPath = await uploadPlayerPhoto(teamId, row.id, p.photo);
        await sb.from('players').update({ photo_path: photoPath }).eq('id', row.id);
      }
    }
  }
}

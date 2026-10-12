import { requireSupabase } from '../lib/supabase';
import type { PlayerRow, TeamRow } from './dbTypes';
import { uploadPlayerPhoto, uploadTeamLogo } from './storage';

export type RegistrationPlayerInput = {
  fullName: string;
  isCaptain: boolean;
};

export async function submitRegistration(input: {
  teamName: string;
  captainName: string;
  players: RegistrationPlayerInput[];
  teamLogo: File;
  playerPhotos: File[];
}): Promise<{ publicReference: string }> {
  const sb = requireSupabase();

  const { data: team, error: teamErr } = await sb
    .from('teams')
    .insert({
      team_name: input.teamName.trim(),
      captain_name: input.captainName.trim(),
      status: 'pending',
    })
    .select('*')
    .single();
  if (teamErr) throw teamErr;
  const row = team as TeamRow;

  try {
    const logoPath = await uploadTeamLogo(row.id, input.teamLogo);
    await sb.from('teams').update({ logo_path: logoPath }).eq('id', row.id);

    for (let i = 0; i < input.players.length; i++) {
      const p = input.players[i];
      const { data: player, error: pErr } = await sb
        .from('players')
        .insert({
          team_id: row.id,
          full_name: p.fullName,
          is_captain: p.isCaptain,
          sort_order: i,
        })
        .select('*')
        .single();
      if (pErr) throw pErr;
      const photo = input.playerPhotos[i];
      if (photo) {
        const photoPath = await uploadPlayerPhoto(row.id, (player as PlayerRow).id, photo);
        await sb.from('players').update({ photo_path: photoPath }).eq('id', (player as PlayerRow).id);
      }
    }
  } catch (err) {
    await sb.from('teams').delete().eq('id', row.id);
    throw err;
  }

  return { publicReference: row.public_reference };
}

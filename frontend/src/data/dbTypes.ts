export type TeamStatus = 'pending' | 'confirmed' | 'cancelled';

export type SiteConfigRow = {
  id: number;
  max_teams: number;
  min_squad_size: number;
  max_squad_size: number;
  registration_open: boolean;
  tournament_starts_at: string | null;
  fixture_announcement_at: string | null;
  pools_reveal_at: string | null;
  fixtures_reveal_at: string | null;
  teams_board_phase: string;
  pools_board_phase: string;
  fixtures_board_phase: string;
  pools_draw_run: number;
  fixtures_draw_run: number;
  teams_board_run: number;
};

export type TeamRow = {
  id: string;
  public_reference: string;
  team_name: string;
  normalized_name: string;
  city: string | null;
  captain_name: string;
  captain_phone_digits: string | null;
  sort_order: number | null;
  logo_path: string | null;
  status: TeamStatus;
  confirmed_at: string | null;
  created_at: string;
};

export type PlayerRow = {
  id: string;
  team_id: string;
  full_name: string;
  jersey_number: number | null;
  playing_role: string | null;
  is_captain: boolean;
  photo_path: string | null;
  sort_order: number;
};

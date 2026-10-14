-- Captain phone + roster upload grants; seed 38 teams; max 40 slots.

ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_phone_digits TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS sort_order INT;

UPDATE site_config SET max_teams = 40 WHERE id = 1;

CREATE TABLE IF NOT EXISTS captain_upload_grants (
  team_id UUID PRIMARY KEY REFERENCES teams (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE captain_upload_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY captain_grants_select_own ON captain_upload_grants
  FOR SELECT TO anon, authenticated
  USING (expires_at > now());

-- Grants written only via security definer function
CREATE OR REPLACE FUNCTION grant_captain_upload(p_team_id UUID, p_last4 TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_last4 IS NULL OR length(trim(p_last4)) <> 4 OR p_last4 !~ '^[0-9]{4}$' THEN
    RETURN false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = p_team_id
      AND t.status = 'confirmed'
      AND right(coalesce(t.captain_phone_digits, ''), 4) = p_last4
  ) THEN
    RETURN false;
  END IF;
  INSERT INTO captain_upload_grants (team_id, expires_at)
  VALUES (p_team_id, now() + interval '4 hours')
  ON CONFLICT (team_id) DO UPDATE SET expires_at = excluded.expires_at;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION grant_captain_upload(UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION captain_has_upload_grant(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM captain_upload_grants g
    WHERE g.team_id = p_team_id AND g.expires_at > now()
  );
$$;

-- Captain (with grant) can manage players on their team
CREATE POLICY players_captain_insert ON players
  FOR INSERT TO anon
  WITH CHECK (captain_has_upload_grant(team_id));

CREATE POLICY players_captain_update ON players
  FOR UPDATE TO anon
  USING (captain_has_upload_grant(team_id))
  WITH CHECK (captain_has_upload_grant(team_id));

CREATE POLICY players_captain_delete ON players
  FOR DELETE TO anon
  USING (captain_has_upload_grant(team_id));

CREATE POLICY teams_captain_update ON teams
  FOR UPDATE TO anon
  USING (captain_has_upload_grant(id))
  WITH CHECK (captain_has_upload_grant(id));

-- Seed roster (run once; safe to re-run with ON CONFLICT)
INSERT INTO teams (team_name, captain_name, captain_phone_digits, sort_order, status, confirmed_at)
VALUES
  ('Dream Chasers', 'Captain', '6380120062', 3, 'confirmed', now()),
  ('Blasters', 'Captain', '9003421975', 4, 'confirmed', now()),
  ('Smashers', 'Captain', '8248869740', 5, 'confirmed', now()),
  ('Sports Star', 'Captain', '9123533460', 6, 'confirmed', now()),
  ('YDK', 'Captain', '9443916716', 7, 'confirmed', now()),
  ('Gully Boys', 'Captain', '6369616793', 8, 'confirmed', now()),
  ('Team Titan', 'Captain', '8122398593', 9, 'confirmed', now()),
  ('Bashers', 'Captain', '8220406359', 10, 'confirmed', now()),
  ('Spartanz', 'Captain', '8838063890', 11, 'confirmed', now()),
  ('408 Kings', 'Captain', '7867835107', 12, 'confirmed', now()),
  ('Honey Badgers', 'Captain', '8610750861', 13, 'confirmed', now()),
  ('Sunday Boys', 'Captain', '8248454694', 14, 'confirmed', now()),
  ('90s Kids', 'Captain', '9489239226', 15, 'confirmed', now()),
  ('LHS', 'Captain', '9361863847', 16, 'confirmed', now()),
  ('College Birds', 'Captain', '9965360182', 17, 'confirmed', now()),
  ('SSK', 'Captain', '9942252341', 18, 'confirmed', now()),
  ('VCC', 'Captain', '8838973626', 19, 'confirmed', now()),
  ('Sharkzz', 'Captain', '8675274463', 20, 'confirmed', now()),
  ('11 Star', 'Captain', '8778351582', 21, 'confirmed', now()),
  ('Captains XI CC', 'Captain', '9940806933', 22, 'confirmed', now()),
  ('Hi-Flyers', 'Captain', '6369392972', 23, 'confirmed', now()),
  ('Pheonix', 'Captain', '6380634397', 24, 'confirmed', now()),
  ('Thunder CC', 'Captain', '7010031315', 25, 'confirmed', now()),
  ('Madmasters', 'Captain', '8072549895', 26, 'confirmed', now()),
  ('SR Independence', 'Captain', '9444810522', 27, 'confirmed', now()),
  ('Independence', 'Captain', '8760580584', 28, 'confirmed', now()),
  ('Bad Jokers', 'Captain', '8668108769', 29, 'confirmed', now()),
  ('Disaster', 'Captain', '6382992408', 30, 'confirmed', now()),
  ('Fearless', 'Captain', '9095718379', 31, 'confirmed', now()),
  ('Hollywood', 'Captain', '8940413970', 32, 'confirmed', now()),
  ('Falcons', 'Captain', '6374657639', 33, 'confirmed', now()),
  ('Scorpions', 'Captain', '9566894949', 34, 'confirmed', now()),
  ('INS', 'Captain', '8531879990', 35, 'confirmed', now()),
  ('SN Sports', 'Captain', '9789621961', 36, 'confirmed', now()),
  ('Game Changer', 'Captain', '6369144843', 37, 'confirmed', now()),
  ('Black Booster', 'Captain', '9626529034', 38, 'confirmed', now()),
  ('Neyveli Titans', 'Captain', '9360066103', 39, 'confirmed', now()),
  ('Luminous Lions', 'Captain', '7538830821', 40, 'confirmed', now())
ON CONFLICT (normalized_name) DO UPDATE SET
  captain_phone_digits = excluded.captain_phone_digits,
  sort_order = excluded.sort_order,
  status = 'confirmed';

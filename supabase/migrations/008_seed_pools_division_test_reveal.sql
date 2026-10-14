-- Pool seed (explicit team names). Creates pool tables + RPCs if 007 was not run yet.
-- Requires: 001 (site_config, teams) and 006 (team roster) already applied.

-- ---------- Bootstrap from 007 (safe if already applied) ----------
CREATE TABLE IF NOT EXISTS tournament_pool_slots (
  pool_code TEXT NOT NULL CHECK (pool_code IN ('A', 'B', 'C', 'D')),
  slot_order INT NOT NULL CHECK (slot_order BETWEEN 1 AND 10),
  team_id UUID REFERENCES teams (id) ON DELETE SET NULL,
  PRIMARY KEY (pool_code, slot_order)
);

CREATE UNIQUE INDEX IF NOT EXISTS tournament_pool_slots_team_unique
  ON tournament_pool_slots (team_id)
  WHERE team_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS tournament_fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_code TEXT CHECK (pool_code IN ('A', 'B', 'C', 'D')),
  match_order INT NOT NULL DEFAULT 0,
  team_a_id UUID REFERENCES teams (id) ON DELETE SET NULL,
  team_b_id UUID REFERENCES teams (id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  venue TEXT,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tournament_fixtures_order ON tournament_fixtures (match_order, pool_code);

ALTER TABLE tournament_pool_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_fixtures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tournament_pool_slots_admin_all ON tournament_pool_slots;
CREATE POLICY tournament_pool_slots_admin_all ON tournament_pool_slots
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS tournament_fixtures_admin_all ON tournament_fixtures;
CREATE POLICY tournament_fixtures_admin_all ON tournament_fixtures
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.pools_fixtures_revealed()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM site_config
    WHERE id = 1
      AND fixture_announcement_at IS NOT NULL
      AND fixture_announcement_at <= now()
  );
$$;

GRANT EXECUTE ON FUNCTION public.pools_fixtures_revealed() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_pools()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.pools_fixtures_revealed() THEN
    RETURN '[]'::json;
  END IF;
  RETURN COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'poolCode', p.pool_code,
          'slots', (
            SELECT COALESCE(
              json_agg(
                json_build_object(
                  'slotOrder', ps.slot_order,
                  'teamId', ps.team_id,
                  'teamName', t.team_name
                )
                ORDER BY ps.slot_order
              ),
              '[]'::json
            )
            FROM tournament_pool_slots ps
            LEFT JOIN teams t ON t.id = ps.team_id
            WHERE ps.pool_code = p.pool_code
          )
        )
        ORDER BY p.pool_code
      )
      FROM (VALUES ('A'), ('B'), ('C'), ('D')) AS p(pool_code)
    ),
    '[]'::json
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_pools() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_fixtures()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.pools_fixtures_revealed() THEN
    RETURN '[]'::json;
  END IF;
  RETURN COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', f.id,
          'poolCode', f.pool_code,
          'matchOrder', f.match_order,
          'label', f.label,
          'teamAName', ta.team_name,
          'teamBName', tb.team_name,
          'scheduledAt', f.scheduled_at,
          'venue', f.venue
        )
        ORDER BY f.match_order, f.pool_code, f.created_at
      )
      FROM tournament_fixtures f
      LEFT JOIN teams ta ON ta.id = f.team_a_id
      LEFT JOIN teams tb ON tb.id = f.team_b_id
    ),
    '[]'::json
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_fixtures() TO anon, authenticated;

-- ---------- Pool assignments (edit team names for your real draw) ----------
INSERT INTO teams (team_name, captain_name, sort_order, status, confirmed_at)
VALUES
  ('Bluestar', 'Host', 1, 'confirmed', now()),
  ('Bluestar B', 'Host', 2, 'confirmed', now())
ON CONFLICT (normalized_name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  status = 'confirmed',
  confirmed_at = COALESCE(teams.confirmed_at, now());

-- Uncomment for shuffle test (pools visible on site immediately):
-- UPDATE site_config SET fixture_announcement_at = (now() - interval '10 minutes') WHERE id = 1;

DELETE FROM tournament_pool_slots;

INSERT INTO tournament_pool_slots (pool_code, slot_order, team_id)
SELECT v.pool_code, v.slot_order, t.id
FROM (VALUES
  ('A', 1, 'Luminous Lions'),
  ('A', 2, 'Gully Boys'),
  ('A', 3, 'Smashers'),
  ('A', 4, 'Team Titan'),
  ('A', 5, 'Disaster'),
  ('A', 6, 'Hollywood'),
  ('A', 7, 'LHS'),
  ('A', 8, '408 Kings'),
  ('A', 9, 'Thunder CC'),
  ('A', 10, 'Bluestar B'),
  ('B', 1, 'College Birds'),
  ('B', 2, 'VCC'),
  ('B', 3, 'Honey Badgers'),
  ('B', 4, 'Bluestar'),
  ('B', 5, 'SSK'),
  ('B', 6, 'Sunday Boys'),
  ('B', 7, 'Captains XI CC'),
  ('B', 8, 'Hi-Flyers'),
  ('B', 9, 'Blasters'),
  ('B', 10, 'Neyveli Titans'),
  ('C', 1, 'Sharkzz'),
  ('C', 2, 'Pheonix'),
  ('C', 3, 'Falcons'),
  ('C', 4, 'Spartanz'),
  ('C', 5, 'Independence'),
  ('C', 6, 'Bad Jokers'),
  ('C', 7, '90s Kids'),
  ('C', 8, 'INS'),
  ('C', 9, 'Game Changer'),
  ('C', 10, 'SR Independence'),
  ('D', 1, 'YDK'),
  ('D', 2, 'Sports Star'),
  ('D', 3, 'Fearless'),
  ('D', 4, 'SN Sports'),
  ('D', 5, 'Madmasters'),
  ('D', 6, 'Bashers'),
  ('D', 7, 'Scorpions'),
  ('D', 8, '11 Star'),
  ('D', 9, 'Dream Chasers'),
  ('D', 10, 'Black Booster')
) AS v(pool_code, slot_order, team_name)
JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
ON CONFLICT (pool_code, slot_order) DO UPDATE SET team_id = EXCLUDED.team_id;

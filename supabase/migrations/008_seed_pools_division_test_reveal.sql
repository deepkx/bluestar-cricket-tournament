-- Official pool assignments by team name (edit lists below — no auto split by sort_order).
-- Requires 006 (teams) and 007 (pool tables). Fixtures: set manually in Admin → Pools & fixtures.
-- Optional: uncomment the site_config UPDATE to force reveal for shuffle testing.

INSERT INTO teams (team_name, captain_name, sort_order, status, confirmed_at)
VALUES
  ('Bluestar', 'Host', 1, 'confirmed', now()),
  ('Bluestar B', 'Host', 2, 'confirmed', now())
ON CONFLICT (normalized_name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  status = 'confirmed',
  confirmed_at = COALESCE(teams.confirmed_at, now());

-- Uncomment for local shuffle test (draw already “live”):
-- UPDATE site_config SET fixture_announcement_at = (now() - interval '10 minutes') WHERE id = 1;

DELETE FROM tournament_pool_slots;

INSERT INTO tournament_pool_slots (pool_code, slot_order, team_id)
SELECT v.pool_code, v.slot_order, t.id
FROM (VALUES
  -- Pool A — replace with your real draw
  ('A', 1, 'Bluestar'),
  ('A', 2, 'Bluestar B'),
  ('A', 3, 'Dream Chasers'),
  ('A', 4, 'Blasters'),
  ('A', 5, 'Smashers'),
  ('A', 6, 'Sports Star'),
  ('A', 7, 'YDK'),
  ('A', 8, 'Gully Boys'),
  ('A', 9, 'Team Titan'),
  ('A', 10, 'Bashers'),
  -- Pool B
  ('B', 1, 'Spartanz'),
  ('B', 2, '408 Kings'),
  ('B', 3, 'Honey Badgers'),
  ('B', 4, 'Sunday Boys'),
  ('B', 5, '90s Kids'),
  ('B', 6, 'LHS'),
  ('B', 7, 'College Birds'),
  ('B', 8, 'SSK'),
  ('B', 9, 'VCC'),
  ('B', 10, 'Sharkzz'),
  -- Pool C
  ('C', 1, '11 Star'),
  ('C', 2, 'Captains XI CC'),
  ('C', 3, 'FCC'),
  ('C', 4, 'Pheonix'),
  ('C', 5, 'Thunder CC'),
  ('C', 6, 'Madmasters'),
  ('C', 7, 'SR Independence'),
  ('C', 8, 'Independence'),
  ('C', 9, 'Bad Jokers'),
  ('C', 10, 'Disaster'),
  -- Pool D
  ('D', 1, 'Fearless'),
  ('D', 2, 'Hollywood'),
  ('D', 3, 'Falcons'),
  ('D', 4, 'Scorpions'),
  ('D', 5, 'INS'),
  ('D', 6, 'SN Sports'),
  ('D', 7, 'Game Changer'),
  ('D', 8, 'Black Booster'),
  ('D', 9, 'Neyveli Titans'),
  ('D', 10, 'Empty Boys')
) AS v(pool_code, slot_order, team_name)
JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
ON CONFLICT (pool_code, slot_order) DO UPDATE SET team_id = EXCLUDED.team_id;

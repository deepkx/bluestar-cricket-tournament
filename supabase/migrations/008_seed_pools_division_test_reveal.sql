-- Seed 4 pools (10 teams each), sample fixtures, and set reveal time to the past for shuffle testing.
-- Requires 006 (teams) and 007 (pool tables). Safe to re-run.

INSERT INTO teams (team_name, captain_name, sort_order, status, confirmed_at)
VALUES
  ('Bluestar', 'Host', 1, 'confirmed', now()),
  ('Bluestar B', 'Host', 2, 'confirmed', now())
ON CONFLICT (normalized_name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  status = 'confirmed',
  confirmed_at = COALESCE(teams.confirmed_at, now());

UPDATE site_config
SET fixture_announcement_at = (now() - interval '10 minutes')
WHERE id = 1;

DELETE FROM tournament_fixtures;
DELETE FROM tournament_pool_slots;

WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY COALESCE(sort_order, 9999), normalized_name
    ) AS rn
  FROM teams
  WHERE status = 'confirmed'
),
bucketed AS (
  SELECT
    id,
    CASE
      WHEN rn <= 10 THEN 'A'
      WHEN rn <= 20 THEN 'B'
      WHEN rn <= 30 THEN 'C'
      ELSE 'D'
    END AS pool_code,
    ((rn - 1) % 10) + 1 AS slot_order
  FROM ordered
  WHERE rn <= 40
)
INSERT INTO tournament_pool_slots (pool_code, slot_order, team_id)
SELECT pool_code, slot_order, id
FROM bucketed
ON CONFLICT (pool_code, slot_order) DO UPDATE SET team_id = EXCLUDED.team_id;

-- Pairings 1v2, 3v4, … within each pool
WITH paired AS (
  SELECT
    pool_code,
    slot_order,
    team_id,
    LEAD(team_id) OVER (PARTITION BY pool_code ORDER BY slot_order) AS team_b_id
  FROM tournament_pool_slots
  WHERE team_id IS NOT NULL
),
numbered AS (
  SELECT
    pool_code,
    team_id AS team_a_id,
    team_b_id,
    ROW_NUMBER() OVER (ORDER BY pool_code, slot_order) AS match_order
  FROM paired
  WHERE slot_order % 2 = 1 AND team_b_id IS NOT NULL
)
INSERT INTO tournament_fixtures (pool_code, match_order, team_a_id, team_b_id, label, venue)
SELECT
  pool_code,
  match_order,
  team_a_id,
  team_b_id,
  'Pool ' || pool_code,
  'Hollywood Ground'
FROM numbered;

-- Ensure showdown rows can exist and are present (semi 1/2 + final, pool_code NULL).

ALTER TABLE tournament_fixtures DROP CONSTRAINT IF EXISTS tournament_fixtures_pool_code_check;

ALTER TABLE tournament_fixtures
  ADD CONSTRAINT tournament_fixtures_pool_code_check
  CHECK (pool_code IS NULL OR pool_code IN ('A', 'B', 'C', 'D'));

INSERT INTO tournament_fixtures (pool_code, match_order, label, team_a_id, team_b_id, scheduled_at, venue)
SELECT NULL, 101, 'Semi 1 · Winner Pool A vs Winner Pool C', NULL, NULL, NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM tournament_fixtures WHERE pool_code IS NULL AND label LIKE 'Semi 1%'
);

INSERT INTO tournament_fixtures (pool_code, match_order, label, team_a_id, team_b_id, scheduled_at, venue)
SELECT NULL, 102, 'Semi 2 · Winner Pool B vs Winner Pool D', NULL, NULL, NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM tournament_fixtures WHERE pool_code IS NULL AND label LIKE 'Semi 2%'
);

INSERT INTO tournament_fixtures (pool_code, match_order, label, team_a_id, team_b_id, scheduled_at, venue)
SELECT NULL, 103, 'Final · Winner Semi 1 vs Winner Semi 2', NULL, NULL, NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM tournament_fixtures WHERE pool_code IS NULL AND label LIKE 'Final · Winner Semi%'
);

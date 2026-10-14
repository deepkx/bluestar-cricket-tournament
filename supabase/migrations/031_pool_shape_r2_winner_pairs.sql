-- Superseded by 032_restore_bye_r2_m1_first.sql (keep for migration order).
-- "Shape" bracket — do not use on prod; run 032 instead.

UPDATE tournament_fixtures
SET label = 'R2 · M1 · Winner R1-M1 vs Winner R1-M2',
    team_a_id = NULL,
    team_b_id = NULL,
    winner_team_id = NULL
WHERE label LIKE 'R2 · M1%';

UPDATE tournament_fixtures
SET label = 'R2 · M2 · Winner R1-M3 vs Winner R1-M4',
    team_a_id = NULL,
    team_b_id = NULL,
    winner_team_id = NULL
WHERE label LIKE 'R2 · M2%';

UPDATE tournament_fixtures
SET label = 'R3 · M1 · vs Winner R2-M1',
    winner_team_id = NULL
WHERE label LIKE 'R3 · M1%';

UPDATE tournament_fixtures
SET label = 'R3 · M2 · vs Winner R2-M2',
    winner_team_id = NULL
WHERE label LIKE 'R3 · M2%';

CREATE OR REPLACE FUNCTION _pool_slot_team(p_pool text, p_slot int)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT team_id FROM tournament_pool_slots
  WHERE pool_code = p_pool AND slot_order = p_slot;
$$;

DO $$
DECLARE
  p text;
BEGIN
  FOREACH p IN ARRAY ARRAY['A', 'B', 'C', 'D'] LOOP
    UPDATE tournament_fixtures
    SET team_a_id = _pool_slot_team(p, 1), team_b_id = NULL
    WHERE pool_code = p AND label LIKE 'R3 · M1%';

    UPDATE tournament_fixtures
    SET team_a_id = _pool_slot_team(p, 10), team_b_id = NULL
    WHERE pool_code = p AND label LIKE 'R3 · M2%';
  END LOOP;
END $$;

DROP FUNCTION _pool_slot_team(text, int);

UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code IN ('A', 'B', 'C', 'D') AND (label LIKE 'R3%' OR label LIKE 'R4%');

UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code IS NULL AND match_order >= 101;

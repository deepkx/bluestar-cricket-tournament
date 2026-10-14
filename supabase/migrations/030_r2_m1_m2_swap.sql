-- R2-M1 = slot 1 vs Winner R1-M1 (earlier kickoff) · R2-M2 = slot 10 vs Winner R1-M4

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
    SET
      label = 'R2 · M1 · vs Winner R1-M1',
      team_a_id = _pool_slot_team(p, 1),
      team_b_id = NULL,
      winner_team_id = NULL
    WHERE pool_code = p AND label LIKE 'R2 · M1%';

    UPDATE tournament_fixtures
    SET
      label = 'R2 · M2 · vs Winner R1-M4',
      team_a_id = _pool_slot_team(p, 10),
      team_b_id = NULL,
      winner_team_id = NULL
    WHERE pool_code = p AND label LIKE 'R2 · M2%';
  END LOOP;
END $$;

-- Ensure R2-M1 is always the earlier slot (times unchanged from 029: M1 then M2).
UPDATE tournament_fixtures f
SET scheduled_at = early.t
FROM (
  SELECT pool_code, MIN(scheduled_at) AS t
  FROM tournament_fixtures
  WHERE pool_code IN ('A', 'B', 'C', 'D') AND label LIKE 'R2 · M%'
  GROUP BY pool_code
) early
WHERE f.pool_code = early.pool_code AND f.label LIKE 'R2 · M1%' AND f.scheduled_at IS NOT NULL;

UPDATE tournament_fixtures f
SET scheduled_at = late.t
FROM (
  SELECT pool_code, MAX(scheduled_at) AS t
  FROM tournament_fixtures
  WHERE pool_code IN ('A', 'B', 'C', 'D') AND label LIKE 'R2 · M%'
  GROUP BY pool_code
) late
WHERE f.pool_code = late.pool_code AND f.label LIKE 'R2 · M2%' AND f.scheduled_at IS NOT NULL;

DROP FUNCTION _pool_slot_team(text, int);

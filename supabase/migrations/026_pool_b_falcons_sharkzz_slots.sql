-- Pool B: Falcons → slot 1, Sharkzz → slot 3. Re-sync R1-M1 and R2-M1 (seed 1) from slots.

UPDATE tournament_pool_slots SET team_id = NULL
WHERE pool_code = 'B' AND slot_order IN (1, 3);

UPDATE tournament_pool_slots AS s
SET team_id = t.id
FROM (VALUES
  ('B', 1, 'Falcons'),
  ('B', 3, 'Sharkzz')
) AS v(pool_code, slot_order, team_name)
JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
WHERE s.pool_code = v.pool_code AND s.slot_order = v.slot_order;

CREATE OR REPLACE FUNCTION _pool_slot_team(p_pool text, p_slot int)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT team_id FROM tournament_pool_slots
  WHERE pool_code = p_pool AND slot_order = p_slot;
$$;

UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('B', 2), team_b_id = _pool_slot_team('B', 3),
  winner_team_id = NULL
WHERE pool_code = 'B' AND label LIKE 'R1 · M1%';

UPDATE tournament_fixtures SET label = 'R2 · M1 · vs Winner R1-M1', team_a_id = _pool_slot_team('B', 1), team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'B' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET label = 'R2 · M2 · vs Winner R1-M4', team_a_id = _pool_slot_team('B', 10), team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'B' AND label LIKE 'R2 · M2%';

UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code = 'B' AND (label LIKE 'R3%' OR label LIKE 'R4%');

UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code IS NULL AND match_order >= 101;

DROP FUNCTION _pool_slot_team(text, int);

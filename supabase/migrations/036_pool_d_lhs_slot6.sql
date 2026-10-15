-- Pool D slot 6: LHS (replaces Bashers — Bashers in Pool C).

UPDATE tournament_pool_slots SET team_id = NULL
WHERE team_id = (SELECT id FROM teams WHERE normalized_name = normalize_team_name('LHS'));

UPDATE tournament_pool_slots AS s
SET team_id = t.id
FROM teams t
WHERE s.pool_code = 'D'
  AND s.slot_order = 6
  AND t.normalized_name = normalize_team_name('LHS');

CREATE OR REPLACE FUNCTION _pool_slot_team(p_pool text, p_slot int)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT team_id FROM tournament_pool_slots
  WHERE pool_code = p_pool AND slot_order = p_slot;
$$;

UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('D', 6), team_b_id = _pool_slot_team('D', 7),
  winner_team_id = NULL
WHERE pool_code = 'D' AND label LIKE 'R1 · M3%';

UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code = 'D' AND (label LIKE 'R3%' OR label LIKE 'R4%');

DROP FUNCTION _pool_slot_team(text, int);

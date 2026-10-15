-- Pool C slot order (committee). Bashers → slot 4; LHS out of pool C; seed 1 = Thunder CC; slot 10 empty (9-team short knockout).

WITH placement AS (
  SELECT v.pool_code, v.slot_order, t.id AS team_id
  FROM (VALUES
    ('C', 1, 'Thunder CC'),
    ('C', 2, 'Hollywood'),
    ('C', 3, 'Disaster'),
    ('C', 4, 'Bashers'),
    ('C', 5, '408 Kings'),
    ('C', 6, 'Gully Boys'),
    ('C', 7, 'Team Titan'),
    ('C', 8, 'Smashers'),
    ('C', 9, 'Bluestar B')
  ) AS v(pool_code, slot_order, team_name)
  JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
)
UPDATE tournament_pool_slots s
SET team_id = NULL
WHERE s.team_id IN (SELECT team_id FROM placement);

UPDATE tournament_pool_slots SET team_id = NULL WHERE pool_code = 'C';
UPDATE tournament_pool_slots SET team_id = NULL WHERE pool_code = 'C' AND slot_order = 10;

WITH placement AS (
  SELECT v.pool_code, v.slot_order, t.id AS team_id
  FROM (VALUES
    ('C', 1, 'Thunder CC'),
    ('C', 2, 'Hollywood'),
    ('C', 3, 'Disaster'),
    ('C', 4, 'Bashers'),
    ('C', 5, '408 Kings'),
    ('C', 6, 'Gully Boys'),
    ('C', 7, 'Team Titan'),
    ('C', 8, 'Smashers'),
    ('C', 9, 'Bluestar B')
  ) AS v(pool_code, slot_order, team_name)
  JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
)
UPDATE tournament_pool_slots AS s
SET team_id = p.team_id
FROM placement p
WHERE s.pool_code = p.pool_code AND s.slot_order = p.slot_order;

CREATE OR REPLACE FUNCTION _pool_slot_team(p_pool text, p_slot int)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT team_id FROM tournament_pool_slots
  WHERE pool_code = p_pool AND slot_order = p_slot;
$$;

UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 2), team_b_id = _pool_slot_team('C', 3),
  winner_team_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 4), team_b_id = _pool_slot_team('C', 5),
  winner_team_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 6), team_b_id = _pool_slot_team('C', 7),
  winner_team_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 8), team_b_id = _pool_slot_team('C', 9),
  winner_team_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET label = 'R2 · M1 · vs Winner R1-M1', team_a_id = _pool_slot_team('C', 1), team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET label = 'R2 · M2 · Winner R1-M3 vs Winner R1-M4', team_a_id = NULL, team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R2 · M2%';
DELETE FROM tournament_fixtures WHERE pool_code = 'C' AND label LIKE 'R3 · M2%';
UPDATE tournament_fixtures SET label = 'R4 · Final · Winner R3-M1 vs Winner R2-M2', team_a_id = NULL, team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R4%';
UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code = 'C' AND (label LIKE 'R3%' OR label LIKE 'R4%');

UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code IS NULL AND match_order >= 101;

DROP FUNCTION _pool_slot_team(text, int);

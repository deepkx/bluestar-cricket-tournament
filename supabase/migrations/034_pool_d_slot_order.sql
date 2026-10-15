-- Pool D slot order (committee). Superseded by 041_pool_d_committee_slot_order.sql on existing DBs.

WITH placement AS (
  SELECT v.pool_code, v.slot_order, t.id AS team_id
  FROM (VALUES
    ('D', 1, 'LHS'),
    ('D', 2, 'YDK'),
    ('D', 3, 'SN Sports'),
    ('D', 4, 'Scorpions'),
    ('D', 5, '11 Star'),
    ('D', 6, 'Madmasters'),
    ('D', 7, 'Dream Chasers'),
    ('D', 8, 'Sports Star'),
    ('D', 9, 'Black Booster'),
    ('D', 10, 'Fearless')
  ) AS v(pool_code, slot_order, team_name)
  JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
)
UPDATE tournament_pool_slots s
SET team_id = NULL
WHERE s.team_id IN (SELECT team_id FROM placement);

UPDATE tournament_pool_slots SET team_id = NULL WHERE pool_code = 'D';

WITH placement AS (
  SELECT v.pool_code, v.slot_order, t.id AS team_id
  FROM (VALUES
    ('D', 1, 'LHS'),
    ('D', 2, 'YDK'),
    ('D', 3, 'SN Sports'),
    ('D', 4, 'Scorpions'),
    ('D', 5, '11 Star'),
    ('D', 6, 'Madmasters'),
    ('D', 7, 'Dream Chasers'),
    ('D', 8, 'Sports Star'),
    ('D', 9, 'Black Booster'),
    ('D', 10, 'Fearless')
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

UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('D', 2), team_b_id = _pool_slot_team('D', 3),
  winner_team_id = NULL
WHERE pool_code = 'D' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('D', 4), team_b_id = _pool_slot_team('D', 5),
  winner_team_id = NULL
WHERE pool_code = 'D' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('D', 6), team_b_id = _pool_slot_team('D', 7),
  winner_team_id = NULL
WHERE pool_code = 'D' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('D', 8), team_b_id = _pool_slot_team('D', 9),
  winner_team_id = NULL
WHERE pool_code = 'D' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET label = 'R2 · M1 · vs Winner R1-M1', team_a_id = _pool_slot_team('D', 1), team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'D' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET label = 'R2 · M2 · vs Winner R1-M4', team_a_id = _pool_slot_team('D', 10), team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'D' AND label LIKE 'R2 · M2%';
UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code = 'D' AND (label LIKE 'R3%' OR label LIKE 'R4%');

UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code IS NULL AND match_order >= 101;

DROP FUNCTION _pool_slot_team(text, int);

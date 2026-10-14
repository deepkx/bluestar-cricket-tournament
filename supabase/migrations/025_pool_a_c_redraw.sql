-- Pool A / Pool C slot redraw (committee order). Re-sync R1/R2 team ids from slots; clear stale winners.
-- team_id is UNIQUE across all pools: clear every team we place (any pool) + empty A/C before assign.

WITH placement AS (
  SELECT v.pool_code, v.slot_order, t.id AS team_id
  FROM (VALUES
    ('A', 1, 'College Birds'),
    ('A', 2, 'Bluestar'),
    ('A', 3, 'SSK'),
    ('A', 4, 'VCC'),
    ('A', 5, 'Honey Badgers'),
    ('A', 6, 'Sunday Boys'),
    ('A', 7, 'Neyveli Titans'),
    ('A', 8, 'Hi-Flyers'),
    ('A', 9, 'Blasters'),
    ('A', 10, 'Captains XI CC'),
    ('C', 1, 'Luminous Lions'),
    ('C', 2, 'Gully Boys'),
    ('C', 3, 'Team Titan'),
    ('C', 4, 'Smashers'),
    ('C', 5, 'LHS'),
    ('C', 6, 'Hollywood'),
    ('C', 7, 'Disaster'),
    ('C', 8, '408 Kings'),
    ('C', 9, 'Thunder CC'),
    ('C', 10, 'Bluestar B')
  ) AS v(pool_code, slot_order, team_name)
  JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
)
UPDATE tournament_pool_slots s
SET team_id = NULL
WHERE s.team_id IN (SELECT team_id FROM placement);

UPDATE tournament_pool_slots SET team_id = NULL WHERE pool_code IN ('A', 'C');

WITH placement AS (
  SELECT v.pool_code, v.slot_order, t.id AS team_id
  FROM (VALUES
    ('A', 1, 'College Birds'),
    ('A', 2, 'Bluestar'),
    ('A', 3, 'SSK'),
    ('A', 4, 'VCC'),
    ('A', 5, 'Honey Badgers'),
    ('A', 6, 'Sunday Boys'),
    ('A', 7, 'Neyveli Titans'),
    ('A', 8, 'Hi-Flyers'),
    ('A', 9, 'Blasters'),
    ('A', 10, 'Captains XI CC'),
    ('C', 1, 'Luminous Lions'),
    ('C', 2, 'Gully Boys'),
    ('C', 3, 'Team Titan'),
    ('C', 4, 'Smashers'),
    ('C', 5, 'LHS'),
    ('C', 6, 'Hollywood'),
    ('C', 7, 'Disaster'),
    ('C', 8, '408 Kings'),
    ('C', 9, 'Thunder CC'),
    ('C', 10, 'Bluestar B')
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

-- Pool A
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('A', 2), team_b_id = _pool_slot_team('A', 3),
  winner_team_id = NULL
WHERE pool_code = 'A' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('A', 4), team_b_id = _pool_slot_team('A', 5),
  winner_team_id = NULL
WHERE pool_code = 'A' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('A', 6), team_b_id = _pool_slot_team('A', 7),
  winner_team_id = NULL
WHERE pool_code = 'A' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('A', 8), team_b_id = _pool_slot_team('A', 9),
  winner_team_id = NULL
WHERE pool_code = 'A' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET label = 'R2 · M1 · vs Winner R1-M1', team_a_id = _pool_slot_team('A', 1), team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'A' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET label = 'R2 · M2 · vs Winner R1-M4', team_a_id = _pool_slot_team('A', 10), team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'A' AND label LIKE 'R2 · M2%';
UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code = 'A' AND (label LIKE 'R3%' OR label LIKE 'R4%');

-- Pool C
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
UPDATE tournament_fixtures SET label = 'R2 · M2 · vs Winner R1-M4', team_a_id = _pool_slot_team('C', 10), team_b_id = NULL, winner_team_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R2 · M2%';
UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code = 'C' AND (label LIKE 'R3%' OR label LIKE 'R4%');

UPDATE tournament_fixtures SET winner_team_id = NULL
WHERE pool_code IS NULL AND match_order >= 101;

DROP FUNCTION _pool_slot_team(text, int);

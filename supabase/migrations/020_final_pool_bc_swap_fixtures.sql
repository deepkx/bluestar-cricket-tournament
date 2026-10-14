-- Final draw: Pool B = former C roster, Pool C = former B roster. Re-apply knockout pairings from slots.
-- Pattern (every pool): R1 2v3, 4v5, 6v7, 8v9 · R2-M1 slot10 vs W-R1-M4 · R2-M2 slot1 vs W-R1-M1

UPDATE tournament_pool_slots AS s
SET team_id = t.id
FROM (VALUES
  ('B', 1, 'Sharkzz'),
  ('B', 2, 'Pheonix'),
  ('B', 3, 'Falcons'),
  ('B', 4, 'Spartanz'),
  ('B', 5, 'Independence'),
  ('B', 6, 'Bad Jokers'),
  ('B', 7, '90s Kids'),
  ('B', 8, 'INS'),
  ('B', 9, 'Game Changer'),
  ('B', 10, 'SR Independence'),
  ('C', 1, 'College Birds'),
  ('C', 2, 'VCC'),
  ('C', 3, 'Honey Badgers'),
  ('C', 4, 'Bluestar'),
  ('C', 5, 'SSK'),
  ('C', 6, 'Sunday Boys'),
  ('C', 7, 'Captains XI CC'),
  ('C', 8, 'Hi-Flyers'),
  ('C', 9, 'Blasters'),
  ('C', 10, 'Neyveli Titans')
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

-- Pool B — Sunday (match_order 11–19)
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('B', 2), team_b_id = _pool_slot_team('B', 3)
WHERE pool_code = 'B' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('B', 4), team_b_id = _pool_slot_team('B', 5)
WHERE pool_code = 'B' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('B', 6), team_b_id = _pool_slot_team('B', 7)
WHERE pool_code = 'B' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('B', 8), team_b_id = _pool_slot_team('B', 9)
WHERE pool_code = 'B' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('B', 10), team_b_id = NULL
WHERE pool_code = 'B' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('B', 1), team_b_id = NULL
WHERE pool_code = 'B' AND label LIKE 'R2 · M2%';

-- Pool C — Saturday (match_order 21–29)
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 2), team_b_id = _pool_slot_team('C', 3)
WHERE pool_code = 'C' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 4), team_b_id = _pool_slot_team('C', 5)
WHERE pool_code = 'C' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 6), team_b_id = _pool_slot_team('C', 7)
WHERE pool_code = 'C' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 8), team_b_id = _pool_slot_team('C', 9)
WHERE pool_code = 'C' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 10), team_b_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('C', 1), team_b_id = NULL
WHERE pool_code = 'C' AND label LIKE 'R2 · M2%';

-- Pool D — fix R1-M4 (Spartanz moved to B): slots 8 vs 9
UPDATE tournament_fixtures SET team_a_id = _pool_slot_team('D', 8), team_b_id = _pool_slot_team('D', 9)
WHERE pool_code = 'D' AND label LIKE 'R1 · M4%';

DROP FUNCTION _pool_slot_team(text, int);

-- Final pool draw (40 teams, DB names). No lever animation required — replaces tournament_pool_slots.

DELETE FROM tournament_pool_slots;

INSERT INTO tournament_pool_slots (pool_code, slot_order, team_id)
SELECT v.pool_code, v.slot_order, t.id
FROM (VALUES
  ('A', 1, 'College Birds'),
  ('A', 2, 'Bluestar'),
  ('A', 3, 'SSK'),
  ('A', 4, 'VCC'),
  ('A', 5, 'Honey Badgers'),
  ('A', 6, 'Sunday Boys'),
  ('A', 7, 'Neyveli Titans'),
  ('A', 8, 'Blasters'),
  ('A', 9, 'Captains XI CC'),
  ('B', 1, 'Falcons'),
  ('B', 2, 'Pheonix'),
  ('B', 3, 'Sharkzz'),
  ('B', 4, 'Spartanz'),
  ('B', 5, 'Independence'),
  ('B', 6, 'Bad Jokers'),
  ('B', 7, '90s Kids'),
  ('B', 8, 'INS'),
  ('B', 9, 'Game Changer'),
  ('C', 1, 'Thunder CC'),
  ('C', 2, 'Hollywood'),
  ('C', 3, 'Disaster'),
  ('C', 4, 'Bashers'),
  ('C', 5, '408 Kings'),
  ('C', 6, 'Gully Boys'),
  ('C', 7, 'Team Titan'),
  ('C', 8, 'Smashers'),
  ('C', 9, 'Bluestar B'),
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
ON CONFLICT (pool_code, slot_order) DO UPDATE SET team_id = EXCLUDED.team_id;

INSERT INTO tournament_pool_slots (pool_code, slot_order, team_id)
VALUES ('A', 10, NULL), ('B', 10, NULL), ('C', 10, NULL)
ON CONFLICT (pool_code, slot_order) DO UPDATE SET team_id = EXCLUDED.team_id;

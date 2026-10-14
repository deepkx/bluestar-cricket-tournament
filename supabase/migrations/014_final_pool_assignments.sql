-- Final pool draw (40 teams, DB names). No lever animation required — replaces tournament_pool_slots.

DELETE FROM tournament_pool_slots;

INSERT INTO tournament_pool_slots (pool_code, slot_order, team_id)
SELECT v.pool_code, v.slot_order, t.id
FROM (VALUES
  ('A', 1, 'Luminous Lions'),
  ('A', 2, 'Gully Boys'),
  ('A', 3, 'Smashers'),
  ('A', 4, 'Team Titan'),
  ('A', 5, 'Disaster'),
  ('A', 6, 'Hollywood'),
  ('A', 7, 'LHS'),
  ('A', 8, '408 Kings'),
  ('A', 9, 'Thunder CC'),
  ('A', 10, 'Bluestar B'),
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
  ('C', 10, 'Neyveli Titans'),
  ('D', 1, 'YDK'),
  ('D', 2, 'Sports Star'),
  ('D', 3, 'Fearless'),
  ('D', 4, 'SN Sports'),
  ('D', 5, 'Madmasters'),
  ('D', 6, 'Bashers'),
  ('D', 7, 'Scorpions'),
  ('D', 8, '11 Star'),
  ('D', 9, 'Dream Chasers'),
  ('D', 10, 'Black Booster')
) AS v(pool_code, slot_order, team_name)
JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
ON CONFLICT (pool_code, slot_order) DO UPDATE SET team_id = EXCLUDED.team_id;

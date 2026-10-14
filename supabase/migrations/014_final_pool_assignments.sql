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
  ('A', 8, 'Hi-Flyers'),
  ('A', 9, 'Blasters'),
  ('A', 10, 'Captains XI CC'),
  ('B', 1, 'Falcons'),
  ('B', 2, 'Pheonix'),
  ('B', 3, 'Sharkzz'),
  ('B', 4, 'Spartanz'),
  ('B', 5, 'Independence'),
  ('B', 6, 'Bad Jokers'),
  ('B', 7, '90s Kids'),
  ('B', 8, 'INS'),
  ('B', 9, 'Game Changer'),
  ('B', 10, 'SR Independence'),
  ('C', 1, 'Luminous Lions'),
  ('C', 2, 'Gully Boys'),
  ('C', 3, 'Team Titan'),
  ('C', 4, 'Smashers'),
  ('C', 5, 'LHS'),
  ('C', 6, 'Hollywood'),
  ('C', 7, 'Disaster'),
  ('C', 8, '408 Kings'),
  ('C', 9, 'Thunder CC'),
  ('C', 10, 'Bluestar B'),
  ('D', 1, 'YDK'),
  ('D', 2, 'Sports Star'),
  ('D', 3, 'Fearless'),
  ('D', 4, 'SN Sports'),
  ('D', 5, 'Madmasters'),
  ('D', 6, 'Bashers'),
  ('D', 7, 'Dream Chasers'),
  ('D', 8, 'Scorpions'),
  ('D', 9, '11 Star'),
  ('D', 10, 'Black Booster')
) AS v(pool_code, slot_order, team_name)
JOIN teams t ON t.normalized_name = normalize_team_name(v.team_name)
ON CONFLICT (pool_code, slot_order) DO UPDATE SET team_id = EXCLUDED.team_id;

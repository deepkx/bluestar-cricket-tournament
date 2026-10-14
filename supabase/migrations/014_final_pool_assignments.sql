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
  ('B', 1, 'College Birds'),
  ('B', 2, 'VCC'),
  ('B', 3, 'Honey Badgers'),
  ('B', 4, 'Bluestar'),
  ('B', 5, 'SSK'),
  ('B', 6, 'Sunday Boys'),
  ('B', 7, 'Captains XI CC'),
  ('B', 8, 'Hi-Flyers'),
  ('B', 9, 'Blasters'),
  ('B', 10, 'Neyveli Titans'),
  ('C', 1, 'Sharkzz'),
  ('C', 2, 'Pheonix'),
  ('C', 3, 'Falcons'),
  ('C', 4, 'Spartanz'),
  ('C', 5, 'Independence'),
  ('C', 6, 'Bad Jokers'),
  ('C', 7, '90s Kids'),
  ('C', 8, 'INS'),
  ('C', 9, 'Game Changer'),
  ('C', 10, 'SR Independence'),
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

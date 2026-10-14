-- Correct 10-team pool knockout paths:
-- R2-M1 = seed 10 vs Winner R1-M4 · R2-M2 = seed 1 vs Winner R1-M1
-- R3-M1 = Winner R1-M2 vs Winner R2-M2 · R3-M2 = Winner R1-M3 vs Winner R2-M1

UPDATE tournament_fixtures f
SET label = 'R2 · M1 · vs Winner R1-M4',
    team_a_id = t10.id,
    team_b_id = NULL
FROM teams t10
WHERE f.label LIKE 'R2 · M1%'
  AND t10.normalized_name = normalize_team_name(
    CASE f.pool_code
      WHEN 'A' THEN 'Bluestar B'
      WHEN 'B' THEN 'Neyveli Titans'
      WHEN 'C' THEN 'SR Independence'
      WHEN 'D' THEN 'Black Booster'
      ELSE ''
    END
  );

UPDATE tournament_fixtures f
SET label = 'R2 · M2 · vs Winner R1-M1',
    team_a_id = t1.id,
    team_b_id = NULL
FROM teams t1
WHERE f.label LIKE 'R2 · M2%'
  AND t1.normalized_name = normalize_team_name(
    CASE f.pool_code
      WHEN 'A' THEN 'Luminous Lions'
      WHEN 'B' THEN 'College Birds'
      WHEN 'C' THEN 'Sharkzz'
      WHEN 'D' THEN 'YDK'
      ELSE ''
    END
  );

UPDATE tournament_fixtures
SET label = 'R3 · M1 · Winner R1-M2 vs Winner R2-M2'
WHERE label LIKE 'R3 · M1%';

UPDATE tournament_fixtures
SET label = 'R3 · M2 · Winner R1-M3 vs Winner R2-M1'
WHERE label LIKE 'R3 · M2%';

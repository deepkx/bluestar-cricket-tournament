-- 10-team bye knockout:
-- R2-M1 = seed 1 vs Winner R1-M1 (first R2 kickoff) · R2-M2 = seed 10 vs Winner R1-M4
-- R3-M1 = Winner R1-M2 vs Winner R2-M1 · R3-M2 = Winner R1-M3 vs Winner R2-M2

UPDATE tournament_fixtures
SET label = 'R2 · M1 · vs Winner R1-M1'
WHERE label LIKE 'R2 · M1%';

UPDATE tournament_fixtures
SET label = 'R2 · M2 · vs Winner R1-M4'
WHERE label LIKE 'R2 · M2%';

UPDATE tournament_fixtures
SET label = 'R3 · M1 · Winner R1-M2 vs Winner R2-M1'
WHERE label LIKE 'R3 · M1%';

UPDATE tournament_fixtures
SET label = 'R3 · M2 · Winner R1-M3 vs Winner R2-M2'
WHERE label LIKE 'R3 · M2%';

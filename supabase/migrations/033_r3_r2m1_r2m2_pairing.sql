-- R3-M1 = Winner R1-M2 vs Winner R2-M1 · R3-M2 = Winner R1-M3 vs Winner R2-M2
-- (If 032 already applied with the previous R2-M2/M1 swap on R3 labels.)

UPDATE tournament_fixtures
SET label = 'R3 · M1 · Winner R1-M2 vs Winner R2-M1',
    team_a_id = NULL,
    team_b_id = NULL,
    winner_team_id = NULL
WHERE label LIKE 'R3 · M1%';

UPDATE tournament_fixtures
SET label = 'R3 · M2 · Winner R1-M3 vs Winner R2-M2',
    team_a_id = NULL,
    team_b_id = NULL,
    winner_team_id = NULL
WHERE label LIKE 'R3 · M2%';

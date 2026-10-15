-- Pool knockout fixtures (Sat B/C, Sun A/D). Oct 18–19 2026 IST.

DELETE FROM tournament_fixtures;

-- Helper: insert one fixture row
CREATE OR REPLACE FUNCTION _seed_fixture(
  p_pool text,
  p_order int,
  p_label text,
  p_team_a text,
  p_team_b text,
  p_start timestamptz
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  aid uuid;
  bid uuid;
BEGIN
  IF p_team_a IS NOT NULL THEN
    SELECT id INTO aid FROM teams WHERE normalized_name = normalize_team_name(p_team_a);
  END IF;
  IF p_team_b IS NOT NULL AND p_team_b <> '' THEN
    SELECT id INTO bid FROM teams WHERE normalized_name = normalize_team_name(p_team_b);
  END IF;
  INSERT INTO tournament_fixtures (pool_code, match_order, label, team_a_id, team_b_id, scheduled_at, venue)
  VALUES (p_pool, p_order, p_label, aid, bid, p_start, 'Hollywood Ground');
END;
$$;

-- Pool A — Sunday 19 Oct 2026, from 8:00 AM IST (02:30 UTC)
SELECT _seed_fixture('A', 1, 'R1 · M1', 'Bluestar', 'SSK', '2026-10-19T02:30:00+00');
SELECT _seed_fixture('A', 2, 'R1 · M2', 'VCC', 'Honey Badgers', '2026-10-19T03:15:00+00');
SELECT _seed_fixture('A', 3, 'R1 · M3', 'Sunday Boys', 'Neyveli Titans', '2026-10-19T04:00:00+00');
SELECT _seed_fixture('A', 4, 'R1 · M4', 'Blasters', 'Captains XI CC', '2026-10-19T04:45:00+00');
SELECT _seed_fixture('A', 5, 'R2 · M1 · vs Winner R1-M1', 'College Birds', NULL, '2026-10-19T05:30:00+00');
SELECT _seed_fixture('A', 6, 'R2 · M2 · Winner R1-M3 vs Winner R1-M4', NULL, NULL, '2026-10-19T06:15:00+00');
SELECT _seed_fixture('A', 7, 'R3 · M1 · Winner R1-M2 vs Winner R2-M1', NULL, NULL, NULL);
SELECT _seed_fixture('A', 9, 'R4 · Final · Winner R3-M1 vs Winner R2-M2', NULL, NULL, NULL);

-- Pool B — Saturday 18 Oct 2026, from 8:00 AM IST
SELECT _seed_fixture('B', 11, 'R1 · M1', 'Pheonix', 'Sharkzz', '2026-10-18T02:30:00+00');
SELECT _seed_fixture('B', 12, 'R1 · M2', 'Spartanz', 'Independence', '2026-10-18T03:15:00+00');
SELECT _seed_fixture('B', 13, 'R1 · M3', 'Bad Jokers', '90s Kids', '2026-10-18T04:00:00+00');
SELECT _seed_fixture('B', 14, 'R1 · M4', 'INS', 'Game Changer', '2026-10-18T04:45:00+00');
SELECT _seed_fixture('B', 15, 'R2 · M1 · vs Winner R1-M1', 'Falcons', NULL, '2026-10-18T05:30:00+00');
SELECT _seed_fixture('B', 16, 'R2 · M2 · Winner R1-M3 vs Winner R1-M4', NULL, NULL, '2026-10-18T06:15:00+00');
SELECT _seed_fixture('B', 17, 'R3 · M1 · Winner R1-M2 vs Winner R2-M1', NULL, NULL, NULL);
SELECT _seed_fixture('B', 19, 'R4 · Final · Winner R3-M1 vs Winner R2-M2', NULL, NULL, NULL);

-- Pool C — Saturday 18 Oct 2026, from 12:30 PM IST (07:00 UTC)
SELECT _seed_fixture('C', 21, 'R1 · M1', 'Hollywood', 'Disaster', '2026-10-18T07:00:00+00');
SELECT _seed_fixture('C', 22, 'R1 · M2', 'Bashers', '408 Kings', '2026-10-18T07:45:00+00');
SELECT _seed_fixture('C', 23, 'R1 · M3', 'Gully Boys', 'Team Titan', '2026-10-18T08:30:00+00');
SELECT _seed_fixture('C', 24, 'R1 · M4', 'Smashers', 'Bluestar B', '2026-10-18T09:15:00+00');
SELECT _seed_fixture('C', 25, 'R2 · M1 · vs Winner R1-M1', 'Thunder CC', NULL, '2026-10-18T10:00:00+00');
SELECT _seed_fixture('C', 26, 'R2 · M2 · Winner R1-M3 vs Winner R1-M4', NULL, NULL, '2026-10-18T10:45:00+00');
SELECT _seed_fixture('C', 27, 'R3 · M1 · Winner R1-M2 vs Winner R2-M1', NULL, NULL, NULL);
SELECT _seed_fixture('C', 29, 'R4 · Final · Winner R3-M1 vs Winner R2-M2', NULL, NULL, NULL);

-- Pool D — Sunday 19 Oct 2026, from 12:30 PM IST
SELECT _seed_fixture('D', 31, 'R1 · M1', 'Sports Star', 'Fearless', '2026-10-19T07:00:00+00');
SELECT _seed_fixture('D', 32, 'R1 · M2', 'SN Sports', 'Madmasters', '2026-10-19T07:45:00+00');
SELECT _seed_fixture('D', 33, 'R1 · M3', 'LHS', 'Dream Chasers', '2026-10-19T08:30:00+00');
SELECT _seed_fixture('D', 34, 'R1 · M4', 'Scorpions', '11 Star', '2026-10-19T09:15:00+00');
SELECT _seed_fixture('D', 35, 'R2 · M1 · vs Winner R1-M1', 'YDK', NULL, '2026-10-19T10:00:00+00');
SELECT _seed_fixture('D', 36, 'R2 · M2 · vs Winner R1-M4', 'Black Booster', NULL, '2026-10-19T10:45:00+00');
SELECT _seed_fixture('D', 37, 'R3 · M1 · Winner R1-M2 vs Winner R2-M1', NULL, NULL, NULL);
SELECT _seed_fixture('D', 38, 'R3 · M2 · Winner R1-M3 vs Winner R2-M2', NULL, NULL, NULL);
SELECT _seed_fixture('D', 39, 'R4 · Final · Winner R3-M1 vs Winner R3-M2', NULL, NULL, NULL);

DROP FUNCTION _seed_fixture(text, int, text, text, text, timestamptz);

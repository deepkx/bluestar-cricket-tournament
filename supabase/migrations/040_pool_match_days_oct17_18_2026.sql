-- Oct 2026: Sat = 17th, Sun = 18th (not 18/19). Same IST kickoffs, corrected UTC dates.

UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T02:30:00+00:00' WHERE pool_code = 'B' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T03:15:00+00:00' WHERE pool_code = 'B' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T04:00:00+00:00' WHERE pool_code = 'B' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T04:45:00+00:00' WHERE pool_code = 'B' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T05:30:00+00:00' WHERE pool_code = 'B' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T06:15:00+00:00' WHERE pool_code = 'B' AND label LIKE 'R2 · M2%';

UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T07:00:00+00:00' WHERE pool_code = 'C' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T07:45:00+00:00' WHERE pool_code = 'C' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T08:30:00+00:00' WHERE pool_code = 'C' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T09:15:00+00:00' WHERE pool_code = 'C' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T10:00:00+00:00' WHERE pool_code = 'C' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-17T10:45:00+00:00' WHERE pool_code = 'C' AND label LIKE 'R2 · M2%';

UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T02:30:00+00:00' WHERE pool_code = 'A' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T03:15:00+00:00' WHERE pool_code = 'A' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T04:00:00+00:00' WHERE pool_code = 'A' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T04:45:00+00:00' WHERE pool_code = 'A' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T05:30:00+00:00' WHERE pool_code = 'A' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T06:15:00+00:00' WHERE pool_code = 'A' AND label LIKE 'R2 · M2%';

UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T07:00:00+00:00' WHERE pool_code = 'D' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T07:45:00+00:00' WHERE pool_code = 'D' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T08:30:00+00:00' WHERE pool_code = 'D' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T09:15:00+00:00' WHERE pool_code = 'D' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T10:00:00+00:00' WHERE pool_code = 'D' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T10:45:00+00:00' WHERE pool_code = 'D' AND label LIKE 'R2 · M2%';

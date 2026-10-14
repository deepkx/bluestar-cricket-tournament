-- Absolute R1/R2 kickoffs (IST): Sat 18 Oct — B (8AM), C (12:30PM); Sun 19 Oct — A (8AM), D (12:30PM).
-- Safe to re-run; does not depend on prior scheduled_at.

UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T02:30:00+00' WHERE pool_code = 'B' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T03:15:00+00' WHERE pool_code = 'B' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T04:00:00+00' WHERE pool_code = 'B' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T04:45:00+00' WHERE pool_code = 'B' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T05:30:00+00' WHERE pool_code = 'B' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T06:15:00+00' WHERE pool_code = 'B' AND label LIKE 'R2 · M2%';

UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T07:00:00+00' WHERE pool_code = 'C' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T07:45:00+00' WHERE pool_code = 'C' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T08:30:00+00' WHERE pool_code = 'C' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T09:15:00+00' WHERE pool_code = 'C' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T10:00:00+00' WHERE pool_code = 'C' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-18T10:45:00+00' WHERE pool_code = 'C' AND label LIKE 'R2 · M2%';

UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T02:30:00+00' WHERE pool_code = 'A' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T03:15:00+00' WHERE pool_code = 'A' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T04:00:00+00' WHERE pool_code = 'A' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T04:45:00+00' WHERE pool_code = 'A' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T05:30:00+00' WHERE pool_code = 'A' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T06:15:00+00' WHERE pool_code = 'A' AND label LIKE 'R2 · M2%';

UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T07:00:00+00' WHERE pool_code = 'D' AND label LIKE 'R1 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T07:45:00+00' WHERE pool_code = 'D' AND label LIKE 'R1 · M2%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T08:30:00+00' WHERE pool_code = 'D' AND label LIKE 'R1 · M3%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T09:15:00+00' WHERE pool_code = 'D' AND label LIKE 'R1 · M4%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T10:00:00+00' WHERE pool_code = 'D' AND label LIKE 'R2 · M1%';
UPDATE tournament_fixtures SET scheduled_at = '2026-10-19T10:45:00+00' WHERE pool_code = 'D' AND label LIKE 'R2 · M2%';

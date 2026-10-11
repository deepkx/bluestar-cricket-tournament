UPDATE tournaments
SET fixture_announcement_at = '2026-10-15 18:00:00'
WHERE id = 1 AND fixture_announcement_at IS NULL;

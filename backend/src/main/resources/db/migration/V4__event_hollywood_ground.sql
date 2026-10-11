UPDATE tournaments
SET
    description = '360° cricket · 8 overs per side · 17–20 October at Hollywood Ground.',
    format = '360_8OV',
    venue = 'Hollywood Ground',
    tournament_starts_at = '2026-10-17 09:00:00'
WHERE id = 1;

UPDATE site_settings
SET contact_address = 'https://maps.app.goo.gl/dPpe8E9wVqKLrPeu5'
WHERE id = 1;

INSERT INTO tournaments (
    name, description, format, entry_fee_paise, max_teams, min_squad_size, max_squad_size,
    registration_opens_at, registration_closes_at, registration_open_override, registration_closed_override,
    fixture_announcement_at, fixtures_published, timezone, venue, rules
) VALUES (
    'BLUESTAR 2ND YEAR CRICKET TOURNAMENT',
    '360° cricket · 8 overs per side · 17–20 October at Hollywood Ground.',
    '360_8OV',
    25000,
    32,
    11,
    15,
    '2026-09-01 00:00:00',
    '2026-10-07 23:59:59',
    FALSE,
    FALSE,
    NULL,
    FALSE,
    'Asia/Kolkata',
    'Hollywood Ground',
    'Teams must field a minimum of 11 players. Entry fee is non-refundable except as determined by the organizers.'
);

INSERT INTO site_settings (contact_email, contact_phone, contact_address) VALUES (NULL, NULL, 'https://maps.app.goo.gl/dPpe8E9wVqKLrPeu5');

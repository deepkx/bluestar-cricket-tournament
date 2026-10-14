-- Captain verification digits: Hi-Flyers +91 99449 19987 → last4 9987; Luminous Lions placeholder 1234.

UPDATE teams
SET captain_phone_digits = '9944919987'
WHERE normalized_name = normalize_team_name('Hi-Flyers');

UPDATE teams
SET captain_phone_digits = '1234'
WHERE normalized_name = normalize_team_name('Luminous Lions');

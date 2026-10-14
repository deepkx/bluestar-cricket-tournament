-- Rename FCC → Hi-Flyers, Empty Boys → Luminous Lions (pool slots stay on same team_id).

UPDATE teams
SET team_name = 'Hi-Flyers', normalized_name = normalize_team_name('Hi-Flyers')
WHERE normalized_name = normalize_team_name('FCC') OR team_name ILIKE 'FCC';

UPDATE teams
SET team_name = 'Luminous Lions', normalized_name = normalize_team_name('Luminous Lions')
WHERE normalized_name = normalize_team_name('Empty Boys') OR team_name ILIKE 'Empty Boys';

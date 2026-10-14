-- Raise maximum squad size to 18 players per team.

UPDATE site_config SET max_squad_size = 18 WHERE id = 1;

ALTER TABLE site_config ALTER COLUMN max_squad_size SET DEFAULT 18;

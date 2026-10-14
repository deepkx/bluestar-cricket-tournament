-- Keep maximum squad size at 15 (superseded if 012 was needed after a brief 18 cap test).

UPDATE site_config SET max_squad_size = 15 WHERE id = 1;

ALTER TABLE site_config ALTER COLUMN max_squad_size SET DEFAULT 15;

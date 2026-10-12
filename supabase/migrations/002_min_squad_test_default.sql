-- Enable 2-player registration for testing (captain + 1). Set to 11 in admin before go-live.
UPDATE site_config SET min_squad_size = 2 WHERE id = 1;

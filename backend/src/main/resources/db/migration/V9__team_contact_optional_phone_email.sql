ALTER TABLE team_contacts MODIFY phone VARCHAR(20) NULL;
ALTER TABLE team_contacts MODIFY email VARCHAR(255) NULL;

UPDATE tournaments SET entry_fee_paise = 25000 WHERE entry_fee_paise <> 25000;

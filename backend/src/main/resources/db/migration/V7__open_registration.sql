UPDATE tournaments
SET
    registration_open_override = TRUE,
    registration_closed_override = FALSE,
    registration_closes_at = '2026-10-31 23:59:59'
WHERE id = 1;

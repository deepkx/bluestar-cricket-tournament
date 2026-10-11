-- Registration is submit-only (no payment): treat legacy pending rows as confirmed on the team board.
UPDATE registrations
SET status = 'CONFIRMED',
    confirmed_at = COALESCE(confirmed_at, created_at)
WHERE status IN ('PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PAYMENT_FAILED');

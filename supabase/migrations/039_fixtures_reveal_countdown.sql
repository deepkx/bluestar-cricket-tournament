-- After countdown time passes, expose fixtures even if phase is still `countdown` (until auto-advance runs).

CREATE OR REPLACE FUNCTION public.fixtures_public_revealed()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM site_config
    WHERE id = 1
      AND (
        fixtures_board_phase IN ('animating', 'visible')
        OR (
          fixtures_board_phase = 'countdown'
          AND fixtures_reveal_at IS NOT NULL
          AND fixtures_reveal_at <= now()
        )
        OR (
          fixtures_reveal_at IS NOT NULL
          AND fixtures_reveal_at <= now()
        )
        OR (
          fixtures_reveal_at IS NULL
          AND fixture_announcement_at IS NOT NULL
          AND fixture_announcement_at <= now()
        )
      )
  );
$$;

NOTIFY pgrst, 'reload schema';

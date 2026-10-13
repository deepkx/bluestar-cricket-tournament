-- Independent countdown targets for pool draw vs fixtures publish.

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS pools_reveal_at timestamptz,
  ADD COLUMN IF NOT EXISTS fixtures_reveal_at timestamptz;

UPDATE site_config
SET
  pools_reveal_at = COALESCE(pools_reveal_at, fixture_announcement_at),
  fixtures_reveal_at = COALESCE(fixtures_reveal_at, fixture_announcement_at)
WHERE id = 1;

CREATE OR REPLACE FUNCTION public.pools_public_revealed()
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
        pools_board_phase IN ('animating', 'visible')
        OR (
          pools_reveal_at IS NOT NULL
          AND pools_reveal_at <= now()
        )
        OR (
          pools_reveal_at IS NULL
          AND fixture_announcement_at IS NOT NULL
          AND fixture_announcement_at <= now()
        )
      )
  );
$$;

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

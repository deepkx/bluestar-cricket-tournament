-- Admin-driven publish phases for teams board, pool draw, and fixtures.

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS teams_board_phase text NOT NULL DEFAULT 'visible',
  ADD COLUMN IF NOT EXISTS pools_board_phase text NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS fixtures_board_phase text NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS pools_draw_run integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fixtures_draw_run integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS teams_board_run integer NOT NULL DEFAULT 0;

ALTER TABLE site_config DROP CONSTRAINT IF EXISTS site_config_teams_board_phase_check;
ALTER TABLE site_config
  ADD CONSTRAINT site_config_teams_board_phase_check
  CHECK (teams_board_phase IN ('idle', 'animating', 'visible'));

ALTER TABLE site_config DROP CONSTRAINT IF EXISTS site_config_pools_board_phase_check;
ALTER TABLE site_config
  ADD CONSTRAINT site_config_pools_board_phase_check
  CHECK (pools_board_phase IN ('idle', 'countdown', 'animating', 'visible'));

ALTER TABLE site_config DROP CONSTRAINT IF EXISTS site_config_fixtures_board_phase_check;
ALTER TABLE site_config
  ADD CONSTRAINT site_config_fixtures_board_phase_check
  CHECK (fixtures_board_phase IN ('idle', 'countdown', 'animating', 'visible'));

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
          fixture_announcement_at IS NOT NULL
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
          fixture_announcement_at IS NOT NULL
          AND fixture_announcement_at <= now()
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.pools_fixtures_revealed()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.pools_public_revealed() OR public.fixtures_public_revealed();
$$;

GRANT EXECUTE ON FUNCTION public.pools_public_revealed() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fixtures_public_revealed() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_pools()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.pools_public_revealed() THEN
    RETURN '[]'::json;
  END IF;
  RETURN COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'poolCode', p.pool_code,
          'slots', (
            SELECT COALESCE(
              json_agg(
                json_build_object(
                  'slotOrder', ps.slot_order,
                  'teamId', ps.team_id,
                  'teamName', t.team_name
                )
                ORDER BY ps.slot_order
              ),
              '[]'::json
            )
            FROM tournament_pool_slots ps
            LEFT JOIN teams t ON t.id = ps.team_id
            WHERE ps.pool_code = p.pool_code
          )
        )
        ORDER BY p.pool_code
      )
      FROM (VALUES ('A'), ('B'), ('C'), ('D')) AS p(pool_code)
    ),
    '[]'::json
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_fixtures()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.fixtures_public_revealed() THEN
    RETURN '[]'::json;
  END IF;
  RETURN COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', f.id,
          'poolCode', f.pool_code,
          'matchOrder', f.match_order,
          'label', f.label,
          'teamAName', ta.team_name,
          'teamBName', tb.team_name,
          'scheduledAt', f.scheduled_at,
          'venue', f.venue
        )
        ORDER BY f.match_order, f.pool_code, f.created_at
      )
      FROM tournament_fixtures f
      LEFT JOIN teams ta ON ta.id = f.team_a_id
      LEFT JOIN teams tb ON tb.id = f.team_b_id
    ),
    '[]'::json
  );
END;
$$;

-- Refresh PostgREST schema cache so the API sees new columns immediately.
NOTIFY pgrst, 'reload schema';

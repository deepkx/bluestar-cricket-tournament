-- When pools/fixtures countdown reaches zero, move board phase to animating (once) and bump draw run.

CREATE OR REPLACE FUNCTION public.advance_publish_countdowns()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pools_moved boolean := false;
  fixtures_moved boolean := false;
BEGIN
  UPDATE site_config
  SET
    pools_board_phase = 'animating',
    pools_draw_run = COALESCE(pools_draw_run, 0) + 1
  WHERE id = 1
    AND pools_board_phase = 'countdown'
    AND pools_reveal_at IS NOT NULL
    AND pools_reveal_at <= now();

  pools_moved := FOUND;

  UPDATE site_config
  SET
    fixtures_board_phase = 'animating',
    fixtures_draw_run = COALESCE(fixtures_draw_run, 0) + 1
  WHERE id = 1
    AND fixtures_board_phase = 'countdown'
    AND fixtures_reveal_at IS NOT NULL
    AND fixtures_reveal_at <= now();

  fixtures_moved := FOUND;

  RETURN jsonb_build_object(
    'pools_advanced', pools_moved,
    'fixtures_advanced', fixtures_moved
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.advance_publish_countdowns() TO anon, authenticated;

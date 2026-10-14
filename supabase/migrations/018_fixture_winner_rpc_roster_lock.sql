-- Reliable fixture winner updates + admin toggle for captain squad uploads.

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS captain_roster_open BOOLEAN NOT NULL DEFAULT TRUE;

CREATE OR REPLACE FUNCTION public.set_fixture_winner(
  p_fixture_id UUID,
  p_winner_team_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_winner_team_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM tournament_fixtures f
      WHERE f.id = p_fixture_id
        AND (f.team_a_id = p_winner_team_id OR f.team_b_id = p_winner_team_id)
    ) THEN
      RAISE EXCEPTION 'Winner must be team A or team B for this fixture';
    END IF;
  END IF;

  UPDATE tournament_fixtures
  SET winner_team_id = p_winner_team_id
  WHERE id = p_fixture_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fixture not found';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_fixture_winner(UUID, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';

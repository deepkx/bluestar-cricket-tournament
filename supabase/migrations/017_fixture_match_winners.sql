-- Record knockout match winners; public API exposes winner for bracket advancement.

ALTER TABLE tournament_fixtures
  ADD COLUMN IF NOT EXISTS winner_team_id UUID REFERENCES teams (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tournament_fixtures_winner ON tournament_fixtures (winner_team_id)
  WHERE winner_team_id IS NOT NULL;

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
          'teamAId', f.team_a_id,
          'teamBId', f.team_b_id,
          'teamAName', ta.team_name,
          'teamBName', tb.team_name,
          'winnerTeamId', f.winner_team_id,
          'winnerTeamName', tw.team_name,
          'scheduledAt', f.scheduled_at,
          'venue', f.venue
        )
        ORDER BY f.match_order, f.pool_code, f.created_at
      )
      FROM tournament_fixtures f
      LEFT JOIN teams ta ON ta.id = f.team_a_id
      LEFT JOIN teams tb ON tb.id = f.team_b_id
      LEFT JOIN teams tw ON tw.id = f.winner_team_id
    ),
    '[]'::json
  );
END;
$$;

NOTIFY pgrst, 'reload schema';

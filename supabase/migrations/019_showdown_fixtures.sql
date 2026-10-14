-- Cross-pool knockout after pool winners: A vs C, B vs D, then final.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM tournament_fixtures WHERE pool_code IS NULL LIMIT 1) THEN
    RETURN;
  END IF;
  INSERT INTO tournament_fixtures (pool_code, match_order, label, team_a_id, team_b_id, scheduled_at, venue)
  VALUES
    (NULL, 101, 'Semi 1 · Winner Pool A vs Winner Pool C', NULL, NULL, NULL, NULL),
    (NULL, 102, 'Semi 2 · Winner Pool B vs Winner Pool D', NULL, NULL, NULL, NULL),
    (NULL, 103, 'Final · Winner Semi 1 vs Winner Semi 2', NULL, NULL, NULL, NULL);
END $$;

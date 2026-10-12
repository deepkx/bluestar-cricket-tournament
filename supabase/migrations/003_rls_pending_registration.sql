-- Public register flow: anon must SELECT/UPDATE/DELETE pending rows (insert … returning, logo/photos, rollback).

CREATE POLICY teams_select_pending ON teams
  FOR SELECT TO anon
  USING (status = 'pending');

CREATE POLICY teams_update_pending ON teams
  FOR UPDATE TO anon
  USING (status = 'pending')
  WITH CHECK (status = 'pending');

CREATE POLICY teams_delete_pending ON teams
  FOR DELETE TO anon
  USING (status = 'pending');

CREATE POLICY players_select_pending ON players
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = players.team_id AND t.status = 'pending'
    )
  );

CREATE POLICY players_update_pending ON players
  FOR UPDATE TO anon
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = players.team_id AND t.status = 'pending'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = players.team_id AND t.status = 'pending'
    )
  );

CREATE POLICY players_delete_pending ON players
  FOR DELETE TO anon
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = players.team_id AND t.status = 'pending'
    )
  );

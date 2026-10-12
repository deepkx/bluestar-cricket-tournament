-- Bluestar Cricket Tournament — Supabase schema (run in SQL editor or via CLI)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION normalize_team_name(raw TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(trim(regexp_replace(raw, '\s+', ' ', 'g')));
$$;

-- ---------------------------------------------------------------------------
-- site_config (single row)
-- ---------------------------------------------------------------------------
CREATE TABLE site_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  max_teams INT NOT NULL DEFAULT 32,
  min_squad_size INT NOT NULL DEFAULT 11,
  max_squad_size INT NOT NULL DEFAULT 15,
  registration_open BOOLEAN NOT NULL DEFAULT TRUE,
  tournament_starts_at TIMESTAMPTZ,
  fixture_announcement_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_config (id, max_teams, min_squad_size, max_squad_size, registration_open)
VALUES (1, 32, 2, 15, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------------
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_reference TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  team_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  city TEXT,
  captain_name TEXT NOT NULL,
  logo_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teams_status ON teams (status);
CREATE INDEX idx_teams_confirmed_at ON teams (confirmed_at);

CREATE OR REPLACE FUNCTION teams_set_normalized_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_name := normalize_team_name(NEW.team_name);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_teams_normalized
  BEFORE INSERT OR UPDATE OF team_name ON teams
  FOR EACH ROW
  EXECUTE FUNCTION teams_set_normalized_name();

-- ---------------------------------------------------------------------------
-- players
-- ---------------------------------------------------------------------------
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  jersey_number INT,
  playing_role TEXT,
  is_captain BOOLEAN NOT NULL DEFAULT FALSE,
  photo_path TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_players_team_id ON players (team_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- site_config
CREATE POLICY site_config_select_anon ON site_config
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY site_config_update_admin ON site_config
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- teams: public read confirmed only
CREATE POLICY teams_select_confirmed ON teams
  FOR SELECT TO anon
  USING (status = 'confirmed');

CREATE POLICY teams_select_admin ON teams
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY teams_insert_public ON teams
  FOR INSERT TO anon
  WITH CHECK (status = 'pending');

CREATE POLICY teams_insert_admin ON teams
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY teams_update_admin ON teams
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY teams_delete_admin ON teams
  FOR DELETE TO authenticated
  USING (true);

-- players: public read when team confirmed
CREATE POLICY players_select_confirmed ON players
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = players.team_id AND t.status = 'confirmed'
    )
  );

CREATE POLICY players_select_admin ON players
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY players_insert_public ON players
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = players.team_id AND t.status = 'pending'
    )
  );

CREATE POLICY players_insert_admin ON players
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY players_update_admin ON players
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY players_delete_admin ON players
  FOR DELETE TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Storage bucket team-media (create bucket in dashboard if this fails)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-media', 'team-media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY team_media_public_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'team-media');

CREATE POLICY team_media_insert ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'team-media');

CREATE POLICY team_media_update ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'team-media')
  WITH CHECK (bucket_id = 'team-media');

CREATE POLICY team_media_delete_admin ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'team-media');

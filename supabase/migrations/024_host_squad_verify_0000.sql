-- Bluestar + Bluestar B: captain squad verify last4 = 0000 (run if 023 already applied with other placeholders).

UPDATE teams
SET captain_phone_digits = '9000000000'
WHERE normalized_name IN (
  normalize_team_name('Bluestar'),
  normalize_team_name('Bluestar B')
);

CREATE OR REPLACE FUNCTION public.ensure_fixed_host_team(p_team_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_norm TEXT;
  v_id UUID;
  v_sort INT;
  v_digits TEXT := '9000000000';
BEGIN
  v_name := trim(p_team_name);
  IF v_name = '' THEN
    RETURN NULL;
  END IF;
  v_norm := normalize_team_name(v_name);

  IF v_norm = normalize_team_name('Bluestar') THEN
    v_sort := 1;
  ELSIF v_norm = normalize_team_name('Bluestar B') THEN
    v_sort := 2;
  ELSE
    RETURN NULL;
  END IF;

  SELECT id INTO v_id FROM teams WHERE normalized_name = v_norm;

  IF v_id IS NOT NULL THEN
    UPDATE teams
    SET
      status = 'confirmed',
      confirmed_at = COALESCE(confirmed_at, now()),
      sort_order = COALESCE(sort_order, v_sort),
      captain_name = COALESCE(NULLIF(trim(captain_name), ''), 'Host'),
      captain_phone_digits = COALESCE(captain_phone_digits, v_digits)
    WHERE id = v_id;
    RETURN v_id;
  END IF;

  INSERT INTO teams (team_name, captain_name, sort_order, status, confirmed_at, captain_phone_digits)
  VALUES (v_name, 'Host', v_sort, 'confirmed', now(), v_digits)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_fixed_host_team(TEXT) TO anon, authenticated;

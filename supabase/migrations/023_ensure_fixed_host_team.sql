-- Fixed host teams (Bluestar, Bluestar B): ensure DB row + captain verify digits for squad upload.

-- Squad verify: last 4 digits 0000 for both host teams (full placeholder stored for grant_captain_upload).
UPDATE teams
SET captain_phone_digits = '9000000000'
WHERE normalized_name = normalize_team_name('Bluestar')
  AND captain_phone_digits IS NULL;

UPDATE teams
SET captain_phone_digits = '9000000000'
WHERE normalized_name = normalize_team_name('Bluestar B')
  AND captain_phone_digits IS NULL;

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
  v_digits TEXT;
BEGIN
  v_name := trim(p_team_name);
  IF v_name = '' THEN
    RETURN NULL;
  END IF;
  v_norm := normalize_team_name(v_name);

  IF v_norm = normalize_team_name('Bluestar') THEN
    v_sort := 1;
    v_digits := '9000000000';
  ELSIF v_norm = normalize_team_name('Bluestar B') THEN
    v_sort := 2;
    v_digits := '9000000000';
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

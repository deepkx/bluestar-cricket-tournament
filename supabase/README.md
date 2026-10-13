# Supabase setup (production)

**No tables in Table Editor?** Follow [`SETUP.md`](SETUP.md) step by step.

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL:** Dashboard → SQL → run the **full** [`migrations/001_initial.sql`](migrations/001_initial.sql) once (includes registration RLS). Only run [`003_rls_pending_registration.sql`](migrations/003_rls_pending_registration.sql) if you installed an older `001` without pending policies.
3. **Storage:** If the migration did not create the bucket, Storage → New bucket → name `team-media`, **Public** enabled.
4. **Auth:** Authentication → Users → **Add user** → email must match `VITE_ADMIN_EMAIL` (default `admin@bluestar.local`), password e.g. `0908`. Turn off “Confirm email” under Authentication → Providers → Email if login says unconfirmed.
5. **Captain roster (40 teams):** Run [`migrations/006_captain_roster.sql`](migrations/006_captain_roster.sql) once — seeds the 38 invited teams with captain phone digits, sets `max_teams = 40`, and enables last-4-digit captain uploads.
6. **2-player testing:** Run [`migrations/002_min_squad_test_default.sql`](migrations/002_min_squad_test_default.sql) only for local testing (not needed in production).
7. **Env (Vercel + local):** copy [`frontend/.env.example`](../frontend/.env.example) to `frontend/.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` — **anon public** JWT from Project Settings → API (if auth fails, do not use service_role; try anon instead of publishable)
   - `VITE_ADMIN_EMAIL` (same as the Auth user email)

Redeploy Vercel after setting env vars. No Java backend or `VITE_API_BASE_URL` required.

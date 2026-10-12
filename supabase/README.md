# Supabase setup (production)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL:** Dashboard → SQL → run [`migrations/001_initial.sql`](migrations/001_initial.sql), then [`003_rls_pending_registration.sql`](migrations/003_rls_pending_registration.sql) if register fails with RLS errors.
3. **Storage:** If the migration did not create the bucket, Storage → New bucket → name `team-media`, **Public** enabled.
4. **Auth:** Authentication → Users → **Add user** → email must match `VITE_ADMIN_EMAIL` (default `admin@bluestar.local`), password e.g. `0908`. Turn off “Confirm email” under Authentication → Providers → Email if login says unconfirmed.
5. **2-player testing:** Run [`migrations/002_min_squad_test_default.sql`](migrations/002_min_squad_test_default.sql) once if register still shows 11+ players.
6. **Env (Vercel + local):** copy [`frontend/.env.example`](../frontend/.env.example) to `frontend/.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` — **anon public** JWT from Project Settings → API (if auth fails, do not use service_role; try anon instead of publishable)
   - `VITE_ADMIN_EMAIL` (same as the Auth user email)

Redeploy Vercel after setting env vars. No Java backend or `VITE_API_BASE_URL` required.

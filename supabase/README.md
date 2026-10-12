# Supabase setup (production)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL:** Dashboard → SQL → New query → paste and run [`migrations/001_initial.sql`](migrations/001_initial.sql).
3. **Storage:** If the migration did not create the bucket, Storage → New bucket → name `team-media`, **Public** enabled.
4. **Auth:** Authentication → Users → Add user → email must match `VITE_ADMIN_EMAIL` (default `admin@bluestar.local`), password e.g. `0908`.
5. **Env (Vercel + local):** copy [`frontend/.env.example`](../frontend/.env.example) to `frontend/.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (Project Settings → API)
   - `VITE_ADMIN_EMAIL` (same as the Auth user email)

Redeploy Vercel after setting env vars. No Java backend or `VITE_API_BASE_URL` required.

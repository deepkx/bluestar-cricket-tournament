# Public deployment

## Recommended — Vercel (site) + Supabase (database & photos)

| Part | Host |
|------|------|
| React app | [Vercel](https://vercel.com) — root directory **`frontend`** |
| Teams, registrations, photos | [Supabase](https://supabase.com) free tier (Postgres + Storage + Auth) |

### 1. Supabase

Follow [`supabase/README.md`](supabase/README.md): run the SQL migration, create the `team-media` bucket if needed, add one **admin** Auth user.

### 2. Vercel

**Import:** https://vercel.com/new/import?s=https://github.com/deepkx/bluestar-cricket-tournament

Or run `./scripts/deploy-vercel-supabase.sh` (opens the import page).

1. Sign in with GitHub → select **bluestar-cricket-tournament**.
2. **Root Directory:** click Edit → set to **`frontend`** (required).
3. **Framework:** Vite (auto-detected).

**Production environment variables:**

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | Project URL (Supabase → Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | `anon` public key |
| `VITE_ADMIN_EMAIL` | Same email as the Supabase Auth admin user |

Do **not** set `VITE_API_BASE_URL` unless you are running the legacy Java API locally.

Deploy. Open the site → **Register** submits to Supabase as **pending** → **Admin** (password) → approve on **Team board** → team appears on `/teams`.

Admin can **edit/delete** confirmed teams, **download photos** (per team or all), toggle **registration open**, enable **2-player squads (testing)**, and export **CSV**.

Fixtures: edit [`frontend/src/content/fixtures.json`](frontend/src/content/fixtures.json) when the draw is ready (empty array until then).

---

## Optional — instant demo link (Cloudflare Tunnel + Docker)

For local demos with the **legacy** Spring + MySQL stack:

```bash
./scripts/host-docker.sh
./scripts/public-tunnel.sh
```

See README “Host fully (Docker)”. Not required for Vercel + Supabase production.

---

## Legacy — Render (Java API + MySQL)

The `backend/` folder and `render.yaml` remain for teams who want Spring Boot + MySQL. That path requires a paid Render plan for MySQL and is **not** used by the Supabase frontend.

If you use it: set `VITE_API_BASE_URL` on Vercel to your Render API URL and `CORS_ALLOWED_ORIGINS` on Render to your Vercel URL.

---

## GitHub CLI (one time)

```bash
gh auth login
```

Or `./scripts/gh.sh auth login` if `~/.config` is root-owned (see [`scripts/gh.sh`](scripts/gh.sh)).

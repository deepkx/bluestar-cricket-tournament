# Public deployment (everyone on the internet)

Three options, from fastest to most permanent.

## Option 1 — Instant public link (Cloudflare Tunnel)

Good for demos while you set up Vercel + Render. Requires Docker stack running locally.

```bash
./scripts/host-docker.sh          # if not already up
./scripts/public-tunnel.sh        # prints https://….trycloudflare.com
```

Share that HTTPS URL. Set `PUBLIC_ORIGIN` in `.env.docker` to that URL and restart Docker if admin/API calls fail CORS.

---

## Option 2 — Vercel (site) + Render (API + MySQL) — recommended

| Part | Host | URL |
|------|------|-----|
| React site | [Vercel](https://vercel.com) | `https://your-app.vercel.app` |
| Spring Boot + uploads | [Render](https://render.com) | `https://bluestar-api.onrender.com` |
| MySQL | Render private service | internal only |

### Step A — Push code to GitHub

Render and Vercel deploy from Git. Create a repo and push this project (no `.env` files).

### Step B — Render (backend)

1. [Dashboard → Blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance**.
2. Connect the GitHub repo; Render reads **`render.yaml`**.
3. When prompted, set sync env vars:
   - **`ADMIN_QUICK_PASSWORD`** — e.g. `0908` (site Admin menu).
   - **`CORS_ALLOWED_ORIGINS`** — your Vercel URL, e.g. `https://bluestar-cricket.vercel.app` (no trailing slash).
4. Wait for **bluestar-api** to go live. Open `https://<bluestar-api>/api/v1/tournaments/current` — should return JSON.

Note: Render free/starter web services **sleep** when idle; first request may take ~30s.

### Step C — Vercel (frontend)

1. [Import project](https://vercel.com/new) from the same GitHub repo.
2. **Root Directory:** `frontend`
3. **Environment variable (Production):**
   - `VITE_API_BASE_URL` = `https://<your-render-api-host>` (no trailing slash)
4. Deploy. Open the Vercel URL — teams, register, and admin should hit Render.

5. Update Render **`CORS_ALLOWED_ORIGINS`** to match the final Vercel URL (and custom domain if you add one). Redeploy API if needed.

### Custom domain (optional)

- Vercel: add domain in project settings.
- Render: add custom domain on **bluestar-api** (HTTPS).
- Set `VITE_API_BASE_URL` to `https://api.yourdomain.com` and `CORS_ALLOWED_ORIGINS` to `https://yourdomain.com`.

---

## Option 3 — Single VPS (Docker Compose)

Use **`./scripts/host-docker.sh`** on a cloud VM (DigitalOcean, Hetzner, etc.), open port 80/443, set `PUBLIC_ORIGIN` to your HTTPS site URL. See README “Host fully (Docker)”.

---

## Checklist after go-live

- [ ] Admin → quick password works
- [ ] Public **Teams** page loads from API
- [ ] Register with logo/photo; image URLs load (`VITE_API_BASE_URL` + `/uploads`)
- [ ] `REGISTRATION_TEST_MIN_SQUAD` is **false** on Render

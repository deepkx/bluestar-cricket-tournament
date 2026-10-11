# BLUESTAR 2nd Year Cricket Tournament

Production-oriented tournament website: React (Vite + TypeScript + Tailwind) frontend, Spring Boot backend, MySQL, Razorpay payments, and admin dashboard.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20+
- MySQL 8+

## Database

Create a database (optional — JDBC URL can auto-create):

```sql
CREATE DATABASE bluestar_tournament CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Flyway migrations run on startup (`backend/src/main/resources/db/migration/`).

If the backend fails to start with **Flyway validate** errors (checksum mismatch on `V2`, or schema stuck at version 2 while code expects V9), repair and migrate against your MySQL database (load `backend/.env` first):

```bash
cd backend
set -a && source .env && set +a
mvn org.flywaydb:flyway-maven-plugin:10.10.0:repair \
  -Dflyway.url="jdbc:mysql://localhost:3306/bluestar_tournament?useSSL=false&allowPublicKeyRetrieval=true" \
  -Dflyway.user="$DATABASE_USERNAME" -Dflyway.password="$DATABASE_PASSWORD"
mvn org.flywaydb:flyway-maven-plugin:10.10.0:migrate \
  -Dflyway.url="jdbc:mysql://localhost:3306/bluestar_tournament?useSSL=false&allowPublicKeyRetrieval=true" \
  -Dflyway.user="$DATABASE_USERNAME" -Dflyway.password="$DATABASE_PASSWORD"
```

Then restart the Spring Boot app.

## Environment variables

Copy examples and fill in secrets:

```bash
cp backend/.env.example backend/.env   # load with your shell or IDE
cp frontend/.env.example frontend/.env
```

### Backend (`backend/.env.example`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | JDBC URL (default: local MySQL `bluestar_tournament`) |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | MySQL credentials |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay API keys ([dashboard](https://dashboard.razorpay.com/)) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret |
| `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | First admin (created once if no admin exists) |
| `JWT_SECRET` | Admin token signing secret |
| `CORS_ALLOWED_ORIGINS` | e.g. `http://localhost:5173` |
| `REGISTRATION_TEST_MIN_SQUAD` | Set `true` locally to allow **2-player** squads on Register (API still stores tournament min as 11–15 in admin; validation only). Leave `false` in production. |

### Registration test squads (local dev)

To exercise the register flow without entering 11 players:

1. In `backend/.env`, set `REGISTRATION_TEST_MIN_SQUAD=true` and restart the backend.
2. Open **Register** — the squad dropdown includes **2 players** and a dev-mode banner appears.
3. Fill team name, logo, captain + one squad member (names and photos), accept rules, submit.

Production deployments should not set this flag; real teams remain 11–15 players.

### Razorpay setup

Registration uses **Razorpay Orders + Checkout**. The server creates an order for `entry_fee_paise` (default **₹250** = `25000` paise), the browser opens Checkout, then the app verifies the payment signature and marks the team **CONFIRMED**.

#### 1. Get test API keys

1. Sign in at [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Turn **Test mode** on (top toggle).
3. Go to **Account & Settings → API Keys** → **Generate Key** ([docs](https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/)).
4. Copy **Key ID** (`rzp_test_…`) and **Key secret** (shown once).

#### 2. Configure the backend

Edit `backend/.env`:

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
```

Leave `RAZORPAY_WEBHOOK_SECRET` empty for local dev unless you expose webhooks (step 4). Restart the backend after saving.

Verify keys:

```bash
chmod +x scripts/verify-razorpay.sh
./scripts/verify-razorpay.sh
```

#### 3. Test a payment

1. Open **Register**, submit a team (use `REGISTRATION_TEST_MIN_SQUAD=true` for a 2-player test).
2. After **Submit & pay**, Razorpay Checkout should open.
3. Pay with a [test card](https://razorpay.com/docs/payments/payments/test-card-details/) (e.g. Visa `4384 7968 2770 3274`, any future expiry, any CVV) and complete the mock bank page (**Success**).
4. You should land on the success page; the team appears on **Teams**.

#### 4. Webhooks (optional)

Checkout **verify-payment** is enough for local testing. For production (or if the user closes the tab before verify), configure a webhook:

- URL: `https://your-api-host/api/v1/payments/razorpay/webhook`
- Event: `payment.captured`
- Copy the webhook **secret** into `RAZORPAY_WEBHOOK_SECRET`

Local dev: tunnel with [ngrok](https://ngrok.com/) → `https://<subdomain>.ngrok.io/api/v1/payments/razorpay/webhook`.

#### 5. Go live (real money)

Before teams pay ₹250 for real:

1. Complete **KYC** on Razorpay and activate **Live mode**.
2. Generate **live** API keys (`rzp_live_…`) and set them in production env (never commit secrets).
3. Deploy the backend on **HTTPS** (Razorpay requires a secure site for live Checkout).
4. Create a **webhook** on your production API URL:
   - `POST https://your-domain/api/v1/payments/razorpay/webhook`
   - Event: `payment.captured`
   - Set `RAZORPAY_WEBHOOK_SECRET` from the dashboard (required so teams are confirmed if the browser closes after payment).
5. Turn off `REGISTRATION_TEST_MIN_SQUAD` in production.
6. On startup, the backend logs whether Razorpay is in test or live mode and warns if live keys lack a webhook secret.

Teams that close Checkout early can finish payment from **Status** (`/status?ref=BS-…`) using their tracking token.

## Host fully (Docker — recommended)

One command runs **MySQL**, the **API**, and the **website** (nginx serves the React app and proxies `/api` and `/uploads`).

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

```bash
chmod +x scripts/host-docker.sh
./scripts/host-docker.sh
```

First run copies `.env.docker.example` → `.env.docker`. Edit at least:

| Variable | Purpose |
|----------|---------|
| `MYSQL_ROOT_PASSWORD` | Database password |
| `JWT_SECRET` | Long random string (admin tokens) |
| `ADMIN_QUICK_PASSWORD` | Site header **Admin** password (e.g. `0908`) |
| `PUBLIC_ORIGIN` | Exact site URL for CORS, e.g. `http://localhost:8088` or `https://your-domain.com` |

Then run `./scripts/host-docker.sh` again. Open **`http://localhost:8088`** (or your `PUBLIC_ORIGIN`).

- Team logos and photos persist in Docker volume `upload_data`.
- Database persists in `mysql_data`.
- **Stop:** `docker compose --env-file .env.docker down`
- **Logs:** `docker compose --env-file .env.docker logs -f web api`

### Put it on the public internet

1. Deploy the same stack on a VPS (Ubuntu + Docker), open firewall **80/443**.
2. Point DNS **A record** to the server.
3. Set `PUBLIC_ORIGIN=https://your-domain.com` and `HTTP_PORT=80` in `.env.docker` (or put **Caddy/Traefik** in front for HTTPS on 443).
4. Keep `JWT_SECRET` and passwords strong; never commit `.env.docker`.

Split hosting (static CDN + separate API) is supported: build the frontend with `VITE_API_BASE_URL=https://api.your-domain.com` and set `CORS_ALLOWED_ORIGINS` on the API to your site origin.

### Public internet (Vercel + Render)

For a URL anyone can open worldwide, see **[DEPLOY.md](DEPLOY.md)** — Vercel for the React app, Render for API + MySQL, or a quick **Cloudflare Tunnel** while Docker runs locally:

```bash
chmod +x scripts/public-tunnel.sh
./scripts/public-tunnel.sh
```

## Run locally (development)

**Backend:**

```bash
cp backend/.env.example backend/.env   # once — quote DATABASE_URL if it contains &
chmod +x scripts/start-backend.sh scripts/start-frontend.sh
./scripts/start-backend.sh
```

Or manually: `cd backend`, `set -a && source .env && set +a && mvn spring-boot:run` (do not use bare `xargs` on `.env`; `&` in the JDBC URL breaks the shell).

API: `http://localhost:8080` · Swagger: `http://localhost:8080/swagger-ui`

**Frontend:**

```bash
cd frontend && npm install
./scripts/start-frontend.sh
```

Site: `http://localhost:5173` (proxies `/api` to the backend)

**Public pages:** Home, Rules (About), Teams (32-slot board), Pools, Fixtures (pool draw & schedule countdown default **Thu 15 Oct 2026, 6:00 PM IST** — override via Admin **Fixture announcement**), and Registration. Results, bracket, gallery, sponsors, and contact are not in the public nav.

**Homepage countdown:** Set **Tournament start** in Admin → Tournament settings (`tournament_starts_at`) to override the default first-ball time (17 Oct 2026, 9:00 AM IST from homepage copy). The hero and section timers tick every second until kickoff, then show **Underway**.

**Hero & section backdrops:** JPGs in [`frontend/public/`](frontend/public/) are desaturated and darkened in CSS (turf-noir). SVG fallbacks load if a JPG fails.

| File | Use | Bundled source (replace with your venue when ready) |
|------|-----|-----------------------------------------------------|
| `hero-stadium.jpg` | Hero base layer | [MCG at night](https://commons.wikimedia.org/wiki/File:MCG_at_night.jpg) (CC BY-SA 2.5) |
| `bg-cricketer-batter.jpg` | Hero bleed, venue section | [Cricket bat, Walker Cricket Ground](https://commons.wikimedia.org/wiki/File:Cricket_bat_at_Walker_Cricket_Ground,_Southgate,_London,_England_01.jpg) |
| `bg-cricketer-bowler.jpg` | At a glance, register band | [Lord's, bowler](https://commons.wikimedia.org/wiki/File:Lords-_Media_Centre_and_bowler_(geograph_5911225).jpg) (CC BY-SA 2.0) |
| `bg-cricketer-celebrate.jpg` | Tournament timer section | [ICT players](https://commons.wikimedia.org/wiki/File:ICT_Players_with_PMO_India.jpg) (CC BY-SA 4.0) |

To swap images: download replacements, keep the same filenames (or update [`frontend/src/content/cricketBackgrounds.ts`](frontend/src/content/cricketBackgrounds.ts)), and tune opacity/crop there. Fallbacks: [`hero-stadium.svg`](frontend/public/hero-stadium.svg), [`bg-cricketer-batter.svg`](frontend/public/bg-cricketer-batter.svg).

## Admin

1. Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD`, start backend once.
2. Open **Admin** in the site header (password from `ADMIN_QUICK_PASSWORD` in `.env`, or bootstrap email login on legacy `/admin/login` redirect).
3. Configure fixture announcement time, registration overrides, contact info under **Tournament settings**.

## Logo

Replace `frontend/public/bluestar-star.svg` with the official BLUESTAR asset when available.

## Tests

```bash
cd backend && mvn test
cd frontend && npm run build
```

## Default tournament state

- Registration **closed** after seed deadline `2026-10-07` (Asia/Kolkata) unless admin reopens or sets `registration_open_override`.
- Fixture announcement time is **null** until set in admin (homepage shows a placeholder, not a fake date).

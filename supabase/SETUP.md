# “No table is there” — fix in 5 minutes

There are **two different places** in Supabase. People often look in the wrong one.

| What you need | Where in Supabase | What you should see |
|---------------|-------------------|---------------------|
| **Teams, registrations, settings** | **Table Editor** (left menu) | Tables: `site_config`, `teams`, `players` |
| **Admin login** | **Authentication → Users** | A list of users (not in Table Editor) |

There is **no** `admin` table. Admin is an **Auth user**, not a database table.

---

## Step 1 — Create the database tables

1. Open your project: `oaxmvamgdfwtntanjwof`  
   https://supabase.com/dashboard/project/oaxmvamgdfwtntanjwof/sql/new

2. In Cursor/GitHub, open [`migrations/001_initial.sql`](migrations/001_initial.sql).

3. **Select all** (entire file) → **Copy** → paste into Supabase SQL editor → **Run**.

4. You should see **Success**. Then go to **Table Editor** — you must see:
   - `site_config` (1 row)
   - `teams` (empty at first)
   - `players` (empty at first)

If you get **“relation already exists”**, tables are already there — skip to Step 2.

5. Run the rest of the migrations in order if you have not already: `002` … `010` (pools/fixtures need **007**; live admin publish buttons need **009**; separate pool vs fixture countdowns need **010**).

6. **Storage** → if there is no bucket **`team-media`**, create it (**Public**).

---

## Step 2 — Create admin login (Authentication, not tables)

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: `admin@bluestar.local`
3. Password: at least **6 characters** (e.g. `admin0908`)
4. Turn on **Auto Confirm User**
5. Save

---

## Step 3 — Vercel env (same Supabase project)

- `VITE_SUPABASE_URL` = `https://oaxmvamgdfwtntanjwof.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = **anon** key (`eyJ…`) from **Project Settings → API**
- `VITE_ADMIN_EMAIL` = `admin@bluestar.local`

**Redeploy** Vercel, then try **Admin** on the site with that email and password.

---

## Still empty Table Editor?

- Confirm you’re in project **oaxmvamgdfwtntanjwof** (top-left project name).
- Schema dropdown in Table Editor should be **`public`**, not `auth`.
- Re-run Step 1 and read the **red error text** in SQL — paste it if you need help.

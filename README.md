# Tenis — Tennis Club & Player Platform

A full-stack monorepo for connecting tennis players, managing matches, and tracking ELO rankings.

**Stack:** Next.js 15 · Expo 53 · Supabase · tRPC · Turborepo · pnpm

---

## Project Structure

```
tenis/
├── apps/
│   ├── web/          Next.js 15 App Router (web dashboard)
│   └── mobile/       Expo 53 + Expo Router (iOS & Android)
├── packages/
│   ├── api/          tRPC routers (auth, player, match, ranking)
│   ├── db/           Supabase client + TypeScript database types
│   ├── types/        Zod schemas shared across web & mobile
│   └── config/       Shared tsconfig & eslint configs
└── supabase/
    ├── migrations/   PostgreSQL schema (tables, RLS, triggers, views)
    └── functions/    Edge Functions (match-result, expire-requests)
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Turbo | latest | `npm install -g turbo` |
| Supabase CLI | ≥ 2.0 | See below |
| Docker Desktop | latest | [docker.com](https://www.docker.com/products/docker-desktop/) |

### Supabase CLI (Windows)

```powershell
# Download the binary from GitHub releases
# https://github.com/supabase/cli/releases/latest
# Extract supabase.exe and add to PATH, e.g.:
# C:\Users\<you>\AppData\Local\supabase\supabase.exe
```

---

## 1 — Clone & Install

```bash
git clone <your-repo-url> tenis
cd tenis
pnpm install
```

---

## 2 — Supabase: Create a Project

### Option A — Local development (recommended to start)

Make sure **Docker Desktop** is running, then:

```bash
supabase start
```

This starts a local Postgres instance with Auth, Storage, and Realtime.
After it starts you'll see output like:

```
API URL:     http://127.0.0.1:54321
Anon key:    eyJ...
Service key: eyJ...
DB URL:      postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio:      http://127.0.0.1:54323
```

Apply the schema migration:

```bash
supabase db push
```

### Option B — Hosted Supabase (production)

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Run migrations against the remote project:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

---

## 3 — Environment Variables

### Web app — `apps/web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Mobile app — `apps/mobile/.env`

```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000/api/trpc
```

> **Note:** For the mobile emulator connecting to local Supabase, replace `127.0.0.1` with your machine's LAN IP (e.g. `192.168.1.x`).

### Root `.env` (optional — for edge functions / scripts)

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Copy the example file and fill in values:

```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

---

## 4 — Run the Apps

### All apps simultaneously (recommended)

```bash
pnpm dev
```

This uses Turborepo to start:
- **Web:** [http://localhost:3000](http://localhost:3000)
- **Mobile:** Expo dev server on port 8081

### Web only

```bash
pnpm --filter @tenis/web dev
```

### Mobile only

```bash
pnpm --filter @tenis/mobile start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with the **Expo Go** app.

---

## 5 — Deploy Edge Functions

```bash
supabase functions deploy match-result
supabase functions deploy expire-requests
```

Set the required secrets for deployed functions:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Schedule `expire-requests` via the Supabase Dashboard:
**Project Settings → Edge Functions → Schedule** → Cron: `*/15 * * * *`

---

## 6 — Build for Production

### Web

```bash
pnpm --filter @tenis/web build
```

Deploy to Vercel by connecting the repo and setting the root directory to `apps/web`.

### Mobile (EAS Build)

```bash
npm install -g eas-cli
eas login
eas build --platform ios     # or android / all
```

---

## Key Features (Phase 1 MVP)

- **Player profiles** — ELO rating, skill level, availability, match history
- **Player search** — filter by skill, city, ELO range with infinite scroll
- **Match requests** — send/accept/decline with 48h expiry
- **Match result flow** — submit → opponent confirms → atomic ELO update
- **ELO ranking** — standard Elo formula, K-factor tiers, provisional flag for <10 matches
- **Leaderboard** — global and filtered by country/city, top movers
- **Auth** — email/password + Google OAuth (Apple OAuth ready to enable)
- **Weekly availability** — per-player recurring time slot management

## Roadmap

| Phase | Features |
|-------|----------|
| 2 | Tournament management, bracket generation (single elimination + round robin) |
| 3 | Court reservations, Stripe Connect (entry fees & prizes), club admin panel |
| 4 | Real-time in-app messaging, push notifications, activity feeds |

---

## Useful Commands

```bash
# Generate updated TypeScript types from local Supabase schema
supabase gen types typescript --local > packages/db/src/database.types.ts

# Run migrations and seed data
supabase db reset

# Open Supabase Studio (local)
# Visit http://127.0.0.1:54323

# Type-check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

---

## Architecture Notes

- **tRPC context** reads the `Authorization: Bearer <token>` header — both web (`components/providers.tsx`) and mobile (`lib/trpc.ts`) attach the Supabase session JWT automatically.
- **ELO calculation** is a pure function in `packages/api/src/lib/elo.ts` — easy to unit-test.
- **Atomic ELO update** happens inside the `process_match_result(match_id)` PostgreSQL function, called by the `match-result` Edge Function. This prevents any partial state if the function times out.
- **RLS** is enforced at the database level — the service role key is only used inside Edge Functions and server-side tRPC context, never exposed to clients.

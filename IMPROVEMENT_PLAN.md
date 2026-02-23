# Tennis App — Improvement Plan
_Based on Playtomic analysis + current codebase audit_

---

## What We Have Now
- 1v1 private match requests (invite a specific player)
- Match flow: pending → accepted → score entry → confirmation → completed
- Player search by name / city / club / skill level
- Match history (shows WIN/LOSS only — no scores)
- Basic profile (skill level, city, club, bio)
- Messaging, court booking, ranking page

## What Playtomic Does That We Should Adopt

---

## Improvement 1 — Score visible in match history ✅ No DB change
**Problem:** History shows "WIN" or "LOSS" with no score. Useless after a few matches.
**Fix:** Parse `score_detail` JSON already stored in the DB and display "6-4, 3-6, 7-5" in the history card on both web and mobile.
**Files:** `apps/web/app/(dashboard)/matches/page.tsx`, `apps/mobile/app/(tabs)/matches.tsx`, `apps/mobile/app/matches/[id].tsx`
**Effort:** Small (1–2 hours)

---

## Improvement 2 — Player stats summary on profile
**Problem:** Profile shows matches played and a win count but no context. You can't tell if someone is on a streak, what their win rate is, or their recent form.
**Fix:** Add a "Recent Form" row to both own profile and public player profiles:
- Win rate % badge (e.g. "68% win rate")
- Last 5 matches dots: 🟢🟢🔴🟢🔴
- Matches this month counter
- All computable client-side from match history already returned by the API

**Files:** `apps/web/app/(dashboard)/profile/page.tsx`, `apps/web/app/(dashboard)/players/[id]/page.tsx`, mobile equivalents
**Effort:** Small–Medium (2–3 hours)

---

## Improvement 3 — Open Matches ("Looking to play")
**Problem:** The only way to find a game is to browse players and send a request hoping they respond. Playtomic's biggest feature is posting an open game slot.
**Fix:** New section on the home page and a new `/open-matches` page where players post "I want to play Saturday 10am, Ljubljana, any level" and others can send a join request.

**DB (new migration):**
```sql
CREATE TABLE public.open_matches (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  location_city  TEXT,
  location_name  TEXT,
  skill_min      skill_level,
  skill_max      skill_level,
  format         match_format NOT NULL DEFAULT 'best_of_3',
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','filled','cancelled')),
  filled_by      UUID REFERENCES public.profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**API:** `openMatch.create`, `openMatch.list` (filtered by city/skill), `openMatch.join` (sends a match request)
**UI:** Home page "Open Games Near You" section + `/open-matches` page with city filter
**Effort:** Large (full day) — highest user value

---

## Improvement 4 — Improved home dashboard
**Problem:** Home page is minimal. New users see an empty state immediately. Users with history see match requests and upcoming matches but no sense of their progress.
**Fix:**
- **Stats card:** Win rate, matches this month, current streak — at the top of home
- **"Players near your level":** 3 suggested players at same skill level (reuse `searchPlayers` with `skill_level` filter, limit 3)
- **Empty state improvement:** If no matches and no requests, show onboarding steps (complete profile → find a player → schedule first match)

**Files:** `apps/web/app/(dashboard)/page.tsx`, `apps/mobile/app/(tabs)/index.tsx`
**Effort:** Medium (3–4 hours)

---

## Improvement 5 — Profile completeness nudge
**Problem:** Many players skip filling in club, city, bio, or availability — making the app less useful for everyone (search returns fewer results, players can't be found).
**Fix:**
- A subtle banner on the profile page listing missing fields with a link to edit
- A small indicator (dot/badge) on the profile avatar in the nav if key fields are missing (city, club, skill_level)

**Files:** `apps/web/app/(dashboard)/profile/page.tsx`, `apps/web/app/(dashboard)/layout.tsx`
**Effort:** Small (1 hour)

---

## Suggested Build Order
| Priority | Feature | Effort | Value |
|----------|---------|--------|-------|
| 1 | Score in match history | Small | High |
| 2 | Home dashboard improvements | Medium | High |
| 3 | Player stats on profile | Small–Medium | Medium |
| 4 | Profile completeness nudge | Small | Medium |
| 5 | Open matches ("Looking to play") | Large | Very High |

---

## Ralph (Autonomous Build)
`https://github.com/snarktank/ralph` is a bash loop that spawns fresh Claude Code instances from a `prd.json` task list — each instance picks one story, implements it, commits, and marks it done. Good for running improvements 1–4 autonomously while tokens are available between sessions. Would need a `prd.json` with each improvement broken into small stories, and a `CLAUDE.md` pointing at this plan.

# Ralph Agent — Tenis App

You are an autonomous coding agent working on the Tenis App monorepo.

## Your Task

1. Read `scripts/ralph/prd.json` to find the current task list
2. Read `scripts/ralph/progress.txt` (especially the Codebase Patterns section at the top)
3. Pick the **highest priority** user story where `passes: false`
4. Implement that single user story completely
5. Run quality check: `pnpm --filter @tenis/web build` (must pass with zero errors)
6. If it passes, commit ALL changes: `feat: [Story ID] - [Story Title]`
7. Update `prd.json` to set `passes: true` for the completed story
8. Append your progress to `scripts/ralph/progress.txt`
9. Check if ALL stories now have `passes: true`

---

## Project Stack

- **Monorepo:** Turborepo + pnpm workspaces, root at `c:\Users\zigasaro\Desktop\tenis`
- **Web:** Next.js 16 (app router), `apps/web/`, port 3000
- **Mobile:** Expo 53 + NativeWind v4, `apps/mobile/`, port 8081
- **API:** tRPC v11 routers in `packages/api/src/routers/`
- **DB:** Supabase cloud (service role used server-side, bypasses RLS)
- **Types:** `packages/types/src/` — shared Zod schemas
- **DB types:** `packages/db/src/database.types.ts`

## Key File Locations

- Web pages: `apps/web/app/(dashboard)/`
- Mobile screens: `apps/mobile/app/(tabs)/` and `apps/mobile/app/`
- tRPC routers: `packages/api/src/routers/player.ts`, `match.ts`, `ranking.ts`, `auth.ts`
- API context: `packages/api/src/context.ts` — has `ctx.supabase` (service role) and `ctx.user`
- DB client: `packages/db/src/client.ts` — `createClient()` and `createServiceClient()`
- Web tRPC client: `apps/web/lib/trpc/client.ts` and `apps/web/lib/trpc/server.ts`
- Mobile tRPC client: `apps/mobile/lib/trpc.ts`

## Critical TypeScript Rules

- Supabase join syntax `player1:player1_id(...)` causes `SelectQueryError` — cast results to explicit local types with `as unknown as MyType[]`
- `Json` type from Supabase is deeply recursive — use `as unknown as YourType` to unwrap
- `Relationships` field must exist on all tables in `database.types.ts` (Supabase v2.97+)
- `tsconfig` in packages uses relative paths like `../config/tsconfig/base.json` (not aliases)
- Always call `.select(...)` before `.eq()/.neq()/.not()` on Supabase queries

## Quality Check Command

```bash
pnpm --filter @tenis/web build
```

This runs `next build` which includes TypeScript checking. It MUST pass with zero errors before committing. If it fails, fix the errors before committing.

## Coding Conventions

- **Dark mode:** All web UI uses Tailwind dark: variants. Always add dark: classes alongside light ones.
  - bg-white → `bg-white dark:bg-slate-800`
  - text-gray-900 → `text-gray-900 dark:text-slate-100`
  - border-gray-200 → `border-gray-200 dark:border-slate-700`
  - inputs: add `dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100`
- **Mobile dark mode:** NativeWind v4 with `useColorScheme()` from react-native. Use inline style objects for dynamic colors, not dark: variants (NativeWind v4 dark: support is limited).
- **No ELO in UI:** ELO is tracked in the DB but never shown in the UI. Do not display `elo_rating`, `elo_delta`, `elo_provisional` to users.
- **Mobile icons:** Use `@expo/vector-icons` Ionicons — outline when inactive, filled when active.
- **tRPC pattern:** Web uses `trpc.router.procedure.useQuery()`. Server components use `createCaller()` from `apps/web/lib/trpc/server.ts`.
- **Supabase client web:** Server components use `createClient()` from `@/lib/supabase/server`, client components never call Supabase directly (use tRPC).
- **Score detail format:** `score_detail` in matches is `[{p1: number, p2: number}]` — one object per set.

## Git Workflow

- Work on branch: `ralph/improvements` (create from master if it doesn't exist)
- Commit message format: `feat: [STORY-ID] - [Story Title]`
- Always `git push` after committing so progress is visible

## Progress Report Format

Append to `scripts/ralph/progress.txt`:

```
## [Date] - [Story ID] - [Story Title]
- What was implemented
- Files changed
- Learnings:
  - Any gotchas or patterns discovered
---
```

---

## Stop Condition

After completing a story and updating `prd.json`, check if ALL stories have `passes: true`.

If yes → output exactly: `<promise>COMPLETE</promise>`

If no → end your response normally (next iteration will pick up the next story).

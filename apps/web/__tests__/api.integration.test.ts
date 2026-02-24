/**
 * Integration tests against real Supabase cloud DB
 * These test the actual data inserted by the seed script
 *
 * Run: pnpm --filter @tenis/web test
 */
import { describe, it, expect, beforeAll } from "vitest";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://uekcwvdlfegkihhqopvb.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function db(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

// Demo user IDs populated after first fetch
let demoUsers: { id: string; full_name: string; skill_level: string; city: string }[] = [];

beforeAll(async () => {
  const profiles = await db(
    "profiles?full_name=in.(Ana Novak,Marko Kranjc,Petra Golob,Jan Horvat,Nina Vidmar)&select=id,full_name,skill_level,city,home_club,matches_played,matches_won"
  );
  demoUsers = profiles;
});

// ─── Profiles ──────────────────────────────────────────────────────────────

describe("Profiles — demo users", () => {
  it("finds all 5 demo users", () => {
    expect(demoUsers).toHaveLength(5);
  });

  it("Ana Novak has intermediate skill level", () => {
    const ana = demoUsers.find((u) => u.full_name === "Ana Novak");
    expect(ana).toBeDefined();
    expect(ana?.skill_level).toBe("intermediate");
  });

  it("Marko Kranjc has advanced skill level", () => {
    const marko = demoUsers.find((u) => u.full_name === "Marko Kranjc");
    expect(marko?.skill_level).toBe("advanced");
  });

  it("Nina Vidmar is from Koper", () => {
    const nina = demoUsers.find((u) => u.full_name === "Nina Vidmar");
    expect(nina?.city).toBe("Koper");
  });

  it("users have match stats recorded", async () => {
    const marko = demoUsers.find((u) => u.full_name === "Marko Kranjc") as any;
    expect(marko?.matches_played).toBeGreaterThan(0);
  });
});

// ─── Matches ───────────────────────────────────────────────────────────────

describe("Matches — completed games", () => {
  it("has at least 5 completed matches", async () => {
    const matches = await db("matches?status=eq.completed&select=id,score_detail,winner_id");
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });

  it("all completed matches have score_detail", async () => {
    const matches = await db("matches?status=eq.completed&select=id,score_detail");
    for (const m of matches) {
      expect(m.score_detail).not.toBeNull();
      expect(Array.isArray(m.score_detail)).toBe(true);
      expect(m.score_detail.length).toBeGreaterThan(0);
    }
  });

  it("score sets have valid p1/p2 structure", async () => {
    const matches = await db("matches?status=eq.completed&select=score_detail");
    for (const m of matches) {
      for (const set of m.score_detail as { p1: number; p2: number }[]) {
        expect(typeof set.p1).toBe("number");
        expect(typeof set.p2).toBe("number");
        expect(set.p1 + set.p2).toBeGreaterThan(0);
      }
    }
  });

  it("all completed matches have a winner_id", async () => {
    const matches = await db("matches?status=eq.completed&select=id,winner_id");
    for (const m of matches) {
      expect(m.winner_id).not.toBeNull();
    }
  });
});

// ─── Open Matches ──────────────────────────────────────────────────────────

describe("Open matches — posted offers", () => {
  it("has at least 3 open match offers", async () => {
    const open = await db("open_matches?status=eq.open&select=id,location_name,creator_id");
    expect(open.length).toBeGreaterThanOrEqual(3);
  });

  it("open matches have future scheduled_at", async () => {
    const open = await db("open_matches?status=eq.open&select=scheduled_at");
    const now = new Date();
    for (const m of open) {
      expect(new Date(m.scheduled_at).getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it("open matches have valid location", async () => {
    const open = await db("open_matches?status=eq.open&select=location_name,location_city");
    for (const m of open) {
      expect(m.location_name).toBeTruthy();
    }
  });
});

// ─── Tournaments ───────────────────────────────────────────────────────────

describe("Tournaments — weekend event", () => {
  it("Ljubljana Weekend Open exists", async () => {
    const tourneys = await db("tournaments?name=eq.Ljubljana%20Weekend%20Open&select=id,name,max_spots,status,format");
    expect(tourneys.length).toBe(1);
    expect(tourneys[0].status).toBe("open");
    expect(tourneys[0].format).toBe("singles");
    expect(tourneys[0].max_spots).toBe(8);
  });

  it("tournament has 4 participants", async () => {
    const tourneys = await db("tournaments?name=eq.Ljubljana%20Weekend%20Open&select=id");
    const tourneyId = tourneys[0]?.id;
    expect(tourneyId).toBeDefined();
    const participants = await db(
      `tournament_participants?tournament_id=eq.${tourneyId}&select=id,play_format`
    );
    expect(participants.length).toBe(4);
  });

  it("all tournament participants chose singles format", async () => {
    const tourneys = await db("tournaments?name=eq.Ljubljana%20Weekend%20Open&select=id");
    const participants = await db(
      `tournament_participants?tournament_id=eq.${tourneys[0]?.id}&select=play_format`
    );
    for (const p of participants) {
      expect(p.play_format).toBe("singles");
    }
  });
});

// ─── Players filtering ─────────────────────────────────────────────────────

describe("Player search filters", () => {
  it("can filter public profiles by city", async () => {
    const lj = await db("profiles?city=eq.Ljubljana&is_public=eq.true&select=id,city");
    expect(lj.every((p: { city: string }) => p.city === "Ljubljana")).toBe(true);
  });

  it("can filter by skill_level", async () => {
    const advanced = await db("profiles?skill_level=eq.advanced&is_public=eq.true&select=id,skill_level");
    expect(advanced.length).toBeGreaterThan(0);
    expect(advanced.every((p: { skill_level: string }) => p.skill_level === "advanced")).toBe(true);
  });

  it("home_club returns distinct clubs", async () => {
    const clubs = await db("profiles?home_club=not.is.null&is_active=eq.true&select=home_club");
    const uniqueClubs = [...new Set(clubs.map((p: { home_club: string }) => p.home_club))];
    expect(uniqueClubs.length).toBeGreaterThan(0);
  });
});

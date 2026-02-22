import { describe, it, expect, vi } from "vitest";
import { appRouter } from "../root";
import type { Context } from "../trpc";

const USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const CONV_ID = "550e8400-e29b-41d4-a716-446655440002";
const COURT_ID = "550e8400-e29b-41d4-a716-446655440003";
const MATCH_ID = "550e8400-e29b-41d4-a716-446655440004";

/** Build a fluent Supabase query-builder mock that resolves to `resolved` */
function buildChain(resolved: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select", "eq", "neq", "lt", "gt", "lte", "gte",
    "or", "ilike", "is", "not", "order", "limit", "range",
    "insert", "update", "delete", "upsert", "in",
  ];
  methods.forEach((m) => { chain[m] = () => chain; });
  // .single() returns a promise directly
  chain.single = () => Promise.resolve(resolved);
  // Make the chain itself awaitable (for queries without .single())
  chain.then = (
    onFulfilled: (v: unknown) => unknown,
    onRejected?: (r: unknown) => unknown
  ) => Promise.resolve(resolved).then(onFulfilled, onRejected);
  return chain;
}

function makeCtx(
  tableData: Record<string, { data: unknown; error: unknown }>
): Context {
  return {
    user: { id: USER_ID, email: "test@example.com" },
    supabase: {
      from: (table: string) =>
        buildChain(tableData[table] ?? { data: null, error: null }),
      auth: { getUser: vi.fn() },
      functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
    } as unknown as Context["supabase"],
  };
}

// ---------------------------------------------------------------------------
// messaging.sendMessage — Zod input validation
// ---------------------------------------------------------------------------
describe("messaging.sendMessage — input validation", () => {
  // Provide a mock ctx that returns a "found" conversation so validation errors
  // are purely from Zod, not from missing DB data
  const ctx = makeCtx({
    conversations: { data: { id: CONV_ID }, error: null },
    messages: {
      data: {
        id: "msg-1",
        conversation_id: CONV_ID,
        sender_id: USER_ID,
        content: "hi",
        read_at: null,
        created_at: new Date().toISOString(),
      },
      error: null,
    },
  });
  const caller = appRouter.createCaller(ctx);

  it("rejects content longer than 1000 characters", async () => {
    await expect(
      caller.messaging.sendMessage({
        conversation_id: CONV_ID,
        content: "a".repeat(1001),
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects empty content", async () => {
    await expect(
      caller.messaging.sendMessage({ conversation_id: CONV_ID, content: "" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an invalid conversation_id (non-UUID)", async () => {
    await expect(
      caller.messaging.sendMessage({ conversation_id: "not-a-uuid", content: "Hello" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ---------------------------------------------------------------------------
// courts.bookCourt — overlap conflict detection
// ---------------------------------------------------------------------------
describe("courts.bookCourt — conflict detection", () => {
  it("throws CONFLICT when an overlapping confirmed booking exists in the DB", async () => {
    const ctx = makeCtx({
      // The conflict-check query returns 1 existing booking → triggers CONFLICT
      court_bookings: { data: [{ id: "existing-booking-id" }], error: null },
    });
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.courts.bookCourt({
        court_id: COURT_ID,
        starts_at: "2026-06-01T10:00:00.000Z",
        ends_at: "2026-06-01T11:00:00.000Z",
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects non-ISO datetime strings at the Zod level (before hitting the DB)", async () => {
    const ctx = makeCtx({});
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.courts.bookCourt({
        court_id: COURT_ID,
        starts_at: "10:00 AM tomorrow",
        ends_at: "11:00 AM tomorrow",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ---------------------------------------------------------------------------
// match.submitResult — score validation via SubmitResultSchema refine
// ---------------------------------------------------------------------------
describe("match.submitResult — score validation", () => {
  const ctx = makeCtx({});
  const caller = appRouter.createCaller(ctx);

  it("rejects an impossible set score (3-2: no player won a valid set)", async () => {
    await expect(
      caller.match.submitResult({
        match_id: MATCH_ID,
        format: "best_of_3",
        score_detail: [{ p1: 3, p2: 2 }, { p1: 6, p2: 3 }],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects best_of_1 format when 2 sets are provided", async () => {
    await expect(
      caller.match.submitResult({
        match_id: MATCH_ID,
        format: "best_of_1",
        score_detail: [{ p1: 6, p2: 4 }, { p1: 6, p2: 3 }],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects best_of_3 where sets are split 1-1 with no deciding 3rd set", async () => {
    await expect(
      caller.match.submitResult({
        match_id: MATCH_ID,
        format: "best_of_3",
        score_detail: [{ p1: 6, p2: 4 }, { p1: 3, p2: 6 }],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

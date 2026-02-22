import { describe, it, expect } from "vitest";
import { RegisterSchema, SearchPlayersSchema } from "../user";
import { SendMatchRequestSchema, SubmitResultSchema } from "../match";
import { SendMessageSchema } from "../messaging";
import { BookCourtSchema } from "../courts";

describe("RegisterSchema", () => {
  it("accepts valid registration", () => {
    expect(
      RegisterSchema.safeParse({
        email: "player@example.com",
        password: "securepassword",
        full_name: "John Doe",
        username: "johndoe",
        skill_level: "intermediate",
      }).success
    ).toBe(true);
  });

  it("rejects missing email", () => {
    expect(
      RegisterSchema.safeParse({
        password: "securepassword",
        full_name: "John Doe",
        username: "johndoe",
        skill_level: "beginner",
      }).success
    ).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = RegisterSchema.safeParse({
      email: "player@example.com",
      password: "short",
      full_name: "John Doe",
      username: "johndoe",
      skill_level: "beginner",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("8 characters"))).toBe(true);
    }
  });

  it("rejects username with spaces and special characters", () => {
    expect(
      RegisterSchema.safeParse({
        email: "player@example.com",
        password: "securepassword",
        full_name: "John Doe",
        username: "John Doe!",
        skill_level: "beginner",
      }).success
    ).toBe(false);
  });

  it("defaults country to US when not provided", () => {
    const result = RegisterSchema.safeParse({
      email: "player@example.com",
      password: "securepassword",
      full_name: "John Doe",
      username: "johndoe",
      skill_level: "beginner",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.country).toBe("US");
  });
});

describe("SendMessageSchema", () => {
  const convId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts a 1-character message", () => {
    expect(
      SendMessageSchema.safeParse({ conversation_id: convId, content: "H" }).success
    ).toBe(true);
  });

  it("accepts a 1000-character message (boundary)", () => {
    expect(
      SendMessageSchema.safeParse({ conversation_id: convId, content: "a".repeat(1000) }).success
    ).toBe(true);
  });

  it("rejects empty content", () => {
    expect(
      SendMessageSchema.safeParse({ conversation_id: convId, content: "" }).success
    ).toBe(false);
  });

  it("rejects content over 1000 characters", () => {
    expect(
      SendMessageSchema.safeParse({ conversation_id: convId, content: "a".repeat(1001) }).success
    ).toBe(false);
  });
});

describe("SubmitResultSchema / validateScoreDetail", () => {
  const matchId = "550e8400-e29b-41d4-a716-446655440001";

  it("accepts valid best_of_3 (6-4, 6-3)", () => {
    expect(
      SubmitResultSchema.safeParse({
        match_id: matchId,
        format: "best_of_3",
        score_detail: [{ p1: 6, p2: 4 }, { p1: 6, p2: 3 }],
      }).success
    ).toBe(true);
  });

  it("accepts tiebreak set (7-6)", () => {
    expect(
      SubmitResultSchema.safeParse({
        match_id: matchId,
        format: "best_of_3",
        score_detail: [{ p1: 7, p2: 6 }, { p1: 6, p2: 4 }],
      }).success
    ).toBe(true);
  });

  it("accepts full best_of_3 match going to 3 sets", () => {
    expect(
      SubmitResultSchema.safeParse({
        match_id: matchId,
        format: "best_of_3",
        score_detail: [{ p1: 6, p2: 4 }, { p1: 3, p2: 6 }, { p1: 7, p2: 5 }],
      }).success
    ).toBe(true);
  });

  it("rejects impossible set score (3-4: no tennis set winner)", () => {
    expect(
      SubmitResultSchema.safeParse({
        match_id: matchId,
        format: "best_of_3",
        score_detail: [{ p1: 3, p2: 4 }, { p1: 6, p2: 3 }],
      }).success
    ).toBe(false);
  });

  it("rejects too many sets for best_of_1 format", () => {
    expect(
      SubmitResultSchema.safeParse({
        match_id: matchId,
        format: "best_of_1",
        score_detail: [{ p1: 6, p2: 4 }, { p1: 6, p2: 3 }],
      }).success
    ).toBe(false);
  });

  it("rejects best_of_3 where sets are 1-1 with no deciding set", () => {
    // p1 wins set 1, p2 wins set 2 — no player reached 2 sets won
    expect(
      SubmitResultSchema.safeParse({
        match_id: matchId,
        format: "best_of_3",
        score_detail: [{ p1: 6, p2: 4 }, { p1: 3, p2: 6 }],
      }).success
    ).toBe(false);
  });
});

describe("SearchPlayersSchema", () => {
  it("accepts empty input and applies defaults", () => {
    const result = SearchPlayersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(20);
  });

  it("accepts a valid ELO range", () => {
    expect(
      SearchPlayersSchema.safeParse({ min_elo: 1000, max_elo: 1800 }).success
    ).toBe(true);
  });

  it("rejects min_elo below 800", () => {
    expect(SearchPlayersSchema.safeParse({ min_elo: 500 }).success).toBe(false);
  });

  it("rejects max_elo above 3000", () => {
    expect(SearchPlayersSchema.safeParse({ max_elo: 3500 }).success).toBe(false);
  });

  it("accepts a valid UUID cursor", () => {
    expect(
      SearchPlayersSchema.safeParse({ cursor: "550e8400-e29b-41d4-a716-446655440000" }).success
    ).toBe(true);
  });

  it("rejects a non-UUID cursor", () => {
    expect(SearchPlayersSchema.safeParse({ cursor: "not-a-uuid" }).success).toBe(false);
  });
});

describe("BookCourtSchema", () => {
  const courtId = "550e8400-e29b-41d4-a716-446655440002";

  it("accepts a valid booking", () => {
    expect(
      BookCourtSchema.safeParse({
        court_id: courtId,
        starts_at: "2026-06-01T10:00:00.000Z",
        ends_at: "2026-06-01T11:00:00.000Z",
      }).success
    ).toBe(true);
  });

  it("accepts booking with optional notes and match_id", () => {
    expect(
      BookCourtSchema.safeParse({
        court_id: courtId,
        starts_at: "2026-06-01T10:00:00.000Z",
        ends_at: "2026-06-01T11:00:00.000Z",
        notes: "Friendly match",
        match_id: "550e8400-e29b-41d4-a716-446655440003",
      }).success
    ).toBe(true);
  });

  it("rejects non-ISO datetime strings", () => {
    expect(
      BookCourtSchema.safeParse({
        court_id: courtId,
        starts_at: "10:00 AM",
        ends_at: "11:00 AM",
      }).success
    ).toBe(false);
  });

  it("rejects notes over 500 characters", () => {
    expect(
      BookCourtSchema.safeParse({
        court_id: courtId,
        starts_at: "2026-06-01T10:00:00.000Z",
        ends_at: "2026-06-01T11:00:00.000Z",
        notes: "a".repeat(501),
      }).success
    ).toBe(false);
  });
});

describe("SendMatchRequestSchema", () => {
  it("accepts valid request and defaults format to best_of_3", () => {
    const result = SendMatchRequestSchema.safeParse({
      recipient_id: "550e8400-e29b-41d4-a716-446655440000",
      proposed_at: "2026-06-01T14:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.format).toBe("best_of_3");
  });

  it("accepts all optional fields", () => {
    expect(
      SendMatchRequestSchema.safeParse({
        recipient_id: "550e8400-e29b-41d4-a716-446655440000",
        proposed_at: "2026-06-01T14:00:00.000Z",
        format: "best_of_5",
        location_name: "Roland Garros",
        location_city: "Paris",
        message: "Let's play!",
      }).success
    ).toBe(true);
  });

  it("rejects invalid recipient_id (not a UUID)", () => {
    expect(
      SendMatchRequestSchema.safeParse({
        recipient_id: "not-a-uuid",
        proposed_at: "2026-06-01T14:00:00.000Z",
      }).success
    ).toBe(false);
  });
});

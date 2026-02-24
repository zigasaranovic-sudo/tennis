import { describe, it, expect } from "vitest";

// Utility functions mirrored from the app
function formatScore(scoreDetail: { p1: number; p2: number }[] | null): string {
  if (!scoreDetail || scoreDetail.length === 0) return "";
  return scoreDetail.map((s) => `${s.p1}-${s.p2}`).join(", ");
}

function getWinnerFromScore(
  scoreDetail: { p1: number; p2: number }[],
  player1Id: string,
  player2Id: string
): string | null {
  const p1Sets = scoreDetail.filter((s) => s.p1 > s.p2).length;
  const p2Sets = scoreDetail.filter((s) => s.p2 > s.p1).length;
  if (p1Sets > p2Sets) return player1Id;
  if (p2Sets > p1Sets) return player2Id;
  return null;
}

function getWinRate(won: number, played: number): number {
  if (played === 0) return 0;
  return Math.round((won / played) * 100);
}

describe("Score utilities", () => {
  it("formats a 2-set score correctly", () => {
    expect(formatScore([{ p1: 6, p2: 4 }, { p1: 7, p2: 5 }])).toBe("6-4, 7-5");
  });

  it("formats a 3-set score correctly", () => {
    expect(formatScore([{ p1: 6, p2: 3 }, { p1: 4, p2: 6 }, { p1: 7, p2: 5 }])).toBe("6-3, 4-6, 7-5");
  });

  it("returns empty string for null score", () => {
    expect(formatScore(null)).toBe("");
  });

  it("returns empty string for empty score array", () => {
    expect(formatScore([])).toBe("");
  });

  it("determines winner from 2-set score", () => {
    const score = [{ p1: 6, p2: 4 }, { p1: 7, p2: 5 }];
    expect(getWinnerFromScore(score, "p1", "p2")).toBe("p1");
  });

  it("determines winner from 3-set score", () => {
    const score = [{ p1: 6, p2: 3 }, { p1: 4, p2: 6 }, { p1: 3, p2: 6 }];
    expect(getWinnerFromScore(score, "p1", "p2")).toBe("p2");
  });

  it("calculates win rate correctly", () => {
    expect(getWinRate(3, 5)).toBe(60);
    expect(getWinRate(0, 0)).toBe(0);
    expect(getWinRate(5, 5)).toBe(100);
    expect(getWinRate(1, 3)).toBe(33);
  });
});

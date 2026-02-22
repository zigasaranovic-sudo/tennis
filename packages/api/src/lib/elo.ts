/**
 * Pure ELO calculation functions.
 * No side effects — easy to unit test without any infrastructure.
 */

export const ELO_CONFIG = {
  STARTING_RATING: 1200,
  FLOOR: 800,
  CEILING: 3000,
  PROVISIONAL_THRESHOLD: 10, // matches before rating is considered established
} as const;

/**
 * Returns the K-factor (sensitivity) based on match history and current rating.
 * Higher K = faster rating changes.
 */
export function getKFactor(matchesPlayed: number, eloRating: number): number {
  if (matchesPlayed < ELO_CONFIG.PROVISIONAL_THRESHOLD) return 40; // provisional: fast calibration
  if (matchesPlayed < 30) return 32; // established
  if (eloRating >= 2000) return 16; // elite: stability
  return 24; // experienced
}

/**
 * Expected score (probability of winning) for player A against player B.
 * Based on standard Elo expected value formula.
 * Returns a value between 0 and 1.
 */
export function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Calculate a player's new ELO rating after a match.
 * @param currentElo - Player's current rating
 * @param opponentElo - Opponent's current rating
 * @param actualScore - 1 for win, 0 for loss (no draws in tennis)
 * @param matchesPlayed - Total ranked matches played (before this match)
 */
export function calculateNewElo(
  currentElo: number,
  opponentElo: number,
  actualScore: 0 | 1,
  matchesPlayed: number
): number {
  const k = getKFactor(matchesPlayed, currentElo);
  const expected = expectedScore(currentElo, opponentElo);
  const newElo = Math.round(currentElo + k * (actualScore - expected));
  return Math.min(
    Math.max(newElo, ELO_CONFIG.FLOOR),
    ELO_CONFIG.CEILING
  );
}

export type EloResult = {
  player1EloAfter: number;
  player2EloAfter: number;
  player1Delta: number;
  player2Delta: number;
};

/**
 * Calculate ELO changes for both players after a completed match.
 *
 * @example
 * // Player A (1200 ELO, 5 matches) beats Player B (1400 ELO, 20 matches)
 * // Expected(A) = 1/(1+10^(200/400)) = 0.24
 * // K(A) = 40 (provisional)
 * // Delta(A) = 40 * (1 - 0.24) = +30 → A: 1230
 * // K(B) = 24 (experienced)
 * // Delta(B) = 24 * (0 - 0.76) = -18 → B: 1382
 */
export function calculateMatchElo(
  player1: { elo: number; matchesPlayed: number },
  player2: { elo: number; matchesPlayed: number },
  winnerId: "player1" | "player2"
): EloResult {
  const p1Score: 0 | 1 = winnerId === "player1" ? 1 : 0;
  const p2Score: 0 | 1 = winnerId === "player2" ? 1 : 0;

  const player1EloAfter = calculateNewElo(
    player1.elo,
    player2.elo,
    p1Score,
    player1.matchesPlayed
  );
  const player2EloAfter = calculateNewElo(
    player2.elo,
    player1.elo,
    p2Score,
    player2.matchesPlayed
  );

  return {
    player1EloAfter,
    player2EloAfter,
    player1Delta: player1EloAfter - player1.elo,
    player2Delta: player2EloAfter - player2.elo,
  };
}

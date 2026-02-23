import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { playerRouter } from "./routers/player";
import { matchRouter } from "./routers/match";
import { rankingRouter } from "./routers/ranking";
import { messagingRouter } from "./routers/messaging";
import { courtsRouter } from "./routers/courts";
import { openMatchRouter } from "./routers/openMatch";

export const appRouter = router({
  auth: authRouter,
  player: playerRouter,
  match: matchRouter,
  ranking: rankingRouter,
  messaging: messagingRouter,
  courts: courtsRouter,
  openMatch: openMatchRouter,
});

/** The type shared between server and all clients (web + mobile) */
export type AppRouter = typeof appRouter;

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@tenis/api";

/**
 * Server-side tRPC caller — use in Server Components and Route Handlers.
 */
export function createServerTrpcClient(authToken?: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/trpc`,
        headers: authToken
          ? { authorization: `Bearer ${authToken}` }
          : undefined,
      }),
    ],
  });
}

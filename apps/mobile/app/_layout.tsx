import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { trpc, createTrpcClient } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";

export default function RootLayout() {
  const { setSession, setLoading } = useAuthStore();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      })
  );

  const [trpcClient] = useState(() => createTrpcClient());

  useEffect(() => {
    // Listen for auth state changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="players/[id]"
            options={{ headerShown: true, title: "Player Profile", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="matches/[id]"
            options={{ headerShown: true, title: "Match", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="matches/new"
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Request Match",
            }}
          />
          <Stack.Screen
            name="messages/[conversationId]"
            options={{ headerShown: true, title: "Chat", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="courts/[venueId]/index"
            options={{ headerShown: true, title: "Venue", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="courts/[venueId]/[courtId]"
            options={{ headerShown: true, title: "Book Court", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="courts/bookings"
            options={{ headerShown: true, title: "My Bookings", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="open-matches"
            options={{ headerShown: true, title: "Open Matches", headerBackTitle: "Back" }}
          />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

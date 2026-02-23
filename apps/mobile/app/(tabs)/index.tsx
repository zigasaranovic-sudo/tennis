import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Image,
} from "react-native";
import { Link, router } from "expo-router";
import { trpc } from "@/lib/trpc";
import type { SkillLevel } from "@tenis/types";

type SuggestedPlayer = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  skill_level: string | null;
  city: string | null;
  home_club: string | null;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const sectionBg = isDark ? "#0f172a" : "#f9fafb";

  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: requests } = trpc.match.getRequests.useQuery({
    type: "incoming",
    status: "pending",
  });
  const { data: upcomingMatches } = trpc.match.getMyMatches.useQuery({
    status: "accepted",
    limit: 5,
  });
  const { data: suggestedData } = trpc.player.searchPlayers.useQuery(
    { skill_level: (profile?.skill_level ?? undefined) as SkillLevel | undefined, limit: 3 },
    { enabled: !!profile?.skill_level }
  );

  const respondToRequest = trpc.match.respondToRequest.useMutation();

  const matchesPlayed = profile?.matches_played ?? 0;
  const matchesWon = profile?.matches_won ?? 0;
  const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;
  const hasProfileComplete = !!(profile?.city && profile?.home_club);

  const suggestedPlayers = (suggestedData?.players ?? []) as unknown as SuggestedPlayer[];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Welcome header */}
      <View className="bg-green-600 rounded-2xl p-6 mb-6">
        <Text className="text-white text-xl font-bold">
          Welcome, {profile?.full_name?.split(" ")[0] ?? "Player"}! 👋
        </Text>
        {profile?.skill_level && (
          <Text className="text-green-100 text-sm mt-1 capitalize">{profile.skill_level} level</Text>
        )}
      </View>

      {/* Stats row or onboarding */}
      {profile && (
        matchesPlayed > 0 ? (
          <View
            style={{ backgroundColor: cardBg, borderColor: border }}
            className="rounded-2xl border p-4 mb-6"
          >
            <Text style={{ color: textSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-3">
              Your Stats
            </Text>
            <View className="flex-row">
              {/* Win Rate */}
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-green-600">{winRate}%</Text>
                <Text style={{ color: textSecondary }} className="text-xs mt-1">Win Rate</Text>
              </View>
              {/* Divider */}
              <View style={{ width: 1, backgroundColor: border }} className="my-1" />
              {/* Matches */}
              <View className="flex-1 items-center">
                <Text style={{ color: textPrimary }} className="text-2xl font-bold">{matchesPlayed}</Text>
                <Text style={{ color: textSecondary }} className="text-xs mt-1">Matches</Text>
              </View>
              {/* Divider */}
              <View style={{ width: 1, backgroundColor: border }} className="my-1" />
              {/* Wins */}
              <View className="flex-1 items-center">
                <Text style={{ color: textPrimary }} className="text-2xl font-bold">{matchesWon}</Text>
                <Text style={{ color: textSecondary }} className="text-xs mt-1">Wins</Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{ backgroundColor: cardBg, borderColor: border }}
            className="rounded-2xl border p-4 mb-6"
          >
            <Text style={{ color: textPrimary }} className="font-semibold mb-3">Get started</Text>
            {/* Step 1 */}
            <View className="flex-row items-center mb-2">
              <View
                style={{ backgroundColor: hasProfileComplete ? "#16a34a" : (isDark ? "#334155" : "#e5e7eb") }}
                className="w-6 h-6 rounded-full items-center justify-center mr-3"
              >
                <Text className="text-white text-xs font-bold">{hasProfileComplete ? "✓" : "1"}</Text>
              </View>
              <Text style={{ color: hasProfileComplete ? "#16a34a" : textPrimary }} className="flex-1 text-sm">
                Complete your profile (city &amp; club)
              </Text>
            </View>
            {/* Step 2 */}
            <View className="flex-row items-center mb-2">
              <View
                style={{ backgroundColor: isDark ? "#334155" : "#e5e7eb" }}
                className="w-6 h-6 rounded-full items-center justify-center mr-3"
              >
                <Text style={{ color: textSecondary }} className="text-xs font-bold">2</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
                <Text className="text-green-600 text-sm">Find a player</Text>
              </TouchableOpacity>
            </View>
            {/* Step 3 */}
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: isDark ? "#334155" : "#e5e7eb" }}
                className="w-6 h-6 rounded-full items-center justify-center mr-3"
              >
                <Text style={{ color: textSecondary }} className="text-xs font-bold">3</Text>
              </View>
              <Text style={{ color: textSecondary }} className="text-sm">Play your first match</Text>
            </View>
          </View>
        )
      )}

      {/* Open Matches promo */}
      <TouchableOpacity
        onPress={() => router.push("/open-matches" as any)}
        style={{ backgroundColor: isDark ? "#14532d" : "#dcfce7", borderColor: isDark ? "#166534" : "#bbf7d0", borderWidth: 1 }}
        className="rounded-2xl p-4 mb-6 flex-row items-center justify-between"
      >
        <View className="flex-1">
          <Text style={{ color: isDark ? "#86efac" : "#15803d" }} className="font-bold text-base">
            🎾 Open Matches
          </Text>
          <Text style={{ color: isDark ? "#4ade80" : "#16a34a" }} className="text-sm mt-0.5">
            Find a game or post one for others
          </Text>
        </View>
        <Text style={{ color: isDark ? "#86efac" : "#16a34a" }} className="text-lg font-bold">→</Text>
      </TouchableOpacity>

      {/* Pending requests */}
      {requests && requests.length > 0 && (
        <View className="mb-6">
          <Text style={{ color: textPrimary }} className="text-lg font-bold mb-3">
            Match Requests ({requests.length})
          </Text>
          {requests.map((req) => (
            <View
              key={req.id}
              style={{ backgroundColor: cardBg, borderColor: border }}
              className="rounded-2xl border p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                    <Text className="text-green-700 font-bold text-xl">
                      {(req.requester as { full_name?: string })?.full_name?.[0] ?? "?"}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: textPrimary }} className="font-semibold">
                      {(req.requester as { full_name?: string })?.full_name}
                    </Text>
                    <Text style={{ color: textSecondary }} className="text-sm">
                      {new Date(req.proposed_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {req.location_city ? ` · ${req.location_city}` : ""}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() =>
                    respondToRequest.mutate({ request_id: req.id, response: "declined" })
                  }
                  style={{ borderColor: border }}
                  className="flex-1 py-2.5 border rounded-xl items-center"
                >
                  <Text style={{ color: textSecondary }} className="font-medium text-sm">Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    respondToRequest.mutate({ request_id: req.id, response: "accepted" })
                  }
                  className="flex-1 py-2.5 bg-green-600 rounded-xl items-center"
                >
                  <Text className="text-white font-medium text-sm">Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Suggested players */}
      {suggestedPlayers.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: textPrimary }} className="text-lg font-bold">Players near your level</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text className="text-green-600 text-sm font-medium">See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            {suggestedPlayers.map((player) => (
              <TouchableOpacity
                key={player.id}
                onPress={() => router.push(`/players/${player.id}` as any)}
                style={{ backgroundColor: cardBg, borderColor: border }}
                className="rounded-2xl border p-3 mx-1 w-36 items-center"
              >
                {player.avatar_url ? (
                  <Image
                    source={{ uri: player.avatar_url }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    className="mb-2"
                  />
                ) : (
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                    <Text className="text-green-700 font-bold text-xl">
                      {player.full_name?.[0] ?? "?"}
                    </Text>
                  </View>
                )}
                <Text style={{ color: textPrimary }} className="font-semibold text-sm text-center" numberOfLines={1}>
                  {player.full_name ?? player.username ?? "Player"}
                </Text>
                <Text style={{ color: textSecondary }} className="text-xs text-center mt-0.5" numberOfLines={1}>
                  {player.home_club ?? player.city ?? ""}
                </Text>
                {player.skill_level && (
                  <View
                    style={{ backgroundColor: isDark ? "#14532d" : "#dcfce7" }}
                    className="mt-1.5 px-2 py-0.5 rounded-full"
                  >
                    <Text style={{ color: isDark ? "#86efac" : "#15803d" }} className="text-xs capitalize">
                      {player.skill_level}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Upcoming matches */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: textPrimary }} className="text-lg font-bold">Upcoming Matches</Text>
          <Link href="/(tabs)/matches">
            <Text className="text-green-600 text-sm font-medium">View all</Text>
          </Link>
        </View>

        {upcomingMatches && upcomingMatches.length > 0 ? (
          (upcomingMatches as unknown as Array<{
            id: string;
            player1: { id: string; full_name: string } | null;
            player2: { id: string; full_name: string } | null;
            scheduled_at: string | null;
            format: string | null;
          }>).map((match) => (
            <TouchableOpacity
              key={match.id}
              onPress={() => router.push(`/matches/${match.id}`)}
              style={{ backgroundColor: cardBg, borderColor: border }}
              className="rounded-2xl border p-4 mb-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl">🎾</Text>
                  <View>
                    <Text style={{ color: textPrimary }} className="font-semibold">
                      vs{" "}
                      {(match.player1 as { id?: string })?.id === profile?.id
                        ? (match.player2 as { full_name?: string })?.full_name
                        : (match.player1 as { full_name?: string })?.full_name}
                    </Text>
                    <Text style={{ color: textSecondary }} className="text-sm">
                      {match.scheduled_at
                        ? new Date(match.scheduled_at).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : "Time TBD"}
                    </Text>
                  </View>
                </View>
                <View className="bg-green-50 px-2 py-1 rounded-lg">
                  <Text className="text-green-700 text-xs font-medium capitalize">
                    {match.format?.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View
            style={{ backgroundColor: cardBg, borderColor: border }}
            className="border border-dashed rounded-2xl p-10 items-center"
          >
            <Text className="text-5xl mb-4">🎾</Text>
            <Text style={{ color: textPrimary }} className="font-semibold text-center">No upcoming matches</Text>
            <Text style={{ color: textSecondary }} className="text-sm text-center mt-1">
              Find a player and challenge them!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search")}
              className="mt-4 px-5 py-2.5 bg-green-600 rounded-xl"
            >
              <Text className="text-white font-semibold text-sm">Find Players</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Link, router } from "expo-router";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";

  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: requests } = trpc.match.getRequests.useQuery({
    type: "incoming",
    status: "pending",
  });
  const { data: upcomingMatches } = trpc.match.getMyMatches.useQuery({
    status: "accepted",
    limit: 5,
  });

  const respondToRequest = trpc.match.respondToRequest.useMutation();

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

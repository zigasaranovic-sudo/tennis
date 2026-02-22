import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { trpc } from "@/lib/trpc";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SKILL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  professional: "Professional",
};

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";

  const { data: player, isLoading } = trpc.player.getPublicProfile.useQuery(
    { id },
    { enabled: !!id }
  );
  const { data: availability } = trpc.player.getAvailability.useQuery(
    { player_id: id },
    { enabled: !!id }
  );

  const { data: matchHistory } = trpc.player.getMatchHistory.useQuery(
    { player_id: id, limit: 5 },
    { enabled: !!id }
  );

  const sendRequest = trpc.match.sendRequest.useMutation({
    onSuccess: () => {
      Alert.alert("Request sent!", "Your match request has been sent.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
  });

  const handleSendRequest = () => {
    const proposedAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    Alert.alert("Send Match Request", "Choose a format:", [
      {
        text: "Best of 1",
        onPress: () =>
          sendRequest.mutate({ recipient_id: id, proposed_at: proposedAt, format: "best_of_1" }),
      },
      {
        text: "Best of 3",
        onPress: () =>
          sendRequest.mutate({ recipient_id: id, proposed_at: proposedAt, format: "best_of_3" }),
      },
      {
        text: "Best of 5",
        onPress: () =>
          sendRequest.mutate({ recipient_id: id, proposed_at: proposedAt, format: "best_of_5" }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <Text style={{ color: textSecondary }}>Player not found.</Text>
      </View>
    );
  }

  const winRate =
    player.matches_played > 0
      ? Math.round((player.matches_won / player.matches_played) * 100)
      : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Header card */}
      <View
        style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
        className="rounded-2xl p-5 mb-4"
      >
        <View className="flex-row items-center gap-4 mb-4">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
            <Text className="text-green-700 font-bold text-4xl">
              {player.full_name[0]}
            </Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text style={{ color: textPrimary }} className="text-xl font-bold">
              {player.full_name}
            </Text>
            <Text style={{ color: textSecondary }}>@{player.username}</Text>
            {player.city && (
              <Text style={{ color: textSecondary }} className="text-sm mt-0.5">
                📍 {player.city}
              </Text>
            )}
            {player.skill_level && (
              <View className="mt-1 self-start bg-green-100 rounded-full px-2 py-0.5">
                <Text className="text-xs text-green-700 font-medium">
                  {SKILL_LABELS[player.skill_level] ?? player.skill_level}
                </Text>
              </View>
            )}
          </View>
        </View>

        {player.bio ? (
          <Text style={{ color: textSecondary }} className="text-sm mb-4">
            {player.bio}
          </Text>
        ) : null}

        {/* Stats row */}
        <View
          style={{ borderTopColor: border, borderTopWidth: 1 }}
          className="flex-row pt-4 gap-2"
        >

          <View className="flex-1 items-center">
            <Text style={{ color: textPrimary }} className="text-2xl font-bold">
              {player.matches_played}
            </Text>
            <Text style={{ color: textSecondary }} className="text-xs mt-0.5">Matches</Text>
          </View>
          <View className="flex-1 items-center">
            <Text style={{ color: textPrimary }} className="text-2xl font-bold">{winRate}%</Text>
            <Text style={{ color: textSecondary }} className="text-xs mt-0.5">Win Rate</Text>
          </View>
        </View>
      </View>



      {/* Availability */}
      {availability && availability.length > 0 && (
        <View
          style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
          className="rounded-2xl p-5 mb-4"
        >
          <Text style={{ color: textPrimary }} className="text-base font-semibold mb-3">
            Availability
          </Text>
          {availability.map((slot) => (
            <View key={slot.id} className="flex-row items-center gap-3 mb-2">
              <View className="w-12 bg-green-100 rounded-lg py-1 items-center">
                <Text className="text-xs font-semibold text-green-700">
                  {DAY_NAMES[slot.day_of_week]}
                </Text>
              </View>
              <Text style={{ color: textSecondary }} className="text-sm">
                {slot.start_time} – {slot.end_time}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent matches */}
      {matchHistory && matchHistory.length > 0 && (
        <View
          style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
          className="rounded-2xl p-5 mb-4"
        >
          <Text style={{ color: textPrimary }} className="text-base font-semibold mb-3">
            Recent Matches
          </Text>
          {(matchHistory as unknown as Array<{
            id: string;
            winner_id: string | null;
            played_at: string | null;
            scheduled_at: string | null;
            player1: { id: string; full_name: string } | null;
            player2: { id: string; full_name: string } | null;
          }>).map((match) => {
            const isWinner = match.winner_id === id;
            const opponent =
              match.player1?.id === id ? match.player2 : match.player1;
            return (
              <TouchableOpacity
                key={match.id}
                onPress={() => router.push(`/matches/${match.id}`)}
                style={{ borderBottomColor: border, borderBottomWidth: 1 }}
                className="flex-row items-center justify-between py-2 last:border-0"
              >
                <View className="flex-row items-center gap-2">
                  <View
                    className={`w-2 h-2 rounded-full ${isWinner ? "bg-green-500" : "bg-red-400"}`}
                  />
                  <Text style={{ color: textPrimary }} className="text-sm">
                    vs {opponent?.full_name ?? "Unknown"}
                  </Text>
                </View>
                <Text style={{ color: textSecondary }} className="text-xs">
                  {new Date(match.played_at ?? match.scheduled_at ?? "").toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity
        onPress={handleSendRequest}
        disabled={sendRequest.isPending}
        className="bg-green-600 rounded-2xl p-4 items-center mb-6"
      >
        <Text className="text-white font-semibold text-base">
          {sendRequest.isPending ? "Sending..." : "Send Match Request"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

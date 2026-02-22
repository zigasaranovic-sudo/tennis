import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

  const { data: player, isLoading } = trpc.player.getPublicProfile.useQuery(
    { id },
    { enabled: !!id }
  );
  const { data: availability } = trpc.player.getAvailability.useQuery(
    { player_id: id },
    { enabled: !!id }
  );
  const { data: eloHistory } = trpc.player.getEloHistory.useQuery(
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!player) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Player not found.</Text>
      </View>
    );
  }

  const winRate =
    player.matches_played > 0
      ? Math.round((player.matches_won / player.matches_played) * 100)
      : 0;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Header card */}
      <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <View className="flex-row items-center gap-4 mb-4">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
            <Text className="text-green-700 font-bold text-4xl">
              {player.full_name[0]}
            </Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-xl font-bold text-gray-900">{player.full_name}</Text>
            <Text className="text-gray-500">@{player.username}</Text>
            {player.city && (
              <Text className="text-sm text-gray-400 mt-0.5">📍 {player.city}</Text>
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
          <Text className="text-gray-600 text-sm mb-4">{player.bio}</Text>
        ) : null}

        {/* Stats row */}
        <View className="flex-row border-t border-gray-100 pt-4 gap-2">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">
              {player.elo_rating}
              {player.elo_provisional && (
                <Text className="text-sm text-gray-400">*</Text>
              )}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">ELO</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">{player.matches_played}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Matches</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">{winRate}%</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Win Rate</Text>
          </View>
        </View>
      </View>

      {/* ELO chart */}
      {eloHistory && eloHistory.length > 1 && (
        <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">ELO Progress</Text>
          <View className="h-20 flex-row items-end gap-0.5">
            {eloHistory.slice(-20).map((point, i) => {
              const values = eloHistory.slice(-20).map((p) => p.elo_after);
              const min = Math.min(...values);
              const max = Math.max(...values);
              const range = max - min || 1;
              const heightPct = ((point.elo_after - min) / range) * 100;
              return (
                <View
                  key={i}
                  className={`flex-1 rounded-t ${point.elo_delta > 0 ? "bg-green-400" : "bg-red-400"}`}
                  style={{ height: `${Math.max(heightPct, 5)}%` }}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* Availability */}
      {availability && availability.length > 0 && (
        <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">Availability</Text>
          {availability.map((slot) => (
            <View key={slot.id} className="flex-row items-center gap-3 mb-2">
              <View className="w-12 bg-green-100 rounded-lg py-1 items-center">
                <Text className="text-xs font-semibold text-green-700">
                  {DAY_NAMES[slot.day_of_week]}
                </Text>
              </View>
              <Text className="text-sm text-gray-600">
                {slot.start_time} – {slot.end_time}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent matches */}
      {matchHistory && matchHistory.length > 0 && (
        <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">Recent Matches</Text>
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
                className="flex-row items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <View className="flex-row items-center gap-2">
                  <View
                    className={`w-2 h-2 rounded-full ${isWinner ? "bg-green-500" : "bg-red-400"}`}
                  />
                  <Text className="text-sm text-gray-700">
                    vs {opponent?.full_name ?? "Unknown"}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">
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

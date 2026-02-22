import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";

export default function RankingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";

  const { data: leaderboard, isFetching } = trpc.ranking.getLeaderboard.useQuery({
    limit: 100,
    offset: 0,
  });
  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* My rank banner */}
      {myRank?.rank && (
        <View className="bg-green-600 px-4 py-4 flex-row items-center justify-between">
          <View>
            <Text className="text-green-100 text-sm">Your rank</Text>
            <Text className="text-white text-3xl font-bold">#{myRank.rank}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={leaderboard ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item: player, index }) => (
          <TouchableOpacity
            onPress={() => router.push(`/players/${player.id}`)}
            style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
            className="rounded-xl p-4 mb-2 flex-row items-center gap-4"
          >
            <Text
              className={`text-xl font-bold w-10 text-center ${
                index === 0
                  ? "text-yellow-500"
                  : index === 1
                  ? "text-gray-400"
                  : index === 2
                  ? "text-amber-600"
                  : ""
              }`}
              style={index > 2 ? { color: textSecondary } : undefined}
            >
              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${player.rank}`}
            </Text>

            <View className="w-11 h-11 bg-green-100 rounded-full items-center justify-center">
              <Text className="text-green-700 font-bold text-lg">
                {player.full_name[0]}
              </Text>
            </View>

            <View className="flex-1 min-w-0">
              <Text style={{ color: textPrimary }} className="font-semibold" numberOfLines={1}>
                {player.full_name}
              </Text>
              <Text style={{ color: textSecondary }} className="text-sm">
                {player.matches_won}W – {player.matches_lost}L
                {player.city ? ` · ${player.city}` : ""}
              </Text>
            </View>

            <View className="items-end">
              <Text style={{ color: textPrimary }} className="text-sm font-bold">{player.matches_won}W</Text>
              <Text style={{ color: isDark ? "#64748b" : "#9ca3af" }} className="text-xs">{player.matches_played} played</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            {isFetching ? (
              <Text style={{ color: textSecondary }}>Loading rankings...</Text>
            ) : (
              <>
                <Text className="text-5xl mb-4">🏆</Text>
                <Text style={{ color: textPrimary }} className="font-semibold">No rankings yet</Text>
                <Text style={{ color: textSecondary }} className="text-sm mt-1">
                  Play 5 matches to appear on the leaderboard
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

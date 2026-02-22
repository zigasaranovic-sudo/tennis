import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";

export default function RankingScreen() {
  const { data: leaderboard, isFetching } = trpc.ranking.getLeaderboard.useQuery({
    limit: 100,
    offset: 0,
  });
  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();

  return (
    <View className="flex-1 bg-gray-50">
      {/* My rank banner */}
      {myRank?.rank && (
        <View className="bg-green-600 px-4 py-4 flex-row items-center justify-between">
          <View>
            <Text className="text-green-100 text-sm">Your rank</Text>
            <Text className="text-white text-3xl font-bold">#{myRank.rank}</Text>
          </View>
          <View className="items-end">
            <Text className="text-green-100 text-sm">ELO Rating</Text>
            <Text className="text-white text-2xl font-bold">{myRank.elo_rating}</Text>
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
            className="bg-white rounded-xl border border-gray-200 p-4 mb-2 flex-row items-center gap-4"
          >
            <Text
              className={`text-xl font-bold w-10 text-center ${
                index === 0
                  ? "text-yellow-500"
                  : index === 1
                  ? "text-gray-400"
                  : index === 2
                  ? "text-amber-600"
                  : "text-gray-500"
              }`}
            >
              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${player.rank}`}
            </Text>

            <View className="w-11 h-11 bg-green-100 rounded-full items-center justify-center">
              <Text className="text-green-700 font-bold text-lg">
                {player.full_name[0]}
              </Text>
            </View>

            <View className="flex-1 min-w-0">
              <Text className="font-semibold text-gray-900" numberOfLines={1}>
                {player.full_name}
                {player.elo_provisional ? (
                  <Text className="text-gray-400 font-normal">*</Text>
                ) : null}
              </Text>
              <Text className="text-sm text-gray-500">
                {player.matches_won}W – {player.matches_lost}L
                {player.city ? ` · ${player.city}` : ""}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-lg font-bold text-gray-900">{player.elo_rating}</Text>
              <Text className="text-xs text-gray-400">ELO</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            {isFetching ? (
              <Text className="text-gray-500">Loading rankings...</Text>
            ) : (
              <>
                <Text className="text-5xl mb-4">🏆</Text>
                <Text className="font-semibold text-gray-900">No rankings yet</Text>
                <Text className="text-sm text-gray-500 mt-1">
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

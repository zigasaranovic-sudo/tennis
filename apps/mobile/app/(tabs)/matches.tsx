import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";

type Tab = "upcoming" | "requests" | "history";

export default function MatchesScreen() {
  const [tab, setTab] = useState<Tab>("upcoming");

  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: upcoming } = trpc.match.getMyMatches.useQuery({ status: "accepted", limit: 20 });
  const { data: pendingConf } = trpc.match.getMyMatches.useQuery({ status: "pending_confirmation", limit: 10 });
  const { data: requests } = trpc.match.getRequests.useQuery({ type: "all", status: "pending", limit: 20 });
  const { data: history } = trpc.match.getMyMatches.useQuery({ status: "completed", limit: 30 });

  const respondToRequest = trpc.match.respondToRequest.useMutation();

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "upcoming", label: "Upcoming", count: (upcoming?.length ?? 0) + (pendingConf?.length ?? 0) },
    { key: "requests", label: "Requests", count: requests?.filter((r) => r.recipient_id === profile?.id).length },
    { key: "history", label: "History" },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tab bar */}
      <View className="flex-row bg-white border-b border-gray-200 px-4">
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            className={`flex-1 py-3 items-center border-b-2 ${
              tab === t.key ? "border-green-600" : "border-transparent"
            }`}
          >
            <View className="flex-row items-center gap-1">
              <Text
                className={`text-sm font-medium ${
                  tab === t.key ? "text-green-600" : "text-gray-500"
                }`}
              >
                {t.label}
              </Text>
              {t.count ? (
                <View className="bg-green-600 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{t.count}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming tab */}
      {tab === "upcoming" && (
        <FlatList
          data={[...(pendingConf ?? []), ...(upcoming ?? [])]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: match }) => {
            const isPendingConf = match.status === "pending_confirmation";
            const opponent =
              (match.player1 as { id?: string })?.id === profile?.id
                ? match.player2
                : match.player1;
            return (
              <TouchableOpacity
                onPress={() => router.push(`/matches/${match.id}`)}
                className={`rounded-2xl border p-4 mb-3 ${
                  isPendingConf
                    ? "bg-orange-50 border-orange-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-3xl">🎾</Text>
                    <View className="flex-1 min-w-0">
                      <Text className="font-semibold text-gray-900" numberOfLines={1}>
                        vs {(opponent as { full_name?: string })?.full_name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {match.scheduled_at
                          ? new Date(match.scheduled_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          : "TBD"}
                        {match.location_city ? ` · ${match.location_city}` : ""}
                      </Text>
                      {isPendingConf && (
                        <Text className="text-xs text-orange-600 font-medium mt-0.5">
                          Result awaiting confirmation
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text className="text-gray-400">›</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-5xl mb-4">🎾</Text>
              <Text className="font-semibold text-gray-900">No upcoming matches</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/search")}
                className="mt-4 px-5 py-2.5 bg-green-600 rounded-xl"
              >
                <Text className="text-white font-semibold text-sm">Find a player</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Requests tab */}
      {tab === "requests" && (
        <FlatList
          data={requests ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: req }) => {
            const isIncoming = req.recipient_id === profile?.id;
            const other = isIncoming ? req.requester : req.recipient;
            return (
              <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
                      <Text className="font-bold text-gray-600 text-xl">
                        {(other as { full_name?: string })?.full_name?.[0] ?? "?"}
                      </Text>
                    </View>
                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-center gap-2 mb-0.5">
                        <View className={`px-2 py-0.5 rounded-full ${isIncoming ? "bg-blue-100" : "bg-gray-100"}`}>
                          <Text className={`text-xs font-medium ${isIncoming ? "text-blue-700" : "text-gray-600"}`}>
                            {isIncoming ? "Incoming" : "Sent"}
                          </Text>
                        </View>
                      </View>
                      <Text className="font-semibold text-gray-900" numberOfLines={1}>
                        {(other as { full_name?: string })?.full_name}
                      </Text>
                      <Text className="text-sm text-gray-500">
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
                {isIncoming && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => respondToRequest.mutate({ request_id: req.id, response: "declined" })}
                      className="flex-1 py-2.5 border border-gray-300 rounded-xl items-center"
                    >
                      <Text className="text-gray-600 font-medium text-sm">Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => respondToRequest.mutate({ request_id: req.id, response: "accepted" })}
                      className="flex-1 py-2.5 bg-green-600 rounded-xl items-center"
                    >
                      <Text className="text-white font-medium text-sm">Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-5xl mb-4">📬</Text>
              <Text className="font-semibold text-gray-900">No pending requests</Text>
            </View>
          }
        />
      )}

      {/* History tab */}
      {tab === "history" && (
        <FlatList
          data={history ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: match }) => {
            const isP1 = (match.player1 as { id?: string })?.id === profile?.id;
            const opponent = isP1 ? match.player2 : match.player1;
            const won = match.winner_id === profile?.id;
            const delta = isP1 ? match.player1_elo_delta : match.player2_elo_delta;
            return (
              <TouchableOpacity
                onPress={() => router.push(`/matches/${match.id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-4 mb-2 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className={`px-3 py-1.5 rounded-lg ${won ? "bg-green-100" : "bg-red-100"}`}>
                    <Text className={`text-sm font-bold ${won ? "text-green-700" : "text-red-700"}`}>
                      {won ? "WIN" : "LOSS"}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-semibold text-gray-900" numberOfLines={1}>
                      vs {(opponent as { full_name?: string })?.full_name}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {match.played_at ? new Date(match.played_at).toLocaleDateString() : ""}
                    </Text>
                  </View>
                </View>
                {delta !== null && delta !== undefined && (
                  <Text className={`font-bold text-sm ${delta > 0 ? "text-green-600" : "text-red-500"}`}>
                    {delta > 0 ? "+" : ""}{delta}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-5xl mb-4">📊</Text>
              <Text className="font-semibold text-gray-900">No match history yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";

type Tab = "upcoming" | "requests" | "history";

type SetScore = { p1: number; p2: number };

type MatchWithScore = {
  id: string;
  status: string;
  winner_id?: string | null;
  played_at?: string | null;
  scheduled_at?: string | null;
  location_city?: string | null;
  format?: string | null;
  score_detail?: SetScore[] | null;
  player1?: unknown;
  player2?: unknown;
  [key: string]: unknown;
};

function formatScore(sets: SetScore[], isP1: boolean): string {
  return sets.map((s) => (isP1 ? `${s.p1}-${s.p2}` : `${s.p2}-${s.p1}`)).join(", ");
}

function formatLabel(format: string | null | undefined): string {
  if (!format) return "";
  return format
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MatchesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const divider = isDark ? "#334155" : "#e5e7eb";

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
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Tab bar */}
      <View style={{ backgroundColor: cardBg, borderBottomColor: divider, borderBottomWidth: 1 }} className="flex-row px-4">
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
                style={{ color: tab === t.key ? "#16a34a" : textSecondary }}
                className="text-sm font-medium"
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
                style={
                  isPendingConf
                    ? { backgroundColor: "#fff7ed", borderColor: "#fed7aa", borderWidth: 1 }
                    : { backgroundColor: cardBg, borderColor: border, borderWidth: 1 }
                }
                className="rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-3xl">🎾</Text>
                    <View className="flex-1 min-w-0">
                      <Text style={{ color: textPrimary }} className="font-semibold" numberOfLines={1}>
                        vs {(opponent as { full_name?: string })?.full_name}
                      </Text>
                      <Text style={{ color: textSecondary }} className="text-sm">
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
                  <Text style={{ color: textSecondary }}>›</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-5xl mb-4">🎾</Text>
              <Text style={{ color: textPrimary }} className="font-semibold">No upcoming matches</Text>
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
              <View style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }} className="rounded-2xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View style={{ backgroundColor: isDark ? "#334155" : "#f3f4f6" }} className="w-12 h-12 rounded-full items-center justify-center">
                      <Text style={{ color: textSecondary }} className="font-bold text-xl">
                        {(other as { full_name?: string })?.full_name?.[0] ?? "?"}
                      </Text>
                    </View>
                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-center gap-2 mb-0.5">
                        <View className={`px-2 py-0.5 rounded-full ${isIncoming ? "bg-blue-100" : (isDark ? "bg-slate-700" : "bg-gray-100")}`}>
                          <Text className={`text-xs font-medium ${isIncoming ? "text-blue-700" : ""}`} style={!isIncoming ? { color: textSecondary } : undefined}>
                            {isIncoming ? "Incoming" : "Sent"}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: textPrimary }} className="font-semibold" numberOfLines={1}>
                        {(other as { full_name?: string })?.full_name}
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
                {isIncoming && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => respondToRequest.mutate({ request_id: req.id, response: "declined" })}
                      style={{ borderColor: border }}
                      className="flex-1 py-2.5 border rounded-xl items-center"
                    >
                      <Text style={{ color: textSecondary }} className="font-medium text-sm">Decline</Text>
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
              <Text style={{ color: textPrimary }} className="font-semibold">No pending requests</Text>
            </View>
          }
        />
      )}

      {/* History tab */}
      {tab === "history" && (
        <FlatList
          data={(history ?? []) as unknown as MatchWithScore[]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: match }) => {
            const isP1 = (match.player1 as { id?: string })?.id === profile?.id;
            const opponent = isP1 ? match.player2 : match.player1;
            const won = match.winner_id === profile?.id;
            const sets = match.score_detail ?? [];
            const scoreStr = sets.length > 0 ? formatScore(sets, isP1) : null;
            const fmtLabel = formatLabel(match.format);
            return (
              <TouchableOpacity
                onPress={() => router.push(`/matches/${match.id}`)}
                style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
                className="rounded-2xl p-4 mb-2 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className={`px-3 py-1.5 rounded-lg ${won ? "bg-green-100" : "bg-red-100"}`}>
                    <Text className={`text-sm font-bold ${won ? "text-green-700" : "text-red-700"}`}>
                      {won ? "WIN" : "LOSS"}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text style={{ color: textPrimary }} className="font-semibold" numberOfLines={1}>
                      vs {(opponent as { full_name?: string })?.full_name}
                    </Text>
                    {scoreStr ? (
                      <Text style={{ color: textPrimary, fontVariant: ["tabular-nums"] }} className="text-sm font-mono">
                        {scoreStr}
                      </Text>
                    ) : null}
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Text style={{ color: isDark ? "#64748b" : "#9ca3af" }} className="text-xs">
                        {match.played_at ? new Date(match.played_at).toLocaleDateString() : ""}
                      </Text>
                      {fmtLabel ? (
                        <View style={{ backgroundColor: isDark ? "#334155" : "#f3f4f6" }} className="px-1.5 py-0.5 rounded">
                          <Text style={{ color: isDark ? "#94a3b8" : "#6b7280" }} className="text-xs">
                            {fmtLabel}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-5xl mb-4">📊</Text>
              <Text style={{ color: textPrimary }} className="font-semibold">No match history yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

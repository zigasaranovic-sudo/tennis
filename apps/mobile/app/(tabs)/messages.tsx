import { FlatList, Text, View, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";

export default function MessagesTab() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data: conversations, isLoading } = trpc.messaging.getConversations.useQuery();

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <ActivityIndicator color="#16a34a" />
      </View>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg, padding: 24 }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
        <Text style={{ fontSize: 16, fontWeight: "600", color: textPrimary, marginBottom: 4 }}>No conversations yet</Text>
        <Text style={{ fontSize: 14, color: textSecondary, textAlign: "center" }}>
          Message a player from their profile to start chatting
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: border, marginLeft: 72 }} />}
        renderItem={({ item }) => {
          const player = item.other_player as { id: string; full_name: string; username: string; avatar_url: string | null } | undefined;
          const initials = player?.full_name?.[0]?.toUpperCase() ?? "?";
          const timeStr = item.last_message_at
            ? new Date(item.last_message_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "";

          return (
            <TouchableOpacity
              onPress={() => router.push(`/messages/${item.id}` as never)}
              style={{ flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: cardBg }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: "#dcfce7",
                alignItems: "center", justifyContent: "center", marginRight: 12
              }}>
                <Text style={{ color: "#16a34a", fontWeight: "700", fontSize: 16 }}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", fontSize: 15, color: textPrimary }}>{player?.full_name ?? "Player"}</Text>
                <Text style={{ fontSize: 12, color: textSecondary }}>@{player?.username ?? ""}</Text>
              </View>
              {timeStr ? (
                <Text style={{ fontSize: 11, color: textSecondary }}>{timeStr}</Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
        style={{ backgroundColor: bg }}
      />
    </View>
  );
}

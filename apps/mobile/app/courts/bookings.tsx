import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, useColorScheme } from "react-native";
import { trpc } from "@/lib/trpc";

export default function MyBookingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { data: bookings, isLoading, refetch } = trpc.courts.getMyBookings.useQuery({ upcoming: tab === "upcoming" });
  const cancelBooking = trpc.courts.cancelBooking.useMutation({ onSuccess: () => refetch() });

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const tabActiveBg = isDark ? "#1e293b" : "#ffffff";
  const tabInactiveBg = isDark ? "#0f172a" : "#f9fafb";
  const tabContainerBg = isDark ? "#1e293b" : "#f3f4f6";

  const handleCancel = (bookingId: string) => {
    Alert.alert("Cancel booking?", "This cannot be undone.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel booking",
        style: "destructive",
        onPress: () => cancelBooking.mutate({ booking_id: bookingId }),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Tabs */}
      <View style={{ flexDirection: "row", margin: 16, backgroundColor: tabContainerBg, borderRadius: 10, padding: 4 }}>
        {(["upcoming", "past"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: "center",
              backgroundColor: tab === t ? tabActiveBg : tabInactiveBg,
              shadowColor: tab === t ? "#000" : "transparent",
              shadowOpacity: tab === t ? 0.08 : 0,
              shadowRadius: 2,
              elevation: tab === t ? 1 : 0,
            }}
          >
            <Text style={{ fontWeight: tab === t ? "600" : "400", color: tab === t ? textPrimary : textSecondary, textTransform: "capitalize" }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#16a34a" />
        </View>
      ) : !bookings || bookings.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>📅</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: textPrimary, marginBottom: 4 }}>
            No {tab} bookings
          </Text>
          <Text style={{ fontSize: 14, color: textSecondary, textAlign: "center" }}>
            {tab === "upcoming" ? "Browse courts to book a session" : "Your completed bookings will appear here"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const starts = new Date(item.starts_at);
            const ends = new Date(item.ends_at);
            const dateStr = starts.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            const timeStr = `${starts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${ends.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
            const durationH = (ends.getTime() - starts.getTime()) / 3_600_000;
            const court = item.court as { name?: string; venue?: { name?: string; city?: string } } | null;

            return (
              <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: border, padding: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: textPrimary }}>{court?.name ?? "Court"}</Text>
                <Text style={{ fontSize: 13, color: textSecondary, marginTop: 2 }}>
                  {court?.venue?.name ?? ""} · {court?.venue?.city ?? ""}
                </Text>
                <Text style={{ fontSize: 13, color: textSecondary, marginTop: 6 }}>📅 {dateStr}</Text>
                <Text style={{ fontSize: 13, color: textSecondary }}>🕐 {timeStr} ({durationH}h)</Text>
                {item.notes ? <Text style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>📝 {item.notes}</Text> : null}

                {tab === "upcoming" && (
                  <TouchableOpacity
                    onPress={() => handleCancel(item.id)}
                    disabled={cancelBooking.isPending}
                    style={{
                      marginTop: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#fca5a5",
                      backgroundColor: isDark ? "#450a0a" : "#fff1f2",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#dc2626", fontWeight: "600", fontSize: 13 }}>Cancel booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

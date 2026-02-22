import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";

const SURFACE_COLORS: Record<string, { bg: string; text: string }> = {
  clay: { bg: "#fed7aa", text: "#9a3412" },
  hard: { bg: "#bfdbfe", text: "#1e40af" },
  grass: { bg: "#bbf7d0", text: "#166534" },
  carpet: { bg: "#e9d5ff", text: "#6b21a8" },
};

export default function VenueScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: venue, isLoading } = trpc.courts.getVenue.useQuery({ id: venueId });

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const divider = isDark ? "#334155" : "#f3f4f6";

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <ActivityIndicator color="#16a34a" />
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <Text style={{ color: textSecondary }}>Venue not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Venue header */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: border, padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: textPrimary, marginBottom: 4 }}>{venue.name}</Text>
        <Text style={{ fontSize: 14, color: textSecondary, marginBottom: 12 }}>📍 {venue.address ?? venue.city}</Text>

        <View style={{ gap: 6 }}>
          {venue.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${venue.phone}`)}>
              <Text style={{ fontSize: 14, color: "#16a34a" }}>📞 {venue.phone}</Text>
            </TouchableOpacity>
          )}
          {venue.website && (
            <TouchableOpacity onPress={() => Linking.openURL(venue.website!)}>
              <Text style={{ fontSize: 14, color: "#16a34a" }}>🌐 Website</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Surfaces */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {(venue.surfaces ?? []).map((s: string) => {
            const colors = SURFACE_COLORS[s] ?? { bg: "#f3f4f6", text: "#374151" };
            return (
              <View key={s} style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text, textTransform: "capitalize" }}>{s}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Courts list */}
      <Text style={{ fontSize: 16, fontWeight: "700", color: textPrimary }}>Courts</Text>

      {venue.courts.length === 0 ? (
        <Text style={{ color: textSecondary, textAlign: "center", paddingVertical: 20 }}>No courts listed</Text>
      ) : (
        venue.courts.map((court, idx) => {
          const surfaceColors = SURFACE_COLORS[court.surface] ?? { bg: "#f3f4f6", text: "#374151" };
          const isLast = idx === venue.courts.length - 1;
          return (
            <TouchableOpacity
              key={court.id}
              onPress={() => router.push(`/courts/${venueId}/${court.id}` as never)}
              style={{
                backgroundColor: cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: border,
                padding: 14,
                marginBottom: isLast ? 0 : 0,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: textPrimary, marginBottom: 4 }}>{court.name}</Text>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <View style={{ backgroundColor: surfaceColors.bg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontSize: 11, fontWeight: "600", color: surfaceColors.text, textTransform: "capitalize" }}>{court.surface}</Text>
                    </View>
                    <View style={{ backgroundColor: isDark ? "#334155" : "#f3f4f6", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontSize: 11, color: textSecondary }}>{court.is_indoor ? "Indoor" : "Outdoor"}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  {court.price_per_hour != null ? (
                    <Text style={{ fontSize: 15, fontWeight: "700", color: textPrimary }}>
                      €{(court.price_per_hour / 100).toFixed(0)}/hr
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: textSecondary }}>Contact</Text>
                  )}
                  <Text style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>Book →</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

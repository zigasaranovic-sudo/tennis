import { useState } from "react";
import { FlatList, Text, View, TouchableOpacity, TextInput, ActivityIndicator, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";

const SURFACE_COLORS: Record<string, { bg: string; text: string }> = {
  clay: { bg: "#fed7aa", text: "#9a3412" },
  hard: { bg: "#bfdbfe", text: "#1e40af" },
  grass: { bg: "#bbf7d0", text: "#166534" },
  carpet: { bg: "#e9d5ff", text: "#6b21a8" },
};

export default function CourtsTab() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [cityFilter, setCityFilter] = useState("");

  const { data: venues, isLoading } = trpc.courts.getVenues.useQuery(
    { city: cityFilter || undefined },
    { enabled: true }
  );

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#1e293b" : "#ffffff";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const placeholder = isDark ? "#64748b" : "#9ca3af";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* City filter */}
      <View style={{ padding: 16, backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: border }}>
        <TextInput
          value={cityFilter}
          onChangeText={setCityFilter}
          placeholder="Filter by city..."
          placeholderTextColor={placeholder}
          style={{
            backgroundColor: inputBg,
            borderWidth: 1,
            borderColor: border,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontSize: 15,
            color: inputText,
          }}
        />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#16a34a" />
        </View>
      ) : !venues || venues.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>🏟️</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: textPrimary, marginBottom: 4 }}>No venues found</Text>
          <Text style={{ fontSize: 14, color: textSecondary }}>Try a different city</Text>
        </View>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/courts/${item.id}` as never)}
              style={{
                backgroundColor: cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: border,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: textPrimary, marginBottom: 2 }}>{item.name}</Text>
              <Text style={{ fontSize: 13, color: textSecondary, marginBottom: 10 }}>📍 {item.city}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {(item.surfaces ?? []).map((s: string) => {
                  const colors = SURFACE_COLORS[s] ?? { bg: "#f3f4f6", text: "#374151" };
                  return (
                    <View key={s} style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                      <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text, textTransform: "capitalize" }}>{s}</Text>
                    </View>
                  );
                })}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

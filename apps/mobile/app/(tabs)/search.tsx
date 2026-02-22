import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import type { SkillLevel } from "@tenis/types";

const SKILL_OPTIONS: { value: SkillLevel | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Pro" },
];

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#1e293b" : "#ffffff";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const placeholder = isDark ? "#64748b" : "#9ca3af";
  const chipBg = isDark ? "#334155" : "#f3f4f6";
  const chipBorder = isDark ? "#475569" : "#e5e7eb";
  const chipText = isDark ? "#94a3b8" : "#4b5563";

  const [skill, setSkill] = useState<SkillLevel | "">("");
  const [city, setCity] = useState("");

  const { data, isFetching, fetchNextPage, hasNextPage } =
    trpc.player.searchPlayers.useInfiniteQuery(
      {
        skill_level: skill || undefined,
        city: city || undefined,
        limit: 20,
      },
      {
        getNextPageParam: (page) => page.nextCursor,
        initialCursor: undefined,
      }
    );

  const players = data?.pages.flatMap((p) => p.players) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Search inputs */}
      <View style={{ backgroundColor: cardBg, borderBottomColor: border, borderBottomWidth: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="Search by city..."
          style={{
            width: "100%",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: inputBg,
            borderRadius: 12,
            fontSize: 16,
            color: inputText,
            borderColor: border,
            borderWidth: 1,
          }}
          placeholderTextColor={placeholder}
        />

        {/* Skill filter chips */}
        <View className="flex-row gap-2 mt-3 flex-wrap">
          {SKILL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSkill(opt.value)}
              style={
                skill === opt.value
                  ? { backgroundColor: "#16a34a", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }
                  : { backgroundColor: chipBg, borderColor: chipBorder, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }
              }
            >
              <Text
                style={
                  skill === opt.value
                    ? { color: "#ffffff", fontSize: 14, fontWeight: "500" }
                    : { color: chipText, fontSize: 14, fontWeight: "500" }
                }
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Player list */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item: player }) => (
          <TouchableOpacity
            onPress={() => router.push(`/players/${player.id}`)}
            style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
            className="rounded-2xl p-4 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center">
                <Text className="text-green-700 font-bold text-2xl">
                  {player.full_name[0]}
                </Text>
              </View>
              <View className="flex-1 min-w-0">
                <Text style={{ color: textPrimary }} className="font-semibold" numberOfLines={1}>
                  {player.full_name}
                </Text>
                <Text style={{ color: textSecondary }} className="text-sm">@{player.username}</Text>
                {player.city && (
                  <Text style={{ color: isDark ? "#64748b" : "#9ca3af" }} className="text-xs mt-0.5">📍 {player.city}</Text>
                )}
              </View>
            </View>
            <View className="items-end ml-2">
              <Text style={{ color: textPrimary }} className="text-xl font-bold">
                {player.elo_rating}
                {player.elo_provisional && (
                  <Text style={{ color: isDark ? "#64748b" : "#9ca3af" }} className="text-sm font-normal">*</Text>
                )}
              </Text>
              <Text style={{ color: isDark ? "#64748b" : "#9ca3af" }} className="text-xs">ELO</Text>
              <View style={{ backgroundColor: chipBg }} className="rounded-lg px-2 py-0.5 mt-1">
                <Text style={{ color: chipText }} className="text-xs capitalize">
                  {player.skill_level}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isFetching ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <View className="items-center py-16">
              <Text className="text-5xl mb-4">🔍</Text>
              <Text style={{ color: textPrimary }} className="font-semibold">No players found</Text>
              <Text style={{ color: textSecondary }} className="text-sm mt-1">Try different filters</Text>
            </View>
          )
        }
        onEndReached={() => {
          if (hasNextPage && !isFetching) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
}

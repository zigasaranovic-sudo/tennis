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

  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [skill, setSkill] = useState<SkillLevel | "">("");

  const { data, isFetching } = trpc.player.searchPlayers.useQuery({
    name: name.length >= 3 ? name : undefined,
    club: club.length >= 2 ? club : undefined,
    skill_level: skill || undefined,
    limit: 50,
  });

  const players = data?.players ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Search inputs */}
      <View
        style={{
          backgroundColor: cardBg,
          borderBottomColor: border,
          borderBottomWidth: 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 10,
        }}
      >
        {/* Name search */}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Search by name (min. 3 letters)…"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: inputBg,
            borderRadius: 12,
            fontSize: 15,
            color: inputText,
            borderColor: border,
            borderWidth: 1,
          }}
          placeholderTextColor={placeholder}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {/* Club search */}
        <TextInput
          value={club}
          onChangeText={setClub}
          placeholder="Filter by club…"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: inputBg,
            borderRadius: 12,
            fontSize: 14,
            color: inputText,
            borderColor: border,
            borderWidth: 1,
          }}
          placeholderTextColor={placeholder}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {/* Skill filter chips */}
        <View className="flex-row gap-2 flex-wrap">
          {SKILL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSkill(opt.value)}
              style={
                skill === opt.value
                  ? { backgroundColor: "#16a34a", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }
                  : { backgroundColor: chipBg, borderColor: chipBorder, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }
              }
            >
              <Text
                style={
                  skill === opt.value
                    ? { color: "#ffffff", fontSize: 13, fontWeight: "500" }
                    : { color: chipText, fontSize: 13, fontWeight: "500" }
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
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: player }) => (
          <TouchableOpacity
            onPress={() => router.push(`/players/${player.id}`)}
            style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
            className="rounded-2xl px-4 py-3 mb-2 flex-row items-center gap-3"
          >
            {/* Avatar */}
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center shrink-0">
              <Text className="text-green-700 font-bold text-base">
                {player.full_name[0]}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1 min-w-0">
              <Text style={{ color: textPrimary }} className="font-semibold text-sm" numberOfLines={1}>
                {player.full_name}
              </Text>
              <Text style={{ color: textSecondary }} className="text-xs" numberOfLines={1}>
                {(player as { home_club?: string | null }).home_club
                  ? `🎾 ${(player as { home_club?: string | null }).home_club}`
                  : player.city
                  ? `📍 ${player.city}`
                  : `@${player.username}`}
              </Text>
            </View>

            {/* Skill badge */}
            {player.skill_level && (
              <View style={{ backgroundColor: chipBg }} className="rounded-full px-2.5 py-1 shrink-0">
                <Text style={{ color: chipText }} className="text-xs capitalize">
                  {player.skill_level}
                </Text>
              </View>
            )}
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
              <Text style={{ color: textSecondary }} className="text-sm mt-1 text-center px-8">
                {name.length > 0 && name.length < 3
                  ? "Keep typing — search starts at 3 letters"
                  : "Try a different name or club"}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

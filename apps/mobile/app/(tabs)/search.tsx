import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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
    <View className="flex-1 bg-gray-50">
      {/* Search inputs */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="Search by city..."
          className="w-full px-4 py-3 bg-gray-100 rounded-xl text-base text-gray-900"
          placeholderTextColor="#9ca3af"
        />

        {/* Skill filter chips */}
        <View className="flex-row gap-2 mt-3 flex-wrap">
          {SKILL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSkill(opt.value)}
              className={`px-3 py-1.5 rounded-full ${
                skill === opt.value
                  ? "bg-green-600"
                  : "bg-gray-100 border border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  skill === opt.value ? "text-white" : "text-gray-600"
                }`}
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
            className="bg-white rounded-2xl border border-gray-200 p-4 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center">
                <Text className="text-green-700 font-bold text-2xl">
                  {player.full_name[0]}
                </Text>
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-semibold text-gray-900" numberOfLines={1}>
                  {player.full_name}
                </Text>
                <Text className="text-sm text-gray-500">@{player.username}</Text>
                {player.city && (
                  <Text className="text-xs text-gray-400 mt-0.5">📍 {player.city}</Text>
                )}
              </View>
            </View>
            <View className="items-end ml-2">
              <Text className="text-xl font-bold text-gray-900">
                {player.elo_rating}
                {player.elo_provisional && (
                  <Text className="text-sm text-gray-400 font-normal">*</Text>
                )}
              </Text>
              <Text className="text-xs text-gray-400">ELO</Text>
              <View className="bg-gray-100 rounded-lg px-2 py-0.5 mt-1">
                <Text className="text-xs text-gray-600 capitalize">
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
              <Text className="font-semibold text-gray-900">No players found</Text>
              <Text className="text-sm text-gray-500 mt-1">Try different filters</Text>
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

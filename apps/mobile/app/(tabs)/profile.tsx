import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProfileScreen() {
  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();
  const { data: eloHistory } = trpc.player.getEloHistory.useQuery(
    { player_id: profile?.id ?? "" },
    { enabled: !!profile?.id }
  );
  const { data: availability } = trpc.player.getAvailability.useQuery(
    { player_id: profile?.id ?? "" },
    { enabled: !!profile?.id }
  );

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  if (!profile) return null;

  const winRate =
    profile.matches_played > 0
      ? Math.round((profile.matches_won / profile.matches_played) * 100)
      : 0;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Profile header */}
      <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <View className="flex-row items-center gap-4 mb-4">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
            <Text className="text-green-700 font-bold text-4xl">
              {profile.full_name[0]}
            </Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-xl font-bold text-gray-900">{profile.full_name}</Text>
            <Text className="text-gray-500">@{profile.username}</Text>
            {profile.city && (
              <Text className="text-sm text-gray-400 mt-0.5">📍 {profile.city}</Text>
            )}
          </View>
        </View>

        {profile.bio ? <Text className="text-gray-600 text-sm mb-4">{profile.bio}</Text> : null}

        {/* Stats */}
        <View className="flex-row border-t border-gray-100 pt-4 gap-2">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">
              {profile.elo_rating}
              {profile.elo_provisional && (
                <Text className="text-sm text-gray-400">*</Text>
              )}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">ELO</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">
              {myRank?.rank ? `#${myRank.rank}` : "–"}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">Rank</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">{profile.matches_played}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Matches</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">{winRate}%</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Win Rate</Text>
          </View>
        </View>
      </View>

      {/* ELO Progress bar chart */}
      {eloHistory && eloHistory.length > 1 && (
        <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">ELO Progress</Text>
          <View className="h-20 flex-row items-end gap-0.5">
            {eloHistory.slice(-20).map((point, i) => {
              const values = eloHistory.slice(-20).map((p) => p.elo_after);
              const min = Math.min(...values);
              const max = Math.max(...values);
              const range = max - min || 1;
              const heightPct = ((point.elo_after - min) / range) * 100;
              return (
                <View
                  key={i}
                  className={`flex-1 rounded-t ${point.elo_delta > 0 ? "bg-green-400" : "bg-red-400"}`}
                  style={{ height: `${Math.max(heightPct, 5)}%` }}
                />
              );
            })}
          </View>
          {profile.elo_provisional && (
            <Text className="text-xs text-gray-400 mt-2">
              * Provisional — {Math.max(0, 10 - profile.matches_played)} more matches to establish rating
            </Text>
          )}
        </View>
      )}

      {/* Availability */}
      {availability && availability.length > 0 && (
        <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">Availability</Text>
          {availability.map((slot) => (
            <View key={slot.id} className="flex-row items-center gap-3 mb-2">
              <View className="w-12 bg-green-100 rounded-lg py-1 items-center">
                <Text className="text-xs font-semibold text-green-700">
                  {DAY_NAMES[slot.day_of_week]}
                </Text>
              </View>
              <Text className="text-sm text-gray-600">
                {slot.start_time} – {slot.end_time}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View className="space-y-3">
        <TouchableOpacity
          onPress={() => Alert.alert("Coming soon", "Profile editing will be available shortly")}
          className="bg-white rounded-2xl border border-gray-200 p-4 flex-row items-center justify-between"
        >
          <Text className="font-medium text-gray-900">Edit Profile</Text>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-white rounded-2xl border border-red-100 p-4 items-center mt-2"
        >
          <Text className="font-medium text-red-500">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

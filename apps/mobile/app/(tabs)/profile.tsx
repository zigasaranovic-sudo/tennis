import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const divider = isDark ? "#334155" : "#f3f4f6";

  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();

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
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Profile header */}
      <View style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }} className="rounded-2xl p-5 mb-4">
        <View className="flex-row items-center gap-4 mb-4">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
            <Text className="text-green-700 font-bold text-4xl">
              {profile.full_name[0]}
            </Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text style={{ color: textPrimary }} className="text-xl font-bold">{profile.full_name}</Text>
            <Text style={{ color: textSecondary }}>@{profile.username}</Text>
            {profile.city && (
              <Text style={{ color: isDark ? "#64748b" : "#9ca3af" }} className="text-sm mt-0.5">📍 {profile.city}</Text>
            )}
          </View>
        </View>

        {profile.bio ? <Text style={{ color: textSecondary }} className="text-sm mb-4">{profile.bio}</Text> : null}

        {/* Stats */}
        <View style={{ borderTopColor: divider, borderTopWidth: 1 }} className="flex-row pt-4 gap-2">

          <View className="flex-1 items-center">
            <Text style={{ color: textPrimary }} className="text-2xl font-bold">
              {myRank?.rank ? `#${myRank.rank}` : "–"}
            </Text>
            <Text style={{ color: textSecondary }} className="text-xs mt-0.5">Rank</Text>
          </View>
          <View className="flex-1 items-center">
            <Text style={{ color: textPrimary }} className="text-2xl font-bold">{profile.matches_played}</Text>
            <Text style={{ color: textSecondary }} className="text-xs mt-0.5">Matches</Text>
          </View>
          <View className="flex-1 items-center">
            <Text style={{ color: textPrimary }} className="text-2xl font-bold">{winRate}%</Text>
            <Text style={{ color: textSecondary }} className="text-xs mt-0.5">Win Rate</Text>
          </View>
        </View>
      </View>


        </View>
      )}

      {/* Availability */}
      {availability && availability.length > 0 && (
        <View style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }} className="rounded-2xl p-5 mb-4">
          <Text style={{ color: textPrimary }} className="text-base font-semibold mb-3">Availability</Text>
          {availability.map((slot) => (
            <View key={slot.id} className="flex-row items-center gap-3 mb-2">
              <View className="w-12 bg-green-100 rounded-lg py-1 items-center">
                <Text className="text-xs font-semibold text-green-700">
                  {DAY_NAMES[slot.day_of_week]}
                </Text>
              </View>
              <Text style={{ color: textSecondary }} className="text-sm">
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
          style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
          className="rounded-2xl p-4 flex-row items-center justify-between"
        >
          <Text style={{ color: textPrimary }} className="font-medium">Edit Profile</Text>
          <Text style={{ color: textSecondary }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          style={{ backgroundColor: cardBg, borderColor: isDark ? "#7f1d1d" : "#fee2e2", borderWidth: 1 }}
          className="rounded-2xl p-4 items-center mt-2"
        >
          <Text className="font-medium text-red-500">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

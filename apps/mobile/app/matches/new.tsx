import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const FORMATS = [
  { value: "best_of_1", label: "Best of 1 (1 set)" },
  { value: "best_of_3", label: "Best of 3 (up to 3 sets)" },
  { value: "best_of_5", label: "Best of 5 (up to 5 sets)" },
] as const;

type Format = (typeof FORMATS)[number]["value"];

export default function NewMatchScreen() {
  // Pre-fill recipient if navigated from a player profile
  const { recipient_id: prefillId } = useLocalSearchParams<{ recipient_id?: string }>();

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

  const [query, setQuery] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(prefillId ?? null);
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [format, setFormat] = useState<Format>("best_of_3");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const { data: searchResults, isLoading: searching } = trpc.player.searchPlayers.useQuery(
    { city: query.trim() || undefined, limit: 10 },
    { enabled: query.length >= 2 }
  );

  const { data: prefillPlayer } = trpc.player.getPublicProfile.useQuery(
    { id: prefillId! },
    { enabled: !!prefillId && !selectedPlayerName }
  );

  if (prefillPlayer && !selectedPlayerName) {
    setSelectedPlayerName(prefillPlayer.full_name);
  }

  const sendRequest = trpc.match.sendRequest.useMutation({
    onSuccess: () => {
      Alert.alert("Request sent!", "Your match request has been sent.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const handleSend = () => {
    if (!selectedPlayerId) {
      Alert.alert("Select a player", "Please search for and select a player.");
      return;
    }
    sendRequest.mutate({
      recipient_id: selectedPlayerId,
      proposed_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      format,
      location_name: location.trim() || undefined,
      message: message.trim() || undefined,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: textPrimary }} className="text-base font-semibold mb-4">
        Request a Match
      </Text>

      {/* Player picker */}
      <View
        style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
        className="rounded-2xl p-5 mb-4"
      >
        <Text style={{ color: textSecondary }} className="text-sm font-medium mb-3">Opponent</Text>

        {selectedPlayerId ? (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <Text className="text-green-700 font-bold text-lg">
                  {selectedPlayerName[0] ?? "?"}
                </Text>
              </View>
              <Text style={{ color: textPrimary }} className="font-medium">
                {selectedPlayerName}
              </Text>
            </View>
            {!prefillId && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlayerId(null);
                  setSelectedPlayerName("");
                  setQuery("");
                }}
              >
                <Text className="text-sm text-red-400">Change</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Filter by city…"
              style={{
                borderWidth: 1,
                borderColor: border,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: inputBg,
                color: inputText,
              }}
              placeholderTextColor={placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching && (
              <ActivityIndicator size="small" color="#16a34a" className="mt-3" />
            )}
            {searchResults && searchResults.players.length > 0 && (
              <FlatList
                data={searchResults.players}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                className="mt-2"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPlayerId(item.id);
                      setSelectedPlayerName(item.full_name);
                    }}
                    style={{ borderBottomColor: border, borderBottomWidth: 1 }}
                    className="flex-row items-center gap-3 py-3"
                  >
                    <View className="w-9 h-9 bg-green-100 rounded-full items-center justify-center">
                      <Text className="text-green-700 font-bold">
                        {item.full_name[0]}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ color: textPrimary }} className="text-sm font-medium">
                        {item.full_name}
                      </Text>
                      <Text style={{ color: textSecondary }} className="text-xs">
                        @{item.username} · ELO {item.elo_rating}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            {query.length >= 2 && !searching && searchResults?.players.length === 0 && (
              <Text style={{ color: textSecondary }} className="text-sm mt-3 text-center">
                No players found
              </Text>
            )}
          </>
        )}
      </View>

      {/* Format picker */}
      <View
        style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
        className="rounded-2xl p-5 mb-4"
      >
        <Text style={{ color: textSecondary }} className="text-sm font-medium mb-3">
          Match Format
        </Text>
        {FORMATS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFormat(f.value)}
            style={{ borderBottomColor: border, borderBottomWidth: 1 }}
            className="flex-row items-center gap-3 py-3 last:border-0"
          >
            <View
              style={{
                borderColor: format === f.value ? "#16a34a" : border,
              }}
              className={`w-5 h-5 rounded-full border-2 items-center justify-center`}
            >
              {format === f.value && (
                <View className="w-2.5 h-2.5 rounded-full bg-green-600" />
              )}
            </View>
            <Text
              style={{ color: format === f.value ? textPrimary : textSecondary }}
              className={`text-sm ${format === f.value ? "font-medium" : ""}`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Optional fields */}
      <View
        style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
        className="rounded-2xl p-5 mb-4"
      >
        <Text style={{ color: textSecondary }} className="text-sm font-medium mb-3">
          Details (optional)
        </Text>
        <View className="mb-4">
          <Text style={{ color: textSecondary }} className="text-xs mb-1">Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Central Park Courts"
            style={{
              borderWidth: 1,
              borderColor: border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              backgroundColor: inputBg,
              color: inputText,
            }}
            placeholderTextColor={placeholder}
          />
        </View>
        <View>
          <Text style={{ color: textSecondary }} className="text-xs mb-1">Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Add a note to your opponent…"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{
              borderWidth: 1,
              borderColor: border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              minHeight: 80,
              backgroundColor: inputBg,
              color: inputText,
            }}
            placeholderTextColor={placeholder}
          />
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ borderColor: border, borderWidth: 1 }}
          className="flex-1 rounded-2xl py-4 items-center"
        >
          <Text style={{ color: textPrimary }} className="font-semibold">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSend}
          disabled={sendRequest.isPending || !selectedPlayerId}
          style={{ backgroundColor: selectedPlayerId ? "#16a34a" : isDark ? "#334155" : "#e5e7eb" }}
          className="flex-1 rounded-2xl py-4 items-center"
        >
          <Text
            style={{ color: selectedPlayerId ? "#ffffff" : textSecondary }}
            className="font-semibold"
          >
            {sendRequest.isPending ? "Sending…" : "Send Request"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
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

  const showSearch = !selectedPlayerId && !prefillId;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-base font-semibold text-gray-900 mb-4">Request a Match</Text>

      {/* Player picker */}
      <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-3">Opponent</Text>

        {selectedPlayerId ? (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <Text className="text-green-700 font-bold text-lg">
                  {selectedPlayerName[0] ?? "?"}
                </Text>
              </View>
              <Text className="font-medium text-gray-900">{selectedPlayerName}</Text>
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
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
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
                    className="flex-row items-center gap-3 py-3 border-b border-gray-50"
                  >
                    <View className="w-9 h-9 bg-green-100 rounded-full items-center justify-center">
                      <Text className="text-green-700 font-bold">
                        {item.full_name[0]}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm font-medium text-gray-900">
                        {item.full_name}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        @{item.username} · ELO {item.elo_rating}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            {query.length >= 2 && !searching && searchResults?.players.length === 0 && (
              <Text className="text-sm text-gray-400 mt-3 text-center">No players found</Text>
            )}
          </>
        )}
      </View>

      {/* Format picker */}
      <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-3">Match Format</Text>
        {FORMATS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFormat(f.value)}
            className={`flex-row items-center gap-3 py-3 border-b border-gray-50 last:border-0`}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                format === f.value ? "border-green-600" : "border-gray-300"
              }`}
            >
              {format === f.value && (
                <View className="w-2.5 h-2.5 rounded-full bg-green-600" />
              )}
            </View>
            <Text
              className={`text-sm ${format === f.value ? "text-gray-900 font-medium" : "text-gray-600"}`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Optional fields */}
      <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-3">Details (optional)</Text>
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-1">Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Central Park Courts"
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          />
        </View>
        <View>
          <Text className="text-xs text-gray-500 mb-1">Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Add a note to your opponent…"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="border border-gray-300 rounded-lg px-4 py-3 text-base min-h-20"
          />
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 border border-gray-300 rounded-2xl py-4 items-center"
        >
          <Text className="text-gray-700 font-semibold">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSend}
          disabled={sendRequest.isPending || !selectedPlayerId}
          className={`flex-1 rounded-2xl py-4 items-center ${
            selectedPlayerId ? "bg-green-600" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-semibold ${selectedPlayerId ? "text-white" : "text-gray-400"}`}
          >
            {sendRequest.isPending ? "Sending…" : "Send Request"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

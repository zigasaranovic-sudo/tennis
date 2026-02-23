import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { SkillLevel, MatchFormat } from "@tenis/types";

type CreatorProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  skill_level: string | null;
};

type OpenMatchItem = {
  id: string;
  creator_id: string;
  scheduled_at: string;
  location_city: string | null;
  location_name: string | null;
  skill_min: string | null;
  skill_max: string | null;
  format: string;
  message: string | null;
  status: string;
  filled_by: string | null;
  created_at: string;
  creator: CreatorProfile | null;
};

const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  professional: "Professional",
};

const FORMATS: { value: MatchFormat; label: string }[] = [
  { value: "best_of_1", label: "Best of 1" },
  { value: "best_of_3", label: "Best of 3" },
  { value: "best_of_5", label: "Best of 5" },
];

export default function OpenMatchesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#334155" : "#f9fafb";
  const inputBorder = isDark ? "#475569" : "#d1d5db";

  const [showModal, setShowModal] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  // Form state
  const [formDatetime, setFormDatetime] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formFormat, setFormFormat] = useState<MatchFormat>("best_of_3");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");

  const { data: rawMatches, refetch, isLoading } = trpc.openMatch.list.useQuery({ limit: 20 });
  const { data: profile } = trpc.player.getProfile.useQuery();

  const joinMutation = trpc.openMatch.join.useMutation({
    onSuccess: (_, vars) => {
      setJoinedIds((prev) => {
        const next = new Set(prev);
        next.add(vars.open_match_id);
        return next;
      });
      void refetch();
    },
  });

  const createMutation = trpc.openMatch.create.useMutation({
    onSuccess: () => {
      setShowModal(false);
      setFormDatetime("");
      setFormCity("");
      setFormLocation("");
      setFormFormat("best_of_3");
      setFormMessage("");
      setFormError("");
      void refetch();
    },
    onError: (err) => {
      setFormError(err.message);
    },
  });

  const openMatchList = (rawMatches ?? []) as unknown as OpenMatchItem[];

  const handleJoin = (id: string) => {
    setJoiningId(id);
    joinMutation.mutate(
      { open_match_id: id },
      { onSettled: () => setJoiningId(null) }
    );
  };

  const handleCreate = () => {
    setFormError("");
    if (!formDatetime.trim()) {
      setFormError("Date & time is required");
      return;
    }
    const parsedDate = new Date(formDatetime.trim());
    if (isNaN(parsedDate.getTime())) {
      setFormError("Invalid format — use YYYY-MM-DD HH:MM");
      return;
    }
    if (parsedDate <= new Date()) {
      setFormError("Date must be in the future");
      return;
    }
    createMutation.mutate({
      scheduled_at: parsedDate.toISOString(),
      location_city: formCity.trim() || undefined,
      location_name: formLocation.trim() || undefined,
      format: formFormat,
      message: formMessage.trim() || undefined,
    });
  };

  const renderMatch = ({ item: match }: { item: OpenMatchItem }) => {
    const isJoined = joinedIds.has(match.id);
    const isJoining = joiningId === match.id;
    const date = new Date(match.scheduled_at);
    const creator = match.creator;
    const creatorInitial = (
      creator?.full_name?.[0] ?? creator?.username?.[0] ?? "?"
    ).toUpperCase();

    return (
      <View
        style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
        className="rounded-2xl p-4 mb-3 mx-4"
      >
        <View className="flex-row items-start gap-3">
          {/* Avatar */}
          <View
            style={{ backgroundColor: isDark ? "#14532d" : "#dcfce7" }}
            className="w-11 h-11 rounded-full items-center justify-center flex-shrink-0"
          >
            <Text style={{ color: isDark ? "#86efac" : "#15803d" }} className="font-bold text-lg">
              {creatorInitial}
            </Text>
          </View>

          {/* Info */}
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap gap-1.5">
              <Text style={{ color: textPrimary }} className="font-semibold text-sm">
                {creator?.full_name ?? creator?.username ?? "A player"}
              </Text>
              {creator?.skill_level && (
                <View
                  style={{ backgroundColor: isDark ? "#334155" : "#e5e7eb" }}
                  className="px-1.5 py-0.5 rounded-full"
                >
                  <Text style={{ color: textSecondary }} className="text-xs capitalize">
                    {SKILL_LABELS[creator.skill_level as SkillLevel] ?? creator.skill_level}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ color: textSecondary }} className="text-sm mt-1">
              {date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {(match.location_city || match.location_name) && (
              <Text style={{ color: textSecondary }} className="text-xs mt-0.5">
                {"\uD83D\uDCCD"}{" "}
                {[match.location_city, match.location_name].filter(Boolean).join(" \u00B7 ")}
              </Text>
            )}
            <View
              style={{ backgroundColor: isDark ? "#14532d" : "#dcfce7" }}
              className="self-start mt-1.5 px-2 py-0.5 rounded-full"
            >
              <Text style={{ color: isDark ? "#86efac" : "#15803d" }} className="text-xs">
                {FORMATS.find((f) => f.value === match.format)?.label ?? match.format}
              </Text>
            </View>
            {match.message ? (
              <Text style={{ color: textSecondary }} className="text-xs mt-1 italic" numberOfLines={2}>
                &quot;{match.message}&quot;
              </Text>
            ) : null}
          </View>

          {/* Join button */}
          <TouchableOpacity
            onPress={() => handleJoin(match.id)}
            disabled={isJoined || isJoining}
            style={{
              backgroundColor: isJoined ? (isDark ? "#334155" : "#e5e7eb") : "#16a34a",
              opacity: isJoining ? 0.7 : 1,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              flexShrink: 0,
              alignSelf: "flex-start",
            }}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text
                style={{ color: isJoined ? textSecondary : "#ffffff", fontWeight: "600", fontSize: 13 }}
              >
                {isJoined ? "Joined" : "Join"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : openMatchList.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🎾</Text>
          <Text style={{ color: textPrimary, fontWeight: "600", fontSize: 18, textAlign: "center", marginBottom: 8 }}>
            No open matches yet
          </Text>
          <Text style={{ color: textSecondary, fontSize: 14, textAlign: "center", marginBottom: 24 }}>
            Be the first to post a match for others to join!
          </Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#16a34a", borderRadius: 16 }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>Post a match</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={openMatchList}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          backgroundColor: "#16a34a",
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, lineHeight: 34 }}>+</Text>
      </TouchableOpacity>

      {/* Post a match modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: bg }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <Text style={{ color: textPrimary, fontSize: 20, fontWeight: "700" }}>Post a match</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ color: textSecondary, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Date & time */}
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Date &amp; Time *
            </Text>
            <TextInput
              value={formDatetime}
              onChangeText={setFormDatetime}
              placeholder="e.g. 2026-03-15 14:00"
              placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                color: textPrimary,
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            {/* City */}
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              City
            </Text>
            <TextInput
              value={formCity}
              onChangeText={setFormCity}
              placeholder={profile?.city ?? "e.g. Ljubljana"}
              placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                color: textPrimary,
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            {/* Venue */}
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Venue / Court (optional)
            </Text>
            <TextInput
              value={formLocation}
              onChangeText={setFormLocation}
              placeholder="e.g. TC Tivoli, Court 3"
              placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                color: textPrimary,
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            {/* Format picker */}
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Format
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {FORMATS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setFormFormat(f.value)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: formFormat === f.value ? "#16a34a" : (isDark ? "#334155" : "#e5e7eb"),
                    borderWidth: 1,
                    borderColor: formFormat === f.value ? "#16a34a" : inputBorder,
                  }}
                >
                  <Text
                    style={{
                      color: formFormat === f.value ? "#ffffff" : textSecondary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message */}
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Message (optional)
            </Text>
            <TextInput
              value={formMessage}
              onChangeText={setFormMessage}
              placeholder="Looking for a friendly match…"
              placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
              multiline
              numberOfLines={3}
              maxLength={300}
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                color: textPrimary,
                fontSize: 14,
                marginBottom: 4,
                minHeight: 80,
                textAlignVertical: "top",
              }}
            />
            <Text style={{ color: textSecondary, fontSize: 12, textAlign: "right", marginBottom: 16 }}>
              {formMessage.length}/300
            </Text>

            {formError ? (
              <Text style={{ color: "#ef4444", fontSize: 14, marginBottom: 12 }}>{formError}</Text>
            ) : null}

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: inputBorder,
                }}
              >
                <Text style={{ color: textSecondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={createMutation.isPending}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: "#16a34a",
                  opacity: createMutation.isPending ? 0.7 : 1,
                }}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={{ color: "#ffffff", fontWeight: "600" }}>Post match</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

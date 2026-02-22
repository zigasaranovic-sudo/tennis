import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-yellow-600" },
  accepted: { label: "Upcoming", color: "text-blue-600" },
  pending_confirmation: { label: "Awaiting Confirmation", color: "text-orange-500" },
  completed: { label: "Completed", color: "text-green-600" },
  cancelled: { label: "Cancelled", color: "text-gray-400" },
  disputed: { label: "Disputed", color: "text-red-500" },
};

type MatchData = {
  id: string;
  player1_id: string;
  player2_id: string;
  status: "pending" | "accepted" | "pending_confirmation" | "completed" | "cancelled" | "disputed";
  format: string;
  scheduled_at: string | null;
  played_at: string | null;
  location_name: string | null;
  score_detail: { p1: number; p2: number }[] | null;
  winner_id: string | null;
  result_submitted_by: string | null;
  player1_elo_after: number | null;
  player1_elo_delta: number | null;
  player2_elo_after: number | null;
  player2_elo_delta: number | null;
  player1: { id: string; full_name: string; username: string } | null;
  player2: { id: string; full_name: string; username: string } | null;
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#1e293b" : "#ffffff";
  const inputText = isDark ? "#f1f5f9" : "#111827";

  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: matchRaw, refetch } = trpc.match.getMatch.useQuery(
    { id },
    { enabled: !!id }
  );
  const match = matchRaw as unknown as MatchData | undefined;

  const [disputeReason, setDisputeReason] = useState("");
  const [sets, setSets] = useState<{ p1: string; p2: string }[]>([
    { p1: "", p2: "" },
    { p1: "", p2: "" },
    { p1: "", p2: "" },
  ]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - return type includes recursive Json type that exceeds TS depth limit
  const submitResult = trpc.match.submitResult.useMutation({
    onSuccess: () => {
      Alert.alert("Result submitted", "Waiting for your opponent to confirm.");
      refetch();
    },
    onError: (err: { message: string }) => Alert.alert("Error", err.message),
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - return type includes recursive Json type that exceeds TS depth limit
  const confirmResult = trpc.match.confirmResult.useMutation({
    onSuccess: () => {
      Alert.alert("Match confirmed!", "Result has been recorded.");
      refetch();
    },
    onError: (err: { message: string }) => Alert.alert("Error", err.message),
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - return type includes recursive Json type that exceeds TS depth limit
  const disputeResult = trpc.match.disputeResult.useMutation({
    onSuccess: () => {
      Alert.alert("Dispute filed", "An admin will review the match.");
      refetch();
    },
    onError: (err: { message: string }) => Alert.alert("Error", err.message),
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - return type includes recursive Json type that exceeds TS depth limit
  const cancelMatch = trpc.match.cancelMatch.useMutation({
    onSuccess: () => {
      Alert.alert("Match cancelled");
      router.back();
    },
    onError: (err: { message: string }) => Alert.alert("Error", err.message),
  });

  useLayoutEffect(() => {
    if (match) {
      navigation.setOptions({
        title: match.status === "completed" ? "Match Result" : "Match",
      });
    }
  }, [match, navigation]);

  if (!match) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const myId = profile?.id;
  const isPlayer1 = match.player1_id === myId;
  const isParticipant = match.player1_id === myId || match.player2_id === myId;
  const opponent = isPlayer1 ? match.player2 : match.player1;
  const statusInfo = STATUS_LABELS[match.status] ?? { label: match.status, color: "text-gray-600" };
  const canSubmit = match.status === "accepted" && isParticipant && !match.result_submitted_by;
  const canConfirm =
    match.status === "pending_confirmation" &&
    match.result_submitted_by !== myId &&
    isParticipant;
  const canDispute =
    match.status === "pending_confirmation" &&
    match.result_submitted_by !== myId &&
    isParticipant;
  const canCancel = ["pending", "accepted"].includes(match.status) && isParticipant;

  const handleSubmit = () => {
    const scoreDetail = sets
      .filter((s) => s.p1 !== "" && s.p2 !== "")
      .map((s) => ({
        p1: parseInt(s.p1, 10),
        p2: parseInt(s.p2, 10),
      }));

    if (scoreDetail.length === 0) {
      Alert.alert("Enter score", "Please enter at least one set score.");
      return;
    }

    submitResult.mutate({
      match_id: id,
      score_detail: scoreDetail,
      format: (match.format ?? "best_of_3") as "best_of_1" | "best_of_3" | "best_of_5",
    });
  };

  const handleCancel = () => {
    Alert.alert("Cancel match", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        style: "destructive",
        onPress: () => cancelMatch.mutate({ match_id: id }),
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Match header */}
      <View
        style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
        className="rounded-2xl p-5 mb-4"
      >
        <View className="items-center mb-4">
          <View
            style={{ backgroundColor: isDark ? "#334155" : "#f3f4f6" }}
            className="px-3 py-1 rounded-full mb-3"
          >
            <Text className={`text-sm font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={{ color: textPrimary }} className="text-lg font-bold">
            {profile?.full_name ?? "You"} vs {opponent?.full_name ?? "Opponent"}
          </Text>
          <Text style={{ color: textSecondary }} className="text-sm mt-1">
            {match.format?.replace(/_/g, " ").replace("best of", "Best of")}
          </Text>
          {match.scheduled_at && (
            <Text style={{ color: textSecondary }} className="text-sm mt-1">
              {new Date(match.scheduled_at).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
          {match.location_name && (
            <Text style={{ color: textSecondary }} className="text-sm mt-0.5">
              📍 {match.location_name}
            </Text>
          )}
        </View>

        {/* Completed score display */}
        {match.status === "completed" && match.score_detail && (
          <View style={{ borderTopColor: border, borderTopWidth: 1 }} className="pt-4">
            <Text style={{ color: textSecondary }} className="text-center text-sm font-medium mb-3">
              Final Score
            </Text>
            <View className="flex-row justify-center gap-4">
              {match.score_detail.map((set, i) => (
                <View key={i} className="items-center">
                  <Text style={{ color: textSecondary }} className="text-xs mb-1">Set {i + 1}</Text>
                  <Text style={{ color: textPrimary }} className="text-xl font-bold">
                    {set.p1}–{set.p2}
                  </Text>
                </View>
              ))}
            </View>
            {match.winner_id && (
              <Text className="text-center text-sm text-green-600 font-medium mt-3">
                {match.winner_id === myId ? "You won! 🏆" : `${opponent?.full_name ?? "Opponent"} won`}
              </Text>
            )}
          </View>
        )}

      </View>

      {/* Score entry */}
      {canSubmit && (
        <View
          style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
          className="rounded-2xl p-5 mb-4"
        >
          <Text style={{ color: textPrimary }} className="text-base font-semibold mb-4">
            Submit Result
          </Text>
          <View className="flex-row items-center mb-3">
            <Text style={{ color: textSecondary }} className="text-sm w-12">Set</Text>
            <Text style={{ color: textPrimary }} className="flex-1 text-center text-sm font-medium">
              You
            </Text>
            <Text style={{ color: isDark ? "#475569" : "#d1d5db" }} className="mx-3">–</Text>
            <Text style={{ color: textPrimary }} className="flex-1 text-center text-sm font-medium">
              {opponent?.full_name?.split(" ")[0] ?? "Opp"}
            </Text>
          </View>
          {sets.map((set, i) => (
            <View key={i} className="flex-row items-center mb-3">
              <Text style={{ color: textSecondary }} className="text-sm w-12">Set {i + 1}</Text>
              <TextInput
                value={set.p1}
                onChangeText={(v) =>
                  setSets((prev) =>
                    prev.map((s, idx) => (idx === i ? { ...s, p1: v.replace(/[^0-9]/g, "") } : s))
                  )
                }
                keyboardType="numeric"
                maxLength={2}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: border,
                  borderRadius: 8,
                  paddingVertical: 8,
                  textAlign: "center",
                  fontSize: 16,
                  backgroundColor: inputBg,
                  color: inputText,
                }}
                placeholder="0"
                placeholderTextColor={textSecondary}
              />
              <Text style={{ color: isDark ? "#475569" : "#d1d5db" }} className="mx-3">–</Text>
              <TextInput
                value={set.p2}
                onChangeText={(v) =>
                  setSets((prev) =>
                    prev.map((s, idx) => (idx === i ? { ...s, p2: v.replace(/[^0-9]/g, "") } : s))
                  )
                }
                keyboardType="numeric"
                maxLength={2}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: border,
                  borderRadius: 8,
                  paddingVertical: 8,
                  textAlign: "center",
                  fontSize: 16,
                  backgroundColor: inputBg,
                  color: inputText,
                }}
                placeholder="0"
                placeholderTextColor={textSecondary}
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitResult.isPending}
            className="bg-green-600 rounded-xl py-3 items-center mt-2"
          >
            <Text className="text-white font-semibold">
              {submitResult.isPending ? "Submitting..." : "Submit Result"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Awaiting confirmation banner */}
      {match.status === "pending_confirmation" && match.result_submitted_by === myId && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
          <Text className="text-yellow-700 text-sm text-center">
            Result submitted — waiting for {opponent?.full_name ?? "opponent"} to confirm.
          </Text>
        </View>
      )}

      {/* Confirm / Dispute actions */}
      {(canConfirm || canDispute) && (
        <View
          style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
          className="rounded-2xl p-5 mb-4"
        >
          <Text style={{ color: textPrimary }} className="text-base font-semibold mb-1">
            Confirm Result?
          </Text>
          <Text style={{ color: textSecondary }} className="text-sm mb-4">
            {match.result_submitted_by === match.player1_id
              ? match.player1?.full_name
              : match.player2?.full_name}{" "}
            submitted a result. Does it look correct?
          </Text>
          {match.score_detail && (
            <View className="flex-row gap-3 mb-4">
              {match.score_detail.map((set, i) => (
                <View key={i} className="items-center">
                  <Text style={{ color: textSecondary }} className="text-xs">Set {i + 1}</Text>
                  <Text style={{ color: textPrimary }} className="text-lg font-bold">
                    {set.p1}–{set.p2}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <View className="flex-row gap-3">
            {canDispute && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Dispute Result",
                    "Briefly explain why this result is incorrect:",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Submit",
                        style: "destructive",
                        onPress: () => {
                          const reason = disputeReason.trim() || "Result is incorrect";
                          disputeResult.mutate({ match_id: id, reason });
                        },
                      },
                    ]
                  );
                }}
                disabled={disputeResult.isPending}
                className="flex-1 border border-red-200 rounded-xl py-3 items-center"
              >
                <Text className="text-red-500 font-semibold text-sm">Dispute</Text>
              </TouchableOpacity>
            )}
            {canConfirm && (
              <TouchableOpacity
                onPress={() => confirmResult.mutate({ match_id: id })}
                disabled={confirmResult.isPending}
                className="flex-1 bg-green-600 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold text-sm">
                  {confirmResult.isPending ? "Confirming..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Cancel */}
      {canCancel && (
        <TouchableOpacity
          onPress={handleCancel}
          disabled={cancelMatch.isPending}
          className="border border-red-100 rounded-2xl p-4 items-center mb-6"
        >
          <Text className="text-red-500 font-medium text-sm">Cancel Match</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

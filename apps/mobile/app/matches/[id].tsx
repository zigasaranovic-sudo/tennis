import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
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
      Alert.alert("Match confirmed!", "ELO ratings have been updated.");
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
      <View className="flex-1 items-center justify-center bg-gray-50">
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
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Match header */}
      <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <View className="items-center mb-4">
          <View className={`px-3 py-1 rounded-full bg-gray-100 mb-3`}>
            <Text className={`text-sm font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-900">
            {profile?.full_name ?? "You"} vs {opponent?.full_name ?? "Opponent"}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {match.format?.replace(/_/g, " ").replace("best of", "Best of")}
          </Text>
          {match.scheduled_at && (
            <Text className="text-sm text-gray-400 mt-1">
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
            <Text className="text-sm text-gray-400 mt-0.5">📍 {match.location_name}</Text>
          )}
        </View>

        {/* Completed score display */}
        {match.status === "completed" && match.score_detail && (
          <View className="border-t border-gray-100 pt-4">
            <Text className="text-center text-sm font-medium text-gray-500 mb-3">Final Score</Text>
            <View className="flex-row justify-center gap-4">
              {match.score_detail.map((set, i) => (
                <View key={i} className="items-center">
                  <Text className="text-xs text-gray-400 mb-1">Set {i + 1}</Text>
                  <Text className="text-xl font-bold text-gray-900">
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

        {/* ELO changes */}
        {match.status === "completed" && (
          <View className="flex-row border-t border-gray-100 pt-4 mt-4">
            {isPlayer1 ? (
              <>
                <View className="flex-1 items-center">
                  <Text className="text-xs text-gray-500">Your ELO</Text>
                  <Text className="text-base font-bold text-gray-900 mt-0.5">
                    {match.player1_elo_after ?? "—"}
                  </Text>
                  {match.player1_elo_delta != null && (
                    <Text
                      className={`text-xs font-semibold ${match.player1_elo_delta >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {match.player1_elo_delta >= 0 ? "+" : ""}
                      {match.player1_elo_delta}
                    </Text>
                  )}
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-xs text-gray-500">Opponent ELO</Text>
                  <Text className="text-base font-bold text-gray-900 mt-0.5">
                    {match.player2_elo_after ?? "—"}
                  </Text>
                  {match.player2_elo_delta != null && (
                    <Text
                      className={`text-xs font-semibold ${match.player2_elo_delta >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {match.player2_elo_delta >= 0 ? "+" : ""}
                      {match.player2_elo_delta}
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <>
                <View className="flex-1 items-center">
                  <Text className="text-xs text-gray-500">Your ELO</Text>
                  <Text className="text-base font-bold text-gray-900 mt-0.5">
                    {match.player2_elo_after ?? "—"}
                  </Text>
                  {match.player2_elo_delta != null && (
                    <Text
                      className={`text-xs font-semibold ${match.player2_elo_delta >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {match.player2_elo_delta >= 0 ? "+" : ""}
                      {match.player2_elo_delta}
                    </Text>
                  )}
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-xs text-gray-500">Opponent ELO</Text>
                  <Text className="text-base font-bold text-gray-900 mt-0.5">
                    {match.player1_elo_after ?? "—"}
                  </Text>
                  {match.player1_elo_delta != null && (
                    <Text
                      className={`text-xs font-semibold ${match.player1_elo_delta >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {match.player1_elo_delta >= 0 ? "+" : ""}
                      {match.player1_elo_delta}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Score entry */}
      {canSubmit && (
        <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-4">Submit Result</Text>
          <View className="flex-row items-center mb-3">
            <Text className="text-sm text-gray-500 w-12">Set</Text>
            <Text className="flex-1 text-center text-sm font-medium text-gray-700">You</Text>
            <Text className="mx-3 text-gray-300">–</Text>
            <Text className="flex-1 text-center text-sm font-medium text-gray-700">
              {opponent?.full_name?.split(" ")[0] ?? "Opp"}
            </Text>
          </View>
          {sets.map((set, i) => (
            <View key={i} className="flex-row items-center mb-3">
              <Text className="text-sm text-gray-400 w-12">Set {i + 1}</Text>
              <TextInput
                value={set.p1}
                onChangeText={(v) =>
                  setSets((prev) =>
                    prev.map((s, idx) => (idx === i ? { ...s, p1: v.replace(/[^0-9]/g, "") } : s))
                  )
                }
                keyboardType="numeric"
                maxLength={2}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-center text-base"
                placeholder="0"
              />
              <Text className="mx-3 text-gray-300">–</Text>
              <TextInput
                value={set.p2}
                onChangeText={(v) =>
                  setSets((prev) =>
                    prev.map((s, idx) => (idx === i ? { ...s, p2: v.replace(/[^0-9]/g, "") } : s))
                  )
                }
                keyboardType="numeric"
                maxLength={2}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-center text-base"
                placeholder="0"
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
        <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-1">Confirm Result?</Text>
          <Text className="text-sm text-gray-500 mb-4">
            {match.result_submitted_by === match.player1_id
              ? match.player1?.full_name
              : match.player2?.full_name}{" "}
            submitted a result. Does it look correct?
          </Text>
          {match.score_detail && (
            <View className="flex-row gap-3 mb-4">
              {match.score_detail.map((set, i) => (
                <View key={i} className="items-center">
                  <Text className="text-xs text-gray-400">Set {i + 1}</Text>
                  <Text className="text-lg font-bold text-gray-900">
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

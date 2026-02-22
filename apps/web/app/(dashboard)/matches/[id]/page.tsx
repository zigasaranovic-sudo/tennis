"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [scoreInputs, setScoreInputs] = useState<{ p1: string; p2: string }[]>([
    { p1: "", p2: "" },
  ]);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  const { data: match, refetch } = trpc.match.getMatch.useQuery({ id });
  const { data: profile } = trpc.player.getProfile.useQuery();

  const submitResult = trpc.match.submitResult.useMutation({
    onSuccess: () => refetch(),
  });

  const confirmResult = trpc.match.confirmResult.useMutation({
    onSuccess: () => refetch(),
  });

  const disputeResult = trpc.match.disputeResult.useMutation({
    onSuccess: () => { refetch(); setShowDispute(false); },
  });

  const cancelMatch = trpc.match.cancelMatch.useMutation({
    onSuccess: () => refetch(),
  });

  if (!match) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoreDetail = (match as any).score_detail as { p1: number; p2: number }[] | null;
  const isP1 = (match.player1 as { id?: string })?.id === profile?.id;
  const myPlayer = isP1 ? match.player1 : match.player2;
  const opponent = isP1 ? match.player2 : match.player1;
  const myElo = isP1 ? match.player1_elo_after : match.player2_elo_after;
  const myDelta = isP1 ? match.player1_elo_delta : match.player2_elo_delta;
  const iWon = match.winner_id === profile?.id;
  const iSubmittedResult = match.result_submitted_by === profile?.id;

  const statusColors: Record<string, string> = {
    accepted: "bg-blue-100 text-blue-700",
    pending_confirmation: "bg-orange-100 text-orange-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-600",
    disputed: "bg-red-100 text-red-700",
  };

  const addSet = () => {
    if (scoreInputs.length < 5) {
      setScoreInputs([...scoreInputs, { p1: "", p2: "" }]);
    }
  };

  const removeSet = (i: number) => {
    setScoreInputs(scoreInputs.filter((_, idx) => idx !== i));
  };

  const handleSubmitResult = () => {
    const scoreDetail = scoreInputs.map((s) => ({
      p1: parseInt(s.p1) || 0,
      p2: parseInt(s.p2) || 0,
    }));
    submitResult.mutate({
      match_id: id,
      score_detail: scoreDetail,
      format: match.format as "best_of_1" | "best_of_3" | "best_of_5",
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/matches" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Matches
        </Link>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
            statusColors[match.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {match.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Match header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center text-green-700 font-bold text-2xl overflow-hidden">
              {(myPlayer as { avatar_url?: string })?.avatar_url ? (
                <img src={(myPlayer as { avatar_url?: string }).avatar_url!} alt="" className="w-full h-full object-cover" />
              ) : (
                (myPlayer as { full_name?: string })?.full_name?.[0]
              )}
            </div>
            <p className="font-semibold text-gray-900 mt-2">
              {(myPlayer as { full_name?: string })?.full_name}
            </p>
            <p className="text-sm text-gray-400">You</p>
          </div>

          <div className="text-center px-6">
            {match.status === "completed" && scoreDetail ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Array.isArray(scoreDetail)
                    ? scoreDetail
                        .map((s) =>
                          isP1 ? `${s.p1}-${s.p2}` : `${s.p2}-${s.p1}`
                        )
                        .join(", ")
                    : "–"}
                </div>
                {myDelta !== null && myDelta !== undefined && (
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      myDelta > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {myDelta > 0 ? "+" : ""}
                    {myDelta} ELO
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-xl">vs</p>
            )}
            <p className="text-xs text-gray-400 mt-1 capitalize">
              {match.format?.replace(/_/g, " ")}
            </p>
          </div>

          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-gray-600 font-bold text-2xl overflow-hidden">
              {(opponent as { avatar_url?: string })?.avatar_url ? (
                <img src={(opponent as { avatar_url?: string }).avatar_url!} alt="" className="w-full h-full object-cover" />
              ) : (
                (opponent as { full_name?: string })?.full_name?.[0]
              )}
            </div>
            <Link href={`/players/${(opponent as { id?: string })?.id}`}>
              <p className="font-semibold text-gray-900 mt-2 hover:text-green-600 transition-colors">
                {(opponent as { full_name?: string })?.full_name}
              </p>
            </Link>
            <p className="text-sm text-gray-400">Opponent</p>
          </div>
        </div>

        {/* Match details */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
          {match.scheduled_at && (
            <div>
              <p className="text-gray-400 text-xs">Date & Time</p>
              <p className="text-gray-700 font-medium">
                {new Date(match.scheduled_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
          {match.location_city && (
            <div>
              <p className="text-gray-400 text-xs">Location</p>
              <p className="text-gray-700 font-medium">
                {match.location_name ?? match.location_city}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Result submission — shown for accepted matches */}
      {match.status === "accepted" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Result</h2>
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 font-medium px-1">
              <span className="col-span-2 text-center">
                {(myPlayer as { full_name?: string })?.full_name?.split(" ")[0]}
              </span>
              <span className="text-center">–</span>
              <span className="col-span-2 text-center">
                {(opponent as { full_name?: string })?.full_name?.split(" ")[0]}
              </span>
            </div>
            {scoreInputs.map((set, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-8">Set {i + 1}</span>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={set.p1}
                  onChange={(e) =>
                    setScoreInputs(
                      scoreInputs.map((s, idx) =>
                        idx === i ? { ...s, p1: e.target.value } : s
                      )
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={set.p2}
                  onChange={(e) =>
                    setScoreInputs(
                      scoreInputs.map((s, idx) =>
                        idx === i ? { ...s, p2: e.target.value } : s
                      )
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
                {i > 0 && (
                  <button
                    onClick={() => removeSet(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            {scoreInputs.length < 5 && (
              <button
                onClick={addSet}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                + Add set
              </button>
            )}
            <button
              onClick={handleSubmitResult}
              disabled={submitResult.isPending}
              className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {submitResult.isPending ? "Submitting..." : "Submit Result"}
            </button>
          </div>
          {submitResult.error && (
            <p className="mt-2 text-sm text-red-600">{submitResult.error.message}</p>
          )}
        </div>
      )}

      {/* Result confirmation */}
      {match.status === "pending_confirmation" && !iSubmittedResult && (
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Confirm Result</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your opponent submitted a result. Please confirm or dispute.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Score submitted:</p>
            <p className="text-xl font-bold text-gray-900">
              {Array.isArray(scoreDetail)
                ? scoreDetail
                    .map((s) =>
                      isP1 ? `${s.p1}-${s.p2}` : `${s.p2}-${s.p1}`
                    )
                    .join(", ")
                : "–"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDispute(true)}
              className="flex-1 py-2.5 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              Dispute
            </button>
            <button
              onClick={() => confirmResult.mutate({ match_id: id })}
              disabled={confirmResult.isPending}
              className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {confirmResult.isPending ? "Confirming..." : "Confirm Result"}
            </button>
          </div>

          {showDispute && (
            <div className="mt-4 space-y-3">
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why you are disputing this result..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <button
                onClick={() =>
                  disputeResult.mutate({ match_id: id, reason: disputeReason })
                }
                disabled={!disputeReason || disputeResult.isPending}
                className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Submit Dispute
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completed match result */}
      {match.status === "completed" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-4xl mb-3">{iWon ? "🏆" : "🎾"}</p>
          <p className="text-xl font-bold text-gray-900 mb-1">
            {iWon ? "You won!" : "Match completed"}
          </p>
          {myDelta !== null && myDelta !== undefined && (
            <p className={`text-sm font-semibold ${myDelta > 0 ? "text-green-600" : "text-red-500"}`}>
              ELO: {myElo} ({myDelta > 0 ? "+" : ""}{myDelta})
            </p>
          )}
        </div>
      )}

      {/* Cancel match (for accepted matches) */}
      {match.status === "accepted" && (
        <div className="text-center">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to cancel this match?")) {
                cancelMatch.mutate({ match_id: id });
              }
            }}
            className="text-sm text-red-500 hover:text-red-700 hover:underline"
          >
            Cancel match
          </button>
        </div>
      )}
    </div>
  );
}

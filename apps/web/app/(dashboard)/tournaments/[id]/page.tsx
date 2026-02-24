"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

type TournamentDetail = {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  location_city: string | null;
  location_name: string | null;
  scheduled_at: string;
  max_spots: number;
  format: "singles" | "doubles" | "both";
  status: "open" | "full" | "cancelled" | "completed";
  created_at: string;
  creator: { id: string; full_name: string; username: string; avatar_url: string | null } | null;
  participant_count: number;
  participants: Array<{
    id: string;
    player_id: string;
    play_format: "singles" | "doubles";
    joined_at: string;
    player: { id: string; full_name: string; username: string; avatar_url: string | null } | null;
  }>;
};

const FORMAT_LABEL: Record<string, string> = {
  singles: "Singles",
  doubles: "Doubles",
  both: "Singles & Doubles",
};
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  full: { label: "Full", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  completed: { label: "Completed", cls: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400" },
};

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: rawTournament, isLoading, refetch } = trpc.tournament.get.useQuery({ id });
  const tournament = rawTournament as unknown as TournamentDetail | undefined;

  const [joinPlayFormat, setJoinPlayFormat] = useState<"singles" | "doubles">("singles");
  const [showJoinModal, setShowJoinModal] = useState(false);

  const joinMutation = trpc.tournament.join.useMutation({
    onSuccess: () => {
      setShowJoinModal(false);
      void refetch();
    },
  });

  const cancelMutation = trpc.tournament.cancel.useMutation({
    onSuccess: () => void refetch(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-slate-400">Tournament not found.</p>
        <Link href="/tournaments" className="text-green-600 hover:underline mt-2 block">
          Back to Tournaments
        </Link>
      </div>
    );
  }

  const isCreator = profile?.id === tournament.creator_id;
  const alreadyJoined = tournament.participants.some((p) => p.player_id === profile?.id);
  const isFull = tournament.status === "full" || tournament.participant_count >= tournament.max_spots;
  const spotsFilledPct = Math.min(100, Math.round((tournament.participant_count / tournament.max_spots) * 100));
  const sts = STATUS_BADGE[tournament.status] ?? STATUS_BADGE.open;

  const handleJoin = () => {
    joinMutation.mutate({ tournament_id: id, play_format: joinPlayFormat });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link href="/tournaments" className="text-sm text-gray-500 dark:text-slate-400 hover:text-green-600 transition-colors">
        ← Back to Tournaments
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{tournament.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sts.cls}`}>{sts.label}</span>
            </div>

            {tournament.description && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{tournament.description}</p>
            )}

            <div className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
              <p>
                📅{" "}
                {new Date(tournament.scheduled_at).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
              {(tournament.location_city || tournament.location_name) && (
                <p>
                  📍 {[tournament.location_name, tournament.location_city].filter(Boolean).join(", ")}
                </p>
              )}
              <p>🎾 Format: {FORMAT_LABEL[tournament.format] ?? tournament.format}</p>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                {tournament.creator?.full_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                Organized by {tournament.creator?.full_name ?? tournament.creator?.username ?? "Unknown"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {isCreator && (tournament.status === "open" || tournament.status === "full") && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this tournament?")) {
                    cancelMutation.mutate({ tournament_id: id });
                  }
                }}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Cancel Tournament
              </button>
            )}
            {!isCreator && tournament.status === "open" && !alreadyJoined && (
              <button
                onClick={() => { setJoinPlayFormat("singles"); setShowJoinModal(true); }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Join
              </button>
            )}
            {alreadyJoined && (
              <span className="px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg">
                ✓ Joined
              </span>
            )}
            {tournament.status === "full" && !alreadyJoined && (
              <span className="px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                Tournament Full
              </span>
            )}
          </div>
        </div>

        {/* Spots progress bar */}
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700 dark:text-slate-300">
              {tournament.participant_count} of {tournament.max_spots} spots filled
            </span>
            <span className="text-gray-500 dark:text-slate-400">{spotsFilledPct}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${spotsFilledPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Participants ({tournament.participant_count})
        </h2>
        {tournament.participants.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">No participants yet. Be the first to join!</p>
        ) : (
          <div className="space-y-3">
            {tournament.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {p.player?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.player.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    (p.player?.full_name?.[0] ?? "?").toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/players/${p.player_id}`}
                    className="text-sm font-medium text-gray-900 dark:text-slate-100 hover:text-green-600 transition-colors truncate block"
                  >
                    {p.player?.full_name ?? p.player?.username ?? "Unknown"}
                  </Link>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 flex-shrink-0">
                  {p.play_format}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Join Tournament</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{tournament.name}</p>

            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">How will you play?</p>
            <div className="space-y-2">
              {(tournament.format === "singles" || tournament.format === "both") && (
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="play_format"
                    value="singles"
                    checked={joinPlayFormat === "singles"}
                    onChange={() => setJoinPlayFormat("singles")}
                    className="accent-green-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Singles</span>
                </label>
              )}
              {(tournament.format === "doubles" || tournament.format === "both") && (
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="play_format"
                    value="doubles"
                    checked={joinPlayFormat === "doubles"}
                    onChange={() => setJoinPlayFormat("doubles")}
                    className="accent-green-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Doubles</span>
                </label>
              )}
            </div>

            {joinMutation.error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-3">{joinMutation.error.message}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={joinMutation.isPending}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {joinMutation.isPending ? "Joining..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

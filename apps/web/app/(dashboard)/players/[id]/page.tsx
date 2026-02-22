"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type MatchHistoryItem = {
  id: string;
  winner_id: string | null;
  played_at: string | null;
  player1: { id: string; full_name: string } | null;
  player2: { id: string; full_name: string } | null;
};

export default function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [proposedAt, setProposedAt] = useState("");
  const [message, setMessage] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [startingConv, setStartingConv] = useState(false);

  const { data: player, isLoading } = trpc.player.getPublicProfile.useQuery({ id });
  const { data: eloHistory } = trpc.player.getEloHistory.useQuery({ player_id: id });
  const { data: matchHistory } = trpc.player.getMatchHistory.useQuery({
    player_id: id,
    limit: 5,
  });
  const { data: availability } = trpc.player.getAvailability.useQuery({ player_id: id });

  const sendRequest = trpc.match.sendRequest.useMutation({
    onSuccess: () => {
      setShowRequestModal(false);
      alert("Match request sent!");
    },
  });

  const getOrCreateConv = trpc.messaging.getOrCreateConversation.useMutation();

  const handleMessage = async () => {
    setStartingConv(true);
    try {
      const { id: convId } = await getOrCreateConv.mutateAsync({ player_id: id });
      router.push(`/messages/${convId}`);
    } finally {
      setStartingConv(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-slate-400">Player not found.</p>
        <Link href="/players" className="text-green-600 hover:underline mt-2 block">
          Back to players
        </Link>
      </div>
    );
  }

  const winRate =
    player.matches_played > 0
      ? Math.round((player.matches_won / player.matches_played) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          {/* Avatar + info */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 shrink-0 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-3xl overflow-hidden">
              {player.avatar_url ? (
                <img src={player.avatar_url} alt={player.full_name} className="w-full h-full object-cover" />
              ) : (
                player.full_name[0]
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 truncate">{player.full_name}</h1>
              <p className="text-gray-500 dark:text-slate-400">@{player.username}</p>
              {player.city && (
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">📍 {player.city}, {player.country}</p>
              )}
              {(player as { home_club?: string | null }).home_club && (
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">🎾 {(player as { home_club?: string | null }).home_club}</p>
              )}
              {player.bio && <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 max-w-md">{player.bio}</p>}
            </div>
          </div>

          {/* Action buttons — full-width row on mobile, column on desktop */}
          <div className="flex gap-3 md:flex-col md:items-end shrink-0">
            <button
              onClick={handleMessage}
              disabled={startingConv}
              className="flex-1 md:flex-none px-5 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 text-sm"
            >
              {startingConv ? "..." : "💬 Message"}
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex-1 md:flex-none px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              🎾 Request Match
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {player.elo_rating}
              {player.elo_provisional && <span className="text-sm text-gray-400 dark:text-slate-600">*</span>}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">ELO Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{player.matches_played}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Matches</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{player.matches_won}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Wins</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{winRate}%</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Win Rate</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ELO history chart (simple sparkline) */}
        {eloHistory && eloHistory.length > 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">ELO Progress</h2>
            <div className="h-32 flex items-end gap-1">
              {eloHistory.slice(-20).map((point, i) => {
                const values = eloHistory.slice(-20).map((p) => p.elo_after);
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min || 1;
                const height = ((point.elo_after - min) / range) * 100;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${
                      point.elo_delta > 0 ? "bg-green-400" : "bg-red-400"
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${point.elo_after} (${point.elo_delta > 0 ? "+" : ""}${point.elo_delta})`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 dark:text-slate-600 mt-1">
              <span>Earlier</span>
              <span>Latest: {eloHistory[eloHistory.length - 1]?.elo_after}</span>
            </div>
          </div>
        )}

        {/* Availability */}
        {availability && availability.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Availability</h2>
            <div className="space-y-2">
              {availability.map((slot) => (
                <div key={slot.id} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-medium text-gray-500 dark:text-slate-400">
                    {DAY_NAMES[slot.day_of_week]}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {slot.start_time} – {slot.end_time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent matches */}
      {matchHistory && matchHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Recent Matches</h2>
          <div className="space-y-3">
            {(matchHistory as unknown as MatchHistoryItem[]).map((match) => {
              const isP1 = match.player1?.id === id;
              const opponent = isP1 ? match.player2 : match.player1;
              const wonMatch = match.winner_id === id;
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        wonMatch
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {wonMatch ? "W" : "L"}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      vs {opponent?.full_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-slate-600">
                      {match.played_at
                        ? new Date(match.played_at).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Match request modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Request match with {player.full_name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Proposed date & time
                </label>
                <input
                  type="datetime-local"
                  value={proposedAt}
                  onChange={(e) => setProposedAt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="Where will you play?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Hey, want to hit some balls?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!proposedAt) return;
                    sendRequest.mutate({
                      recipient_id: id,
                      proposed_at: new Date(proposedAt).toISOString(),
                      format: "best_of_3",
                      location_city: locationCity || undefined,
                      message: message || undefined,
                    });
                  }}
                  disabled={!proposedAt || sendRequest.isPending}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {sendRequest.isPending ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

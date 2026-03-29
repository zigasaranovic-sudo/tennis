"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

// ── Demo bracket data ─────────────────────────────────────────────────────────
type BracketPlayer = { initials: string; name: string; score: string; winner?: boolean };
type BracketMatch = { id: string; player1: BracketPlayer; player2: BracketPlayer; live?: boolean; completed?: boolean };

const DEMO_BRACKET: BracketMatch[] = [
  { id: "m1", live: true,
    player1: { initials: "NK", name: "N. Kovač", score: "6-4 3" },
    player2: { initials: "MT", name: "M. Tomić", score: "2-6 2" } },
  { id: "m2", completed: true,
    player1: { initials: "AJ", name: "A. Janez", score: "6-3 6-1", winner: true },
    player2: { initials: "BK", name: "B. Kos", score: "3-6 1-6" } },
  { id: "m3",
    player1: { initials: "PH", name: "P. Horvat", score: "–" },
    player2: { initials: "SD", name: "S. Dolar", score: "–" } },
  { id: "m4", completed: true,
    player1: { initials: "LV", name: "L. Vidmar", score: "7-5 6-4", winner: true },
    player2: { initials: "RN", name: "R. Novak", score: "5-7 4-6" } },
];

function BracketCard({ match }: { match: BracketMatch }) {
  return (
    <div className={`relative shrink-0 w-52 rounded-2xl overflow-hidden ${match.live ? "border border-[#4be277]/30" : "border border-transparent"}`}
      style={{ background: "#1b1c1c" }}>
      {match.live && (
        <span className="absolute top-2 left-2 bg-[#4be277] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest z-10">
          LIVE
        </span>
      )}
      <div className="absolute top-0 right-0 w-1 h-full"
        style={{ background: "linear-gradient(180deg, #4be277 0%, #22c55e 50%, #16a34a 100%)" }} />
      <div className="p-4 pt-3 space-y-3">
        <BracketPlayerRow player={match.player1} dim={match.completed && !match.player1.winner} />
        <div className="h-px" style={{ background: "#202020" }} />
        <BracketPlayerRow player={match.player2} dim={match.completed && !match.player2.winner} />
      </div>
    </div>
  );
}

function BracketPlayerRow({ player, dim }: { player: BracketPlayer; dim?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-2 ${dim ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-black"
          style={{ background: "linear-gradient(135deg, #4be277, #22c55e)" }}>
          {player.initials}
        </div>
        <span className="text-white text-xs font-semibold truncate">{player.name}</span>
      </div>
      <span className={`text-xs font-black tabular-nums shrink-0 ${player.winner ? "text-[#4be277]" : "text-[#9ca3af]"}`}>
        {player.score}
      </span>
    </div>
  );
}

// ── Tournament types ──────────────────────────────────────────────────────────
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

const STATUS_COLOR: Record<string, { bg: string; color: string; border: string; label: string }> = {
  open:      { bg: "rgba(75,226,119,0.12)", color: "#4be277", border: "rgba(75,226,119,0.25)", label: "Open" },
  full:      { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.25)", label: "Full" },
  cancelled: { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", border: "rgba(239,68,68,0.25)",  label: "Cancelled" },
  completed: { bg: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "rgba(107,114,128,0.25)", label: "Completed" },
};
const FORMAT_COLOR: Record<string, { bg: string; color: string }> = {
  singles: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" },
  doubles: { bg: "rgba(167,139,250,0.12)", color: "#a78bfa" },
  both:    { bg: "rgba(99,102,241,0.12)",  color: "#818cf8" },
};
const FORMAT_LABEL: Record<string, string> = {
  singles: "Singles", doubles: "Doubles", both: "Singles & Doubles",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: rawTournament, isLoading, refetch } = trpc.tournament.get.useQuery({ id });
  const tournament = rawTournament as unknown as TournamentDetail | undefined;

  const [joinPlayFormat, setJoinPlayFormat] = useState<"singles" | "doubles">("singles");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const joinMutation = trpc.tournament.join.useMutation({
    onSuccess: () => { setShowJoinModal(false); void refetch(); },
  });
  const cancelMutation = trpc.tournament.cancel.useMutation({
    onSuccess: () => { setShowCancelConfirm(false); void refetch(); },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pb-32" style={{ background: "#131313", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="px-5 pt-6 lg:px-8 lg:pt-10 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1b1c1c", height: i === 0 ? 200 : 120 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "#131313", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p className="text-white font-black text-lg">Tournament not found</p>
        <Link href="/tournaments" className="text-sm font-semibold" style={{ color: "#4be277" }}>
          ← Back to Tournaments
        </Link>
      </div>
    );
  }

  const isCreator = profile?.id === tournament.creator_id;
  const alreadyJoined = tournament.participants.some((p) => p.player_id === profile?.id);
  const isFull = tournament.status === "full" || tournament.participant_count >= tournament.max_spots;
  const spotsFilledPct = Math.min(100, Math.round((tournament.participant_count / tournament.max_spots) * 100));
  const sts = STATUS_COLOR[tournament.status] ?? STATUS_COLOR.open;
  const fmt = FORMAT_COLOR[tournament.format] ?? FORMAT_COLOR.singles;
  const canJoin = !isCreator && tournament.status === "open" && !alreadyJoined;

  return (
    <div className="min-h-screen pb-32" style={{ background: "#131313", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Back */}
      <div className="px-5 pt-6 pb-2 lg:px-8 lg:pt-10">
        <Link href="/tournaments" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6"
          style={{ color: "rgba(188,203,185,0.5)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Tournaments
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                style={{ background: sts.bg, color: sts.color, borderColor: sts.border }}>
                {sts.label}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ background: fmt.bg, color: fmt.color }}>
                {FORMAT_LABEL[tournament.format]}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">{tournament.name}</h1>
            {tournament.description && (
              <p className="text-sm mt-2" style={{ color: "rgba(188,203,185,0.5)" }}>{tournament.description}</p>
            )}
          </div>

          {/* Action button */}
          <div className="shrink-0 mt-1">
            {canJoin && (
              <button
                onClick={() => { setJoinPlayFormat("singles"); setShowJoinModal(true); }}
                className="px-5 py-2.5 rounded-2xl font-black text-sm text-black shadow-lg shadow-green-500/20"
                style={{ background: "linear-gradient(135deg, #4be277, #22c55e)" }}
              >
                Join
              </button>
            )}
            {alreadyJoined && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-black"
                style={{ background: "rgba(75,226,119,0.12)", color: "#4be277" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Joined
              </span>
            )}
            {isFull && !alreadyJoined && (
              <span className="px-4 py-2 rounded-2xl text-sm font-black"
                style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
                Full
              </span>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-4">
          {/* Date */}
          <div className="col-span-2 lg:col-span-2 rounded-2xl p-4" style={{ background: "#1b1c1c" }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: "rgba(188,203,185,0.35)" }}>
              Date & Time
            </p>
            <p className="font-black text-white text-sm">{fmtDate(tournament.scheduled_at)}</p>
            <p className="text-xs mt-0.5" style={{ color: "#4be277" }}>{fmtTime(tournament.scheduled_at)}</p>
          </div>

          {/* Location */}
          <div className="col-span-2 lg:col-span-1 rounded-2xl p-4" style={{ background: "#1b1c1c" }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: "rgba(188,203,185,0.35)" }}>
              Location
            </p>
            {tournament.location_name || tournament.location_city ? (
              <>
                {tournament.location_name && <p className="font-black text-white text-sm">{tournament.location_name}</p>}
                {tournament.location_city && <p className="text-xs mt-0.5" style={{ color: "rgba(188,203,185,0.5)" }}>{tournament.location_city}</p>}
              </>
            ) : (
              <p className="text-sm" style={{ color: "rgba(188,203,185,0.35)" }}>TBD</p>
            )}
          </div>

          {/* Spots */}
          <div className="col-span-2 lg:col-span-1 rounded-2xl p-4" style={{ background: "#1b1c1c" }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: "rgba(188,203,185,0.35)" }}>
              Spots
            </p>
            <p className="font-black text-white text-sm">
              {tournament.participant_count}
              <span style={{ color: "rgba(188,203,185,0.4)" }}>/{tournament.max_spots}</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${spotsFilledPct}%`, background: "linear-gradient(90deg, #4be277, #22c55e)" }} />
            </div>
          </div>
        </div>

        {/* Creator */}
        {tournament.creator && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4" style={{ background: "#1b1c1c" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-black shrink-0"
              style={{ background: "linear-gradient(135deg, #4be277, #22c55e)" }}>
              {tournament.creator.full_name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(188,203,185,0.35)" }}>Organized by</p>
              <p className="text-sm font-bold text-white">{tournament.creator.full_name}</p>
            </div>
            {isCreator && (tournament.status === "open" || tournament.status === "full") && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="ml-auto px-4 py-2 rounded-xl text-xs font-black"
                style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                Cancel Tournament
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bracket */}
      <div className="px-5 lg:px-8 mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "#6b7280" }}>
          Tournament Bracket
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {DEMO_BRACKET.map((match) => (
            <BracketCard key={match.id} match={match} />
          ))}
        </div>
      </div>

      {/* Participants */}
      <div className="px-5 lg:px-8">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1b1c1c" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white text-base">Participants</h2>
            <span className="text-xs font-bold tabular-nums" style={{ color: "rgba(188,203,185,0.4)" }}>
              {tournament.participant_count}/{tournament.max_spots}
            </span>
          </div>

          {tournament.participants.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-black text-white mb-1">No participants yet</p>
              <p className="text-sm" style={{ color: "#6b7280" }}>Be the first to join!</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {tournament.participants.map((p, i) => {
                const pFmt = FORMAT_COLOR[p.play_format] ?? FORMAT_COLOR.singles;
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-black text-[11px] font-black shrink-0"
                      style={{ background: "linear-gradient(135deg, #4be277, #22c55e)" }}>
                      {p.player?.avatar_url
                        ? <img src={p.player.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                        : (p.player?.full_name?.[0] ?? "?").toUpperCase()
                      }
                    </div>
                    <Link href={`/players/${p.player_id}`}
                      className="flex-1 min-w-0 text-sm font-bold text-white hover:text-[#4be277] transition-colors truncate">
                      {p.player?.full_name ?? p.player?.username ?? "Unknown"}
                    </Link>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: pFmt.bg, color: pFmt.color }}>
                      {p.play_format}
                    </span>
                    <span className="text-[10px] tabular-nums" style={{ color: "rgba(188,203,185,0.3)" }}>#{i + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Join modal ── */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowJoinModal(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: "#1b1c1c" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-white mb-1">Join Tournament</h3>
            <p className="text-sm mb-5 font-semibold" style={{ color: "rgba(188,203,185,0.5)" }}>{tournament.name}</p>

            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: "rgba(188,203,185,0.4)" }}>
              How will you play?
            </p>
            <div className="space-y-2 mb-5">
              {(tournament.format === "singles" || tournament.format === "both") && (
                <label className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-colors"
                  style={joinPlayFormat === "singles"
                    ? { background: "rgba(75,226,119,0.1)", border: "1px solid rgba(75,226,119,0.3)" }
                    : { background: "#202020", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <input type="radio" name="play_format" value="singles"
                    checked={joinPlayFormat === "singles"} onChange={() => setJoinPlayFormat("singles")}
                    className="accent-[#4be277]" />
                  <span className="text-sm font-bold text-white">Singles</span>
                </label>
              )}
              {(tournament.format === "doubles" || tournament.format === "both") && (
                <label className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-colors"
                  style={joinPlayFormat === "doubles"
                    ? { background: "rgba(75,226,119,0.1)", border: "1px solid rgba(75,226,119,0.3)" }
                    : { background: "#202020", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <input type="radio" name="play_format" value="doubles"
                    checked={joinPlayFormat === "doubles"} onChange={() => setJoinPlayFormat("doubles")}
                    className="accent-[#4be277]" />
                  <span className="text-sm font-bold text-white">Doubles</span>
                </label>
              )}
            </div>

            {joinMutation.error && (
              <p className="text-sm text-red-400 mb-3">{joinMutation.error.message}</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm"
                style={{ background: "#202020", color: "rgba(188,203,185,0.6)" }}>
                Cancel
              </button>
              <button onClick={() => joinMutation.mutate({ tournament_id: id, play_format: joinPlayFormat })}
                disabled={joinMutation.isPending}
                className="flex-1 py-3 rounded-2xl font-black text-sm text-black shadow-lg shadow-green-500/20 transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #4be277, #22c55e)" }}>
                {joinMutation.isPending ? "Joining…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel confirm modal ── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowCancelConfirm(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: "#1b1c1c" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-white mb-1">Cancel tournament?</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(188,203,185,0.5)" }}>
              This will cancel <span className="text-white font-bold">{tournament.name}</span> and notify all participants.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm"
                style={{ background: "#202020", color: "rgba(188,203,185,0.6)" }}>
                Keep it
              </button>
              <button
                onClick={() => cancelMutation.mutate({ tournament_id: id })}
                disabled={cancelMutation.isPending}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-opacity disabled:opacity-50"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                {cancelMutation.isPending ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

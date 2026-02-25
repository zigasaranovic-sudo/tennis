"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const SLOVENIAN_CITIES = [
  "Ljubljana","Maribor","Celje","Kranj","Koper","Novo Mesto",
  "Velenje","Nova Gorica","Murska Sobota","Ptuj","Kamnik","Domžale",
  "Škofja Loka","Postojna","Bled",
];

type TournamentItem = {
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
};

const FORMAT_BADGE: Record<string, { label: string; cls: string }> = {
  singles: { label: "Singles", cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  doubles: { label: "Doubles", cls: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
  both: { label: "Singles & Doubles", cls: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" },
};
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  full: { label: "Full", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  completed: { label: "Completed", cls: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400" },
};

export default function TournamentsPage() {
  const router = useRouter();
  const { data: rawTournaments, refetch } = trpc.tournament.list.useQuery({ limit: 30 });
  const tournaments = (rawTournaments ?? []) as unknown as TournamentItem[];
  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: clubs } = trpc.player.getClubs.useQuery();

  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const withdrawMutation = trpc.tournament.withdraw.useMutation({
    onSuccess: () => { void refetch(); setWithdrawingId(null); },
    onError: () => setWithdrawingId(null),
  });

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createCity, setCreateCity] = useState("");
  const [createVenue, setCreateVenue] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createMaxSpots, setCreateMaxSpots] = useState(8);
  const [createFormat, setCreateFormat] = useState<"singles" | "doubles" | "both">("singles");

  // Join modal state
  const [joinTournamentId, setJoinTournamentId] = useState<string | null>(null);
  const [joinPlayFormat, setJoinPlayFormat] = useState<"singles" | "doubles">("singles");
  const joinTournament = tournaments.find((t) => t.id === joinTournamentId);

  const createMutation = trpc.tournament.create.useMutation({
    onSuccess: () => {
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      setCreateCity("");
      setCreateVenue("");
      setCreateDate("");
      setCreateMaxSpots(8);
      setCreateFormat("singles");
      void refetch();
    },
  });

  const joinMutation = trpc.tournament.join.useMutation({
    onSuccess: () => {
      setJoinTournamentId(null);
      void refetch();
    },
  });

  const handleCreate = () => {
    if (!createName.trim() || !createDate) return;
    createMutation.mutate({
      name: createName.trim(),
      description: createDesc.trim() || undefined,
      location_city: createCity.trim() || undefined,
      location_name: createVenue.trim() || undefined,
      scheduled_at: new Date(createDate).toISOString(),
      max_spots: createMaxSpots,
      format: createFormat,
    });
  };

  const handleJoin = () => {
    if (!joinTournamentId) return;
    joinMutation.mutate({ tournament_id: joinTournamentId, play_format: joinPlayFormat });
  };

  const openJoinModal = (t: TournamentItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJoinPlayFormat("singles");
    setJoinTournamentId(t.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Tournaments &amp; Meetups</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Join organised events or create your own</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          + Create
        </button>
      </div>

      {/* Tournament list */}
      {tournaments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-12 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">No tournaments yet</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Be the first to create one!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Create Tournament
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((t) => {
            const spotsLeft = t.max_spots - t.participant_count;
            const fmt = FORMAT_BADGE[t.format];
            const sts = STATUS_BADGE[t.status] ?? STATUS_BADGE.open;
            return (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="block bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:border-green-300 dark:hover:border-green-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate">{t.name}</h3>
                      {fmt && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${fmt.cls}`}>{fmt.label}</span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sts.cls}`}>{sts.label}</span>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {t.creator?.full_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        by {t.creator?.full_name ?? t.creator?.username ?? "Unknown"}
                      </span>
                    </div>

                    {/* Date + location */}
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      {new Date(t.scheduled_at).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                      {t.location_city && ` · ${t.location_city}`}
                      {t.location_name && ` · ${t.location_name}`}
                    </p>

                    {/* Spots */}
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {t.participant_count}/{t.max_spots} spots filled
                      {spotsLeft > 0 && t.status === "open" && (
                        <span className="ml-1 text-green-600 dark:text-green-400">· {spotsLeft} left</span>
                      )}
                    </p>
                  </div>

                  {/* Action button */}
                  {t.creator_id === profile?.id ? null : t.status === "open" && (
                    <button
                      onClick={(e) => openJoinModal(t, e)}
                      className="flex-shrink-0 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Join
                    </button>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-5">Create Tournament</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Summer Singles Open"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Friendly round-robin tournament..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  value={createDate}
                  onChange={(e) => setCreateDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">City</label>
                  <select
                    value={createCity}
                    onChange={(e) => setCreateCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select city…</option>
                    {SLOVENIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Venue</label>
                  <select
                    value={createVenue}
                    onChange={(e) => setCreateVenue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select venue…</option>
                    {(clubs ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Max spots</label>
                  <input
                    type="number"
                    value={createMaxSpots}
                    onChange={(e) => setCreateMaxSpots(Math.min(64, Math.max(2, Number(e.target.value))))}
                    min={2}
                    max={64}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Format</label>
                  <select
                    value={createFormat}
                    onChange={(e) => setCreateFormat(e.target.value as "singles" | "doubles" | "both")}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="singles">Singles</option>
                    <option value="doubles">Doubles</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              {createMutation.error && (
                <p className="text-sm text-red-600 dark:text-red-400">{createMutation.error.message}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!createName.trim() || !createDate || createMutation.isPending}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join modal */}
      {joinTournamentId && joinTournament && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Join Tournament</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{joinTournament.name}</p>

            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">How will you play?</p>
            <div className="space-y-2">
              {(joinTournament.format === "singles" || joinTournament.format === "both") && (
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
              {(joinTournament.format === "doubles" || joinTournament.format === "both") && (
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
                onClick={() => setJoinTournamentId(null)}
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

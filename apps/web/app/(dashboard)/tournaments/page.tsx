"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

// ── Types ──────────────────────────────────────────────────────────────────────

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

const SLOVENIAN_CITIES = [
  "Ljubljana", "Maribor", "Celje", "Kranj", "Koper", "Novo Mesto",
  "Velenje", "Nova Gorica", "Murska Sobota", "Ptuj", "Kamnik", "Domžale",
  "Škofja Loka", "Postojna", "Bled",
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0]![0] ?? "") + (parts[1]![0] ?? "");
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sl-SI", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Status / format badge colours ─────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  open:      "text-[#4be277] bg-[#4be277]/10 border-[#4be277]/20",
  full:      "text-amber-400 bg-amber-400/10 border-amber-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  completed: "text-[#6b7280] bg-[#1b1c1c] border-[#2a2a2a]",
};
const FORMAT_COLOR: Record<string, string> = {
  singles: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  doubles: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  both:    "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
};

// ── Main page ──────────────────────────────────────────────────────────────────

export default function TournamentsPage() {
  const { t: tr } = useT();

  const { data: rawTournaments, refetch } = trpc.tournament.list.useQuery({ limit: 30 });
  const tournaments = (rawTournaments ?? []) as unknown as TournamentItem[];
  const { data: profile } = trpc.player.getProfile.useQuery();

  // — Join state —
  const [joinTournamentId, setJoinTournamentId] = useState<string | null>(null);
  const [joinPlayFormat, setJoinPlayFormat] = useState<"singles" | "doubles">("singles");
  const joinTournament = tournaments.find((t) => t.id === joinTournamentId);

  const joinMutation = trpc.tournament.join.useMutation({
    onSuccess: () => { setJoinTournamentId(null); void refetch(); },
  });

  // — Withdraw state —
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const withdrawMutation = trpc.tournament.withdraw.useMutation({
    onSuccess: () => { void refetch(); setWithdrawingId(null); },
    onError: () => setWithdrawingId(null),
  });

  // — Create state —
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createCity, setCreateCity] = useState("");
  const [createVenue, setCreateVenue] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createMaxSpots, setCreateMaxSpots] = useState(8);
  const [createFormat, setCreateFormat] = useState<"singles" | "doubles" | "both">("singles");

  const createMutation = trpc.tournament.create.useMutation({
    onSuccess: () => {
      setShowCreate(false);
      setCreateName(""); setCreateDesc(""); setCreateCity("");
      setCreateVenue(""); setCreateDate("");
      setCreateMaxSpots(8); setCreateFormat("singles");
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

  const openJoinModal = (t: TournamentItem, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setJoinPlayFormat("singles");
    setJoinTournamentId(t.id);
  };

  const handleJoin = () => {
    if (!joinTournamentId) return;
    joinMutation.mutate({ tournament_id: joinTournamentId, play_format: joinPlayFormat });
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-[#131313] pb-36">

      {/* ── Tournament list ───────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-8">
        <p className="text-[#6b7280] text-[10px] font-black uppercase tracking-widest mb-4">
          All Tournaments
        </p>

        {tournaments.length === 0 ? (
          <div className="bg-[#1b1c1c] rounded-3xl border border-dashed border-[#2a2a2a] p-12 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
            >
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p className="font-black text-white text-lg mb-1">{tr.tournaments.noTournaments}</p>
            <p className="text-sm text-[#6b7280] mb-5">{tr.tournaments.beFirstCreate}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 font-black text-black rounded-2xl text-sm shadow-lg shadow-green-500/20"
              style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
            >
              {tr.tournaments.createTournament}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => {
              const spotsLeft = t.max_spots - t.participant_count;
              const isLive = t.status === "open" && new Date(t.scheduled_at) <= new Date();
              return (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.id}`}
                  className={`block relative bg-[#1b1c1c] rounded-2xl overflow-hidden
                    ${isLive ? "border border-[#4be277]/30" : "border border-transparent hover:border-[#4be277]/20"}
                    transition-colors`}
                >
                  {/* Live badge */}
                  {isLive && (
                    <span className="absolute top-3 left-3 bg-[#4be277] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest z-10">
                      LIVE
                    </span>
                  )}

                  {/* Kinetic right accent strip */}
                  <div
                    className="absolute top-0 right-0 w-1 h-full"
                    style={{ background: "linear-gradient(180deg, #4be277 0%, #22c55e 50%, #16a34a 100%)" }}
                  />

                  <div className="p-4 pl-4 pr-5">
                    {/* Name + join */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        {isLive && <div className="h-5" />}
                        <h3 className="font-black text-white text-base truncate">{t.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${STATUS_COLOR[t.status] ?? STATUS_COLOR.open}`}>
                            {tr.tournaments[t.status as keyof typeof tr.tournaments] ?? t.status}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${FORMAT_COLOR[t.format] ?? FORMAT_COLOR.singles}`}>
                            {tr.tournaments[t.format as keyof typeof tr.tournaments] ?? t.format}
                          </span>
                        </div>
                      </div>

                      {t.creator_id !== profile?.id && t.status === "open" && (
                        <button
                          onClick={(e) => openJoinModal(t, e)}
                          className="shrink-0 px-3 py-1.5 text-black text-xs font-black rounded-xl shadow-lg shadow-green-500/20"
                          style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
                        >
                          {tr.common.join}
                        </button>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-[#6b7280]">
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                        </svg>
                        {formatDate(t.scheduled_at)}
                        {t.location_city && ` · ${t.location_city}`}
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {t.participant_count}/{t.max_spots}
                        {spotsLeft > 0 && t.status === "open" && (
                          <span className="text-[#4be277] font-semibold">· {spotsLeft} spots left</span>
                        )}
                      </div>

                      {t.creator && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-black text-[9px] font-black shrink-0"
                            style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
                          >
                            {t.creator.full_name[0]}
                          </div>
                          <span>{tr.tournaments.by} {t.creator.full_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FAB: Create Tournament ────────────────────────────────────────────── */}
      <button
        onClick={() => setShowCreate(true)}
        aria-label="Create tournament"
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full shadow-2xl shadow-green-500/30 flex items-center justify-center z-40 transition-transform active:scale-95"
        style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      {/* ── Create tournament modal ───────────────────────────────────────────── */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div className="bg-[#1b1c1c] rounded-t-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto">
            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#2a2a2a]" />
            </div>

            <div className="px-5 pb-8 pt-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white">{tr.tournaments.createTournament}</h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#202020] hover:bg-[#2a2a2a] text-[#6b7280] hover:text-white transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[9px] font-black text-[#6b7280] uppercase tracking-wider mb-1.5">
                  {tr.tournaments.name} *
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={tr.tournaments.namePlaceholder}
                  className="w-full px-4 py-3 border border-[#2a2a2a] bg-[#202020] text-white rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#4be277]/40 placeholder-[#4b5563]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9px] font-black text-[#6b7280] uppercase tracking-wider mb-1.5">
                  {tr.tournaments.description}
                </label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  rows={2} maxLength={500}
                  placeholder={tr.tournaments.descPlaceholder}
                  className="w-full px-4 py-3 border border-[#2a2a2a] bg-[#202020] text-white rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#4be277]/40 placeholder-[#4b5563] resize-none"
                />
              </div>

              {/* Date + city */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-[#6b7280] uppercase tracking-wider mb-1.5">
                    {tr.tournaments.dateTime} *
                  </label>
                  <input
                    type="datetime-local"
                    value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)}
                    className="w-full px-3 py-3 border border-[#2a2a2a] bg-[#202020] text-white rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#4be277]/40"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#6b7280] uppercase tracking-wider mb-1.5">
                    {tr.tournaments.city}
                  </label>
                  <select
                    value={createCity}
                    onChange={(e) => setCreateCity(e.target.value)}
                    className="w-full px-3 py-3 border border-[#2a2a2a] bg-[#202020] text-white rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#4be277]/40"
                  >
                    <option value="">{tr.tournaments.selectCity}</option>
                    {SLOVENIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Format + max spots */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-[#6b7280] uppercase tracking-wider mb-1.5">
                    {tr.tournaments.format}
                  </label>
                  <select
                    value={createFormat}
                    onChange={(e) => setCreateFormat(e.target.value as "singles" | "doubles" | "both")}
                    className="w-full px-3 py-3 border border-[#2a2a2a] bg-[#202020] text-white rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#4be277]/40"
                  >
                    <option value="singles">{tr.tournaments.singles}</option>
                    <option value="doubles">{tr.tournaments.doubles}</option>
                    <option value="both">{tr.tournaments.both}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#6b7280] uppercase tracking-wider mb-1.5">
                    {tr.tournaments.maxSpots}
                  </label>
                  <input
                    type="number"
                    value={createMaxSpots}
                    min={2} max={64}
                    onChange={(e) => setCreateMaxSpots(Math.min(64, Math.max(2, Number(e.target.value))))}
                    className="w-full px-3 py-3 border border-[#2a2a2a] bg-[#202020] text-white rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#4be277]/40"
                  />
                </div>
              </div>

              {createMutation.error && (
                <p className="text-sm text-red-400">{createMutation.error.message}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border border-[#2a2a2a] text-[#9ca3af] font-semibold rounded-xl
                    hover:bg-[#202020] hover:text-white transition-colors text-sm"
                >
                  {tr.common.cancel}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!createName.trim() || !createDate || createMutation.isPending}
                  className="flex-1 py-3 text-black font-black rounded-xl shadow-lg shadow-green-500/20
                    disabled:opacity-50 transition-opacity text-sm"
                  style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
                >
                  {createMutation.isPending ? tr.common.creating : tr.common.create}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Join modal ────────────────────────────────────────────────────────── */}
      {joinTournamentId && joinTournament && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setJoinTournamentId(null); }}
        >
          <div className="bg-[#1b1c1c] rounded-t-2xl w-full max-w-lg">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#2a2a2a]" />
            </div>

            <div className="px-5 pb-8 pt-3">
              <h2 className="text-lg font-black text-white mb-1">{tr.tournaments.joinTournament}</h2>
              <p className="text-sm text-[#6b7280] mb-5">{joinTournament.name}</p>

              <p className="text-[9px] font-black text-[#6b7280] uppercase tracking-wider mb-3">
                {tr.tournaments.howWillYouPlay}
              </p>

              <div className="space-y-2 mb-5">
                {(joinTournament.format === "singles" || joinTournament.format === "both") && (
                  <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors
                    ${joinPlayFormat === "singles" ? "border-[#4be277]/50 bg-[#4be277]/5" : "border-[#2a2a2a] hover:border-[#333]"}`}>
                    <input
                      type="radio" name="play_format" value="singles"
                      checked={joinPlayFormat === "singles"}
                      onChange={() => setJoinPlayFormat("singles")}
                      className="accent-[#4be277]"
                    />
                    <span className="text-sm font-bold text-white">{tr.tournaments.singles}</span>
                  </label>
                )}
                {(joinTournament.format === "doubles" || joinTournament.format === "both") && (
                  <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors
                    ${joinPlayFormat === "doubles" ? "border-[#4be277]/50 bg-[#4be277]/5" : "border-[#2a2a2a] hover:border-[#333]"}`}>
                    <input
                      type="radio" name="play_format" value="doubles"
                      checked={joinPlayFormat === "doubles"}
                      onChange={() => setJoinPlayFormat("doubles")}
                      className="accent-[#4be277]"
                    />
                    <span className="text-sm font-bold text-white">{tr.tournaments.doubles}</span>
                  </label>
                )}
              </div>

              {joinMutation.error && (
                <p className="text-sm text-red-400 mb-3">{joinMutation.error.message}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setJoinTournamentId(null)}
                  className="flex-1 py-3 border border-[#2a2a2a] text-[#9ca3af] font-semibold rounded-xl
                    hover:bg-[#202020] hover:text-white transition-colors text-sm"
                >
                  {tr.common.cancel}
                </button>
                <button
                  onClick={handleJoin}
                  disabled={joinMutation.isPending}
                  className="flex-1 py-3 text-black font-black rounded-xl shadow-lg shadow-green-500/20
                    disabled:opacity-50 transition-opacity text-sm"
                  style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
                >
                  {joinMutation.isPending ? tr.common.joining : tr.common.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

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

export default function TournamentsPage() {
  const { t: tr } = useT();
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

  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createCity, setCreateCity] = useState("");
  const [createVenue, setCreateVenue] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createMaxSpots, setCreateMaxSpots] = useState(8);
  const [createFormat, setCreateFormat] = useState<"singles" | "doubles" | "both">("singles");

  const [joinTournamentId, setJoinTournamentId] = useState<string | null>(null);
  const [joinPlayFormat, setJoinPlayFormat] = useState<"singles" | "doubles">("singles");
  const joinTournament = tournaments.find((t) => t.id === joinTournamentId);

  const createMutation = trpc.tournament.create.useMutation({
    onSuccess: () => {
      setShowCreate(false);
      setCreateName(""); setCreateDesc(""); setCreateCity(""); setCreateVenue(""); setCreateDate("");
      setCreateMaxSpots(8); setCreateFormat("singles");
      void refetch();
    },
  });

  const joinMutation = trpc.tournament.join.useMutation({
    onSuccess: () => { setJoinTournamentId(null); void refetch(); },
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

  const STATUS_COLOR: Record<string, string> = {
    open: "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20",
    full: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
    completed: "text-[#6b7280] bg-[#1e1e1e] border-[#2a2a2a]",
  };
  const FORMAT_COLOR: Record<string, string> = {
    singles: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    doubles: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    both: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-[#0a0a0a] px-4 sm:px-6 pt-6 pb-32">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#22c55e] text-xs font-bold uppercase tracking-widest mb-1">TOURNAMENTS</p>
          <h1 className="text-2xl font-black text-white">{tr.tournaments.title}</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-[#22c55e] text-black font-black rounded-2xl hover:bg-[#16a34a] transition-colors text-sm shadow-lg shadow-green-500/20"
        >
          + {tr.tournaments.create}
        </button>
      </div>

      {/* Tournament list */}
      {tournaments.length === 0 ? (
        <div className="bg-[#141414] rounded-3xl border border-dashed border-[#222] p-12 text-center">
          <p className="text-5xl mb-4">🏆</p>
          <p className="font-black text-white text-lg">{tr.tournaments.noTournaments}</p>
          <p className="text-sm text-[#6b7280] mt-1 mb-5">{tr.tournaments.beFirstCreate}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-[#22c55e] text-black font-black rounded-2xl hover:bg-[#16a34a] transition-colors text-sm shadow-lg shadow-green-500/20"
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
                className="block bg-[#141414] rounded-3xl border border-[#222] p-5 hover:border-[#22c55e]/30 transition-colors"
              >
                {/* Live badge + name */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    {isLive && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                        <span className="text-[10px] font-black text-[#22c55e] uppercase tracking-widest">LIVE NOW</span>
                      </div>
                    )}
                    <h3 className="font-black text-white text-base truncate">{t.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${STATUS_COLOR[t.status] ?? STATUS_COLOR.open}`}>
                        {tr.tournaments[t.status as keyof typeof tr.tournaments] ?? t.status}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${FORMAT_COLOR[t.format] ?? FORMAT_COLOR.singles}`}>
                        {tr.tournaments[t.format as keyof typeof tr.tournaments] ?? t.format}
                      </span>
                    </div>
                  </div>

                  {t.creator_id !== profile?.id && t.status === "open" && (
                    <button
                      onClick={(e) => openJoinModal(t, e)}
                      className="shrink-0 px-4 py-2 bg-[#22c55e] text-black text-sm font-black rounded-xl hover:bg-[#16a34a] transition-colors shadow-lg shadow-green-500/20"
                    >
                      {tr.common.join}
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm text-[#6b7280]">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                    </svg>
                    {new Date(t.scheduled_at).toLocaleDateString("sl-SI", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {t.location_city && ` · ${t.location_city}`}
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {t.participant_count}/{t.max_spots}
                    {spotsLeft > 0 && t.status === "open" && (
                      <span className="text-[#22c55e] font-semibold">· {spotsLeft} spots left</span>
                    )}
                  </div>

                  {t.creator && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#22c55e] flex items-center justify-center text-black text-[9px] font-black shrink-0">
                        {t.creator.full_name[0]}
                      </div>
                      <span>{tr.tournaments.by} {t.creator.full_name}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#141414] border border-[#222] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">{tr.tournaments.createTournament}</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#6b7280] hover:text-white transition-colors">
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{tr.tournaments.name} *</label>
                <input type="text" value={createName} onChange={(e) => setCreateName(e.target.value)}
                  placeholder={tr.tournaments.namePlaceholder}
                  className="w-full px-3.5 py-2.5 border border-[#222] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 placeholder-[#4b5563]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{tr.tournaments.description}</label>
                <textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} rows={2} maxLength={500}
                  placeholder={tr.tournaments.descPlaceholder}
                  className="w-full px-3.5 py-2.5 border border-[#222] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 placeholder-[#4b5563] resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{tr.tournaments.dateTime} *</label>
                <input type="datetime-local" value={createDate} onChange={(e) => setCreateDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#222] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{tr.tournaments.city}</label>
                  <select value={createCity} onChange={(e) => setCreateCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#222] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50">
                    <option value="">{tr.tournaments.selectCity}</option>
                    {SLOVENIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{tr.tournaments.format}</label>
                  <select value={createFormat} onChange={(e) => setCreateFormat(e.target.value as "singles" | "doubles" | "both")}
                    className="w-full px-3.5 py-2.5 border border-[#222] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50">
                    <option value="singles">{tr.tournaments.singles}</option>
                    <option value="doubles">{tr.tournaments.doubles}</option>
                    <option value="both">{tr.tournaments.both}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{tr.tournaments.maxSpots}</label>
                <input type="number" value={createMaxSpots} min={2} max={64}
                  onChange={(e) => setCreateMaxSpots(Math.min(64, Math.max(2, Number(e.target.value))))}
                  className="w-full px-3.5 py-2.5 border border-[#222] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50" />
              </div>
              {createMutation.error && <p className="text-sm text-red-400">{createMutation.error.message}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border border-[#222] text-[#9ca3af] font-semibold rounded-2xl hover:bg-[#1a1a1a] hover:text-white transition-colors text-sm">
                  {tr.common.cancel}
                </button>
                <button onClick={handleCreate} disabled={!createName.trim() || !createDate || createMutation.isPending}
                  className="flex-1 py-3 bg-[#22c55e] text-black font-black rounded-2xl hover:bg-[#16a34a] disabled:opacity-50 transition-colors text-sm shadow-lg shadow-green-500/20">
                  {createMutation.isPending ? tr.common.creating : tr.common.create}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join modal */}
      {joinTournamentId && joinTournament && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#141414] border border-[#222] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5">
            <h2 className="text-lg font-black text-white mb-1">{tr.tournaments.joinTournament}</h2>
            <p className="text-sm text-[#6b7280] mb-5">{joinTournament.name}</p>
            <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-3">{tr.tournaments.howWillYouPlay}</p>
            <div className="space-y-2">
              {(joinTournament.format === "singles" || joinTournament.format === "both") && (
                <label className={`flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer transition-colors ${joinPlayFormat === "singles" ? "border-[#22c55e]/50 bg-[#22c55e]/5" : "border-[#222] hover:border-[#333]"}`}>
                  <input type="radio" name="play_format" value="singles" checked={joinPlayFormat === "singles"} onChange={() => setJoinPlayFormat("singles")} className="accent-[#22c55e]" />
                  <span className="text-sm font-bold text-white">{tr.tournaments.singles}</span>
                </label>
              )}
              {(joinTournament.format === "doubles" || joinTournament.format === "both") && (
                <label className={`flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer transition-colors ${joinPlayFormat === "doubles" ? "border-[#22c55e]/50 bg-[#22c55e]/5" : "border-[#222] hover:border-[#333]"}`}>
                  <input type="radio" name="play_format" value="doubles" checked={joinPlayFormat === "doubles"} onChange={() => setJoinPlayFormat("doubles")} className="accent-[#22c55e]" />
                  <span className="text-sm font-bold text-white">{tr.tournaments.doubles}</span>
                </label>
              )}
            </div>
            {joinMutation.error && <p className="text-sm text-red-400 mt-3">{joinMutation.error.message}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setJoinTournamentId(null)}
                className="flex-1 py-3 border border-[#222] text-[#9ca3af] font-semibold rounded-2xl hover:bg-[#1a1a1a] hover:text-white transition-colors text-sm">
                {tr.common.cancel}
              </button>
              <button onClick={handleJoin} disabled={joinMutation.isPending}
                className="flex-1 py-3 bg-[#22c55e] text-black font-black rounded-2xl hover:bg-[#16a34a] disabled:opacity-50 transition-colors text-sm shadow-lg shadow-green-500/20">
                {joinMutation.isPending ? tr.common.joining : tr.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

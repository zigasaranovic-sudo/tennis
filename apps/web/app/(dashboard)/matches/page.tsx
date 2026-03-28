"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";
import type { SkillLevel, MatchFormat } from "@tenis/types";

// ── types ──────────────────────────────────────────────────────────────────

type Tab = "open" | "mymatches" | "requests";
type MyMatchTab = "upcoming" | "history";

type SetScore = { p1: number; p2: number };
type MatchItem = {
  id: string;
  player1: { id: string; full_name: string } | null;
  player2: { id: string; full_name: string } | null;
  scheduled_at: string | null;
  played_at: string | null;
  location_city: string | null;
  format: string | null;
  winner_id: string | null;
  score_detail: SetScore[] | null;
};

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

// ── constants ──────────────────────────────────────────────────────────────

const SLOVENIAN_CITIES = [
  "Ljubljana", "Maribor", "Celje", "Kranj", "Koper", "Novo Mesto",
  "Velenje", "Nova Gorica", "Murska Sobota", "Ptuj", "Kamnik", "Domžale",
  "Škofja Loka", "Postojna", "Bled",
];

function formatScore(sets: SetScore[], isP1: boolean): string {
  return sets.map((s) => (isP1 ? `${s.p1}-${s.p2}` : `${s.p2}-${s.p1}`)).join(", ");
}

// ── main component ─────────────────────────────────────────────────────────

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="h-10" />}>
      <MatchesContent />
    </Suspense>
  );
}

function MatchesContent() {
  const { t } = useT();
  const searchParams = useSearchParams();
  const rawTabParam = searchParams.get("tab");
  const validTabs: Tab[] = ["open", "mymatches", "requests"];
  const initialTab = validTabs.includes(rawTabParam as Tab) ? (rawTabParam as Tab) : "open";
  const [tab, setTab] = useState<Tab>(initialTab);

  const SKILL_LABELS: Record<SkillLevel, string> = {
    beginner: t.skills.beginner,
    intermediate: t.skills.intermediate,
    advanced: t.skills.advanced,
    professional: t.skills.professional,
  };

  const FORMAT_LABELS: Record<MatchFormat, string> = {
    best_of_1: t.formats.best_of_1,
    best_of_3: t.formats.best_of_3,
    best_of_5: t.formats.best_of_5,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "open", label: t.matches.tabOpen },
    { key: "mymatches", label: t.matches.tabMyMatches },
    { key: "requests", label: t.matches.requests },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-white">{t.matches.title}</h1>

      {/* Top-level tabs */}
      <div className="flex gap-1 bg-[#111111] border border-[#1e1e1e] rounded-xl p-1 overflow-x-auto">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              tab === tb.key
                ? "bg-[#22c55e] text-white shadow-lg shadow-green-500/20"
                : "text-[#6b7280] hover:text-white"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "open" && <OpenMatchesTab skillLabels={SKILL_LABELS} formatLabels={FORMAT_LABELS} />}
      {tab === "mymatches" && <MyMatchesTab skillLabels={SKILL_LABELS} />}
      {tab === "requests" && <RequestsTab />}
    </div>
  );
}

// ── Open Matches tab ───────────────────────────────────────────────────────

function OpenMatchesTab({
  skillLabels,
  formatLabels,
}: {
  skillLabels: Record<SkillLevel, string>;
  formatLabels: Record<MatchFormat, string>;
}) {
  const { t } = useT();
  const [cityFilter, setCityFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formScheduledAt, setFormScheduledAt] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSkillMin, setFormSkillMin] = useState<SkillLevel | "">("");
  const [formSkillMax, setFormSkillMax] = useState<SkillLevel | "">("");
  const [formFormat, setFormFormat] = useState<MatchFormat>("best_of_3");
  const [formMessage, setFormMessage] = useState("");

  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: clubs } = trpc.player.getClubs.useQuery();
  const { data: rawMatches, refetch } = trpc.openMatch.list.useQuery({
    city: cityFilter || undefined,
    limit: 20,
  });

  const joinMutation = trpc.openMatch.join.useMutation({
    onSuccess: (_, vars) => {
      setJoinedIds((prev) => { const n = new Set(prev); n.add(vars.open_match_id); return n; });
      void refetch();
    },
  });

  const deleteMutation = trpc.openMatch.delete.useMutation({
    onSuccess: () => void refetch(),
    onSettled: () => setDeletingId(null),
  });

  const createMutation = trpc.openMatch.create.useMutation({
    onSuccess: () => {
      setShowModal(false);
      setFormScheduledAt(""); setFormCity(""); setFormLocation("");
      setFormSkillMin(""); setFormSkillMax("");
      setFormFormat("best_of_3"); setFormMessage("");
      void refetch();
    },
  });

  const openMatchList = (rawMatches ?? []) as unknown as OpenMatchItem[];

  const handleJoin = (id: string) => {
    setJoiningId(id);
    joinMutation.mutate({ open_match_id: id }, { onSettled: () => setJoiningId(null) });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate({ open_match_id: id });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formScheduledAt) return;
    createMutation.mutate({
      scheduled_at: new Date(formScheduledAt).toISOString(),
      location_city: formCity || undefined,
      location_name: formLocation || undefined,
      skill_min: (formSkillMin as SkillLevel) || undefined,
      skill_max: (formSkillMax as SkillLevel) || undefined,
      format: formFormat,
      message: formMessage || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6b7280]">{t.openMatches.subtitle}</p>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#22c55e] text-white font-bold rounded-xl hover:bg-[#16a34a] transition-colors text-sm shadow-lg shadow-green-500/20"
        >
          {t.openMatches.postMatch}
        </button>
      </div>

      {/* City filter */}
      <div className="flex gap-2">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-[#2a2a2a] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
        >
          <option value="">{t.openMatches.allCities}</option>
          {SLOVENIAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {cityFilter && (
          <button
            onClick={() => setCityFilter("")}
            className="px-3 py-2 text-sm text-[#6b7280] hover:text-white border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] transition-colors"
          >
            {t.common.clearFilters}
          </button>
        )}
      </div>

      {/* Match list */}
      {openMatchList.length === 0 ? (
        <div className="bg-[#111111] rounded-2xl border border-dashed border-[#2a2a2a] p-12 text-center">
          <p className="text-4xl mb-4">🎾</p>
          <p className="font-bold text-white">{t.openMatches.noMatches}</p>
          <p className="text-sm text-[#6b7280] mt-1">{t.openMatches.beFirst}</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-block px-4 py-2 bg-[#22c55e] text-white font-bold rounded-xl hover:bg-[#16a34a] transition-colors text-sm"
          >
            {t.openMatches.postMatch}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {openMatchList.map((match) => {
            const isJoined = joinedIds.has(match.id);
            const isJoining = joiningId === match.id;
            const isOwn = match.creator_id === profile?.id;
            const isDeleting = deletingId === match.id;
            const date = new Date(match.scheduled_at);
            const creator = match.creator;
            const creatorInitial = (creator?.full_name?.[0] ?? creator?.username?.[0] ?? "?").toUpperCase();

            return (
              <div key={match.id} className="bg-[#111111] rounded-2xl border border-[#1e1e1e] p-4 hover:border-[#2a2a2a] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#22c55e] flex items-center justify-center text-white font-black text-base flex-shrink-0 overflow-hidden shadow-lg shadow-green-500/10">
                    {creator?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={creator.avatar_url} alt={creator.full_name ?? "Player"} className="w-11 h-11 rounded-full object-cover" />
                    ) : creatorInitial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">
                        {creator?.full_name ?? creator?.username ?? "A player"}
                      </span>
                      {isOwn && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] font-bold">
                          {t.openMatches.yourPost}
                        </span>
                      )}
                      {creator?.skill_level && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-[#9ca3af] capitalize">
                          {skillLabels[creator.skill_level as SkillLevel] ?? creator.skill_level}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs text-[#6b7280]">
                      <span>📅 {date.toLocaleDateString("sl-SI", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {(match.location_city || match.location_name) && (
                        <span>📍 {[match.location_city, match.location_name].filter(Boolean).join(" · ")}</span>
                      )}
                      <span className="capitalize text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full">
                        {formatLabels[match.format as MatchFormat] ?? match.format}
                      </span>
                    </div>
                    {(match.skill_min || match.skill_max) && (
                      <p className="mt-1 text-[11px] text-[#4b5563]">
                        {t.openMatches.level}: {match.skill_min ? (skillLabels[match.skill_min as SkillLevel] ?? match.skill_min) : t.openMatches.any}
                        {" – "}
                        {match.skill_max ? (skillLabels[match.skill_max as SkillLevel] ?? match.skill_max) : t.openMatches.any}
                      </p>
                    )}
                    {match.message && (
                      <p className="mt-1.5 text-sm text-[#9ca3af] italic">&ldquo;{match.message}&rdquo;</p>
                    )}
                  </div>

                  {isOwn ? (
                    <button
                      onClick={() => handleDelete(match.id)}
                      disabled={isDeleting}
                      className="flex-shrink-0 px-3 py-2 text-sm font-semibold text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                    >
                      {isDeleting ? "…" : t.common.delete}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(match.id)}
                      disabled={isJoined || isJoining || joinMutation.isPending}
                      className={`flex-shrink-0 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
                        isJoined
                          ? "bg-[#1a1a1a] border border-[#2a2a2a] text-[#4b5563] cursor-default"
                          : "bg-[#22c55e] text-white hover:bg-[#16a34a] disabled:opacity-70 shadow-lg shadow-green-500/20"
                      }`}
                    >
                      {isJoined ? t.openMatches.joined : isJoining ? t.common.joining : t.common.join}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post a match modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-[#111111] rounded-2xl border border-[#2a2a2a] shadow-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">{t.openMatches.postMatch}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#6b7280] hover:text-white transition-colors text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{t.openMatches.dateTime} *</label>
                <input
                  type="datetime-local"
                  value={formScheduledAt}
                  onChange={(e) => setFormScheduledAt(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2.5 border border-[#2a2a2a] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{t.profile.city}</label>
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#2a2a2a] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                >
                  <option value="">{profile?.city ?? t.profile.selectCity}</option>
                  {SLOVENIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{t.openMatches.venue} ({t.common.optional})</label>
                <select
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#2a2a2a] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                >
                  <option value="">{t.profile.selectClub}</option>
                  {(clubs ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{t.openMatches.format}</label>
                <select
                  value={formFormat}
                  onChange={(e) => setFormFormat(e.target.value as MatchFormat)}
                  className="w-full px-3 py-2.5 border border-[#2a2a2a] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                >
                  {Object.entries(formatLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label as string}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{t.openMatches.minLevel}</label>
                  <select
                    value={formSkillMin}
                    onChange={(e) => setFormSkillMin(e.target.value as SkillLevel | "")}
                    className="w-full px-3 py-2.5 border border-[#2a2a2a] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                  >
                    <option value="">{t.openMatches.any}</option>
                    {Object.entries(skillLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{t.openMatches.maxLevel}</label>
                  <select
                    value={formSkillMax}
                    onChange={(e) => setFormSkillMax(e.target.value as SkillLevel | "")}
                    className="w-full px-3 py-2.5 border border-[#2a2a2a] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                  >
                    <option value="">{t.openMatches.any}</option>
                    {Object.entries(skillLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-1.5">{t.openMatches.message} ({t.common.optional})</label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder={t.openMatches.messagePlaceholder}
                  className="w-full px-3 py-2.5 border border-[#2a2a2a] bg-[#1a1a1a] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 placeholder-[#4b5563] resize-none"
                />
                <p className="text-xs text-[#4b5563] mt-1 text-right">{formMessage.length}/300</p>
              </div>
              {createMutation.error && (
                <p className="text-sm text-red-400">{createMutation.error.message}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[#2a2a2a] text-[#9ca3af] font-semibold rounded-xl hover:bg-[#1a1a1a] hover:text-white transition-colors text-sm"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!formScheduledAt || createMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-[#22c55e] text-white font-bold rounded-xl hover:bg-[#16a34a] disabled:opacity-70 transition-colors text-sm shadow-lg shadow-green-500/20"
                >
                  {createMutation.isPending ? t.common.posting : t.common.post}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── My Matches tab ─────────────────────────────────────────────────────────

function MyMatchesTab({ skillLabels: _skillLabels }: { skillLabels: Record<SkillLevel, string> }) {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<MyMatchTab>("upcoming");

  const { data: upcoming } = trpc.match.getMyMatches.useQuery({ status: "accepted", limit: 20 });
  const { data: pendingConfirmation } = trpc.match.getMyMatches.useQuery({ status: "pending_confirmation", limit: 10 });
  const { data: history } = trpc.match.getMyMatches.useQuery({ status: "completed", limit: 20 });
  const { data: profile } = trpc.player.getProfile.useQuery();

  const subTabs: { key: MyMatchTab; label: string; count?: number }[] = [
    { key: "upcoming", label: t.matches.upcoming, count: (upcoming?.length ?? 0) + (pendingConfirmation?.length ?? 0) },
    { key: "history", label: t.matches.history },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[#111111] border border-[#1e1e1e] rounded-xl p-1">
          {subTabs.map((st) => (
            <button
              key={st.key}
              onClick={() => setActiveTab(st.key)}
              className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === st.key
                  ? "bg-[#22c55e] text-white shadow-lg shadow-green-500/20"
                  : "text-[#6b7280] hover:text-white"
              }`}
            >
              {st.label}
              {st.count ? (
                <span className="bg-white/20 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                  {st.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <Link
          href="/players"
          className="px-4 py-2 bg-[#22c55e] text-white font-bold rounded-xl hover:bg-[#16a34a] transition-colors text-sm shadow-lg shadow-green-500/20"
        >
          {t.matches.findMatch}
        </Link>
      </div>

      {/* Upcoming */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {pendingConfirmation && pendingConfirmation.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-orange-400 mb-2">{t.matches.awaitingConfirmation}</h2>
              {(pendingConfirmation as unknown as MatchItem[]).map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="block bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-colors mb-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">
                        vs {match.player1?.id === profile?.id ? match.player2?.full_name : match.player1?.full_name}
                      </p>
                      <p className="text-sm text-orange-400 mt-0.5">{t.matches.resultSubmitted}</p>
                    </div>
                    <span className="text-orange-400">›</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {upcoming && upcoming.length > 0 ? (
            (upcoming as unknown as MatchItem[]).map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block bg-[#111111] border border-[#1e1e1e] rounded-2xl p-4 hover:border-[#22c55e]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#22c55e]/10 rounded-xl flex items-center justify-center text-xl shrink-0">🎾</div>
                    <div>
                      <p className="font-bold text-white">
                        vs {match.player1?.id === profile?.id ? match.player2?.full_name : match.player1?.full_name}
                      </p>
                      <p className="text-sm text-[#6b7280]">
                        {match.scheduled_at
                          ? new Date(match.scheduled_at).toLocaleDateString("sl-SI", { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : t.matches.timeTBD}
                        {match.location_city && ` · ${match.location_city}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-1 rounded-full capitalize">
                    {match.format?.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            !pendingConfirmation?.length && (
              <div className="text-center py-12 bg-[#111111] border border-dashed border-[#2a2a2a] rounded-2xl">
                <p className="text-4xl mb-4">🎾</p>
                <p className="font-bold text-white">{t.matches.noUpcoming}</p>
                <Link href="/players" className="mt-3 inline-block text-sm text-[#22c55e] font-semibold hover:text-green-400">
                  {t.matches.findPlayer}
                </Link>
              </div>
            )
          )}
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {history && history.length > 0 ? (
            (history as unknown as MatchItem[]).map((match) => {
              const isP1 = match.player1?.id === profile?.id;
              const opponent = isP1 ? match.player2 : match.player1;
              const won = match.winner_id === profile?.id;
              const scoreStr = match.score_detail && match.score_detail.length > 0
                ? formatScore(match.score_detail, isP1)
                : null;
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="flex items-center justify-between bg-[#111111] border border-[#1e1e1e] rounded-2xl p-4 hover:border-[#22c55e]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-2.5 py-1.5 rounded-xl ${won ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {won ? "WIN" : "LOSS"}
                    </span>
                    <div>
                      <p className="font-bold text-white">vs {opponent?.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {scoreStr && <p className="text-sm font-mono text-[#9ca3af]">{scoreStr}</p>}
                        {match.format && (
                          <span className="text-[10px] text-[#4b5563] bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded-md">
                            {match.format.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#4b5563] mt-0.5">
                        {match.played_at ? new Date(match.played_at).toLocaleDateString("sl-SI") : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[#2a2a2a]">›</span>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12 bg-[#111111] border border-dashed border-[#2a2a2a] rounded-2xl">
              <p className="text-4xl mb-4">📊</p>
              <p className="font-bold text-white">{t.matches.noHistory}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Requests tab ───────────────────────────────────────────────────────────

function RequestsTab() {
  const { t } = useT();
  const { data: requests } = trpc.match.getRequests.useQuery({ type: "all", status: "pending", limit: 20 });
  const { data: profile } = trpc.player.getProfile.useQuery();
  const respondToRequest = trpc.match.respondToRequest.useMutation();

  return (
    <div className="space-y-3">
      {requests && requests.length > 0 ? (
        requests.map((req) => {
          const isIncoming = req.recipient_id === profile?.id;
          const otherPlayer = isIncoming ? req.requester : req.recipient;
          return (
            <div key={req.id} className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-4 hover:border-[#2a2a2a] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isIncoming ? "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20" : "text-[#6b7280] bg-[#1e1e1e] border-[#2a2a2a]"}`}>
                      {isIncoming ? t.matches.incoming : t.matches.sent}
                    </span>
                    <span className="text-xs text-[#4b5563]">
                      {new Date(req.created_at).toLocaleDateString("sl-SI")}
                    </span>
                  </div>
                  <p className="font-bold text-white">
                    {(otherPlayer as { full_name?: string })?.full_name}
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {new Date(req.proposed_at).toLocaleDateString("sl-SI", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {req.location_city && ` · ${req.location_city}`}
                  </p>
                  {req.message && (
                    <p className="text-sm text-[#9ca3af] mt-1 italic">&ldquo;{req.message}&rdquo;</p>
                  )}
                </div>
                {isIncoming && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => respondToRequest.mutate({ request_id: req.id, response: "declined" })}
                      className="px-3 py-1.5 border border-[#2a2a2a] text-[#9ca3af] rounded-xl text-sm hover:bg-[#1a1a1a] hover:text-white transition-colors"
                    >
                      {t.matches.decline}
                    </button>
                    <button
                      onClick={() => respondToRequest.mutate({ request_id: req.id, response: "accepted" })}
                      className="px-3 py-1.5 bg-[#22c55e] text-white rounded-xl text-sm font-bold hover:bg-[#16a34a] transition-colors shadow-lg shadow-green-500/20"
                    >
                      {t.matches.accept}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 bg-[#111111] border border-dashed border-[#2a2a2a] rounded-2xl">
          <p className="text-4xl mb-4">📬</p>
          <p className="font-bold text-white">{t.matches.noPending}</p>
          <p className="text-sm text-[#6b7280] mt-1">{t.matches.findPlayer}</p>
        </div>
      )}
    </div>
  );
}

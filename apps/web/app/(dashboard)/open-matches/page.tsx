"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";
import type { SkillLevel, MatchFormat } from "@tenis/types";

const SLOVENIAN_CITIES = [
  "Ljubljana","Maribor","Celje","Kranj","Koper","Novo Mesto",
  "Velenje","Nova Gorica","Murska Sobota","Ptuj","Kamnik","Domžale",
  "Škofja Loka","Postojna","Bled",
];

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

export default function OpenMatchesPage() {
  const { t } = useT();

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
  const [cityFilter, setCityFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t.openMatches.title}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t.openMatches.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          {t.openMatches.postMatch}
        </button>
      </div>

      {/* City filter dropdown */}
      <div className="flex gap-2">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">{t.openMatches.allCities}</option>
          {SLOVENIAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {cityFilter && (
          <button
            onClick={() => setCityFilter("")}
            className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-lg"
          >
            Clear
          </button>
        )}
      </div>

      {/* Match list */}
      {openMatchList.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-12 text-center">
          <p className="text-4xl mb-4">🎾</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">{t.openMatches.noMatches}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t.openMatches.beFirst}</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
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
              <div
                key={match.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Creator avatar */}
                  <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-semibold text-lg flex-shrink-0 overflow-hidden">
                    {creator?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={creator.avatar_url} alt={creator.full_name ?? "Player"} className="w-11 h-11 rounded-full object-cover" />
                    ) : creatorInitial}
                  </div>

                  {/* Match info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-slate-100">
                        {creator?.full_name ?? creator?.username ?? "A player"}
                      </span>
                      {isOwn && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">{t.openMatches.yourPost}</span>}
                      {creator?.skill_level && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 capitalize">
                          {SKILL_LABELS[creator.skill_level as SkillLevel] ?? creator.skill_level}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 flex-wrap text-sm text-gray-500 dark:text-slate-400">
                      <span>📅 {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {(match.location_city || match.location_name) && (
                        <span>📍 {[match.location_city, match.location_name].filter(Boolean).join(" · ")}</span>
                      )}
                      <span className="capitalize text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        {FORMAT_LABELS[match.format as MatchFormat] ?? match.format}
                      </span>
                    </div>
                    {(match.skill_min || match.skill_max) && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                        Level: {match.skill_min ? (SKILL_LABELS[match.skill_min as SkillLevel] ?? match.skill_min) : "Any"}
                        {" – "}
                        {match.skill_max ? (SKILL_LABELS[match.skill_max as SkillLevel] ?? match.skill_max) : "Any"}
                      </p>
                    )}
                    {match.message && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 italic">&ldquo;{match.message}&rdquo;</p>
                    )}
                  </div>

                  {/* Action button */}
                  {isOwn ? (
                    <button
                      onClick={() => handleDelete(match.id)}
                      disabled={isDeleting}
                      className="flex-shrink-0 px-3 py-2 text-sm font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                    >
                      {isDeleting ? "…" : t.common.delete}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(match.id)}
                      disabled={isJoined || isJoining || joinMutation.isPending}
                      className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isJoined
                          ? "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-default"
                          : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-70"
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{t.openMatches.postMatch}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t.openMatches.dateTime} *</label>
                <input
                  type="datetime-local"
                  value={formScheduledAt}
                  onChange={(e) => setFormScheduledAt(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t.profile.city}</label>
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{profile?.city ?? "Select city…"}</option>
                  {SLOVENIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t.openMatches.venue} ({t.common.optional})</label>
                <select
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select venue…</option>
                  {(clubs ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t.openMatches.format}</label>
                <select
                  value={formFormat}
                  onChange={(e) => setFormFormat(e.target.value as MatchFormat)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {Object.entries(FORMAT_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t.openMatches.minLevel}</label>
                  <select
                    value={formSkillMin}
                    onChange={(e) => setFormSkillMin(e.target.value as SkillLevel | "")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{t.openMatches.any}</option>
                    {Object.entries(SKILL_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t.openMatches.maxLevel}</label>
                  <select
                    value={formSkillMax}
                    onChange={(e) => setFormSkillMax(e.target.value as SkillLevel | "")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{t.openMatches.any}</option>
                    {Object.entries(SKILL_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t.openMatches.message} ({t.common.optional})</label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder={t.openMatches.messagePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder-slate-500 resize-none"
                />
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-right">{formMessage.length}/300</p>
              </div>

              {createMutation.error && (
                <p className="text-sm text-red-500 dark:text-red-400">{createMutation.error.message}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!formScheduledAt || createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-70 transition-colors text-sm"
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

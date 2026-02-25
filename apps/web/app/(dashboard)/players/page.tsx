"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import type { SkillLevel } from "@tenis/types";

const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  professional: "Professional",
};

export default function PlayersPage() {
  const [name, setName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel | "">("");
  const [city, setCity] = useState("");
  const [club, setClub] = useState("");

  const { data: filterOptions } = trpc.player.getFilterOptions.useQuery(
    { city: city || undefined },
    { staleTime: 60_000 }
  );

  const { data, isFetching } = trpc.player.searchPlayers.useQuery({
    name: name.length >= 3 ? name : undefined,
    skill_level: (skillLevel as SkillLevel) || undefined,
    city: city || undefined,
    club: club || undefined,
    limit: 50,
  });

  const players = data?.players ?? [];

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setClub(""); // reset club when city changes
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Find Players</h1>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-3">
        {/* Name search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search by name (min. 3 letters)…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder-slate-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* City dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Any city</option>
              {(filterOptions?.cities ?? []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Club dropdown (filtered by city) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Club</label>
            <select
              value={club}
              onChange={(e) => setClub(e.target.value)}
              disabled={!filterOptions?.clubs?.length}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <option value="">Any club</option>
              {(filterOptions?.clubs ?? []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Skill level */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Skill Level</label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as SkillLevel | "")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All levels</option>
              {Object.entries(SKILL_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Players list */}
      {isFetching ? (
        <div className="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">Searching…</div>
      ) : players.length > 0 ? (
        <div className="space-y-2">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 shrink-0 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-semibold overflow-hidden">
                {player.avatar_url ? (
                  <img src={player.avatar_url} alt={player.full_name} className="w-full h-full object-cover" />
                ) : (
                  player.full_name[0]
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-slate-100 truncate text-sm">{player.full_name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                  {(player as { home_club?: string | null }).home_club
                    ? `🎾 ${(player as { home_club?: string | null }).home_club}`
                    : player.city
                    ? `📍 ${player.city}`
                    : `@${player.username}`}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {(player as { matches_played?: number }).matches_played != null &&
                  (player as { matches_played?: number }).matches_played! > 0 && (
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {Math.round(((player as { matches_won?: number }).matches_won ?? 0) / ((player as { matches_played?: number }).matches_played ?? 1) * 100)}%
                  </span>
                )}
                {player.skill_level && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 capitalize">
                    {SKILL_LABELS[player.skill_level as SkillLevel]}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-12 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">No players found</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {name.length > 0 && name.length < 3
              ? "Keep typing — search starts at 3 characters"
              : "Try adjusting your filters"}
          </p>
        </div>
      )}
    </div>
  );
}

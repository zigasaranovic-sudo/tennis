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
  const [skillLevel, setSkillLevel] = useState<SkillLevel | undefined>();
  const [city, setCity] = useState("");
  const [minElo, setMinElo] = useState("");
  const [maxElo, setMaxElo] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetching } =
    trpc.player.searchPlayers.useInfiniteQuery(
      {
        skill_level: skillLevel,
        city: city || undefined,
        min_elo: minElo ? parseInt(minElo) : undefined,
        max_elo: maxElo ? parseInt(maxElo) : undefined,
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: undefined,
      }
    );

  const players = data?.pages.flatMap((p) => p.players) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Find Players</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Skill Level</label>
            <select
              value={skillLevel ?? ""}
              onChange={(e) =>
                setSkillLevel((e.target.value as SkillLevel) || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All levels</option>
              {Object.entries(SKILL_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Any city"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Min ELO</label>
            <input
              type="number"
              value={minElo}
              onChange={(e) => setMinElo(e.target.value)}
              placeholder="800"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max ELO</label>
            <input
              type="number"
              value={maxElo}
              onChange={(e) => setMaxElo(e.target.value)}
              placeholder="3000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Players grid */}
      {players.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-lg overflow-hidden">
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={player.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      player.full_name[0]
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{player.full_name}</p>
                    <p className="text-sm text-gray-500">@{player.username}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
                    {SKILL_LABELS[player.skill_level as SkillLevel]}
                  </span>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {player.elo_rating}
                      {player.elo_provisional && (
                        <span className="text-xs text-gray-400 font-normal ml-1">*</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">ELO</p>
                  </div>
                </div>

                {(player as { home_club?: string | null }).home_club ? (
                  <p className="mt-2 text-xs text-gray-400">
                    🎾 {(player as { home_club?: string | null }).home_club}
                  </p>
                ) : player.city ? (
                  <p className="mt-2 text-xs text-gray-400">
                    📍 {player.city}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>

          {hasNextPage && (
            <div className="text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetching}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isFetching ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          {isFetching ? (
            <p className="text-gray-500">Searching for players...</p>
          ) : (
            <>
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-medium text-gray-900">No players found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
